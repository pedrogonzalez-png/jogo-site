// ============================================================
// world/EnvironmentalHazards.js
// Mecânicas ambientais reais para os 10 biomas do Abismo.
// Gerencia criação, atualização e destruição de todos os perigos.
// Todos os efeitos são baseados em distância — sem bodies estáticos
// avulsos que poderiam conflitar com o sistema de colisão da sala.
// ============================================================
import Phaser from 'phaser';
import { BALANCE } from '../data/balance.js';

const TILE = BALANCE.WORLD.TILE_SIZE; // 32

// ─────────────────────────────────────────────────────────────
// Classe base de perigo ambiental
// ─────────────────────────────────────────────────────────────
class BaseHazard {
  constructor(scene, x, y, config = {}) {
    this.scene  = scene;
    this.x      = x;
    this.y      = y;
    this.config = config;
    this.alive  = true;
    this._objects = []; // GameObjects criados por este hazard
  }

  /** Adiciona objeto ao registro para destruição limpa. */
  _track(obj) {
    if (obj) this._objects.push(obj);
    return obj;
  }

  _safeDestroy(obj) {
    if (obj && !obj.destroyed) {
      try { obj.destroy(); } catch (_) {}
    }
  }

  update(delta) {}

  destroy() {
    this.alive = false;
    for (const obj of this._objects) {
      this._safeDestroy(obj);
    }
    this._objects = [];
  }
}

// ─────────────────────────────────────────────────────────────
// 3.1 ARREDORES_CINZENTOS — Cinzas Profundas
// Reduz velocidade do jogador em 35% enquanto sobreposto.
// O multiplicador é aplicado via player.activeHazardEffect = 'ASH'
// (lido em Player.js getter speed). Detecção por distância.
// ─────────────────────────────────────────────────────────────
export class AshPatch extends BaseHazard {
  constructor(scene, x, y) {
    super(scene, x, y);
    this._radius = TILE;

    // Visual: retângulo cinzento semitransparente
    this._visual = this._track(
      scene.add.rectangle(x, y, TILE * 2, TILE * 2, 0x656973, 0.55).setDepth(2)
    );
    // Pulso lento
    scene.tweens.add({
      targets: this._visual,
      alpha: { from: 0.35, to: 0.65 },
      duration: 2400,
      yoyo: true,
      repeat: -1,
    });
  }

  update(delta, player) {
    if (!player || player.isDead) return;
    const d = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    if (d <= this._radius * 2) {
      player.activeHazardEffect = 'ASH';
    }
  }
}

// ─────────────────────────────────────────────────────────────
// 3.2 AQUEDUTO_SUBMERSO — Zonas de Correnteza
// ─────────────────────────────────────────────────────────────
export class CurrentZone extends BaseHazard {
  /**
   * @param {number} dirX  componente X da direção (normalizado)
   * @param {number} dirY  componente Y
   * @param {number} speed px/s do deslocamento (padrão 120)
   */
  constructor(scene, x, y, dirX = 1, dirY = 0, speed = 120, width = TILE * 3, height = TILE) {
    super(scene, x, y, { dirX, dirY, speed });
    this._dirX  = dirX;
    this._dirY  = dirY;
    this._speed = speed;
    this._w     = width;
    this._h     = height;
    this._halfW = width / 2;
    this._halfH = height / 2;

    // Visual: água volumétrica animada em ASCII de alta densidade
    const cols = Math.max(1, Math.round(width / TILE));
    const rows = Math.max(1, Math.round(height / TILE));
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const tx = x - this._halfW + c * TILE + TILE / 2;
        const ty = y - this._halfH + r * TILE + TILE / 2;
        if (scene.textures.exists('water_frame_0')) {
          const w = scene.add.sprite(tx, ty, 'water_frame_0').setDepth(2).setAlpha(0.88);
          if (scene.anims?.exists('water_flow')) {
            w.play('water_flow');
          }
          this._track(w);
        }
      }
    }

    // Setas animadas indicando a correnteza
    for (let i = 0; i < 3; i++) {
      const ax = x + (i - 1) * (width / 3) * dirX;
      const ay = y + (i - 1) * (height / 3) * dirY;

      const arrow = scene.add.text(ax, ay, '≈>', {
        fontFamily: '"Courier New", Consolas, monospace',
        fontSize: '12px',
        color: '#d8f6fc',
        fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(3);
      this._track(arrow);
      
      scene.tweens.add({
        targets: arrow,
        x: ax + dirX * (width / 3),
        y: ay + dirY * (height / 3),
        alpha: { from: 0.9, to: 0.1 },
        duration: 800,
        delay: i * 270,
        repeat: -1,
        onRepeat: () => {
          if (!arrow.destroyed) arrow.setPosition(ax, ay).setAlpha(0.9);
        },
      });
    }
  }

  /** Verifica se uma posição está dentro da zona de correnteza */
  _contains(px, py) {
    return (
      px >= this.x - this._halfW && px <= this.x + this._halfW &&
      py >= this.y - this._halfH && py <= this.y + this._halfH
    );
  }

  update(delta, player) {
    if (!player || player.isDead) return;
    if (!this._contains(player.x, player.y)) return;
    if (player.state === 'DODGE') return;

    // Aplica deslocamento da correnteza
    const push = (this._speed * delta) / 1000;
    if (player.body) {
      player.body.velocity.x += this._dirX * push;
      player.body.velocity.y += this._dirY * push;
    }
    player.activeHazardEffect = 'WATER';
  }
}

// ─────────────────────────────────────────────────────────────
// 3.3 CATACUMBAS_ECOANTES — Piso Frágil
// ─────────────────────────────────────────────────────────────
export class FragileFloor extends BaseHazard {
  static MAX_TRIGGERED = 3;

  constructor(scene, x, y) {
    super(scene, x, y);
    this.broken    = false;
    this._radius   = TILE * 0.6;

    // Visual: chão com padrão de rachaduras ASCII de alta densidade
    if (scene.textures.exists('tile_floor_cracked')) {
      this._visual = this._track(
        scene.add.image(x, y, 'tile_floor_cracked').setDepth(2).setAlpha(0.9)
      );
    } else {
      this._visual = this._track(
        scene.add.rectangle(x, y, TILE, TILE, 0x5B5061, 0.55).setDepth(2)
      );
    }
  }

  stepOn(scene, activeEnemies, alreadyTriggered) {
    if (this.broken) return;
    if (alreadyTriggered >= FragileFloor.MAX_TRIGGERED) return;

    // Aviso visual
    if (this._visual && !this._visual.destroyed) {
      this._visual.setFillStyle(0x8C7A80, 0.7);
    }

    // Quebra após 400ms
    scene.time.delayedCall(400, () => {
      if (this.broken) return;
      this.broken = true;
      if (this._visual && !this._visual.destroyed) {
        this._visual.setFillStyle(0x2C2432, 0.9);
      }
      if (this._crackGfx && !this._crackGfx.destroyed) {
        this._crackGfx.clear();
        this._crackGfx.lineStyle(1, 0xA092CB, 1.0);
        this._crackGfx.beginPath();
        this._crackGfx.moveTo(this.x - 10, this.y - 6);
        this._crackGfx.lineTo(this.x + 6, this.y + 8);
        this._crackGfx.lineTo(this.x + 10, this.y - 4);
        this._crackGfx.strokePath();
      }
      scene.cameras.main.shake(120, 0.006);

      // Sinal sonoro visual (onda se expandindo)
      const wave = scene.add.circle(this.x, this.y, 10, 0xA092CB, 0.5).setDepth(10);
      scene.tweens.add({
        targets: wave,
        scaleX: 10, scaleY: 10,
        alpha: 0,
        duration: 600,
        onComplete: () => { try { wave.destroy(); } catch (_) {} },
      });

      // Notificação
      try { scene.hud?.showNotification('Piso Frágil!', '#A092CB', 1000); } catch (_) {}

      // Atrai inimigos próximos
      for (const e of activeEnemies) {
        if (!e.isDead && Phaser.Math.Distance.Between(e.x, e.y, this.x, this.y) < 320) {
          e.behaviorState = 'CHASING';
          e.targetX = this.x;
          e.targetY = this.y;
        }
      }
    });
  }
}

// ─────────────────────────────────────────────────────────────
// 3.4 FORJA_MACULADA — Erupção Térmica
// Fases: PREP → WARNING → ACTIVE → RECOVERY
// ─────────────────────────────────────────────────────────────
export class ThermalEruption extends BaseHazard {
  constructor(scene, x, y) {
    super(scene, x, y);
    this._phase       = 'PREP';
    this._phaseTimer  = Phaser.Math.Between(3000, 7000);
    this._playerHitThisCycle = false;
    this._enemyHitThisCycle  = new Set();
    this._radius = TILE * 1.5;
    this._warnTween = null;

    // Visual base (calor constante)
    this._baseGlow = this._track(
      scene.add.circle(x, y, TILE * 0.8, 0x794338, 0.25).setDepth(2)
    );
    // Visual de aviso
    this._warnGlow = this._track(
      scene.add.circle(x, y, TILE * 1.2, 0xAF5D3B, 0).setDepth(3)
    );
    // Visual ativo
    this._activeVisual = this._track(
      scene.add.circle(x, y, TILE * 1.5, 0xF2C56D, 0).setDepth(4)
    );
  }

  update(delta, player, activeEnemies) {
    this._phaseTimer -= delta;

    switch (this._phase) {
      case 'PREP':
        if (this._phaseTimer <= 0) this._enterWarning();
        break;
      case 'WARNING':
        if (this._phaseTimer <= 0) this._enterActive(player, activeEnemies);
        break;
      case 'ACTIVE':
        if (this._phaseTimer <= 0) {
          this._enterRecovery();
        } else {
          this._applyDamage(player, activeEnemies);
        }
        break;
      case 'RECOVERY':
        if (this._phaseTimer <= 0) this._enterPrep();
        break;
    }
  }

  _enterPrep() {
    this._phase = 'PREP';
    this._phaseTimer = Phaser.Math.Between(4000, 9000);
    this._playerHitThisCycle = false;
    this._enemyHitThisCycle.clear();
    if (!this._warnGlow.destroyed) this._warnGlow.setAlpha(0);
    if (!this._activeVisual.destroyed) this._activeVisual.setAlpha(0);
    if (!this._baseGlow.destroyed) this._baseGlow.setAlpha(0.25);
    if (this._warnTween) { try { this._warnTween.stop(); } catch(_){} this._warnTween = null; }
  }

  _enterWarning() {
    this._phase = 'WARNING';
    this._phaseTimer = 1800;
    if (!this._baseGlow.destroyed) this._baseGlow.setAlpha(0);
    if (!this._warnGlow.destroyed) {
      this._warnTween = this.scene.tweens.add({
        targets: this._warnGlow,
        alpha: { from: 0, to: 0.85 },
        duration: 200,
        yoyo: true,
        repeat: -1,
      });
    }
  }

  _enterActive(player, activeEnemies) {
    this._phase = 'ACTIVE';
    this._phaseTimer = 2200;
    if (this._warnTween) { try { this._warnTween.stop(); } catch(_){} this._warnTween = null; }
    if (!this._warnGlow.destroyed) this._warnGlow.setAlpha(0);
    if (!this._activeVisual.destroyed) this._activeVisual.setAlpha(0.9);
    this.scene.cameras.main.shake(200, 0.008);

    // Partículas de erupção
    for (let i = 0; i < 6; i++) {
      const p = this.scene.add.circle(
        this.x + Phaser.Math.Between(-20, 20),
        this.y,
        Phaser.Math.Between(3, 7),
        0xF2C56D, 0.9
      ).setDepth(15);
      this.scene.tweens.add({
        targets: p,
        y: this.y - Phaser.Math.Between(40, 100),
        x: p.x + Phaser.Math.Between(-30, 30),
        alpha: 0,
        duration: Phaser.Math.Between(400, 800),
        delay: i * 80,
        onComplete: () => { try { p.destroy(); } catch(_){} },
      });
    }
  }

  _enterRecovery() {
    this._phase = 'RECOVERY';
    this._phaseTimer = 1200;
    if (!this._activeVisual.destroyed) this._activeVisual.setAlpha(0.3);
  }

  _applyDamage(player, activeEnemies) {
    // Dano ao jogador (máximo 1x por ciclo de ativação)
    if (!this._playerHitThisCycle && player && !player.isDead) {
      const d = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
      if (d <= this._radius && player.state !== 'DODGE') {
        this._playerHitThisCycle = true;
        player.takeDamage(18);
        player.statusSystem?.addBuildup('FIRE', 25, player.resistances?.FIRE ?? 0);
        const flash = this.scene.add.circle(player.x, player.y, 20, 0xFF6600, 0.7).setDepth(20);
        this.scene.tweens.add({
          targets: flash, alpha: 0, scaleX: 2, scaleY: 2, duration: 250,
          onComplete: () => { try { flash.destroy(); } catch(_){} },
        });
      }
    }

    // Dano a inimigos sem resistência a FIRE
    if (activeEnemies) {
      for (const e of activeEnemies) {
        if (e.isDead || e.template?.element === 'FIRE') continue;
        const eid = `${Math.round(e.x)}_${Math.round(e.y)}`;
        if (this._enemyHitThisCycle.has(eid)) continue;
        const d = Phaser.Math.Distance.Between(this.x, this.y, e.x, e.y);
        if (d <= this._radius) {
          this._enemyHitThisCycle.add(eid);
          e.takeDamage(10);
        }
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────
// 3.5 JARDIM_PUTRIDO — Planta Tóxica
// Libera nuvem ao receber dano. Detectada por distância.
// ─────────────────────────────────────────────────────────────
export class ToxicPlant extends BaseHazard {
  constructor(scene, x, y) {
    super(scene, x, y);
    this.hp = 40;
    this.isDead = false;
    this._cloudActive = false;
    this._cloudTimer  = 0;
    this._cloudInterval = 800;
    this._nextCloudTick = 0;
    this._cloudRadius   = TILE * 2.5;
    this._cloudDuration = 4000;
    this._hitRadius     = 48; // raio de acerto por ataque do player

    // Visual da planta
    this._stem = this._track(
      scene.add.rectangle(x, y + 4, 6, 14, 0x526C46, 1).setDepth(3)
    );
    this._head = this._track(
      scene.add.circle(x, y - 6, 10, 0x789655, 1).setDepth(4)
    );
    this._spores = this._track(
      scene.add.circle(x, y - 6, 4, 0xA5B96F, 0.7).setDepth(5)
    );
    // Nuvem visual (inicialmente invisível)
    this._cloudVisual = this._track(
      scene.add.circle(x, y, this._cloudRadius, 0x789655, 0).setDepth(2)
    );
    this._cloudTween = null;
  }

  takeDamage(amount) {
    if (this.isDead) return;
    this.hp -= amount;
    if (this._head && !this._head.destroyed) {
      this._head.setFillStyle(0xFFFFFF, 1);
      this.scene.time.delayedCall(100, () => {
        if (this._head && !this._head.destroyed) this._head.setFillStyle(0x789655, 1);
      });
    }
    if (this.hp <= 0) this._release();
  }

  _release() {
    if (this.isDead) return;
    this.isDead = true;
    if (this._stem && !this._stem.destroyed) this._stem.setAlpha(0.3);
    if (this._head && !this._head.destroyed) this._head.setAlpha(0.2);
    if (this._spores && !this._spores.destroyed) this._spores.setAlpha(0);

    this._cloudActive = true;
    this._cloudTimer  = this._cloudDuration;
    this._nextCloudTick = 0;

    if (this._cloudVisual && !this._cloudVisual.destroyed) {
      this._cloudVisual.setAlpha(0.50);
      this._cloudTween = this.scene.tweens.add({
        targets: this._cloudVisual,
        scaleX: 1.3, scaleY: 1.3,
        alpha: { from: 0.5, to: 0.3 },
        duration: 600, yoyo: true, repeat: -1,
      });
    }
  }

  update(delta, player, activeEnemies) {
    if (!this._cloudActive) return;

    this._cloudTimer   -= delta;
    this._nextCloudTick -= delta;

    if (this._cloudTimer <= 0) {
      this._cloudActive = false;
      if (this._cloudTween) { try { this._cloudTween.stop(); } catch(_){} }
      if (this._cloudVisual && !this._cloudVisual.destroyed) this._cloudVisual.setAlpha(0);
      return;
    }

    if (this._nextCloudTick <= 0) {
      this._nextCloudTick = this._cloudInterval;

      // Veneno ao jogador
      if (player && !player.isDead) {
        const d = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
        if (d <= this._cloudRadius) {
          player.statusSystem?.addBuildup('POISON', 20, player.resistances?.POISON ?? 0);
        }
      }

      // Veneno a inimigos
      if (activeEnemies) {
        for (const e of activeEnemies) {
          if (e.isDead || e.template?.element === 'POISON') continue;
          const d = Phaser.Math.Distance.Between(this.x, this.y, e.x, e.y);
          if (d <= this._cloudRadius) e.takeDamage(4);
        }
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────
// 3.6 CIDADE_SUBTERRANEA — Lanterna e Passagem Condicional
// ─────────────────────────────────────────────────────────────
export class LanternBridge extends BaseHazard {
  constructor(scene, x, y, bridgeX, bridgeY, bridgeW = TILE * 3, bridgeH = TILE) {
    super(scene, x, y);
    this.lit      = false;
    this._bridgeX = bridgeX;
    this._bridgeY = bridgeY;
    this._bridgeW = bridgeW;
    this._bridgeH = bridgeH;
    this._interactRadius = 60;
    this._promptText = null;

    // Visual da lanterna
    this._lanternBase = this._track(
      scene.add.rectangle(x, y, 12, 18, 0x76889C, 1).setDepth(4)
    );
    this._lanternFlame = this._track(
      scene.add.circle(x, y - 12, 7, 0x444444, 0.4).setDepth(5)
    );

    // Passagem bloqueada visualmente (escura)
    this._bridge = this._track(
      scene.add.rectangle(bridgeX, bridgeY, bridgeW, bridgeH, 0x1E1B2C, 0.90).setDepth(2)
    );

    // Corpo de bloqueio da passagem (retângulo sobre o tilemap)
    // Usamos um rectangle + overlap para bloquear o player
    this._blockerActive = true;
    this._blockerRect = new Phaser.Geom.Rectangle(
      bridgeX - bridgeW / 2, bridgeY - bridgeH / 2,
      bridgeW, bridgeH
    );

    // Raio de luz (desligado inicialmente)
    this._lightRadius = this._track(
      scene.add.circle(x, y, 80, 0xD8C98F, 0).setDepth(1)
    );
  }

  /** Verifica se o jogador está tentando cruzar a passagem bloqueada */
  isBlockingPlayer(player) {
    if (!this._blockerActive || this.lit) return false;
    return this._blockerRect.contains(player.x, player.y);
  }

  light() {
    if (this.lit) return;
    this.lit = true;
    this._blockerActive = false;

    if (this._lanternFlame && !this._lanternFlame.destroyed) {
      this._lanternFlame.setFillStyle(0xD8C98F, 1);
    }
    if (this._lightRadius && !this._lightRadius.destroyed) {
      this._lightRadius.setAlpha(0.25);
      this.scene.tweens.add({
        targets: this._lightRadius,
        scaleX: 1.2, scaleY: 1.2,
        alpha: { from: 0.25, to: 0.15 },
        duration: 900, yoyo: true, repeat: -1,
      });
    }
    if (this._bridge && !this._bridge.destroyed) {
      this._bridge.setFillStyle(0x48566D, 0.6);
    }

    // Flash de abertura
    const flash = this.scene.add.rectangle(
      this._bridgeX, this._bridgeY, this._bridgeW, this._bridgeH, 0xD8C98F, 0.6
    ).setDepth(10);
    this.scene.tweens.add({
      targets: flash, alpha: 0, duration: 500,
      onComplete: () => { try { flash.destroy(); } catch(_){} },
    });

    if (this._promptText && !this._promptText.destroyed) {
      try { this._promptText.destroy(); } catch(_){}
      this._promptText = null;
    }
  }

  checkPlayerProximity(player, interactKey) {
    if (this.lit || !player || player.isDead) return;
    const d = Phaser.Math.Distance.Between(player.x, player.y, this.x, this.y);
    if (d < this._interactRadius) {
      if (!this._promptText || this._promptText.destroyed) {
        this._promptText = this.scene.add.text(
          this.x, this.y - 30, '[G] Acender Lanterna',
          {
            fontFamily: 'Inter', fontSize: '10px', color: '#D8C98F',
            backgroundColor: '#000000cc', padding: { x: 4, y: 2 }
          }
        ).setOrigin(0.5).setDepth(200);
        this._track(this._promptText);
      }
      if (interactKey && Phaser.Input.Keyboard.JustDown(interactKey)) {
        this.light();
      }
    } else {
      if (this._promptText && !this._promptText.destroyed) {
        try { this._promptText.destroy(); } catch(_){}
        this._promptText = null;
      }
    }
  }

  /** Empurra o jogador para fora da passagem bloqueada */
  update(delta, player) {
    if (!player || player.isDead || !this._blockerActive || this.lit) return;
    if (this.isBlockingPlayer(player)) {
      // Empurra de volta
      const cx = this._blockerRect.centerX;
      const cy = this._blockerRect.centerY;
      const angle = Math.atan2(player.y - cy, player.x - cx);
      if (player.body) {
        player.body.velocity.x = Math.cos(angle) * 120;
        player.body.velocity.y = Math.sin(angle) * 120;
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────
// 3.7 ABISMO_CRISTALINO — Cristal Refletor
// Reflete projéteis mágicos em ângulo reto.
// ─────────────────────────────────────────────────────────────
export class CrystalReflector extends BaseHazard {
  constructor(scene, x, y, orientation = 'H') {
    super(scene, x, y, { orientation });
    this._orientation = orientation; // 'H' horizontal ou 'V' vertical
    this._reflectCount = 0;
    this.MAX_REFLECT   = 4;
    this._radius = TILE * 0.8;

    const color = 0x6EADB7;
    this._visual = this._track(
      scene.add.rectangle(
        x, y,
        orientation === 'H' ? TILE * 1.5 : TILE * 0.4,
        orientation === 'H' ? TILE * 0.4 : TILE * 1.5,
        color, 0.85
      ).setDepth(4)
    );
    scene.tweens.add({
      targets: this._visual,
      alpha: { from: 0.7, to: 1.0 },
      duration: 800 + Math.random() * 600,
      yoyo: true, repeat: -1,
    });
  }

  /**
   * Chama quando um projétil atinge o cristal.
   * Retorna true se foi refletido.
   */
  reflectProjectile(projectile) {
    if (!projectile || this._reflectCount >= this.MAX_REFLECT) return false;
    this._reflectCount++;

    if (this._orientation === 'H') {
      projectile.vy = -projectile.vy;
    } else {
      projectile.vx = -projectile.vx;
    }

    const flash = this.scene.add.circle(this.x, this.y, 18, 0xD6E8F1, 0.8).setDepth(20);
    this.scene.tweens.add({
      targets: flash, alpha: 0, scaleX: 2, scaleY: 2, duration: 200,
      onComplete: () => { try { flash.destroy(); } catch(_){} },
    });

    this.scene.time.delayedCall(3000, () => {
      this._reflectCount = Math.max(0, this._reflectCount - 1);
    });
    return true;
  }

  /** Verifica se um projétil está suficientemente próximo para colidir */
  checkProjectileCollision(proj) {
    const d = Phaser.Math.Distance.Between(this.x, this.y, proj.x, proj.y);
    return d <= this._radius;
  }
}

// ─────────────────────────────────────────────────────────────
// 3.8 CARCERE_DE_SANGUE — Poça de Sangue
// ─────────────────────────────────────────────────────────────
export class BloodPool extends BaseHazard {
  constructor(scene, x, y, radius = TILE * 1.5) {
    super(scene, x, y, { radius });
    this._radius     = radius;
    this._playerTick = 0;
    this._healTick   = 0;
    this._PLAYER_INTERVAL = 600;
    this._HEAL_INTERVAL   = 1200;

    // Visual: poça de sangue coagulado em ASCII denso
    if (scene.textures.exists('liquid_blood')) {
      this._visual = this._track(
        scene.add.image(x, y, 'liquid_blood').setDepth(2).setScale(radius / 16).setAlpha(0.75)
      );
    } else {
      this._visual = this._track(
        scene.add.circle(x, y, radius, 0x9C4C52, 0.60).setDepth(2)
      );
    }
    scene.tweens.add({
      targets: this._visual,
      alpha: { from: 0.55, to: 0.85 },
      scaleX: { from: 0.95, to: 1.05 },
      scaleY: { from: 0.95, to: 1.05 },
      duration: 1400, yoyo: true, repeat: -1,
    });
  }

  update(delta, player, activeEnemies) {
    this._playerTick -= delta;
    this._healTick   -= delta;

    // Drena stamina do jogador
    if (player && !player.isDead) {
      const d = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
      if (d <= this._radius) {
        player.activeHazardEffect = 'BLOOD';
        if (this._playerTick <= 0) {
          this._playerTick = this._PLAYER_INTERVAL;
          player.staminaSystem?.forceSpend(6);
        }
      } else if (this._playerTick <= 0) {
        this._playerTick = 50;
      }
    }

    // Regenera HP dos inimigos
    if (this._healTick <= 0) {
      this._healTick = this._HEAL_INTERVAL;
      if (activeEnemies) {
        for (const e of activeEnemies) {
          if (e.isDead) continue;
          const d = Phaser.Math.Distance.Between(this.x, this.y, e.x, e.y);
          if (d <= this._radius && e.hp < e.maxHP) {
            const heal = Math.min(e.maxHP - e.hp, Math.floor(e.maxHP * 0.04));
            e.hp = Math.min(e.maxHP, e.hp + heal);
            const hTxt = this.scene.add.text(e.x, e.y - 16, `+${heal}`, {
              fontFamily: 'Inter', fontSize: '10px', color: '#cc2244',
              stroke: '#000', strokeThickness: 2,
            }).setDepth(30);
            this.scene.tweens.add({
              targets: hTxt, y: hTxt.y - 20, alpha: 0, duration: 700,
              onComplete: () => { try { hTxt.destroy(); } catch(_){} },
            });
          }
        }
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────
// 3.9 BIBLIOTECA_DO_OCULTO — Porta Ilusória
// ─────────────────────────────────────────────────────────────
export class IllusionDoor extends BaseHazard {
  constructor(scene, x, y, targetRoomIndex, rng) {
    super(scene, x, y, { targetRoomIndex });
    this._targetRoomIndex = targetRoomIndex;
    this._activated = false;
    this._clue      = rng.pick(['A', 'B', 'C']);
    this._playerNear = false;

    // Visual: porta com brilho sutil
    this._doorVisual = this._track(
      scene.add.rectangle(x, y, TILE, TILE * 2, 0x312844, 0.9).setDepth(3)
    );
    // Símbolo-pista que diferencia portas ilusórias
    const clueColors = { A: 0x796395, B: 0x729DA9, C: 0x52406B };
    this._clueSymbol = this._track(
      scene.add.circle(x, y, 6, clueColors[this._clue] ?? 0x796395, 0.6).setDepth(4)
    );
    scene.tweens.add({
      targets: this._clueSymbol,
      alpha: { from: 0.2, to: 0.8 },
      duration: 1800, yoyo: true, repeat: -1,
    });
  }

  activate(scene, onTransport) {
    if (this._activated) return;
    this._activated = true;

    const flash = scene.add.rectangle(this.x, this.y, TILE * 3, TILE * 3, 0x796395, 0.8).setDepth(50);
    scene.tweens.add({
      targets: flash, alpha: 0, duration: 400,
      onComplete: () => {
        try { flash.destroy(); } catch(_){}
        onTransport(this._targetRoomIndex);
      },
    });
  }
}

// ─────────────────────────────────────────────────────────────
// 3.10 CORACAO_DO_ABISMO — Zona Gravitacional
// ─────────────────────────────────────────────────────────────
export class GravityZone extends BaseHazard {
  constructor(scene, x, y, radius = TILE * 3) {
    super(scene, x, y, { radius });
    this._radius       = radius;
    this._playerInside = false;
    this._pullStrength = 25; // px/s de atração ao centro

    // Visuais
    this._outerRing = this._track(
      scene.add.circle(x, y, radius, 0x3E4075, 0.20).setDepth(1)
    );
    this._innerRing = this._track(
      scene.add.circle(x, y, radius * 0.6, 0x6555A4, 0.30).setDepth(2)
    );
    this._core = this._track(
      scene.add.circle(x, y, radius * 0.25, 0x70D8D0, 0.55).setDepth(3)
    );
    // Borda visual (Graphics)
    const borderGfx = scene.add.graphics().setDepth(2);
    borderGfx.lineStyle(2, 0x6555A4, 0.55);
    borderGfx.strokeCircle(x, y, radius);
    this._track(borderGfx);

    // Animações pulsantes
    scene.tweens.add({
      targets: this._outerRing,
      scaleX: 1.15, scaleY: 1.15,
      alpha: { from: 0.15, to: 0.30 },
      duration: 1200, yoyo: true, repeat: -1,
    });
    scene.tweens.add({
      targets: this._core,
      scaleX: 0.8, scaleY: 0.8,
      alpha: { from: 0.4, to: 0.7 },
      duration: 800, yoyo: true, repeat: -1,
    });
  }

  update(delta, player) {
    if (!player || player.isDead) {
      if (this._playerInside) this._onPlayerExit(player);
      return;
    }

    const d = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    const inside = d <= this._radius;

    if (inside && !this._playerInside) {
      this._onPlayerEnter(player);
    } else if (!inside && this._playerInside) {
      this._onPlayerExit(player);
    }

    if (inside) {
      player.activeHazardEffect = 'GRAVITY';
      // Atração gravitacional suave ao centro (exceto durante dodge)
      if (player.state !== 'DODGE' && player.body) {
        const angle = Math.atan2(this.y - player.y, this.x - player.x);
        const pull  = (this._pullStrength * delta) / 1000;
        player.body.velocity.x += Math.cos(angle) * pull;
        player.body.velocity.y += Math.sin(angle) * pull;
      }
    }
  }

  _onPlayerEnter(player) {
    this._playerInside = true;
    player.activeHazardEffect = 'GRAVITY';
    try {
      this.scene.hud?.showNotification('Anomalia Gravitacional', '#70D8D0', 1800);
    } catch (_) {}
  }

  _onPlayerExit(player) {
    this._playerInside = false;
    if (player && player.activeHazardEffect === 'GRAVITY') {
      player.activeHazardEffect = null;
    }
  }
}

// ─────────────────────────────────────────────────────────────
// EnvironmentalHazardManager
// ─────────────────────────────────────────────────────────────
export class EnvironmentalHazardManager {
  constructor(scene) {
    this.scene    = scene;
    this._hazards = [];
    this._fragileTriggered = 0;
  }

  add(hazard) {
    this._hazards.push(hazard);
    return hazard;
  }

  /**
   * Cria perigos de acordo com o bioma e a sala.
   * Percorre os tiles HAZARD (valor 11) no grid da sala.
   */
  populate(biomeId, room, rng) {
    const { grid, tileW, tileH } = room.data;

    for (let y = 0; y < tileH; y++) {
      for (let x = 0; x < tileW; x++) {
        if (grid[y][x] !== 11 /* TILE_TYPES.HAZARD */) continue;
        const wx = x * TILE + TILE / 2;
        const wy = y * TILE + TILE / 2;
        this._createBiomeHazard(biomeId, wx, wy, rng, room);
      }
    }
  }

  _createBiomeHazard(biomeId, wx, wy, rng, room) {
    switch (biomeId) {
      case 'ARREDORES_CINZENTOS':
        this.add(new AshPatch(this.scene, wx, wy));
        break;
      case 'AQUEDUTO_SUBMERSO': {
        const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        const [dx, dy] = rng.pick(dirs);
        this.add(new CurrentZone(this.scene, wx, wy, dx, dy, 120, TILE * 3, TILE));
        break;
      }
      case 'CATACUMBAS_ECOANTES':
        this.add(new FragileFloor(this.scene, wx, wy));
        break;
      case 'FORJA_MACULADA':
        this.add(new ThermalEruption(this.scene, wx, wy));
        break;
      case 'JARDIM_PUTRIDO':
        this.add(new ToxicPlant(this.scene, wx, wy));
        break;
      case 'CIDADE_SUBTERRANEA': {
        const bx = Math.min(wx + TILE * 3, (room.data.tileW - 2) * TILE);
        this.add(new LanternBridge(this.scene, wx, wy, bx, wy, TILE * 2, TILE));
        break;
      }
      case 'ABISMO_CRISTALINO': {
        const ori = rng.next() < 0.5 ? 'H' : 'V';
        this.add(new CrystalReflector(this.scene, wx, wy, ori));
        break;
      }
      case 'CARCERE_DE_SANGUE':
        this.add(new BloodPool(this.scene, wx, wy, TILE * 1.8));
        break;
      case 'BIBLIOTECA_DO_OCULTO': {
        const totalRooms = room._totalRooms ?? 8;
        const targetId   = rng.int(0, Math.max(0, totalRooms - 1));
        this.add(new IllusionDoor(this.scene, wx, wy, targetId, rng));
        break;
      }
      case 'CORACAO_DO_ABISMO':
        this.add(new GravityZone(this.scene, wx, wy, TILE * 3.5));
        break;
      default:
        break;
    }
  }

  /** Chamado no update() da GameScene. */
  update(delta, player, activeEnemies) {
    for (const h of this._hazards) {
      if (!h.alive) continue;
      try {
        h.update(delta, player, activeEnemies);
      } catch (_) {
        // Silencia erros de objetos já destruídos
      }
    }

    // Lanternas: verificação de proximidade do jogador
    if (this.scene.keys?.interact) {
      for (const h of this._hazards) {
        if (h instanceof LanternBridge && h.alive) {
          h.checkPlayerProximity(player, this.scene.keys.interact);
        }
      }
    }
  }

  /** Plantas tóxicas vivas (para receber dano de ataques). */
  getToxicPlants() {
    return this._hazards.filter(h => h instanceof ToxicPlant && !h.isDead && h.alive);
  }

  /** Pisos frágeis não quebrados. */
  getFragileFloors() {
    return this._hazards.filter(h => h instanceof FragileFloor && !h.broken && h.alive);
  }

  /** Cristais vivos (para reflexão de projéteis). */
  getCrystals() {
    return this._hazards.filter(h => h instanceof CrystalReflector && h.alive);
  }

  /** Portas ilusórias não ativadas. */
  getIllusionDoors() {
    return this._hazards.filter(h => h instanceof IllusionDoor && !h._activated && h.alive);
  }

  /** Número de provocações de pisos frágeis já realizadas na sala. */
  get fragileTriggered() { return this._fragileTriggered; }

  /** Remove todos os hazards — chamado em _clearRoom(). */
  destroy() {
    for (const h of this._hazards) {
      try { h.destroy(); } catch (_) {}
    }
    this._hazards = [];
    this._fragileTriggered = 0;
  }
}
