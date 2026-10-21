# Marco 06 — testes de integração, regressão e aceitação

> Este marco **não representa testes já executados**. É um roteiro para execução no Antigravity e no navegador real. [Matriz completa de QA](../PLANO_DE_VALIDACAO.md).
> [Voltar ao backlog](../BACKLOG_ANTIGRAVITY.md)

### ABISMO-QA-201 — Criar smoke test de boot, gameplay e HUD

**Status:** A EXECUTAR (testes não rodados nesta reorganização). **Prioridade:** P1. **Legado:** ABISMO-MVP-001; ABISMO-HUD-001.
**Arquivos/sistemas:** src/main.js; src/scenes/**; src/ui/**. **Dependências:** QA-101, arte registrada.
**Objetivo:** Aferir menu, seed, new game, player, inventário, santuário e saída do jogo sem travamentos.

**Execução**
1. Executar build e iniciar dev server em ambiente identificado.
2. Reproduzir ações do jogador da tela inicial até primeira área.
3. Capturar console, screenshot e resultados.
4. Testar fallback de save inexistente e navegação básica.

**Aceite**
- [ ] Sem crash/erros fatais nos fluxos testados.
- [ ] Resultado e ambiente publicados com evidência.
- [ ] Resultado PASSOU/FALHOU/NÃO EXECUTADO com ambiente, seed, build, logs e data.

---

### ABISMO-QA-202 — Executar suíte dos dez biomas com seed reproduzível

**Status:** A EXECUTAR (testes não rodados nesta reorganização). **Prioridade:** P1. **Legado:** ABISMO-BIO-001..010; ABISMO-ENM-001/002.
**Arquivos/sistemas:** src/data/biomes.js; src/world/**; src/scenes/GameScene.js. **Dependências:** WLD-103, WLD-104, WLD-105.
**Objetivo:** Rodar hazard, inimigos/elite/boss, santuário, rotas e transições em todos os biomas.

**Execução**
1. Preparar seeds/fixtures por bioma e registrar as condições.
2. Acionar mecânica ambiental e conferir efeitos e status.
3. Entrar/derrotar boss/atravessar área/recuperar save.
4. Comparar arte ASCII entre biomas e capturar bugs.

**Aceite**
- [ ] Checklist 10/10 com PASSOU, FALHOU ou NÃO EXECUTADO fundamentado.
- [ ] Nenhum “100%” sem execução completa.
- [ ] Resultado PASSOU/FALHOU/NÃO EXECUTADO com ambiente, seed, build, logs e data.

---

### ABISMO-QA-203 — Regressão de combate, equipamento e tiers de desafio

**Status:** A EXECUTAR (testes não rodados nesta reorganização). **Prioridade:** P1. **Legado:** ABISMO-PLY/WPN/ARM/STA/CHA.
**Arquivos/sistemas:** src/entities/Player.js; src/combat/**; src/equipment/**; src/progression/**. **Dependências:** SYS-201..207.
**Objetivo:** Garantir fórmulas, timings, armas e recompensas em testes numéricos e jogo.

**Execução**
1. Executar casos de defesa, crítico, poise, status e parry em limites.
2. Trocar famílias de armas e validar diferença funcional.
3. Testar equipamento acima do recomendado e economia de XP.
4. Testar diferenças de nível 49/50/100/150/200/201 e unicidade.

**Aceite**
- [ ] Planilha/relatório esperado x obtido por caso.
- [ ] Sem regressão de i-frames, penalidade de armor ou economia.
- [ ] Resultado PASSOU/FALHOU/NÃO EXECUTADO com ambiente, seed, build, logs e data.

---

### ABISMO-QA-204 — Regressão de IndexedDB, checkpoint, morte e item único

**Status:** A EXECUTAR (testes não rodados nesta reorganização). **Prioridade:** P1. **Legado:** ABISMO-SAV-001; ABISMO-DTH-001/002; ABISMO-INV-002.
**Arquivos/sistemas:** src/save/SaveSystem.js; src/progression/XPSystem.js; src/equipment/InventorySystem.js. **Dependências:** SYS-102, SYS-206, SYS-208.
**Objetivo:** Testar slot, atualização, interrupção, segunda morte, orb XP e reload.

**Execução**
1. Criar save de teste e fazer backup quando pertinente.
2. Testar recompensa, fechar aba, retomar e comparar.
3. Conferir ausência de duplicação de ID de item único.
4. Testar dados incompatíveis sem apagar saves legítimos.

**Aceite**
- [ ] Save de teste reproduz estado sem corrupção.
- [ ] Migração e erro são comunicados de forma verificável.
- [ ] Resultado PASSOU/FALHOU/NÃO EXECUTADO com ambiente, seed, build, logs e data.

---

### ABISMO-QA-205 — Testar animação, escala, transparência e mosaicos ASCII

**Status:** A EXECUTAR (testes não rodados nesta reorganização). **Prioridade:** P1. **Legado:** ABISMO-GFX-001.
**Arquivos/sistemas:** src/ascii/**; src/entities/{Player,Enemy,Boss}.js; src/scenes/BootScene.js. **Dependências:** ART-101..109.
**Objetivo:** Provar que sprites complexos são legíveis em 1280×720 e que tilemap não apresenta costuras/bugs de textura.

**Execução**
1. Comparar cavaleiro idle/walk/attack/block em mesma escala.
2. Desenhar debug body para checar offsets/hitbox.
3. Testar mosaicos 3×3/5×5 e água/magma/sangue.
4. Capturar imagens de 10 biomas e estado de boss.

**Aceite**
- [ ] Arte legível, sem personagem virando símbolo único.
- [ ] Nenhum salto visual/hitbox ou texto cortado na alternância.
- [ ] Resultado PASSOU/FALHOU/NÃO EXECUTADO com ambiente, seed, build, logs e data.

---

### ABISMO-QA-206 — Benchmark de performance, texturas e duração de runs

**Status:** A EXECUTAR (testes não rodados nesta reorganização). **Prioridade:** P1. **Legado:** ABISMO-GFX-001; ABISMO-MAP-002.
**Arquivos/sistemas:** src/ascii/{AsciiRenderer,TextureBootManager}.js; src/scenes/GameScene.js. **Dependências:** ART-110, WLD-107.
**Objetivo:** Medir boot, texturas, FPS, memória e comportamento após muitas transições ou hazards.

**Execução**
1. Medir baseline com mesmas configurações/gráficos/seed.
2. Registrar picos em boss, líquidos, partículas e cenas cheias.
3. Verificar objetos/eventos/texturas destruídos quando saem da cena.
4. Comparar antes/depois e registrar queda de qualidade/fidelidade.

**Aceite**
- [ ] Resultados numéricos e ambiente reproduzíveis.
- [ ] Sem degradação progressiva relevante sem justificativa.
- [ ] Resultado PASSOU/FALHOU/NÃO EXECUTADO com ambiente, seed, build, logs e data.

---

### ABISMO-QA-207 — Consolidar status, changelog e entrega ao próximo agente

**Status:** A EXECUTAR (testes não rodados nesta reorganização). **Prioridade:** P1. **Legado:** 55 tarefas históricas + subtarefas novas.
**Arquivos/sistemas:** docs/**; relatórios de teste; commits. **Dependências:** QA-201..206.
**Objetivo:** Finalizar cada marco com estado real, evidências e documentação navegável.

**Execução**
1. Checar links Markdown, IDs, nomes e dependências.
2. Comparar tarefas legadas e novas para evitar contagem duplicada.
3. Atualizar status somente com teste/comprovação atribuível.
4. Publicar relatório de mudanças, riscos e próximos passos.

**Aceite**
- [ ] Índices levam a todos os arquivos sem links quebrados.
- [ ] Agente novo consegue retomar qualquer ID lendo requisitos+evidências.
- [ ] Resultado PASSOU/FALHOU/NÃO EXECUTADO com ambiente, seed, build, logs e data.
