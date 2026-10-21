// ============================================================
// equipment/LootSystem.js
// Geração de drops de inimigos e baús.
// ============================================================
import { SeededRandom } from '../world/SeedSystem.js';
import { BALANCE } from '../data/balance.js';

export class LootSystem {
  constructor(rng) {
    this.rng = rng ?? new SeededRandom(Date.now());
  }

  /**
   * Gera o loot baseado exclusivamente na dificuldade e identidade do inimigo:
   * - nível do inimigo;
   * - tipo (comum, elite, boss);
   * - anomalia;
   * - profundidade do Abismo;
   * - tabela de loot específica.
   * Não limita nem reduz o loot com base no nível do jogador.
   */
  generateDrop(source, abyssDepth = 0) {
    const drops = [];

    const template = source.template ?? source;
    const enemyLevel = source.level ?? template.level ?? 1;
    const isElite = Boolean(source.isElite ?? template.isElite);
    const isBoss = Boolean(
      source.constructor?.name === 'Boss' ||
      template.isUnique ||
      source.isUnique ||
      template.behavior === 'BOSS_ASHEN'
    );
    const isAnomaly = Boolean(
      source.isAnomaly ||
      source.name?.includes('[ANOMALIA]') ||
      template.name?.includes('[ANOMALIA]')
    );

    const effectiveItemLevel = Math.max(1, enemyLevel + (abyssDepth * 6));
    const lootTable = template.lootTable ?? [];

    for (const entry of lootTable) {
      if (entry.itemId) {
        // Chance base da tabela modificada por anomalia e elite
        let dropChance = entry.chance;
        if (isAnomaly) dropChance = Math.min(1.0, dropChance * 1.5);
        else if (isElite) dropChance = Math.min(1.0, dropChance * 1.25);
        else if (isBoss) dropChance = 1.0; // Bosses garantem drop de itens de sua tabela

        if (this.rng.next() < dropChance) {
          const finalRarity = this._calculateRarity({
            baseRarity: entry.rarity ?? 'COMMON',
            enemyLevel,
            isElite,
            isBoss,
            isAnomaly,
            abyssDepth,
          });

          drops.push({
            type: 'item',
            itemId: entry.itemId,
            rarity: finalRarity,
            itemLevel: effectiveItemLevel,
            isElite,
            isBoss,
            isAnomaly,
          });
        }
      } else if (entry.xpBonus !== undefined) {
        drops.push({
          type: 'xp',
          amount: Math.floor((template.xp ?? 30) * (1 + (entry.xpBonus ?? 0))),
        });
      }
    }

    // Garante drop de XP correspondente à dificuldade
    if (!drops.find(d => d.type === 'xp')) {
      let xpAmount = template.xp ?? (enemyLevel * 10);
      if (isBoss) xpAmount *= 1.5;
      if (isAnomaly) xpAmount *= 3.0;
      drops.push({ type: 'xp', amount: Math.floor(xpAmount) });
    }

    return drops;
  }

  /**
   * Eleva a raridade com base na dificuldade real da ameaça enfrentada.
   */
  _calculateRarity({ baseRarity, enemyLevel, isElite, isBoss, isAnomaly, abyssDepth }) {
    const RARITIES = ['COMMON', 'RARE', 'VERY_RARE', 'EPIC', 'LEGENDARY', 'UNIQUE'];
    let idx = RARITIES.indexOf(baseRarity);
    if (idx < 0) idx = 0;

    // Piso de raridade por status do inimigo
    if (isBoss && idx < 2) idx = 2; // Boss mínimo VERY_RARE
    if (isElite && idx < 1) idx = 1; // Elite mínimo RARE
    if (isAnomaly && idx < 2) idx = 2; // Anomalia mínimo VERY_RARE

    // Chance de upgrade de raridade proporcional ao nível do inimigo e abismo
    const levelChance = (enemyLevel / 80) * 0.25;
    const abyssChance = Math.min(0.35, abyssDepth * 0.08);
    const bossBonus = isBoss ? 0.40 : 0;
    const anomalyBonus = isAnomaly ? 0.35 : 0;
    const eliteBonus = isElite ? 0.15 : 0;

    let totalUpgradeChance = levelChance + abyssChance + bossBonus + anomalyBonus + eliteBonus;

    // Sorteia elevações de tier
    while (totalUpgradeChance > 0 && idx < RARITIES.length - 1) {
      if (this.rng.next() < Math.min(0.85, totalUpgradeChance)) {
        idx++;
        totalUpgradeChance -= 0.6; // Reduz para upgrades múltiplos
      } else {
        break;
      }
    }

    return RARITIES[idx];
  }
}
