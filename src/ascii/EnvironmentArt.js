// ============================================================
// ascii/EnvironmentArt.js
// Arquitetura e cenários ASCII de alta densidade para os 10 Biomas.
// Blocos de pedra com juntas, rachaduras, profundidade nas fendas,
// portas ornamentadas, altares detalhados, baús com ferragens e pisos texturizados.
// ============================================================
import { MATERIALS, BIOME_ASCII_PALETTES } from './AsciiPalette.js';

export const ENVIRONMENT_ART = {
  // ────────────────────────────────────────────────────────────
  // PAREDES E BLOCOS DE PEDRA (8x8 caracteres por tile de 32x32)
  // Cada parede é construída com blocos, juntas e relevos.
  // ────────────────────────────────────────────────────────────
  walls: {
    // Bloco padrão com juntas de argamassa horizontais e verticais
    solid_0: {
      lines: [
        ".------.", // 0: Borda chanfrada superior
        "|#%##*%|", // 1: Bloco 1 - luz e meia-sombra
        "|%##*#%|", // 2: Textura da rocha
        "+======+", // 3: Junta de argamassa horizontal
        "|#*%#%#|", // 4: Bloco 2 desfasado
        "|%#*#%#|", // 5: Grãos minerais
        "|##%#%#|", // 6: Sombra inferior
        "'------'", // 7: Borda inferior
      ],
    },

    // Bloco com rachadura estrutural diagonal profunda
    cracked_0: {
      lines: [
        ".---/--.", // 0: Fissura inicial no topo
        "|#%/##%|", // 1: Fenda atravessando o bloco
        "|%/##*%|", // 2: Fratura profunda
        "+/=====+", // 3: Quebra da argamassa
        "|/%#*#%|", // 4: Deslocamento da rocha
        "|#/%#%#|", // 5: Fissura continuando
        "|##/%#%|", // 6: Ponto de tensão
        "'---/--'", // 7: Saída da rachadura
      ],
    },

    // Bloco com desgaste antigo, nicho cavado e musgo/ferrugem
    weathered_0: {
      lines: [
        ".------.", // 0: Topo
        "|#%..#%|", // 1: Depressão desgastada
        "|%#@@#%|", // 2: Cavidade escura
        "+======+", // 3: Junta
        "|#*;;#%|", // 4: Musgo / pátina mineral
        "|%;;;#%|", // 5: Infiltração
        "|##%#%#|", // 6: Sombra
        "'------'", // 7: Base
      ],
    },

    // Topo de parede com relevo / parapeito
    wall_top_0: {
      lines: [
        "========", // 0: Borda de pedra polida
        ":::::::: ", // 1: Luz direta refletida
        "--------", // 2: Chanfro
        "|#%##*%|", // 3: Bloco de sustentação
        "|%##*#%|", // 4: Rocha sólida
        "+======+", // 5: Junta
        "|#*%#%#|", // 6: Bloco inferior
        "'------'", // 7: Sombra de topo
      ],
    },
  },

  // ────────────────────────────────────────────────────────────
  // PISOS E TERRENOS (8x8 caracteres com texturas sutis)
  // Nada de apenas um ponto solitário; lajotas com rejunte e cascalho.
  // ────────────────────────────────────────────────────────────
  floors: {
    // Lajotas de pedra talhada com rejunte fino
    flagstone_0: {
      lines: [
        "·......·", // 0: Junta sutil
        ":..::..:", // 1: Granulação da pedra
        ":.::::.:", // 2: Luz difusa
        "·......·", // 3: Divisória entre lajotas
        ":.::.:::", // 4: Variação mineral
        "::::::::", // 5: Textura suave
        ":..::..:", // 6: Ponto de apoio
        "·......·", // 7: Junta
      ],
    },

    // Lajota com fenda fina e poeira acumulada
    flagstone_cracked: {
      lines: [
        "·.../..·", // 0: Fenda
        ":../:..:", // 1: Linha de fratura
        ":./:::.:", // 2: Profundidade
        "·/.....·", // 3: Cruzamento de lajotas
        ":..:/.::", // 4: Micro-rachadura
        ":::::/::", // 5: Fissura
        ":..::./:", // 6: Fim da linha
        "·......·", // 7: Borda
      ],
    },

    // Piso com seixos e detritos antigos
    flagstone_debris: {
      lines: [
        "·......·", // 0: Borda
        ":.o.::.:", // 1: Seixo solto
        "::::::::", // 2: Solo firme
        "·...*..·", // 3: Fragmento metálico ou ósseo
        ":.::.:::", // 4: Grãos
        ":::.o:::", // 5: Detrito de pedra
        ":..::..:", // 6: Poeira
        "·......·", // 7: Borda
      ],
    },
  },

  // ────────────────────────────────────────────────────────────
  // PORTA MONUMENTAL (Moldura em arco, pranchas e reforço de ferro)
  // ────────────────────────────────────────────────────────────
  doors: {
    closed: {
      width: 16,
      height: 16,
      lines: [
        "  /==========\\  ", // 0: Arco superior de cantaria
        " / /========\\ \\ ", // 1: Moldura esculpida
        "|| ||######|| ||", // 2: Topo das tábuas e dobradiças
        "|| ||##[+]#|| ||", // 3: Rebites de ferro maciço
        "|| ||######|| ||", // 4: Madeira de carvalho escuro
        "|| [========] ||", // 5: Travessa horizontal de ferro
        "|| ||##[O]#|| ||", // 6: Fechadura e anel de puxador
        "|| ||######|| ||", // 7: Pranchas centrais
        "|| ||######|| ||", // 8: Madeira pesada
        "|| [========] ||", // 9: Travessa inferior de reforço
        "|| ||######|| ||", // 10: Pranchas inferiores
        "|| ||##[+]#|| ||", // 11: Rebites inferiores
        "|| ||######|| ||", // 12: Base das pranchas
        "|| |________| ||", // 13: Soleira de ferro
        " \\____________/ ", // 14: Soleira de pedra
        "................", // 15: Sombra do portal
      ],
      colorResolver: (ch, x, y) => {
        if (ch === ' ') return null;
        // Moldura de pedra externa
        if (ch === '/' || ch === '\\' || (ch === '|' && (x <= 1 || x >= 14))) {
          return MATERIALS.STONE_ASH['#'];
        }
        // Ferragens (travessas, rebites, fechadura)
        if (ch === '[' || ch === ']' || ch === '=' || ch === '+' || ch === 'O') {
          return MATERIALS.AGED_IRON['.'];
        }
        // Madeira das pranchas
        return MATERIALS.LEATHER['#'];
      }
    },
  },

  // ────────────────────────────────────────────────────────────
  // SANTUÁRIO / ALTAR SAGRADO (Pedestal esculpido, braseiro e chamas)
  // ────────────────────────────────────────────────────────────
  sanctuary: {
    width: 20,
    height: 22,
    lines: [
      "        ( )         ", // 0: Chama sagrada ardendo
      "       / * \\        ", // 1: Fagulhas douradas
      "      ( *** )       ", // 2: Brasa intensa
      "       \\_=_/        ", // 3: Braseiro dourado
      "      .-===-.       ", // 4: Borda da tigela sacrificial
      "     :++***++:      ", // 5: Relevos sagrados
      "    /=========\\     ", // 6: Mesa do altar de mármore
      "    |#%#%#%#%#|     ", // 7: Entalhes rúnicos
      "    |#%#[†]#%#|     ", // 8: Cruz / símbolo celestial
      "    |#%#%#%#%#|     ", // 9: Friso do altar
      "    \\=========/     ", // 10: Base da mesa
      "      |#%#%#|       ", // 11: Coluna central de sustentação
      "      |%#*#%|       ", // 12: Fuste estriado
      "      |#%#%#|       ", // 13: Pedestal
      "    .-=======--.    ", // 14: Degrau superior
      "   :++**###**++:    ", // 15: Moldura do degrau
      "  /=============\\   ", // 16: Segundo degrau
      " |#%#%#%#%#%#%#%#|  ", // 17: Base do monumento
      " '==============='  ", // 18: Laje fundamental
      "  .............     ", // 19: Sombra no chão
    ],
    colorResolver: (ch, x, y) => {
      if (ch === ' ') return null;
      // Chamas e fagulhas no topo
      if (y <= 3) {
        if (ch === '*' || ch === ' ') return '#ffffff';
        return '#f2c56d';
      }
      // Tigela e símbolo celestial
      if (ch === '†' || (y === 3 || y === 4)) {
        return MATERIALS.GOLD['='];
      }
      // Pedra nobre do altar
      return MATERIALS.BONE[ch] || '#d4c6a7';
    }
  },

  // ────────────────────────────────────────────────────────────
  // BAÚ DE TESOURO (Ferragens, fechadura em caveira, madeira pesada)
  // ────────────────────────────────────────────────────────────
  chest: {
    closed: {
      width: 16,
      height: 14,
      lines: [
        "  .----------.  ", // 0: Tampa abobadada de madeira
        " /============\\ ", // 1: Borda de ferro reforçado
        "|[+]#%#%#%#[+]| ", // 2: Rebites da tampa
        "|#############| ", // 3: Madeira encerada
        "|=============| ", // 4: Fecho com dobradiça
        "|[+]#%(o)%#[+]| ", // 5: Fechadura rúnica central
        "|####===######| ", // 6: Tranco de ferro
        "|#############| ", // 7: Corpo do baú
        "|[+]#%#%#%#[+]| ", // 8: Rebites inferiores
        "|=============| ", // 9: Base de ferro
        " \\___________/  ", // 10: Pés do baú
        "  ...........   ", // 11: Sombra
      ],
      colorResolver: (ch, x, y) => {
        if (ch === ' ') return null;
        // Fechadura e rebites dourados
        if (ch === 'o' || ch === '+' || ch === '[+]') return MATERIALS.GOLD['='];
        // Ferragens reforçadas
        if (ch === '[' || ch === ']' || ch === '=' || ch === '|' || ch === '/' || ch === '\\') {
          return MATERIALS.AGED_IRON['.'];
        }
        // Madeira
        return MATERIALS.LEATHER['#'];
      }
    },

    open: {
      width: 16,
      height: 16,
      lines: [
        "  /==========\\  ", // 0: Tampa aberta para trás
        " / /========\\ \\ ", // 1: Interior da tampa
        " \\ \\        / / ", // 2: Espaço aberto
        "  \\==========/  ", // 3: Borda
        "  .***$$$***.   ", // 4: Brilho de ouro e joias!
        " /$$$$$*$$$$$\\  ", // 5: Moedas reluzentes transbordando
        "|=============| ", // 6: Borda superior da caixa
        "|[+]#%(o)%#[+]| ", // 7: Fechadura aberta
        "|####===######| ", // 8: Corpo
        "|#############| ", // 9: Madeira
        "|[+]#%#%#%#[+]| ", // 10: Rebites
        "|=============| ", // 11: Base
        " \\___________/  ", // 12: Pés
        "  ...........   ", // 13: Sombra
      ],
      colorResolver: (ch, x, y) => {
        if (ch === ' ') return null;
        // Ouro e joias transbordando
        if (ch === '$' || (y === 4 && ch === '*')) return '#f2c56d';
        if (ch === 'o' || ch === '+' || ch === '[+]') return MATERIALS.GOLD['='];
        if (ch === '[' || ch === ']' || ch === '=' || ch === '|' || ch === '/' || ch === '\\') {
          return MATERIALS.AGED_IRON['.'];
        }
        return MATERIALS.LEATHER['#'];
      }
    }
  },

  // ────────────────────────────────────────────────────────────
  // PILAR ESTATUÁRIO / COLUNA
  // ────────────────────────────────────────────────────────────
  pillar: {
    width: 12,
    height: 16,
    lines: [
      ".==========.", // 0: Capitel de pedra
      "|:++**++:::|", // 1: Friso esculpido
      " \\========/ ", // 2: Curvatura
      "  |#%##*%|  ", // 3: Fuste cilíndrico
      "  |%##*#%|  ", // 4: Ranhuras verticais
      "  |#*%#%#|  ", // 5: Sombra e luz
      "  |%#*#%#|  ", // 6: Meio-tom
      "  |##%#%#|  ", // 7: Cilindro
      "  |#%##*%|  ", // 8: Textura da rocha
      "  |%##*#%|  ", // 9: Base do fuste
      " /========\\ ", // 10: Transição para a base
      "|:++**++:::|", // 11: Friso inferior
      "'=========='", // 12: Plinto quadrado
      "............", // 13: Sombra
    ],
    colorResolver: (ch, x, y, biomeKey = 'ARREDORES_CINZENTOS') => {
      if (ch === ' ') return null;
      const palette = BIOME_ASCII_PALETTES[biomeKey]?.wall || MATERIALS.STONE_ASH;
      return palette[ch] || '#656973';
    }
  }
};
