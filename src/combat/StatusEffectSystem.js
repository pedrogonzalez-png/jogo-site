// ============================================================
// combat/StatusEffectSystem.js
// Acúmulo e aplicação de status elementais
// ============================================================
import { BALANCE } from '../data/balance.js';

export class StatusEffectSystem {
  constructor() {
    // buildup[element] = valor acumulado atual
    this._buildup = {};
    // activeEffects[element] = { timer, dotTimer }
    this._activeEffects = {};
  }

  /**
   * Adiciona acúmulo de um elemento.
   * buildupAmount: quanto de buildup o ataque adiciona.
   * resistance: resistência da entidade a este elemento [0-1].
   * Returns: { activated, element } se um status foi ativado.
   */
  addBuildup(element, buildupAmount, resistance = 0, arcaneBonus = 0) {
    const config = BALANCE.STATUS[element];
    if (!config) return null;

    if (!this._buildup[element]) this._buildup[element] = 0;
    if (this._activeEffects[element]) return null; // já ativo

    if (!Number.isFinite(buildupAmount) || buildupAmount <= 0) return null;
    const safeResistance = Number.isFinite(resistance) ? Math.max(0, Math.min(1, resistance)) : 0;
    const safeArcane = Number.isFinite(arcaneBonus) ? Math.max(0, arcaneBonus) : 0;
    const effectiveBuildup = buildupAmount * (1 - safeResistance) * (1 + safeArcane);
    this._buildup[element] += effectiveBuildup;

    if (this._buildup[element] >= config.limit) {
      this._buildup[element] = 0;
      this._activateStatus(element, config);
      return { activated: true, element };
    }
    return null;
  }

  _activateStatus(element, config) {
    this._activeEffects[element] = {
      timer: config.duration,
      dotTimer: 1000,
      config,
      element,
    };
  }

  /**
   * Atualiza status ativos. delta em ms.
   * Retorna array de { element, damage } para dano por tick.
   */
  update(delta) {
    const ticks = [];

    if (!Number.isFinite(delta) || delta <= 0) return ticks;
    for (const [element, effect] of Object.entries(this._activeEffects)) {
      // Não aplicar dano por tempo posterior à expiração do status.
      const elapsed = Math.min(delta, Math.max(0, effect.timer));
      effect.timer -= delta;

      if (effect.config.dot > 0) {
        effect.dotTimer -= elapsed;
        // Frames atrasados podem conter mais de um tick.
        while (effect.dotTimer <= 0) {
          ticks.push({ element, damage: effect.config.dot });
          effect.dotTimer += 1000;
        }
      }
      if (effect.timer <= 0) delete this._activeEffects[element];
    }

    return ticks;
  }

  getActiveStatuses() {
    return Object.keys(this._activeEffects);
  }

  getBuildups() {
    return { ...this._buildup };
  }

  hasActive(element) {
    return !!this._activeEffects[element];
  }

  getSlowFactor() {
    if (this._activeEffects['ICE']) return BALANCE.STATUS.ICE.slowFactor;
    return 1.0;
  }

  clear() {
    this._buildup = {};
    this._activeEffects = {};
  }
}
