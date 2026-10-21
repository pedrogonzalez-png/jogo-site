// ============================================================
// ascii/BossArt.js
// Ilustrações ASCII de alta densidade para os 10 Chefes do Abismo.
// Cada chefe possui identidade anatômica única, ornamentos e variações de fase.
// ============================================================
import { MATERIALS } from './AsciiPalette.js';

export const BOSS_ART = {
  // ────────────────────────────────────────────────────────────
  // 1. SENHOR DAS CINZAS (Os Arredores Cinzentos)
  // ────────────────────────────────────────────────────────────
  senhor_das_cinzas: {
    width: 36,
    height: 34,
    lines: [
      "             /\\                  /\\             ", // 0: Chifres de escória
      "            /  \\     .----.     /  \\            ", // 1: Coroa de brasas
      "           / /\\ \\  :++#%@@#+:  / /\\ \\           ", // 2: Elmo monumental
      "          | |  | |:*#@@@@@@#*:| |  | |    .     ", // 3: Visor em brasa + ponta espada
      "           \\ \\/ /:+#@@@@@@@@%#+\\ \\/ /    /|\\    ", // 4: Faceplate incandescente
      "            \\  / :==--====--==: \\  /    /|||\\   ", // 5: Fenda do olhar em fogo
      "             \\/  .-=+*####*+=-.  \\/     |||||   ", // 6: Gorjal de placas
      "               :==+*#%%%%%%#*+==:       |||||   ", // 7: Ombros largos
      "          .---==+*#%@@@@@@@@%#*+==---.  |||||   ", // 8: Espaldares com lâminas
      "         :++**##%%@@@@@@@@@@@@%%##**++: |||||   ", // 9: Peitoral da fornalha
      "        :*##%%%%%@@@@@@@@@@@@@@%%%%%##*:|||||   ", // 10: Brasas internas
      "       :+#%@@@@@@@@@@@@@@@@@@@@@@@@@@%#+|||||   ", // 11: Placas do tórax
      "       :*#@@@@@@@@@@@@@@@@@@@@@@@@@@@@#*|||||   ", // 12: Costelas de ferro
      "       :+#%@@@@@@@@@@@@@@@@@@@@@@@@@@%#+|||||   ", // 13: Cintura
      "        :=+*#%%%%%%%%%%%%%%%%%%%%%%#*+=:|||||   ", // 14: Cinturão de correntes
      "        .-=+*#%%%%%%%%%%%%%%%%%%%%#*+-. [+]     ", // 15: Guarda da grande espada
      "         :=+*#%@@@@@@@@@@@@@@@@@@%#*+=:  O      ", // 16: Pomo flamejante
      "         .-=+*#%@@@@@@@@@@@@@@@@%#*+-.          ", // 17: Manto de fumaça
      "          :=+*#%%@@@@@@@@@@@@@@%%#*+=:          ", // 18: Coxas colossais
      "          .-=+*#%%@@@@@@@@@@@@%%#*+-.           ", // 19: Joelheiras de escória
      "          :=+*#%%%@@@@@@@@@@@@%%%#*+=:          ", // 20: Canelas
      "          .-=+*#%%@@@@@@@@@@@@%%#*+-.           ", // 21: Grevas maciças
      "         :==+*#%@@@@@@@@@@@@@@@@%#*+==:         ", // 22: Botas de ferro fundido
      "        :===+*#%@@@@@@@@@@@@@@@@%#*+===:        ", // 23: Pés gigantes
      "       .~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~.       ", // 24: Solo em brasa
    ],
    colorResolver: (ch, x, y, isPhase2 = false) => {
      if (ch === ' ') return null;
      // Espada monumental de fogo à direita
      if (x >= 32 && y <= 16) {
        if (ch === 'O' || ch === '[+]') return MATERIALS.GOLD['*'];
        if (ch === '|' || ch === '/' || ch === '\\') return isPhase2 ? '#ffffff' : '#ffcc00';
        return MATERIALS.MAGMA['+'];
      }
      // Fenda dos olhos e brasas do peito
      if ((y === 5 && x >= 17 && x <= 26) || (y === 10 && x >= 15 && x <= 22)) {
        return isPhase2 ? '#ffffff' : '#ff4400';
      }
      // Chifres e coroa
      if (y <= 5 && (x <= 13 || x >= 29)) {
        return MATERIALS.MAGMA['*'];
      }
      return MATERIALS.MAGMA[ch] || '#794338';
    }
  },

  // ────────────────────────────────────────────────────────────
  // 2. LEVIATÃ RASO (O Aqueduto Submerso)
  // Carapaça serpentina, barbelas abissais, mandíbula voraz
  // ────────────────────────────────────────────────────────────
  leviata_raso: {
    width: 40,
    height: 30,
    lines: [
      "                     .----.                     ", // 0: Crista dorsal
      "                   :++****++:                   ", // 1: Barbatana superior
      "                 :*##%%%%%%##*:                 ", // 2: Escamas da cabeça
      "               :+#%@@@@@@@@@@%#+:               ", // 3: Placas cranianas
      "             .-#@@@@(O)@@(O)@@@@#-.             ", // 4: Olhos abissais luminescentes
      "            :=+*#@@@@@@@@@@@@@@#*+=:            ", // 5: Focinho blindado
      "           .-=+**##@@@@@@@@@@##**+=-.           ", // 6: Mandíbula superior
      "         :===+**##/vvvvvvvvvv\\##**+===:         ", // 7: Dentes como estalagmites
      "        :===+**##|            |##**+===:        ", // 8: Garganta cavernosa
      "         :===+**##\\^^^^^^^^^^/##**+===:         ", // 9: Mandíbula inferior
      "          .-=+**##%@@@@@@@@@@%##**+=-.          ", // 10: Queixo couraçado
      "            :=+*#%@@@@@@@@@@@@%#*+=:            ", // 11: Barbelas sensoriais
      "             .-=+*#%%@@@@@@%%#*+-.              ", // 12: Guelras abertas
      "       .~~.   :=+*#%%%@@@@%%%#*+=:   .~~.       ", // 13: Barbatanas laterais
      "     .~~~~.  .-=+*#%%%%%%%%%%#*+-.  .~~~~.      ", // 14: Nadadeiras
      "    .~~~~~~.  :=+*#%@@@@@@@@%#*+=:  .~~~~~~.     ", // 15: Corpo serpentino
      "    .~~~~~~. .-==+*#%@@@@@@%#*+==-. .~~~~~~.     ", // 16: Anéis de escamas
      "     .~~~~. :===+*#%@@@@@@@@%#*+===: .~~~~.      ", // 17: Redemoinho
      "       ..  :====+*#%@@@@@@@@%#*+====:  ..       ", // 18: Cauda no fundo
      "          .~~~~~~~~~~~~~~~~~~~~~~~~~~.          ", // 19: Onda de choque aquática
    ],
    colorResolver: (ch, x, y, isPhase2 = false) => {
      if (ch === ' ') return null;
      if (ch === '~') return isPhase2 ? '#7ec2d4' : '#285866';
      if (ch === 'v' || ch === '^' || ch === '|') return '#ffffff';
      if (ch === 'O') return isPhase2 ? '#ff3344' : '#00ffff'; // Olhos abissais
      return MATERIALS.WATER[ch] || '#376b70';
    }
  },

  // ────────────────────────────────────────────────────────────
  // 3. AMÁLGAMA DE OSSOS (As Catacumbas Ecoantes)
  // Colosso de crânios fundidos, múltiplos braços, foice e costelas
  // ────────────────────────────────────────────────────────────
  amalgama_de_ossos: {
    width: 38,
    height: 32,
    lines: [
      "           (o)     (o)     (o)          ", // 0: Múltiplos crânios no topo
      "          (@@@)   (@@@)   (@@@)         ", // 1: Cabeças fundidas
      "         .=====. .=====. .=====.    /\\  ", // 2: Maxilares + ponta da foice
      "       :++***#%@@@@@@@@@@@%#***++: /  \\ ", // 3: Ombros de espinhas
      "      :*##%%%@@@@@@@@@@@@@@@%%%##*:|||| ", // 4: Clavículas entrelaçadas
      "     :+#%@@@@@@@@@@@@@@@@@@@@@@@%#+|||| ", // 5: Caixa torácica tripla
      "     :==|#@@@#|==|#@@@#|==|#@@@#|==|||| ", // 6: Múltiplas costelas
      "     :==|#@@@#|==|#@@@#|==|#@@@#|==|||| ", // 7: Grade de ossos
      "     :==|#@@@#|==|#@@@#|==|#@@@#|==|||| ", // 8: Coração de trevas
      "      .-|#@@@#|--|#@@@#|--|#@@@#|-.|||| ", // 9: Caixa inferior
      "       .==*#%@@@@@@@@@@@@@@@%#*==. |||| ", // 10: Bacia de ossos gigantes
      "      :++*##%%@@@@@@@@@@@@@%%##*++:[++] ", // 11: Mãos de ossos segurando foice
      "     :*##%%%@@@@@@@@@@@@@@@@@%%%##*: |  ", // 12: Cabo da foice
      "      .-=+*#%%@@@@@@@@@@@@@%%#*+-.   |  ", // 13: Vértebras da coluna
      "       :=+*#%%%@@@@@@@@@@@%%%#*+=:   |  ", // 14: Espinha serpentina
      "       .-=+*#%%@@@@@@@@@@@%%#*+-.       ", // 15: Membros inferiores
      "      :==+*#%@@@@@@@@@@@@@@@%#*+==:     ", // 16: Pernas com dezenas de fêmures
      "     :===+*#%@@@@@@@@@@@@@@@%#*+===:    ", // 17: Pés de falanges
      "     ...............................    ", // 18: Ossada triturada no chão
    ],
    colorResolver: (ch, x, y, isPhase2 = false) => {
      if (ch === ' ') return null;
      if (x >= 32 && y <= 13) {
        if (ch === '/\\' || ch === '/' || ch === '\\') return '#ffffff';
        if (ch === '[+]') return MATERIALS.AGED_IRON['*'];
        return MATERIALS.AGED_IRON['='];
      }
      if (ch === 'o') return isPhase2 ? '#ff0033' : '#a092cb'; // Órbitas oculares
      return MATERIALS.BONE[ch] || '#d4c6a7';
    }
  },

  // ────────────────────────────────────────────────────────────
  // 4. FORJADOR INSANO (A Forja Maculada)
  // Gigante ferreiro com fornalha no peito e martelo colossal
  // ────────────────────────────────────────────────────────────
  forjador_insano: {
    width: 38,
    height: 32,
    lines: [
      "            .--------.     [======]     ", // 0: Elmo cônico + topo do martelo
      "          :++***##***++:   [######]     ", // 1: Cabeça de ferro
      "         :*##%%%%%%%%##*:  [######]     ", // 2: Bloco maciço do martelo
      "        :+#%@@@@@@@@@@%#+: [======]     ", // 3: Base do martelo
      "        :==---======---==:   ||||       ", // 4: Fenda de arame de ferro
      "        .-=+**######**+=-.   ||||       ", // 5: Mandíbula com rebites
      "       :==+*#%%%%%%%%#*+==:  ||||       ", // 6: Pescoço de touro
      "     .---==+*#%%%%%%#*+==---.||||       ", // 7: Ombros gigantescos
      "    :++**##%%@@@@@@@@%%##**++||||       ", // 8: Braço direito de forja
      "   :*##%%%%@@@@@@@@@@@@%%%%##[++]       ", // 9: Empunhadura colossal
      "  :+#%@@@@@@@@@@@@@@@@@@@@@@%#||        ", // 10: Peito com fornalha aberta
      "  :*#@@@@@@/##########\\@@@@@@#||        ", // 11: Grelha da fornalha
      "  :*#@@@@@|############|@@@@@#|         ", // 12: Chamas incandescentes
      "  :*#@@@@@@\\##########/@@@@@@#|         ", // 13: Magma ardente
      "   :=+*#%%%%%%%%%%%%%%%%%%%%#*+=:       ", // 14: Avental de ferro
      "   .-=+*#%%%%%%%%%%%%%%%%%%#*+-.        ", // 15: Cinto de ferramentas
      "    :=+*#%%@@@@@@@@@@@@@@%%#*+=:        ", // 16: Coxas como troncos
      "    .-=+*#%%@@@@@@@@@@@@%%#*+-.         ", // 17: Joelheiras de bigorna
      "   :==+*#%@@@@@@@@@@@@@@@@%#*+==:       ", // 18: Botas pesadas
      "  :===+*#%@@@@@@@@@@@@@@@@%#*+===:      ", // 19: Pegadas de brasa
      "   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~       ", // 20: Chão incandescente
    ],
    colorResolver: (ch, x, y, isPhase2 = false) => {
      if (ch === ' ') return null;
      // Martelo de forja colossal à direita
      if (x >= 26 && y <= 13) {
        if (ch === '[' || ch === ']' || ch === '=') return MATERIALS.GOLD['*'];
        if (ch === '#') return MATERIALS.AGED_IRON['#'];
        if (ch === '[+]') return MATERIALS.GOLD['+'];
        return MATERIALS.AGED_IRON['='];
      }
      // Fornalha incandescente no peito
      if (y >= 11 && y <= 13 && x >= 10 && x <= 24) {
        return isPhase2 ? '#ffffff' : '#f2c56d';
      }
      return MATERIALS.MAGMA[ch] || '#af5d3b';
    }
  },

  // ────────────────────────────────────────────────────────────
  // 5. FLOR CADAVÉRICA (O Jardim Pútrido)
  // Pétalas carnívoras, gavinhas venenosas e estames com esporos
  // ────────────────────────────────────────────────────────────
  flor_cadaverica: {
    width: 36,
    height: 30,
    lines: [
      "          \\/              \\/            ", // 0: Pontas das pétalas superiores
      "         (##)            (##)           ", // 1: Mandíbulas florais
      "        /####\\          /####\\          ", // 2: Lâminas das pétalas
      "       /######\\ .----. /######\\         ", // 3: Centro da flor
      "      |########|:++**+:|########|       ", // 4: Corola aberta
      "       \\######/:*#@@#*:\\######/         ", // 5: Estames com esporos
      "    --. \\####/:+#@@@@%#:\\####/ .--      ", // 6: Garganta ácida
      "   (###) \\##/ :==----==: \\##/ (###)     ", // 7: Fenda gotejante
      "    \\##\\  \\/  .-=+**+=-.  \\/  /##/      ", // 8: Pétalas laterais
      "     \\##\\     :==+##+==:     /##/       ", // 9: Gavinhas espinhadas
      "      \\##\\  .-=+*#%%#*+-.  /##/         ", // 10: Tronco bulboso
      "       \\##\\:=+*#%@@@@%#*+=:/##/          ", // 11: Raízes aéreas
      "        \\#.-=+*#%@@@@%#*+-.#/           ", // 12: Raiz carnosa
      "          :=+*#%%%@@%%%#*+=:            ", // 13: Bulbo principal
      "          .-=+*#%%%%%%#*+-.             ", // 14: Base com lodo
      "        :==+*#%@@@@@@@@%#*+==:          ", // 15: Raízes rastejantes
      "       :===+*#%@@@@@@@@%#*+===:         ", // 16: Solo contaminado
      "       ~~~~~~~~~~~~~~~~~~~~~~~~         ", // 17: Pútrido
    ],
    colorResolver: (ch, x, y, isPhase2 = false) => {
      if (ch === ' ') return null;
      // Estames e garganta com esporos brilhantes
      if (y >= 4 && y <= 7 && x >= 14 && x <= 22) {
        return isPhase2 ? '#ff00ff' : '#a5b96f';
      }
      if (ch === '~') return '#526c46';
      return MATERIALS.ROT[ch] || '#789655';
    }
  },

  // ────────────────────────────────────────────────────────────
  // 6. REI DOS MENDIGOS (A Cidade Subterrânea)
  // Coroa de sucata, manto monumental de trapos nobres, rapieiras gêmeas
  // ────────────────────────────────────────────────────────────
  rei_dos_mendigos: {
    width: 34,
    height: 30,
    lines: [
      "          \\  /\\  /\\  /                  ", // 0: Coroa denteada de sucata
      "           \\/  \\/  \\/                   ", // 1: Base da coroa
      "          :++***##***+:                 ", // 2: Cabelos sujos e rosto
      "         :*##%%%%%%%##*:          .     ", // 3: Olhar astuto + rapieira
      "        :+#%@@@@@@@@@%#+:        /|\\    ", // 4: Bigode e queixo fino
      "        :===--=====--===:        |||    ", // 5: Fenda do sorriso cruel
      "        .-=+*#######*+=-.        |||    ", // 6: Gola de pele puída
      "       :==+*#%%%%%%%%#*+==:      |||    ", // 7: Ombreiras de veludo rasgado
      "     .---==+*#%%%%%%#*+==---.    |||    ", // 8: Manto real esfarrapado
      "    :++**##%%@@@@@@@@%%##**++:   |||    ", // 9: Braço com punho rendado
      "   :*##%%%%@@@@@@@@@@@@%%%%##*:  [+]    ", // 10: Guarda de laço da rapieira
      "  :+#%@@@@@@@@@@@@@@@@@@@@@@%#+   O     ", // 11: Pomo de ouro falso
      "  :*#@@@@@@@@@@@@@@@@@@@@@@@@#*         ", // 12: Pregas do manto
      "   :=+*#%%%%%%%%%%%%%%%%%%%%#*+=:       ", // 13: Cinturão com bolsas
      "   .-=+*#%%%%%%%%%%%%%%%%%%#*+-.        ", // 14: Dobras rasgadas
      "    :=+*#%%@@@@@@@@@@@@@@%%#*+=:        ", // 15: Calças nobres desbotadas
      "    .-=+*#%%@@@@@@@@@@@@%%#*+-.         ", // 16: Joelhos ágeis
      "   :==+*#%@@@@@@@@@@@@@@@@%#*+==:       ", // 17: Botas de duelista
      "  :===+*#%@@@@@@@@@@@@@@@@%#*+===:      ", // 18: Postura elegante de esgrima
      "   ..............................       ", // 19: Pedras da cidade
    ],
    colorResolver: (ch, x, y, isPhase2 = false) => {
      if (ch === ' ') return null;
      // Coroa de sucata dourada
      if (y <= 1 && x >= 9 && x <= 25) return '#f2c56d';
      // Rapieira rápida à direita
      if (x >= 28 && y <= 11) {
        if (ch === 'O' || ch === '[+]') return MATERIALS.GOLD['*'];
        if (ch === '|' || ch === '/' || ch === '\\') return '#ffffff';
        return MATERIALS.STEEL['='];
      }
      return MATERIALS.CRIMSON_CLOTH[ch] || '#48566d';
    }
  },

  // ────────────────────────────────────────────────────────────
  // 7. CRISTAL MATRIZ (O Abismo Cristalino)
  // Estrutura geométrica prismática flutuante com anéis orbitais
  // ────────────────────────────────────────────────────────────
  cristal_matriz: {
    width: 36,
    height: 30,
    lines: [
      "                 /\\                     ", // 0: Pináculo do prisma central
      "                /  \\                    ", // 1: Faceta superior
      "              ./ /\\ \\.                  ", // 2: Arestas refrativas
      "             / /    \\ \\                 ", // 3: Cristais orbitais menores
      "           ./ /  /\\  \\ \\.               ", // 4: Núcleo geométrico
      "          / /  ./  \\.  \\ \\              ", // 5: Refração de luz
      "         / /  / /\\  \\   \\ \\   ◇        ", // 6: Shards flutuantes
      "        / /  / /  \\  \\   \\ \\            ", // 7: Densidade cristalina
      "   ◇   / /  / /    \\  \\   \\ \\           ", // 8: Especularidade
      "      | |  | | (@@) | |    | |          ", // 9: Coração do cristal
      "      | |  | | (@@) | |    | |   ◇      ", // 10: Pulso de mana
      "   ◇   \\ \\  \\ \\    /  /   / /           ", // 11: Arestas inferiores
      "        \\ \\  \\ \\  /  /   / /            ", // 12: Simetria perfeita
      "         \\ \\  \\ \\/  /   / /             ", // 13: Prisma inferior
      "          \\ \\  '\\  /'  / /      ◇       ", // 14: Ponta convergente
      "           '\\ \\  \\/  / /'               ", // 15: Raio de convergência
      "             '\\ \\  / /'                 ", // 16: Facetas da base
      "               '\\  /'                   ", // 17: Vértice inferior
      "                 \\/                     ", // 18: Foco de luz pura
    ],
    colorResolver: (ch, x, y, isPhase2 = false) => {
      if (ch === ' ') return null;
      if (ch === '◇') return isPhase2 ? '#ff00aa' : '#b8eeff';
      if (ch === '@' || ch === '(' || ch === ')') return isPhase2 ? '#ffffff' : '#456a8d';
      return MATERIALS.CRYSTAL[ch] || '#6eadb7';
    }
  },

  // ────────────────────────────────────────────────────────────
  // 8. VAMPIRO PRIMORDIAL (O Cárcere de Sangue)
  // Nobre vampírico com asas de morcego laminadas e cálice de sangue
  // ────────────────────────────────────────────────────────────
  vampiro_primordial: {
    width: 38,
    height: 32,
    lines: [
      "  /\\                                /\\  ", // 0: Pontas das asas de morcego
      " /  \\                              /  \\ ", // 1: Falanges da asa
      "/ /\\ \\           .---.            / /\\ \\", // 2: Cabelos prateados e rosto
      "| | | |        :++***#+:         | | | |", // 3: Asas abertas
      " \\ \\ \\ \\      :*##%%%%##*:      / / / / ", // 4: Olhos vermelhos hipnóticos
      "  \\ \\ \\ \\    :+#%@@@@@@%#+:    / / / /  ", // 5: Presas afiadas
      "   \\ \\ \\ \\   :==--====--==:   / / / /   ", // 6: Gola alta aristocrática
      "    \\ \\ \\ \\  .-=+*####*+=-.  / / / /    ", // 7: Plastrom de rubi
      "     \\ \\ \\ \\:==+*#%%%%#*+==:/ / / /     ", // 8: Ombros finos
      "      \\ \\ \\ \\--==+*##*+==---/ / / /      ", // 9: Braços com garras
      "       \\ \\ :++**##%@@%##**++: / /       ", // 10: Peitoral gótico
      "        \\ :*##%%%%%@@%%%%%##*: /        ", // 11: Manto que sangra
      "          :+#%@@@@@@@@@@@@%#+:          ", // 12: Tecido ondulante
      "          :*#@@@@@@@@@@@@@@#*           ", // 13: Cintura de seda negra
      "          :=+*#%%%%%%%%%%#*+=:          ", // 14: Pregas carmesins
      "          .-=+*#%%%%%%%%#*+-.           ", // 15: Barra do casaco
      "           :=+*#%@@@@@@%#*+=:           ", // 16: Pernas esguias
      "           .-=+*#%@@@@%#*+-.            ", // 17: Botas de montaria de couro
      "          :==+*#%@@@@@@%#*+==:          ", // 18: Esporas de prata
      "         ~~~~~~~~~~~~~~~~~~~~~~         ", // 19: Poça de sangue fervilhante
    ],
    colorResolver: (ch, x, y, isPhase2 = false) => {
      if (ch === ' ') return null;
      if (ch === '~') return isPhase2 ? '#ff0033' : '#713540';
      // Olhos de vampiro
      if (y === 4 && (x === 17 || x === 20)) return '#ff0000';
      return MATERIALS.BLOOD[ch] || '#9c4c52';
    }
  },

  // ────────────────────────────────────────────────────────────
  // 9. BIBLIOTECÁRIO SOMBRIO (A Biblioteca do Oculto)
  // Figura encapuzada colossal com tomos e grimórios orbitais
  // ────────────────────────────────────────────────────────────
  bibliotecario_sombrio: {
    width: 38,
    height: 32,
    lines: [
      "          [===]          [===]          ", // 0: Livros flutuando no alto
      "          |...|          |...|          ", // 1: Páginas folheadas
      "          [===]  .---.   [===]          ", // 2: Tomos arcanos
      "               :++***#+:                ", // 3: Capuz profundo
      "              :*##%%%%##*:       [===]  ", // 4: Rosto sem traços
      "  [===]      :+#%@@@@@@%#+:      |...|  ", // 5: Olhar vazio cósmico
      "  |...|      :==--====--==:      [===]  ", // 6: Fendas rúnicas
      "  [===]      .-=+*####*+=-.             ", // 7: Gola de páginas antigas
      "            :==+*#%%%%%%#*+==:          ", // 8: Ombros de pergaminho
      "       .---==+*#%@@@@@@@@%#*+==---.     ", // 9: Braços longos esqueléticos
      "      :++**##%%@@@@@@@@@@@@%%##**++:    ", // 10: Túnica cerimonial
      "     :*##%%%%@@@@@@@@@@@@@@@@%%%%##*:   ", // 11: Letras gravadas na carne
      "    :+#%@@@@@@@@@@@@@@@@@@@@@@@@@@%#+:  ", // 12: Runas que brilham
      "    :*#@@@@@@@@@@@@@@@@@@@@@@@@@@@@#*:  ", // 13: Cintura de tomos presos
      "    :+#%@@@@@@@@@@@@@@@@@@@@@@@@@@%#+:  ", // 14: Correntes de livros
      "     :=+*#%%%%%%%%%%%%%%%%%%%%%%#*+=:   ", // 15: Barra das vestes
      "     .-=+*#%%%%%%%%%%%%%%%%%%%%#*+-.    ", // 16: Poeira estelar
      "      :=+*#%%@@@@@@@@@@@@@@@@%%#*+=:    ", // 17: Ectoplasma
      "     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~   ", // 18: Vórtice de runas no chão
    ],
    colorResolver: (ch, x, y, isPhase2 = false) => {
      if (ch === ' ') return null;
      // Livros orbitais
      if (ch === '[' || ch === ']' || ch === '=' || (ch === '.' && y <= 6)) {
        return isPhase2 ? '#ffcc00' : '#729da9';
      }
      return MATERIALS.MAGIC[ch] || '#796395';
    }
  },

  // ────────────────────────────────────────────────────────────
  // 10. ENTIDADE FINAL (O Coração do Abismo)
  // Horror cósmico supremo: olho da fenda, espirais, anéis gravitacionais
  // ────────────────────────────────────────────────────────────
  entidade_final: {
    width: 42,
    height: 36,
    lines: [
      "                 .------------.                 ", // 0: Singularidade cósmica
      "             .--=++**######**++=--.             ", // 1: Anel gravitacional externo
      "          .-==+*##%%@@@@@@@@%%##*+==--.         ", // 2: Horizonte de eventos
      "        .-=+*##%%@@@@@@@@@@@@@@%%##*+=-.        ", // 3: Fenda dimensional
      "       :==+*#%@@@@@@@@@@@@@@@@@@@@%#*+==:       ", // 4: Distorção de espaço
      "     .-=+*#%@@@@@@@@@@@@@@@@@@@@@@@@%#*+-.      ", // 5: Tecido do abismo
      "    :==+*#%@@@@@@@@@@@@@@@@@@@@@@@@@@%#*+==:    ", // 6: Borda do olho divino
      "   .-=+*#%@@@@@@@@(OOOOOOOO)@@@@@@@@@@%#*+-.    ", // 7: Esclera estelar
      "   :=+*#%@@@@@@@@(OO@@@@@@OO)@@@@@@@@@@%#*+=:   ", // 8: Íris cósmica pulsante
      "  .-=+*#%%@@@@@@(OO@@#%%@@OO)@@@@@@@@%%#*+-.   ", // 9: Pupila da não-existência
      "  :=+*#%%%@@@@@@(OO@@#%%@@OO)@@@@@@@%%%#*+=:   ", // 10: Vazio absoluto central
      "  :=+*#%%%%@@@@@(OO@@@@@@OO)@@@@@@%%%%#*+=:   ", // 11: Anel de eclipse
      "   :=+*#%%%%%%%%@(OOOOOOOO)%%%%%%%%%%#*+=:    ", // 12: Borda inferior
      "   .-=+*#%%%%%%%%%%%%%%%%%%%%%%%%%%#*+-.      ", // 13: Gavínhas gravitacionais
      "    :==+*#%@@@@@@@@@@@@@@@@@@@@@@%#*+==:       ", // 14: Espirais de matéria
      "     .-=+*#%@@@@@@@@@@@@@@@@@@@@%#*+-.        ", // 15: Buraco negro
      "       :==+*#%@@@@@@@@@@@@@@@@%#*+==:          ", // 16: Radiação de Hawking
      "        .-=+*##%%@@@@@@@@@@%%##*+=-.           ", // 17: Retorcimento
      "          .-==+*##%%%%%%%%##*+==-'.             ", // 18: Fechamento do vórtice
      "             '--=++******++=--'                 ", // 19: Ponto zero
      "                 '--------'                     ", // 20: Singularidade
    ],
    colorResolver: (ch, x, y, isPhase2 = false) => {
      if (ch === ' ') return null;
      // Pupila do olho cósmico
      if (ch === 'O') return isPhase2 ? '#ffffff' : '#00ffff';
      if (y >= 9 && y <= 10 && x >= 19 && x <= 24) return '#000000'; // Vazio absoluto
      return MATERIALS.VOID[ch] || '#6555a4';
    }
  },
};
