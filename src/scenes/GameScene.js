// ============================================================
// scenes/GameScene.js
// Cena principal de gameplay. Orquestra todos os sistemas.
// ============================================================
import Phaser from 'phaser';
import { Player }    from '../entities/Player.js';
import { Enemy }     from '../entities/Enemy.js';
import { Boss }      from '../entities/Boss.js';

import { StatSystem }     from '../progression/StatSystem.js';
import { XPSystem }       from '../progression/XPSystem.js';
import { LevelSystem }    from '../progression/LevelSystem.js';
import { AbyssChallengeSystem } from '../progression/AbyssChallengeSystem.js';

import { WeaponSystem }   from '../equipment/WeaponSystem.js';
import { ArmorSystem }    from '../equipment/ArmorSystem.js';
import { InventorySystem } from '../equipment/InventorySystem.js';
import { LootSystem }     from '../equipment/LootSystem.js';

import { CombatSystem }   from '../combat/CombatSystem.js';
import { DamageSystem }   from '../combat/DamageSystem.js';

import { SeedSystem }     from '../world/SeedSystem.js';
import { WorldGenerator } from '../world/WorldGenerator.js';
import { TILE_TYPES }     from '../world/RoomGenerator.js';
import { EnvironmentalHazardManager } from '../world/EnvironmentalHazards.js';

import { HUD }            from '../ui/HUD.js';
import { BossBar }        from '../ui/BossBar.js';
import { InventoryUI }    from '../ui/InventoryUI.js';

import { BALANCE }        from '../data/balance.js';
import { WEAPONS, WEAPON_FAMILIES } from '../data/weapons.js';
import { STARTING_ARMOR, createArmorPiece } from '../data/armor.js';
import { ENEMY_TEMPLATES, BOSS_TEMPLATES } from '../data/enemies.js';
import { BIOMES }         from '../data/biomes.js';
import { ITEMS }          from '../data/items.js';

const TILE = BALANCE.WORLD.TILE_SIZE;

export class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  init(data) {
    this.seed       = data.seed ?? 'ABISMO';
    this._loadSave  = data.loadSave ?? false;
    this._saveSlot  = data.slot ?? 0;
    this._saveSystem = data.saveSystem;
  }

  // ──────────────────────────────────────────────────────────
  create() {
    this.cameras.main.setBackgroundColor(0x000000);

    // ── Sistemas de progressão ────────────────────────────────
    this.statSystem      = new StatSystem();
    this.xpSystem        = new XPSystem();
    this.levelSystem     = new LevelSystem(this.xpSystem, this.statSystem);
    this.abyssChallenge  = new AbyssChallengeSystem();

    // ── Sistemas de equipamento ───────────────────────────────
    this.weaponSystem    = new WeaponSystem();
    this.armorSystem     = new ArmorSystem();
    this.inventorySystem = new InventorySystem();
    this.lootSystem      = new LootSystem();

    // ── Estado do jogo ────────────────────────────────────────
    this.healCharges     = BALANCE.PLAYER.HEAL_CHARGES;
    this.maxHealCharges  = BALANCE.PLAYER.HEAL_CHARGES;
    this.healAmount      = BALANCE.PLAYER.HEAL_AMOUNT;
    this.defeatedBosses  = new Set();
    this.abyssDepth      = 0;
    this.abyssUniqueObtained = new Set();
    this.openedChests = new Set();
    this.discoveredSanctuaries = [];
    this.currentAreaIndex  = 0;
    this.currentRoomIndex  = 0;
    this.npcState          = {};
    this.equippedRelics    = [];

    // ── Carrega save ou inicia novo ───────────────────────────
    if (this._loadSave && this._saveSystem) {
      this._saveSystem.load(this._saveSlot).then(data => {
        if (data) this._saveSystem.applySaveData(data, this);
        else this._initDefault(); // Slot inexistente não pode começar sem equipamento.
        this._initWorld();
      }).catch(error => {
        console.error('Falha ao carregar save:', error);
        this._initDefault();
        this._initWorld();
      });
    } else {
      this._initDefault();
      this._initWorld();
    }
  }

  _initDefault() {
    // Equipamento inicial
    this.weaponSystem.equip(WEAPONS.iron_sword);
    Object.values(STARTING_ARMOR).forEach(piece => this.armorSystem.equip(piece));
    this.statSystem.freePoints = 5;

    // Relíquias iniciais para Novo Jogo
    this.equippedRelics = ['eye_of_abyss', 'iron_will'];
    if (ITEMS.eye_of_abyss) this.inventorySystem.add(ITEMS.eye_of_abyss, 'relics');
    if (ITEMS.iron_will) this.inventorySystem.add(ITEMS.iron_will, 'relics');

    // Adiciona armas de diferentes famílias ao inventário para variedade
    this.inventorySystem.add(WEAPONS.flame_sword, 'weapons');
    this.inventorySystem.add(WEAPONS.rusty_dagger, 'weapons');
    this.inventorySystem.add(WEAPONS.war_axe, 'weapons');
    this.inventorySystem.add(WEAPONS.silver_spear, 'weapons');
  }

  _initWorld() {
    // ── Mundo procedural ─────────────────────────────────────
    this.seedSystem = new SeedSystem(this.seed);
    this.worldGen   = new WorldGenerator(this.seedSystem);
    // Drops usam uma stream derivada da seed, nunca Date.now().
    this.lootSystem = new LootSystem(this.seedSystem.areaRNG(this.currentAreaIndex).fork(0x4c4f4f54));
    this.areaData   = this.worldGen.generateArea(this.currentAreaIndex);

    this._activeDrops       = [];
    this._activeChests      = [];
    this._abyssPortal       = null;
    this._isTransitioning   = false;
    this._interactionPrompt = null;

    this._buildCurrentRoom();
    this._spawnPlayer();
    this._setupCamera();
    this._setupKeys();
    this._setupPhysics();
    this._setupEvents();

    // ── UI ────────────────────────────────────────────────────
    this.hud          = new HUD(this);
    this.bossBar      = new BossBar(this);
    this.inventoryUI  = new InventoryUI(this);

    // ── Fade in ───────────────────────────────────────────────
    this.cameras.main.fadeIn(800, 0, 0, 0);

    // Show biome name
    if (this.hud && this.areaData && this.areaData.biome) {
      this.time.delayedCall(1000, () => {
        this.hud.showNotification(this.areaData.biome.name, '#ffffff', 4000);
      });
    }
  }

  // ──────────────────────────────────────────────────────────
  // GERAÇÃO DO MUNDO
  // ──────────────────────────────────────────────────────────

  _buildCurrentRoom() {
    const room = this.areaData.rooms[this.currentRoomIndex];
    if (!room) return;
    this._currentRoom = room;

    // Grupos de física
    this.wallsGroup    = this.physics.add.staticGroup();
    this.doorsGroup    = this.physics.add.staticGroup();
    this.hazardsGroup  = this.physics.add.staticGroup();
    this.enemiesGroup  = this.physics.add.group();
    this._activeEnemies = [];
    this._activeDrops   = [];
    this._activeChests  = [];
    this._activeProjectiles = [];
    this._activeBoss    = null;
    this._deathOrb      = null;
    this._abyssPortal   = null;
    this._sanctuaryObj  = null;

    // ── Sistema de perigos ambientais ─────────────────────────
    this._hazardManager = new EnvironmentalHazardManager(this);

    this._buildTilemap(room);

    // Popula perigos ambientais reais após o tilemap estar montado
    // Passa o total de salas para IlusioDoor calcular destinos válidos
    room._totalRooms = this.areaData.rooms.length;
    const roomRNG = this.areaData.rooms[this.currentRoomIndex].rng ?? this.seedSystem.roomRNG(this.currentAreaIndex, this.currentRoomIndex);
    if (room.type !== 'SANCTUARY' && room.type !== 'ENTRANCE') {
      this._hazardManager.populate(this.areaData.biome.id, room, roomRNG.fork(42));
    }

    this._spawnRoomContent(room);

    // Partículas de ambiente
    this._buildAmbientParticles();

    // Recria a orbe de morte se esta sala for a sala onde o player morreu
    this._checkSpawnDeathOrbForRoom();
  }

  _checkSpawnDeathOrbForRoom() {
    // Remove orbe visual anterior se houver para evitar duplicações
    if (this._deathOrb) {
      this._deathOrb.getData('label')?.destroy();
      this._deathOrb.destroy();
      this._deathOrb = null;
    }

    if (
      this.xpSystem.hasLostXP &&
      this.xpSystem.deathAreaIndex === this.currentAreaIndex &&
      this.xpSystem.deathRoomIndex === this.currentRoomIndex &&
      this.xpSystem.deathPosition
    ) {
      this._spawnDeathOrb(this.xpSystem.deathPosition.x, this.xpSystem.deathPosition.y);
    }
  }

  _buildTilemap(room) {
    const { grid, tileW, tileH } = room.data;
    const biome = this.areaData.biome;
    const MONO = '"Courier New", "Consolas", monospace';

    // Mapa de caracteres de hazard por bioma
    const HAZARD_CHARS = {
      'ARREDORES_CINZENTOS': '~', 'AQUEDUTO_SUBMERSO': '≈',
      'CARCERE_DE_SANGUE': '§', 'FORJA_MACULADA': '▲',
      'JARDIM_PUTRIDO': '♣', 'CORACAO_DO_ABISMO': '◊',
      'CATACUMBAS_ECOANTES': '░', 'ABISMO_CRISTALINO': '◇',
      'CIDADE_SUBTERRANEA': '¤', 'BIBLIOTECA_DO_OCULTO': '∞',
    };
    const HAZARD_COLORS = {
      'ARREDORES_CINZENTOS': '#656973', 'AQUEDUTO_SUBMERSO': '#376B70',
      'CARCERE_DE_SANGUE': '#9C4C52', 'FORJA_MACULADA': '#AF5D3B',
      'JARDIM_PUTRIDO': '#789655', 'CORACAO_DO_ABISMO': '#6555A4',
      'CATACUMBAS_ECOANTES': '#5B5061', 'ABISMO_CRISTALINO': '#6EADB7',
      'CIDADE_SUBTERRANEA': '#76889C', 'BIBLIOTECA_DO_OCULTO': '#796395',
    };

    // Floor chars com variação sutil
    const floorChars = ['.', '.', '.', ',', '.', '`', '.'];
    let charIdx = 0;

    // Converte cor hex para string CSS
    const hexToCSS = (hex) => '#' + hex.toString(16).padStart(6, '0');
    const floorColor = hexToCSS(biome.palette.floor);
    const wallColor  = hexToCSS(biome.palette.wall);
    const accentColor = hexToCSS(biome.palette.accent);

    for (let y = 0; y < tileH; y++) {
      for (let x = 0; x < tileW; x++) {
        const tile = grid[y][x];
        const wx   = x * TILE;
        const wy   = y * TILE;

        if (tile === TILE_TYPES.VOID) continue;

        // Variação determinística do caractere de chão
        charIdx = (x * 7 + y * 13) % floorChars.length;

        if (tile === TILE_TYPES.FLOOR) {
          const isDebris = (x * 7 + y * 13) % 5 === 0;
          const floorKey = isDebris && this.textures.exists(`tile_floor_debris_${biome.id}`)
            ? `tile_floor_debris_${biome.id}`
            : (this.textures.exists(`tile_floor_${biome.id}`) ? `tile_floor_${biome.id}` : 'tile_floor');
          this.add.image(wx + TILE / 2, wy + TILE / 2, floorKey).setDepth(0);

        } else if (tile === TILE_TYPES.DOOR_N || tile === TILE_TYPES.DOOR_S ||
                   tile === TILE_TYPES.DOOR_E || tile === TILE_TYPES.DOOR_W) {
          // Chão embaixo da porta
          const floorKey = this.textures.exists(`tile_floor_${biome.id}`) ? `tile_floor_${biome.id}` : 'tile_floor';
          this.add.image(wx + TILE / 2, wy + TILE / 2, floorKey).setDepth(0);

          // Porta monumental detalhada com borda e ferragens
          const doorSprite = this.add.image(wx + TILE / 2, wy + TILE / 2, 'tile_door').setDepth(2);

          let dir = 'E';
          if (tile === TILE_TYPES.DOOR_N) dir = 'N';
          else if (tile === TILE_TYPES.DOOR_S) dir = 'S';
          else if (tile === TILE_TYPES.DOOR_W) dir = 'W';

          if (dir === 'N' || dir === 'S') {
            doorSprite.setAngle(90);
          }

          const doorBody = this.doorsGroup.create(wx + TILE / 2, wy + TILE / 2, 'tile_door');
          doorBody.setVisible(false).refreshBody();
          doorBody.setData('direction', dir);

        } else if (tile === TILE_TYPES.WALL) {
          const isCracked = (x * 5 + y * 11) % 4 === 0;
          const wallKey = isCracked && this.textures.exists(`tile_wall_cracked_${biome.id}`)
            ? `tile_wall_cracked_${biome.id}`
            : (this.textures.exists(`tile_wall_${biome.id}`) ? `tile_wall_${biome.id}` : 'tile_wall');
          this.add.image(wx + TILE / 2, wy + TILE / 2, wallKey).setDepth(1);

          const body = this.wallsGroup.create(wx + TILE / 2, wy + TILE / 2, 'tile_wall');
          body.setVisible(false).refreshBody();

        } else if (tile === TILE_TYPES.OBSTACLE) {
          // Chão embaixo
          const floorKey = this.textures.exists(`tile_floor_${biome.id}`) ? `tile_floor_${biome.id}` : 'tile_floor';
          this.add.image(wx + TILE / 2, wy + TILE / 2, floorKey).setDepth(0);
          // Obstáculo: Pilar entalhado
          this.add.image(wx + TILE / 2, wy + TILE / 2, 'tile_obstacle').setDepth(1);

          const body = this.wallsGroup.create(wx + TILE / 2, wy + TILE / 2, 'tile_obstacle');
          body.setVisible(false).refreshBody();

        } else if (tile === TILE_TYPES.SANCTUARY) {
          const floorKey = this.textures.exists(`tile_floor_${biome.id}`) ? `tile_floor_${biome.id}` : 'tile_floor';
          this.add.image(wx + TILE / 2, wy + TILE / 2, floorKey).setDepth(0);
          this._spawnSanctuary(wx + TILE / 2, wy + TILE / 2);

        } else if (tile === TILE_TYPES.HAZARD) {
          // Chão embaixo ou líquido volumétrico tridimensional
          if ((biome.id === 'AQUEDUTO_SUBMERSO' || biome.id === 'ARREDORES_CINZENTOS') && this.textures.exists('water_frame_0')) {
            const waterTile = this.add.sprite(wx + TILE / 2, wy + TILE / 2, 'water_frame_0').setDepth(1);
            if (this.anims?.exists('water_flow')) {
              waterTile.play('water_flow');
            }
          } else if (biome.id === 'CARCERE_DE_SANGUE' && this.textures.exists('liquid_blood')) {
            this.add.image(wx + TILE / 2, wy + TILE / 2, 'liquid_blood').setDepth(1);
          } else if (biome.id === 'FORJA_MACULADA' && this.textures.exists('liquid_magma')) {
            this.add.image(wx + TILE / 2, wy + TILE / 2, 'liquid_magma').setDepth(1);
          } else {
            const floorKey = this.textures.exists(`tile_floor_${biome.id}`) ? `tile_floor_${biome.id}` : 'tile_floor';
            this.add.image(wx + TILE / 2, wy + TILE / 2, floorKey).setDepth(0);
            const hazChar = HAZARD_CHARS[biome.id] ?? '^';
            const hazColor = HAZARD_COLORS[biome.id] ?? accentColor;
            this.add.text(wx + TILE / 2, wy + TILE / 2, hazChar, {
              fontFamily: MONO, fontSize: '20px', color: hazColor,
            }).setOrigin(0.5).setDepth(1).setAlpha(0.85);
          }

          const body = this.hazardsGroup.create(wx + TILE / 2, wy + TILE / 2, 'tile_floor');
          body.setVisible(false).refreshBody();
        }
      }
    }

    // Bounds do mundo
    const roomW = tileW * TILE;
    const roomH = tileH * TILE;
    this.physics.world.setBounds(0, 0, roomW, roomH);
  }

  _spawnRoomContent(room) {
    const biome = this.areaData.biome;

    if (room.type === 'BOSS' && !this.defeatedBosses.has(`boss_${this.currentAreaIndex}`)) {
      this._spawnBoss(room);
    } else if (['NORMAL', 'ELITE', 'ENTRANCE'].includes(room.type) && !room.cleared) {
      this._spawnEnemies(room);
    } else if (room.type === 'CHEST' &&
               !this.openedChests.has(`${this.currentAreaIndex}:${room.id}`)) {
      this._spawnChest(room);
    }
  }

  _spawnEnemies(room) {
    const biome  = this.areaData.biome;
    const rng    = room.rng.fork(7);
    const isElite = room.type === 'ELITE';
    const count   = room.type === 'ENTRANCE' ? 2 : (isElite ? 1 : rng.int(2, 4));

    const pool = isElite ? biome.elitePool : biome.enemyPool;
    const tileW = room.data.tileW;
    const tileH = room.data.tileH;
    const grid = room.data.grid;
    const centerX = Math.floor(tileW / 2) * TILE;
    const centerY = Math.floor(tileH / 2) * TILE;
    // Proteger os pontos de entrada nas quatro direções (a sala é montada
    // antes de posicionar o jogador durante uma transição).
    const entrances = [
      [6 * TILE, centerY], [2.5 * TILE, centerY],
      [(tileW - 3.5) * TILE, centerY],
      [centerX, 2.5 * TILE], [centerX, (tileH - 3.5) * TILE],
    ];
    const occupied = [];

    for (let i = 0; i < count; i++) {
      const templateId = rng.pick(pool);
      const baseTemplate = ENEMY_TEMPLATES[templateId];
      if (!baseTemplate) {
        console.warn(`Template de inimigo ausente: ${templateId}`);
        continue;
      }
      const template = { ...baseTemplate };

      // Scalonamento por profundidade do Abismo
      if (this.abyssDepth > 0) {
        const mult = 1 + this.abyssDepth * 0.08;
        template.level   = Math.round(template.level   * mult);
        template.hp      = Math.round(template.hp      * mult);
        template.attack  = Math.round(template.attack  * mult);
        template.defense = Math.round(template.defense * mult);
        template.xp      = Math.round(template.xp      * mult);
      }

      // Anomalia rara
      if (rng.next() < (biome.anomalyChance ?? 0.05)) {
        template.level   = Math.round(template.level   * rng.next() * 3 + 1.5);
        template.hp      = Math.round(template.hp      * 2.5);
        template.attack  = Math.round(template.attack  * 2);
        template.xp      = Math.round(template.xp      * 5);
        template.name    = '[ANOMALIA] ' + template.name;
        template.color   = 0x8800ff;
      }

      // Relíquia Olho do Abismo: detecta criaturas muito acima do nível do jogador
      if (this.player?.relics?.includes('eye_of_abyss') && (template.level - this.levelSystem.level >= 50)) {
        template.color = 0xaa22ff;
        template.name = `[PERIGO +${template.level - this.levelSystem.level}] ${template.name}`;
      }

      // Spawn determinístico: somente chão livre, longe das entradas,
      // evitando paredes, corpo do jogador e outros inimigos.
      let position = null;
      for (let attempt = 0; attempt < 160; attempt++) {
        const tx = rng.int(4, tileW - 5);
        const ty = rng.int(3, tileH - 4);
        if (grid?.[ty]?.[tx] !== TILE_TYPES.FLOOR) continue;
        const ex = (tx + 0.5) * TILE;
        const ey = (ty + 0.5) * TILE;
        if (entrances.some(([px, py]) => Math.hypot(ex - px, ey - py) < 140)) continue;
        if (this.player && Math.hypot(ex - this.player.x, ey - this.player.y) < 140) continue;
        if (occupied.some(([px, py]) => Math.hypot(ex - px, ey - py) < 72)) continue;
        position = [ex, ey];
        break;
      }
      if (!position) {
        console.warn(`Sem tile livre seguro para inimigo na sala ${room.id}`);
        continue;
      }
      const [ex, ey] = position;
      occupied.push(position);
      const enemy = new Enemy(this, ex, ey, template);
      this._activeEnemies.push(enemy);
      this.enemiesGroup.add(enemy);
    }
  }

  _spawnBoss(room) {
    const tileW = room.data.tileW;
    const tileH = room.data.tileH;
    const bx = Math.floor(tileW / 2) * TILE;
    const by = Math.floor(tileH / 2) * TILE;

    const bossId = this.areaData.biome.bossPool?.[0] ?? 'senhor_das_cinzas';
    const baseTemplate = BOSS_TEMPLATES[bossId];
    if (!baseTemplate) {
      console.error(`Template de chefe ausente: ${bossId}`);
      return;
    }
    const template = { ...baseTemplate };

    this._activeBoss = new Boss(this, bx, by, template);
    this.enemiesGroup.add(this._activeBoss);
    this._activeEnemies.push(this._activeBoss);

    this.events.once('boss:entered', () => {
      this.bossBar.show(this._activeBoss);
      this.cameras.main.shake(300, 0.01);
      this.hud.showNotification(`⚠ ${template.name}`, '#ff4400', 3000);
    });
  }

  _spawnSanctuary(x, y) {
    // Santuário: altar esculpido em ASCII de alta densidade
    this._sanctuaryObj = this.add.image(x, y, 'tile_sanctuary').setDepth(5).setScale(1.1);
    this._sanctuaryObj.setData('wx', x).setData('wy', y);

    // Chama pulsante do braseiro
    this.tweens.add({
      targets: this._sanctuaryObj,
      alpha: { from: 0.8, to: 1 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Aura celestial dourada
    const aura = this.add.circle(x, y, 24, 0xffcc33, 0.15).setDepth(4);
    this.tweens.add({
      targets: aura,
      scaleX: 1.35,
      scaleY: 1.35,
      alpha: { from: 0.08, to: 0.22 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
    });

    if (!this.discoveredSanctuaries.includes(this.currentRoomIndex)) {
      this.discoveredSanctuaries.push(this.currentRoomIndex);
    }
  }

  _spawnChest(room) {
    const cx = Math.floor(room.data.tileW / 2) * TILE;
    const cy = Math.floor(room.data.tileH / 2) * TILE;
    // Baú detalhado em ASCII com ferragens reforçadas
    const chest = this.add.image(cx, cy, 'chest').setDepth(5).setInteractive();
    chest.setData('opened', false);

    const chestEntry = { obj: chest, x: cx, y: cy, opened: false };
    this._activeChests.push(chestEntry);

    chest.on('pointerup', () => {
      if (chestEntry.opened) return;
      chestEntry.opened = true;
      chest.setData('opened', true);
      // Alterna para o baú aberto reluzindo ouro e joias em ASCII
      if (this.textures.exists('chest_open')) {
        chest.setTexture('chest_open');
      }
      this._openChest(cx, cy);
    });
  }

  _spawnPlayer() {
    const startRoom = this.areaData.rooms[this.currentRoomIndex];
    const tileW = startRoom?.data?.tileW ?? 40;
    const tileH = startRoom?.data?.tileH ?? 22;

    const px = Math.floor(tileW * 0.15) * TILE;
    const py = Math.floor(tileH / 2)    * TILE;

    this.player = new Player(this, px, py, {
      stat: this.statSystem,
      weapon: this.weaponSystem,
      armor: this.armorSystem,
      xp: this.xpSystem,
      level: this.levelSystem,
      inventory: this.inventorySystem,
    });

    this.player.relics = [...(this.equippedRelics ?? [])];
    this.player.checkWeaponLevelPenalty();

    // Sincroniza HP e charges do save
    this.player.hp          = this.player.maxHP;
    this.player.healCharges    = this.healCharges;
    this.player.maxHealCharges = this.maxHealCharges;
    this.player.healAmount     = this.healAmount;
  }

  _buildAmbientParticles() {
    const MONO = '"Courier New", "Consolas", monospace';
    const biome = this.areaData.biome;
    const roomW = this._currentRoom.data.tileW * TILE;
    const roomH = this._currentRoom.data.tileH * TILE;
    const pType = biome.ambientParticles || 'ASH';
    const accentCSS = '#' + (biome.palette.accent ?? 0x554433).toString(16).padStart(6, '0');

    // Caracteres por tipo de partícula
    const PARTICLE_CHARS = {
      ASH: ['·', '°', '`', "'"], LEAVES: ['♠', '♣', ',', '.'],
      BUBBLES: ['°', 'o', 'O', '·'], EMBERS: ['*', '·', '°', '^'],
      SPARKS: ['*', '+', '·', '×'], MIST: ['░', '▒', '·', '~'],
      HOLY: ['✦', '·', '*', '+'], VOID: ['·', '▪', '▫', '°'],
    };
    const chars = PARTICLE_CHARS[pType] ?? ['·'];

    const countMap = { ASH: 20, MIST: 30, BUBBLES: 25, EMBERS: 18, LEAVES: 12, SPARKS: 15, HOLY: 18, VOID: 28 };
    const pCount = countMap[pType] || 20;

    for (let i = 0; i < pCount; i++) {
      const char = chars[i % chars.length];
      const p = this.add.text(
        Phaser.Math.Between(0, roomW),
        Phaser.Math.Between(0, roomH),
        char,
        {
          fontFamily: MONO,
          fontSize: `${Phaser.Math.Between(8, 14)}px`,
          color: accentCSS,
        }
      ).setDepth(1).setAlpha(Phaser.Math.FloatBetween(0.1, 0.3));

      let tweenConfig = { targets: p, repeat: -1, delay: Phaser.Math.Between(0, 3000) };

      if (pType === 'ASH' || pType === 'LEAVES') {
        tweenConfig.y = `+=${Phaser.Math.Between(80, 200)}`;
        tweenConfig.x = `+=${Phaser.Math.Between(20, 60)}`;
        tweenConfig.alpha = { from: 0.25, to: 0 };
        tweenConfig.duration = Phaser.Math.Between(3000, 7000);
        tweenConfig.onRepeat = () => p.setPosition(Phaser.Math.Between(0, roomW), Phaser.Math.Between(-50, roomH * 0.5));
      } else if (pType === 'BUBBLES' || pType === 'EMBERS' || pType === 'SPARKS') {
        tweenConfig.y = `-=${Phaser.Math.Between(100, 250)}`;
        tweenConfig.x = `+=${Phaser.Math.Between(-30, 30)}`;
        tweenConfig.alpha = { from: 0.35, to: 0 };
        tweenConfig.duration = Phaser.Math.Between(2000, 5000);
        tweenConfig.onRepeat = () => p.setPosition(Phaser.Math.Between(0, roomW), Phaser.Math.Between(roomH * 0.5, roomH + 50));
      } else if (pType === 'MIST' || pType === 'VOID' || pType === 'HOLY') {
        tweenConfig.y = `+=${Phaser.Math.Between(-30, 30)}`;
        tweenConfig.x = `+=${Phaser.Math.Between(-30, 30)}`;
        tweenConfig.alpha = { start: 0, from: 0.15, to: 0.4, yoyo: true };
        tweenConfig.duration = Phaser.Math.Between(4000, 8000);
      }

      this.tweens.add(tweenConfig);
    }
  }

  // ──────────────────────────────────────────────────────────
  // CÂMERA E INPUT
  // ──────────────────────────────────────────────────────────

  _setupCamera() {
    const roomW = this._currentRoom.data.tileW * TILE;
    const roomH = this._currentRoom.data.tileH * TILE;

    this.cameras.main.setBounds(0, 0, roomW, roomH);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setZoom(1.5);
  }

  _setupKeys() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = {
      left:        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right:       this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      up:          this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down:        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      run:         this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT),
      attack:      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z),
      heavyAttack: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X),
      dodge:       this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C),
      parry:       this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.V),
      block:       this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F),
      skill:       this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
      heal:        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
      inventory:   this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TAB),
      interact:    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.G),
    };

    this.input.keyboard.on('keydown-TAB', (e) => {
      e.preventDefault();
      this._toggleInventory();
    });
  }

  _setupPhysics() {
    if (!this._roomColliders) this._roomColliders = [];
    this._roomColliders.forEach(c => c.destroy());
    this._roomColliders = [];
    this.playerHazardTouch = false;

    // Player vs Paredes
    this._roomColliders.push(this.physics.add.collider(this.player, this.wallsGroup));
    // Inimigos vs Paredes
    this._roomColliders.push(this.physics.add.collider(this.enemiesGroup, this.wallsGroup));
    // Inimigos vs Inimigos
    this._roomColliders.push(this.physics.add.collider(this.enemiesGroup, this.enemiesGroup));
    // Player vs Inimigos (impede sobreposição física sem prender o jogador durante esquiva / i-frames)
    this._roomColliders.push(
      this.physics.add.collider(
        this.player,
        this.enemiesGroup,
        null,
        (player, enemy) => {
          if (!player || !enemy || player.isDead || enemy.isDead) return false;
          // Permite atravessar durante esquiva e i-frames para não prender o jogador
          if (player.isInvincible || player.state === 'DODGE') return false;
          return true;
        },
        this
      )
    );
    // Player vs Portas (transição entre salas)
    if (this.doorsGroup) {
      this._roomColliders.push(
        this.physics.add.overlap(this.player, this.doorsGroup, (player, door) => {
          this._onPlayerTouchDoor(door.getData('direction'));
        })
      );
    }
    // Hazards
    if (this.hazardsGroup) {
      this._roomColliders.push(
        this.physics.add.overlap(this.player, this.hazardsGroup, (player, hazard) => {
          this.playerHazardTouch = true;
          this._onPlayerTouchHazard(hazard);
        })
      );
      this._roomColliders.push(
        this.physics.add.overlap(this.enemiesGroup, this.hazardsGroup, (enemy, hazard) => {
          this._onEnemyTouchHazard(enemy, hazard);
        })
      );
    }
  }

  _onPlayerTouchHazard(hazard) {
    // A lógica principal de perigos agora é gerenciada por EnvironmentalHazardManager.
    // Este método serve como fallback para o tile HAZARD estático.
    if (this.player.isDead) return;
    const biome = this.areaData.biome.id;

    // Efeitos via tile HAZARD para biomas sem objeto específico:
    if (biome === 'ARREDORES_CINZENTOS') {
      this.player.activeHazardEffect = 'ASH';
    } else if (biome === 'CORACAO_DO_ABISMO') {
      this.player.activeHazardEffect = 'GRAVITY';
    }
  }

  _onEnemyTouchHazard(enemy, hazard) {
    // Fallback para tile HAZARD estático — a lógica principal está no _hazardManager.
    if (enemy.isDead) return;
  }


  _onPlayerTouchDoor(dir) {
    if (this._isTransitioning || !this.player || this.player.isDead) return;

    const connections = this.areaData.connections.get(this.currentRoomIndex);
    const targetRoomIndex = connections?.[dir];

    if (targetRoomIndex !== null && targetRoomIndex !== undefined) {
      this._transitionToRoom(targetRoomIndex, dir);
    }
  }

  _transitionToRoom(targetIndex, fromDirection) {
    this._isTransitioning = true;
    this.player.body.setVelocity(0, 0);

    // Illusion logic for BIBLIOTECA_DO_OCULTO
    if (this.areaData.biome.id === 'BIBLIOTECA_DO_OCULTO' && this._currentRoom) {
      const rng = this._currentRoom.rng.fork(8);
      if (rng.next() < 0.25) { // 25% chance of illusory door redirecting to a random visited room
         targetIndex = rng.pick(Array.from(this.areaData.rooms.keys()));
         this.hud.showNotification('Ilusão Ativada', '#796395', 2000);
      }
    }

    this.cameras.main.fadeOut(180, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this._clearRoom();
      this.currentRoomIndex = targetIndex;
      this._buildCurrentRoom();

      this._positionPlayerAtEntrance(fromDirection);
      this._setupPhysics();
      this._setupCamera();

      this.cameras.main.fadeIn(180, 0, 0, 0);

      // Notificação de sala especial
      const room = this._currentRoom;
      if (room.type === 'SANCTUARY') {
        this.hud.showNotification('Santuário das Cinzas', '#88aaff', 2000);
      } else if (room.type === 'BOSS') {
        this.hud.showNotification('⚠ Câmara do Chefe', '#ff4422', 2500);
      } else if (room.type === 'ELITE') {
        this.hud.showNotification('⚠ Inimigo Elite', '#ffaa00', 2000);
      } else if (room.type === 'CHEST') {
        this.hud.showNotification('Câmara do Tesouro', '#88ddff', 2000);
      }

      this.time.delayedCall(250, () => {
        this._isTransitioning = false;
      });
    });
  }

  _positionPlayerAtEntrance(fromDirection) {
    const tileW = this._currentRoom.data.tileW;
    const tileH = this._currentRoom.data.tileH;
    let px = Math.floor(tileW / 2) * TILE;
    let py = Math.floor(tileH / 2) * TILE;

    if (fromDirection === 'E') {
      px = 2.5 * TILE;
      py = Math.floor(tileH / 2) * TILE;
    } else if (fromDirection === 'W') {
      px = (tileW - 3.5) * TILE;
      py = Math.floor(tileH / 2) * TILE;
    } else if (fromDirection === 'N') {
      px = Math.floor(tileW / 2) * TILE;
      py = (tileH - 3.5) * TILE;
    } else if (fromDirection === 'S') {
      px = Math.floor(tileW / 2) * TILE;
      py = 2.5 * TILE;
    }

    this.player.setPosition(px, py);
    this.player.body.setVelocity(0, 0);
  }

  // ──────────────────────────────────────────────────────────
  // EVENTOS DE COMBATE
  // ──────────────────────────────────────────────────────────

  _setupEvents() {
    // ── Ataque do player ─────────────────────────────────────
    this.events.on('player:attack', ({ x, y, radius, attackData, type }) => {
      this._processPlayerAttackZone(x, y, radius, attackData, type);
    });

    // ── Habilidade do player ─────────────────────────────────
    this.events.on('player:skill', ({ player, skillData }) => {
      this._processPlayerSkill(player, skillData);
    });

    // ── Ataque do inimigo ────────────────────────────────────
    this.events.on('enemy:attack', ({ enemy, player, damage, equilDamage,
                                       isHeavy, canBeParried, element, elementBuildup }) => {
      this._processEnemyAttack(enemy, player, damage, equilDamage,
                                isHeavy, canBeParried, element, elementBuildup);
    });

    // ── Morte do inimigo ──────────────────────────────────────
    this.events.on('enemy:died', ({ enemy }) => this._onEnemyDied(enemy));

    // ── Morte do boss ─────────────────────────────────────────
    this.events.on('boss:died', ({ boss }) => this._onBossDied(boss));

    // ── Fase 2 do boss ────────────────────────────────────────
    this.events.on('boss:phase2', () => {
      this.bossBar.setPhase(2);
      this.hud.showNotification('⚠ FASE II', '#ff4400', 3000);
    });

    // ── Morte do player ───────────────────────────────────────
    this.events.on('player:died', ({ x, y }) => this._onPlayerDied(x, y));

    // ── Cura do player ────────────────────────────────────────
    this.events.on('player:healed', ({ amount }) => {
      this.hud.showDamageNumber(this.player.x, this.player.y, amount, false, true);
    });

    // ── Dano recebido pelo player ─────────────────────────────
    this.events.on('player:damaged', ({ amount }) => {
      this.hud.showDamageNumber(this.player.x, this.player.y, amount);
    });

    // ── Level up ─────────────────────────────────────────────
    this.events.on('player:levelup', ({ level }) => {
      this.hud.showNotification(`▲ NÍVEL ${level}`, '#ffdd00', 3000);
    });

    // ── Dano em inimigo ───────────────────────────────────────
    this.events.on('enemy:damaged', ({ enemy, amount }) => {
      this.hud.showDamageNumber(enemy.x, enemy.y, amount);
    });
  }

  _processPlayerAttackZone(x, y, radius, attackData, type) {
    if (!this._activeEnemies) return;

    for (const enemy of this._activeEnemies) {
      if (enemy.isDead) continue;
      const dist = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
      if (dist > radius + 16) continue;

      // Fixar o desafio no PRIMEIRO confronto, antes do hit: a morte
      // ocorre de forma síncrona dentro de processHit/takeDamage.
      if (!enemy._combatRecord && !enemy.getData?.('combatRecord')) {
        const combatRecord = this.abyssChallenge.recordCombatStart(
          this.levelSystem.level, enemy.level
        );
        enemy._combatRecord = combatRecord;
        enemy.setData?.('combatRecord', combatRecord);
      }

      // Resolve hit via CombatSystem
      const hitResult = CombatSystem.processHit(
        this.player, enemy, type,
        {
          damage:        (attackData.damage ?? this.player.effectiveAttack) +
                         (this.armorSystem.totalStats.attack ?? 0),
          element:       attackData.element,
          elementBuildup: attackData.elementBuildup,
          equilDamage:    attackData.equilDamage,
          heavyEquilDamage: attackData.equilDamage * 2,
        }
      );

      if (!hitResult) continue;

      // Feedback visual
      if (hitResult.isCrit) {
        this.hud.showNotification('CRÍTICO!', '#ffdd00', 800);
        this.cameras.main.shake(80, 0.005);
        if (this.player.relics?.includes('blood_relic')) {
          this.player.staminaSystem.restore(5);
        }
      }
      if (hitResult.causedStagger) {
        this.hud.showNotification('STAGGER', '#4488ff', 600);
      }
      if (hitResult.type === 'PARRY') {
        this.hud.showNotification('PARRY!', '#ffff44', 1000);
        this.cameras.main.shake(100, 0.01);
      }
      if (hitResult.statusActivated) {
        this.hud.showNotification(
          hitResult.statusActivated.element, '#ff8833', 1200
        );
      }

      // Feedback de impacto físico (knockback)
      if (enemy.body && !enemy.isDead) {
        const kAngle = Math.atan2(enemy.y - this.player.y, enemy.x - this.player.x);
        const kForce = type === 'HEAVY' ? 140 : 80;
        enemy.body.setVelocity(Math.cos(kAngle) * kForce, Math.sin(kAngle) * kForce);
        this.time.delayedCall(110, () => {
          if (!enemy.isDead && enemy.body) enemy.body.setVelocity(0, 0);
        });
      }
    }
  }

  _processPlayerSkill(player, skillData) {
    const MONO = '"Courier New", "Consolas", monospace';
    const angle  = player.facingAngle;
    const speed  = 550;
    const stepX  = Math.cos(angle);
    const stepY  = Math.sin(angle);

    // Projétil ASCII: '*' com cor de fogo
    const obj = this.add.text(
      player.x, player.y, '*',
      { fontFamily: MONO, fontSize: '20px', color: '#ff6622', fontStyle: 'bold' }
    ).setOrigin(0.5).setDepth(15);

    this._activeProjectiles.push({
      obj,
      vx: stepX * speed,
      vy: stepY * speed,
      life: 350,
      isEnemy: false,
      skillData,
      hitSet: new Set()
    });
  }

  _processEnemyAttack(enemy, player, damage, equilDamage,
                       isHeavy, canBeParried, element, elementBuildup) {
    if (player.isDead) return;

    const hitResult = CombatSystem.processHit(
      enemy, player, isHeavy ? 'HEAVY' : 'LIGHT',
      { damage, equilDamage, canBeParried, element, elementBuildup }
    );

    if (!hitResult) return;

    if (hitResult.type === 'PARRY') {
      this.hud.showNotification('PARRY PERFEITO!', '#ffff44', 1500);
      this.cameras.main.shake(150, 0.015);
      this.hud.showDamageNumber(enemy.x, enemy.y, 0, false, false);
      if (hitResult.causedStagger) {
        this.hud.showNotification('STAGGER DO INIMIGO!', '#4488ff', 1200);
      }
    } else if (hitResult.type === 'GUARD_BREAK') {
      this.hud.showNotification('GUARDA QUEBRADA!', '#ff4444', 1500);
      this.cameras.main.shake(200, 0.02);
    } else if (hitResult.type === 'BLOCKED') {
      this.cameras.main.shake(50, 0.005);
    } else {
      this.cameras.main.shake(80, 0.008);
      // Leve knockback no player se não bloqueou
      if (this.player.body && !this.player.isDead && this.player.state !== 'DODGE') {
        const kAngle = Math.atan2(this.player.y - enemy.y, this.player.x - enemy.x);
        const kForce = isHeavy ? 120 : 60;
        this.player.body.setVelocity(Math.cos(kAngle) * kForce, Math.sin(kAngle) * kForce);
        this.time.delayedCall(100, () => {
          if (!this.player.isDead && this.player.body && this.player.state !== 'DODGE') {
            this.player.body.setVelocity(0, 0);
          }
        });
      }
    }
  }

  _onEnemyDied(enemy) {
    this._activeEnemies = this._activeEnemies.filter(e => e !== enemy);

    // XP
    const xpGain = enemy.xpYield ?? enemy.xp ?? 30;
    this.xpSystem.addXP(xpGain);
    this._floatXP(enemy.x, enemy.y, xpGain);

    // Loot escalonado por nível e tipo do inimigo (independente do nível do jogador)
    const drops = this.lootSystem.generateDrop(enemy, this.abyssDepth);
    drops.forEach(drop => {
      if (drop.type === 'item') {
        this._spawnDroppedItem(enemy.x, enemy.y, drop);
      }
    });

    // Desafio de Abismo
    const record = enemy._combatRecord ?? enemy.getData?.('combatRecord');
    if (record) {
      const reward = this.abyssChallenge.calculateReward(record, this.abyssUniqueObtained);
      if (reward) {
        this.statSystem.addFreePoints(reward.bonusPoints);
        this.hud.showAbyssReward(reward);
        if (reward.isNew && reward.itemTier === 'UNIQUE') {
          this.abyssUniqueObtained.add(reward.rewardId);
        }
      }
    }

    // Verifica se a sala foi limpa
    if (this._activeEnemies.length === 0 && this._currentRoom.type !== 'BOSS') {
      this._currentRoom.cleared = true;
    }
  }

  _onBossDied(boss) {
    this.defeatedBosses.add(`boss_${this.currentAreaIndex}`);
    this._activeBoss = null;
    this.bossBar.hide();

    const xpGain = boss.xpYield ?? boss.xp ?? 800;
    this.xpSystem.addXP(xpGain);
    this._floatXP(boss.x, boss.y, xpGain);

    // Desafio de Abismo para boss
    const record = boss._combatRecord ?? boss.getData?.('combatRecord');
    if (record) {
      const reward = this.abyssChallenge.calculateReward(record, this.abyssUniqueObtained);
      if (reward) {
        this.statSystem.addFreePoints(reward.bonusPoints);
        this.hud.showAbyssReward(reward);
        if (reward.isNew && reward.itemTier === 'UNIQUE') {
          this.abyssUniqueObtained.add(reward.rewardId);
        }
      }
    }

    this.hud.showNotification('CHEFE DERROTADO!', '#ffdd44', 5000);
    this._currentRoom.cleared = true;
    this._activeEnemies = [];

    // Drop de boss baseado na dificuldade do chefe
    const drops = this.lootSystem.generateDrop(boss, this.abyssDepth);
    drops.forEach(drop => {
      if (drop.type === 'item') this._spawnDroppedItem(boss.x, boss.y, drop);
    });

    // Spawna Portal do Abismo para avanço infinito de profundidade
    this._spawnAbyssPortal(boss.x, boss.y);

    // Autosave
    this._autosave();
  }

  _onPlayerDied(x, y) {
    // Registra a morte com sala e área para permitir recriação fiel da orbe
    this.xpSystem.onDeath({ x, y }, this.currentRoomIndex, this.currentAreaIndex);

    // Orbe de XP no local da morte
    this._spawnDeathOrb(x, y);

    // Autosave imediato do estado de morte para preservar caso recarregue
    this._autosave();

    // Delay e tela de morte
    this.time.delayedCall(1200, () => {
      this._showDeathScreen();
    });
  }

  _spawnDeathOrb(x, y) {
    const MONO = '"Courier New", "Consolas", monospace';
    if (this._deathOrb) {
      this._deathOrb.getData('label')?.destroy();
      this._deathOrb.destroy();
      this._deathOrb = null;
    }

    // Orbe de morte como '$' dourado pulsante
    this._deathOrb = this.add.text(x, y, '$', {
      fontFamily: MONO, fontSize: '28px', color: '#ffcc00', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(15).setInteractive();

    const label = this.add.text(x, y - 22, `XP perdida (${this.xpSystem.lost})`, {
      fontFamily: MONO, fontSize: '11px', color: '#ffcc00',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(16);

    this.tweens.add({
      targets: [this._deathOrb],
      alpha: { from: 0.5, to: 1 },
      duration: 600, yoyo: true, repeat: -1,
    });

    this._deathOrb.setData('label', label);

    this._deathOrb.on('pointerup', () => {
      if (!this._deathOrb) return;
      const recovered = this.xpSystem.recoverLost();
      this._floatXP(x, y, recovered);
      label.destroy();
      this._deathOrb.destroy();
      this._deathOrb = null;
      this.hud.showNotification(`+${recovered} XP Recuperada!`, '#ffdd00', 2500);
      this._autosave();
    });
  }

  _showDeathScreen() {
    const MONO = '"Courier New", "Consolas", monospace';
    const W = this.cameras.main.width;
    const H = this.cameras.main.height;

    this.cameras.main.fadeOut(600, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      // Tela de morte
      const overlay = this.add.rectangle(
        this.cameras.main.scrollX + W / 2,
        this.cameras.main.scrollY + H / 2,
        W, H, 0x000000, 0.95
      ).setDepth(500).setScrollFactor(0);

      // Morte em ASCII art
      const deathArt = [
        '  ╦  ╦╔═╗╔═╗╔═╗  ╔╦╗╔═╗╦═╗╦═╗╔═╗╦ ╦  ',
        '  ╚╗╔╝║ ║║  ║╣   ║║║║ ║╠╦╝╠╦╝║╣ ║ ║  ',
        '   ╚╝ ╚═╝╚═╝╚═╝  ╩ ╩╚═╝╩╚═╩╚═╚═╝╚═╝  ',
      ];
      deathArt.forEach((line, i) => {
        this.add.text(W / 2, H / 2 - 80 + i * 18, line, {
          fontFamily: MONO, fontSize: '14px', color: '#881111',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(501);
      });

      this.add.text(W / 2, H / 2 - 10, `$ XP perdida no local: ${this.xpSystem.lost}`, {
        fontFamily: MONO, fontSize: '14px', color: '#ffcc00',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(501);

      const respawnBtn = this.add.text(W / 2, H / 2 + 40, '> Renascer no Santuário <', {
        fontFamily: MONO, fontSize: '16px', color: '#ffddaa',
        padding: { x: 12, y: 6 },
      }).setOrigin(0.5).setScrollFactor(0).setDepth(501).setInteractive();

      respawnBtn.on('pointerover', () => respawnBtn.setColor('#ffffff'));
      respawnBtn.on('pointerout',  () => respawnBtn.setColor('#ffddaa'));
      respawnBtn.on('pointerup', () => {
        overlay.destroy();
        this._respawnAtSanctuary();
      });

      const menuBtn = this.add.text(W / 2, H / 2 + 80, '> Menu Principal <', {
        fontFamily: MONO, fontSize: '12px', color: '#666666',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(501).setInteractive();
      menuBtn.on('pointerover', () => menuBtn.setColor('#aaaaaa'));
      menuBtn.on('pointerout',  () => menuBtn.setColor('#666666'));

      menuBtn.on('pointerup', () => this.scene.start('MainMenuScene'));
    });
  }

  _respawnAtSanctuary() {
    const sancIndex = this.discoveredSanctuaries.length > 0
      ? this.discoveredSanctuaries[this.discoveredSanctuaries.length - 1]
      : 0;

    this.currentRoomIndex = sancIndex;
    this._clearRoom();
    this._buildCurrentRoom();

    // Restaura salas comuns para que inimigos respawnem (Souls-like)
    this.areaData.rooms.forEach(r => {
      if (r.type !== 'BOSS') r.cleared = false;
    });

    this.player.destroy();
    this._spawnPlayer();

    if (this._sanctuaryObj) {
      this.player.setPosition(this._sanctuaryObj.x + 32, this._sanctuaryObj.y);
    }

    this._setupPhysics();
    this._setupCamera();

    // REGRA SOULS-LIKE CORRIGIDA: NÃO chamar purgeLost() no renascimento!
    // A XP perdida fica esperando na orbe na sala da morte.
    // Ela só será apagada se o jogador morrer uma segunda vez sem recuperá-la.
    this._autosave();

    this.cameras.main.fadeIn(600, 0, 0, 0);
    this.hud.showNotification('Renascido no Santuário', '#ffaa44', 2500);
  }

  _clearRoom() {
    // ── Destrói perigos ambientais antes de qualquer outra coisa ──
    if (this._hazardManager) {
      this._hazardManager.destroy();
      this._hazardManager = null;
    }

    this._activeEnemies.forEach(e => { if (!e.isDead) { try { e.destroy(); } catch(_){} } });
    this._activeEnemies = [];
    this._activeBoss = null;
    this._activeDrops.forEach(d => { if (d.icon) { try { d.icon.destroy(); } catch(_){} } });
    this._activeDrops = [];
    this._activeChests.forEach(c => { if (c.obj) { try { c.obj.destroy(); } catch(_){} } });
    this._activeChests = [];
    if (this._abyssPortal) {
      try { this._abyssPortal.destroy(); } catch(_){}
      this._abyssPortal = null;
    }
    if (this._interactionPrompt) {
      try { this._interactionPrompt.destroy(); } catch(_){}
      this._interactionPrompt = null;
    }
    if (this._deathOrb) {
      this._deathOrb.getData('label')?.destroy();
      try { this._deathOrb.destroy(); } catch(_){}
      this._deathOrb = null;
    }

    if (this._roomColliders) {
      this._roomColliders.forEach(c => { try { c.destroy(); } catch(_){} });
      this._roomColliders = [];
    }

    // Remove GameObjects da cena com segurança
    [...this.children.getAll()].forEach(obj => {
      if (obj !== this.player && obj.depth < 100) {
        try { obj.destroy(); } catch (_) {}
      }
    });
    try { this.wallsGroup?.destroy(true); } catch(_){}
    try { this.doorsGroup?.destroy(true); } catch(_){}
    try { this.enemiesGroup?.destroy(true); } catch(_){}
    try { this.hazardsGroup?.destroy(true); } catch(_){}
  }

  // ──────────────────────────────────────────────────────────
  // SANTUÁRIO E INTERAÇÕES
  // ──────────────────────────────────────────────────────────

  _restAtSanctuary() {
    this.player.restoreAtSanctuary();
    this.player.healCharges    = this.maxHealCharges;
    this.player.maxHealCharges = this.maxHealCharges;

    // Respawna inimigos comuns na área (exceto bosses derrotados)
    this.areaData.rooms.forEach(r => {
      if (r.type !== 'BOSS') r.cleared = false;
    });

    if (this._activeEnemies.length === 0 && this._currentRoom.type !== 'BOSS' && this._currentRoom.type !== 'SANCTUARY') {
      this._spawnEnemies(this._currentRoom);
      this._setupPhysics();
    }

    this.hud.showNotification('Santuário — Descansado', '#88aaff', 2500);
    this._autosave();

    this.cameras.main.flash(300, 100, 150, 255);
  }

  _spawnAbyssPortal(x, y) {
    const MONO = '"Courier New", "Consolas", monospace';
    if (this._abyssPortal) this._abyssPortal.destroy();

    // Portal como 'Ω' roxo pulsante
    this._abyssPortal = this.add.text(x, y, 'Ω', {
      fontFamily: MONO, fontSize: '40px', color: '#aa44ff', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(6);

    this.tweens.add({
      targets: this._abyssPortal,
      alpha: { from: 0.5, to: 1 },
      duration: 1000, yoyo: true, repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Aura
    const aura = this.add.text(x, y, '◊', {
      fontFamily: MONO, fontSize: '56px', color: '#6622aa',
    }).setOrigin(0.5).setDepth(5).setAlpha(0.2);
    this.tweens.add({
      targets: aura,
      alpha: { from: 0.1, to: 0.3 },
      duration: 1500, yoyo: true, repeat: -1,
    });

    this._abyssPortal.setData('wx', x).setData('wy', y);
  }

  _advanceToNextArea() {
    this.abyssDepth += 1;
    this.currentAreaIndex += 1;
    this.currentRoomIndex = 0;

    this.cameras.main.fadeOut(800, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this._clearRoom();
      this.areaData = this.worldGen.generateArea(this.currentAreaIndex);
      this.lootSystem = new LootSystem(this.seedSystem.areaRNG(this.currentAreaIndex).fork(0x4c4f4f54));
      this._buildCurrentRoom();

      const startRoom = this.areaData.rooms[0];
      const px = 3 * TILE;
      const py = Math.floor((startRoom?.data?.tileH ?? 22) / 2) * TILE;
      this.player.setPosition(px, py);
      this.player.restoreAtSanctuary();

      this._setupPhysics();
      this._setupCamera();

      this.cameras.main.setBackgroundColor(this.areaData.biome.palette.bgColor ?? 0x0d0a08);
      this.cameras.main.fadeIn(800, 0, 0, 0);
      this.hud.showNotification(
        `ABISMO PROFUNDIDADE ${this.abyssDepth} — ${this.areaData.biome.name}`,
        '#ffaa00', 4000
      );
      this._autosave();
    });
  }

  // ──────────────────────────────────────────────────────────
  // LOOT E DROPS
  // ──────────────────────────────────────────────────────────

  _spawnDroppedItem(x, y, drop) {
    const MONO = '"Courier New", "Consolas", monospace';
    const ix = x + Phaser.Math.Between(-15, 15);
    const iy = y + Phaser.Math.Between(-15, 15);

    // Drop como caractere: '⚔' para armas, '◆' para armaduras
    const isWeapon = drop.itemId && !drop.itemId.startsWith('worn_') && !drop.itemId.startsWith('armor_');
    const dropChar = isWeapon ? '⚔' : '◆';
    const dropColor = drop.rarity === 'EPIC' ? '#ff8800' :
                      drop.rarity === 'RARE' ? '#4488ff' : '#cccccc';

    const icon = this.add.text(ix, iy, dropChar, {
      fontFamily: MONO, fontSize: '20px', color: dropColor, fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(7).setInteractive();

    this.tweens.add({
      targets: icon,
      y: icon.y - 6,
      duration: 500, yoyo: true, repeat: -1,
      ease: 'Sine.easeInOut',
    });

    const dropEntry = { icon, x: ix, y: iy, drop, collected: false };
    this._activeDrops.push(dropEntry);

    icon.on('pointerup', () => {
      if (dropEntry.collected) return;
      dropEntry.collected = true;
      this._collectDrop(drop);
      this.tweens.add({
        targets: icon,
        alpha: 0,
        duration: 200,
        onComplete: () => icon.destroy(),
      });
    });
  }

  _collectDrop(drop) {
    if (drop.type !== 'item') return;

    const itemLevel = drop.itemLevel ?? 1;

    const baseWeapon = WEAPONS[drop.itemId];
    if (baseWeapon) {
      const bonusUpgrade = drop.isBoss
        ? Math.min(10, Math.floor(itemLevel / 40))
        : (drop.isElite ? Math.min(5, Math.floor(itemLevel / 60)) : 0);

      const item = {
        ...baseWeapon,
        rarity: drop.rarity ?? baseWeapon.rarity,
        upgradeLevel: Math.max(baseWeapon.upgradeLevel ?? 0, bonusUpgrade),
        itemLevel,
      };
      if (!this.inventorySystem.add(item, 'weapons')) {
        this.hud.showNotification('Item Único já obtido', '#ffaa66', 2200);
        return;
      }
      this.hud.showNotification(
        `⚔ ${item.name} +${item.upgradeLevel} (${item.rarity}) [Nv.${itemLevel}]`,
        '#ffdd88', 3000
      );
      this.player.checkWeaponLevelPenalty();
      return;
    }

    if (drop.itemId && (drop.itemId.startsWith('worn_') || drop.itemId.startsWith('armor_'))) {
      const slot = drop.itemId.includes('helmet') ? 'helmet'
                 : drop.itemId.includes('chest') ? 'chest'
                 : drop.itemId.includes('gloves') ? 'gloves' : 'legs';
      const piece = createArmorPiece(slot, drop.rarity ?? 'COMMON', null, itemLevel);
      if (piece.rarity === 'UNIQUE') piece.id = drop.itemId;
      if (!this.inventorySystem.add(piece, 'armors')) {
        this.hud.showNotification('Item Único já obtido', '#ffaa66', 2200);
        return;
      }
      this.hud.showNotification(
        `🛡 ${piece.name} (${piece.rarity}) [Nv.${itemLevel}]`,
        '#44ffaa', 3000
      );
    }
  }

  _openChest(x, y) {
    const chestId = `${this.currentAreaIndex}:${this._currentRoom.id}`;
    if (this.openedChests.has(chestId)) return;
    this.openedChests.add(chestId);
    // O conteúdo do baú é estável para a mesma seed e sala.
    const rng = this._currentRoom.rng.fork(0x43484553);
    const isArmor = rng.next() < 0.45;
    const rarityRoll = rng.next();
    const rarity = rarityRoll < 0.05 ? 'EPIC' : rarityRoll < 0.25 ? 'RARE' : 'COMMON';

    // Nível do baú determinado pelo bioma/área e profundidade do abismo
    const areaLevel = Math.max(1, (this.currentAreaIndex * 15 + 10) + (this.abyssDepth * 25));

    if (isArmor) {
      const slot = rng.pick(['helmet', 'chest', 'gloves', 'legs']);
      const piece = createArmorPiece(slot, rarity, rng, areaLevel);
      if (!this.inventorySystem.add(piece, 'armors')) return;
      this.hud.showNotification(`📦 ${piece.name} (${rarity}) [Nv.${areaLevel}]`, '#88ddff', 3000);
    } else {
      // Baús aleatórios não criam cópias comuns de armas exclusivas de chefes.
      const weaponIds = Object.keys(WEAPONS).filter(id => WEAPONS[id].rarity !== 'UNIQUE');
      const id = rng.pick(weaponIds);
      const item = { ...WEAPONS[id], rarity, itemLevel: areaLevel };
      this.inventorySystem.add(item, 'weapons');
      this.hud.showNotification(`📦 ${item.name} (${rarity}) [Nv.${areaLevel}]`, '#88ddff', 3000);
    }
    const chestXP = 25 + areaLevel * 4;
    this.xpSystem.addXP(chestXP);
    this._floatXP(x, y - 20, chestXP);
  }

  _floatXP(x, y, amount) {
    const MONO = '"Courier New", "Consolas", monospace';
    if (amount <= 0) return;

    // '$' flutuando como XP
    const orb = this.add.text(x, y, '$', {
      fontFamily: MONO, fontSize: '16px', color: '#ffcc00', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(15);
    this.tweens.add({
      targets: orb,
      y: y - 50, alpha: 0,
      duration: 800,
      onComplete: () => orb.destroy(),
    });

    const txt = this.add.text(x + 14, y - 4, `+${amount} XP`, {
      fontFamily: MONO, fontSize: '11px', color: '#ffcc00',
      stroke: '#000', strokeThickness: 2,
    }).setDepth(15);
    this.tweens.add({
      targets: txt,
      y: y - 50, alpha: 0,
      duration: 900,
      onComplete: () => txt.destroy(),
    });
  }

  // ──────────────────────────────────────────────────────────
  // INVENTÁRIO
  // ──────────────────────────────────────────────────────────

  _toggleInventory() {
    if (!this.inventoryUI) return;
    const systems = {
      stat: this.statSystem, xp: this.xpSystem, level: this.levelSystem,
      weapon: this.weaponSystem, armor: this.armorSystem, inventory: this.inventorySystem,
      scene: this,
    };
    this.inventoryUI.toggle(this.player, systems);
  }

  // ──────────────────────────────────────────────────────────
  // SAVE
  // ──────────────────────────────────────────────────────────

  async _autosave() {
    if (!this._saveSystem) return;
    const data = this._saveSystem.buildSaveData(this);
    await this._saveSystem.save(this._saveSlot, data).catch(console.error);
  }

  // ──────────────────────────────────────────────────────────
  // INTERAÇÃO E LOOP PRINCIPAL
  // ──────────────────────────────────────────────────────────

  _checkInteractions() {
    if (!this.player || this.player.isDead || this.inventoryUI?.visible || this._isTransitioning) {
      if (this._interactionPrompt) {
        this._interactionPrompt.destroy();
        this._interactionPrompt = null;
      }
      return;
    }

    const px = this.player.x;
    const py = this.player.y;
    let promptText = null;
    let action = null;
    let targetX = px;
    let targetY = py - 36;

    // 1. Orbe de morte
    if (this._deathOrb) {
      const d = Phaser.Math.Distance.Between(px, py, this._deathOrb.x, this._deathOrb.y);
      if (d < 50) {
        promptText = `[G] Recuperar XP Perdida (${this.xpSystem.lost} XP)`;
        targetX = this._deathOrb.x;
        targetY = this._deathOrb.y - 28;
        action = () => {
          const recovered = this.xpSystem.recoverLost();
          this._floatXP(this._deathOrb.x, this._deathOrb.y, recovered);
          this._deathOrb.getData('label')?.destroy();
          this._deathOrb.destroy();
          this._deathOrb = null;
          this.hud.showNotification(`+${recovered} XP Recuperada!`, '#ffdd00', 2000);
          this._autosave();
        };
      }
    }

    // 2. Santuário
    if (!promptText && this._sanctuaryObj) {
      const sx = this._sanctuaryObj.getData('wx');
      const sy = this._sanctuaryObj.getData('wy');
      const d = Phaser.Math.Distance.Between(px, py, sx, sy);
      if (d < 50) {
        promptText = '[G] Descansar no Santuário';
        targetX = sx;
        targetY = sy - 32;
        action = () => this._restAtSanctuary();
      }
    }

    // 3. Portal do Abismo
    if (!promptText && this._abyssPortal) {
      const ax = this._abyssPortal.getData('wx');
      const ay = this._abyssPortal.getData('wy');
      const d = Phaser.Math.Distance.Between(px, py, ax, ay);
      if (d < 54) {
        promptText = `[G] Descer ao Abismo Profundo (Profundidade ${this.abyssDepth + 1})`;
        targetX = ax;
        targetY = ay - 36;
        action = () => this._advanceToNextArea();
      }
    }

    // 4. Baús fechados
    if (!promptText && this._activeChests.length > 0) {
      for (const chestEntry of this._activeChests) {
        if (chestEntry.opened) continue;
        const d = Phaser.Math.Distance.Between(px, py, chestEntry.x, chestEntry.y);
        if (d < 48) {
          promptText = '[G] Abrir Baú';
          targetX = chestEntry.x;
          targetY = chestEntry.y - 26;
          action = () => {
            chestEntry.opened = true;
            chestEntry.obj.setTint(0x666666);
            this._openChest(chestEntry.x, chestEntry.y);
          };
          break;
        }
      }
    }

    // 5. Drops no chão
    if (!promptText && this._activeDrops.length > 0) {
      for (const dropEntry of this._activeDrops) {
        if (dropEntry.collected) continue;
        const d = Phaser.Math.Distance.Between(px, py, dropEntry.x, dropEntry.y);
        if (d < 48) {
          const itemBase = WEAPONS[dropEntry.drop.itemId];
          const itemName = itemBase ? itemBase.name : 'Equipamento';
          promptText = `[G] Coletar ${itemName}`;
          targetX = dropEntry.x;
          targetY = dropEntry.y - 24;
          action = () => {
            dropEntry.collected = true;
            this._collectDrop(dropEntry.drop);
            this.tweens.add({
              targets: dropEntry.icon,
              alpha: 0, scaleX: 1.8, scaleY: 1.8,
              duration: 200,
              onComplete: () => dropEntry.icon.destroy(),
            });
          };
          break;
        }
      }
    }

    if (promptText) {
      if (!this._interactionPrompt) {
        this._interactionPrompt = this.add.text(targetX, targetY, promptText, {
          fontFamily: 'Inter', fontSize: '11px', color: '#ffdd88',
          backgroundColor: '#000000cc', padding: { x: 6, y: 3 },
          stroke: '#000', strokeThickness: 2,
        }).setOrigin(0.5).setDepth(150);
      } else {
        this._interactionPrompt.setPosition(targetX, targetY).setText(promptText);
      }

      if (Phaser.Input.Keyboard.JustDown(this.keys.interact) && action) {
        action();
      }
    } else if (this._interactionPrompt) {
      this._interactionPrompt.destroy();
      this._interactionPrompt = null;
    }
  }

  update(time, delta) {
    if (!this.player) return;

    // Não processa input se inventário aberto
    if (!this.inventoryUI?.visible) {
      this.player.handleInput(this.cursors, this.keys);
    }

    this.player.update(delta);

    // IA dos inimigos
    for (const enemy of this._activeEnemies) {
      if (!enemy.isDead) enemy.updateAI(delta, this.player);
    }

    // ── Mecânicas ambientais ───────────────────────────────────
    if (this._hazardManager) {
      this._hazardManager.update(delta, this.player, this._activeEnemies);
      this._updateEnvironmentalInteractions(delta);
    }

    // Interações de proximidade (Santuário, Baús, Drops, Portal, Morte)
    this._checkInteractions();

    // HUD
    this.hud.update(this.player, {
      levelSystem: this.levelSystem,
      xpSystem:    this.xpSystem,
    });

    // Boss bar
    if (this._activeBoss && !this._activeBoss.isDead) {
      this.bossBar.update();
    }

    // Projectiles
    this._updateProjectiles(delta);
  }

  _updateProjectiles(delta) {
    if (!this._activeProjectiles) return;
    for (let i = this._activeProjectiles.length - 1; i >= 0; i--) {
      const p = this._activeProjectiles[i];
      p.life -= delta;
      if (p.life <= 0 || !p.obj || p.obj.destroyed) {
        if (p.obj && !p.obj.destroyed) p.obj.destroy();
        this._activeProjectiles.splice(i, 1);
        continue;
      }

      p.obj.x += (p.vx * delta) / 1000;
      p.obj.y += (p.vy * delta) / 1000;

      // Reflectors
      if (this._hazardManager) {
        for (const c of this._hazardManager.getCrystals()) {
          if (c.checkProjectileCollision(p.obj) && !p.hitSet.has(c)) {
            p.hitSet.add(c);
            c.reflectProjectile(p);
            // Change rotation for player skill
            if (!p.isEnemy) {
              p.obj.setRotation(Math.atan2(p.vy, p.vx));
            }
          }
        }
      }

      // Hits
      if (p.isEnemy) {
        if (this.player && !this.player.isDead) {
          const d = Phaser.Math.Distance.Between(p.obj.x, p.obj.y, this.player.x, this.player.y);
          if (d < 28 && this.player.state !== 'DODGE' && !p.hitSet.has(this.player)) {
            p.hitSet.add(this.player);
            this.player.takeDamage(p.damage ?? 20);
            if (p.element) {
               this.player.statusSystem?.addBuildup(p.element, p.elementBuildup ?? 15, this.player.resistances?.[p.element] ?? 0);
            }
            if (p.obj && !p.obj.destroyed) p.obj.destroy();
            this._activeProjectiles.splice(i, 1);
          }
        }
      } else {
        for (const enemy of this._activeEnemies) {
          if (enemy.isDead) continue;
          const d = Phaser.Math.Distance.Between(p.obj.x, p.obj.y, enemy.x, enemy.y);
          if (d < 40 && !p.hitSet.has(enemy)) {
            p.hitSet.add(enemy);
            const sd = p.skillData;
            const result = DamageSystem.resolveHit({
              attack: sd.damage ?? 55,
              defense: enemy.effectiveDefense,
              critChance: this.player.critChance,
              critMultiplier: this.player.critMultiplier,
            });
            enemy.takeDamage(result.finalDamage);
            enemy.balanceSystem?.takePoiseDamage(sd.equilDamage ?? 20);
            if (sd.element && enemy.statusSystem) {
              enemy.statusSystem.addBuildup(
                sd.element, sd.elementBuildup ?? 45,
                enemy.resistances?.[sd.element] ?? 0
              );
            }
          }
        }
      }
    }
  }

  // ──────────────────────────────────────────────────────────
  // INTERAÇÕES COM PERIGOS AMBIENTAIS
  // ──────────────────────────────────────────────────────────

  _updateEnvironmentalInteractions(delta) {
    if (!this._hazardManager || !this.player || this.player.isDead) return;
    const biomeId = this.areaData?.biome?.id;
    if (!biomeId) return;

    // ── Plantas tóxicas: verificação de sobreposição de ataque ────
    // Se o player está atacando, verifica se atingiu alguma planta
    if (this.player.state === 'ATTACK' || this.player.state === 'HEAVY') {
      const plants = this._hazardManager.getToxicPlants();
      for (const plant of plants) {
        const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, plant.x, plant.y);
        if (d < 80 && !plant._hitThisAttack) {
          plant._hitThisAttack = true;
          plant.takeDamage(25);
          // Reset após o ataque terminar
          this.time.delayedCall(400, () => { plant._hitThisAttack = false; });
        }
      }
    }

    // ── Pisos frágeis: step-on ao jogador sobrepor ─────────────
    if (biomeId === 'CATACUMBAS_ECOANTES') {
      const floors = this._hazardManager.getFragileFloors();
      for (const floor of floors) {
        const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, floor.x, floor.y);
        if (d < 24 && !floor.broken) {
          floor.stepOn(this, this._activeEnemies, this._hazardManager.fragileTriggered);
        }
      }
    }

    // ── Portas ilusórias: verificação de overlap ────────────────
    if (biomeId === 'BIBLIOTECA_DO_OCULTO') {
      const doors = this._hazardManager.getIllusionDoors();
      for (const door of doors) {
        const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, door.x, door.y);
        if (d < 36 && !this._isTransitioning) {
          // Probabilidade de ativação ao entrar na porta
          if (!door._playerNear) {
            door._playerNear = true;
            // 30% de chance de ser ilusória
            const rng = this._currentRoom.rng.fork(door.x + door.y);
            if (rng.next() < 0.30) {
              door.activate(this, (targetRoomIndex) => {
                // Valida que o destino é acessível
                const totalRooms = this.areaData.rooms.length;
                const safeTarget = Math.min(Math.max(0, targetRoomIndex), totalRooms - 1);
                // Evita softlock: não teleporta para sala de boss não visitada
                const targetRoom = this.areaData.rooms[safeTarget];
                if (targetRoom?.type === 'BOSS' && !this.defeatedBosses.has(`boss_${this.currentAreaIndex}`)) {
                  // Redireciona para sala anterior segura
                  this.hud.showNotification('A ilusão falhou...', '#796395', 1500);
                } else {
                  this.hud.showNotification('Ilusão! Você foi teletransportado.', '#796395', 2000);
                  this._transitionToRoom(safeTarget, 'W');
                }
              });
            }
          }
        } else {
          door._playerNear = false;
        }
      }
    }

    // ── Recuo alterado por zona gravitacional ─────────────────
    // O efeito GRAVITY em player.activeHazardEffect é lido em Player.js._doDodge()
    // Nenhuma ação adicional necessária aqui.
  }
}
