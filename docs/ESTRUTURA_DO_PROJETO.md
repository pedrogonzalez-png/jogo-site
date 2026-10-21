# Estrutura do Projeto Abismo

> **Data**: 2026-10-09

## A. Visão Geral

O Abismo é um jogo de ação e exploração top-down "souls-like" com foco em mecânicas intensas de combate e geração procedural do mundo. Desenvolvido com HTML, JavaScript (ES6+ Modules) e a engine Phaser 4.2.1. O jogo não depende de assets gráficos ou spritesheets externos, gerando todo o seu conteúdo visual programaticamente na fase de boot. Toda execução é governada por um sistema de "seeds" que garante 100% de reprodutibilidade para qualquer área gerada.

## B. Árvore de Diretórios e Responsabilidades

```
jogo-site/
├── index.html                   # Ponto de entrada
├── package.json                 # Dependências e scripts de build
├── vite.config.js               # Configuração do Vite (bundler)
└── src/
    ├── main.js                  # Ponto de inicialização do Phaser
    ├── scenes/
    │   ├── BootScene.js         # Gera todas as texturas programaticamente
    │   ├── MainMenuScene.js     # Menus, interface inicial e load de save
    │   └── GameScene.js         # Loop principal, orquestração de sistemas e instâncias
    ├── world/
    │   ├── SeedSystem.js        # Geração de números pseudo-aleatórios (Mulberry32)
    │   ├── WorldGenerator.js    # Estrutura macro (grafo e navegação de salas)
    │   ├── RoomGenerator.js     # Estrutura micro (tiles e geração via padrões de biomas)
    │   └── EnvironmentalHazards.js # Lógica de perigos ambientais dos biomas (lava, espinhos, etc.)
    ├── entities/
    │   ├── Player.js            # Movimentação, esquiva, máquina de estado do jogador
    │   ├── Enemy.js             # IA básica de patrulha e ataque (Chase, Fast, Guardian)
    │   └── Boss.js              # Chefe do bioma, IA com fases múltiplas e padrões de ataques
    ├── combat/
    │   ├── CombatSystem.js      # Integração de status de ataque, esquiva, parry
    │   ├── DamageSystem.js      # Cálculos de dano baseados em ataque, defesa e crítico
    │   ├── StaminaSystem.js     # Regulação de energia
    │   ├── BalanceSystem.js     # Regulação de postura (poise) e stagger (atordoamento)
    │   └── StatusEffectSystem.js# Gerenciamento de elementos e DoT (veneno, fogo, lentidão)
    ├── equipment/
    │   ├── WeaponSystem.js      # Lida com categorias de armas (Espada, Machado, Lança, etc.)
    │   ├── ArmorSystem.js       # Gerencia as peças de armadura
    │   ├── InventorySystem.js   # Slots e lógica de transporte de itens
    │   └── LootSystem.js        # Distribuição matemática de drop tables
    ├── progression/
    │   ├── XPSystem.js          # Experiência e morte estilo "Souls-like" (orbes de morte)
    │   ├── LevelSystem.js       # Regras e custos de Level Up
    │   ├── StatSystem.js        # Cálculos de limites progressivos (Soft-Caps)
    │   └── AbyssChallengeSystem.js # Mecânicas de dificuldade progressiva
    ├── save/
    │   └── SaveSystem.js        # Serialização de dados e gravação IndexedDB local
    ├── data/
    │   ├── balance.js           # Constantes (Tamanhos, velocidade, atributos base)
    │   ├── biomes.js            # Definição e paletas dos 10 biomas do jogo
    │   ├── enemies.js           # Templates base e balanceamento das entidades
    │   ├── weapons.js           # Configurações de armas
    │   ├── armor.js             # Configurações de armaduras
    │   └── items.js             # Configurações de consumíveis
    └── ui/
        ├── HUD.js               # Exibição de HP, Stamina, alertas e elementos in-game
        ├── InventoryUI.js       # Menus iterativos do inventário
        └── BossBar.js           # Health bar especial de chefões
```

## C. Inicialização e Fluxo de Execução

1. **`main.js`**: Inicia o construtor do `Phaser.Game`, estipula largura/altura (1280x720) sem gravidade fixa e registra as 3 Cenas.
2. **`BootScene.js`**: Desenha via `Phaser.GameObjects.Graphics` todos os sprites do jogo na memória (Geração Programática) e transita para o menu.
3. **`MainMenuScene.js`**: Interface de criação de saves e definições de _Seed_ de mundo. 
4. **`GameScene.js`**: Orquestradora mestre. Resgata informações de saves/áreas, recria as instâncias do Jogador e dos subsistemas e instiga os geradores mundiais.

## D. Arquitetura do Mundo

* **SeedSystem**: RNG estrito (mulberry32). A função `fork()` isola RNGs por área/sala para garantir que o abate de um monstro numa sala, por exemplo, não altere o layout da próxima.
* **WorldGenerator**: Gera áreas definindo a navegação do player. Cria uma ramificação principal (Espinha dorsal: Entrance -> Normal -> Sanctuary -> Boss) e enxertos (ramificações opcionais e arenas de baú).
* **RoomGenerator**: Transforma a topologia em grids de tiles (40x22). Aplica diferentes perfis estruturais de acordo com o Bioma atual, variando densidade de colunas, formatos de corredores e espalhando elementos com base em `TILE_TYPES`. 
* **Transições e Progresso**: Ao chegar nas bordas de limite de porta de sala, `GameScene` dispara `_transitionToRoom()` rodando efeito visual, apagando instâncias físicas velhas, construindo a sala do destino e reiniciando o loop na nova. O avanço de áreas (`_advanceToNextArea()`) limpa e injeta o loop completo no `WorldGenerator` com `areaIndex` somado.

## E. Sistemas de Jogo

O **Combate** interliga `DamageSystem`, `BalanceSystem` e `StaminaSystem`. Defender gasta _stamina_. O ataque possui pesos para gasto de stamina e para dano de _poise_ (equilíbrio) na vítima. Bater e receber ataques consome instâncias via `CombatSystem`. Efeitos contínuos ou temporários usam o `StatusEffectSystem`.
O **Equipamento** impacta atributos passivos pelo `WeaponSystem` e `ArmorSystem`, controlados pelo `InventorySystem` e salvos periodicamente pelo `SaveSystem` via serialização IndexedDB. Em mortes, todo XP atual é dropado (`XPSystem`), devendo ser coletado. Uma segunda morte destrói os vestígios permanentemente.

## F. Os Dez Biomas

O Abismo roda ciclicamente através de 10 domínios, cada um definindo uma experiência ambiental via paletas de cor, configuração e mecânicas próprias:

1. **Vale das Cinzas** (ARREDORES_CINZENTOS): Desacelera a movimentação do player nos poços de cinza.
2. **Floresta Velada** (JARDIM_PUTRIDO): Nuvens tóxicas brotam das plantas agredidas. 
3. **Pântano Afogado** (AQUEDUTO_SUBMERSO): Fluxos aquáticos que empurram entidades.
4. **Deserto Rubro** (FORJA_MACULADA): Erupções térmicas intermitentes avisam o dano em área.
5. **Minas de Ferro Negro** (CATACUMBAS_ECOANTES): Chão que racha após interações, atraindo atenção inimiga para investigações ao ceder.
6. **Montanhas do Trovão** (ABISMO_CRISTALINO): Instalações de cristal que rebatem disparos arcanos e habilidades de forma angular. 
7. **Cidade Submersa** (CIDADE_SUBTERRANEA): Bloqueios que exigem proximidade para ascender lanternas, iluminando o caminho de passagens bloqueadas.
8. **Catedral Partida** (BIBLIOTECA_DO_OCULTO): Portas falsas visuais com pistas imperceptíveis. Elas atuam ocasionalmente com um teleportador ilusório de labirinto para a sala não pretendida.
9. **Forja Escarlate** (CARCERE_DE_SANGUE): Círculos sanguíneos que sugam vida/stamina de jogadores enquanto curam hostis.
10. **Abismo Sem Fundo** (CORACAO_DO_ABISMO): Anomalias gravitacionais que deturpam a movimentação no seu eixo e distâncias de esquivas, sugando lentamante ou estendendo manobras de impulso.

**Nota técnica:** Estas mecânicas foram projetadas no `EnvironmentalHazards.js`. O ambiente varia o padrão estético (desenho do corredor) no `RoomGenerator.js`. Falta implementar pools diferentes de inimigos por bioma.

## G. Como executar e testar

1. **Instalar dependências**: `npm install` (via Node.js).
2. **Executar em dev**: `npm run dev` para iniciar o Vite e rodar em ambiente local na porta exposta.
3. **Build para produção**: `npm run build` cria a pasta `dist` gerando os bundles (o minificador pode acusar warns de chunking alto devido ao Phaser incorporado no source).

## H. Guia para Futuros Agentes

- **Integração Visual vs Mecânica:** Texturas (`BootScene.js`) são cinzas (ou deveriam ser) que recebem aplicação de "tint" (tintura) provenientes do `biomes.js`. Qualquer nova estrutura visual precisa se beneficiar da geração via Graphics na `BootScene`. Não anexe imagens, respeite a renderização procedural programática!
- **Mecânicas Ambientais:** Alterações físicas no mundo (espinhos, correntes) **NÃO USAM COLISÕES NO SISTEMA DE ARCADES** devido ao design das salas. Para evitar conflito e bloqueio físico incorreto nos obstáculos e paredes, todo _hazard_ de mecânica ambiental (`EnvironmentalHazards.js`) aplica o efeito por _distância matemática (Phaser.Math.Distance)_ durante os _ticks_ do método _update()_.
- **RoomGenerator**: A conectividade da sala é garantida por _Flood Fill_. Sempre utilize `_isReserved()` para impedir a geração de colunas nos eixos de conexão das portas (Norte, Sul, Leste e Oeste) e garanta que sua modificação arquitetural contemple essa liberação (já garantida no `_carveHallways()`).

## I. Limitações e Pendências

- **Sistema de Inimigos Clônico:** Atualmente, todos os 10 Biomas fazem spawn dos mesmos "Ash Walkers" e do "Ashen Lord" boss (`GameScene`). Não há pools instanciados para abrigar um leque único inimigo/boss por bioma.
- **BootScene**: Em revisões anteriores foi relatado problemas de coloração no sistema "Tint", sendo aconselhável gerar texturas com escala total de cinza.
- **Audios Inexistentes:** Embora haja metadados de configuração no `biomes.js`, os sons (SFX) não têm integração existente.
