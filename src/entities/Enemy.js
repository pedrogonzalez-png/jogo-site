// ============================================================
// entities/Enemy.js
// Inimigo com IA básica: patrulha, perseguição, ataque.
// ============================================================
import Phaser from 'phaser';
import { BalanceSystem  } from '../combat/BalanceSystem.js';
import { StatusEffectSystem } from '../combat/StatusEffectSystem.js';
import { BALANCE } from '../data/balance.js';

const AI_STATE = {
  IDLE:    'IDLE',
  PATROL:  'PATROL',
  CHASE:   'CHASE',
  ATTACK:  'ATTACK',
  STAGGER: 'STAGGER',
  DEAD:    'DEAD',
};

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, template) {
    super(scene, x, y, 'enemy');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.template = { ...template };
    this.setDepth(9);
    this.body.setSize(22, 22);
    this.body.setOffset(5, 10);

    // Stats do template
    this.level    = template.level;
    this.maxHP    = template.hp;
    this.hp       = template.hp;
    this.attack   = template.attack;
    this.defense  = template.defense;
    this.isElite  = template.isElite ?? false;
    this.resistances = { ...(template.resistances ?? {}) };

    // Críticos base dos inimigos
    this.critChance     = 0.05;
    this.critMultiplier = 1.4;

    this.balanceSystem = new BalanceSystem(template.equilBalance ?? BALANCE.STAGGER.BASE_BALANCE);
    this.statusSystem  = new StatusEffectSystem();

    // IA
    this._aiState    = AI_STATE.PATROL;
    this._aiTimer    = 0;
    this._attackCooldown = 0;
    this._patrolTarget   = null;
    this._spawnX     = x;
    this._spawnY     = y;

    this.isDead      = false;
    this.isBlocking  = false;
    this.isInvincible = false;

    // XP yield
    this.xpYield = template.xp ?? 30;

    // Seleção de textura ASCII de alta densidade por arquétipo
    let textureKey = 'enemy_skeleton';
    const id = template.id || '';
    if (id.includes('sabujo') || id.includes('vinha')) {
      textureKey = 'enemy_beast';
    } else if (id.includes('sentinela') || id.includes('bruto') || id.includes('golias') || id.includes('guardiao') || id.includes('carcereiro') || id.includes('cavaleiro')) {
      textureKey = 'enemy_guardian';
    } else if (id.includes('mago') || id.includes('sabio') || id.includes('arcanista') || id.includes('espectro') || id.includes('tomo') || id.includes('eco')) {
      textureKey = 'enemy_mage';
    } else if (id.includes('afogado') || id.includes('espreitador')) {
      textureKey = 'enemy_drowned';
    } else if (id.includes('aberracao') || id.includes('anomalia') || id.includes('golem') || id.includes('cristal') || id.includes('ruina') || id.includes('brotar') || id.includes('construto') || id.includes('diabrete') || id.includes('fragmento')) {
      textureKey = 'enemy_aberration';
    } else if (id.includes('esqueleto') || id.includes('carrasco')) {
      textureKey = 'enemy_skeleton';
    }

    if (scene.textures.exists(textureKey)) {
      this.setTexture(textureKey);
    }

    // Efeitos visuais
    this._damageFlashTimer = 0;
    this._baseColor = template.color ?? 0xaa4444;
    this.clearTint();

    // Barra de HP flutuante sobre a cabeça
    this._hpBarBg = scene.add.rectangle(x, y - 18, 28, 4, 0x111111, 0.85).setDepth(15).setVisible(false);
    this._hpBarFill = scene.add.rectangle(x - 14, y - 18, 28, 4, 0xcc2222, 1).setDepth(16).setOrigin(0, 0.5).setVisible(false);

    if (this.isElite) {
      this.setScale(1.2);
      // Indicador visual de elite
      this._eliteGlow = scene.add.circle(x, y, 18, 0xffaa00, 0.25).setDepth(8);
    }

    this._patrolTimer = Phaser.Math.Between(1000, 3000);
  }

  get effectiveAttack()  { return this.attack; }
  get effectiveDefense() { return this.defense; }

  // ── Dano recebido ────────────────────────────────────────────
  takeDamage(amount) {
    if (this.isDead) return;
    if (amount <= 0) return;

    this.hp = Math.max(0, this.hp - amount);

    this._damageFlashTimer = 150;
    this.setTint(0xffffff);

    // Atualiza barra de HP
    if (this._hpBarBg && this._hpBarFill) {
      this._hpBarBg.setVisible(true);
      this._hpBarFill.setVisible(true);
      const pct = Math.max(0, this.hp / this.maxHP);
      this._hpBarFill.setDisplaySize(28 * pct, 4);
      if (pct < 0.3) {
        this._hpBarFill.setFillStyle(0xff2222);
      }
    }

    this.scene.events.emit('enemy:damaged', { enemy: this, amount });

    if (this.hp <= 0) this._die();
  }

  _die() {
    if (this.isDead) return;
    this.isDead    = true;
    this._aiState  = AI_STATE.DEAD;

    this.body.setVelocity(0, 0);
    this.body.enable = false;

    // Oculta/destrói barra de HP
    this._hpBarBg?.destroy();
    this._hpBarFill?.destroy();
    this._hpBarBg = null;
    this._hpBarFill = null;

    this.scene.events.emit('enemy:died', { enemy: this });

    // Animação de morte com dissolução suave
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scaleX: this.scaleX * 1.4,
      scaleY: this.scaleY * 1.4,
      duration: 350,
      onComplete: () => {
        this._eliteGlow?.destroy();
        this.destroy();
      },
    });
  }

  destroy(fromScene) {
    this._hpBarBg?.destroy();
    this._hpBarFill?.destroy();
    this._hpBarBg = null;
    this._hpBarFill = null;
    this._eliteGlow?.destroy();
    super.destroy(fromScene);
  }

  // ── IA ───────────────────────────────────────────────────────
  updateAI(delta, player) {
    if (this.isDead || !player) return;

    this.balanceSystem.update(delta);
    this.weaponSystem?.update?.(delta);

    // Status elemental
    const ticks = this.statusSystem.update(delta);
    for (const tick of ticks) this.takeDamage(tick.damage);

    // Stagger
    if (this.balanceSystem.isStaggered) {
      this._aiState = AI_STATE.STAGGER;
      this.body.setVelocity(0, 0);
    } else if (this._aiState === AI_STATE.STAGGER) {
      this._aiState = AI_STATE.IDLE;
    }

    if (this._aiState === AI_STATE.STAGGER) return;

    // Reduz cooldown de ataque
    if (this._attackCooldown > 0) this._attackCooldown -= delta;

    // Atualiza glow de elite e barra de HP
    if (this._eliteGlow) {
      this._eliteGlow.setPosition(this.x, this.y);
    }
    if (this._hpBarBg && this._hpBarFill) {
      this._hpBarBg.setPosition(this.x, this.y - 18);
      this._hpBarFill.setPosition(this.x - 14, this.y - 18);
    }

    const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

    switch (this.template.behavior) {
      case 'FAST_ATTACK':  this._behaviorFastAttack(delta, player, dist); break;
      case 'GUARDIAN':     this._behaviorGuardian(delta, player, dist);   break;
      default:             this._behaviorChaseAttack(delta, player, dist);
    }

    // Flash de dano
    if (this._damageFlashTimer > 0) {
      this._damageFlashTimer -= delta;
      if (this._damageFlashTimer <= 0) this.setTint(this._baseColor);
    }
  }

  _behaviorChaseAttack(delta, player, dist) {
    const aggroRange  = this.template.aggroRange ?? BALANCE.ENEMY.AGGRO_RANGE;
    const attackRange = this.template.attackRange ?? BALANCE.ENEMY.ATTACK_RANGE;

    if (dist <= attackRange && this._attackCooldown <= 0) {
      this._doAttack(player);
    } else if (dist <= aggroRange) {
      this._chasePlayer(player);
    } else {
      this._patrol(delta);
    }
  }

  _behaviorFastAttack(delta, player, dist) {
    const aggroRange  = (this.template.aggroRange ?? BALANCE.ENEMY.AGGRO_RANGE) * 1.2;
    const attackRange = this.template.attackRange ?? BALANCE.ENEMY.ATTACK_RANGE;

    if (dist <= attackRange && this._attackCooldown <= 0) {
      this._doAttack(player);
    } else if (dist <= aggroRange) {
      const spd = (this.template.speed ?? BALANCE.ENEMY.CHASE_SPEED) * 1.3;
      this._moveToward(player.x, player.y, spd);
    } else {
      this._patrol(delta);
    }
  }

  _behaviorGuardian(delta, player, dist) {
    const aggroRange  = this.template.aggroRange ?? BALANCE.ENEMY.AGGRO_RANGE;
    const attackRange = this.template.attackRange ?? BALANCE.ENEMY.ATTACK_RANGE;

    if (dist <= attackRange * 0.8 && this._attackCooldown <= 0) {
      // Guardian faz ataque pesado baseado em contador determinístico
      this._guardianAttackCounter = (this._guardianAttackCounter ?? 0) + 1;
      const isHeavy = this._guardianAttackCounter % 3 === 0;
      this._doAttack(player, isHeavy);
    } else if (dist <= aggroRange) {
      this._chasePlayer(player, this.template.speed ?? BALANCE.ENEMY.CHASE_SPEED * 0.85);
    } else {
      this.body.setVelocity(0, 0);
    }
  }

  _chasePlayer(player, speed) {
    this._moveToward(player.x, player.y, speed ?? this.template.speed ?? BALANCE.ENEMY.CHASE_SPEED);
  }

  _moveToward(tx, ty, speed) {
    const angle = Math.atan2(ty - this.y, tx - this.x);
    this.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    this.setFlipX(Math.cos(angle) < 0);
  }

  _patrol(delta) {
    this._patrolTimer -= delta;
    if (this._patrolTimer <= 0) {
      this._patrolTimer = Phaser.Math.Between(1500, 4000);
      // Deterministic patrol using spawn position and counter
      this._patrolCounter = (this._patrolCounter ?? 0) + 1;
      const angle = ((this._patrolCounter * 2654435761) >>> 0) / 0x100000000 * Math.PI * 2;
      const dist  = 30 + ((this._patrolCounter * 1597334677) >>> 0) % 50;
      this._patrolTarget = {
        x: this._spawnX + Math.cos(angle) * dist,
        y: this._spawnY + Math.sin(angle) * dist,
      };
    }

    if (this._patrolTarget) {
      const d = Phaser.Math.Distance.Between(this.x, this.y, this._patrolTarget.x, this._patrolTarget.y);
      if (d > 8) {
        this._moveToward(this._patrolTarget.x, this._patrolTarget.y, BALANCE.ENEMY.PATROL_SPEED);
      } else {
        this.body.setVelocity(0, 0);
      }
    }
  }

  _doAttack(player, isHeavy = false) {
    const cooldown = this.template.attackCooldown ?? BALANCE.ENEMY.ATTACK_COOLDOWN;
    this._attackCooldown = isHeavy ? cooldown * 1.5 : cooldown;
    this.body.setVelocity(0, 0);

    const damage    = isHeavy
      ? (this.template.heavyAttackDamage ?? this.attack * 1.8)
      : (this.template.attackDamage      ?? this.attack);
    const equilDmg  = isHeavy
      ? (this.template.heavyAttackEquil  ?? BALANCE.STAGGER.HEAVY_ATTACK_POISE)
      : (this.template.attackEquil       ?? BALANCE.STAGGER.LIGHT_ATTACK_POISE);

    // Flash de ataque
    this.setTint(0xff6600);
    this.scene.time.delayedCall(200, () => {
      if (!this.isDead) this.setTint(this._baseColor);
    });

    // Delay de 250ms antes do hit (janela de reação do player)
    this.scene.time.delayedCall(250, () => {
      if (this.isDead || player.isDead) return;

      const dist2 = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
      if (dist2 > (this.template.attackRange ?? 48) * 1.4) return;

      this.scene.events.emit('enemy:attack', {
        enemy: this,
        player,
        damage,
        equilDamage: equilDmg,
        isHeavy,
        canBeParried: !isHeavy,
        element: this.template.element ?? null,
        elementBuildup: this.template.elementBuildup ?? (this.template.element ? 10 : 0),
      });
    });
  }

  get xp() { return this.xpYield; }
}
