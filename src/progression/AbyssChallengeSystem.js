// ============================================================
// progression/AbyssChallengeSystem.js
// Recompensas especiais por vencer inimigos muito mais fortes.
// ============================================================
import { BALANCE } from '../data/balance.js';

export class AbyssChallengeSystem {
  /**
   * Registra o início de um combate e captura a diferença de nível.
   * Isso previne manipulação (ex: ganhar XP para reduzir diferença).
   */
  recordCombatStart(playerLevel, enemyLevel) {
    return {
      playerLevel,
      enemyLevel,
      diff: Math.max(0, enemyLevel - playerLevel),
      timestamp: Date.now(),
    };
  }

  /**
   * Calcula as recompensas de Abismo após vitória.
   * record: objeto retornado por recordCombatStart.
   * alreadyObtained: Set de IDs de recompensas Únicas já obtidas.
   */
  calculateReward(record, alreadyObtained = new Set()) {
    const diff = record.diff;
    const B = BALANCE.ABYSS;
    let tier = 0;
    let bonusPoints = 0;
    let itemTier = null;

    if (diff >= B.TIER4_DIFF) {
      tier = 4;
      bonusPoints = B.TIER4_POINTS;
      itemTier = 'UNIQUE';
    } else if (diff >= B.TIER3_DIFF) {
      tier = 3;
      bonusPoints = B.TIER3_POINTS;
      itemTier = 'EPIC';
    } else if (diff >= B.TIER2_DIFF) {
      tier = 2;
      bonusPoints = B.TIER2_POINTS;
      itemTier = 'RARE';
    } else if (diff >= B.TIER1_DIFF) {
      tier = 1;
      bonusPoints = B.TIER1_POINTS;
    }

    if (tier === 0) return null;

    const rewardId = `abyss_${record.enemyLevel}_${record.timestamp}`;
    const uniqueAlreadyGiven = itemTier === 'UNIQUE' && alreadyObtained.has(rewardId);

    return {
      tier,
      bonusPoints,
      itemTier: uniqueAlreadyGiven ? 'LEGENDARY' : itemTier,
      rewardId,
      isNew: !uniqueAlreadyGiven,
      diff,
    };
  }
}
