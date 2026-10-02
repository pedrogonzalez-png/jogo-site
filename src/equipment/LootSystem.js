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
   * Gera o loot de um inimigo/boss baseado na sua tabela.
   * template: template do inimigo com lootTable e xp.
   * playerLevel: para escalonamento de raridade.
   * Returns array de { type, data } objetos de recompensa.
   */
  generateDrop(template, playerLevel = 1) {
    const drops = [];

    for (const entry of (template.lootTable ?? [])) {
      if (entry.itemId) {
        if (this.rng.next() < entry.chance) {
          drops.push({
            type: 'item',
            itemId: entry.itemId,
            rarity: this._upgradeRarityByLevel(entry.rarity, playerLevel),
          });
        }
      } else if (entry.xpBonus !== undefined) {
        // XP extra além da base
        drops.push({
          type: 'xp',
          amount: Math.floor(template.xp * (1 + (entry.xpBonus ?? 0))),
        });
      }
    }

    // XP base sempre
    if (!drops.find(d => d.type === 'xp')) {
      drops.push({ type: 'xp', amount: template.xp });
    }

    return drops;
  }

  /** Pode elevar ligeiramente a raridade em função do nível do player */
  _upgradeRarityByLevel(baseRarity, playerLevel) {
    const RARITIES = ['COMMON', 'RARE', 'VERY_RARE', 'EPIC', 'LEGENDARY'];
    let idx = RARITIES.indexOf(baseRarity);
    if (idx < 0) return baseRarity;

    // A cada 30 níveis, chance de +1 raridade
    const bonusChance = Math.min((playerLevel / 30) * 0.15, 0.4);
    if (this.rng.next() < bonusChance && idx < RARITIES.length - 1) idx++;

    return RARITIES[idx];
  }
}
