// ============================================================
// data/items.js
// Itens consumíveis, relíquias e itens de história
// ============================================================

export const ITEMS = {
  // ── Consumíveis ──────────────────────────────────────────
  ember_herb: {
    id: 'ember_herb',
    type: 'CONSUMABLE',
    name: 'Erva das Brasas',
    description: 'Aumenta permanentemente uma carga de cura.',
    effect: 'INCREASE_HEAL_CHARGES',
    value: 1,
  },
  strength_tonic: {
    id: 'strength_tonic',
    type: 'CONSUMABLE',
    name: 'Tônico de Força',
    description: 'Cura instantânea emergencial.',
    effect: 'INSTANT_HEAL',
    value: 50,
  },

  // ── Relíquias ─────────────────────────────────────────────
  eye_of_abyss: {
    id: 'eye_of_abyss',
    type: 'RELIC',
    name: 'Olho do Abismo',
    description: 'Permite detectar criaturas muito acima do nível do jogador. Elas pulsam com uma aura violeta.',
    effect: 'DETECT_STRONG_ENEMIES',
    threshold: 50,
  },
  iron_will: {
    id: 'iron_will',
    type: 'RELIC',
    name: 'Vontade de Ferro',
    description: 'Reduz o custo de stamina de bloqueio em 25%.',
    effect: 'BLOCK_STAMINA_REDUCTION',
    value: 0.25,
  },
  blood_relic: {
    id: 'blood_relic',
    type: 'RELIC',
    name: 'Relíquia de Sangue',
    description: 'Ataques críticos recuperam 5 de stamina.',
    effect: 'CRIT_STAMINA_RESTORE',
    value: 5,
  },

  // ── Itens de história ─────────────────────────────────────
  ashen_shard: {
    id: 'ashen_shard',
    type: 'LORE',
    name: 'Fragmento das Cinzas',
    description: '"O Abismo não veio de fora. Ele sempre esteve aqui, esperando."',
  },
  broken_crest: {
    id: 'broken_crest',
    type: 'LORE',
    name: 'Brasão Quebrado',
    description: 'O símbolo da ordem que tentou selar o Abismo. Falhou.',
  },
};
