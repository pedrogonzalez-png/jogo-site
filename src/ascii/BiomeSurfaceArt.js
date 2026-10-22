// Abismo: arquitetura ASCII exclusiva por bioma (8x8 caracteres/tile).
// Não altera o cavaleiro, as hitboxes ou as regras do gerador de salas.
export const BIOME_SURFACE_ART = {
  ARREDORES_CINZENTOS: {
    floor: [
      ".:...:..",
      ":=-..=-:",
      ":*#--*#:",
      ".:+--+:.",
      ":...:=..",
      "::+=:...",
      ".:*#*...",
      "..:..:..",
    ],
    wall: [
      "%##*##%%",
      "#*+=+*##",
      "#+=..=*#",
      "%#*=+*#%",
      "%%##%##%",
      "#*+=+*##",
      "#+=..=*#",
      "%%##*#%%",
    ],
  },
  AQUEDUTO_SUBMERSO: {
    floor: [
      "==:..:==",
      "~*==*~==",
      "=+*##*+=",
      "~=++=+~=",
      "==:..:==",
      "~+=##=+~",
      "==*++*==",
      "==:..:==",
    ],
    wall: [
      "#%#==#%#",
      "%#*=+*#%",
      "#+=..=+#",
      "#*===+*#",
      "%#=++=#%",
      "#*==+*#%",
      "#+=..=+#",
      "#%#==#%#",
    ],
  },
  CATACUMBAS_ECOANTES: {
    floor: [
      "#*===*##",
      "=+:..:+=",
      "=+%##%+=",
      "==*##*==",
      "=+:..:+=",
      "##*==*##",
      "=+:..:+=",
      "##*==*##",
    ],
    wall: [
      "%#*##*#%",
      "#*#%%#*#",
      "#+=##=+#",
      "%##%%##%",
      "%#*##*#%",
      "#+=##=+#",
      "#*#%%#*#",
      "%#*##*#%",
    ],
  },
  FORJA_MACULADA: {
    floor: [
      "#%#==#%#",
      "%*+==+*%",
      "#*=..=*#",
      "==*##*==",
      "#*=..=*#",
      "%*+==+*%",
      "#%#==#%#",
      "=+====+=",
    ],
    wall: [
      "%%%%%%##",
      "%#*++*#%",
      "#*=##=*#",
      "=+#%%#+=",
      "=+#%%#+=",
      "#*=##=*#",
      "%#*++*#%",
      "##%%%%##",
    ],
  },
  JARDIM_PUTRIDO: {
    floor: [
      "..:*+*:.",
      "-:+*#*+:",
      "==*%#*==",
      "::+##+::",
      ".:+*#*:.",
      "==*##*==",
      "-:+#*+:-",
      "..:++:..",
    ],
    wall: [
      "#*#%##*#",
      "*+=##=+*",
      "#+*%%*+#",
      "%##**##%",
      "##*=+*##",
      "#+*%%*+#",
      "*+=##=+*",
      "#*##%#*#",
    ],
  },
  CIDADE_SUBTERRANEA: {
    floor: [
      "#======#",
      "#+====+#",
      "#+=..=+#",
      "#+====+#",
      "#======#",
      "#+====+#",
      "#+=..=+#",
      "#======#",
    ],
    wall: [
      "%##%%##%",
      "%#+==+#%",
      "%#+==+#%",
      "%##%%##%",
      "%##%%##%",
      "%#+==+#%",
      "%#+==+#%",
      "%##%%##%",
    ],
  },
  ABISMO_CRISTALINO: {
    floor: [
      "...==...",
      ".:+**+:.",
      "=+*##*+=",
      "*#%@@%#*",
      "*#%@@%#*",
      "=+*##*+=",
      ".:+**+:.",
      "...==...",
    ],
    wall: [
      ".:+==+:.",
      ":*####*:",
      "+#%@@%#+",
      "=#@@@@#=",
      "=#@@@@#=",
      "+#%@@%#+",
      ":*####*:",
      ".:+==+:.",
    ],
  },
  CARCERE_DE_SANGUE: {
    floor: [
      "##===##%",
      "#*+..+*#",
      "#+=%%=+#",
      "==*##*==",
      "==*##*==",
      "#+=%%=+#",
      "#*+..+*#",
      "%##===##",
    ],
    wall: [
      "%##%%##%",
      "#+=##=+#",
      "#+*%%*+#",
      "%#*##*#%",
      "%#*##*#%",
      "#+*%%*+#",
      "#+=##=+#",
      "%##%%##%",
    ],
  },
  BIBLIOTECA_DO_OCULTO: {
    floor: [
      "==+##+==",
      "==*%%*==",
      "#+=..=+#",
      "##*++*##",
      "##*++*##",
      "#+=..=+#",
      "==*%%*==",
      "==+##+==",
    ],
    wall: [
      "%#%##%#%",
      "%*+==+*%",
      "#+*##*+#",
      "%%####%%",
      "%%####%%",
      "#+*##*+#",
      "%*+==+*%",
      "%#%##%#%",
    ],
  },
  CORACAO_DO_ABISMO: {
    floor: [
      ".:+==+:.",
      ":*#@@#*:",
      "+#%@@%#+",
      "=#@%%@#=",
      "=#@%%@#=",
      "+#%@@%#+",
      ":*#@@#*:",
      ".:+==+:.",
    ],
    wall: [
      "@%#**#%@",
      "%#*++*#%",
      "#*=..=*#",
      "*+====+*",
      "*+====+*",
      "#*=..=*#",
      "%#*++*#%",
      "@%#**#%@",
    ],
  },
};

/** Variações locais determinísticas dos mesmos materiais. */
export function getBiomeSurface(biomeId, material, variant = 'base') {
  const model = BIOME_SURFACE_ART[biomeId];
  if (!model || !['floor', 'wall'].includes(material)) return null;
  // O piso ocupa quase toda a área visível: excesso de caracteres cria
  // ruído visual e concorre com o protagonista. Preserve detalhes de alta
  // densidade nas paredes, objetos e monstros; deixe respiro no chão.
  // A máscara é estática e NÃO consome o RNG do gerador procedural.
  const base = material === 'floor'
    ? model.floor.map((line, y) => [...line].map((ch, x) =>
        (x * 3 + y * 5) % 11 < 4 ? ch : ' '
      ).join(''))
    : model.wall;
  if (variant === 'base') return base;
  if (variant !== 'debris' && variant !== 'cracked') return null;
  const cells = base.map(line => [...line]);
  const marks = variant === 'cracked'
    ? [[1, 2, ':'], [2, 3, '-'], [3, 4, '='], [4, 4, ':'], [5, 5, '.'], [6, 5, ':']]
    : [[1, 1, '*'], [2, 5, '#'], [4, 2, '+'], [5, 6, '*'], [6, 4, ':']];
  for (const [y, x, ch] of marks) cells[y][x] = ch;
  return cells.map(row => row.join(''));
}
