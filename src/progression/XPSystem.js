// ============================================================
// progression/XPSystem.js
// XP fica acumulada - o jogador decide quando gastar.
// Preparado para valores de nível muito altos (BigInt-safe via float).
// ============================================================
import { BALANCE } from '../data/balance.js';

export class XPSystem {
  constructor() {
    this.stored = 0;          // XP acumulada não gasta
    this.lost   = 0;          // XP deixada no local de morte (recuperável)
    this.deathPosition  = null; // { x, y }
    this.deathRoomIndex = null; // Índice da sala onde ocorreu a morte
    this.deathAreaIndex = null; // Índice da área onde ocorreu a morte
  }

  get hasLostXP() {
    return this.deathPosition !== null && this.deathRoomIndex !== null;
  }

  addXP(amount) {
    this.stored += Math.max(0, Math.floor(amount));
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
   * Registra a morte do personagem:
   * - Se já havia XP perdida não recuperada, ela é permanentemente apagada (regra de 2ª morte Souls-like).
   * - A XP acumulada (stored) atual torna-se a nova XP perdida (lost).
   * - A nova posição e sala são registradas para a nova orbe.
   */
  onDeath(position, roomIndex = 0, areaIndex = 0) {
    this.lost = this.stored;
    this.stored = 0;
    this.deathPosition  = position ? { x: Math.round(position.x), y: Math.round(position.y) } : null;
    this.deathRoomIndex = roomIndex;
    this.deathAreaIndex = areaIndex;
  }

  /**
   * Recupera 100% da XP perdida ao tocar a orbe.
   */
  recoverLost() {
    const amount = this.lost;
    this.stored += amount;
    this.lost = 0;
    this.deathPosition  = null;
    this.deathRoomIndex = null;
    this.deathAreaIndex = null;
    return amount;
  }

  /**
   * Limpa permanentemente o estado de XP perdida.
   */
  purgeLost() {
    const amount = this.lost;
    this.lost = 0;
    this.deathPosition  = null;
    this.deathRoomIndex = null;
    this.deathAreaIndex = null;
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
    return {
      stored: this.stored,
      lost: this.lost,
      deathPosition: this.deathPosition ? { ...this.deathPosition } : null,
      deathRoomIndex: this.deathRoomIndex,
      deathAreaIndex: this.deathAreaIndex,
    };
  }

  deserialize(data) {
    this.stored         = data?.stored ?? 0;
    this.lost           = data?.lost   ?? 0;
    this.deathPosition  = data?.deathPosition ? { ...data.deathPosition } : null;
    this.deathRoomIndex = data?.deathRoomIndex ?? null;
    this.deathAreaIndex = data?.deathAreaIndex ?? null;
  }
}
