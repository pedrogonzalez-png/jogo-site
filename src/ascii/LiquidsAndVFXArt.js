// ============================================================
// ascii/LiquidsAndVFXArt.js
// Água volumétrica tridimensional, líquidos biômicos e efeitos de combate ASCII.
// 4 quadros de animação contínua para água, magma, sangue e esporos,
// arcos de corte densos e explosões de partículas de caracteres.
// ============================================================
import { MATERIALS } from './AsciiPalette.js';

export const LIQUIDS_AND_VFX = {
  // ────────────────────────────────────────────────────────────
  // ÁGUA VOLUMÉTRICA DO AQUEDUTO SUBMERSO (4 frames animados)
  // Camadas de profundidade (@, %), ondulações (~, ≈, =),
  // reflexos de luz (*, +) e espuma branca (: , .)
  // ────────────────────────────────────────────────────────────
  water: {
    // Frame 0: Ondulação inicial com crista central
    frame_0: [
      "~=~:..:~=~~≈≈*≈~", // 0: Espuma na margem e cristas
      "≈≈*#%##*≈~~≈≈*≈~", // 1: Transição de profundidade
      "~*#%@@%#*≈~~≈*#*", // 2: Zona profunda e escura
      "~≈#%@@%#≈~~≈*#%#", // 3: Fundo abissal com pedras submersas
      "~~*#%##*≈~~≈*#%#", // 4: Elevação da corrente
      "~=~~≈≈*≈~~≈*#%#*", // 5: Correnteza laminar
      "~=~:..:~=~~≈#%#≈", // 6: Crista com espuma
      "≈≈*#%##*≈~~≈*#*≈", // 7: Ondulação contínua
      "~*#%@@%#*≈~~≈≈*≈", // 8: Fundo escuro
      "~≈#%@@%#≈~~≈*#%#", // 9: Redemoinho sutil
      "~~*#%##*≈~~≈*#%#", // 10: Vórtice
      "~=~~≈≈*≈~~≈*#%#*", // 11: Superfície
      "~=~:..:~=~~≈#%#≈", // 12: Espuma
      "≈≈*#%##*≈~~≈*#*≈", // 13: Crista secundária
      "~*#%@@%#*≈~~≈≈*≈", // 14: Reflexo
      "~=~~≈≈*≈~~:..:~=", // 15: Margem oposta
    ],

    // Frame 1: Deslocamento da onda e espuma se abrindo
    frame_1: [
      "~~≈*≈~=~:..:~=~~",
      "≈~~≈*#%##*≈~~≈≈*",
      "≈~~≈*#%@@%#*≈~~≈",
      "~≈~~≈#%@@%#≈~~≈*",
      "~~≈~~*#%##*≈~~≈*",
      "≈~~≈*#%#*~=~~≈≈*",
      "~=~~≈#%#≈~=~:..:",
      "≈~~≈*#*≈≈≈*#%##*",
      "≈~~≈≈*≈~*#%@@%#*",
      "~≈~~≈*#%#~≈#%@@%",
      "~~≈~~*#%#~~*#%##",
      "≈~~≈*#%#*~=~~≈≈*",
      "~=~~≈#%#≈~=~:..:",
      "≈~~≈*#*≈≈≈*#%##*",
      "≈~~≈≈*≈~*#%@@%#*",
      ":..:~=~~≈*#%##*≈",
    ],

    // Frame 2: Crista máxima com reflexo cintilante
    frame_2: [
      "~=~~≈≈*≈~~:..:~=",
      "~*#%@@%#*≈~~≈≈*≈",
      "≈≈*#%##*≈~~≈*#*≈",
      "~=~:..:~=~~≈#%#≈",
      "~=~~≈≈*≈~~≈*#%#*",
      "~~*#%##*≈~~≈*#%#",
      "~≈#%@@%#≈~~≈*#%#",
      "~*#%@@%#*≈~~≈*#*",
      "≈≈*#%##*≈~~≈≈*≈~",
      "~=~:..:~=~~≈≈*≈~",
      "~~*#%##*≈~~≈*#%#",
      "~≈#%@@%#≈~~≈*#%#",
      "~=~~≈≈*≈~~≈*#%#*",
      "~=~:..:~=~~≈#%#≈",
      "≈≈*#%##*≈~~≈*#*≈",
      "~*#%@@%#*≈~~≈≈*≈",
    ],

    // Frame 3: Retorno do fluxo laminar
    frame_3: [
      ":..:~=~~≈*#%##*≈",
      "≈~~≈≈*≈~*#%@@%#*",
      "≈~~≈*#*≈≈≈*#%##*",
      "~=~~≈#%#≈~=~:..:",
      "≈~~≈*#%#*~=~~≈≈*",
      "~~≈~~*#%#~~*#%##",
      "~≈~~≈*#%#~≈#%@@%",
      "≈~~≈≈*≈~*#%@@%#*",
      "≈~~≈*#*≈≈≈*#%##*",
      "~=~~≈#%#≈~=~:..:",
      "≈~~≈*#%#*~=~~≈≈*",
      "~~≈~~*#%#*≈~~≈*",
      "~≈~~≈#%@@%#≈~~≈*",
      "≈~~≈*#%@@%#*≈~~≈",
      "≈~~≈*#%##*≈~~≈≈*",
      "~~≈*≈~=~:..:~=~~",
    ],

    colorResolver: (ch) => {
      if (ch === ' ' || ch === '.') return '#d8f6fc'; // Espuma branca cintilante
      if (ch === ':') return '#a9e1ed'; // Bolha de espuma
      if (ch === '-') return '#7ec2d4'; // Crista iluminada
      if (ch === '=') return '#59a2b5'; // Onda
      if (ch === '~' || ch === '≈') return '#3c798a'; // Correnteza
      if (ch === '*') return '#285866'; // Luz na água
      if (ch === '#') return '#1b3b47'; // Meia profundidade
      if (ch === '%') return '#11252e'; // Profundidade escura
      if (ch === '@') return '#08141a'; // Abissal
      return '#3c798a';
    }
  },

  // ────────────────────────────────────────────────────────────
  // SANGUE COAGULADO E ESPUMA SANGUÍNEA (Cárcere de Sangue)
  // ────────────────────────────────────────────────────────────
  blood: {
    frame_0: [
      "~≈~%##%~≈~*+*~≈~",
      "≈*#%@@%#*~%@@%~≈",
      "~#%@@@@%#*#@@%#*",
      "~*#%@@%#**#%@@%#",
      "~≈~*##*~≈~*#%##*",
      "≈~%@@%~≈~~*+*~≈~",
      "~#%@@@@%#*#@@%#*",
      "~*#%@@%#**#%@@%#",
    ],
    colorResolver: (ch) => {
      if (ch === '+' || ch === '*') return '#f797a3'; // Espuma de sangue
      if (ch === '~' || ch === '≈') return '#a83241'; // Plasma
      if (ch === '#') return '#82232f'; // Sangue fresco
      if (ch === '%') return '#380c12'; // Coágulo escuro
      if (ch === '@') return '#1c0508'; // Fundo venoso
      return '#82232f';
    }
  },

  // ────────────────────────────────────────────────────────────
  // MAGMA INCANDESCENTE E CROSTA DE BASALTO (Forja Maculada)
  // ────────────────────────────────────────────────────────────
  magma: {
    frame_0: [
      "@@%##*#%@@@@%##*",
      "%##***##%@@%#**#",
      "#*++==+*#%#*++*#",
      "#+=::::=+*#+=::+",
      "#*++==+*#%#*++*#",
      "%##***##%@@%#**#",
      "@@%##*#%@@@@%##*",
      "%#*++++*#@@%#*++",
    ],
    colorResolver: (ch) => {
      if (ch === ':' || ch === '.') return '#fff8a6'; // Calor branco puro
      if (ch === '=' || ch === '-') return '#fcd253'; // Amarelo incandescente
      if (ch === '+') return '#f27329'; // Laranja ardente
      if (ch === '*') return '#d44e22'; // Magma vivo
      if (ch === '#') return '#692112'; // Crosta esfriando
      if (ch === '%') return '#3b150d'; // Basalto quente
      if (ch === '@') return '#1a0b08'; // Basalto negro
      return '#d44e22';
    }
  },

  // ────────────────────────────────────────────────────────────
  // EFEITOS DE COMBATE (VFX): ARCO DE CORTE ASCII
  // ────────────────────────────────────────────────────────────
  slashArc: {
    light: {
      width: 24,
      height: 16,
      lines: [
        "              .---.     ", // 0: Ponta da lâmina cortando o ar
        "          .-==+***#\\    ", // 1: Fio com reflexo especular
        "       .-==+*###%%%%|   ", // 2: Rastro denso de aço
        "    .-==+*##%%%%@@@@|   ", // 3: Volume do corte
        "   :==+*##%%%%@@@@@@/   ", // 4: Asa do golpe
        "  :=+*##%%%%@@@@@@@/    ", // 5: Força cinética
        "  :=+*##%%%%@@@@@/      ", // 6: Desvanecimento
        "   .-=+*##%%%%/         ", // 7: Partículas residuais
        "     .-=+*#/            ", // 8: Rastro
        "        .:.             ", // 9: Centelhas
      ],
      colorResolver: (ch) => {
        if (ch === ' ' || ch === '.') return '#ffffff';
        if (ch === ':' || ch === '-') return '#fff2cc';
        if (ch === '=' || ch === '+') return '#ffe299';
        if (ch === '*' || ch === '#') return '#736d8d';
        return '#2b2738';
      }
    },

    heavy: {
      width: 32,
      height: 20,
      lines: [
        "                   .-------.    ",
        "              .--==++****##/    ",
        "          .-==++**###%%%%%|     ",
        "       .-==+**###%%%%%@@@@|     ",
        "    .-==+**###%%%%%@@@@@@@/     ",
        "  :==+**###%%%%%@@@@@@@@@/      ",
        " :=+**###%%%%%@@@@@@@@@/        ",
        " :=+**###%%%%%@@@@@@@/          ",
        "  .-=+**###%%%%%@@@/            ",
        "    .-=+**###%%%%/              ",
        "       .-=+**##/                ",
        "          .-=+:                 ",
        "            .:                  ",
      ],
      colorResolver: (ch) => {
        if (ch === ' ' || ch === '.') return '#ffffff';
        if (ch === ':' || ch === '-') return '#ffdd88';
        if (ch === '=' || ch === '+') return '#ff9900';
        if (ch === '*' || ch === '#') return '#ff4400';
        return '#661100';
      }
    }
  },

  // ────────────────────────────────────────────────────────────
  // EXPLOSÃO DE IMPACTO ASCII (Hit spark / Dano)
  // ────────────────────────────────────────────────────────────
  impactSpark: {
    width: 16,
    height: 16,
    lines: [
      "     \\   |   /  ", // 0: Raios cinéticos
      "      \\  |  /   ", // 1: Fragmentos
      "    -- *#%#* -- ", // 2: Núcleo denso
      "   |  #%@@%#  | ", // 3: Choque de metal com metal
      " --*#%@@@@%#*-- ", // 4: Epicentro da colisão
      "   |  #%@@%#  | ", // 5: Repercussão
      "    -- *#%#* -- ", // 6: Estilhaços
      "      /  |  \\   ", // 7: Centelhas voando
      "     /   |   \\  ", // 8: Fim do impacto
    ],
    colorResolver: (ch) => {
      if (ch === '@' || ch === '%') return '#ffffff'; // Centro ofuscante
      if (ch === '#' || ch === '*') return '#ffdd44';
      if (ch === '+' || ch === '=') return '#ff8800';
      return '#ff3300';
    }
  }
};
