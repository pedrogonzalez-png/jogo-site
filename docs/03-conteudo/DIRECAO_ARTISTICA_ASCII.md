# Direção artística ASCII de alta densidade — Abismo

> **Decisão de design discutida:** usar a arte do cavaleiro fornecida como referência do **nível de acabamento de TODO o jogo**, não limitar a ASCII à silhueta do protagonista. **Estado técnico:** a branch principal já possui módulos ASCII. Esta especificação orienta inspeção, melhorias e QA; não comprova que toda a arte já satisfaça a referência.
> [GDD consolidado](../01-projeto/VISAO_CANONICA_E_GDD.md) · [Tarefas de arte](../04-gestao/tarefas/01-ARTE_ASCII.md)

## ART-01 — Conceito obrigatório

Arte ASCII **figurativa e sombreada**, construída por múltiplas dezenas/centenas de caracteres, volumes, anatomia, materiais, contraste e iluminação. O exemplo do cavaleiro é uma **referência visual**, não uma regra de copiar o mesmo desenho para tudo.

O objetivo visual NÃO é um roguelike minimalista com jogador @, parede # e água ~.

### Hierarquia de leitura

1. **Silhueta**: personagem, rocha, porta ou líquido reconhecível ao tamanho real do gameplay.
2. **Anatomia e estrutura**: braços, punhos, mãos, dedos sugeridos, espada sustentada pela mão; nos cenários, blocos, juntas, colunas e rachaduras.
3. **Volume**: áreas mais densas e mais leves simulam luz e sombra.
4. **Material**: aço, tecido, osso, pedra, madeira, água, vidro/cristal, fogo, sangue e vegetação precisam ter personalidade distinta.
5. **Acabamento**: reflexos, desgaste, relevos, camadas e ornamentos sem gerar ruído ilegível.

### Densidade e glifos

Combinações como **@ % # * + = - : .**, espaços e caracteres adicionais podem criar gradação de luminosidade; nenhuma dessas sequências isolada substitui um desenho. Testar **fontes monoespaçadas**, aspecto de célula e fallback. Preservar espaços significativos e alinhamento de linhas.

Paletas podem ajudar no contraste, mas **não mascarar falta de estrutura**: uma parede plana colorida ainda é uma parede plana.

## ART-02 — Protagonista: anatomia e estados

**Referências atuais do repositório:**
- **src/ascii/KnightArt.js**: quadros e dados do cavaleiro, inclusive referência codificada em alta resolução.
- **src/ascii/knight_reference_rle.js**: referência compactada vinculada ao módulo.
- **src/ascii/TextureBootManager.js**: registro de texturas/quadros no Phaser.
- **src/entities/Player.js**: estado do gameplay, aplicação de textura, escalas e corpo físico.
- **src/ascii/AsciiRenderer.js**: conversão de glifos para textura.

### Anatomia mínima legível

Elmo/cabeça; visor; ombreiras; tronco/couraça; cintura; braços; cotovelos; mãos/manoplas; espada com cabo, guarda, lâmina e mão que realmente a segura; pernas; joelhos; botas; manto. Nenhum membro deve simplesmente desaparecer por falta de resolução.

### Estados e transições esperados

| Estado | Arte visual esperada | Restrição |
|---|---|---|
| Idle 0/1... | Respiração, peso apoiado, detalhes estáveis | Não tremer a grade inteira |
| Walk 0/1... | Alternância real de pernas, braços e tecido | Não fingir movimento repetindo o mesmo frame |
| Sprint | Passada/recuo condizente com velocidade | Só criar se estado de gameplay exigir |
| Light/heavy attack | Corpo e arma com arco coerente | Hitbox e timing continuam governados pelo combate |
| Dodge | Centro de massa e orientação legíveis | I-frames não são duração da arte |
| Block | Braços/escudo/arma em postura defensiva | Não alterar tamanho do body |
| Parry | Movimento distinto e breve | Janela lógica continua 200 ms |
| Hurt/stagger | Reação reconhecível | Tempo de incapacidade definido por gameplay |
| Death | Silhueta e queda/efeito | Não apagar orbe, corpos ou save |

**Constatação de leitura de código em 2026-10-21:** KnightArt.js possui quadros idle_0/idle_1, walk_0/walk_1, attack_0 e block. **walk_1 reutiliza a mesma matriz da caminhada de walk_0**, conforme comentário no arquivo: a animação precisa ser avaliada para evitar falsa alternância. Os quadros idle/walk estão descritos como grade **200×100**, enquanto attack_0 e block usam grades menores. O Player define **PLAYER_VISUAL_BOUNDS 80×80** e hitbox própria. Isso exige QA de escala, artefatos, achatamento e transição entre texturas — não é autorização para alterar a física.

**Regra de escopo em edição restrita:** caso o usuário forneça apenas um arquivo e exija alteração só nele, não toque em consumidores externos; documente dependências que impedirem a animação completa.

## ART-03 — Inimigos e dez chefes

Não desenhar “inimigo genérico” repetido com recoloração. Cada arquétipo deve ter anatomia e material:

- Humanoides: cabeça, equipamento, juntas, mãos e arma.
- Esqueletos: crânio, costelas, ossos, articulações, armamento.
- Bestas: patas, pescoço, focinho/mandíbulas, direção do movimento.
- Magos: vestes, braços, foco ou tomo, efeitos e postura.
- Guardiões/construtos: placas, fendas, mecanismos, escala.
- Aberrações: silhueta orgânica proposital, com leitura de ataque.

Chefes têm texturas próprias de fase, escala superior e identidade de bioma. **src/ascii/EnemyArt.js**, **BossArt.js** e **TextureBootManager.js** já existem; antes de cadastrar texturas novas, verificar os nomes registrados e como Enemy/Boss selecionam texturas no gameplay.

Critério de aceite: identificar a categoria e a direção do ataque no tamanho do jogo sem depender do nome mostrado no HUD.

## ART-04 — Água, sangue, magma e partículas

### Água

Camadas visuais: superfície, profundidade, reflexos, espuma, correntes, ondulações, borda molhada, transição para margens; quadros conectados de modo que o movimento pareça fluxo e não ruído aleatório. A arte não precisa ser fisicamente volumétrica: deve **sugerir** volume por glifos e iluminação.

**src/ascii/LiquidsAndVFXArt.js** contém quatro quadros de água e variações de outros líquidos; medir animação e conexão ao tilemap, não presumir que todas estejam em uso.

### Sangue/magma/veneno/cristal

- Sangue: viscosidade, brilho úmido, manchas na margem e fluxo lento.
- Magma: centro incandescente, crosta resfriada, bolhas, transições térmicas.
- Veneno: nuvem, esporos e superfície contaminada; clareza de área perigosa.
- Cristais: facetas, interseções, reflexos especulares, arestas.

Efeitos de combate devem conservar transparência e hierarquia de profundidade para não esconder golpes ou telegraphs.

## ART-05 — Paredes, piso, blocos e objetos

- **Blocos de pedra:** tamanhos variados, juntas, sombreamento em bordas e rachaduras.
- **Piso:** textura irregular com variações sem mosaico repetitivo agressivo.
- **Pilares, altares, santuários:** volume vertical, arquitetura específica por bioma.
- **Portas/pontes/grades:** silhueta coerente e direção da interação.
- **Baús e recursos:** estados aberto/fechado sem variação indevida de posição.
- **Vegetação, raízes, ossadas, estantes e cristais:** leitura de material e colisão adequada.

**Problema típico:** desenhar um tile independente belíssimo que apresenta uma emenda visível quando dois módulos se encontram. Testar mosaicos de 3×3 e 5×5, rotações e transições parede-chão/água-terra.

## ART-06 — Paletas e dez biomas

Cada bioma precisa de seu conjunto de caracteres, materiais, padrões e efeitos. Não basta trocar a tint da mesma parede. [Guia por bioma](../02-mundo/GUIA_DE_BIOMAS.md) descreve o vocabulário visual e o hazard associado.

## ART-07 — Pipeline de renderização

**Fluxo existente inspecionado:** KnightArt/EnemyArt/BossArt/EnvironmentArt/LiquidsAndVFXArt → AsciiRenderer → TextureBootManager → BootScene → texturas registradas → GameScene/entidades.

Boas práticas obrigatórias:
1. **Fonte de verdade dos desenhos** em módulo de arte, não em strings enormes espalhadas pela cena.
2. **Separação glifo/cor/render**: dados reusáveis, paletas por material e backend de desenho independente.
3. **Pré-renderizar** frames estáticos e variantes finitas. Não gerar glifos de alta densidade a cada update/frame sem justificativa e benchmark.
4. **Memória:** considerar dimensões reais das texturas, mipmap/filtragem e WebGL/canvas fallback.
5. **Fonte:** monoespaçada, largura da célula consistente, proporcionalidade horizontal/vertical calculada e nítida.
6. **Transparência:** cor do fundo e célula transparente não podem criar retângulos pretos fora do estilo planejado.
7. **Compatibilidade:** preservar chaves existentes (player, player_idle_0, tile_wall etc.) e nomes de animação, caso o consumidor dependa delas.
8. **Física isolada:** visual grande sobre corpo físico pequeno nunca aumenta colisões por acidente.
9. **Seed:** variações procedurais de tiles usam RNG reproduzível quando determinismo da cena é obrigatório.
10. **Escalabilidade:** manter performance aceitável nos mapas densos, principalmente partículas e chefes.

## ART-08 — Validação visual

Criar cena de teste **no jogo real** com cavaleiro, inimigo, boss ou elite, água, parede, piso, porta, santuário e ataque. Conferir:
- Render em 1280×720 e dimensão real do personagem; identificar braços, mãos e arma.
- Transições idle → walk → attack → block sem salto de tamanho/offset.
- Efeitos ambientais que distinguem ameaça de decoração.
- Tile repetido sem costura óbvia; contraste suficiente em cada bioma.
- Sem recorte de texturas, borrão de glifos, perda de FPS relevante ou regressão da câmera.
- Teste com gameplay efetivo, não apenas textura exibida isolada.

**Não declarar “arte concluída” com base em build sem análise visual.** Salvar prints, FPS de referência, seed/bioma e resultado dos testes.

## ART-09 — Critérios de conclusão por asset

Cada asset liberado deve ter: nome/chave; referência ou objetivo visual; módulos geradores; conjunto de frames; material/paleta; escala; chaves de compatibilidade; consumidores; comportamento de fallback; teste de legibilidade; evidência visual; resultado de performance e data de validação.

A arte pode existir no código e continuar **A AUDITAR**. Veja os IDs ART no [backlog](../04-gestao/tarefas/01-ARTE_ASCII.md).
