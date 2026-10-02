// ============================================================
// combat/ParrySystem.js
// Janela de parry e resolução de parry bem-sucedido
// ============================================================
import { BALANCE } from '../data/balance.js';

export class ParrySystem {
  constructor() {
    this._active = false;
    this._timer = 0;
  }

  get isActive() { return this._active; }

  /**
   * Ativa a janela de parry.
   */
  trigger() {
    this._active = true;
    this._timer = BALANCE.PLAYER.PARRY_WINDOW;
  }

  /**
   * Verifica se o ataque pode ser aparado e resolve o parry.
   * Retorna { success, poiseDamage } ou null se não era parriable.
   */
  tryParry(attackCanBeParried) {
    if (!this._active) return null;
    if (!attackCanBeParried) return null;

    this._active = false;
    this._timer = 0;

    return {
      success: true,
      poiseDamage: BALANCE.STAGGER.PARRY_POISE,
    };
  }

  /**
   * Atualiza o timer. delta em ms.
   */
  update(delta) {
    if (!this._active) return;
    this._timer -= delta;
    if (this._timer <= 0) {
      this._active = false;
      this._timer = 0;
    }
  }
}
