// ============================================================
// combat/BalanceSystem.js
// Sistema de Equilíbrio/Stagger (inspirado em poise)
// ============================================================
import { BALANCE } from '../data/balance.js';

export class BalanceSystem {
  constructor(maxBalance) {
    this.max = maxBalance;
    this.current = maxBalance;
    this._recoveryTimer = 0;
    this._isStaggered = false;
    this._staggerTimer = 0;
  }

  get balance()     { return this.current; }
  get maxBalance()  { return this.max; }
  get isStaggered() { return this._isStaggered; }
  get percentage()  { return this.current / this.max; }

  /**
   * Aplica dano de equilíbrio. Retorna true se causou stagger.
   */
  takePoiseDamage(amount) {
    if (this._isStaggered) return false;

    this.current = Math.max(0, this.current - amount);
    this._recoveryTimer = 0;

    if (this.current <= 0) {
      this._triggerStagger();
      return true;
    }
    return false;
  }

  takeBalanceDamage(amount) {
    return this.takePoiseDamage(amount);
  }

  _triggerStagger() {
    this._isStaggered = true;
    this._staggerTimer = BALANCE.STAGGER.STAGGER_DURATION;
    this.current = 0; // Fica zerado durante a vulnerabilidade
    this._recoveryTimer = 0;
  }

  /**
   * Atualiza timers. delta em ms.
   */
  update(delta) {
    if (this._isStaggered) {
      this._staggerTimer -= delta;
      if (this._staggerTimer <= 0) {
        this._isStaggered = false;
        this._staggerTimer = 0;
        this._recoveryTimer = 0; // Inicia contagem para recuperação gradual
      }
      return;
    }

    if (this.current < this.max) {
      this._recoveryTimer += delta;
      if (this._recoveryTimer >= BALANCE.STAGGER.RECOVERY_DELAY) {
        const regen = (BALANCE.STAGGER.RECOVERY_RATE * delta) / 1000;
        this.current = Math.min(this.max, this.current + regen);
      }
    }
  }

  restoreFull() {
    this.current = this.max;
    this._isStaggered = false;
    this._staggerTimer = 0;
    this._recoveryTimer = 0;
  }
}
