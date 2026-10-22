# Direção artística V2 — Abismo

> **Data:** 22/10/2026. **Foco:** elevar cenários, inimigos, chefes e VFX ao patamar artístico do cavaleiro ASCII.  
> **Referências internas:** `src/ascii/KnightArt.js`, `src/ascii/knight_reference_rle.js` e [especificação ASCII original](DIRECAO_ARTISTICA_ASCII.md).  
> **Referência complementar:** capa horizontal do Abismo em pixel art de aproximadamente 34px de linguagem visual — atmosfera, enquadramento e cores; **não substituir automaticamente sprites do jogo por pixels comuns**.

## 1. Identidade artística que não pode ser perdida

**Dark fantasy, materiais desgastados, ruínas colossais e a sensação de profundidade do abismo.** O cavaleiro do jogo é a régua de qualidade; a arte deve permanecer reconhecível por forma, não apenas pela cor.

- **Estilo de renderização do jogo:** ilustrações ASCII de alta densidade pré-renderizadas em texturas Phaser, com paletas por material.
- **Forma:** contornos orgânicos, estrutura, anatomia, fendas, metal, água, vegetação e luz.
- **Luz:** preservar as sombras; evitar preto puro que apaga jogador e ambiente. Contraste acima de literalidade.
- **Paleta:** cinza, carvão, vinho, bronze/laranja e azuis frios; cada bioma define uma variação própria.
- **Hierarquia visual:** jogador legível em primeiro lugar, depois telegraphs de inimigos, perigos interativos, arquitetura e decoração.
- **Sem atalhos:** um inimigo não é somente um `@`, um boss não é uma escala maior de um inimigo, e água não é uma repetição de `~~~~`.
- **Evitar:** copiar o mesmo chão/paredes para dez biomas, só mudar tint e declarar identidade visual concluída.

## 2. Diagnóstico verificado no repositório (22/10)

| Subsistema | Fonte | Diagnóstico |
|---|---|---|
| Cavaleiro | `KnightArt.js` e RLE | A arte de alta densidade está presente. **Não modificar nesta etapa** |
| Inimigos | `EnemyArt.js` | Há **seis arquétipos visuais**, não um visual próprio para cada ID de inimigo |
| Chefes | `BossArt.js` | Existem desenhos para dez chefes, mas a maioria tem ordem de grandeza de dezenas de linhas, contra a referência muito mais densa do cavaleiro |
| Piso/parede | `TextureBootManager.js` | Os dez biomas reaproveitavam as **mesmas matrizes** de piso/parede, apenas recoloridas |
| Líquidos | `LiquidsAndVFXArt.js` | Quatro quadros de água e recursos de sangue/magma existem; a integração e leitura de profundidade ainda precisam de testes |
| Efeitos | `LiquidsAndVFXArt.js` | Há arcos e faíscas; falta avaliar sobreposições, animações e contraste no jogo |
| Render | `AsciiRenderer.js` | Texturas são pré-renderizadas no boot, com filtro NEAREST; preservar desempenho e compatibilidade |

**Limitação:** a inspeção de fonte não equivale a avaliação visual humana dos 10 biomas. A última auditoria validou um subconjunto de cena e não conteúdo completo.

## 3. Ordem de produção de arte

### Etapa A — Identidade dos cenários: primeira mudança pequena e reversível

**Nesta branch:** `BiomeSurfaceArt.js` introduz **8×8 glifos distintos por piso/parede dos 10 biomas**, e `TextureBootManager` usa essas matrizes mantendo chaves de textura antigas. São **motivos iniciais de produção**, não artes definitivas à altura do cavaleiro.

Aceite técnico: 10 composições de piso diferentes, 10 de parede, variações determinísticas rachado/detrito, sem tocar física/seed/cavaleiro, build e smoke do Phaser.

Aceite artístico futuro: modularizar blocos maiores que um tile, controlar emendas, criar pilares/portas de cada bioma e evitar padrões geométricos repetidos em grande escala. O teste visual deve verificar como se comportam corredores inteiros.

### Etapa B — Cenário hero e modularidade

Desenhar ambientes ASCII com módulos de múltiplos tiles: ruínas e estátuas, aquedutos, sarcófagos, fornalhas, árvores tóxicas, arquitetura urbana, cristais, grades/correntes, estantes, falhas do vazio. Cada cenário precisa ter **fundo, superfícies, detalhes de média escala e elemento memorável**, além de leitura de passagem/porta.

**Regra:** uma parede pode formar um desenho contínuo de 3×3 tiles; não depender de bordas retangulares individuais repetidas.

### Etapa C — Inimigos

Para cada bioma: confirmar IDs de `enemyPool`/`elitePool` e mapear para silhueta, material, arma, pose, direção, dano recebido e ataque. Criar **sprites individuais ou variações anatômicas justificadas**, não só uma paleta sobre um dos seis arquétipos genéricos.

Escala ASCII proporcional à câmera, com os membros conectados e armas visíveis. Testar leitura do telegraph a tamanho de gameplay, não só em editor.

### Etapa D — Chefes

Cada um dos 10 chefes deverá possuir silhueta própria, anatomia ou geometria marcante, ornamentos e transformação reconhecível entre fases. **Fase 2 = mudança visível de forma/pose/efeito, não só tint**.

Telas de boss não podem esconder projéteis, hitboxes, santuários ou rotas.

### Etapa E — Água e VFX

Água precisa distinguir superfície, espuma, margem, profundidade, reflexos e direção do fluxo, com quadros contínuos em tiles adjacentes. Sangue precisa parecer mais viscoso, magma precisa comunicar calor, cristais precisam ter facetas. Efeitos de corte e parry não devem ocultar ações críticas do jogador.

### Etapa F — Polimento técnico

- Contraste e acessibilidade no jogo lógico 1280×720.
- Aprovação de tile atlas com mosaicos 3×3 e 5×5.
- Tests de sprite animation: idle, walk, block, hit, dodge, boss fase 1/2.
- Comparação de FPS e tempo de boot no mesmo hardware.
- Verificar resets de texturas, transições, IndexedDB e segredos nos arquivos.
- Somente marcar “validado” com captura real e prova jogável.

## 4. Linguagem material por bioma

| Bioma | Materiais e formas | Luz, atmosfera e perigo visual |
|---|---|---|
| Arredores Cinzentos | Cinza vulcânica, pedra erodida, fortalezas quebradas | Cinza fria, brasa pontual, cinza flutuante |
| Aqueduto Submerso | Arcos molhados, blocos com limo, correntes | Azul-esverdeado, reflexos e espuma |
| Catacumbas Ecoantes | Ossos, sarcófagos, colunas, pisos frágeis | Roxo-cinza, vazio e poeira |
| Forja Maculada | Chapas rebitadas, correntes, metal e lava | Âmbar, laranja e vermelho quente |
| Jardim Pútrido | Raízes, fungos, pétalas mortas, espinhos | Verde doente, nuvens e esporos |
| Cidade Subterrânea | Paredes monumentais, pontes, lanternas | Azul aço e dourado discreto |
| Abismo Cristalino | Facetas e arestas, prismas, minerais | Ciano luminoso, reflexos pontuais |
| Cárcere de Sangue | Grades, pedra úmida, ferragens e poças | Carmesim contido, sombras profundas |
| Biblioteca do Oculto | Madeira, estantes, tomos, símbolos | Violeta e luz arcana focal |
| Coração do Abismo | Fissuras no espaço, arquitetura impossível | Violeta escuro, formas anômalas |

## 5. Invariantes técnicos

1. **Não alterar o cavaleiro** sem tarefa própria.
2. Textura visual independente da hitbox física; não redesenhar colisão para caber desenho.
3. Manter chaves atuais `tile_floor_<BIOMA>`, `tile_wall_<BIOMA>`, `tile_floor_debris_<BIOMA>`, `tile_wall_cracked_<BIOMA>`.
4. Pré-renderizar quando possível; nenhuma geração de canvas glifo a glifo a cada frame.
5. Não consumir a stream de RNG do gameplay para escolher variantes de arte, para evitar alterar geração de mundo.
6. Arte nunca deve comprometer passagem ou indicar falsamente perigo/porta.
7. Testes em Node validam contratos de dados, **não estética**; complementar com screenshots e gameplay.
8. Branch de arte isolada; não mudar combate, XP, saves, rede ou regras de spawn.

## 6. Backlog objetivo após o primeiro protótipo

- **ART-V2-001 (feito no código, aguarda visual):** 10 pisos/10 paredes de silhueta diferente, variantes determinísticas.
- **ART-V2-002 (pendente):** atlas contínuo de parede e chão por bioma, eliminando costuras.
- **ART-V2-003 (pendente):** cenários hero exclusivos dos Arredores e Aqueduto.
- **ART-V2-004 (pendente):** os 6 arquétipos de inimigo recebem direção anatômica e expansão por ID.
- **ART-V2-005 (pendente):** começar pelo Senhor das Cinzas, com desenho de alta densidade e fase 2 realmente distinta.
- **ART-V2-006 (pendente):** água/magma/sangue com animações e limites de hazard legíveis.
- **ART-V2-007 (pendente):** QA de tiles, câmera, iluminação, FPS, screenshots e feedback de jogo.
- **ART-V2-008 (pendente):** produção dos outros nove biomas, inimigos e chefes após aprovação do padrão piloto.

O **primeiro protótipo não será rotulado de “arte final”**: seu propósito é corrigir o reuso de desenho entre biomas, preservar APIs e abrir um caminho de produção visual com etapas verificáveis.
