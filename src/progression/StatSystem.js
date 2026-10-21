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

  /**
   * Calcula o valor efetivo de um atributo aplicando as curvas de soft cap
   * definidas centralizadamente em BALANCE.SOFT_CAPS.
   * Não possui limite máximo absoluto (crescimento infinito).
   */
  static calculateEffectiveStat(value) {
    if (value <= 0) return 0;
    const tiers = BALANCE.SOFT_CAPS?.TIERS ?? [
      { min: 0,   max: 50,       multiplier: 1.0 },
      { min: 50,  max: 100,      multiplier: 0.6 },
      { min: 100, max: 500,      multiplier: 0.25 },
      { min: 500, max: Infinity, multiplier: 0.1 },
    ];

    let effective = 0;
    for (const tier of tiers) {
      if (value <= tier.min) continue;
      const pointsInTier = Math.min(value, tier.max) - tier.min;
      effective += pointsInTier * tier.multiplier;
      if (value <= tier.max) break;
    }
    return effective;
  }

  /** Valores efetivos com soft cap aplicado */
  get effectiveVigor()     { return StatSystem.calculateEffectiveStat(this.vigor); }
  get effectiveStrength()  { return StatSystem.calculateEffectiveStat(this.strength); }
  get effectiveDexterity() { return StatSystem.calculateEffectiveStat(this.dexterity); }
  get effectiveEndurance() { return StatSystem.calculateEffectiveStat(this.endurance); }
  get effectiveArcane()    { return StatSystem.calculateEffectiveStat(this.arcane); }

  /** HP máximo derivado com soft cap */
  get maxHP() {
    return Math.round(BALANCE.PLAYER.BASE_HP + this.effectiveVigor * BALANCE.PLAYER.HP_PER_VIGOR);
  }

  /** Equilíbrio base derivado com soft cap */
  get maxBalance() {
    return Math.round(BALANCE.STAGGER.BASE_BALANCE + this.effectiveVigor * BALANCE.PLAYER.STAGGER_PER_VIGOR);
  }

  /** Stamina máxima derivada com soft cap */
  get maxStamina() {
    return Math.round(BALANCE.PLAYER.BASE_STAMINA + this.effectiveEndurance * BALANCE.PLAYER.STAMINA_PER_END);
  }

  /** Taxa de regen de stamina adicional com soft cap */
  get staminaRegenBonus() {
    return this.effectiveEndurance * BALANCE.PLAYER.STAMINA_REGEN_PER_END;
  }

  /** Defesa física base com soft cap */
  get baseDefense() {
    return Math.round(BALANCE.PLAYER.BASE_DEFENSE + this.effectiveEndurance * BALANCE.PLAYER.DEFENSE_PER_END);
  }

  /** Bônus de ataque de Força com soft cap */
  get strengthBonus() {
    return this.effectiveStrength * BALANCE.PLAYER.ATTACK_PER_STR;
  }

  /** Bônus de ataque de Destreza com soft cap */
  get dexterityBonus() {
    return this.effectiveDexterity * (BALANCE.PLAYER.ATTACK_PER_DEX ?? 2.5);
  }

  /** Bônus elemental de Arcano com soft cap */
  get arcaneBonus() {
    return this.effectiveArcane * BALANCE.PLAYER.ELEMENTAL_PER_ARCANE;
  }

  /** Multiplicador de buildup de status de Arcano com soft cap */
  get statusBuildupBonus() {
    return this.effectiveArcane * BALANCE.PLAYER.STATUS_BUILDUP_PER_ARCANE;
  }

  /**
   * Calcula o ataque efetivo com uma arma, considerando seus escalamentos com soft caps.
   * weaponFamily: { scaling: { STR, DEX }, baseDamage }
   * upgradeLevel: nível de upgrade da arma
   */
  calculateWeaponAttack(weaponFamily, upgradeLevel = 0, armorAttackBonus = 0) {
    const base = weaponFamily.baseDamage;
    const strScale = (weaponFamily.scaling?.STR ?? 0) * this.strengthBonus;
    const dexScale = (weaponFamily.scaling?.DEX ?? 0) * this.dexterityBonus;
    const upgBonus = base * upgradeLevel * BALANCE.EQUIPMENT.STAT_SCALE_PER_UPGRADE;
    return base + strScale + dexScale + upgBonus + armorAttackBonus;
  }

  allocate(attribute, points = 1) {
    const attributes = ['vigor', 'strength', 'dexterity', 'endurance', 'arcane'];
    if (!attributes.includes(attribute) || !Number.isSafeInteger(points) ||
        points <= 0 || points > this.freePoints) return false;

    this[attribute] += points;
    this.freePoints -= points;
    return true;
  }

  addFreePoints(amount) {
    if (!Number.isSafeInteger(amount) || amount <= 0) return false;
    this.freePoints += amount;
    return true;
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
