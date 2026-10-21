// ============================================================
// combat/DamageSystem.js
// Fórmula de dano isolada para fácil balanceamento.
// ============================================================
import { BALANCE } from '../data/balance.js';

export class DamageSystem {
  /**
   * Calcula o dano final após defesa.
   * Fórmula: Dano = Ataque × (1 - Defesa / (RATIO × Ataque))
   * Para anular completamente: Defesa >= RATIO × Ataque
   */
  static calculate(attack, defense, isCrit = false, critMultiplier = 1.5) {
    const ratio = BALANCE.DAMAGE.DEFENSE_RATIO;

    // Ataque zero e entradas inválidas não podem produzir NaN nem divisão por zero.
    if (!Number.isFinite(attack) || attack <= 0 ||
        !Number.isFinite(defense) || !Number.isFinite(critMultiplier)) return 0;

    let effectiveAttack = attack;
    if (isCrit) effectiveAttack *= critMultiplier;
    if (!Number.isFinite(effectiveAttack) || effectiveAttack <= 0) return 0;

    if (defense <= 0) return effectiveAttack;

    const reduction = defense / (ratio * effectiveAttack);
    const damage = effectiveAttack * (1 - reduction);
    return Math.max(0, damage);
  }

  /**
   * Resolve se o ataque é crítico.
   */
  static rollCrit(critChance) {
    return Math.random() < critChance;
  }

  /**
   * Aplica modificadores elementais de resistência.
   * resistance: valor entre -1 (vulnerável) e 1 (imune)
   */
  static applyElementalResistance(damage, resistance) {
    if (!Number.isFinite(damage) || damage <= 0) return 0;
    const safeResistance = Number.isFinite(resistance)
      ? Math.max(-1, Math.min(1, resistance)) : 0;
    return Math.max(0, damage * (1 - safeResistance));
  }

  /**
   * Ponto central para resolver um hit completo.
   * Retorna { finalDamage, isCrit, isElemental }
   */
  static resolveHit({ attack, defense, critChance = 0, critMultiplier = 1.5,
                       elementalDamage = 0, elementalResistance = 0 }) {
    const isCrit = DamageSystem.rollCrit(critChance);
    let physical = DamageSystem.calculate(attack, defense, isCrit, critMultiplier);
    let elemental = 0;

    if (elementalDamage > 0) {
      elemental = DamageSystem.applyElementalResistance(elementalDamage, elementalResistance);
    }

    return {
      finalDamage: physical + elemental,
      physicalDamage: physical,
      elementalDamage: elemental,
      isCrit,
    };
  }
}
