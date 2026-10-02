// ============================================================
// progression/LevelSystem.js
// Nível do jogador - sem teto máximo.
// Level up é manual (o jogador decide quando).
// ============================================================
import { XPSystem } from './XPSystem.js';

export class LevelSystem {
  constructor(xpSystem, statSystem) {
    this.level = 1;
    this.xpSystem = xpSystem;
    this.statSystem = statSystem;
  }

  /**
   * XP necessária para o próximo nível.
   */
  get xpForNextLevel() {
    return XPSystem.xpForLevel(this.level);
  }

  /**
   * Verifica se pode subir de nível.
   */
  canLevelUp() {
    return this.xpSystem.stored >= this.xpForNextLevel;
  }

  /**
   * Sobe de nível (consome XP, concede 1 ponto).
   * O jogador distribui os pontos quando quiser.
   */
  levelUp() {
    if (!this.canLevelUp()) return false;
    this.xpSystem.stored -= this.xpForNextLevel;
    this.level += 1;
    this.statSystem.addFreePoints(1);
    return true;
  }

  /**
   * Quantos levels podem ser comprados com a XP atual.
   */
  availableLevelUps() {
    let count = 0;
    let xpLeft = this.xpSystem.stored;
    let lvl = this.level;
    while (xpLeft >= XPSystem.xpForLevel(lvl)) {
      xpLeft -= XPSystem.xpForLevel(lvl);
      lvl++;
      count++;
    }
    return count;
  }

  serialize() {
    return { level: this.level };
  }

  deserialize(data) {
    this.level = data.level ?? 1;
  }
}
