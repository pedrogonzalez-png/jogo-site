// ============================================================
// world/SeedSystem.js
// RNG determinístico baseado em seed (mulberry32).
// A mesma seed sempre gera o mesmo mundo.
// ============================================================

export class SeededRandom {
  constructor(seed) {
    this.seed = typeof seed === 'string' ? SeededRandom.hashString(seed) : seed;
    this._state = this.seed >>> 0;
  }

  static hashString(str) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
  }

  /** Retorna float [0, 1) */
  next() {
    this._state += 0x6d2b79f5;
    let t = this._state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Inteiro [min, max] */
  int(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /** Elemento aleatório de um array */
  pick(arr) {
    return arr[this.int(0, arr.length - 1)];
  }

  /** Embaralha array in-place */
  shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = this.int(0, i);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /** Fork: cria novo RNG com sub-seed derivada */
  fork(extra = 0) {
    return new SeededRandom(this._state ^ (extra * 0x9e3779b9));
  }
}

export class SeedSystem {
  constructor(seed) {
    this.seedString = String(seed);
    this.rng = new SeededRandom(this.seedString);
  }

  /** RNG para uma área específica */
  areaRNG(areaIndex) {
    return this.rng.fork(areaIndex * 137 + 1);
  }

  /** RNG para uma sala específica */
  roomRNG(areaIndex, roomIndex) {
    return this.rng.fork(areaIndex * 10007 + roomIndex * 31);
  }
}
