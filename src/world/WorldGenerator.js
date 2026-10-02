// ============================================================
// world/WorldGenerator.js
// Gera a macroestrutura de uma área: sequência de salas conectadas.
// ============================================================
import { RoomGenerator, TILE_TYPES } from './RoomGenerator.js';
import { BIOMES, BIOME_IDS } from '../data/biomes.js';

// Estrutura mínima garantida de uma área:
// ENTRANCE → N salas NORMAL → SANCTUARY → N salas NORMAL → ELITE → BOSS

const ROOM_TYPES_POOL = [
  'NORMAL', 'NORMAL', 'NORMAL', 'NORMAL',
  'ELITE', 'CHEST',
];

export class WorldGenerator {
  constructor(seedSystem, biomeId = null) {
    this.seedSystem = seedSystem;
    this.biomeId = biomeId;
    this.biome = biomeId && BIOMES[biomeId] ? BIOMES[biomeId] : null;
  }

  /**
   * Gera uma área completa.
   * areaIndex: índice numérico da área (para seed determinística)
   * Returns: { rooms: [], connections: Map, biome, biomeId }
   */
  generateArea(areaIndex = 0) {
    const rng = this.seedSystem.areaRNG(areaIndex);

    // Se biomeId não foi fixado, seleciona determinístico baseado na seed e área
    if (!this.biomeId) {
      const biomeKey = BIOME_IDS[areaIndex % BIOME_IDS.length] ?? 'VALE_DAS_CINZAS';
      this.biome = BIOMES[biomeKey];
      this.biomeId = biomeKey;
    } else if (!this.biome) {
      this.biome = BIOMES[this.biomeId] ?? BIOMES['VALE_DAS_CINZAS'];
    }
    const rooms = [];

    // ── Estrutura obrigatória ─────────────────────────────────
    const mandatory = ['ENTRANCE', 'NORMAL', 'NORMAL', 'SANCTUARY', 'NORMAL', 'NORMAL', 'ELITE', 'BOSS'];

    // ── Salas extras procedurais ──────────────────────────────
    const extraCount = rng.int(2, 5);
    const extras = [];
    for (let i = 0; i < extraCount; i++) {
      extras.push(rng.pick(ROOM_TYPES_POOL));
    }

    // Insere as extras antes do boss
    const sequence = [
      ...mandatory.slice(0, 4),
      ...extras,
      ...mandatory.slice(4),
    ];

    // ── Gera cada sala ────────────────────────────────────────
    const connections = new Map();

    for (let i = 0; i < sequence.length; i++) {
      const roomRNG = this.seedSystem.roomRNG(areaIndex, i);
      const gen = new RoomGenerator(roomRNG, this.biome);

      const exits = new Set();
      if (i > 0)                    exits.add('W'); // entrada pelo oeste
      if (i < sequence.length - 1) exits.add('E'); // saída pelo leste

      // Salas laterais aleatórias
      if (sequence[i] === 'NORMAL' && roomRNG.next() < 0.3) {
        exits.add(roomRNG.next() < 0.5 ? 'N' : 'S');
      }

      const roomData = gen.generate(sequence[i], exits);
      rooms.push({
        id: i,
        type: sequence[i],
        data: roomData,
        rng: roomRNG,
        cleared: false,
        worldX: i * (BIOMES[this.biomeId] ? 1280 : 1280),
        worldY: 0,
      });

      connections.set(i, { E: i + 1 < sequence.length ? i + 1 : null, W: i > 0 ? i - 1 : null });
    }

    return { rooms, connections, biome: this.biome, biomeId: this.biomeId };
  }
}
