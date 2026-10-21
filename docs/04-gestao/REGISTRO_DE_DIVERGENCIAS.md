# Registro de divergências — código atual x documentação histórica

> **Atualização técnica de 21/10/2026:** revisão de 45 arquivos fonte e correções propostas estão detalhadas em [Auditoria de código](../06-auditoria/AUDITORIA_CODIGO_2026-10-21.md). A [matriz dos 55 IDs](../06-auditoria/MATRIZ_55_TAREFAS.md) registra o estado histórico e a evidência real separadamente; não use afirmações históricas para concluir uma funcionalidade.

> **Leitura estática parcial do código em 2026-10-21** (branch main, antes desta alteração apenas documental). Isto comprova presença de estruturas no código, **não** aprovação de comportamento no navegador.
> Contexto: [auditoria original de 2026-10-09](../05-historico/AUDITORIA_ORIGINAL_2026-10-09.md) · [Antigravity](../ANTIGRAVITY_LEIA_PRIMEIRO.md).

## Prioridades de reconciliação

| ID | Documento antigo diz | Evidência localizada no código (21/10) | Próxima ação |
|---|---|---|---|
| DIV-001 | Todos os biomas usam ash_walker | src/data/biomes.js define 10 enemyPool/elitePool; GameScene._spawnEnemies usa biome.enemyPool/elitePool e rng.pick | **A AUDITAR no jogo**: distribuição real, tipo de inimigo, spawn/elite |
| DIV-002 | Boss sempre ashen_lord | GameScene._spawnBoss busca this.areaData.biome.bossPool[0], consulta BOSS_TEMPLATES e instancia Boss | **A AUDITAR** boss efetivamente correto por bioma e fase |
| DIV-003 | Descanso no santuário pode chamar _spawnEnemies na própria sala | GameScene._restAtSanctuary contém currentRoom.type !== 'SANCTUARY'; _spawnRoom também condiciona tipo | **A AUDITAR** entradas/respawns alternativos e regressões |
| DIV-004 | BootScene gera apenas texturas genéricas/tint cinza-marrom | BootScene chama TextureBootManager; src/ascii/ já possui AsciiRenderer, KnightArt, EnemyArt, BossArt, EnvironmentArt e LiquidsAndVFXArt | **A AUDITAR** render real, paletas, integração em todos os biomas |
| DIV-005 | Arte ASCII, água e inimigos detalhados “por fazer” | src/ascii/ contém biblioteca e pré-registro de texturas; incluindo 4 quadros de água | **A AUDITAR** qualidade, texturas realmente usadas, performance |
| DIV-006 | Knight tem animação de caminhada completa | KnightArt.js registra walk_0 e walk_1, mas comentário e dados de walk_1 reutilizam a matriz WALK_ASCII_LINES de walk_0 | **CANDIDATA A CORREÇÃO**: produzir frame genuíno após conferir referência e escala |
| DIV-007 | Arte do cavaleiro é uniforme entre ações | KnightArt.js descreve idle/walk como 200×100 e attack/block em grades menores; Player.js usa PLAYER_VISUAL_BOUNDS 80×80, body físico separado | **A AUDITAR** transição, achatamento, qualidade, offsets e hitbox |
| DIV-008 | Item Único só cai uma vez | AbyssChallengeSystem.calculateReward usa rewardId derivado do nível e timestamp para checar alreadyObtained | **A AUDITAR** histórico por ID de **item único** persistido, não por ID de evento |
| DIV-009 | Dez biomas validados integralmente | A auditoria relata testes em 09/10; src/data/biomes.js possui dados atuais, porém nenhuma execução de browser foi feita nesta reorganização | Reexecutar matriz por bioma; não herdar “100% validado” automaticamente |
| DIV-010 | GDD completo já está na documentação | docs/04-gestao/RASTREABILIDADE_GDD.md preserva **matriz de 49 tópicos**, não texto integral completo do GDD original | Importar o GDD original, se disponível, e comparar sem apagar decisões |
| DIV-011 | Alias “Vale das Cinzas / Floresta Velada / ...” são os IDs/nomes oficiais atuais | src/data/biomes.js usa Os Arredores Cinzentos, Jardim Pútrido etc. com IDs padronizados | Manter IDs técnicos nos sistemas/saves; aliases históricos só como histórico |
| DIV-012 | 55 tarefas e percentuais são estado atual | Contadores 25 validadas + 3 implementadas sem validação + 12 parciais + 15 pendentes provêm do documento de 09/10 | Auditar status um por um; preservar números como **snapshot antigo** |

## Exemplos de prova suficiente

**Inspeção de código:** “GameScene._spawnBoss utiliza bossPool[0] na versão inspecionada”. Isso é verificável e pode ser registrado.

**Não é suficiente afirmar:** “10 bosses funcionando perfeitamente” apenas pelo array bossPool ou por relatório antigo.

**Teste de jogo:** “Na seed X, área Y, bioma Z, boss K foi instanciado, abriu arena, executou fases e concluiu transição”, acompanhado da forma de execução, data e logs. Só então o cenário específico pode ser chamado de validado.

## Riscos ainda dependentes de QA

- Escala e anatomia do cavaleiro após alternar de idle/walk (arte extensa) para ataque/bloqueio (arte menor).
- Perda de FPS/memória por texturas muito grandes da referência mestre.
- Diferenças entre as texturas ASCII registradas e as realmente usadas pelos NPCs/chefes/cenários.
- Aleatoriedade de reprodução, ataques ambientais, transição de salas, salvamento e progressão extrema.
- ID de recompensa gerado por timestamp e persistência real de itens Únicos.

## Procedimento de fechamento

1. Confirmar código e commit inspecionado.
2. Criar reprodução clara se for um bug.
3. Corrigir somente se ainda existir; não reaplicar patch antigo cegamente.
4. Testar o cenário específico; adicionar evidência à tarefa.
5. Marcar divergência “resolvida” com link ao commit/teste e data.

**Esta é uma avaliação parcial:** não foi feita uma revisão exaustiva de todos os módulos, saves, caminhos de jogador ou consoles.
