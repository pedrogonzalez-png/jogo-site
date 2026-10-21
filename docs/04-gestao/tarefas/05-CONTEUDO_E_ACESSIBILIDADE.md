# Marco 05 — narrativa, áudio, UI e acessibilidade

> Os requisitos narrativos e sonoros ainda não estão totalmente fechados; evitar inventar canon, APIs e mídias sem fonte. Use [diretrizes de narrativa e áudio](../../03-conteudo/NARRATIVA_AUDIO_E_INTERFACE.md).
> [Voltar ao backlog](../BACKLOG_ANTIGRAVITY.md)

### ABISMO-NAR-101 — Consolidar lore e direção narrativa sem inventar canon

**Status:** A AUDITAR; não presumir que narrativa/áudio existam. **Prioridade:** P2. **Legado:** ABISMO-NPC-001.
**Arquivos:** docs/01-projeto/VISAO_CANONICA_E_GDD.md; material autoral a incorporar; src/data/**. **Depende de:** DEC-001; DEC-006.
**Objetivo:** Criar inventário de personagens, mistérios, elementos de mundo, pistas e texto já aprovado.

**Procedimento**
1. Localizar notas/documentos de história existentes.
2. Separar lore confirmada de hipótese e placeholder.
3. Escrever estrutura de temas por bioma sem criar eventos definitivos.
4. Registrar decisões autorais em aberto com data e fonte.

**Critérios de aceite**
- [ ] Nenhum lore inventado apresentado como oficial.
- [ ] Fontes da narrativa apontadas por seção.
- [ ] Documentar build, uso no jogo, decisão autoral e qualquer bloqueio.

---

### ABISMO-NAR-102 — Desenhar dados de NPCs, missões, flags e diálogos

**Status:** A AUDITAR; não presumir que narrativa/áudio existam. **Prioridade:** P2. **Legado:** ABISMO-NPC-001.
**Arquivos:** src/data/**; src/scenes/GameScene.js; src/save/SaveSystem.js. **Depende de:** NAR-101; SYS-102.
**Objetivo:** Permitir conteúdo dirigido por dados sem espalhar scripts de quests no loop principal.

**Procedimento**
1. Definir schema de ID, pré-condição, gatilho, diálogos e recompensas.
2. Catalogar hooks de eventos existentes.
3. Planejar persistência de flags com migração.
4. Prototipar uma quest somente após lore e regras aprovadas.

**Critérios de aceite**
- [ ] Estado serializável sem repetição de recompensas.
- [ ] Missão não impede portas/santuário nem pausa gameplay indevidamente.
- [ ] Documentar build, uso no jogo, decisão autoral e qualquer bloqueio.

---

### ABISMO-NAR-103 — Auditar efeitos sonoros de combate e ambiente

**Status:** A AUDITAR; não presumir que narrativa/áudio existam. **Prioridade:** P2. **Legado:** ABISMO-SND-001.
**Arquivos:** src/scenes/BootScene.js; src/entities/Player.js; src/world/EnvironmentalHazards.js; src/data/biomes.js. **Depende de:** QA-101; decisões de licença/gerador.
**Objetivo:** Projetar/validar hooks de som para ataque, hit, parry, água, fogo, portas, loot e menu.

**Procedimento**
1. Catalogar pontos de eventos sonoros existentes e placeholders.
2. Definir prioridades, volume, cooldown, simultaneidade e mute.
3. Testar autoplay policy do navegador e retomada ao voltar à aba.
4. Não anexar áudio licenciado sem permissão.

**Critérios de aceite**
- [ ] Nenhuma exceção de áudio bloqueia combate.
- [ ] Volume e mute obedecem preferências quando implementados.
- [ ] Documentar build, uso no jogo, decisão autoral e qualquer bloqueio.

---

### ABISMO-NAR-104 — Planejar música e ambientes sonoros próprios por bioma

**Status:** A AUDITAR; não presumir que narrativa/áudio existam. **Prioridade:** P3. **Legado:** ABISMO-SND-001; ABISMO-BIO-001..010.
**Arquivos:** src/data/biomes.js; sistema de áudio quando existir. **Depende de:** NAR-103.
**Objetivo:** Associar bioma e boss a paisagem sonora distinta, sem tratar chave music como áudio funcional.

**Procedimento**
1. Catalogar chaves music já presentes em biomes.js.
2. Definir transições, loops, interrupção e fade de boss.
3. Estabelecer fallback em bioma sem faixa.
4. Validar mudança de sala/área e pausa.

**Critérios de aceite**
- [ ] Áudio não sobrepõe faixas duplicadas.
- [ ] Transições não continuam tocando música de bioma anterior.
- [ ] Documentar build, uso no jogo, decisão autoral e qualquer bloqueio.

---

### ABISMO-NAR-105 — Implementar ou auditar preferências persistidas de áudio

**Status:** A AUDITAR; não presumir que narrativa/áudio existam. **Prioridade:** P2. **Legado:** ABISMO-SND-001; ABISMO-HUD-001.
**Arquivos:** UI de preferências; IndexedDB/localStorage se arquitetura aprovar. **Depende de:** NAR-103; SYS-102.
**Objetivo:** Ajustar volume de música, SFX, master e mute, mantendo valores após reload.

**Procedimento**
1. Buscar menu/config de preferências existente.
2. Definir limites numéricos e fallback.
3. Testar persistência, troca de abas, device e ausência de áudio.
4. Manter volume coerente entre cenas.

**Critérios de aceite**
- [ ] Preferências permanecem após reload.
- [ ] Controle não altera volumes de forma inesperada.
- [ ] Documentar build, uso no jogo, decisão autoral e qualquer bloqueio.

---

### ABISMO-NAR-106 — Revisar HUD, inventário e feedback de estados

**Status:** A AUDITAR; não presumir que narrativa/áudio existam. **Prioridade:** P2. **Legado:** ABISMO-HUD-001; ABISMO-INV-001.
**Arquivos:** src/ui/{HUD,InventoryUI,BossBar}.js; src/entities/Player.js. **Depende de:** SYS-201, SYS-204, ART-109.
**Objetivo:** Deixar status, custo de XP, equipamento overlevel, condições e hazards legíveis em gameplay ASCII.

**Procedimento**
1. Auditar todas as barras e informações apresentadas.
2. Comparar valores de UI com estado real em combate, save e menus.
3. Testar overlays em boss/água/cristais e posições da câmera.
4. Corrigir problemas de legibilidade sem reescrever lógica.

**Critérios de aceite**
- [ ] Valores e telegraphs legíveis em tela de jogo.
- [ ] HUD não oculta ataques críticos nem afirma bônus falso.
- [ ] Documentar build, uso no jogo, decisão autoral e qualquer bloqueio.

---

### ABISMO-NAR-107 — Auditar pausa, opções e acessibilidade

**Status:** A AUDITAR; não presumir que narrativa/áudio existam. **Prioridade:** P2. **Legado:** ABISMO-HUD-001/002.
**Arquivos:** src/scenes/{GameScene,MainMenuScene}.js; src/ui/**. **Depende de:** NAR-106; SYS-202.
**Objetivo:** Garantir que pausas e menus não disparem ações involuntárias, com feedback e acessibilidade.

**Procedimento**
1. Testar pausa durante ataque, dodge e hazard.
2. Conferir foco de teclado e fechamento/retorno.
3. Planejar reduzir flashes, tremulação, shake e tamanhos de texto.
4. Não marcar suporte touch/gamepad sem teste específico.

**Critérios de aceite**
- [ ] Física e estado de combate não corrompidos durante pausa.
- [ ] Itens de acessibilidade implementados estão provados no navegador.
- [ ] Documentar build, uso no jogo, decisão autoral e qualquer bloqueio.

---

### ABISMO-NAR-108 — Especificar gamepad/toque e responsividade futura

**Status:** A AUDITAR; não presumir que narrativa/áudio existam. **Prioridade:** P3. **Legado:** ABISMO-HUD-002.
**Arquivos:** src/main.js; src/entities/Player.js; src/ui/**. **Depende de:** DEC-005; NAR-107.
**Objetivo:** Diferenciar o suporte efetivo atual de requisitos de input que ainda faltam.

**Procedimento**
1. Inventariar teclado/mouse/gamepad/touch no código.
2. Definir mapa de botões e estados com alternativa de navegação.
3. Verificar legibilidade de ASCII em resolução reduzida.
4. Implementar gradualmente mediante autorização de escopo.

**Critérios de aceite**
- [ ] Nenhum input padrão regrediu.
- [ ] Novos inputs, se implementados, passam por testes reais por dispositivo.
- [ ] Documentar build, uso no jogo, decisão autoral e qualquer bloqueio.
