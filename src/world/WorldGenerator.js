// ============================================================
// world/WorldGenerator.js
// Gera a macroestrutura de uma área: grafo 2D de salas conectadas.
// ============================================================
import { RoomGenerator } from './RoomGenerator.js';
import { BIOMES, BIOME_IDS } from '../data/biomes.js';

const OPPOSITE_DIR = {
  N: 'S',
  S: 'N',
  E: 'W',
  W: 'E',
};

const DIR_OFFSETS = {
  N: { dx: 0,  dy: -1 },
  S: { dx: 0,  dy: 1  },
  E: { dx: 1,  dy: 0  },
  W: { dx: -1, dy: 0  },
};

const BRANCH_ROOM_POOL = [
  'CHEST', 'NORMAL', 'NORMAL', 'ELITE',
];

export class WorldGenerator {
  constructor(seedSystem, biomeId = null) {
    this.seedSystem = seedSystem;
    this.forcedBiomeId = biomeId;
    this.biomeId = biomeId;
    this.biome = biomeId && BIOMES[biomeId] ? BIOMES[biomeId] : null;
  }

  /**
   * Gera uma área completa garantindo navegabilidade e integridade bidirecional.
   * areaIndex: índice numérico da área (para seed determinística)
   * Returns: { rooms: [], connections: Map, biome, biomeId }
   */
  generateArea(areaIndex = 0) {
    const rng = this.seedSystem.areaRNG(areaIndex);

    // Seleciona bioma determinístico baseado em forcedBiomeId ou no índice da área
    let areaBiomeId = this.forcedBiomeId;
    if (!areaBiomeId) {
      areaBiomeId = BIOME_IDS[((areaIndex % BIOME_IDS.length) + BIOME_IDS.length) % BIOME_IDS.length] ?? BIOME_IDS[0];
    }
    this.biomeId = areaBiomeId;
    // VALE_DAS_CINZAS era um ID histórico inexistente: nunca deixar biome undefined.
    this.biome = BIOMES[areaBiomeId] ?? BIOMES[BIOME_IDS[0]];
    if (!this.biome) throw new Error('Nenhum bioma válido foi definido.');
    this.biomeId = this.biome.id;

    // ── 1. Espinha Principal Obrigatória (Critical Path) ─────
    // ENTRANCE(0) -> NORMAL(1) -> NORMAL(2) -> SANCTUARY(3) -> NORMAL(4) -> NORMAL(5) -> ELITE(6) -> BOSS(7)
    const spineTypes = [
      'ENTRANCE', 'NORMAL', 'NORMAL', 'SANCTUARY',
      'NORMAL',   'NORMAL', 'ELITE',  'BOSS'
    ];

    const roomsMeta = [];
    const gridMap = new Map(); // "gx,gy" -> roomIndex

    for (let i = 0; i < spineTypes.length; i++) {
      const meta = {
        id: i,
        type: spineTypes[i],
        gx: i,
        gy: 0,
        isSpine: true,
      };
      roomsMeta.push(meta);
      gridMap.set(`${meta.gx},${meta.gy}`, i);
    }

    // ── 2. Conexões iniciais da espinha principal ───────────
    const connections = new Map();
    for (let i = 0; i < spineTypes.length; i++) {
      connections.set(i, { N: null, S: null, E: null, W: null });
    }

    for (let i = 0; i < spineTypes.length - 1; i++) {
      connections.get(i).E = i + 1;
      connections.get(i + 1).W = i;
    }

    // ── 3. Ramificações procedurais Norte e Sul (Branch Rooms) ─
    const extraCount = rng.int(2, 4);
    const candidateParents = [1, 2, 4, 5]; // Apenas salas normais geram ramificações

    for (let e = 0; e < extraCount; e++) {
      const parentId = candidateParents[(e + rng.int(0, candidateParents.length - 1)) % candidateParents.length];
      const parent = roomsMeta[parentId];

      // Escolhe N ou S
      const verticalDirs = rng.next() < 0.5 ? ['N', 'S'] : ['S', 'N'];
      let chosenDir = null;

      for (const dir of verticalDirs) {
        const offset = DIR_OFFSETS[dir];
        const tgx = parent.gx + offset.dx;
        const tgy = parent.gy + offset.dy;
        const key = `${tgx},${tgy}`;

        if (!gridMap.has(key) && connections.get(parentId)[dir] === null) {
          chosenDir = dir;
          break;
        }
      }

      if (!chosenDir) continue;

      const newId = roomsMeta.length;
      const offset = DIR_OFFSETS[chosenDir];
      const newMeta = {
        id: newId,
        type: rng.pick(BRANCH_ROOM_POOL),
        gx: parent.gx + offset.dx,
        gy: parent.gy + offset.dy,
        isSpine: false,
      };

      roomsMeta.push(newMeta);
      gridMap.set(`${newMeta.gx},${newMeta.gy}`, newId);
      connections.set(newId, { N: null, S: null, E: null, W: null });

      // Conexão bidirecional garantida com o pai
      connections.get(parentId)[chosenDir] = newId;
      connections.get(newId)[OPPOSITE_DIR[chosenDir]] = parentId;

      // Opcional: se houver sala lateral adjacente, cria conexão horizontal para loop
      const westKey = `${newMeta.gx - 1},${newMeta.gy}`;
      if (gridMap.has(westKey) && rng.next() < 0.5) {
        const westId = gridMap.get(westKey);
        if (connections.get(newId).W === null && connections.get(westId).E === null) {
          connections.get(newId).W = westId;
          connections.get(westId).E = newId;
        }
      }
    }

    // ── 4. Geração dos tiles e validação de cada sala ─────────
    const rooms = [];

    for (let i = 0; i < roomsMeta.length; i++) {
      const meta = roomsMeta[i];
      const roomConn = connections.get(i);
      const roomRNG = this.seedSystem.roomRNG(areaIndex, i);
      const gen = new RoomGenerator(roomRNG, this.biome);

      // Constrói conjunto de saídas físicas ESTRITAMENTE a partir das conexões confirmadas
      const exits = new Set();
      if (roomConn.N !== null) exits.add('N');
      if (roomConn.S !== null) exits.add('S');
      if (roomConn.E !== null) exits.add('E');
      if (roomConn.W !== null) exits.add('W');

      const roomData = gen.generate(meta.type, exits);

      rooms.push({
        id: i,
        type: meta.type,
        data: roomData,
        rng: roomRNG,
        cleared: false,
        gx: meta.gx,
        gy: meta.gy,
        worldX: meta.gx * 1280,
        worldY: meta.gy * 720,
      });
    }

    // ── 5. Validação global do Grafo ─────────────────────────
    this._validateWorldGraph(rooms, connections);

    return { rooms, connections, biome: this.biome, biomeId: this.biomeId };
  }

  /**
   * Valida a integridade do grafo do mundo:
   * - Nenhuma conexão aponta para sala inexistente;
   * - Toda conexão é 100% bidirecional;
   * - Toda porta física existe correspondente à lógica;
   * - Todas as salas são alcançáveis a partir da Entrada (Room 0);
   * - A cadeia Entrada -> Santuário -> Elite -> Boss é 100% navegável.
   */
  _validateWorldGraph(rooms, connections) {
    const totalRooms = rooms.length;

    // 1. Simetria e existência
    for (let i = 0; i < totalRooms; i++) {
      const conn = connections.get(i);
      const room = rooms[i];

      for (const [dir, targetId] of Object.entries(conn)) {
        if (targetId !== null) {
          if (targetId < 0 || targetId >= totalRooms) {
            throw new Error(`Conexão inválida na sala ${i}: porta ${dir} aponta para id inexistente ${targetId}`);
          }

          const oppositeDir = OPPOSITE_DIR[dir];
          const targetConn = connections.get(targetId);
          if (targetConn[oppositeDir] !== i) {
            throw new Error(`Assimetria de portas: sala ${i} (${dir} -> ${targetId}), mas sala ${targetId} (${oppositeDir} -> ${targetConn[oppositeDir]})`);
          }

          if (!room.data.exits.has(dir)) {
            throw new Error(`Porta física ausente na sala ${i} para a direção ${dir}`);
          }
        }
      }
    }

    // 2. Alcançabilidade via BFS a partir de ENTRANCE (0)
    const visited = new Set();
    const queue = [0];
    visited.add(0);

    while (queue.length > 0) {
      const curr = queue.shift();
      const conn = connections.get(curr);
      for (const targetId of Object.values(conn)) {
        if (targetId !== null && !visited.has(targetId)) {
          visited.add(targetId);
          queue.push(targetId);
        }
      }
    }

    if (visited.size !== totalRooms) {
      throw new Error(`Grafo desconexo: apenas ${visited.size} de ${totalRooms} salas são alcançáveis a partir da Entrada.`);
    }

    // 3. Validação do Caminho Crítico
    const requiredSequence = ['ENTRANCE', 'SANCTUARY', 'ELITE', 'BOSS'];
    for (const reqType of requiredSequence) {
      const found = rooms.some(r => r.type === reqType && visited.has(r.id));
      if (!found) {
        throw new Error(`Sala crítica do tipo ${reqType} não é alcançável a partir da Entrada.`);
      }
    }

    return true;
  }
}

