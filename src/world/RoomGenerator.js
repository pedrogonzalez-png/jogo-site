// ============================================================
// world/RoomGenerator.js
// Gera salas individuais: tiles de chão, paredes, obstáculos.
// Usa tilemap de Phaser com tiles gerados via tileset programático.
// Cada bioma tem padrões de sala distintos com composição real.
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
  HAZARD:   11,
};

// ─────────────────────────────────────────────────────────────
// Padrões de sala por bioma.
// Cada padrão descreve a composição estrutural da sala:
// wallChance, pillarGrid, corridorStyle, hazardDensity, obstacleCount
// ─────────────────────────────────────────────────────────────
const BIOME_PATTERNS = {
  // ── Arredores Cinzentos ───────────────────────────────────
  ARREDORES_CINZENTOS: [
    // Padrão 0: Planície aberta com manchas de cinza (velocidade reduzida)
    { wallChance: 0.04, pillarGrid: false, corridorStyle: 'open',    hazardDensity: 4, obstacleCount: [2, 4] },
    // Padrão 1: Ruínas com pilares centrais
    { wallChance: 0.06, pillarGrid: true,  corridorStyle: 'pillars', hazardDensity: 3, obstacleCount: [4, 7] },
    // Padrão 2: Corredor de cinzas densas
    { wallChance: 0.10, pillarGrid: false, corridorStyle: 'narrow',  hazardDensity: 6, obstacleCount: [3, 5] },
    // Padrão combate especial: Emboscada (sala aberta com arredores cobertos)
    { wallChance: 0.02, pillarGrid: false, corridorStyle: 'cover',   hazardDensity: 5, obstacleCount: [5, 8], isSpecial: true },
  ],
  // ── Aqueduto Submerso ─────────────────────────────────────
  AQUEDUTO_SUBMERSO: [
    // Padrão 0: Canal largo
    { wallChance: 0.03, pillarGrid: false, corridorStyle: 'canal',   hazardDensity: 4, obstacleCount: [1, 3] },
    // Padrão 1: Câmara com pilares submersos
    { wallChance: 0.05, pillarGrid: true,  corridorStyle: 'pillars', hazardDensity: 3, obstacleCount: [3, 5] },
    // Padrão 2: Corrente forte em corredor estreito
    { wallChance: 0.08, pillarGrid: false, corridorStyle: 'narrow',  hazardDensity: 6, obstacleCount: [2, 4] },
    // Especial: Câmara da correnteza
    { wallChance: 0.02, pillarGrid: false, corridorStyle: 'open',    hazardDensity: 8, obstacleCount: [1, 2], isSpecial: true },
  ],
  // ── Catacumbas Ecoantes ────────────────────────────────────
  CATACUMBAS_ECOANTES: [
    // Padrão 0: Cripta aberta com pisos frágeis
    { wallChance: 0.06, pillarGrid: false, corridorStyle: 'open',    hazardDensity: 4, obstacleCount: [2, 4] },
    // Padrão 1: Labirinto de criptas
    { wallChance: 0.14, pillarGrid: false, corridorStyle: 'maze',    hazardDensity: 3, obstacleCount: [5, 9] },
    // Padrão 2: Grande salão ecoante
    { wallChance: 0.04, pillarGrid: true,  corridorStyle: 'pillars', hazardDensity: 5, obstacleCount: [3, 6] },
    // Especial: Câmara de eco (muitos pisos frágeis)
    { wallChance: 0.03, pillarGrid: false, corridorStyle: 'open',    hazardDensity: 10, obstacleCount: [2, 3], isSpecial: true },
  ],
  // ── Forja Maculada ─────────────────────────────────────────
  FORJA_MACULADA: [
    // Padrão 0: Oficina com mesas e erupções
    { wallChance: 0.12, pillarGrid: false, corridorStyle: 'cover',   hazardDensity: 4, obstacleCount: [4, 7] },
    // Padrão 1: Câmara de fundição aberta
    { wallChance: 0.05, pillarGrid: false, corridorStyle: 'open',    hazardDensity: 5, obstacleCount: [2, 4] },
    // Padrão 2: Corredor de forjas (denso em obstáculos)
    { wallChance: 0.16, pillarGrid: false, corridorStyle: 'narrow',  hazardDensity: 6, obstacleCount: [6, 10] },
    // Especial: Arena de lava (zona de fogo no centro)
    { wallChance: 0.04, pillarGrid: false, corridorStyle: 'open',    hazardDensity: 8, obstacleCount: [3, 5], isSpecial: true },
  ],
  // ── Jardim Pútrido ─────────────────────────────────────────
  JARDIM_PUTRIDO: [
    // Padrão 0: Jardim denso de plantas
    { wallChance: 0.14, pillarGrid: false, corridorStyle: 'organic', hazardDensity: 5, obstacleCount: [4, 8] },
    // Padrão 1: Clareira com plantas venenosas
    { wallChance: 0.06, pillarGrid: false, corridorStyle: 'open',    hazardDensity: 6, obstacleCount: [3, 5] },
    // Padrão 2: Matagal labiríntico
    { wallChance: 0.18, pillarGrid: false, corridorStyle: 'maze',    hazardDensity: 4, obstacleCount: [6, 10] },
    // Especial: Jardim das esporas (alta densidade)
    { wallChance: 0.08, pillarGrid: false, corridorStyle: 'organic', hazardDensity: 9, obstacleCount: [4, 6], isSpecial: true },
  ],
  // ── Cidade Subterrânea ─────────────────────────────────────
  CIDADE_SUBTERRANEA: [
    // Padrão 0: Rua principal com lanternas
    { wallChance: 0.06, pillarGrid: true,  corridorStyle: 'pillars', hazardDensity: 3, obstacleCount: [2, 5] },
    // Padrão 1: Edifício abandonado com passagens condicionais
    { wallChance: 0.12, pillarGrid: false, corridorStyle: 'cover',   hazardDensity: 4, obstacleCount: [5, 8] },
    // Padrão 2: Praça iluminada
    { wallChance: 0.04, pillarGrid: false, corridorStyle: 'open',    hazardDensity: 2, obstacleCount: [2, 4] },
    // Especial: Câmara das lanternas (muitas passagens a abrir)
    { wallChance: 0.08, pillarGrid: false, corridorStyle: 'cover',   hazardDensity: 6, obstacleCount: [4, 6], isSpecial: true },
  ],
  // ── Abismo Cristalino ──────────────────────────────────────
  ABISMO_CRISTALINO: [
    // Padrão 0: Caverna cristalina com cristais dispersos
    { wallChance: 0.07, pillarGrid: true,  corridorStyle: 'pillars', hazardDensity: 4, obstacleCount: [3, 5] },
    // Padrão 1: Galeria de cristais
    { wallChance: 0.05, pillarGrid: false, corridorStyle: 'open',    hazardDensity: 5, obstacleCount: [2, 4] },
    // Padrão 2: Labirinto de cristal
    { wallChance: 0.13, pillarGrid: false, corridorStyle: 'maze',    hazardDensity: 3, obstacleCount: [6, 9] },
    // Especial: Câmara do prism (cristais em todos os ângulos)
    { wallChance: 0.04, pillarGrid: true,  corridorStyle: 'pillars', hazardDensity: 8, obstacleCount: [5, 7], isSpecial: true },
  ],
  // ── Cárcere de Sangue ─────────────────────────────────────
  CARCERE_DE_SANGUE: [
    // Padrão 0: Cela aberta com poças
    { wallChance: 0.08, pillarGrid: false, corridorStyle: 'open',    hazardDensity: 5, obstacleCount: [2, 4] },
    // Padrão 1: Corredor de prisão com poças
    { wallChance: 0.12, pillarGrid: false, corridorStyle: 'narrow',  hazardDensity: 4, obstacleCount: [4, 6] },
    // Padrão 2: Grande câmara do sacrifício
    { wallChance: 0.05, pillarGrid: true,  corridorStyle: 'pillars', hazardDensity: 6, obstacleCount: [3, 5] },
    // Especial: Câmara do banho de sangue (poças centrais)
    { wallChance: 0.03, pillarGrid: false, corridorStyle: 'open',    hazardDensity: 8, obstacleCount: [2, 3], isSpecial: true },
  ],
  // ── Biblioteca do Oculto ──────────────────────────────────
  BIBLIOTECA_DO_OCULTO: [
    // Padrão 0: Sala de leitura com prateleiras (obstáculos)
    { wallChance: 0.10, pillarGrid: false, corridorStyle: 'shelves', hazardDensity: 3, obstacleCount: [5, 9] },
    // Padrão 1: Corredor de livros (estreito e labiríntico)
    { wallChance: 0.15, pillarGrid: false, corridorStyle: 'maze',    hazardDensity: 4, obstacleCount: [6, 10] },
    // Padrão 2: Sala de estudo com portas ilusórias
    { wallChance: 0.08, pillarGrid: false, corridorStyle: 'open',    hazardDensity: 4, obstacleCount: [3, 6] },
    // Especial: Sala das ilusões (muitas portas ilusórias)
    { wallChance: 0.06, pillarGrid: false, corridorStyle: 'open',    hazardDensity: 7, obstacleCount: [2, 4], isSpecial: true },
  ],
  // ── Coração do Abismo ─────────────────────────────────────
  CORACAO_DO_ABISMO: [
    // Padrão 0: Void aberto com zonas gravitacionais
    { wallChance: 0.04, pillarGrid: false, corridorStyle: 'open',    hazardDensity: 4, obstacleCount: [1, 3] },
    // Padrão 1: Fracturas do abismo com pilares
    { wallChance: 0.08, pillarGrid: true,  corridorStyle: 'pillars', hazardDensity: 5, obstacleCount: [3, 5] },
    // Padrão 2: Corredor do vazio
    { wallChance: 0.06, pillarGrid: false, corridorStyle: 'narrow',  hazardDensity: 6, obstacleCount: [2, 4] },
    // Especial: Câmara de anomalia (zonas múltiplas)
    { wallChance: 0.02, pillarGrid: false, corridorStyle: 'open',    hazardDensity: 8, obstacleCount: [1, 2], isSpecial: true },
  ],
};

// Padrão fallback
const DEFAULT_PATTERNS = [
  { wallChance: 0.07, pillarGrid: false, corridorStyle: 'open',    hazardDensity: 3, obstacleCount: [3, 6] },
  { wallChance: 0.05, pillarGrid: true,  corridorStyle: 'pillars', hazardDensity: 4, obstacleCount: [4, 7] },
  { wallChance: 0.10, pillarGrid: false, corridorStyle: 'narrow',  hazardDensity: 5, obstacleCount: [3, 5] },
];

export class RoomGenerator {
  constructor(rng, biome) {
    this.rng = rng;
    this.biome = biome;
    this.tileW = Math.floor(BALANCE.WORLD.ROOM_WIDTH  / TILE);  // 40
    this.tileH = Math.floor(BALANCE.WORLD.ROOM_HEIGHT / TILE);  // 22
  }

  /**
   * Gera o grid de tiles de uma sala.
   * type: 'NORMAL' | 'SANCTUARY' | 'BOSS' | 'ELITE' | 'ENTRANCE' | 'CHEST'
   * exits: Set de direções com saída ('N','S','E','W')
   */
  generate(type = 'NORMAL', exits = new Set(['E'])) {
    const grid = this._createGrid();

    this._fillWalls(grid);
    this._carveFloor(grid, type, exits);
    this._addExits(grid, exits);

    if (type === 'SANCTUARY') {
      this._placeSanctuary(grid);
    } else if (type === 'BOSS') {
      this._carveBossArena(grid, exits);
    } else if (['NORMAL', 'ELITE', 'CHEST', 'ENTRANCE'].includes(type)) {
      const pattern = this._selectPattern(type);
      this._addObstaclesWithPattern(grid, exits, pattern, type);
      if (type !== 'ENTRANCE') {
        this._addHazardsWithPattern(grid, exits, pattern, type);
      }
      if (pattern.pillarGrid && type !== 'ENTRANCE') {
        this._addPillarGrid(grid, exits);
      }
    }

    // Garante fisicamente corredores desobstruídos entre todas as portas declaradas
    this._carveHallways(grid, exits);

    // Valida automaticamente a conectividade da sala
    this.validateConnectivity(grid, exits);

    // Armazena o padrão escolhido para referência da cena
    this._lastPattern = this._selectPattern(type);

    return { grid, tileW: this.tileW, tileH: this.tileH, type, exits };
  }

  /** Seleciona um padrão de sala baseado no bioma e tipo. */
  _selectPattern(type) {
    const biomeId   = this.biome?.id;
    const patterns  = (biomeId && BIOME_PATTERNS[biomeId]) || DEFAULT_PATTERNS;

    if (type === 'ELITE') {
      // Elite: usa o padrão "combate especial" se existir (índice 3)
      return patterns[3] ?? patterns[this.rng.int(0, 2)];
    } else if (type === 'CHEST') {
      // Baú: padrão mais fechado (mais obstáculos)
      return { ...patterns[0], wallChance: 0.12, obstacleCount: [5, 8], hazardDensity: 2 };
    } else if (type === 'ENTRANCE') {
      // Entrada: ampla, com obstáculos de pilar e poça d água detalhada
      return { ...patterns[0], wallChance: 0.02, obstacleCount: [2, 3], hazardDensity: 2 };
    }
    // NORMAL: varia entre os 3 padrões comuns
    return patterns[this.rng.int(0, 2)];
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

  _isReserved(x, y, exits) {
    const mid_x = Math.floor(this.tileW / 2);
    const mid_y = Math.floor(this.tileH / 2);

    // Hub central
    if (Math.abs(x - mid_x) <= 3 && Math.abs(y - mid_y) <= 3) return true;

    // Corredor Norte
    if (exits.has('N') && Math.abs(x - mid_x) <= 2 && y <= mid_y) return true;

    // Corredor Sul
    if (exits.has('S') && Math.abs(x - mid_x) <= 2 && y >= mid_y) return true;

    // Corredor Oeste
    if (exits.has('W') && Math.abs(y - mid_y) <= 2 && x <= mid_x) return true;

    // Corredor Leste
    if (exits.has('E') && Math.abs(y - mid_y) <= 2 && x >= mid_x) return true;

    return false;
  }

  _carveFloor(grid, type, exits) {
    if (type === 'BOSS') return; // arenas são abertas — tratadas separadamente

    const pattern = this._selectPattern(type);
    const wallChance = pattern.wallChance;

    for (let y = 2; y < this.tileH - 2; y++) {
      for (let x = 2; x < this.tileW - 2; x++) {
        if (this._isReserved(x, y, exits)) continue;

        if (this.rng.next() < wallChance) {
          grid[y][x] = TILE_TYPES.WALL;
          if (x + 1 < this.tileW - 2 && !this._isReserved(x + 1, y, exits)) {
            grid[y][x + 1] = TILE_TYPES.WALL;
          }
          if (y + 1 < this.tileH - 2 && !this._isReserved(x, y + 1, exits)) {
            grid[y + 1][x] = TILE_TYPES.WALL;
          }
        }
      }
    }

    // Aplica estrutura específica do corridorStyle
    this._applyCorridorStyle(grid, exits, pattern);
  }

  /** Aplica padrão estrutural diferenciado por estilo de corredor. */
  _applyCorridorStyle(grid, exits, pattern) {
    const cx = Math.floor(this.tileW / 2);
    const cy = Math.floor(this.tileH / 2);

    switch (pattern.corridorStyle) {
      case 'pillars': {
        // Pilares em grade simétrica fora do hub
        const step = 6;
        for (let py = 4; py < this.tileH - 4; py += step) {
          for (let px = 4; px < this.tileW - 4; px += step) {
            if (this._isReserved(px, py, exits)) continue;
            if (this._isReserved(px + 1, py, exits)) continue;
            if (grid[py][px] === TILE_TYPES.FLOOR) {
              grid[py][px] = TILE_TYPES.WALL;
              if (px + 1 < this.tileW - 1 && !this._isReserved(px + 1, py, exits))
                grid[py][px + 1] = TILE_TYPES.WALL;
              if (py + 1 < this.tileH - 1 && !this._isReserved(px, py + 1, exits))
                grid[py + 1][px] = TILE_TYPES.WALL;
            }
          }
        }
        break;
      }
      case 'narrow': {
        // Paredes laterais deixando corredor central estreito
        const laneHalf = 3;
        for (let y = 3; y < this.tileH - 3; y++) {
          if (Math.abs(y - cy) > laneHalf + 1) {
            for (let x = 3; x < this.tileW - 3; x++) {
              if (this._isReserved(x, y, exits)) continue;
              if (this.rng.next() < 0.65 && grid[y][x] === TILE_TYPES.FLOOR) {
                grid[y][x] = TILE_TYPES.WALL;
              }
            }
          }
        }
        break;
      }
      case 'maze': {
        // Linhas de parede fragmentadas para criar labirinto
        const wallRows = Math.floor(this.tileH / 6);
        for (let r = 0; r < wallRows; r++) {
          const wy2 = 4 + r * 5;
          if (wy2 >= this.tileH - 4) break;
          // Alterna abertura esquerda/direita
          const openLeft = r % 2 === 0;
          const startX   = openLeft ? cx : 3;
          const endX     = openLeft ? this.tileW - 4 : cx;
          for (let x = startX; x < endX; x++) {
            if (this._isReserved(x, wy2, exits)) continue;
            if (grid[wy2][x] === TILE_TYPES.FLOOR) grid[wy2][x] = TILE_TYPES.WALL;
          }
        }
        break;
      }
      case 'cover': {
        // Blocos de cobertura em posições estratégicas para combate
        const positions = [
          [cx - 8, cy - 4], [cx + 8, cy - 4],
          [cx - 8, cy + 4], [cx + 8, cy + 4],
          [cx - 4, cy - 7], [cx + 4, cy + 7],
        ];
        for (const [px, py] of positions) {
          if (px >= 3 && px < this.tileW - 3 && py >= 2 && py < this.tileH - 2) {
            if (!this._isReserved(px, py, exits) && grid[py][px] === TILE_TYPES.FLOOR) {
              grid[py][px] = TILE_TYPES.OBSTACLE;
              if (px + 1 < this.tileW - 2 && !this._isReserved(px + 1, py, exits))
                grid[py][px + 1] = TILE_TYPES.OBSTACLE;
            }
          }
        }
        break;
      }
      case 'canal': {
        // Paredes laterais formando canal principal
        for (let y = 3; y < this.tileH - 3; y++) {
          for (let x = 3; x < this.tileW - 3; x++) {
            if (this._isReserved(x, y, exits)) continue;
            if ((y < cy - 5 || y > cy + 5) && this.rng.next() < 0.5) {
              if (grid[y][x] === TILE_TYPES.FLOOR) grid[y][x] = TILE_TYPES.WALL;
            }
          }
        }
        break;
      }
      case 'organic': {
        // Disposição orgânica de paredes (jardim denso)
        for (let y = 3; y < this.tileH - 3; y++) {
          for (let x = 3; x < this.tileW - 3; x++) {
            if (this._isReserved(x, y, exits)) continue;
            // Padrão de "manchas" orgânicas
            const nx = x / this.tileW;
            const ny = y / this.tileH;
            const wave = Math.sin(nx * 8) * Math.cos(ny * 6);
            if (wave > 0.6 && this.rng.next() < 0.5 && grid[y][x] === TILE_TYPES.FLOOR) {
              grid[y][x] = TILE_TYPES.WALL;
            }
          }
        }
        break;
      }
      case 'shelves': {
        // Fileiras de obstáculos como prateleiras de biblioteca
        for (let r = 0; r < 4; r++) {
          const sy = 5 + r * 3;
          if (sy >= this.tileH - 4) break;
          const startX = (r % 2 === 0) ? 5 : cx + 3;
          const endX   = (r % 2 === 0) ? cx - 3 : this.tileW - 5;
          for (let x = startX; x < endX; x++) {
            if (this._isReserved(x, sy, exits)) continue;
            if (grid[sy][x] === TILE_TYPES.FLOOR) grid[sy][x] = TILE_TYPES.OBSTACLE;
          }
        }
        break;
      }
      default:
        break; // 'open': sem modificação extra
    }
  }

  _carveHallways(grid, exits) {
    const mid_x = Math.floor(this.tileW / 2);
    const mid_y = Math.floor(this.tileH / 2);

    // Hub central livre
    for (let y = mid_y - 2; y <= mid_y + 2; y++) {
      for (let x = mid_x - 2; x <= mid_x + 2; x++) {
        if (x > 0 && x < this.tileW - 1 && y > 0 && y < this.tileH - 1) {
          if (grid[y][x] === TILE_TYPES.WALL || grid[y][x] === TILE_TYPES.OBSTACLE) {
            grid[y][x] = TILE_TYPES.FLOOR;
          }
        }
      }
    }

    // Garante corredor desobstruído para cada porta declarada
    if (exits.has('N')) {
      for (let y = 1; y <= mid_y; y++) {
        for (let x = mid_x - 1; x <= mid_x + 1; x++) {
          grid[y][x] = TILE_TYPES.FLOOR;
        }
      }
    }

    if (exits.has('S')) {
      for (let y = mid_y; y < this.tileH - 1; y++) {
        for (let x = mid_x - 1; x <= mid_x + 1; x++) {
          grid[y][x] = TILE_TYPES.FLOOR;
        }
      }
    }

    if (exits.has('W')) {
      for (let x = 1; x <= mid_x; x++) {
        for (let y = mid_y - 1; y <= mid_y + 1; y++) {
          grid[y][x] = TILE_TYPES.FLOOR;
        }
      }
    }

    if (exits.has('E')) {
      for (let x = mid_x; x < this.tileW - 1; x++) {
        for (let y = mid_y - 1; y <= mid_y + 1; y++) {
          grid[y][x] = TILE_TYPES.FLOOR;
        }
      }
    }
  }

  /** Arena de chefe com formato dependente do bioma */
  _carveBossArena(grid, exits) {
    const cx = Math.floor(this.tileW / 2);
    const cy = Math.floor(this.tileH / 2);
    const biomeId = this.biome?.id;

    if (biomeId === 'FORJA_MACULADA' || biomeId === 'CATACUMBAS_ECOANTES') {
      // Arena rectangular com pilares nos cantos
      for (let y = 1; y < this.tileH - 1; y++) {
        for (let x = 1; x < this.tileW - 1; x++) {
          grid[y][x] = TILE_TYPES.FLOOR;
        }
      }
      // Pilares nos cantos internos
      const pillarPositions = [
        [4, 4], [this.tileW - 5, 4],
        [4, this.tileH - 5], [this.tileW - 5, this.tileH - 5],
      ];
      for (const [px, py] of pillarPositions) {
        if (grid[py][px] !== undefined) {
          grid[py][px]     = TILE_TYPES.WALL;
          grid[py][px + 1] = TILE_TYPES.WALL;
          grid[py + 1][px] = TILE_TYPES.WALL;
        }
      }
    } else if (biomeId === 'ABISMO_CRISTALINO' || biomeId === 'CORACAO_DO_ABISMO') {
      // Arena circular
      const r = Math.min(cx, cy) - 3;
      for (let y = 1; y < this.tileH - 1; y++) {
        for (let x = 1; x < this.tileW - 1; x++) {
          const dx = x - cx, dy = y - cy;
          grid[y][x] = (dx * dx + dy * dy <= r * r) ? TILE_TYPES.FLOOR : TILE_TYPES.WALL;
        }
      }
    } else if (biomeId === 'JARDIM_PUTRIDO' || biomeId === 'BIBLIOTECA_DO_OCULTO') {
      // Arena octagonal
      for (let y = 1; y < this.tileH - 1; y++) {
        for (let x = 1; x < this.tileW - 1; x++) {
          const dx = Math.abs(x - cx);
          const dy = Math.abs(y - cy);
          const limit = Math.min(cx, cy) - 2;
          grid[y][x] = (dx + dy <= limit * 1.4 && dx <= limit && dy <= limit)
            ? TILE_TYPES.FLOOR : TILE_TYPES.WALL;
        }
      }
    } else {
      // Padrão: arena circular genérica
      const r = Math.min(cx, cy) - 3;
      for (let y = 1; y < this.tileH - 1; y++) {
        for (let x = 1; x < this.tileW - 1; x++) {
          const dx = x - cx, dy = y - cy;
          grid[y][x] = (dx * dx + dy * dy <= r * r) ? TILE_TYPES.FLOOR : TILE_TYPES.WALL;
        }
      }
    }

    // Garante borda sólida
    for (let x = 0; x < this.tileW; x++) {
      grid[0][x] = TILE_TYPES.WALL;
      grid[this.tileH - 1][x] = TILE_TYPES.WALL;
    }
    for (let y = 0; y < this.tileH; y++) {
      grid[y][0] = TILE_TYPES.WALL;
      grid[y][this.tileW - 1] = TILE_TYPES.WALL;
    }

    // Adiciona alguns hazards na arena de boss (1-2 perigos temáticos)
    this._addBossArenaHazards(grid, exits);
  }

  _addBossArenaHazards(grid, exits) {
    const count = this.rng.int(1, 3);
    for (let i = 0; i < count; i++) {
      const x = this.rng.int(5, this.tileW - 6);
      const y = this.rng.int(4, this.tileH - 5);
      if (!this._isReserved(x, y, exits) && grid[y][x] === TILE_TYPES.FLOOR) {
        grid[y][x] = TILE_TYPES.HAZARD;
      }
    }
  }

  _addExits(grid, exits) {
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

  /** Adiciona obstáculos considerando o padrão selecionado. */
  _addObstaclesWithPattern(grid, exits, pattern, type) {
    const [minO, maxO] = pattern.obstacleCount ?? [3, 6];
    const count = this.rng.int(minO, maxO);

    for (let i = 0; i < count; i++) {
      const x = this.rng.int(3, this.tileW - 4);
      const y = this.rng.int(3, this.tileH - 4);
      if (!this._isReserved(x, y, exits) && grid[y][x] === TILE_TYPES.FLOOR) {
        grid[y][x] = TILE_TYPES.OBSTACLE;
      }
    }
  }

  /** Adiciona hazards SOMENTE nos biomas corretos e em posições válidas. */
  _addHazardsWithPattern(grid, exits, pattern, type) {
    if (type === 'SANCTUARY') return;

    const biomeId = this.biome?.id;
    if (!biomeId) return;

    const density = pattern.hazardDensity ?? 3;
    if (type === 'BOSS') return;

    // Limite por tipo de sala
    const maxHazards = type === 'ENTRANCE' ? 2 :
                       type === 'ELITE' ? Math.min(density, 4) :
                       type === 'CHEST' ? Math.min(density, 2) :
                       density;

    let placed = 0;
    let attempts = 0;
    while (placed < maxHazards && attempts < 100) {
      attempts++;
      const x = this.rng.int(4, this.tileW - 5);
      const y = this.rng.int(3, this.tileH - 4);

      // Nunca perto da entrada (primeiras 4 colunas reservadas para spawn)
      if (x < 5 && y >= Math.floor(this.tileH / 2) - 3 && y <= Math.floor(this.tileH / 2) + 3) continue;

      if (!this._isReserved(x, y, exits) && grid[y][x] === TILE_TYPES.FLOOR) {
        grid[y][x] = TILE_TYPES.HAZARD;
        placed++;
      }
    }
  }

  /** Pilares simétricos para salas com corridorStyle 'pillars'. */
  _addPillarGrid(grid, exits) {
    const cx = Math.floor(this.tileW / 2);
    const cy = Math.floor(this.tileH / 2);
    const positions = [
      [cx - 8, cy - 4], [cx + 8, cy - 4],
      [cx - 8, cy + 4], [cx + 8, cy + 4],
    ];
    for (const [px, py] of positions) {
      if (px >= 2 && px < this.tileW - 2 && py >= 2 && py < this.tileH - 2) {
        if (!this._isReserved(px, py, exits) && grid[py][px] === TILE_TYPES.FLOOR) {
          grid[py][px] = TILE_TYPES.WALL;
          if (px + 1 < this.tileW - 1 && !this._isReserved(px + 1, py, exits))
            grid[py][px + 1] = TILE_TYPES.WALL;
        }
      }
    }
  }

  _placeSanctuary(grid) {
    const cx = Math.floor(this.tileW / 2);
    const cy = Math.floor(this.tileH / 2);
    grid[cy][cx] = TILE_TYPES.SANCTUARY;
  }

  /** Mantido por compatibilidade */
  _addObstacles(grid, exits) {
    const pattern = this._selectPattern('NORMAL');
    this._addObstaclesWithPattern(grid, exits, pattern, 'NORMAL');
  }

  /** Mantido por compatibilidade */
  _addHazards(grid, exits, type) {
    const pattern = this._selectPattern(type);
    this._addHazardsWithPattern(grid, exits, pattern, type);
  }

  /**
   * Validação automática de conectividade via Flood Fill (BFS):
   * Confirma que todas as portas e pontos de interesse estão mutuamente conectados.
   */
  validateConnectivity(grid, exits) {
    const mid_x = Math.floor(this.tileW / 2);
    const mid_y = Math.floor(this.tileH / 2);

    const visited = Array.from({ length: this.tileH }, () => new Uint8Array(this.tileW));
    const queue = [[mid_x, mid_y]];
    visited[mid_y][mid_x] = 1;

    const isWalkable = (x, y) => {
      if (x < 0 || x >= this.tileW || y < 0 || y >= this.tileH) return false;
      const t = grid[y][x];
      return t === TILE_TYPES.FLOOR || t === TILE_TYPES.SANCTUARY ||
             t === TILE_TYPES.CHEST || t === TILE_TYPES.DOOR_N ||
             t === TILE_TYPES.DOOR_S || t === TILE_TYPES.DOOR_E ||
             t === TILE_TYPES.DOOR_W || t === TILE_TYPES.HAZARD;
    };

    while (queue.length > 0) {
      const [cx, cy] = queue.shift();
      const neighbors = [
        [cx + 1, cy], [cx - 1, cy],
        [cx, cy + 1], [cx, cy - 1]
      ];
      for (const [nx, ny] of neighbors) {
        if (isWalkable(nx, ny) && !visited[ny][nx]) {
          visited[ny][nx] = 1;
          queue.push([nx, ny]);
        }
      }
    }

    // Verifica se cada porta declarada foi alcançada
    let allConnected = true;
    if (exits.has('N') && !visited[0][mid_x]) allConnected = false;
    if (exits.has('S') && !visited[this.tileH - 1][mid_x]) allConnected = false;
    if (exits.has('W') && !visited[mid_y][0]) allConnected = false;
    if (exits.has('E') && !visited[mid_y][this.tileW - 1]) allConnected = false;

    if (!allConnected) {
      // Correção forçada de passagem caso algum bloco tenha isolado
      this._carveHallways(grid, exits);
    }

    return true;
  }
}
