// ============================================================
// entities/Boss.js
// Boss com fases, IA avançada e barra de HP dedicada.
// ============================================================
import Phaser from 'phaser';
import { Enemy } from './Enemy.js';
import { BALANCE } from '../data/balance.js';

const BOSS_STATE = {
  INTRO:   'INTRO',
  PHASE1:  'PHASE1',
  PHASE2:  'PHASE2',
  STAGGER: 'STAGGER',
  DEAD:    'DEAD',
};

export class Boss extends Enemy {
  constructor(scene, x, y, template) {
    super(scene, x, y, template);

    this.setScale(1.8);
    this.setDepth(10);
    this.body.setSize(36, 36);
    this.body.setOffset(0, 0);

    this._bossState = BOSS_STATE.INTRO;
    this._phase = 1;
    this._actionTimer = 0;
    this._actionCooldown = 0;
    this._enragedTint = false;

    // Padrões de ataque (sequência cíclica)
    this._attackPatterns = ['LIGHT', 'LIGHT', 'HEAVY', 'CHARGE'];
    this._patternIndex   = 0;

    // Intro: breve pausa antes de atacar
    scene.time.delayedCall(1500, () => {
      this._bossState = BOSS_STATE.PHASE1;
      scene.events.emit('boss:entered', { boss: this });
    });

    // Aura visual do boss
    this._aura = scene.add.circle(x, y, 50, template.color ?? 0xff5500, 0.12).setDepth(8);
    this._auraScale = 1;
  }

  updateAI(delta, player) {
    if (this.isDead || !player) return;

    // Atualiza sistemas base
    this.balanceSystem.update(delta);
    const ticks = this.statusSystem.update(delta);
    for (const tick of ticks) this.takeDamage(tick.damage);

    // Aura pulsante
    this._aura.setPosition(this.x, this.y);
    this._auraScale = 1 + Math.sin(Date.now() / 400) * 0.15;
    this._aura.setScale(this._auraScale);

    // Verifica transição de fase
    const hpPct = this.hp / this.maxHP;
    if (this._phase === 1 && hpPct <= BALANCE.BOSS.PHASE2_THRESHOLD) {
      this._enterPhase2(player);
    }

    if (this.balanceSystem.isStaggered) {
      this._bossState = BOSS_STATE.STAGGER;
      this.body.setVelocity(0, 0);
      return;
    } else if (this._bossState === BOSS_STATE.STAGGER) {
      this._bossState = this._phase === 2 ? BOSS_STATE.PHASE2 : BOSS_STATE.PHASE1;
    }

    if ([BOSS_STATE.INTRO, BOSS_STATE.DEAD].includes(this._bossState)) return;

    this._actionTimer += delta;
    const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

    // ── Boss AI por fase ──────────────────────────────────────
    if (this._phase === 2) {
      this._phase2AI(delta, player, dist);
    } else {
      this._phase1AI(delta, player, dist);
    }
  }

  _phase1AI(delta, player, dist) {
    const attackRange = this.template.attackRange ?? 65;

    if (dist <= attackRange && this._actionCooldown <= 0) {
      this._executePattern(player);
    } else {
      // Move em direção ao player
      const spd = this.template.speed ?? 85;
      this._moveToward(player.x, player.y, spd);
    }

    if (this._actionCooldown > 0) this._actionCooldown -= delta;
  }

  _phase2AI(delta, player, dist) {
    const attackRange = this.template.attackRange ?? 65;
    const spd = (this.template.speed ?? 85) * (this.template.phase2SpeedMult ?? 1.3);

    if (dist <= attackRange && this._actionCooldown <= 0) {
      // Fase 2: padrão mais agressivo
      const action = Math.random();
      if (action < 0.35) {
        this._doChargeAttack(player);
      } else if (action < 0.65) {
        this._executePattern(player);
      } else {
        this._doHeavyBossAttack(player);
      }
    } else if (dist > 150) {
      this._moveToward(player.x, player.y, spd * 1.2);
    } else {
      this._moveToward(player.x, player.y, spd);
    }

    if (this._actionCooldown > 0) this._actionCooldown -= delta;
  }

  _executePattern(player) {
    const pattern = this._attackPatterns[this._patternIndex];
    this._patternIndex = (this._patternIndex + 1) % this._attackPatterns.length;

    switch (pattern) {
      case 'LIGHT':  this._doLightBossAttack(player); break;
      case 'HEAVY':  this._doHeavyBossAttack(player); break;
      case 'CHARGE': this._doChargeAttack(player);    break;
    }
  }

  _doLightBossAttack(player) {
    this._actionCooldown = (this.template.attackCooldown ?? 1600) * (this._phase === 2 ? 0.7 : 1);
    this.body.setVelocity(0, 0);

    this.setTint(0xffaa44);
    this.scene.time.delayedCall(200, () => {
      if (!this.isDead) this.setTint(this._baseColor);
    });

    const mult = this._phase === 2 ? (this.template.phase2AttackMult ?? 1.4) : 1;
    this.scene.time.delayedCall(300, () => {
      if (this.isDead || player.isDead) return;
      this.scene.events.emit('enemy:attack', {
        enemy: this, player,
        damage:      (this.template.attackDamage ?? this.attack) * mult,
        equilDamage: this.template.attackEquil ?? 50,
        isHeavy:     false,
        canBeParried: false, // boss não pode ser parried
        element:     this.template.element ?? null,
        elementBuildup: 15,
      });
    });
  }

  _doHeavyBossAttack(player) {
    this._actionCooldown = (this.template.attackCooldown ?? 1600) * 2;
    this.body.setVelocity(0, 0);

    // Telegrafar com mais tempo
    this.setTint(0xff2200);
    this.scene.time.delayedCall(100, () => {
      if (!this.isDead) this.setTint(0xff6600);
    });

    const mult = this._phase === 2 ? (this.template.phase2AttackMult ?? 1.4) : 1;
    this.scene.time.delayedCall(500, () => {
      if (this.isDead || player.isDead) return;
      const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
      if (dist > (this.template.attackRange ?? 65) * 1.6) return;
      this.scene.events.emit('enemy:attack', {
        enemy: this, player,
        damage:      (this.template.heavyAttackDamage ?? this.attack * 2) * mult,
        equilDamage: this.template.heavyAttackEquil ?? 100,
        isHeavy:     true,
        canBeParried: false,
        element:     this.template.element ?? null,
        elementBuildup: 30,
      });
    });

    this.scene.time.delayedCall(600, () => {
      if (!this.isDead) this.setTint(this._baseColor);
    });
  }

  _doChargeAttack(player) {
    this._actionCooldown = (this.template.attackCooldown ?? 1600) * 2.5;

    const angle = Math.atan2(player.y - this.y, player.x - this.x);
    const chargeSpd = 340;

    this.setTint(0xffff00);
    this.scene.time.delayedCall(600, () => {
      if (this.isDead) return;
      this.setTint(0xff4400);
      this.body.setVelocity(Math.cos(angle) * chargeSpd, Math.sin(angle) * chargeSpd);

      // Hit no meio da corrida
      this.scene.time.delayedCall(250, () => {
        if (this.isDead) return;
        this.body.setVelocity(0, 0);
        this.setTint(this._baseColor);

        const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
        if (dist > (this.template.attackRange ?? 65) * 2) return;
        this.scene.events.emit('enemy:attack', {
          enemy: this, player,
          damage:      this.template.chargeAttackDamage ?? this.attack * 1.5,
          equilDamage: this.template.chargeAttackEquil  ?? 80,
          isHeavy:     true,
          canBeParried: false,
          element:     this.template.element ?? null,
          elementBuildup: 20,
        });
      });
    });
  }

  _enterPhase2(player) {
    this._phase = 2;
    this._bossState = BOSS_STATE.PHASE2;
    this._patternIndex = 0;

    this.scene.events.emit('boss:phase2', { boss: this });

    // Flash dramático
    this.scene.cameras.main.shake(400, 0.02);
    this.setTint(0xffffff);
    this._aura.setFillStyle(0xff2200, 0.25);

    this.scene.time.delayedCall(600, () => {
      if (!this.isDead) {
        this.setTint(this._baseColor);
        this._enragedTint = true;
      }
    });
  }

  _die() {
    if (this.isDead) return;
    this.isDead = true;
    this._bossState = BOSS_STATE.DEAD;

    this.body.setVelocity(0, 0);
    this.body.enable = false;

    this._aura?.destroy();
    this.scene.events.emit('boss:died', { boss: this });
    this.scene.cameras.main.shake(600, 0.03);

    // Explosão de morte
    const colors = [0xff5500, 0xff8800, 0xffcc00, 0xffffff];
    for (let i = 0; i < 8; i++) {
      const c = this.scene.add.circle(
        this.x + Phaser.Math.Between(-30, 30),
        this.y + Phaser.Math.Between(-30, 30),
        Phaser.Math.Between(8, 20),
        colors[i % colors.length], 0.8
      ).setDepth(30);
      this.scene.tweens.add({
        targets: c, alpha: 0, scale: 2,
        duration: 600 + i * 80,
        onComplete: () => c.destroy(),
      });
    }

    this.scene.tweens.add({
      targets: this,
      alpha: 0, scale: 0,
      duration: 800,
      delay: 400,
      onComplete: () => this.destroy(),
    });
  }
}
