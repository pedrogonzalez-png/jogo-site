# Geração procedural e endgame — tarefas do Abismo

> Conteúdo reorganizado do checklist de 2026-10-09. Status e evidências são históricos e **não foram revalidados** nesta reorganização.
> [Voltar ao checklist mestre](../TAREFAS_ABISMO.md) · [Índice da documentação](../README.md)

## SEÇÃO J — Mundo procedural

- [x] **ABISMO-WLD-001 — Estruturas e conectividade seguras** `[P1]` `[x] Implementado e validado`
  - **Objetivo:** A seed precisa desenhar fluxos principais (Salas Normais -> Santuários -> Chefes) inquebráveis, com bifurcações orgânicas e ramificações extras. Entradas e saídas acessíveis sempre. Geração matemática sem loops infinitos na ramificação.
  - **Arquivos:** `WorldGenerator.js`.
  - **Critério de conclusão:** Navegação consistente. Transições limpas e precisas de sala para sala via colisão com blocos delimitadores das portas.
  - **Evidência atual:** BFS validado; as conexões (N/S/L/O) não prendem jogadores em paredes em nenhum dos biomas testados, graças à reserva matemática do `_carveHallways()`.

- [ ] **ABISMO-WLD-002 — Segredos, Cavernas Extras, Eventos e Spawn Variado** `[P3]` `[ ] Pendente`
  - **Objetivo:** Baús em salas mortas, salas falsas (cavernas extras do GDD) e injeção de pontos de interesse nos grafos anexos da árvore de path.
  - **Arquivos:** `WorldGenerator.js`, `RoomGenerator.js`.
  - **Evidência atual:** Os tiles "especiais" são vagamente usados, precisando de conteúdo rico inserido.

---

## SEÇÃO M — Biomas por partida e endgame

- [ ] **ABISMO-MAP-001 — Limitação a 5-8 biomas na seed principal** `[P2]` `[ ] Pendente`
  - **Objetivo:** As "partidas" (saves) normais limitam a apresentação dos 10 cenários para que os jogadores se familiarizem, exigindo novas "fendas" (endgames/runs diferentes) para verem as paletas ocultas que a seed ocultou.
  - **Arquivos:** `WorldGenerator.js`.
  - **Critério de conclusão:** Pool extrai de 5 a 8 e descarta o restante durante o build inicial.

- [ ] **ABISMO-MAP-002 — A Profundidade Abissal Infinita** `[P3]` `[ ] Pendente`
  - **Objetivo:** Ausência de teto. Ao derrotar biomas normais da seed, abrir brechas com inimigos sobrelevedados independentes do nosso próprio LVL (se estamos LVL20, a Fenda cria inimigos 80). Zonas anômalas repetitivas com melhores Drops (farming).
  - **Arquivos:** `GameScene.js` (AbyssPortal).
  - **Evidência atual:** Portal instanciado. Variável `areaIndex` cresce ad infinitum, mas a matemática que força o cap dos monstros e tabelas únicas para esses andares avançados carece de ajustes.
