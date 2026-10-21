// ============================================================
// equipment/UpgradeSystem.js
// Upgrade de armas e armaduras usando XP como moeda.
// ============================================================
import { XPSystem } from '../progression/XPSystem.js';
import { BALANCE } from '../data/balance.js';

export class UpgradeSystem {
  /**
   * Tenta melhorar um item (arma ou armadura).
   * item: objeto do item com upgradeLevel
   * xpSystem: instância de XPSystem
   * isWeapon: bool
   * Returns { success, cost, newLevel, newRarity }
   */
  static upgrade(item, xpSystem, isWeapon = true) {
    const maxUpg = BALANCE.EQUIPMENT.MAX_UPGRADE;
    if ((item.upgradeLevel ?? 0) >= maxUpg) {
      return { success: false, reason: 'MAX_LEVEL' };
    }

    // Únicas NUNCA perdem o status de UNIQUE
    const isUnique = item.rarity === 'UNIQUE';

    const cost = isWeapon
      ? XPSystem.weaponUpgradeCost(item.upgradeLevel ?? 0)
      : XPSystem.armorUpgradeCost(item.upgradeLevel ?? 0);

    if (xpSystem.stored < cost) {
      return { success: false, reason: 'NOT_ENOUGH_XP', cost };
    }

    xpSystem.stored -= cost;
    item.upgradeLevel = (item.upgradeLevel ?? 0) + 1;

    const rarities = ['COMMON', 'RARE', 'VERY_RARE', 'EPIC', 'LEGENDARY', 'UNIQUE'];
    const rarityFromUpgrade = UpgradeSystem.rarityByUpgrade(item.upgradeLevel);
    const previousRank = rarities.indexOf(item.rarity);
    const upgradeRank = rarities.indexOf(rarityFromUpgrade);
    const newRarity = isUnique ? 'UNIQUE'
      : rarities[Math.max(0, previousRank, upgradeRank)];
    item.rarity = newRarity;

    return {
      success: true,
      cost,
      newLevel: item.upgradeLevel,
      newRarity,
    };
  }

  static rarityByUpgrade(upgradeLevel) {
    const t = BALANCE.EQUIPMENT.RARITY_THRESHOLDS;
    if (upgradeLevel >= t.LEGENDARY) return 'LEGENDARY';
    if (upgradeLevel >= t.EPIC)      return 'EPIC';
    if (upgradeLevel >= t.VERY_RARE) return 'VERY_RARE';
    if (upgradeLevel >= t.RARE)      return 'RARE';
    return 'COMMON';
  }

  static upgradeCost(item, isWeapon = true) {
    return isWeapon
      ? XPSystem.weaponUpgradeCost(item.upgradeLevel ?? 0)
      : XPSystem.armorUpgradeCost(item.upgradeLevel ?? 0);
  }
}
