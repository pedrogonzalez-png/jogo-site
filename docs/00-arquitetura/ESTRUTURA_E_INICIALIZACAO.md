# Estrutura e inicialização — Abismo

> Extraído de `docs/ESTRUTURA_DO_PROJETO.md` (versão documentada em 2026-10-09). Descrição histórica, não significa validação do código atual.
> [Índice da arquitetura](../ESTRUTURA_DO_PROJETO.md) · [Índice geral](../README.md)

## A. Visão Geral

O Abismo é um jogo de ação e exploração top-down "souls-like" com foco em mecânicas intensas de combate e geração procedural do mundo. Desenvolvido com HTML, JavaScript (ES6+ Modules) e a engine Phaser 4.2.1. O jogo não depende de assets gráficos ou spritesheets externos, gerando todo o seu conteúdo visual programaticamente na fase de boot. Toda execução é governada por um sistema de "seeds" que garante 100% de reprodutibilidade para qualquer área gerada.

---

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

---

## C. Inicialização e Fluxo de Execução

1. **`main.js`**: Inicia o construtor do `Phaser.Game`, estipula largura/altura (1280x720) sem gravidade fixa e registra as 3 Cenas.
2. **`BootScene.js`**: Desenha via `Phaser.GameObjects.Graphics` todos os sprites do jogo na memória (Geração Programática) e transita para o menu.
3. **`MainMenuScene.js`**: Interface de criação de saves e definições de _Seed_ de mundo. 
4. **`GameScene.js`**: Orquestradora mestre. Resgata informações de saves/áreas, recria as instâncias do Jogador e dos subsistemas e instiga os geradores mundiais.
