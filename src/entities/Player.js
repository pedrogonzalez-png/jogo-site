// ============================================================
// entities/Player.js
// Entidade do jogador: movimento, combate, animações primitivas.
// ============================================================
import Phaser from 'phaser';
import { StaminaSystem } from '../combat/StaminaSystem.js';
import { BalanceSystem  } from '../combat/BalanceSystem.js';
import { ParrySystem    } from '../combat/ParrySystem.js';
import { StatusEffectSystem } from '../combat/StatusEffectSystem.js';
import { CombatSystem   } from '../combat/CombatSystem.js';
import { BALANCE } from '../data/balance.js';

const STATE = {
  IDLE:        'IDLE',
  WALK:        'WALK',
  RUN:         'RUN',
  ATTACK:      'ATTACK',
  HEAVY:       'HEAVY',
  DODGE:       'DODGE',
  BLOCK:       'BLOCK',
  PARRY:       'PARRY',
  SKILL:       'SKILL',
  HEAL:        'HEAL',
  STAGGER:     'STAGGER',
  GUARD_BREAK: 'GUARD_BREAK',
  DEAD:        'DEAD',
};

// Limite visual em pixels do mundo Phaser. A textura continua em alta resolução;
// apenas o Sprite é escalado para caber nesta caixa, sem deformar a proporção.
const PLAYER_VISUAL_BOUNDS = Object.freeze({ width: 80, height: 80 });
const PLAYER_BODY_BASE = Object.freeze({ width: 24, height: 24, offsetX: 13, offsetY: 38 });

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, systems) {
    super(scene, x, y, 'player');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(10);
    this.body.setSize(24, 24);
    this.body.setOffset(13, 38);

    // ── Sistemas injetados ────────────────────────────────────
    this.statSystem    = systems.stat;
    this.weaponSystem  = systems.weapon;
    this.armorSystem   = systems.armor;
    this.xpSystem      = systems.xp;
    this.levelSystem   = systems.level;
    this.inventorySystem = systems.inventory;

    // ── Sistemas de combate ───────────────────────────────────
    this.staminaSystem = new StaminaSystem(this.statSystem.maxStamina);
    this.balanceSystem = new BalanceSystem(this.statSystem.maxBalance);
    this.parrySystem   = new ParrySystem();
    this.statusSystem  = new StatusEffectSystem();

    // ── HP ────────────────────────────────────────────────────
    this.maxHP  = this.statSystem.maxHP;
    this.hp     = this.maxHP;

    // ── Cura ──────────────────────────────────────────────────
    this.healCharges    = BALANCE.PLAYER.HEAL_CHARGES;
    this.maxHealCharges = BALANCE.PLAYER.HEAL_CHARGES;
    this.healAmount     = BALANCE.PLAYER.HEAL_AMOUNT;

    // ── Estado ────────────────────────────────────────────────
    this.state      = STATE.IDLE;
    this._stateTimer = 0;

    // ── Flags ─────────────────────────────────────────────────
    this.isBlocking   = false;
    this._blockCooldownTimer = 0;
    this.isInvincible = false;
    this._invTimer    = 0;
    this.isDead       = false;
    this.facingAngle  = 0; // radianos

    // ── Ataque ────────────────────────────────────────────────
    this._attackHitbox  = null; // criado durante o ataque
    this._attackPending = false;

    // ── Relíquias ─────────────────────────────────────────────
    this.relics = [];

    // ── Crítico base ─────────────────────────────────────────
    this.baseCritChance     = 0.05;
    this.baseCritMultiplier = 1.5;

    this._createAnimations(scene);
    this.clearTint();
    if (scene.anims?.exists('player_idle')) {
      this.play('player_idle');
    }

    // Encaixa o visual em uma caixa compacta sem alterar os pixels da textura.
    this._fitVisualToBounds();
  }

  // ── Stats derivados ──────────────────────────────────────────
  get effectiveAttack() {
    const armorBonus = this.armorSystem.totalStats.attack ?? 0;
    const family = this.weaponSystem.family;
    if (!family) return BALANCE.PLAYER.BASE_ATTACK + armorBonus;
    return this.statSystem.calculateWeaponAttack(
      family,
      this.weaponSystem.equipped?.upgradeLevel ?? 0,
      armorBonus
    );
  }

  get effectiveDefense() {
    return this.statSystem.baseDefense + (this.armorSystem.totalStats.defense ?? 0);
  }

  get critChance() {
    return this.baseCritChance + (this.armorSystem.totalStats.critChance ?? 0);
  }

  get critMultiplier() {
    return this.baseCritMultiplier + (this.armorSystem.totalStats.critMultiplier ?? 0);
  }

  get speed() {
    let base = BALANCE.PLAYER.BASE_SPEED * this.statusSystem.getSlowFactor();
    if (this.activeHazardEffect === 'ASH') {
      base *= 0.65; // Arredores Cinzentos: reduz em 35%
    } else if (this.activeHazardEffect === 'BLOOD') {
      base *= 0.85; // Cárcere de Sangue: reduz em 15%
    } else if (this.activeHazardEffect === 'WATER') {
      base *= 0.90; // Aqueduto Submerso: reduz em 10%
    } else if (this.activeHazardEffect === 'GRAVITY') {
      base *= 0.75; // Coração do Abismo: reduz em 25%
    }
    return base;
  }

  // ── Público: entrada ─────────────────────────────────────────
  handleInput(cursors, keys) {
    if (this.isDead) return;
    if (this.state === STATE.STAGGER || this.state === STATE.GUARD_BREAK) return;

    const inAction = [STATE.ATTACK, STATE.HEAVY, STATE.DODGE, STATE.PARRY,
                      STATE.SKILL, STATE.HEAL].includes(this.state);

    // ── Bloqueio ─────────────────────────────────────────────
    const canBlock = !inAction
      && !this.staminaSystem.isEmpty()
      && this._blockCooldownTimer <= 0
      && this.state !== STATE.GUARD_BREAK
      && this.state !== STATE.STAGGER;

    if (canBlock) {
      this.isBlocking = keys.block?.isDown ?? false;
      if (this.isBlocking && this.state !== STATE.BLOCK) {
        this.state = STATE.BLOCK;
      } else if (!this.isBlocking && this.state === STATE.BLOCK) {
        this.state = STATE.IDLE;
      }
    } else {
      this.isBlocking = false;
      if (this.state === STATE.BLOCK) this.state = STATE.IDLE;
    }

    // ── Ataques a partir de Esquiva e Contra-Ataque de Bloqueio ────
    if (this.state === STATE.DODGE && Phaser.Input.Keyboard.JustDown(keys.attack)) {
      this._doDodgeAttack();
      return;
    }
    if (this.state === STATE.BLOCK && Phaser.Input.Keyboard.JustDown(keys.attack)) {
      this._doBlockCounterAttack();
      return;
    }

    // ── Ações (não pode atacar simultaneamente ao bloqueio comum) ──
    if (!inAction) {
      if (Phaser.Input.Keyboard.JustDown(keys.parry)) {
        this._doParry();
        return;
      }
      if (Phaser.Input.Keyboard.JustDown(keys.dodge)) {
        this._doDodge(cursors, keys);
        return;
      }
      if (!this.isBlocking) {
        if (Phaser.Input.Keyboard.JustDown(keys.heavyAttack)) {
          this._doHeavyAttack();
          return;
        }
        if (Phaser.Input.Keyboard.JustDown(keys.attack)) {
          this._doLightAttack();
          return;
        }
        if (Phaser.Input.Keyboard.JustDown(keys.skill)) {
          this._doSkill();
          return;
        }
        if (Phaser.Input.Keyboard.JustDown(keys.heal)) {
          this._doHeal();
          return;
        }
      }
    }

    // ── Movimento (permitido durante bloqueio com velocidade reduzida) ──
    if (!inAction) {
      this._handleMovement(cursors, keys);
    }
  }

  _handleMovement(cursors, keys) {
    const isBlocking = this.isBlocking || this.state === STATE.BLOCK;
    const isRunning  = keys.run?.isDown && !isBlocking && !this.staminaSystem.isEmpty();
    let vx = 0, vy = 0;

    if (cursors.left.isDown  || keys.left?.isDown)  vx = -1;
    if (cursors.right.isDown || keys.right?.isDown)  vx =  1;
    if (cursors.up.isDown    || keys.up?.isDown)     vy = -1;
    if (cursors.down.isDown  || keys.down?.isDown)   vy =  1;

    if (vx !== 0 || vy !== 0) {
      this.facingAngle = Math.atan2(vy, vx);
      let spd = isRunning ? this.speed * BALANCE.PLAYER.RUN_MULTIPLIER : this.speed;
      if (isBlocking) {
        spd = this.speed * (BALANCE.PLAYER.BLOCK_MOVE_SPEED_MULT ?? 0.50);
      }
      const len = Math.sqrt(vx * vx + vy * vy);
      this.body.setVelocity((vx / len) * spd, (vy / len) * spd);

      if (!isBlocking) {
        this.state = isRunning ? STATE.RUN : STATE.WALK;
      }

      if (isRunning) {
        // Consome stamina de corrida por segundo
        const cost = (BALANCE.PLAYER.RUN_STAMINA_PER_SEC / 1000) * this.scene.game.loop.delta;
        this.staminaSystem.forceSpend(cost);
      }
    } else {
      this.body.setVelocity(0, 0);
      if (!isBlocking && [STATE.WALK, STATE.RUN].includes(this.state)) {
        this.state = STATE.IDLE;
      }
    }
  }

  _doDodgeAttack() {
    const attackData = this.weaponSystem.getLightAttackData(this.statSystem);
    if (!attackData) return;
    if (!this.staminaSystem.spend(attackData.staminaCost * 0.8)) return;

    this.state = STATE.ATTACK;
    this.isInvincible = false;
    attackData.damage = Math.round(attackData.damage * 1.25);
    attackData.equilDamage = Math.round(attackData.equilDamage * 1.3);

    const boostSpeed = BALANCE.PLAYER.DODGE_SPEED * 0.5;
    this.body.setVelocity(Math.cos(this.facingAngle) * boostSpeed, Math.sin(this.facingAngle) * boostSpeed);

    this._spawnAttackHitbox(attackData, 'DODGE_ATTACK');

    this.scene.time.delayedCall(attackData.duration * 0.8, () => {
      this.body.setVelocity(0, 0);
      if (this.state === STATE.ATTACK) this.state = STATE.IDLE;
    });
  }

  _doBlockCounterAttack() {
    const attackData = this.weaponSystem.getHeavyAttackData(this.statSystem);
    if (!attackData) return;
    if (!this.staminaSystem.spend(attackData.staminaCost * 0.9)) return;

    this.isBlocking = false;
    this.state = STATE.HEAVY;
    this.body.setVelocity(0, 0);

    attackData.damage = Math.round(attackData.damage * 1.3);
    attackData.equilDamage = Math.round(attackData.equilDamage * 1.6);

    this._spawnAttackHitbox(attackData, 'BLOCK_COUNTER');

    this.scene.time.delayedCall(attackData.duration * 0.7, () => {
      if (this.state === STATE.HEAVY) this.state = STATE.IDLE;
    });
  }

  checkWeaponLevelPenalty() {
    const reqLevel = this.weaponSystem.equipped?.requiredLevel ?? 1;
    const currentLevel = this.levelSystem.level;
    if (currentLevel < reqLevel) {
      if (this.armorSystem.disabledSlots.size !== 2) {
        this.armorSystem.setDisabledSlots(['helmet', 'chest']);
      }
    } else {
      this.armorSystem.clearPenalty();
    }
  }

  _doLightAttack() {
    const attackData = this.weaponSystem.getLightAttackData(this.statSystem);
    if (!attackData) return;
    if (!this.staminaSystem.spend(attackData.staminaCost)) return;

    this.state = STATE.ATTACK;
    this._stateTimer = attackData.duration;
    this.body.setVelocity(0, 0);

    this._spawnAttackHitbox(attackData, 'LIGHT');
    this.weaponSystem.advanceCombo();

    this.scene.time.delayedCall(attackData.duration, () => {
      if (this.state === STATE.ATTACK) this.state = STATE.IDLE;
    });
  }

  _doHeavyAttack() {
    const attackData = this.weaponSystem.getHeavyAttackData(this.statSystem);
    if (!attackData) return;
    if (!this.staminaSystem.spend(attackData.staminaCost)) return;

    this.state = STATE.HEAVY;
    this._stateTimer = attackData.duration;
    this.body.setVelocity(0, 0);
    this.weaponSystem.resetCombo();

    // Delay antes do hit (carregamento)
    this.scene.time.delayedCall(attackData.duration * 0.5, () => {
      this._spawnAttackHitbox(attackData, 'HEAVY');
    });
    this.scene.time.delayedCall(attackData.duration, () => {
      if (this.state === STATE.HEAVY) this.state = STATE.IDLE;
    });
  }

  _doSkill() {
    const skillData = this.weaponSystem.getSkillData();
    if (!skillData) return;
    if (!this.staminaSystem.spend(skillData.staminaCost)) return;
    if (!this.weaponSystem.useSkill()) return;

    this.state = STATE.SKILL;
    this.body.setVelocity(0, 0);

    // Emite evento para a cena gerenciar projeteis/efeitos
    this.scene.events.emit('player:skill', { player: this, skillData });

    this.scene.time.delayedCall(600, () => {
      if (this.state === STATE.SKILL) this.state = STATE.IDLE;
    });
  }

  _doDodge(cursors, keys) {
    if (!this.staminaSystem.spend(BALANCE.PLAYER.DODGE_STAMINA)) return;

    this.state = STATE.DODGE;
    this.isInvincible = true;
    this._invTimer = BALANCE.PLAYER.INVINCIBLE_DURATION;

    // Detecta direção baseada no input atual do jogador
    let dx = 0, dy = 0;
    if (cursors?.left?.isDown  || keys?.left?.isDown)  dx = -1;
    if (cursors?.right?.isDown || keys?.right?.isDown)  dx =  1;
    if (cursors?.up?.isDown    || keys?.up?.isDown)     dy = -1;
    if (cursors?.down?.isDown  || keys?.down?.isDown)   dy =  1;

    if (dx !== 0 || dy !== 0) {
      this.facingAngle = Math.atan2(dy, dx);
    }

    let dodgeSpeed = BALANCE.PLAYER.DODGE_SPEED;
    if (this.activeHazardEffect === 'GRAVITY') {
      dodgeSpeed *= 0.6; // Reduz a distância da esquiva
    }

    const vx = Math.cos(this.facingAngle) * dodgeSpeed;
    const vy = Math.sin(this.facingAngle) * dodgeSpeed;
    this.body.setVelocity(vx, vy);

    this.weaponSystem.resetCombo();

    // Rastro visual de esquiva
    const ghost = this.scene.add.circle(this.x, this.y, 14, 0x88bbff, 0.45).setDepth(9);
    this.scene.tweens.add({
      targets: ghost,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 180,
      onComplete: () => ghost.destroy(),
    });

    this.scene.time.delayedCall(BALANCE.PLAYER.DODGE_DURATION, () => {
      this.body.setVelocity(0, 0);
      if (this.state === STATE.DODGE) this.state = STATE.IDLE;
    });
  }

  _doParry() {
    this.parrySystem.trigger();
    this.state = STATE.PARRY;
    this.body.setVelocity(0, 0);

    // Efeito visual na postura de parry
    this._showParryStanceVisual();

    this.scene.time.delayedCall(BALANCE.PLAYER.PARRY_WINDOW, () => {
      if (this.state === STATE.PARRY) this.state = STATE.IDLE;
    });
  }

  _showParryStanceVisual() {
    const flash = this.scene.add.circle(this.x, this.y, 16, 0xffff66, 0.45).setDepth(15);
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      scaleX: 1.4,
      scaleY: 1.4,
      duration: BALANCE.PLAYER.PARRY_WINDOW,
      onComplete: () => flash.destroy(),
    });
  }

  onGuardBreak() {
    this.isBlocking = false;
    this.state = STATE.GUARD_BREAK;
    this._stateTimer = BALANCE.PLAYER.GUARD_BREAK_VULNERABLE_DURATION;
    this._blockCooldownTimer = BALANCE.PLAYER.GUARD_BREAK_COOLDOWN;
    this.body.setVelocity(0, 0);

    this._showGuardBreakVisual();
    this.scene.events.emit('player:guard_break', { x: this.x, y: this.y });
  }

  onParrySuccess() {
    this.scene.events.emit('player:parry_success', { x: this.x, y: this.y });
  }

  _showGuardBreakVisual() {
    const s = this.scene;
    for (let i = 0; i < 6; i++) {
      const p = s.add.rectangle(this.x, this.y, 6, 6, 0xff4444).setDepth(25);
      const angle = (Math.PI * 2 * i) / 6;
      s.tweens.add({
        targets: p,
        x: this.x + Math.cos(angle) * 32,
        y: this.y + Math.sin(angle) * 32,
        alpha: 0,
        duration: 350,
        onComplete: () => p.destroy(),
      });
    }
  }

  _doHeal() {
    if (this.healCharges <= 0) return;
    if (this.hp >= this.maxHP) return;

    this.healCharges--;
    const healed = Math.min(this.healAmount, this.maxHP - this.hp);
    this.hp += healed;
    this.state = STATE.HEAL;

    this.scene.events.emit('player:healed', { amount: healed });

    this.scene.time.delayedCall(600, () => {
      if (this.state === STATE.HEAL) this.state = STATE.IDLE;
    });
  }

  _spawnAttackHitbox(attackData, type) {
    const dist = (attackData.range ?? 48);
    const hx = this.x + Math.cos(this.facingAngle) * dist * 0.6;
    const hy = this.y + Math.sin(this.facingAngle) * dist * 0.6;

    // Notifica a scene para criar hitbox de ataque
    this.scene.events.emit('player:attack', {
      player: this,
      x: hx, y: hy,
      radius: dist * 0.5,
      attackData,
      type,
    });

    this._showAttackFlash(hx, hy, type);
  }

  _showAttackFlash(x, y, type) {
    const isHeavy = type === 'HEAVY';
    const textureKey = isHeavy ? 'vfx_slash_heavy' : 'vfx_slash_light';

    // Rastro de corte em arco de ASCII denso
    const slash = this.scene.add.sprite(this.x, this.y, textureKey).setDepth(20);
    slash.setRotation(this.facingAngle);
    slash.setScale(isHeavy ? 1.2 : 0.9);
    slash.setAlpha(0.95);

    // Ponto de impacto em ASCII denso
    const spark = this.scene.add.sprite(x, y, 'vfx_impact_spark').setDepth(21);
    spark.setScale(isHeavy ? 1.4 : 1.0);
    spark.setAlpha(1.0);

    this.scene.tweens.add({
      targets: [slash, spark],
      alpha: 0,
      scaleX: '+=0.25',
      scaleY: '+=0.25',
      duration: isHeavy ? 240 : 170,
      onComplete: () => {
        slash.destroy();
        spark.destroy();
      },
    });
  }

  // ── Dano recebido ────────────────────────────────────────────
  takeDamage(amount) {
    if (this.isDead) return;
    if (this.isInvincible) return;
    if (amount <= 0) return;

    this.hp = Math.max(0, this.hp - amount);
    this.scene.events.emit('player:damaged', { amount, hp: this.hp });

    // Flash de dano
    this.setTint(0xff4444);
    this.scene.time.delayedCall(120, () => this.clearTint());

    if (this.hp <= 0) {
      this._die();
    }
  }

  _die() {
    if (this.isDead) return;
    this.isDead = true;
    this.state  = STATE.DEAD;
    this.body.setVelocity(0, 0);

    this.scene.events.emit('player:died', { x: this.x, y: this.y });
  }

  restoreAtSanctuary() {
    this.hp             = this.maxHP;
    this.healCharges    = this.maxHealCharges;
    this.staminaSystem.restoreFull();
    this.balanceSystem.restoreFull();
    this.statusSystem.clear();
    this.isDead   = false;
    this.state    = STATE.IDLE;
    this.isBlocking = false;
    this.isInvincible = false;
    this.weaponSystem.resetCombo();
  }

  refreshStatsFromAttributes() {
    const newMaxHP = this.statSystem.maxHP;
    const hpRatio  = this.hp / this.maxHP;
    this.maxHP = newMaxHP;
    this.hp    = Math.floor(newMaxHP * hpRatio);

    const newMaxStam = this.statSystem.maxStamina;
    this.staminaSystem.max = newMaxStam;
    this.staminaSystem.current = Math.min(this.staminaSystem.current, newMaxStam);

    this.balanceSystem.max = this.statSystem.maxBalance;
  }

  // ── Update ───────────────────────────────────────────────────
  update(delta) {
    if (this.isDead) return;

    this.staminaSystem.update(
      delta,
      BALANCE.PLAYER.STAMINA_REGEN_DELAY,
      BALANCE.PLAYER.STAMINA_REGEN_RATE + this.statSystem.staminaRegenBonus
    );
    this.balanceSystem.update(delta);
    this.parrySystem.update(delta);
    this.weaponSystem.update(delta);

    // Status elemental - aplica DoT
    const ticks = this.statusSystem.update(delta);
    for (const tick of ticks) {
      this.takeDamage(tick.damage);
    }

    // Stagger
    if (this.balanceSystem.isStaggered && this.state !== STATE.STAGGER) {
      this.state = STATE.STAGGER;
      this.body.setVelocity(0, 0);
      this.setTint(0xaaaaff);
    } else if (!this.balanceSystem.isStaggered && this.state === STATE.STAGGER) {
      this.state = STATE.IDLE;
      this.setTint(0xddccaa);
    }

    // i-frames
    if (this.isInvincible) {
      this._invTimer -= delta;
      if (this._invTimer <= 0) this.isInvincible = false;
      // Flicker durante dodge
      this.setAlpha(Math.sin(Date.now() / 50) > 0 ? 1 : 0.4);
    } else {
      this.setAlpha(1);
    }

    this._updateVisual();

    // Limpa os efeitos do ambiente para o próximo frame (overlap de física vai setar novamente se continuar dentro)
    this.activeHazardEffect = null;
  }

  _fitVisualToBounds() {
    // Usa o tamanho real do frame atual, não o tamanho já escalado do Sprite.
    const frame = this.frame;
    const frameWidth = frame?.width || frame?.realWidth || this.width;
    const frameHeight = frame?.height || frame?.realHeight || this.height;
    if (!this.body || frameWidth <= 0 || frameHeight <= 0) return;

    // Escala uniforme: mantém a proporção e limita o desenho a 80×80 pixels.
    const scale = Math.min(
      1,
      PLAYER_VISUAL_BOUNDS.width / frameWidth,
      PLAYER_VISUAL_BOUNDS.height / frameHeight
    );
    if (!Number.isFinite(scale) || scale <= 0) return;

    this.setScale(scale);

    // Compensa a escala para manter o hitbox no tamanho do mundo (24×24)
    // e conservar o offset original em pixels visuais.
    this.body.setSize(
      PLAYER_BODY_BASE.width / scale,
      PLAYER_BODY_BASE.height / scale,
      false
    );
    this.body.setOffset(
      PLAYER_BODY_BASE.offsetX / scale,
      PLAYER_BODY_BASE.offsetY / scale
    );
  }

  _updateVisual() {
    // Flip baseado na direção
    if (Math.cos(this.facingAngle) < 0) this.setFlipX(true);
    else this.setFlipX(false);

    // Gestão de animações e texturas de alta densidade
    if (this.state === STATE.BLOCK) {
      if (this.anims?.isPlaying) this.stop();
      this.setTexture('player_block');
      this.setTint(0x88bbff);
    } else if (this.state === STATE.ATTACK || this.state === STATE.HEAVY) {
      if (this.anims?.isPlaying) this.stop();
      this.setTexture('player_attack_0');
      this.clearTint();
    } else if (this.state === STATE.PARRY && this.parrySystem.isActive) {
      this.setTint(0xffff44);
    } else if (this.body.velocity.lengthSq() > 20) {
      if (this.anims && this.anims.currentAnim?.key !== 'player_walk') {
        this.play('player_walk');
      }
      if (!this.isInvincible && this.state !== STATE.STAGGER) this.clearTint();
    } else {
      if (this.anims && this.anims.currentAnim?.key !== 'player_idle') {
        this.play('player_idle');
      }
      if (!this.isInvincible && this.state !== STATE.STAGGER) this.clearTint();
    }

    // Recalcula após trocar textura/animação; a matriz ASCII de origem não muda.
    this._fitVisualToBounds();
  }

  _createAnimations(scene) {
    // Animações criadas em GraphicsHelper pois usamos sprites gerados
    // Apenas registramos aqui se o atlas existir
  }

  // Resistências do player (pode ser expandido por armadura/relíquia)
  get resistances() { return {}; }
}
