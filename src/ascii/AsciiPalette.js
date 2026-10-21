// ============================================================
// ascii/AsciiPalette.js
// Bíblia de cores, materiais e rampas de densidade para ABISMO.
// Inspirado na arte ASCII de alta densidade do cavaleiro de referência.
// ============================================================

export const DENSITY_RAMP = [' ', '.', ':', '-', '=', '+', '*', '#', '%', '@'];

export const MATERIALS = {
  // ── Aço Polido & Ferro (Armaduras de cavaleiro, lâminas) ──
  STEEL: {
    '@': '#15131d', // Sombra profunda de placa
    '%': '#2b2738', // Sombra da borda
    '#': '#4b4760', // Metal base
    '*': '#736d8d', // Meio-tom reflexivo
    '+': '#9a94ba', // Luz direta
    '=': '#bebad9', // Reflexo metálico
    '-': '#dedbf0', // Brilho de fio
    ':': '#eef0fa', // Especular
    '.': '#ffffff', // Ponto de brilho puro
  },

  // ── Ferro Envelhecido & Escuro (Inimigos, correntes, grades) ──
  AGED_IRON: {
    '@': '#101014',
    '%': '#1e1c24',
    '#': '#33313d',
    '*': '#4d4a5b',
    '+': '#6c687e',
    '=': '#8c87a1',
    '-': '#aca7c4',
    ':': '#ccc8e0',
    '.': '#ece8f6',
  },

  // ── Ouro & Bronze Ancestral (Ornamentos, relíquias, altares) ──
  GOLD: {
    '@': '#241705',
    '%': '#47300c',
    '#': '#755217',
    '*': '#a87926',
    '+': '#d49f39',
    '=': '#f2c56d',
    '-': '#ffe094',
    ':': '#fff0c2',
    '.': '#ffffff',
  },

  // ── Manto Carmesim & Pluma (Como na referência do cavaleiro) ──
  CRIMSON_CLOTH: {
    '@': '#36001b',
    '%': '#500220',
    '#': '#7e0729',
    '*': '#a1102b',
    '+': '#b5162c',
    '=': '#d42844',
    '-': '#eb526c',
    ':': '#f78398',
    '.': '#ffccd5',
  },

  // ── Couro & Madeira (Empunhaduras, correias, caixas, baús) ──
  LEATHER: {
    '@': '#1f130b',
    '%': '#382315',
    '#': '#573722',
    '*': '#7b5034',
    '+': '#9c6847',
    '=': '#bd845e',
    '-': '#dba37d',
    ':': '#f0c4a3',
    '.': '#fce6d4',
  },

  // ── Ossos & Marfim (Esqueletos, catacumbas, ossuários) ──
  BONE: {
    '@': '#1a1820',
    '%': '#332f38',
    '#': '#544e59',
    '*': '#7a727d',
    '+': '#a39b9e',
    '=': '#c7bfae',
    '-': '#dcd5c7',
    ':': '#eee9df',
    '.': '#ffffff',
  },

  // ── Água Volumétrica & Correntezas (Aqueduto Submerso) ──
  WATER: {
    '@': '#08141a', // Fundo abissal
    '%': '#11252e', // Profundidade escura
    '#': '#1b3b47', // Água média
    '*': '#285866', // Reflexo azulado
    '+': '#3c798a', // Zona rasa
    '=': '#59a2b5', // Ondulação
    '-': '#7ec2d4', // Crista da onda
    ':': '#a9e1ed', // Espuma / reflexo
    '.': '#d8f6fc', // Brilho de superfície / gota
  },

  // ── Sangue Denso & Coágulos (Cárcere de Sangue) ──
  BLOOD: {
    '@': '#1c0508',
    '%': '#380c12',
    '#': '#5c161f',
    '*': '#82232f',
    '+': '#a83241',
    '=': '#cf4657',
    '-': '#eb6777',
    ':': '#f797a3',
    '.': '#ffd1d7',
  },

  // ── Magma Incandescente & Chamas (Forja Maculada) ──
  MAGMA: {
    '@': '#1a0b08',
    '%': '#3b150d',
    '#': '#692112',
    '*': '#9e3218',
    '+': '#d44e22',
    '=': '#f27329',
    '-': '#fca13a',
    ':': '#fcd253',
    '.': '#fff8a6',
  },

  // ── Matéria Orgânica Pútrida & Esporos (Jardim Pútrido) ──
  ROT: {
    '@': '#10170c',
    '%': '#1d2b17',
    '#': '#2f4225',
    '*': '#465e38',
    '+': '#617d4f',
    '=': '#80a16b',
    '-': '#a2c48b',
    ':': '#c5e3af',
    '.': '#e8fcd4',
  },

  // ── Cristais Prismáticos (Abismo Cristalino) ──
  CRYSTAL: {
    '@': '#0f1a26',
    '%': '#1d3144',
    '#': '#2e4f6b',
    '*': '#447299',
    '+': '#5f99c7',
    '=': '#84c1f0',
    '-': '#aee0ff',
    ':': '#d6f0ff',
    '.': '#ffffff',
  },

  // ── Energia Mágica / Arcano (Biblioteca do Oculto) ──
  MAGIC: {
    '@': '#180f26',
    '%': '#2c1c45',
    '#': '#462e6b',
    '*': '#654499',
    '+': '#895fc7',
    '=': '#ad7ef2',
    '-': '#cca7ff',
    ':': '#e3ccff',
    '.': '#ffffff',
  },

  // ── Horror Cósmico / Vazio (Coração do Abismo) ──
  VOID: {
    '@': '#0d0b1a',
    '%': '#1d1736',
    '#': '#332759',
    '*': '#503c85',
    '+': '#7156b5',
    '=': '#9577e0',
    '-': '#ba9eff',
    ':': '#decbff',
    '.': '#f3edff',
  },

  // ── Pedra Cinzenta (Arredores Cinzentos) ──
  STONE_ASH: {
    '@': '#16171c',
    '%': '#262830',
    '#': '#3d404d',
    '*': '#5a5e70',
    '+': '#7b8096',
    '=': '#9ea3bd',
    '-': '#bfc4de',
    ':': '#dbe0f5',
    '.': '#f2f4ff',
  },
};

// ── Paletas completas para os 10 Biomas ──────────────────────
export const BIOME_ASCII_PALETTES = {
  ARREDORES_CINZENTOS: {
    wall: MATERIALS.STONE_ASH,
    floor: {
      '@': '#121317', '%': '#1d1e24', '#': '#2c2e38', '*': '#3d404d',
      '+': '#505463', '=': '#666a7d', '-': '#7e8399', ':': '#999eb5', '.': '#b8bdd4',
    },
    accent: MATERIALS.CRIMSON_CLOTH,
    hazard: MATERIALS.STONE_ASH,
  },

  AQUEDUTO_SUBMERSO: {
    wall: {
      '@': '#0b161a', '%': '#14252c', '#': '#203942', '*': '#30505c',
      '+': '#436b7a', '=': '#5b8999', '-': '#75a8b8', ':': '#94cad9', '.': '#b6ecfa',
    },
    floor: {
      '@': '#091014', '%': '#101d24', '#': '#192b33', '*': '#243b45',
      '+': '#324e59', '=': '#436370', '-': '#577d8c', ':': '#6f97a6', '.': '#8bb5c4',
    },
    accent: MATERIALS.WATER,
    hazard: MATERIALS.WATER,
  },

  CATACUMBAS_ECOANTES: {
    wall: {
      '@': '#13111a', '%': '#201d29', '#': '#312d3d', '*': '#464154',
      '+': '#5f586e', '=': '#7c748c', '-': '#9a92ab', ':': '#bbb4cc', '.': '#ded9ed',
    },
    floor: {
      '@': '#0d0c12', '%': '#17151f', '#': '#23202e', '*': '#332f40',
      '+': '#454054', '=': '#59536b', '-': '#706985', ':': '#8a829e', '.': '#a69fba',
    },
    accent: MATERIALS.BONE,
    hazard: MATERIALS.BONE,
  },

  FORJA_MACULADA: {
    wall: {
      '@': '#171012', '%': '#291b1f', '#': '#3d292f', '*': '#593b44',
      '+': '#754f5a', '=': '#946673', '-': '#b37f8e', ':': '#d19baa', '.': '#f0bac8',
    },
    floor: {
      '@': '#120d0f', '%': '#1f1619', '#': '#2e2126', '*': '#3f2e35',
      '+': '#543e46', '=': '#6b505a', '-': '#856672', ':': '#a17e8c', '.': '#bf99a8',
    },
    accent: MATERIALS.MAGMA,
    hazard: MATERIALS.MAGMA,
  },

  JARDIM_PUTRIDO: {
    wall: {
      '@': '#10140e', '%': '#1b2419', '#': '#293627', '*': '#3b4d38',
      '+': '#4e664b', '=': '#658261', '-': '#7ea179', ':': '#9ac294', '.': '#b8e3b1',
    },
    floor: {
      '@': '#0c100b', '%': '#151c13', '#': '#20291e', '*': '#2d3b2a',
      '+': '#3d4d3a', '=': '#4f634b', '-': '#637a5f', ':': '#7a9475', '.': '#94b08d',
    },
    accent: MATERIALS.ROT,
    hazard: MATERIALS.ROT,
  },

  CIDADE_SUBTERRANEA: {
    wall: {
      '@': '#11151c', '%': '#1d242e', '#': '#2b3442', '*': '#3c4859',
      '+': '#516075', '=': '#687991', '-': '#8295b0', ':': '#9eb2cf', '.': '#bdd1ed',
    },
    floor: {
      '@': '#0c0f14', '%': '#151b24', '#': '#202833', '*': '#2d3745',
      '+': '#3c4959', '=': '#4e5d70', '-': '#61738a', ':': '#788ca3', '.': '#92a6bd',
    },
    accent: MATERIALS.GOLD,
    hazard: MATERIALS.AGED_IRON,
  },

  ABISMO_CRISTALINO: {
    wall: {
      '@': '#0d1821', '%': '#162936', '#': '#233d4f', '*': '#33546b',
      '+': '#466e8a', '=': '#5c8ba8', '-': '#77abc7', ':': '#96cce6', '.': '#b8eeff',
    },
    floor: {
      '@': '#091117', '%': '#101e26', '#': '#192d38', '*': '#243e4c',
      '+': '#325263', '=': '#43687d', '-': '#568096', ':': '#6d9cb3', '.': '#87b8d1',
    },
    accent: MATERIALS.CRYSTAL,
    hazard: MATERIALS.CRYSTAL,
  },

  CARCERE_DE_SANGUE: {
    wall: {
      '@': '#170c0f', '%': '#26141a', '#': '#381f26', '*': '#4f2d37',
      '+': '#693e4a', '=': '#855160', '-': '#a36778', ':': '#c28193', '.': '#e09eb0',
    },
    floor: {
      '@': '#12090c', '%': '#1c0f14', '#': '#29171d', '*': '#382128',
      '+': '#4a2d36', '=': '#5e3c46', '-': '#754d59', ':': '#8e606e', '.': '#a87785',
    },
    accent: MATERIALS.BLOOD,
    hazard: MATERIALS.BLOOD,
  },

  BIBLIOTECA_DO_OCULTO: {
    wall: {
      '@': '#171120', '%': '#261c33', '#': '#382b4a', '*': '#4e3d63',
      '+': '#66527f', '=': '#826b9e', '-': '#9f87bd', ':': '#bfa7dc', '.': '#dfcafc',
    },
    floor: {
      '@': '#120d1a', '%': '#1c1526', '#': '#292036', '*': '#382d47',
      '+': '#4a3d5c', '=': '#5e4f73', '-': '#74638c', ':': '#8c7aa6', '.': '#a694bf',
    },
    accent: MATERIALS.MAGIC,
    hazard: MATERIALS.MAGIC,
  },

  CORACAO_DO_ABISMO: {
    wall: {
      '@': '#110b1a', '%': '#1d132b', '#': '#2e2042', '*': '#42305c',
      '+': '#5a447a', '=': '#755b99', '-': '#9377b8', ':': '#b397d6', '.': '#d5b9f5',
    },
    floor: {
      '@': '#0c0814', '%': '#140e1f', '#': '#1f172e', '*': '#2d223f',
      '+': '#3c3052', '=': '#4e4066', '-': '#63537d', ':': '#7a6894', '.': '#9481ad',
    },
    accent: MATERIALS.VOID,
    hazard: MATERIALS.VOID,
  },
};
