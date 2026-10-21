// ============================================================
// data/enemies.js
// Templates de inimigos para todos os 10 biomas
// ============================================================

const BASE_MELEE = {
  level: 5, hp: 60, attack: 18, defense: 8, speed: 90, equilBalance: 60,
  isElite: false, element: null, attackRange: 44, aggroRange: 200,
  attackCooldown: 1800, attackDamage: 18, attackEquil: 15,
  resistances: { FIRE: 0, MAGIC: 0, LIGHTNING: 0, HOLY: 0, ICE: 0, BLEED: 0, POISON: 0, ROT: 0 },
  behavior: 'CHASE_ATTACK', xp: 30, color: 0x888888,
  lootTable: [{ xpBonus: 0, chance: 1.0 }],
};

const BASE_FAST = {
  ...BASE_MELEE,
  level: 8, hp: 45, attack: 24, defense: 4, speed: 130, equilBalance: 40,
  attackRange: 38, aggroRange: 250, attackCooldown: 1200, attackDamage: 24, attackEquil: 10,
  behavior: 'FAST_ATTACK', xp: 45,
};

const BASE_GUARDIAN = {
  ...BASE_MELEE,
  level: 18, hp: 180, attack: 35, defense: 22, speed: 75, equilBalance: 160,
  isElite: true, attackRange: 52, aggroRange: 220, attackCooldown: 2200,
  attackDamage: 35, attackEquil: 40, heavyAttackDamage: 55, heavyAttackEquil: 70,
  behavior: 'GUARDIAN', xp: 120,
};

const BASE_BOSS = {
  level: 35, hp: 800, attack: 55, defense: 30, speed: 85, equilBalance: 400,
  attackRange: 60, aggroRange: 350, attackCooldown: 1600, attackDamage: 55, attackEquil: 50,
  heavyAttackDamage: 90, heavyAttackEquil: 100, chargeAttackDamage: 70, chargeAttackEquil: 80,
  phase2Threshold: 0.5, phase2SpeedMult: 1.3, phase2AttackMult: 1.4,
  canBeParried: false, canHeavyBeParried: false,
  resistances: { FIRE: 0, MAGIC: 0, LIGHTNING: 0, HOLY: 0, ICE: 0, BLEED: 0, POISON: 0, ROT: 0 },
  behavior: 'BOSS_ASHEN', xp: 800, isUnique: true, canDropUnique: true,
  lootTable: [{ xpBonus: 0, chance: 1.0 }],
};

export const ENEMY_TEMPLATES = {
  // ── Arredores Cinzentos ──
  caminhante_cinzento: { ...BASE_MELEE, id: 'caminhante_cinzento', name: 'Caminhante Cinzento', color: 0x9299A1, elementBuildup: 0 },
  sabujo_fuligem:      { ...BASE_FAST,  id: 'sabujo_fuligem',      name: 'Sabujo de Fuligem', element: 'FIRE', color: 0x8C4840, elementBuildup: 15 },
  sentinela_cinzenta:  { ...BASE_GUARDIAN, id: 'sentinela_cinzenta', name: 'Sentinela Cinzenta', color: 0x656973, elementBuildup: 0 },

  // ── Aqueduto Submerso ──
  afogado:              { ...BASE_MELEE, id: 'afogado', name: 'Afogado', element: 'ICE', color: 0x62968E, elementBuildup: 12 },
  espreitador_abissal:  { ...BASE_FAST,  id: 'espreitador_abissal', name: 'Espreitador Abissal', element: 'ICE', color: 0x376B70, elementBuildup: 10 },
  bruto_submerso:       { ...BASE_GUARDIAN, id: 'bruto_submerso', name: 'Bruto Submerso', element: 'ICE', color: 0x294650, elementBuildup: 20 },

  // ── Catacumbas Ecoantes ──
  esqueleto_desperto: { ...BASE_MELEE, id: 'esqueleto_desperto', name: 'Esqueleto Desperto', element: 'BLEED', color: 0xD4C6A7, elementBuildup: 12 },
  espectro_ecoante:   { ...BASE_FAST,  id: 'espectro_ecoante', name: 'Espectro Ecoante', element: 'MAGIC', color: 0xA092CB, elementBuildup: 15 },
  carrasco_tumular:   { ...BASE_GUARDIAN, id: 'carrasco_tumular', name: 'Carrasco Tumular', element: 'BLEED', color: 0x5B5061, elementBuildup: 25 },

  // ── Forja Maculada ──
  construto_defeituoso: { ...BASE_MELEE, id: 'construto_defeituoso', name: 'Construto Defeituoso', element: 'FIRE', color: 0xAF5D3B, elementBuildup: 15 },
  diabrete_de_ferro:    { ...BASE_FAST,  id: 'diabrete_de_ferro', name: 'Diabrete de Ferro', element: 'FIRE', color: 0xF2C56D, elementBuildup: 10 },
  golias_maculado:      { ...BASE_GUARDIAN, id: 'golias_maculado', name: 'Golias Maculado', element: 'FIRE', color: 0x794338, elementBuildup: 25 },

  // ── Jardim Pútrido ──
  brotar_toxico:    { ...BASE_MELEE, id: 'brotar_toxico', name: 'Brotar Tóxico', element: 'POISON', color: 0x789655, elementBuildup: 18 },
  vinha_rastejante: { ...BASE_FAST,  id: 'vinha_rastejante', name: 'Vinha Rastejante', element: 'POISON', color: 0xA5B96F, elementBuildup: 14 },
  guardiao_putrido: { ...BASE_GUARDIAN, id: 'guardiao_putrido', name: 'Guardião Pútrido', element: 'ROT', color: 0x526C46, elementBuildup: 22 },

  // ── Cidade Subterrânea ──
  cidadao_corrompido: { ...BASE_MELEE, id: 'cidadao_corrompido', name: 'Cidadão Corrompido', color: 0x76889C, elementBuildup: 0 },
  lacaio_da_sombra:   { ...BASE_FAST,  id: 'lacaio_da_sombra', name: 'Lacaio da Sombra', element: 'BLEED', color: 0x48566D, elementBuildup: 15 },
  cavaleiro_caido:    { ...BASE_GUARDIAN, id: 'cavaleiro_caido', name: 'Cavaleiro Caído', element: 'BLEED', color: 0x2C3448, elementBuildup: 20 },

  // ── Abismo Cristalino ──
  golem_de_cristal: { ...BASE_MELEE, id: 'golem_de_cristal', name: 'Golem de Cristal', element: 'MAGIC', color: 0x6EADB7, elementBuildup: 12 },
  raio_refratado:   { ...BASE_FAST,  id: 'raio_refratado', name: 'Raio Refratado', element: 'LIGHTNING', color: 0xD6E8F1, elementBuildup: 18 },
  entidade_prismatica: { ...BASE_GUARDIAN, id: 'entidade_prismatica', name: 'Entidade Prismática', element: 'MAGIC', color: 0x456A8D, elementBuildup: 22 },

  // ── Cárcere de Sangue ──
  prisioneiro_sanguinario: { ...BASE_MELEE, id: 'prisioneiro_sanguinario', name: 'Prisioneiro Sanguinário', element: 'BLEED', color: 0x9C4C52, elementBuildup: 18 },
  mago_de_sangue:          { ...BASE_FAST,  id: 'mago_de_sangue', name: 'Mago de Sangue', element: 'BLEED', color: 0xDEA18A, elementBuildup: 20 },
  carcereiro_carmesim:     { ...BASE_GUARDIAN, id: 'carcereiro_carmesim', name: 'Carcereiro Carmesim', element: 'BLEED', color: 0x713540, elementBuildup: 30 },

  // ── Biblioteca do Oculto ──
  sabio_enlouquecido:   { ...BASE_MELEE, id: 'sabio_enlouquecido', name: 'Sábio Enlouquecido', element: 'MAGIC', color: 0x796395, elementBuildup: 15 },
  tomo_flutuante:       { ...BASE_FAST,  id: 'tomo_flutuante', name: 'Tomo Flutuante', element: 'MAGIC', color: 0x729DA9, elementBuildup: 18 },
  arcanista_corrompido: { ...BASE_GUARDIAN, id: 'arcanista_corrompido', name: 'Arcanista Corrompido', element: 'MAGIC', color: 0x52406B, elementBuildup: 25 },

  // ── Coração do Abismo ──
  fragmento_abissal:     { ...BASE_MELEE, id: 'fragmento_abissal', name: 'Fragmento Abissal', element: 'ROT', color: 0x6555A4, elementBuildup: 15 },
  eco_do_vazio:          { ...BASE_FAST,  id: 'eco_do_vazio', name: 'Eco do Vazio', element: 'MAGIC', color: 0x70D8D0, elementBuildup: 20 },
  manifestacao_da_ruina: { ...BASE_GUARDIAN, id: 'manifestacao_da_ruina', name: 'Manifestação da Ruína', element: 'ROT', color: 0x3E4075, elementBuildup: 28 },
};

export const BOSS_TEMPLATES = {
  // Arredores Cinzentos — ataque equilibrado, emboscador (invoca cinzas para desacelerar)
  senhor_das_cinzas: {
    ...BASE_BOSS, id: 'senhor_das_cinzas', name: 'Senhor das Cinzas', element: 'FIRE', color: 0x8C4840,
    behavior: 'BOSS_ASHEN', attackCooldown: 1600, elementBuildup: 20,
    resistances: { ...BASE_BOSS.resistances, FIRE: 80 },
    attackPatterns: ['LIGHT', 'LIGHT', 'HEAVY', 'CHARGE'],
  },
  // Aqueduto Submerso — lento mas pesado, empurra jogador
  leviata_raso: {
    ...BASE_BOSS, id: 'leviata_raso', name: 'Leviatã Raso', element: 'ICE', color: 0x376B70,
    behavior: 'BOSS_LEVIATHAN', hp: 1000, speed: 70, attackCooldown: 2000,
    attackDamage: 65, heavyAttackDamage: 110, chargeAttackDamage: 85,
    phase2SpeedMult: 1.5, phase2AttackMult: 1.3, elementBuildup: 25,
    resistances: { ...BASE_BOSS.resistances, ICE: 90, FIRE: -20 },
    attackPatterns: ['HEAVY', 'CHARGE', 'LIGHT', 'HEAVY'],
  },
  // Catacumbas Ecoantes — rápido com sangramento, invoca tremores
  amalgama_de_ossos: {
    ...BASE_BOSS, id: 'amalgama_de_ossos', name: 'Amálgama de Ossos', element: 'BLEED', color: 0x5B5061,
    behavior: 'BOSS_AMALGAM', hp: 700, speed: 100, attackCooldown: 1400,
    attackDamage: 50, heavyAttackDamage: 80, chargeAttackDamage: 60,
    phase2SpeedMult: 1.4, phase2AttackMult: 1.5, elementBuildup: 22,
    resistances: { ...BASE_BOSS.resistances, BLEED: 70, HOLY: -30 },
    attackPatterns: ['LIGHT', 'LIGHT', 'LIGHT', 'CHARGE'],
  },
  // Forja Maculada — tanque lento, erupções térmicas ao redor
  forjador_insano: {
    ...BASE_BOSS, id: 'forjador_insano', name: 'Forjador Insano', element: 'FIRE', color: 0x794338,
    behavior: 'BOSS_FORGER', hp: 1200, speed: 65, equilBalance: 500, attackCooldown: 2200,
    attackDamage: 70, heavyAttackDamage: 120, chargeAttackDamage: 90,
    phase2SpeedMult: 1.2, phase2AttackMult: 1.6, elementBuildup: 30,
    resistances: { ...BASE_BOSS.resistances, FIRE: 95, ICE: -40 },
    attackPatterns: ['HEAVY', 'HEAVY', 'CHARGE', 'LIGHT'],
  },
  // Jardim Pútrido — veneno constante, invoca esporas
  flor_cadaverica: {
    ...BASE_BOSS, id: 'flor_cadaverica', name: 'Flor Cadavérica', element: 'POISON', color: 0x526C46,
    behavior: 'BOSS_FLOWER', hp: 750, speed: 60, attackCooldown: 1800,
    attackDamage: 45, heavyAttackDamage: 75, chargeAttackDamage: 55,
    phase2SpeedMult: 1.1, phase2AttackMult: 1.3, elementBuildup: 30,
    resistances: { ...BASE_BOSS.resistances, POISON: 100, ROT: 60, FIRE: -30 },
    attackPatterns: ['LIGHT', 'HEAVY', 'LIGHT', 'LIGHT'],
  },
  // Cidade Subterrânea — combatente técnico, bloqueios e contra-ataques
  rei_dos_mendigos: {
    ...BASE_BOSS, id: 'rei_dos_mendigos', name: 'Rei dos Mendigos', element: 'BLEED', color: 0x48566D,
    behavior: 'BOSS_KING', hp: 850, speed: 90, attackCooldown: 1500,
    attackDamage: 55, heavyAttackDamage: 90, chargeAttackDamage: 70,
    phase2SpeedMult: 1.35, phase2AttackMult: 1.4, elementBuildup: 20,
    resistances: { ...BASE_BOSS.resistances, BLEED: 50, MAGIC: 30 },
    attackPatterns: ['LIGHT', 'CHARGE', 'HEAVY', 'LIGHT'],
  },
  // Abismo Cristalino — projéteis mágicos, reflete ataques
  cristal_matriz: {
    ...BASE_BOSS, id: 'cristal_matriz', name: 'Cristal Matriz', element: 'MAGIC', color: 0x456A8D,
    behavior: 'BOSS_CRYSTAL', hp: 900, speed: 75, attackCooldown: 1700,
    attackDamage: 50, heavyAttackDamage: 85, chargeAttackDamage: 65,
    phase2SpeedMult: 1.3, phase2AttackMult: 1.5, elementBuildup: 25,
    resistances: { ...BASE_BOSS.resistances, MAGIC: 80, LIGHTNING: 50 },
    attackPatterns: ['LIGHT', 'HEAVY', 'CHARGE', 'HEAVY'],
  },
  // Cárcere de Sangue — drena vida, regenera, sangramento pesado
  vampiro_primordial: {
    ...BASE_BOSS, id: 'vampiro_primordial', name: 'Vampiro Primordial', element: 'BLEED', color: 0x713540,
    behavior: 'BOSS_VAMPIRE', hp: 950, speed: 95, attackCooldown: 1400,
    attackDamage: 50, heavyAttackDamage: 80, chargeAttackDamage: 65,
    phase2SpeedMult: 1.4, phase2AttackMult: 1.3, elementBuildup: 28,
    canLifesteal: true, lifestealPct: 0.15,
    resistances: { ...BASE_BOSS.resistances, BLEED: 90, HOLY: -50 },
    attackPatterns: ['LIGHT', 'LIGHT', 'CHARGE', 'HEAVY'],
  },
  // Biblioteca do Oculto — teletransportes, ataques mágicos
  bibliotecario_sombrio: {
    ...BASE_BOSS, id: 'bibliotecario_sombrio', name: 'Bibliotecário Sombrio', element: 'MAGIC', color: 0x52406B,
    behavior: 'BOSS_LIBRARIAN', hp: 800, speed: 80, attackCooldown: 1600,
    attackDamage: 55, heavyAttackDamage: 95, chargeAttackDamage: 70,
    phase2SpeedMult: 1.3, phase2AttackMult: 1.5, elementBuildup: 22,
    canTeleport: true,
    resistances: { ...BASE_BOSS.resistances, MAGIC: 70 },
    attackPatterns: ['LIGHT', 'HEAVY', 'LIGHT', 'CHARGE'],
  },
  // Coração do Abismo — o boss final, anomalia gravitacional, todas as mecânicas
  entidade_final: {
    ...BASE_BOSS, id: 'entidade_final', name: 'Entidade Final', element: 'ROT', color: 0x3E4075,
    behavior: 'BOSS_FINAL', hp: 1500, speed: 80, equilBalance: 600, attackCooldown: 1500,
    attackDamage: 65, heavyAttackDamage: 110, chargeAttackDamage: 85,
    phase2Threshold: 0.6, phase2SpeedMult: 1.5, phase2AttackMult: 1.6, elementBuildup: 30,
    resistances: { ...BASE_BOSS.resistances, ROT: 80, MAGIC: 40, POISON: 40 },
    attackPatterns: ['HEAVY', 'CHARGE', 'LIGHT', 'HEAVY', 'CHARGE'],
  },
};
