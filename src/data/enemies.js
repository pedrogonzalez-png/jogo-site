// ============================================================
// data/enemies.js
// Templates de inimigos do MVP
// ============================================================

export const ENEMY_TEMPLATES = {
  // ── Inimigo Comum 1 ──────────────────────────────────────
  ash_walker: {
    id: 'ash_walker',
    name: 'Caminhante das Cinzas',
    level: 5,
    hp: 60,
    attack: 18,
    defense: 8,
    speed: 90,
    equilBalance: 60,
    isElite: false,
    element: null,
    resistances: { FIRE: 0, MAGIC: 0, LIGHTNING: 0, HOLY: 0, ICE: 0, BLEED: -0.2, POISON: 0, ROT: 0 },
    attackRange: 44,
    aggroRange: 200,
    attackCooldown: 1800,
    attackDamage: 18,
    attackEquil: 15,
    color: 0x888888,
    lootTable: [
      { itemId: 'worn_helmet', chance: 0.08, rarity: 'COMMON' },
      { xpBonus: 0, chance: 1.0 },
    ],
    xp: 30,
    behavior: 'CHASE_ATTACK',
  },

  // ── Inimigo Comum 2 ──────────────────────────────────────
  ember_hound: {
    id: 'ember_hound',
    name: 'Cão das Brasas',
    level: 8,
    hp: 45,
    attack: 24,
    defense: 4,
    speed: 130,
    equilBalance: 40,
    isElite: false,
    element: 'FIRE',
    elementBuildup: 12,
    resistances: { FIRE: 0.5, MAGIC: 0, LIGHTNING: 0, HOLY: -0.2, ICE: -0.3, BLEED: 0, POISON: 0, ROT: 0 },
    attackRange: 38,
    aggroRange: 250,
    attackCooldown: 1200,
    attackDamage: 24,
    attackEquil: 10,
    color: 0xcc4400,
    lootTable: [
      { xpBonus: 0, chance: 1.0 },
    ],
    xp: 45,
    behavior: 'FAST_ATTACK',
  },

  // ── Elite ─────────────────────────────────────────────────
  iron_sentinel: {
    id: 'iron_sentinel',
    name: 'Sentinela de Ferro',
    level: 18,
    hp: 180,
    attack: 35,
    defense: 22,
    speed: 75,
    equilBalance: 160,
    isElite: true,
    element: null,
    resistances: { FIRE: 0, MAGIC: 0, LIGHTNING: -0.2, HOLY: 0, ICE: 0, BLEED: 0, POISON: 0.3, ROT: 0 },
    attackRange: 52,
    aggroRange: 220,
    attackCooldown: 2200,
    attackDamage: 35,
    attackEquil: 40,
    heavyAttackDamage: 55,
    heavyAttackEquil: 70,
    color: 0x445566,
    lootTable: [
      { itemId: 'iron_sword', chance: 0.15, rarity: 'RARE' },
      { itemId: 'worn_chest', chance: 0.20, rarity: 'RARE' },
      { xpBonus: 0.5, chance: 1.0 },
    ],
    xp: 120,
    behavior: 'GUARDIAN',
  },
};

// ── Boss do MVP ───────────────────────────────────────────────
export const BOSS_TEMPLATES = {
  ashen_lord: {
    id: 'ashen_lord',
    name: 'Senhor das Cinzas',
    level: 35,
    hp: 800,
    attack: 55,
    defense: 30,
    speed: 85,
    equilBalance: 400,
    element: 'FIRE',
    resistances: { FIRE: 0.8, MAGIC: -0.2, LIGHTNING: 0, HOLY: -0.3, ICE: -0.4, BLEED: 0, POISON: 0.5, ROT: 0.5 },
    attackRange: 60,
    aggroRange: 350,
    attackCooldown: 1600,
    attackDamage: 55,
    attackEquil: 50,
    heavyAttackDamage: 90,
    heavyAttackEquil: 100,
    chargeAttackDamage: 70,
    chargeAttackEquil: 80,
    color: 0xff5500,
    phase2Threshold: 0.5,
    phase2SpeedMult: 1.3,
    phase2AttackMult: 1.4,
    canBeParried: false,         // ataques normais
    canHeavyBeParried: false,    // ataques pesados
    xp: 800,
    lootTable: [
      { itemId: 'flame_sword', chance: 0.6, rarity: 'VERY_RARE' },
      { itemId: 'flame_sword', chance: 0.15, rarity: 'EPIC' },
      { xpBonus: 0, chance: 1.0 },
    ],
    behavior: 'BOSS_ASHEN',
    description: 'O guardião das cinzas. Nasceu do primeiro colapso do Abismo.',
    isUnique: true,
    canDropUnique: true,
  },
};
