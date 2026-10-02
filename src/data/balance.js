// ============================================================
// data/balance.js
// Arquivo central de balanceamento. NUNCA espalhe números mágicos
// pelo código — referencie sempre a partir daqui.
// ============================================================

export const BALANCE = {

  // ── Dano ─────────────────────────────────────────────────
  DAMAGE: {
    // Defesa precisa ser 2.5× o ataque para anular completamente
    DEFENSE_RATIO: 2.5,
  },

  // ── Player ───────────────────────────────────────────────
  PLAYER: {
    BASE_HP: 100,
    BASE_STAMINA: 100,
    BASE_ATTACK: 20,
    BASE_DEFENSE: 10,
    BASE_SPEED: 160,
    RUN_MULTIPLIER: 1.7,
    HEAL_CHARGES: 3,
    HEAL_AMOUNT: 40,
    STAMINA_REGEN_DELAY: 1200,   // ms sem gasto para começar regen
    STAMINA_REGEN_RATE: 45,      // por segundo
    INVINCIBLE_DURATION: 500,    // ms de i-frames após esquiva
    DODGE_STAMINA: 25,
    DODGE_SPEED: 320,
    DODGE_DURATION: 280,         // ms
    PARRY_WINDOW: 200,           // ms de janela de parry (timing puro)
    PARRY_STAGGER_MULT: 3.0,     // multiplicador de dano de equilíbrio
    BLOCK_DAMAGE_REDUCTION: 0.70,// padrão inicial: 70% de redução de dano
    BLOCK_MOVE_SPEED_MULT: 0.50, // 50% de velocidade ao se mover bloqueando
    BLOCK_STAMINA_COST_MULT: 0.60,// custo de stamina de bloqueio proporcional ao dano
    HEAVY_BLOCK_STAMINA_MULT: 1.50,// ataques pesados consomem 50% mais stamina de bloqueio
    GUARD_BREAK_VULNERABLE_DURATION: 1000, // ms vulnerável ao quebrar a guarda
    GUARD_BREAK_COOLDOWN: 1500,  // ms antes de poder erguer a guarda novamente
    HEAVY_ATTACK_STAMINA: 30,
    SKILL_STAMINA: 35,
    RUN_STAMINA_PER_SEC: 15,

    // Escalonamento de atributos
    HP_PER_VIGOR: 12,
    STAGGER_PER_VIGOR: 5,
    ATTACK_PER_STR: 3,
    STAMINA_PER_END: 8,
    STAMINA_REGEN_PER_END: 1.5,
    DEFENSE_PER_END: 2,
    ELEMENTAL_PER_ARCANE: 4,
    STATUS_BUILDUP_PER_ARCANE: 0.05,
  },

  // ── Controles ─────────────────────────────────────────────
  CONTROLS: {
    BLOCK: 'F',
    PARRY: 'V',
    ATTACK: 'Z',
    HEAVY_ATTACK: 'X',
    DODGE: 'C',
    RUN: 'SHIFT',
    HEAL: 'Q',
    SKILL: 'E',
    INVENTORY: 'TAB',
    INTERACT: 'G',
  },

  // ── Inimigos ──────────────────────────────────────────────
  ENEMY: {
    AGGRO_RANGE: 220,
    ATTACK_RANGE: 48,
    PATROL_SPEED: 55,
    CHASE_SPEED: 95,
    ATTACK_COOLDOWN: 1800,
    BASE_XP_YIELD: 30,
    XP_PER_LEVEL: 8,
    ELITE_XP_MULT: 3.5,
    ELITE_STAT_MULT: 2.2,
  },

  // ── Boss ─────────────────────────────────────────────────
  BOSS: {
    HP_MULT: 12,
    ATTACK_MULT: 2.5,
    DEFENSE_MULT: 1.8,
    XP_MULT: 20,
    PHASE2_THRESHOLD: 0.5,      // % de HP restante
  },

  // ── XP ───────────────────────────────────────────────────
  XP: {
    // XP necessária para subir do nível N para N+1
    // Usa fórmula: BASE × (LEVEL ^ EXPONENT)
    BASE: 100,
    EXPONENT: 1.5,
    WEAPON_UPGRADE_BASE: 500,    // XP para +1 em arma
    WEAPON_UPGRADE_MULT: 1.4,
    ARMOR_UPGRADE_BASE: 350,
    ARMOR_UPGRADE_MULT: 1.35,
  },

  // ── Equipamento ──────────────────────────────────────────
  EQUIPMENT: {
    // Patamar de rarity por nível de upgrade
    RARITY_THRESHOLDS: { COMMON: 0, RARE: 4, VERY_RARE: 8, EPIC: 12, LEGENDARY: 16 },
    RARITY_ATTR_COUNT: { COMMON: 2, RARE: 3, VERY_RARE: 3, EPIC: 4, LEGENDARY: 4, UNIQUE: 6 },
    MAX_UPGRADE: 20,
    STAT_SCALE_PER_UPGRADE: 0.08, // 8% de melhoria por nível de upgrade
  },

  // ── Desafio de Abismo ─────────────────────────────────────
  ABYSS: {
    TIER1_DIFF: 50,   // +5 pts
    TIER2_DIFF: 100,  // +10 pts + raro
    TIER3_DIFF: 150,  // +20 pts + épico
    TIER4_DIFF: 200,  // +30 pts + Único + recompensa
    TIER1_POINTS: 5,
    TIER2_POINTS: 10,
    TIER3_POINTS: 20,
    TIER4_POINTS: 30,
  },

  // ── Equilíbrio / Stagger ──────────────────────────────────
  STAGGER: {
    BASE_BALANCE: 100,
    RECOVERY_RATE: 25,     // por segundo
    RECOVERY_DELAY: 1500,  // 1500ms sem dano de poise para começar regen
    STAGGER_DURATION: 1200,// ms vulnerável
    LIGHT_ATTACK_POISE: 18,
    HEAVY_ATTACK_POISE: 45,
    PARRY_POISE: 90,       // grande dano de equilíbrio no parry
  },

  // ── Status Elemental ─────────────────────────────────────
  STATUS: {
    FIRE:    { limit: 100, damage: 30, duration: 5000, dot: 8 },
    MAGIC:   { limit: 80,  damage: 40, duration: 4000, dot: 0 },
    LIGHTNING:{ limit: 90, damage: 50, duration: 3000, dot: 0 },
    HOLY:    { limit: 100, damage: 25, duration: 6000, dot: 5 },
    ICE:     { limit: 80,  damage: 20, duration: 4000, dot: 0, slowFactor: 0.5 },
    BLEED:   { limit: 70,  damage: 60, duration: 8000, dot: 12 },
    POISON:  { limit: 90,  damage: 10, duration: 10000, dot: 6 },
    ROT:     { limit: 120, damage: 20, duration: 12000, dot: 4 },
  },

  // ── World Gen ────────────────────────────────────────────
  WORLD: {
    ROOM_WIDTH: 1280,
    ROOM_HEIGHT: 720,
    TILE_SIZE: 32,
    MIN_ENEMIES_PER_ROOM: 2,
    MAX_ENEMIES_PER_ROOM: 6,
    CORRIDOR_WIDTH: 3, // em tiles
  },
};
