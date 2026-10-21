# Marco 02 — mundo, inimigos e chefes

> Subtarefas operacionais do conjunto de mundo e inimigos; **não duplicam as 55 tarefas legadas**. Estado inicial A AUDITAR porque dados e parte da lógica já estão no repositório.
> [Guia dos dez biomas](../../02-mundo/GUIA_DE_BIOMAS.md) · [Backlog](../BACKLOG_ANTIGRAVITY.md)

### ABISMO-WLD-101 — Provar seed reproduzível e conexões de salas

- **Status:** A AUDITAR / depende de decisão onde indicado. **Prioridade:** P1. **Tarefa legado:** ABISMO-WLD-001.
- **Arquivos alvo:** src/world/{SeedSystem,WorldGenerator,RoomGenerator}.js; src/scenes/GameScene.js.
- **Dependências:** QA-101.
- **Objetivo:** Validar entradas, rotas opcionais, santuário, chefe e portas em N/S/L/O com RNG isolado.

**Procedimento de trabalho**
1. Reproduzir a mesma seed múltiplas vezes, comparando IDs de salas, layout e pools.
2. Inspecionar BFS/flood fill, _isReserved e _carveHallways.
3. Testar rotas com ramificações, portas e obstáculos.
4. Registrar seed, grafo, falhas e correção mínima.

**Critérios de aceite**
- [ ] Caminho crítico sempre alcançável nos casos testados.
- [ ] Grafo/layout não divergem entre execuções equivalentes.
- [ ] Registrar seed, bioma, versão, teste real, resultado e risco residual.

---

### ABISMO-WLD-102 — Auditar segurança de santuários e distâncias de spawn

- **Status:** A AUDITAR / depende de decisão onde indicado. **Prioridade:** P1. **Tarefa legado:** ABISMO-DTH-002; ABISMO-ENM-001.
- **Arquivos alvo:** src/scenes/GameScene.js; src/entities/Enemy.js; src/world/RoomGenerator.js.
- **Dependências:** WLD-101.
- **Objetivo:** Garantir que descanso e entrada em santuário não invocam inimigos na sala segura.

**Procedimento de trabalho**
1. Confirmar guardas atuais SANCTUARY/ENTRANCE e outras rotas para _spawnEnemies.
2. Verificar distância mínima do player, paredes, spawn em transição e respawn.
3. Testar descansar repetidamente e reentrar em área já limpa.
4. Só corrigir se houver falha reproduzível.

**Critérios de aceite**
- [ ] Nenhum hostile na sala do santuário em repouso, respawn ou transição.
- [ ] Spawn não sobrepõe player nem tiles sólidos.
- [ ] Registrar seed, bioma, versão, teste real, resultado e risco residual.

---

### ABISMO-WLD-103 — Verificar pools de inimigos, elites e progressão por bioma

- **Status:** A AUDITAR / depende de decisão onde indicado. **Prioridade:** P2. **Tarefa legado:** ABISMO-ENM-001; ABISMO-BIO-001..010.
- **Arquivos alvo:** src/data/{biomes,enemies}.js; src/scenes/GameScene.js; src/entities/Enemy.js.
- **Dependências:** WLD-101.
- **Objetivo:** Conferir uso real de enemyPool, elitePool, escalonamento por depth e variantes de IA.

**Procedimento de trabalho**
1. Listar templates correspondentes aos IDs de todos os pools.
2. Forçar/testar cada bioma e sala ELITE com seed conhecida.
3. Conferir tipo, nível, resistência, arte e posição de spawn.
4. Catalogar IDs órfãos e fallbacks.

**Critérios de aceite**
- [ ] Todos os IDs de cada pool resolvem templates válidos.
- [ ] Spawn por bioma e escala por depth verificados no jogo.
- [ ] Registrar seed, bioma, versão, teste real, resultado e risco residual.

---

### ABISMO-WLD-104 — Validar dez chefes e progressão entre áreas

- **Status:** A AUDITAR / depende de decisão onde indicado. **Prioridade:** P2. **Tarefa legado:** ABISMO-ENM-002.
- **Arquivos alvo:** src/data/{biomes,enemies}.js; src/entities/Boss.js; src/scenes/GameScene.js.
- **Dependências:** WLD-103; ART-106.
- **Objetivo:** Conferir bossPool, fases, HP, disparos, bossbar, recompensa e desbloqueio de próxima área.

**Procedimento de trabalho**
1. Cruzamento de 10 IDs de bossPool com BOSS_TEMPLATES.
2. Entrar na arena de cada bioma; observar ataques, fase 2 e morte.
3. Confirmar limpeza do boss e transição da área.
4. Testar salvar/recarregar e evitar boss duplicado.

**Critérios de aceite**
- [ ] Dez bosses testados ou lista explícita de falhas/ausência.
- [ ] Sem avanço duplicado, chefe incorreto ou softlock.
- [ ] Registrar seed, bioma, versão, teste real, resultado e risco residual.

---

### ABISMO-WLD-105 — Testar hazards, partículas e interações ambientais

- **Status:** A AUDITAR / depende de decisão onde indicado. **Prioridade:** P2. **Tarefa legado:** ABISMO-BIO-001..010; ABISMO-GFX-001.
- **Arquivos alvo:** src/world/EnvironmentalHazards.js; src/scenes/GameScene.js; src/data/biomes.js.
- **Dependências:** WLD-101; ART-107.
- **Objetivo:** Verificar AshPatch, CurrentZone, FragileFloor, ThermalEruption, ToxicPlant, LanternBridge, CrystalReflector, BloodPool, IllusionDoor e GravityZone.

**Procedimento de trabalho**
1. Construir caso individual de entrar, permanecer e sair da zona.
2. Checar efeito gameplay e efeito ASCII correspondente.
3. Verificar limpeza após morte, transição e reload.
4. Benchmarcar alta densidade de hazards; auditar ambientParticles.

**Critérios de aceite**
- [ ] Os dez efeitos podem ser acionados sem exceções.
- [ ] Estados não vazam entre salas nem ficam presos no jogador.
- [ ] Registrar seed, bioma, versão, teste real, resultado e risco residual.

---

### ABISMO-WLD-106 — Auditar teleporte ilusório e portas sem softlock

- **Status:** A AUDITAR / depende de decisão onde indicado. **Prioridade:** P1. **Tarefa legado:** ABISMO-WLD-001/002; ABISMO-BIO-009.
- **Arquivos alvo:** src/world/{WorldGenerator,RoomGenerator,EnvironmentalHazards}.js; src/scenes/GameScene.js.
- **Dependências:** WLD-101, WLD-105.
- **Objetivo:** Testar IllusionDoor, portas normais, direção e retorno com preservação da rota obrigatória.

**Procedimento de trabalho**
1. Testar destinos da porta ilusória em múltiplas seeds.
2. Garantir caminho de retorno e proteção de boss/santuário.
3. Validar transição enquanto player ataca, esquiva ou é atingido.
4. Registrar qualquer impossibilidade de navegar de volta.

**Critérios de aceite**
- [ ] Nenhuma seed testada termina em sala inacessível por teleportador.
- [ ] Sem entidades remanescentes de sala anterior.
- [ ] Registrar seed, bioma, versão, teste real, resultado e risco residual.

---

### ABISMO-WLD-107 — Auditar profundidade infinita e escalonamento

- **Status:** A AUDITAR / depende de decisão onde indicado. **Prioridade:** P2. **Tarefa legado:** ABISMO-MAP-002; ABISMO-PRG-003.
- **Arquivos alvo:** src/world/WorldGenerator.js; src/scenes/GameScene.js; src/data/balance.js.
- **Dependências:** WLD-104, SYS-203.
- **Objetivo:** Examinar progressão numérica e variedade de pools/bosses em depth alto; impedir NaN/overflow.

**Procedimento de trabalho**
1. Testar progressão normal até transição de biomas.
2. Simular profundidades altas com acesso controlado de teste.
3. Checar soft cap, spawn, HP, dano e custo de XP.
4. Testar memória após várias áreas e salvos intermediários.

**Critérios de aceite**
- [ ] Depth alto não produz valores inválidos nem crashes.
- [ ] Progressão e save íntegros, limitações documentadas.
- [ ] Registrar seed, bioma, versão, teste real, resultado e risco residual.

---

### ABISMO-WLD-108 — Especificar seleção de 5–8 biomas por partida

- **Status:** A AUDITAR / depende de decisão onde indicado. **Prioridade:** P3. **Tarefa legado:** ABISMO-MAP-001.
- **Arquivos alvo:** src/world/WorldGenerator.js; src/scenes/MainMenuScene.js; src/save/SaveSystem.js.
- **Dependências:** DEC-009; WLD-101.
- **Objetivo:** Definir regras de seleção, cobertura e preservação de seed antes da implementação.

**Procedimento de trabalho**
1. Comparar requisito histórico com experiência atual e consultar decisão registrada.
2. Definir ordem, aleatoriedade e armazenamento da seleção.
3. Prever fallback de save e compatibilidade do modo infinito.
4. Implementar somente após regra fechada.

**Critérios de aceite**
- [ ] Fluxo documentado e aprovado; seed reprodutível.
- [ ] Não desabilitar biomas/achievements sem decisão expressa.
- [ ] Registrar seed, bioma, versão, teste real, resultado e risco residual.

---

### ABISMO-WLD-109 — Planejar chefes modulares do endgame

- **Status:** A AUDITAR / depende de decisão onde indicado. **Prioridade:** P3. **Tarefa legado:** ABISMO-ENM-003; ABISMO-MAP-002.
- **Arquivos alvo:** src/entities/Boss.js; src/data/enemies.js; src/world/WorldGenerator.js.
- **Dependências:** WLD-104, WLD-107.
- **Objetivo:** Definir mistura de padrões/atributos/resistências sem gerar combinações injustas ou impossíveis.

**Procedimento de trabalho**
1. Inventariar habilidades existentes e limitações de fase.
2. Desenhar arquétipos e regras de exclusão de combinação.
3. Criar testes determinísticos para seed/depth e telegraph.
4. Só codificar após contrato de comportamento e balanceamento.

**Critérios de aceite**
- [ ] Combinações reprodutíveis, compreensíveis e sem softlock.
- [ ] Conjunto de QA cobre boss híbrido e recompensa correta.
- [ ] Registrar seed, bioma, versão, teste real, resultado e risco residual.
