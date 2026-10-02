// ============================================================
// progression/StatSystem.js
// Converte atributos (Vigor, Força…) em stats derivados.
// ============================================================
import { BALANCE } from '../data/balance.js';

export class StatSystem {
  constructor() {
    // Atributos base
    this.vigor     = 10;
    this.strength  = 10;
    this.dexterity = 10;
    this.endurance = 10;
    this.arcane    = 5;

    // Pontos disponíveis para distribuir
    this.freePoints = 5;
  }

  /** HP máximo derivado */
  get maxHP() {
    return BALANCE.PLAYER.BASE_HP + this.vigor * BALANCE.PLAYER.HP_PER_VIGOR;
  }

  /** Equilíbrio base derivado */
  get maxBalance() {
    return BALANCE.STAGGER.BASE_BALANCE + this.vigor * BALANCE.PLAYER.STAGGER_PER_VIGOR;
  }

  /** Stamina máxima derivada */
  get maxStamina() {
    return BALANCE.PLAYER.BASE_STAMINA + this.endurance * BALANCE.PLAYER.STAMINA_PER_END;
  }

  /** Taxa de regen de stamina adicional */
  get staminaRegenBonus() {
    return this.endurance * BALANCE.PLAYER.STAMINA_REGEN_PER_END;
  }

  /** Defesa física base */
  get baseDefense() {
    return BALANCE.PLAYER.BASE_DEFENSE + this.endurance * BALANCE.PLAYER.DEFENSE_PER_END;
  }

  /** Bônus de ataque de Força */
  get strengthBonus() {
    return this.strength * BALANCE.PLAYER.ATTACK_PER_STR;
  }

  /** Bônus elemental de Arcano */
  get arcaneBonus() {
    return this.arcane * BALANCE.PLAYER.ELEMENTAL_PER_ARCANE;
  }

  /** Multiplicador de buildup de status de Arcano */
  get statusBuildupBonus() {
    return this.arcane * BALANCE.PLAYER.STATUS_BUILDUP_PER_ARCANE;
  }

  /**
   * Calcula o ataque efetivo com uma arma, considerando seus escalamentos.
   * weaponFamily: { scaling: { STR, DEX }, baseDamage }
   * upgradeLevel: nível de upgrade da arma
   */
  calculateWeaponAttack(weaponFamily, upgradeLevel = 0, armorAttackBonus = 0) {
    const base = weaponFamily.baseDamage;
    const strScale = (weaponFamily.scaling?.STR ?? 0) * this.strengthBonus;
    const dexScale = (weaponFamily.scaling?.DEX ?? 0) * this.dexterity * 1.5;
    const upgBonus = base * upgradeLevel * BALANCE.EQUIPMENT.STAT_SCALE_PER_UPGRADE;
    return base + strScale + dexScale + upgBonus + armorAttackBonus;
  }

  allocate(attribute, points = 1) {
    if (this.freePoints < points) return false;
    this[attribute] += points;
    this.freePoints -= points;
    return true;
  }

  addFreePoints(amount) {
    this.freePoints += amount;
  }

  serialize() {
    return {
      vigor: this.vigor, strength: this.strength,
      dexterity: this.dexterity, endurance: this.endurance,
      arcane: this.arcane, freePoints: this.freePoints,
    };
  }

  deserialize(data) {
    this.vigor      = data.vigor      ?? 10;
    this.strength   = data.strength   ?? 10;
    this.dexterity  = data.dexterity  ?? 10;
    this.endurance  = data.endurance  ?? 10;
    this.arcane     = data.arcane     ?? 5;
    this.freePoints = data.freePoints ?? 5;
  }
}
