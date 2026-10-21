// ============================================================
// entities/Boss.js
// Boss com fases, IA avançada e barra de HP dedicada.
// Cada boss tem padrões de ataque, habilidades especiais e
// interações ambientais definidas pelo template do bioma.
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

    this.setScale(1.4);
    this.setDepth(10);
    this.body.setSize(44, 44);
    this.body.setOffset(18, 24);

    const bossKey = `boss_${template.id}`;
    if (scene.textures.exists(bossKey)) {
      this.setTexture(bossKey);
    }
    this.clearTint();

    this._bossState = BOSS_STATE.INTRO;
    this._phase = 1;
    this._actionTimer = 0;
    this._actionCooldown = 0;
    this._enragedTint = false;
    this._specialCooldown = 0;

    // Padrões de ataque do template (sequência cíclica)
    this._attackPatterns = template.attackPatterns ?? ['LIGHT', 'LIGHT', 'HEAVY', 'CHARGE'];
    this._patternIndex   = 0;

    // Contador determinístico para decisões (evita Math.random)
    this._decisionCounter = 0;

    // Habilidades especiais do boss
    this._canLifesteal = template.canLifesteal ?? false;
    this._lifestealPct = template.lifestealPct ?? 0;
    this._canTeleport  = template.canTeleport ?? false;

    // Intro: breve pausa antes de atacar
    scene.time.delayedCall(1500, () => {
      this._bossState = BOSS_STATE.PHASE1;
      scene.events.emit('boss:entered', { boss: this });
    });

    // Aura visual do boss
    this._aura = scene.add.circle(x, y, 50, template.color ?? 0xff5500, 0.12).setDepth(8);
    this._auraScale = 1;
  }

  /** Retorna um valor pseudo-determinístico entre 0 e 1 baseado no contador interno */
  _nextDecision() {
    this._decisionCounter++;
    // Simples hash determinístico para evitar Math.random()
    const h = (this._decisionCounter * 2654435761) >>> 0;
    return (h & 0xFFFF) / 0x10000;
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
    const threshold = this.template.phase2Threshold ?? BALANCE.BOSS.PHASE2_THRESHOLD;
    if (this._phase === 1 && hpPct <= threshold) {
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
    if (this._specialCooldown > 0) this._specialCooldown -= delta;
    if (this._actionCooldown > 0) this._actionCooldown -= delta;

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
  }

  _phase2AI(delta, player, dist) {
    const attackRange = this.template.attackRange ?? 65;
    const spd = (this.template.speed ?? 85) * (this.template.phase2SpeedMult ?? 1.3);

    // Habilidades especiais na fase 2
    if (this._specialCooldown <= 0) {
      const tried = this._trySpecialAbility(player, dist);
      if (tried) return;
    }

    if (dist <= attackRange && this._actionCooldown <= 0) {
      // Fase 2: padrão mais agressivo com decisão determinística
      const action = this._nextDecision();
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
  }

  // ── Habilidades especiais por tipo de boss ──────────────────

  _trySpecialAbility(player, dist) {
    const behavior = this.template.behavior ?? 'BOSS_ASHEN';

    switch (behavior) {
      case 'BOSS_VAMPIRE':
        return this._abilityLifesteal(player, dist);
      case 'BOSS_LIBRARIAN':
        return this._abilityTeleport(player);
      case 'BOSS_FLOWER':
        return this._abilitySporeCloud(player);
      case 'BOSS_FORGER':
        return this._abilityGroundSlam(player);
      case 'BOSS_LEVIATHAN':
        return this._abilityTidalPush(player);
      case 'BOSS_AMALGAM':
        return this._abilityBoneShatter(player);
      case 'BOSS_CRYSTAL':
        return this._abilityPrismaticBurst(player);
      case 'BOSS_KING':
        return this._abilityRoyalGuard(player);
      case 'BOSS_FINAL':
        return this._abilityGravityPulse(player);
      default:
        return false;
    }
  }

  /** Vampiro: drena vida do jogador e se cura */
  _abilityLifesteal(player, dist) {
    if (dist > 80 || this._nextDecision() > 0.4) return false;
    this._specialCooldown = 5000;

    this.setTint(0xff0044);
    const flash = this.scene.add.circle(this.x, this.y, 40, 0x9C4C52, 0.5).setDepth(20);
    this.scene.tweens.add({
      targets: flash, alpha: 0, scaleX: 2.5, scaleY: 2.5, duration: 400,
      onComplete: () => { try { flash.destroy(); } catch(_){} },
    });

    this.scene.time.delayedCall(300, () => {
      if (this.isDead || player.isDead) return;
      const d = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
      if (d > 100 || player.state === 'DODGE') return;

      const damage = 25;
      player.takeDamage(damage);
      const heal = Math.floor(damage * (this._lifestealPct || 0.15));
      this.hp = Math.min(this.maxHP, this.hp + heal);

      // Visual de cura
      const healTxt = this.scene.add.text(this.x, this.y - 20, `+${heal}`, {
        fontFamily: 'Inter', fontSize: '12px', color: '#cc2244',
        stroke: '#000', strokeThickness: 2,
      }).setDepth(30);
      this.scene.tweens.add({
        targets: healTxt, y: healTxt.y - 30, alpha: 0, duration: 600,
        onComplete: () => { try { healTxt.destroy(); } catch(_){} },
      });
    });

    this.scene.time.delayedCall(500, () => { if (!this.isDead) this.setTint(this._baseColor); });
    return true;
  }

  /** Bibliotecário: teletransporta para posição atrás do jogador */
  _abilityTeleport(player) {
    if (this._nextDecision() > 0.35) return false;
    this._specialCooldown = 4000;

    // Flash de desaparecimento
    this.setAlpha(0);
    const disappear = this.scene.add.circle(this.x, this.y, 30, 0x796395, 0.7).setDepth(20);
    this.scene.tweens.add({
      targets: disappear, alpha: 0, scaleX: 2, scaleY: 2, duration: 300,
      onComplete: () => { try { disappear.destroy(); } catch(_){} },
    });

    this.scene.time.delayedCall(400, () => {
      if (this.isDead) return;
      // Teleporta atrás do jogador
      const angle = player.facingAngle + Math.PI;
      const dist = 60;
      const nx = player.x + Math.cos(angle) * dist;
      const ny = player.y + Math.sin(angle) * dist;
      this.setPosition(nx, ny);
      this.setAlpha(1);

      // Flash de aparecimento
      const appear = this.scene.add.circle(nx, ny, 30, 0x796395, 0.7).setDepth(20);
      this.scene.tweens.add({
        targets: appear, alpha: 0, scaleX: 2, scaleY: 2, duration: 300,
        onComplete: () => { try { appear.destroy(); } catch(_){} },
      });

      // Ataque imediato após teleporte
      this.scene.time.delayedCall(200, () => {
        if (!this.isDead) this._doLightBossAttack(player);
      });
    });

    return true;
  }

  /** Flor Cadavérica: libera nuvem de esporos de veneno */
  _abilitySporeCloud(player) {
    if (this._nextDecision() > 0.30) return false;
    this._specialCooldown = 6000;

    this.setTint(0x88ff44);
    const cloud = this.scene.add.circle(this.x, this.y, 80, 0x789655, 0.5).setDepth(2);
    this.scene.tweens.add({
      targets: cloud, scaleX: 1.5, scaleY: 1.5, alpha: 0.2,
      duration: 3000,
      onComplete: () => { try { cloud.destroy(); } catch(_){} },
    });

    // Dano de veneno periódico por 3 segundos
    let ticks = 0;
    const poisonInterval = this.scene.time.addEvent({
      delay: 500,
      callback: () => {
        ticks++;
        if (ticks > 6 || this.isDead) { poisonInterval.destroy(); return; }
        const d = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
        if (d < 120 && !player.isDead) {
          player.statusSystem?.addBuildup('POISON', 25, player.resistances?.POISON ?? 0);
        }
      },
      loop: true,
    });

    this.scene.time.delayedCall(600, () => { if (!this.isDead) this.setTint(this._baseColor); });
    return true;
  }

  /** Forjador Insano: batida no chão que cria onda de calor */
  _abilityGroundSlam(player) {
    if (this._nextDecision() > 0.35) return false;
    this._specialCooldown = 5500;

    this.body.setVelocity(0, 0);
    this.setTint(0xffaa00);
    this.scene.cameras.main.shake(300, 0.012);

    // Onda de impacto visual
    const wave = this.scene.add.circle(this.x, this.y, 20, 0xF2C56D, 0.7).setDepth(15);
    this.scene.tweens.add({
      targets: wave, scaleX: 6, scaleY: 6, alpha: 0,
      duration: 500,
      onComplete: () => { try { wave.destroy(); } catch(_){} },
    });

    this.scene.time.delayedCall(350, () => {
      if (this.isDead || player.isDead) return;
      const d = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
      if (d < 130 && player.state !== 'DODGE') {
        player.takeDamage(30);
        player.statusSystem?.addBuildup('FIRE', 35, player.resistances?.FIRE ?? 0);
      }
    });

    this.scene.time.delayedCall(700, () => { if (!this.isDead) this.setTint(this._baseColor); });
    return true;
  }

  /** Leviatã Raso: empurrão de onda d'água em cone */
  _abilityTidalPush(player) {
    if (this._nextDecision() > 0.40) return false;
    this._specialCooldown = 4500;

    this.setTint(0x62968E);
    const wave = this.scene.add.circle(this.x, this.y, 30, 0x376B70, 0.6).setDepth(15);
    this.scene.tweens.add({
      targets: wave, scaleX: 5, scaleY: 5, alpha: 0, duration: 600,
      onComplete: () => { try { wave.destroy(); } catch(_){} },
    });

    this.scene.time.delayedCall(300, () => {
      if (this.isDead || player.isDead) return;
      const d = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
      if (d < 150 && player.state !== 'DODGE' && player.body) {
        const pushAngle = Math.atan2(player.y - this.y, player.x - this.x);
        player.body.setVelocity(Math.cos(pushAngle) * 250, Math.sin(pushAngle) * 250);
        player.takeDamage(15);
        this.scene.time.delayedCall(200, () => {
          if (player.body && !player.isDead) player.body.setVelocity(0, 0);
        });
      }
    });

    this.scene.time.delayedCall(600, () => { if (!this.isDead) this.setTint(this._baseColor); });
    return true;
  }

  /** Amálgama de Ossos: dispersa fragmentos que causam sangramento */
  _abilityBoneShatter(player) {
    if (this._nextDecision() > 0.35) return false;
    this._specialCooldown = 4000;

    this.body.setVelocity(0, 0);
    this.setTint(0xD4C6A7);
    this.scene.cameras.main.shake(200, 0.008);

    for (let i = 0; i < 5; i++) {
      const angle = (Math.PI * 2 * i) / 5;
      const frag = this.scene.add.rectangle(
        this.x, this.y, 8, 8, 0xD4C6A7, 0.9
      ).setDepth(20);

      this.scene.tweens.add({
        targets: frag,
        x: this.x + Math.cos(angle) * 120,
        y: this.y + Math.sin(angle) * 120,
        alpha: 0, duration: 500, delay: i * 60,
        onUpdate: () => {
          if (player.isDead) return;
          const d = Phaser.Math.Distance.Between(frag.x, frag.y, player.x, player.y);
          if (d < 30 && player.state !== 'DODGE') {
            player.takeDamage(12);
            player.statusSystem?.addBuildup('BLEED', 20, player.resistances?.BLEED ?? 0);
          }
        },
        onComplete: () => { try { frag.destroy(); } catch(_){} },
      });
    }

    this.scene.time.delayedCall(600, () => { if (!this.isDead) this.setTint(this._baseColor); });
    return true;
  }

  /** Cristal Matriz: explosão prismática em 4 direções */
  _abilityPrismaticBurst(player) {
    if (this._nextDecision() > 0.35) return false;
    this._specialCooldown = 4500;

    this.setTint(0xD6E8F1);
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    for (const [dx, dy] of dirs) {
      const beam = this.scene.add.rectangle(
        this.x, this.y, 12, 12, 0x6EADB7, 0.8
      ).setDepth(20);

      this.scene._activeProjectiles.push({
        obj: beam,
        vx: dx * 450,
        vy: dy * 450,
        life: 400,
        isEnemy: true,
        damage: 20,
        element: 'MAGIC',
        elementBuildup: 15,
        hitSet: new Set()
      });
    }

    this.scene.time.delayedCall(500, () => { if (!this.isDead) this.setTint(this._baseColor); });
    return true;
  }

  /** Rei dos Mendigos: guarda real — contra-ataque se o jogador atacar */
  _abilityRoyalGuard(player) {
    if (this._nextDecision() > 0.30) return false;
    this._specialCooldown = 5000;

    // Postura de guarda
    this.body.setVelocity(0, 0);
    this.setTint(0xD8C98F);

    const guardVisual = this.scene.add.circle(this.x, this.y, 30, 0xD8C98F, 0.3).setDepth(15);
    this.scene.tweens.add({
      targets: guardVisual,
      alpha: { from: 0.3, to: 0.6 },
      duration: 300, yoyo: true, repeat: 2,
      onComplete: () => {
        try { guardVisual.destroy(); } catch(_){}
        if (!this.isDead) {
          this.setTint(this._baseColor);
          // Contra-ataque após a guarda
          this._doChargeAttack(player);
        }
      },
    });
    return true;
  }

  /** Entidade Final: pulso gravitacional que puxa o jogador */
  _abilityGravityPulse(player) {
    if (this._nextDecision() > 0.35) return false;
    this._specialCooldown = 5000;

    this.setTint(0x70D8D0);
    this.scene.cameras.main.shake(400, 0.015);

    const pulse = this.scene.add.circle(this.x, this.y, 40, 0x6555A4, 0.5).setDepth(15);
    this.scene.tweens.add({
      targets: pulse, scaleX: 6, scaleY: 6, alpha: 0, duration: 800,
      onComplete: () => { try { pulse.destroy(); } catch(_){} },
    });

    // Puxa o jogador em direção ao boss
    this.scene.time.delayedCall(200, () => {
      if (this.isDead || player.isDead || !player.body) return;
      if (player.state === 'DODGE') return;
      const d = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
      if (d < 200) {
        const pullAngle = Math.atan2(this.y - player.y, this.x - player.x);
        player.body.setVelocity(Math.cos(pullAngle) * 200, Math.sin(pullAngle) * 200);
        player.takeDamage(10);
        this.scene.time.delayedCall(300, () => {
          if (player.body && !player.isDead) player.body.setVelocity(0, 0);
        });
      }
    });

    this.scene.time.delayedCall(800, () => { if (!this.isDead) this.setTint(this._baseColor); });
    return true;
  }

  // ── Padrões de ataque base ──────────────────────────────────

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
      const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
      if (dist > (this.template.attackRange ?? 65) * 1.5) return;

      this.scene.events.emit('enemy:attack', {
        enemy: this, player,
        damage:      (this.template.attackDamage ?? this.attack) * mult,
        equilDamage: this.template.attackEquil ?? 50,
        isHeavy:     false,
        canBeParried: false,
        element:     this.template.element ?? null,
        elementBuildup: this.template.elementBuildup ?? 15,
      });

      // Lifesteal na fase 2 se disponível
      if (this._canLifesteal && this._phase === 2) {
        const stolen = Math.floor((this.template.attackDamage ?? this.attack) * mult * this._lifestealPct);
        this.hp = Math.min(this.maxHP, this.hp + stolen);
      }
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
        elementBuildup: (this.template.elementBuildup ?? 15) * 2,
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
          elementBuildup: this.template.elementBuildup ?? 20,
        });
      });
    });
  }

  _enterPhase2(player) {
    this._phase = 2;
    this._bossState = BOSS_STATE.PHASE2;
    this._patternIndex = 0;
    this._specialCooldown = 2000; // Pequeno delay antes da primeira habilidade especial

    this.scene.events.emit('boss:phase2', { boss: this });

    // Alterna para textura ASCII da fase 2 enfurecida
    const p2Key = `boss_${this.template.id}_phase2`;
    if (this.scene.textures.exists(p2Key)) {
      this.setTexture(p2Key);
    }

    // Flash dramático
    this.scene.cameras.main.shake(400, 0.02);
    this.setTint(0xffffff);
    this._aura.setFillStyle(0xff2200, 0.25);

    this.scene.time.delayedCall(600, () => {
      if (!this.isDead) {
        this.clearTint();
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

    // Explosão de morte com cores do boss
    const bossColor = this.template.color ?? 0xff5500;
    const colors = [bossColor, 0xff8800, 0xffcc00, 0xffffff];
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
