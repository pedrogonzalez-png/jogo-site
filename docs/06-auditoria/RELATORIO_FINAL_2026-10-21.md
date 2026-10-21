# Relatório final da auditoria técnica — Abismo

**Data:** 21 de outubro de 2026  
**Branch auditada:** `fix/auditoria-integral-2026-10-21`  
**Pull Request:** [#3 — auditoria integral, invariantes e testes](https://github.com/pedrogonzalez-png/jogo-site/pull/3)  
**Base:** `main` no commit `bcf3c1dae9195c4994f5b749f3d856cd893bc9c0` (merge documental do PR #2).  
**Execução final de validação do código e navegador:** [GitHub Actions 39679081571](https://github.com/pedrogonzalez-png/jogo-site/actions/runs/39679081571), commit `1a3bf089d28b1c67e69d66ea2ef69f18810a4e5a`.  
**Status:** auditoria estática + CI + smoke de navegador **concluídos**; validação jogável exaustiva e análise estética humana **pendentes**.

## Resumo executivo

O código do jogo foi inspecionado por subsistemas a partir do repositório, com ênfase nos **45 arquivos JavaScript de `src/`**, seus contratos e os documentos históricos. As correções foram feitas em branch independente da `main`, sem reescrever a arquitetura Phaser, alterar intencionalmente a arte ASCII ou apagar a auditoria antiga.

### Validações reproduzidas

| Verificação | Evidência e resultado | Limite |
|---|---|---|
| `npm ci` | PASSOU no GitHub Actions, Node.js 22/Ubuntu | Ambiente CI, não Arch do desenvolvedor |
| `npm test` | **24/24 testes PASSARAM; 0 falhas; 0 ignorados** | Casos automatizados, não todas as funcionalidades |
| `npm run build` | **PASSOU, 50 módulos Vite transformados** | Não comprova compatibilidade visual |
| Navegador Chromium headless + Phaser | **PASSOU**; menu, Canvas, texturas ASCII principais e entrada em GameScene | Teste de uma sessão, não os 10 biomas |
| Controles do inventário | **PASSOU**; Tab abre e fecha, verificado via jogo no browser | Equipar/trocar cada peça por clique permanece pendente |
| Transição entre salas | **PASSOU**; saída E e limpeza de projéteis da sala anterior | Não percorreu todas as rotas |
| Fluxo de morte | **PASSOU**; dano fatal, tela de morte, clique para renascer; overlay com **0 objetos restantes**, HP restaurado, orbe preservada | Não testou segunda morte pela UI |
| IndexedDB | **PASSOU**; gravação com `_autosave` e leitura subsequente mantiveram seed, sala e estado da orbe | Não cobriu todas as migrações de dados legados |
| Capturas automatizadas | Menu, jogo, inventário, morte e respawn anexados como artefato na execução | Captura **não** equivale a aprovação estética humana |

A execução demonstrou GameScene em **ARREDORES_CINZENTOS**, 10 salas, 2 inimigos iniciais e HP 220 no seed gerado para aquele run. Estes números pertencem **somente à sessão testada** e não representam métricas universais do jogo.

**Scripts adicionados:** `tests/core-systems.test.js`, `tests/world-generation.test.js`, `tests/source-integrity.test.js`, `tests/ascii-art-contracts.test.js`, `scripts/browser-smoke.mjs`, `.github/workflows/quality.yml`.

### Correções desta auditoria

O relatório [AUDITORIA_CODIGO_2026-10-21.md](AUDITORIA_CODIGO_2026-10-21.md) descreve os achados **AUD-001 até AUD-020** (dano, recompensa e hit fatal, status, arma e inventário, unicidade, baús, RNG, save, spawn, progressão, portas e parry). Este encerramento acrescenta:

| ID | Falha observada | Correção | Evidência |
|---|---|---|---|
| **AUD-021** | A tela de morte destruía somente o retângulo escuro ao clicar em renascer; permaneciam textos e botões de profundidade 501 | `GameScene._clearDeathScreen()` gerencia e remove **todos** os elementos do overlay; coordenadas passam a usar scrollFactor adequado | Smoke Chromium cobriu dano fatal, overlay e clique de respawn; 0 objetos remanescentes |
| **AUD-022** | `_activeProjectiles` mantinha projéteis referenciados após a troca de sala mesmo quando objetos visuais eram destruídos | `GameScene._clearRoom()` destrói projéteis e esvazia array antes de construir nova sala | Smoke Chromium criou projétil, fez transição E e conferiu array vazio |
| **AUD-023** | Fórmula de anomalia `level * rng.next() * 3 + 1.5` podia reduzir níveis altos para 2, ao contrário da intenção de inimigos amplificados | Fórmula ajustada para `level * (1.5 + rng.next() * 3)` e nível mínimo 1 | Inspeção estática, sintaxe/build aprovados; distribuição/curva de dificuldade não balanceadas em gameplay |
| **AUD-024** | Após abrir baú, XP e item não eram salvos automaticamente no mesmo evento; ao recarregar antes de outro save o estado podia regredir | `GameScene._openChest()` chama `_autosave()` após creditar XP e itens | Inspeção estática e build aprovados; **abertura do baú por UI/reload ainda requer teste específico** |
| **AUD-025** | Falta de verificação de inicialização real do Phaser e das correções de transição/morte | Adicionado job `browser-smoke` com Playwright/Chromium, screenshots e leitura de IndexedDB | Execução 39679081571 aprovada |

### Lacunas funcionais que continuam abertas

1. **Armas:** existem seis famílias concretas (`SWORD`, `DAGGER`, `GREATSWORD`, `AXE`, `HAMMER`, `SPEAR`) versus nove categorias pretendidas. Foice, arco e especiais não foram implementados nesta auditoria.
2. **Prêmios do Abismo +200:** os tiers e pontos são calculados, mas a entrega concreta de arma Única + item Único + prêmio especial ainda não está concluída.
3. **Visual ASCII:** existem dados para dez chefes e várias texturas. `walk_0` e `walk_1` do cavaleiro usam a mesma matriz; animação de caminhada realmente distinta, escala, legibilidade, sombra e performance exigem avaliação visual.
4. **Áudio/narrativa/ghosts:** propostas ou metadados não são evidência de implementação jogável completa. Fantasmas assíncronos e rankings permanecem como itens futuros.
5. **Persistência de loot:** a posição interna da stream do RNG não é serializada para restores no meio da área. Saves antigos não podem reconstruir IDs de Únicos já descartados se não guardavam o histórico.
6. **QA de conteúdo:** faltam campanhas nos dez biomas, verificação real dos dez bosses/fases e hazards, colisões em todas as salas, equipamento pela UI, baús pela UI, segunda morte, performance/FPS e compatibilidade no Arch Linux.
7. **Distribuição:** `dist/` permanece rastreado apesar de `.gitignore`; não foi removido para não interferir em um deploy existente.

### Leitura dos números de progresso

- **45 JS inspecionados**: inventário da revisão estática, não 45 funcionalidades aprovadas.
- **24 testes aprovados**: 24 cenários automatizados, não 24 requisitos do GDD concluídos.
- **55 tarefas históricas**: preservadas; [matriz de evidências individual](MATRIZ_55_TAREFAS.md).
- **56 subtarefas de organização**: backlog operacional complementar; **não somar** aos 55 para calcular conclusão.
- **1 smoke de navegador passou**: confirmou fluxos escolhidos; **não** substitui o [roteiro completo de QA](ROTEIRO_QA_ANTIGRAVITY.md).

## Entrega e aceite

**Entregue no PR #3:** correções de lógica, persistência, geração de mundo e ciclo de vida; 24 testes automatizados; CI com build e browser smoke; artefatos de cinco screenshots; auditoria técnica, matriz dos 55 e roteiro de QA.

**Não foi aplicado merge à `main`.** A branch permanece em Pull Request de revisão. Para validar o conteúdo inteiro do jogo, seguir `ROTEIRO_QA_ANTIGRAVITY.md`, registrar resultado em navegador para cada funcionalidade e atualizar os IDs somente com evidências. Não afirmar cobertura completa ou “jogo 100% validado” por causa deste relatório.

[Ver Pull Request #3](https://github.com/pedrogonzalez-png/jogo-site/pull/3) · [Ver CI + screenshots](https://github.com/pedrogonzalez-png/jogo-site/actions/runs/39679081571)
