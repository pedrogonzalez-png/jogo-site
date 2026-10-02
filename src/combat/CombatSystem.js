// ============================================================
// combat/CombatSystem.js
// Ponto central que orquestra todos os subsistemas de combate.
// ============================================================
import { DamageSystem } from './DamageSystem.js';
import { BALANCE } from '../data/balance.js';

export class CombatSystem {
  /**
   * Processa um hit de attacker em target.
   * Ambos devem expor: attack, defense, critChance, critMultiplier, statusSystem, balanceSystem
   * type: 'LIGHT' | 'HEAVY' | 'SKILL' | 'DOT'
   * weaponData: { element, elementBuildup, equilDamage, heavyEquilDamage }
   */
  static processHit(attacker, target, type = 'LIGHT', weaponData = null) {
    if (!target || target.isDead || target.isInvincible) return null;

    const isHeavy  = type === 'HEAVY';
    const isSkill  = type === 'SKILL';
    const attack   = weaponData?.damage ?? attacker.effectiveAttack ?? attacker.attack ?? 10;
    const defense  = target.effectiveDefense ?? target.defense ?? 0;
    const critChance     = attacker.critChance ?? 0;
    const critMultiplier = attacker.critMultiplier ?? 1.5;

    // ── Verifica parry ───────────────────────────────────────
    if (target.parrySystem?.isActive) {
      const canBeParried = weaponData?.canBeParried !== undefined
        ? weaponData.canBeParried
        : !isSkill;

      const parryResult = target.parrySystem.tryParry(canBeParried);
      if (parryResult?.success) {
        // Atacante sofre o grande dano de equilíbrio do parry
        const causedStagger = attacker.balanceSystem?.takePoiseDamage(parryResult.poiseDamage);
        attacker.onParried?.();
        target.onParrySuccess?.();

        return {
          type: 'PARRY',
          poiseDamage: parryResult.poiseDamage,
          finalDamage: 0,
          causedStagger,
        };
      }
    }

    // ── Verifica bloqueio ────────────────────────────────────
    if (target.isBlocking && !isSkill) {
      const blockReduction = target.weaponSystem?.family?.blockDamageReduction
        ?? target.weaponSystem?.equipped?.blockDamageReduction
        ?? BALANCE.PLAYER.BLOCK_DAMAGE_REDUCTION; // 0.70
      const reducedAttack  = attack * (1 - blockReduction);
      const relicReduction = target.relics?.includes('iron_will') ? 0.75 : 1.0;
      const heavyMult      = isHeavy ? (BALANCE.PLAYER.HEAVY_BLOCK_STAMINA_MULT ?? 1.5) : 1.0;
      const staminaCost    = Math.max(10, attack * BALANCE.PLAYER.BLOCK_STAMINA_COST_MULT * relicReduction * heavyMult);

      if (target.staminaSystem) {
        const hasStamina = target.staminaSystem.spend(staminaCost);
        if (!hasStamina) {
          // GUARD BREAK: stamina esgotou durante o bloqueio
          target.staminaSystem.forceSpend(target.staminaSystem.current);
          target.onGuardBreak?.();
          const causedStagger = target.balanceSystem?.takePoiseDamage(
            (weaponData?.heavyEquilDamage ?? weaponData?.equilDamage ?? BALANCE.STAGGER.HEAVY_ATTACK_POISE) * 1.5
          );
          return CombatSystem._applyDamage(attack, defense, 0, 1,
                                           target, weaponData, type, 'GUARD_BREAK', 1.5);
        }
      }
      return CombatSystem._applyDamage(reducedAttack, defense, 0, 1,
                                       target, weaponData, type, 'BLOCKED', 0.25);
    }

    return CombatSystem._applyDamage(attack, defense, critChance,
                                     critMultiplier, target, weaponData, type, 'HIT', 1.0);
  }

  static _applyDamage(attack, defense, critChance, critMultiplier,
                      target, weaponData, type, hitType, poiseMultiplier = 1.0) {
    const isHeavy = type === 'HEAVY';
    const result = DamageSystem.resolveHit({
      attack, defense, critChance, critMultiplier,
    });

    // ── Dano de equilíbrio ────────────────────────────────────
    let basePoise = isHeavy
      ? (weaponData?.heavyEquilDamage ?? weaponData?.equilDamage ?? BALANCE.STAGGER.HEAVY_ATTACK_POISE)
      : (weaponData?.equilDamage      ?? BALANCE.STAGGER.LIGHT_ATTACK_POISE);

    let poiseDmg = basePoise * poiseMultiplier;

    if (target.balanceSystem?.isStaggered) poiseDmg = 0;

    const causedStagger = target.balanceSystem?.takePoiseDamage(poiseDmg);

    // ── Status elemental ──────────────────────────────────────
    let statusActivated = null;
    if (weaponData?.element && target.statusSystem) {
      const buildup = weaponData.elementBuildup ?? 0;
      const resistance = target.resistances?.[weaponData.element] ?? 0;
      statusActivated = target.statusSystem.addBuildup(weaponData.element, buildup, resistance);
    }

    // ── Aplica dano ───────────────────────────────────────────
    target.takeDamage(result.finalDamage);

    return {
      type: hitType,
      finalDamage: result.finalDamage,
      isCrit: result.isCrit,
      causedStagger,
      statusActivated,
      poiseDamage: poiseDmg,
    };
  }
}
