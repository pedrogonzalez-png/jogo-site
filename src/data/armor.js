// ============================================================
// data/armor.js
// Definições de armaduras para o MVP
// ============================================================

// Os 6 atributos possíveis de uma peça de armadura:
// hp, defense, attack, attackSpeed, critChance, critMultiplier

export const ARMOR_SLOTS = ['helmet', 'chest', 'gloves', 'legs'];

export const ARMOR_RARITY_ATTR = {
  COMMON:    2,
  RARE:      3,
  VERY_RARE: 3,
  EPIC:      4,
  LEGENDARY: 4,
  UNIQUE:    6,
};

// Ranges de valores base por slot (antes de upgrades)
export const ARMOR_STAT_RANGES = {
  hp:             { min: 8,   max: 30  },
  defense:        { min: 4,   max: 18  },
  attack:         { min: 2,   max: 10  },
  attackSpeed:    { min: 0.02, max: 0.12 },
  critChance:     { min: 0.02, max: 0.08 },
  critMultiplier: { min: 0.05, max: 0.25 },
};

// Armaduras fixas de início para o MVP
export const STARTING_ARMOR = {
  helmet: {
    id: 'worn_helmet',
    slot: 'helmet',
    name: 'Elmo Gasto',
    rarity: 'COMMON',
    upgradeLevel: 0,
    stats: { hp: 12, defense: 6 },
    description: 'Um elmo coberto de arranhões. Ainda protege.',
  },
  chest: {
    id: 'worn_chest',
    slot: 'chest',
    name: 'Couraça Gasta',
    rarity: 'COMMON',
    upgradeLevel: 0,
    stats: { hp: 20, defense: 10 },
    description: 'A armadura de um guerreiro que caiu antes de você.',
  },
  gloves: {
    id: 'worn_gloves',
    slot: 'gloves',
    name: 'Manoplas Gastas',
    rarity: 'COMMON',
    upgradeLevel: 0,
    stats: { attack: 3, defense: 4 },
    description: 'Couro grosso costurado com fio de ferro.',
  },
  legs: {
    id: 'worn_legs',
    slot: 'legs',
    name: 'Grevas Gastas',
    rarity: 'COMMON',
    upgradeLevel: 0,
    stats: { hp: 15, defense: 8 },
    description: 'Proteção mínima para quem precisa continuar andando.',
  },
};

const ARMOR_NAMES = {
  helmet: ['Elmo', 'Capacete', 'Máscara', 'Coroa', 'Elmo Pesado'],
  chest:  ['Couraça', 'Peitoral', 'Armadura', 'Túnica Cota', 'Manto de Ferro'],
  gloves: ['Manoplas', 'Luvas', 'Braçadeiras', 'Guanteletes'],
  legs:   ['Grevas', 'Calças', 'Perneiras', 'Cobre-pernas'],
};

const RARITY_PREFIXES = {
  COMMON:    ['Gasto', 'de Ferro', 'Rústico'],
  RARE:      ['Refinado', 'Guardião', 'Cinzento'],
  VERY_RARE: ['Escarlate', 'das Chamas', 'de Aço Negro'],
  EPIC:      ['do Abismo', 'Abissal', 'Titânico'],
  LEGENDARY: ['dos Antigos', 'Primordial', 'do Julgamento'],
  UNIQUE:    ['Divino do Abismo', 'da Ruína Eterna'],
};

/**
 * Cria uma peça de armadura respeitando rigorosamente os 6 atributos permitidos pelo GDD.
 */
export function createArmorPiece(slot, rarity = 'COMMON', rng = null, level = 1) {
  const allStats = ['hp', 'defense', 'attack', 'attackSpeed', 'critChance', 'critMultiplier'];
  const attrCount = ARMOR_RARITY_ATTR[rarity] ?? 2;

  // Embaralha para escolher quais atributos colocar
  const shuffled = [...allStats];
  if (rng && typeof rng.shuffle === 'function') {
    rng.shuffle(shuffled);
  } else {
    shuffled.sort(() => Math.random() - 0.5);
  }

  const selectedStats = rarity === 'UNIQUE' ? allStats : shuffled.slice(0, attrCount);
  const stats = {};

  const levelMult = 1 + (level * 0.04);
  const rarityMult = {
    COMMON: 1.0,
    RARE: 1.3,
    VERY_RARE: 1.7,
    EPIC: 2.2,
    LEGENDARY: 3.0,
    UNIQUE: 4.5,
  }[rarity] ?? 1.0;

  selectedStats.forEach(stat => {
    const range = ARMOR_STAT_RANGES[stat];
    if (!range) return;
    const rndVal = rng ? rng.next() : Math.random();
    const base = range.min + rndVal * (range.max - range.min);
    const val = base * levelMult * rarityMult;

    if (['attackSpeed', 'critChance', 'critMultiplier'].includes(stat)) {
      stats[stat] = parseFloat(val.toFixed(3));
    } else {
      stats[stat] = Math.max(1, Math.round(val));
    }
  });

  const baseNames = ARMOR_NAMES[slot] ?? ['Peça'];
  const prefixes = RARITY_PREFIXES[rarity] ?? ['Comum'];
  const baseName = baseNames[Math.floor((rng ? rng.next() : Math.random()) * baseNames.length)];
  const prefix = prefixes[Math.floor((rng ? rng.next() : Math.random()) * prefixes.length)];

  return {
    id: `armor_${slot}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    slot,
    name: `${baseName} ${prefix}`,
    rarity,
    upgradeLevel: 0,
    stats,
    description: `Armadura de raridade ${rarity} com ${selectedStats.length} atributos derivados.`,
  };
}
