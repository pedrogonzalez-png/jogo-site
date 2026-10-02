// ============================================================
// progression/XPSystem.js
// XP fica acumulada - o jogador decide quando gastar.
// Preparado para valores de nível muito altos (BigInt-safe via float).
// ============================================================
import { BALANCE } from '../data/balance.js';

export class XPSystem {
  constructor() {
    this.stored = 0;   // XP acumulada não gasta
    this.lost   = 0;   // XP deixada no local de morte (recuperável)
    this.deathPosition = null;
  }

  addXP(amount) {
    this.stored += amount;
  }

  /**
   * XP necessária para ir do nível atual ao próximo.
   */
  static xpForLevel(level) {
    return Math.floor(BALANCE.XP.BASE * Math.pow(level, BALANCE.XP.EXPONENT));
  }

  /**
   * XP total necessária desde o nível 1 até o nível N.
   */
  static totalXPForLevel(level) {
    let total = 0;
    for (let i = 1; i < level; i++) {
      total += XPSystem.xpForLevel(i);
    }
    return total;
  }

  /**
   * Mata o personagem: transfere XP stored para lost.
   */
  onDeath(position) {
    this.lost = this.stored;
    this.stored = 0;
    this.deathPosition = { ...position };
  }

  /**
   * Recupera a XP perdida (ao retornar ao local da morte).
   */
  recoverLost() {
    const amount = this.lost;
    this.stored += amount;
    this.lost = 0;
    this.deathPosition = null;
    return amount;
  }

  /**
   * Perde a XP (morreu de novo antes de recuperar).
   */
  purgeLost() {
    const amount = this.lost;
    this.lost = 0;
    this.deathPosition = null;
    return amount;
  }

  /**
   * Custo de XP para upgrade de arma.
   */
  static weaponUpgradeCost(currentLevel) {
    return Math.floor(
      BALANCE.XP.WEAPON_UPGRADE_BASE * Math.pow(BALANCE.XP.WEAPON_UPGRADE_MULT, currentLevel)
    );
  }

  /**
   * Custo de XP para upgrade de armadura.
   */
  static armorUpgradeCost(currentLevel) {
    return Math.floor(
      BALANCE.XP.ARMOR_UPGRADE_BASE * Math.pow(BALANCE.XP.ARMOR_UPGRADE_MULT, currentLevel)
    );
  }

  serialize() {
    return { stored: this.stored, lost: this.lost, deathPosition: this.deathPosition };
  }

  deserialize(data) {
    this.stored = data.stored ?? 0;
    this.lost   = data.lost   ?? 0;
    this.deathPosition = data.deathPosition ?? null;
  }
}
