// ============================================================
// equipment/WeaponSystem.js
// Gerencia a arma equipada, combo state e habilidade.
// ============================================================
import { WEAPON_FAMILIES } from '../data/weapons.js';
import { BALANCE } from '../data/balance.js';

export class WeaponSystem {
  constructor() {
    this.equipped = null;   // arma equipada
    this.comboIndex = 0;
    this.comboTimer = 0;
    this._skillCooldown = 0;
  }

  equip(weaponData) {
    this.equipped = { ...weaponData };
    this.comboIndex = 0;
    this.comboTimer = 0;
    this._skillCooldown = 0;
  }

  get family() {
    if (!this.equipped) return null;
    return WEAPON_FAMILIES[this.equipped.family];
  }

  get hasSkill() {
    return !!(this.equipped?.skill);
  }

  get skillReady() {
    return this._skillCooldown <= 0;
  }

  get skillCooldownPct() {
    if (!this.equipped?.skill) return 1;
    return 1 - (this._skillCooldown / this.equipped.skill.cooldown);
  }

  /** Tempo de duração do ataque leve atual no combo */
  get currentAttackDuration() {
    const f = this.family;
    if (!f) return 400;
    return f.attackDurations[this.comboIndex] ?? 400;
  }

  /** Avança o combo */
  advanceCombo() {
    const f = this.family;
    if (!f) return;
    this.comboIndex = (this.comboIndex + 1) % f.comboCount;
    this.comboTimer = 1200; // janela para continuar o combo
  }

  resetCombo() {
    this.comboIndex = 0;
    this.comboTimer = 0;
  }

  /** Dados de dano de ataque leve atual */
  getLightAttackData(statSystem) {
    const f = this.family;
    if (!f || !this.equipped) return null;
    const attack = statSystem.calculateWeaponAttack(f, this.equipped.upgradeLevel);
    return {
      damage: attack,
      equilDamage: f.baseEquilDamage,
      staminaCost: f.baseStaminaCost,
      element: this.equipped.element ?? null,
      elementBuildup: this.equipped.elementBuildup ?? 0,
      range: f.range,
      duration: this.currentAttackDuration,
    };
  }

  /** Dados de dano de ataque pesado */
  getHeavyAttackData(statSystem) {
    const f = this.family;
    if (!f || !this.equipped) return null;
    const attack = statSystem.calculateWeaponAttack(f, this.equipped.upgradeLevel);
    return {
      damage: attack * 1.8,
      equilDamage: f.heavyEquilDamage,
      staminaCost: f.heavyStaminaCost ?? BALANCE.PLAYER.HEAVY_ATTACK_STAMINA,
      element: this.equipped.element ?? null,
      elementBuildup: (this.equipped.elementBuildup ?? 0) * 1.5,
      range: f.range * 1.15,
      duration: f.heavyDuration,
    };
  }

  /** Dados da habilidade da arma */
  getSkillData() {
    if (!this.equipped?.skill || !this.skillReady) return null;
    return { ...this.equipped.skill };
  }

  useSkill() {
    if (!this.equipped?.skill || !this.skillReady) return false;
    this._skillCooldown = this.equipped.skill.cooldown;
    return true;
  }

  update(delta) {
    // Cooldown da habilidade
    if (this._skillCooldown > 0) {
      this._skillCooldown = Math.max(0, this._skillCooldown - delta);
    }

    // Janela de combo
    if (this.comboTimer > 0) {
      this.comboTimer -= delta;
      if (this.comboTimer <= 0) {
        this.resetCombo();
      }
    }
  }

  /** Raridade efetiva considerando upgrade */
  get effectiveRarity() {
    if (!this.equipped) return 'COMMON';
    // O nível de upgrade nunca rebaixa uma arma Única para outra raridade.
    if (this.equipped.rarity === 'UNIQUE') return 'UNIQUE';
    const thresholds = BALANCE.EQUIPMENT.RARITY_THRESHOLDS;
    const upg = this.equipped.upgradeLevel ?? 0;
    if (upg >= thresholds.LEGENDARY) return 'LEGENDARY';
    if (upg >= thresholds.EPIC)      return 'EPIC';
    if (upg >= thresholds.VERY_RARE) return 'VERY_RARE';
    if (upg >= thresholds.RARE)      return 'RARE';
    return this.equipped.rarity ?? 'COMMON';
  }

  serialize() {
    return { equipped: this.equipped ? { ...this.equipped } : null };
  }

  deserialize(data) {
    this.equipped = data.equipped ?? null;
  }
}
