// ============================================================
// equipment/ArmorSystem.js
// Gerencia as 4 peças de armadura e calcula stats totais.
// ============================================================
import { ARMOR_SLOTS } from '../data/armor.js';
import { BALANCE } from '../data/balance.js';

export class ArmorSystem {
  constructor() {
    // helmet, chest, gloves, legs
    this.slots = {
      helmet: null,
      chest:  null,
      gloves: null,
      legs:   null,
    };
    // Slots desativados pela penalidade de arma acima do nível
    this.disabledSlots = new Set();
  }

  equip(piece) {
    if (!ARMOR_SLOTS.includes(piece.slot)) return false;
    this.slots[piece.slot] = { ...piece };
    return true;
  }

  unequip(slot) {
    this.slots[slot] = null;
  }

  /**
   * Penalidade por arma acima do nível recomendado.
   * O jogador escolhe quais 2 slots desativar.
   */
  setDisabledSlots(slotArray) {
    this.disabledSlots = new Set(slotArray);
  }

  clearPenalty() {
    this.disabledSlots.clear();
  }

  /** Stats combinados de todas as peças ativas */
  get totalStats() {
    const totals = { hp: 0, defense: 0, attack: 0, attackSpeed: 0, critChance: 0, critMultiplier: 0 };

    for (const [slot, piece] of Object.entries(this.slots)) {
      if (!piece) continue;
      if (this.disabledSlots.has(slot)) continue;

      const mult = 1 + (piece.upgradeLevel ?? 0) * BALANCE.EQUIPMENT.STAT_SCALE_PER_UPGRADE;
      for (const [stat, value] of Object.entries(piece.stats ?? {})) {
        if (totals[stat] !== undefined) {
          totals[stat] += value * mult;
        }
      }
    }

    return totals;
  }

  /** Raridade efetiva de uma peça pelo upgrade */
  static getPieceRarity(piece) {
    if (piece.rarity === 'UNIQUE') return 'UNIQUE';
    const thresholds = BALANCE.EQUIPMENT.RARITY_THRESHOLDS;
    const upg = piece.upgradeLevel ?? 0;
    if (upg >= thresholds.LEGENDARY) return 'LEGENDARY';
    if (upg >= thresholds.EPIC)      return 'EPIC';
    if (upg >= thresholds.VERY_RARE) return 'VERY_RARE';
    if (upg >= thresholds.RARE)      return 'RARE';
    return 'COMMON';
  }

  serialize() {
    return {
      slots: { ...this.slots },
      disabledSlots: [...this.disabledSlots],
    };
  }

  deserialize(data) {
    this.slots = { helmet: null, chest: null, gloves: null, legs: null, ...data.slots };
    this.disabledSlots = new Set(data.disabledSlots ?? []);
  }
}
