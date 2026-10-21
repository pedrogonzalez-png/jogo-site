// ============================================================
// ascii/EnemyArt.js
// Biblioteca de ilustrações ASCII de alta densidade para inimigos.
// Reproduz o método artístico da referência:
// anatomia explícita (crânio, costelas, articulações, garras, vestes),
// sombreamento volumétrico (@, %, #, *, +, =, -, :, .) e materiais específicos.
// ============================================================
import { MATERIALS } from './AsciiPalette.js';

export const ENEMY_ART = {
  // ────────────────────────────────────────────────────────────
  // 1. ESQUELETO (Esqueleto Desperto, Carrasco Tumular)
  // Crânio, órbitas oculares, caixa torácica, articulações e cimitarra
  // ────────────────────────────────────────────────────────────
  skeleton: {
    width: 24,
    height: 26,
    lines: [
      "        .---.           ", // 0: Calota craniana
      "       :++#%#+:         ", // 1: Têmpora e testa
      "       :*#@@@#*         ", // 2: Órbitas oculares vazias
      "       :+=@@@=+:        ", // 3: Cavidade nasal
      "        :=###=:         ", // 4: Dentes e maxilar
      "          |=|           ", // 5: Vértebras cervicais
      "       .-+###+-.    .   ", // 6: Clavículas + ponta espada
      "      :*#%@@@%#*:  /|\\  ", // 7: Esterno e início costelas
      "     :==|#@@@#|==: |||  ", // 8: Caixa torácica superior
      "     :==|#@@@#|==: |||  ", // 9: Caixa torácica média
      "      .-|#@@@#|-.  |||  ", // 10: Costelas inferiores
      "        :=#@#=:    |||  ", // 11: Coluna lombar
      "       .=+###+=.   |||  ", // 12: Bacia / pelve
      "      :=+*#%#*+=:  [+]  ", // 13: Articulação coxofemoral + guarda
      "      :=+*   *+=:   O   ", // 14: Braços e pomo
      "      .-+|   |+-.       ", // 15: Fêmures
      "       :=|   |=:        ", // 16: Diáfise do fêmur
      "       :=o   o=:        ", // 17: Patelas / joelhos
      "       :=|   |=:        ", // 18: Tíbias
      "       :=|   |=:        ", // 19: Fíbulas
      "      .-+|   |+-.       ", // 20: Tornozelos
      "     :===+   +===:      ", // 21: Falanges dos pés
      "     .....   .....      ", // 22: Apoio no chão
    ],
    colorResolver: (ch, x, y) => {
      if (ch === ' ') return null;
      // Espada de osso/ferro lascado à direita
      if (x >= 18 && y >= 6 && y <= 14) {
        if (ch === 'O' || ch === '[+]') return MATERIALS.AGED_IRON['*'];
        if (ch === '|' || ch === '/' || ch === '\\') return MATERIALS.AGED_IRON['+'];
        return MATERIALS.AGED_IRON['='];
      }
      // Órbitas escuras
      if (y === 2 && x >= 9 && x <= 14) return '#0d0b10';
      // Ossos de marfim e poeira
      return MATERIALS.BONE[ch] || '#c7bfae';
    }
  },

  // ────────────────────────────────────────────────────────────
  // 2. BESTA QUADRÚPEDE (Sabujo de Fuligem, Vinha Rastejante)
  // Anatomia canina/bestial: mandíbula, presas, lombo recurvado, patas
  // ────────────────────────────────────────────────────────────
  beast: {
    width: 30,
    height: 22,
    lines: [
      "                     :--.     ", // 0: Orelhas pontiagudas
      "                    :++##*.   ", // 1: Crânio da besta
      "                   .-#@@@@*.  ", // 2: Olhos incandescentes
      "        .---.     :=+*#@@@@#. ", // 3: Dorso arqueado e focinho
      "      :++***##*..-=+**##@@@@#:", // 4: Espinha eriçada
      "    :++#%%%%%@@#*+===+*##@@@@#", // 5: Ombros musculares e maxila
      "   :=*#%@@@@@@@%#*+==+**#\\vvv/", // 6: Caixa torácica e presas
      "  .-=*#%@@@@@@@@%#*+===+*#-.  ", // 7: Ventre contraído
      "  :=+*#%@@@@@@@@%#*+===+*=:   ", // 8: Flanco
      "   .-=*#%@@@@@@%#*+===+*-.    ", // 9: Quartos traseiros
      "    :=+*#%%%@@%#*+===+*=:     ", // 10: Coxas posteriores
      "    :==+*#  :=+*#   .-=+*#    ", // 11: Início das patas
      "    :=+*#    :=+*#   :=+*#    ", // 12: Articulações
      "    .-=+*    .-=+*   .-=+*    ", // 13: Canelas
      "    :==+*    :==+*   :==+*    ", // 14: Patas dianteiras e traseiras
      "    :^^^*    :^^^*   :^^^*    ", // 15: Garras afiadas
      "    .....    .....   .....    ", // 16: Apoio
    ],
    colorResolver: (ch, x, y, paletteKey = 'MAGMA') => {
      if (ch === ' ') return null;
      // Presas afiadas
      if (ch === 'v' || ch === '\\' || ch === '/') return '#ffffff';
      // Olhos em brasa
      if (y === 2 && x >= 21 && x <= 25) return '#ffaa00';
      // Brasas / cinzas
      const mat = MATERIALS[paletteKey] || MATERIALS.MAGMA;
      return mat[ch] || '#af5d3b';
    }
  },

  // ────────────────────────────────────────────────────────────
  // 3. SENTINELA / GUARDIÃO DE ELITE (Sentinela Cinzenta, Bruto)
  // Armadura monumental pesada, escudo torre e alabarda
  // ────────────────────────────────────────────────────────────
  guardian: {
    width: 32,
    height: 30,
    lines: [
      "           .-------.            ", // 0: Topo do elmo reforçado
      "         :++**###**++:     .    ", // 1: Cume de ferro
      "        :*##%%%%%%%##*:   /|\\   ", // 2: Lâmina da alabarda
      "       :+#%@@@@@@@@%#+:  /|||\\  ", // 3: Faceplate
      "       :==--=====--==:  |#####| ", // 4: Fenda estreita de visão
      "       .-=+*#####*+=-.   \\|||/  ", // 5: Queixeira blindada
      "      :==+*#%%%%%#*+==:   |||   ", // 6: Gola reforçada
      "    .---==+*#%%%#*+==---. |||   ", // 7: Espaldares maciços
      "   :++**##%@@@@@@@%##**++:|||   ", // 8: Ombros de placas duplas
      "  [#######################]||   ", // 9: Escudo torre entalhado
      "  [#%#%#%#%#%#%#%#%#%#%#%#]||   ", // 10: Brasão gravado
      "  [#%#%#%#*@#%#%#@*#%#%#%#]||   ", // 11: Símbolo de proteção
      "  [#%#%#%#%@@%#%@@%#%#%#%#]||   ", // 12: Relevo rúnico
      "  [#%#%#%#%#%@@@%#%#%#%#%#]||   ", // 13: Núcleo do escudo
      "  [#%#%#%#%#%#@#%#%#%#%#%#][+]  ", // 14: Guarda da arma
      "  [#%#%#%#%#%#%#%#%#%#%#%#] O   ", // 15: Empunhadura
      "  [#%#%#%#%#%#%#%#%#%#%#%#]     ", // 16: Placas inferiores
      "  [#######################]     ", // 17: Borda de ferro reforçada
      "   \\#####################/      ", // 18: Ponta do escudo torre
      "    \\###################/       ", // 19: Borda inferior
      "      :=+*#%%@@%%#*+=:          ", // 20: Pernas blindadas
      "      .-=+*#%%@@%#*+-.          ", // 21: Coxotes
      "      :=+*#%%%@@%%#*+=:         ", // 22: Joelheiras pesadas
      "      .-=+*#%%@@%%#*+-.         ", // 23: Grevas maciças
      "     :==+*#%@@@@@@%#*+==:       ", // 24: Escarpins de ferro
      "    :===+*#%@@@@@@%#*+===:      ", // 25: Base dos pés
      "     ...................        ", // 26: Sombra
    ],
    colorResolver: (ch, x, y) => {
      if (ch === ' ') return null;
      // Alabarda pesada à direita
      if (x >= 24 && y <= 15) {
        if (ch === 'O' || ch === '[+]') return MATERIALS.GOLD['*'];
        if (ch === '|' || ch === '/' || ch === '\\') return '#ffffff';
        return MATERIALS.STEEL['='];
      }
      // Escudo torre com bordas reforçadas
      if (ch === '[' || ch === ']' || (y === 9 || y === 17 || y === 18 || y === 19)) {
        return MATERIALS.AGED_IRON['.'];
      }
      if (ch === '@' && y >= 10 && y <= 14) return '#f2c56d'; // Runa central dourada
      return MATERIALS.AGED_IRON[ch] || '#6c687e';
    }
  },

  // ────────────────────────────────────────────────────────────
  // 4. MAGO / CULTISTA (Mago de Sangue, Sábio Enlouquecido)
  // Capuz sombrio, mantos longos, cajado ritual e orbe flutuante
  // ────────────────────────────────────────────────────────────
  mage: {
    width: 26,
    height: 28,
    lines: [
      "          .---.      (o)    ", // 0: Topo capuz + orbe de energia
      "        :++***#+.    /|\\    ", // 1: Dobras do capuz + topo cajado
      "       :*##%%%##*:   |||    ", // 2: Sombra do capuz
      "      :+#%@@@@@%#+:  |||    ", // 3: Escuridão interna
      "      :===::.::===:  |||    ", // 4: Olhos brilhantes na sombra
      "       .-=+***+=-.   |||    ", // 5: Fim do capuz
      "       :==+*#*+==:   |||    ", // 6: Gola ritualística
      "     .-=+*#%%%%#*+-. |||    ", // 7: Ombros e estola
      "    :=+*#%@@@@@@%#*=:|||    ", // 8: Peitoral das vestes
      "   .-=+*#%@@@@@@%#*+-[+]    ", // 9: Empunhadura do cajado
      "   :=+*#%%@@@@@@%%#*=:|     ", // 10: Braço esquerdo segurando
      "  .-=+*#%%%@@@@%%%#*+-.     ", // 11: Manga esvoaçante
      "  :=+*#%%%%@@@@%%%%#*=:     ", // 12: Manto em camadas
      "  :=+*#%%%%%%%%%%%%#*=:     ", // 13: Pregas verticais
      "   :=+*#%%%%%%%%%%#*+=:     ", // 14: Cinturão de corda e tomos
      "   .-=+*#%%%%%%%%#*+-.      ", // 15: Dobras das vestes
      "    :=+*#%@@@@@@%#*+=:      ", // 16: Saia do manto
      "    .-=+*#%@@@@%#*+-.       ", // 17: Ondulação inferior
      "   :==+*#%@@@@@@%#*+==:     ", // 18: Barra do tecido
      "  :===+*#%@@@@@@%#*+===:    ", // 19: Bainha esparramada
      "   ...................      ", // 20: Sombra mística
    ],
    colorResolver: (ch, x, y, paletteKey = 'MAGIC') => {
      if (ch === ' ') return null;
      // Orbe mágica e cajado
      if (x >= 20 && y <= 10) {
        if (ch === '(' || ch === ')' || ch === 'o') return '#00ffff';
        if (ch === '[+]' || ch === '|') return MATERIALS.GOLD['*'];
        return '#cca7ff';
      }
      // Olhos misteriosos brilhando dentro do capuz
      if (y === 4 && (x === 11 || x === 14)) return '#ff44aa';
      // Mantos esvoaçantes
      const mat = MATERIALS[paletteKey] || MATERIALS.MAGIC;
      return mat[ch] || '#895fc7';
    }
  },

  // ────────────────────────────────────────────────────────────
  // 5. AFOGADO / CRIATURA AQUÁTICA (Afogado, Espreitador Abissal)
  // Corpo pálido e afundado, guelras, algas, olhos vazios
  // ────────────────────────────────────────────────────────────
  drowned: {
    width: 24,
    height: 26,
    lines: [
      "        .~~~.           ", // 0: Algas molhadas na cabeça
      "       :++**#+:         ", // 1: Crânio intumescido
      "       :*#@@@#*         ", // 2: Olhos brancos leitosos
      "       :+=@@@=+:        ", // 3: Cavidade nasal afundada
      "       .-+###+-.        ", // 4: Mandíbula aberta
      "       :==+*+==:        ", // 5: Pescoço e guelras
      "     .-=+*#%%#*+-.      ", // 6: Ombros cobertos de lodo
      "    :=+*#%@@@@%#*+=:    ", // 7: Peitoral encharcado
      "   .-=+*#%@@@@%#*+-.    ", // 8: Caixa torácica escura
      "   :=+*#%%%@@%%%#*=:    ", // 9: Abdômen
      "    :=+*#%%%%%%#*+=:    ", // 10: Cintura com trapos
      "    .-=+*#%%%%#*+-.     ", // 11: Quadril
      "     :=+*#%%@@%#*+=:    ", // 12: Coxas
      "     .-=+*#%%@@%#*+-.   ", // 13: Joelhos escorrendo água
      "     :=+*#%%%@@%%#*+=:  ", // 14: Canelas
      "     .-=+*#%%@@%%#*+-.  ", // 15: Pés com membranas
      "    :==+*#%@@@@@@%#*+==:", // 16: Dedos abertos
      "    .~~~~~~~~~~~~~~~~.  ", // 17: Poça de água aos pés
    ],
    colorResolver: (ch, x, y) => {
      if (ch === ' ') return null;
      if (ch === '~') return '#3c798a'; // Água e lodo
      if (y === 2 && (x === 9 || x === 14)) return '#d8f6fc'; // Olhos fosforescentes
      return MATERIALS.WATER[ch] || '#285866';
    }
  },

  // ────────────────────────────────────────────────────────────
  // 6. ENTIDADE ANÔMALA / HORROR CÓSMICO (Manifestação da Ruína)
  // Formato amorfo com múltiplos olhos, tentáculos e fenda dimensional
  // ────────────────────────────────────────────────────────────
  aberration: {
    width: 28,
    height: 26,
    lines: [
      "          .(@@@).           ", // 0: Cúpula informe
      "       .++*#%@@@%#*++.      ", // 1: Tecido dimensional
      "      :*#%@@@@@@@@@%#*:     ", // 2: Olhos superiores
      "     :+%@@(O)@@@(O)@@%+:    ", // 3: Globos oculares brilhantes
      "     :*#@@@@@@@@@@@@#*:     ", // 4: Massa escura pulsante
      "    :=+*#%@@(O)@@%#*+=:     ", // 5: Olho central descomunal
      "   .-=+*#%%@@@@@@%%#*+-.    ", // 6: Fendas gravitacionais
      "   :=+*#%%%@@@@%%%#*+=:     ", // 7: Anéis de energia
      "   :(#) %@@@@@@@@% (#):     ", // 8: Núcleos orbitais
      "  .~~~. :*#%%%%#*: .~~~.    ", // 9: Tentáculos laterais
      "  (###)  :=+**+=:  (###)    ", // 10: Apêndices espirais
      "   \\~/    :====:    \\~/     ", // 11: Pontas das gavinhas
      "           ::::             ", // 12: Distorção do espaço
    ],
    colorResolver: (ch, x, y) => {
      if (ch === ' ') return null;
      // Pupilas e olhos cósmicos
      if (ch === 'O' || ch === '(' || ch === ')') return '#00ffcc';
      return MATERIALS.VOID[ch] || '#7156b5';
    }
  },
};
