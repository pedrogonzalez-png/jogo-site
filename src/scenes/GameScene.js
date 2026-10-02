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
    this.cameras.main.setBackgroundColor(0x0d0a08);

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
    this.discoveredSanctuaries = [];
    this.currentAreaIndex  = 0;
    this.currentRoomIndex  = 0;
    this.npcState          = {};

    // ── Carrega save ou inicia novo ───────────────────────────
    if (this._loadSave && this._saveSystem) {
      this._saveSystem.load(this._saveSlot).then(data => {
        if (data) this._saveSystem.applySaveData(data, this);
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
    this.enemiesGroup  = this.physics.add.group();
    this._activeEnemies = [];
    this._activeDrops   = [];
    this._activeChests  = [];
    this._activeBoss    = null;
    this._deathOrb      = null;
    this._abyssPortal   = null;
    this._sanctuaryObj  = null;

    this._buildTilemap(room);
    this._spawnRoomContent(room);

    // Partículas de ambiente
    this._buildAmbientParticles();
  }

  _buildTilemap(room) {
    const { grid, tileW, tileH } = room.data;
    const biome = this.areaData.biome;

    for (let y = 0; y < tileH; y++) {
      for (let x = 0; x < tileW; x++) {
        const tile = grid[y][x];
        const wx   = x * TILE;
        const wy   = y * TILE;

        if (tile === TILE_TYPES.VOID) continue;

        if (tile === TILE_TYPES.FLOOR) {
          this.add.image(wx + TILE / 2, wy + TILE / 2, 'tile_floor').setTint(biome.palette.floor);
        } else if (tile === TILE_TYPES.DOOR_N || tile === TILE_TYPES.DOOR_S ||
                   tile === TILE_TYPES.DOOR_E || tile === TILE_TYPES.DOOR_W) {
          this.add.image(wx + TILE / 2, wy + TILE / 2, 'tile_floor').setTint(biome.palette.floor);
          this.add.image(wx + TILE / 2, wy + TILE / 2, 'tile_door').setTint(biome.palette.accent).setAlpha(0.85);

          let dir = 'E';
          if (tile === TILE_TYPES.DOOR_N) dir = 'N';
          else if (tile === TILE_TYPES.DOOR_S) dir = 'S';
          else if (tile === TILE_TYPES.DOOR_W) dir = 'W';

          const doorBody = this.doorsGroup.create(wx + TILE / 2, wy + TILE / 2, 'tile_door');
          doorBody.setVisible(false).refreshBody();
          doorBody.setData('direction', dir);
        } else if (tile === TILE_TYPES.WALL) {
          this.add.image(wx + TILE / 2, wy + TILE / 2, 'tile_wall').setTint(biome.palette.wall);
          const body = this.wallsGroup.create(wx + TILE / 2, wy + TILE / 2, 'tile_wall');
          body.setVisible(false).refreshBody();
        } else if (tile === TILE_TYPES.OBSTACLE) {
          this.add.image(wx + TILE / 2, wy + TILE / 2, 'tile_floor').setTint(biome.palette.floor);
          this.add.image(wx + TILE / 2, wy + TILE / 2, 'tile_obstacle').setTint(biome.palette.wall);
          const body = this.wallsGroup.create(wx + TILE / 2, wy + TILE / 2, 'tile_obstacle');
          body.setVisible(false).refreshBody();
        } else if (tile === TILE_TYPES.SANCTUARY) {
          this.add.image(wx + TILE / 2, wy + TILE / 2, 'tile_floor').setTint(biome.palette.floor);
          this._spawnSanctuary(wx + TILE / 2, wy + TILE / 2);
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
    } else if (room.type === 'CHEST') {
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

    for (let i = 0; i < count; i++) {
      const templateId = rng.pick(pool);
      const template   = { ...ENEMY_TEMPLATES[templateId] };
      if (!template) continue;

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

      // Posição dentro da sala (evitar paredes e evitar nascer em cima do player)
      let ex, ey;
      if (room.type === 'ENTRANCE') {
        // Posicionados na metade leste da sala
        ex = Math.floor(tileW * 0.72) * TILE;
        ey = Math.floor(tileH * (i === 0 ? 0.35 : 0.65)) * TILE;
      } else {
        ex = rng.int(4, tileW - 5) * TILE;
        ey = rng.int(3, tileH - 4) * TILE;
      }

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

    const template = { ...BOSS_TEMPLATES.ashen_lord };

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
    this._sanctuaryObj = this.add.image(x, y, 'sanctuary').setDepth(5).setScale(1.4);
    this._sanctuaryObj.setData('wx', x).setData('wy', y);

    // Luz pulsante
    this.tweens.add({
      targets: this._sanctuaryObj,
      alpha: 0.7, scale: 1.5,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    if (!this.discoveredSanctuaries.includes(this.currentRoomIndex)) {
      this.discoveredSanctuaries.push(this.currentRoomIndex);
    }
  }

  _spawnChest(room) {
    const cx = Math.floor(room.data.tileW / 2) * TILE;
    const cy = Math.floor(room.data.tileH / 2) * TILE;
    const chest = this.add.image(cx, cy, 'chest').setDepth(5).setInteractive();
    chest.setData('opened', false);

    const chestEntry = { obj: chest, x: cx, y: cy, opened: false };
    this._activeChests.push(chestEntry);

    chest.on('pointerup', () => {
      if (chestEntry.opened) return;
      chestEntry.opened = true;
      chest.setData('opened', true);
      chest.setTint(0x666666);
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

    this.player.relics = ['eye_of_abyss', 'iron_will'];
    this.player.checkWeaponLevelPenalty();

    // Sincroniza HP e charges do save
    this.player.hp          = this.player.maxHP;
    this.player.healCharges    = this.healCharges;
    this.player.maxHealCharges = this.maxHealCharges;
    this.player.healAmount     = this.healAmount;
  }

  _buildAmbientParticles() {
    const biome = this.areaData.biome;
    const roomW = this._currentRoom.data.tileW * TILE;
    const roomH = this._currentRoom.data.tileH * TILE;

    for (let i = 0; i < 25; i++) {
      const p = this.add.circle(
        Phaser.Math.Between(0, roomW),
        Phaser.Math.Between(0, roomH),
        Phaser.Math.Between(1, 3),
        biome.palette.accent ?? 0x554433,
        Phaser.Math.FloatBetween(0.05, 0.3)
      ).setDepth(1);

      this.tweens.add({
        targets: p,
        y: `-=${Phaser.Math.Between(80, 200)}`,
        x: `+=${Phaser.Math.Between(-40, 40)}`,
        alpha: { from: 0.2, to: 0 },
        duration: Phaser.Math.Between(3000, 7000),
        repeat: -1,
        delay: Phaser.Math.Between(0, 5000),
        onRepeat: () => {
          p.setPosition(
            Phaser.Math.Between(0, roomW),
            Phaser.Math.Between(roomH * 0.5, roomH)
          );
        },
      });
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
    // Player vs Paredes
    this.physics.add.collider(this.player, this.wallsGroup);
    // Inimigos vs Paredes
    this.physics.add.collider(this.enemiesGroup, this.wallsGroup);
    // Inimigos vs Inimigos
    this.physics.add.collider(this.enemiesGroup, this.enemiesGroup);
    // Player vs Portas (transição entre salas)
    if (this.doorsGroup) {
      this.physics.add.overlap(this.player, this.doorsGroup, (player, door) => {
        this._onPlayerTouchDoor(door.getData('direction'));
      });
    }
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

      // Calcula record de Abismo no início do hit
      const combatRecord = this.abyssChallenge.recordCombatStart(
        this.levelSystem.level, enemy.level
      );

      // Resolve hit via CombatSystem
      const hitResult = CombatSystem.processHit(
        this.player, enemy, type,
        {
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

      // Armazena record para recompensa de Abismo ao matar
      enemy.setData?.('combatRecord', combatRecord);
      if (!enemy.setData) enemy._combatRecord = combatRecord;

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
    // MVP: habilidade em linha reta (Corte Ignição)
    const angle  = player.facingAngle;
    const range  = skillData.range ?? 200;
    const stepX  = Math.cos(angle);
    const stepY  = Math.sin(angle);

    // Visual do projétil
    const proj = this.add.rectangle(
      player.x, player.y, 12, 6,
      0xff4400, 0.9
    ).setDepth(15).setRotation(angle);

    this.tweens.add({
      targets: proj,
      x: player.x + stepX * range,
      y: player.y + stepY * range,
      alpha: 0,
      duration: 350,
      onUpdate: () => {
        // Verifica hits ao longo do caminho
        for (const enemy of this._activeEnemies) {
          if (enemy.isDead) continue;
          const d = Phaser.Math.Distance.Between(proj.x, proj.y, enemy.x, enemy.y);
          if (d < 40) {
            const result = DamageSystem.resolveHit({
              attack: skillData.damage ?? 55,
              defense: enemy.effectiveDefense,
              critChance: player.critChance,
              critMultiplier: player.critMultiplier,
            });
            enemy.takeDamage(result.finalDamage);
            enemy.balanceSystem?.takePoiseDamage(skillData.equilDamage ?? 20);

            // Status elemental
            if (skillData.element && enemy.statusSystem) {
              enemy.statusSystem.addBuildup(
                skillData.element, skillData.elementBuildup ?? 45,
                enemy.resistances?.[skillData.element] ?? 0
              );
            }
          }
        }
      },
      onComplete: () => proj.destroy(),
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

    // Loot
    const drops = this.lootSystem.generateDrop(enemy.template, this.levelSystem.level);
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

    // Drop de boss
    const drops = this.lootSystem.generateDrop(boss.template, this.levelSystem.level);
    drops.forEach(drop => {
      if (drop.type === 'item') this._spawnDroppedItem(boss.x, boss.y, drop);
    });

    // Spawna Portal do Abismo para avanço infinito de profundidade
    this._spawnAbyssPortal(boss.x, boss.y);

    // Autosave
    this._autosave();
  }

  _onPlayerDied(x, y) {
    this.xpSystem.onDeath({ x, y });

    // Orbe de XP no local da morte
    this._spawnDeathOrb(x, y);

    // Delay e tela de morte
    this.time.delayedCall(1200, () => {
      this._showDeathScreen();
    });
  }

  _spawnDeathOrb(x, y) {
    if (this._deathOrb) this._deathOrb.destroy();

    this._deathOrb = this.add.circle(x, y, 10, 0xffcc00, 0.8).setDepth(8);
    const label = this.add.text(x, y - 20, `XP perdida`, {
      fontFamily: 'Inter', fontSize: '10px', color: '#ffcc00',
    }).setOrigin(0.5).setDepth(9);

    this.tweens.add({
      targets: [this._deathOrb],
      scaleX: 1.3, scaleY: 1.3,
      duration: 600, yoyo: true, repeat: -1,
    });

    this._deathOrb.setData('label', label);
    this._deathOrb.setInteractive(
      new Phaser.Geom.Circle(0, 0, 16), Phaser.Geom.Circle.Contains
    );
    this._deathOrb.on('pointerup', () => {
      const recovered = this.xpSystem.recoverLost();
      this._floatXP(x, y, recovered);
      this._deathOrb.destroy();
      label.destroy();
      this._deathOrb = null;
    });
  }

  _showDeathScreen() {
    const W = this.cameras.main.width;
    const H = this.cameras.main.height;

    this.cameras.main.fadeOut(600, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      // Tela de morte
      const overlay = this.add.rectangle(
        this.cameras.main.scrollX + W / 2,
        this.cameras.main.scrollY + H / 2,
        W, H, 0x000000, 0.9
      ).setDepth(500).setScrollFactor(0);

      this.add.text(W / 2, H / 2 - 60, 'VOCÊ MORREU', {
        fontFamily: 'Cinzel', fontSize: '48px', color: '#cc1111',
        stroke: '#000', strokeThickness: 6,
      }).setOrigin(0.5).setScrollFactor(0).setDepth(501);

      this.add.text(W / 2, H / 2, `XP não recuperada: perdida`, {
        fontFamily: 'Inter', fontSize: '14px', color: '#888888',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(501);

      const respawnBtn = this.add.text(W / 2, H / 2 + 60, 'Renascer no Santuário', {
        fontFamily: 'Cinzel', fontSize: '20px', color: '#ffddaa',
        backgroundColor: '#1a0000', padding: { x: 16, y: 8 },
      }).setOrigin(0.5).setScrollFactor(0).setDepth(501).setInteractive();

      respawnBtn.on('pointerup', () => {
        overlay.destroy();
        this._respawnAtSanctuary();
      });

      const menuBtn = this.add.text(W / 2, H / 2 + 110, 'Menu Principal', {
        fontFamily: 'Inter', fontSize: '14px', color: '#666666',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(501).setInteractive();

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

    this.xpSystem.purgeLost();

    this.cameras.main.fadeIn(600, 0, 0, 0);
    this.hud.showNotification('Renascido no Santuário', '#ffaa44', 2500);
  }

  _clearRoom() {
    this._activeEnemies.forEach(e => { if (!e.isDead) e.destroy(); });
    this._activeEnemies = [];
    this._activeBoss = null;
    this._activeDrops.forEach(d => { if (d.icon) d.icon.destroy(); });
    this._activeDrops = [];
    this._activeChests.forEach(c => { if (c.obj) c.obj.destroy(); });
    this._activeChests = [];
    if (this._abyssPortal) {
      this._abyssPortal.destroy();
      this._abyssPortal = null;
    }
    if (this._interactionPrompt) {
      this._interactionPrompt.destroy();
      this._interactionPrompt = null;
    }

    // Remove todos os GameObjects da cena menos o player e UI
    this.children.getAll().forEach(obj => {
      if (obj !== this.player && obj.depth < 100) {
        obj.destroy();
      }
    });
    this.wallsGroup?.destroy(true);
    this.doorsGroup?.destroy(true);
    this.enemiesGroup?.destroy(true);
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

    if (this._activeEnemies.length === 0 && this._currentRoom.type !== 'BOSS') {
      this._spawnEnemies(this._currentRoom);
      this._setupPhysics();
    }

    this.hud.showNotification('Santuário — Descansado', '#88aaff', 2500);
    this._autosave();

    this.cameras.main.flash(300, 100, 150, 255);
  }

  _spawnAbyssPortal(x, y) {
    if (this._abyssPortal) this._abyssPortal.destroy();
    this._abyssPortal = this.add.image(x, y, 'portal').setDepth(6).setScale(1.2);

    this.tweens.add({
      targets: this._abyssPortal,
      rotation: Math.PI * 2,
      duration: 6000,
      repeat: -1,
    });
    this.tweens.add({
      targets: this._abyssPortal,
      scaleX: 1.4, scaleY: 1.4,
      duration: 1000, yoyo: true, repeat: -1,
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
      this._buildCurrentRoom();

      const startRoom = this.areaData.rooms[0];
      const px = 3 * TILE;
      const py = Math.floor((startRoom?.data?.tileH ?? 22) / 2) * TILE;
      this.player.setPosition(px, py);
      this.player.restoreAtSanctuary();

      this._setupPhysics();
      this._setupCamera();

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
    const icon = this.add.image(
      x + Phaser.Math.Between(-15, 15),
      y + Phaser.Math.Between(-15, 15),
      'chest'
    ).setScale(0.6).setDepth(7).setInteractive();

    this.tweens.add({
      targets: icon,
      y: icon.y - 6,
      duration: 500, yoyo: true, repeat: -1,
      ease: 'Sine.easeInOut',
    });

    const dropEntry = { icon, x: icon.x, y: icon.y, drop, collected: false };
    this._activeDrops.push(dropEntry);

    icon.on('pointerup', () => {
      if (dropEntry.collected) return;
      dropEntry.collected = true;
      this._collectDrop(drop);
      this.tweens.add({
        targets: icon,
        alpha: 0, scaleX: 1.8, scaleY: 1.8,
        duration: 200,
        onComplete: () => icon.destroy(),
      });
    });
  }

  _collectDrop(drop) {
    if (drop.type !== 'item') return;

    const baseWeapon = WEAPONS[drop.itemId];
    if (baseWeapon) {
      const item = { ...baseWeapon, rarity: drop.rarity ?? baseWeapon.rarity };
      this.inventorySystem.add(item, 'weapons');
      this.hud.showNotification(
        `⚔ ${item.name} (${drop.rarity ?? item.rarity})`,
        '#ffdd88', 3000
      );
      return;
    }

    if (drop.itemId && (drop.itemId.startsWith('worn_') || drop.itemId.startsWith('armor_'))) {
      const slot = drop.itemId.includes('helmet') ? 'helmet'
                 : drop.itemId.includes('chest') ? 'chest'
                 : drop.itemId.includes('gloves') ? 'gloves' : 'legs';
      const piece = createArmorPiece(slot, drop.rarity ?? 'COMMON', null, this.levelSystem.level);
      this.inventorySystem.add(piece, 'armors');
      this.hud.showNotification(
        `🛡 ${piece.name} (${piece.rarity})`,
        '#44ffaa', 3000
      );
    }
  }

  _openChest(x, y) {
    const rng = this.seedSystem.areaRNG(this.currentAreaIndex + 100);
    const isArmor = rng.next() < 0.45;
    const rarityRoll = rng.next();
    const rarity = rarityRoll < 0.05 ? 'EPIC' : rarityRoll < 0.25 ? 'RARE' : 'COMMON';

    if (isArmor) {
      const slot = rng.pick(['helmet', 'chest', 'gloves', 'legs']);
      const piece = createArmorPiece(slot, rarity, rng, this.levelSystem.level);
      this.inventorySystem.add(piece, 'armors');
      this.hud.showNotification(`📦 ${piece.name} (${rarity})`, '#88ddff', 3000);
    } else {
      const weaponIds = Object.keys(WEAPONS);
      const id = rng.pick(weaponIds);
      const item = { ...WEAPONS[id], rarity };
      this.inventorySystem.add(item, 'weapons');
      this.hud.showNotification(`📦 ${item.name} (${rarity})`, '#88ddff', 3000);
    }
    this._floatXP(x, y - 20, 25 + this.levelSystem.level * 5);
  }

  _floatXP(x, y, amount) {
    if (amount <= 0) return;

    const orb = this.add.image(x, y, 'xporb').setDepth(15).setScale(1.2);
    this.tweens.add({
      targets: orb,
      y: y - 50, alpha: 0,
      duration: 800,
      onComplete: () => orb.destroy(),
    });

    const txt = this.add.text(x + 12, y - 4, `+${amount} XP`, {
      fontFamily: 'Inter', fontSize: '11px', color: '#ffcc00',
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
  }
}
