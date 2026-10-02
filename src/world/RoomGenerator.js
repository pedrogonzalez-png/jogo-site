// ============================================================
// world/RoomGenerator.js
// Gera salas individuais: tiles de chão, paredes, obstáculos.
// Usa tilemap de Phaser com tiles gerados via tileset programático.
// ============================================================
import { BALANCE } from '../data/balance.js';

const TILE = BALANCE.WORLD.TILE_SIZE; // 32px

// Tipos de tile
export const TILE_TYPES = {
  FLOOR:    0,
  WALL:     1,
  WALL_TOP: 2,
  OBSTACLE: 3,
  DOOR_N:   4,
  DOOR_S:   5,
  DOOR_E:   6,
  DOOR_W:   7,
  SANCTUARY:8,
  CHEST:    9,
  VOID:     10,
};

export class RoomGenerator {
  constructor(rng, biome) {
    this.rng = rng;
    this.biome = biome;
    this.tileW = Math.floor(BALANCE.WORLD.ROOM_WIDTH  / TILE);  // 40
    this.tileH = Math.floor(BALANCE.WORLD.ROOM_HEIGHT / TILE);  // 22
  }

  /**
   * Gera o grid de tiles de uma sala.
   * type: 'NORMAL' | 'SANCTUARY' | 'BOSS' | 'ELITE' | 'ENTRANCE'
   * exits: Set de direções com saída ('N','S','E','W')
   */
  generate(type = 'NORMAL', exits = new Set(['E'])) {
    const grid = this._createGrid();

    this._fillWalls(grid);
    this._carveFloor(grid, type);
    this._addExits(grid, exits);

    if (type === 'SANCTUARY') {
      this._placeSanctuary(grid);
    } else if (type === 'BOSS') {
      this._carveArena(grid);
    } else if (type === 'NORMAL') {
      this._addObstacles(grid);
    }

    return { grid, tileW: this.tileW, tileH: this.tileH, type, exits };
  }

  _createGrid() {
    return Array.from({ length: this.tileH }, () =>
      new Uint8Array(this.tileW).fill(TILE_TYPES.VOID)
    );
  }

  _fillWalls(grid) {
    for (let y = 0; y < this.tileH; y++) {
      for (let x = 0; x < this.tileW; x++) {
        grid[y][x] = (x === 0 || x === this.tileW - 1 || y === 0 || y === this.tileH - 1)
          ? TILE_TYPES.WALL
          : TILE_TYPES.FLOOR;
      }
    }
  }

  _carveFloor(grid, type) {
    // Adiciona paredes internas aleatórias para criar forma orgânica
    if (type === 'BOSS') return; // arenas são abertas

    const wallChance = 0.08;
    for (let y = 2; y < this.tileH - 2; y++) {
      for (let x = 2; x < this.tileW - 2; x++) {
        if (this.rng.next() < wallChance) {
          // Bloco de parede 2x2 para parecer mais natural
          grid[y][x] = TILE_TYPES.WALL;
          if (x + 1 < this.tileW - 1) grid[y][x + 1] = TILE_TYPES.WALL;
          if (y + 1 < this.tileH - 1) grid[y + 1][x] = TILE_TYPES.WALL;
        }
      }
    }
  }

  _carveArena(grid) {
    // Arena circular para boss
    const cx = Math.floor(this.tileW / 2);
    const cy = Math.floor(this.tileH / 2);
    const r = Math.min(cx, cy) - 3;

    for (let y = 1; y < this.tileH - 1; y++) {
      for (let x = 1; x < this.tileW - 1; x++) {
        const dx = x - cx, dy = y - cy;
        if (dx * dx + dy * dy <= r * r) {
          grid[y][x] = TILE_TYPES.FLOOR;
        } else {
          grid[y][x] = TILE_TYPES.WALL;
        }
      }
    }
    // Garante borda sólida
    for (let x = 0; x < this.tileW; x++) {
      grid[0][x] = TILE_TYPES.WALL;
      grid[this.tileH - 1][x] = TILE_TYPES.WALL;
    }
  }

  _addExits(grid, exits) {
    const cw = BALANCE.WORLD.CORRIDOR_WIDTH;
    const mid_x = Math.floor(this.tileW / 2);
    const mid_y = Math.floor(this.tileH / 2);

    if (exits.has('N')) {
      for (let x = mid_x - 1; x <= mid_x + 1; x++) {
        if (x >= 0 && x < this.tileW) grid[0][x] = TILE_TYPES.DOOR_N;
      }
    }
    if (exits.has('S')) {
      for (let x = mid_x - 1; x <= mid_x + 1; x++) {
        if (x >= 0 && x < this.tileW) grid[this.tileH - 1][x] = TILE_TYPES.DOOR_S;
      }
    }
    if (exits.has('E')) {
      for (let y = mid_y - 1; y <= mid_y + 1; y++) {
        if (y >= 0 && y < this.tileH) grid[y][this.tileW - 1] = TILE_TYPES.DOOR_E;
      }
    }
    if (exits.has('W')) {
      for (let y = mid_y - 1; y <= mid_y + 1; y++) {
        if (y >= 0 && y < this.tileH) grid[y][0] = TILE_TYPES.DOOR_W;
      }
    }
  }

  _addObstacles(grid) {
    const count = this.rng.int(3, 8);
    for (let i = 0; i < count; i++) {
      const x = this.rng.int(3, this.tileW - 4);
      const y = this.rng.int(3, this.tileH - 4);
      if (grid[y][x] === TILE_TYPES.FLOOR) {
        grid[y][x] = TILE_TYPES.OBSTACLE;
      }
    }
  }

  _placeSanctuary(grid) {
    const cx = Math.floor(this.tileW / 2);
    const cy = Math.floor(this.tileH / 2);
    grid[cy][cx] = TILE_TYPES.SANCTUARY;
  }
}
