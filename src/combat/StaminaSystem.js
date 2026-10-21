// ============================================================
// combat/StaminaSystem.js
// Gerencia stamina de qualquer entidade que a possua.
// ============================================================
import { BALANCE } from '../data/balance.js';

export class StaminaSystem {
  constructor(maxStamina) {
    this.max = maxStamina;
    this.current = maxStamina;
    this._regenTimer = 0;
    this._recovering = false;
  }

  get percentage() { return this.current / this.max; }

  /**
   * Tenta gastar stamina. Retorna true se bem-sucedido.
   */
  spend(amount) {
    if (!Number.isFinite(amount) || amount < 0 || this.current < amount) return false;
    this.current = Math.max(0, this.current - amount);
    this._regenTimer = 0;
    this._recovering = false;
    return true;
  }

  /**
   * Força o gasto sem verificar disponibilidade (para bloqueio de guarda).
   */
  forceSpend(amount) {
    if (!Number.isFinite(amount) || amount < 0) return;
    this.current = Math.max(0, this.current - amount);
    this._regenTimer = 0;
    this._recovering = false;
  }

  restore(amount) {
    if (!Number.isFinite(amount) || amount <= 0) return;
    this.current = Math.min(this.max, this.current + amount);
  }

  restoreFull() {
    this.current = this.max;
  }

  /**
   * Atualiza o timer de regeneração. Chame a cada frame com delta em ms.
   */
  update(delta, regenDelay = BALANCE.PLAYER.STAMINA_REGEN_DELAY,
                regenRate  = BALANCE.PLAYER.STAMINA_REGEN_RATE) {
    if (this.current >= this.max) return;

    if (!this._recovering) {
      this._regenTimer += delta;
      if (this._regenTimer >= regenDelay) {
        this._recovering = true;
      }
    } else {
      this.current = Math.min(this.max, this.current + (regenRate * delta) / 1000);
    }
  }

  isEmpty() { return this.current <= 0; }
  isFull()  { return this.current >= this.max; }
}
