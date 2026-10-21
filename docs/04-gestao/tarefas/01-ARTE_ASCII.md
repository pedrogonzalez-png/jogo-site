# Marco 01 — arte ASCII e animações de alta densidade

> **Origem:** referência visual do cavaleiro fornecida pelo usuário; [direção artística detalhada](../../03-conteudo/DIRECAO_ARTISTICA_ASCII.md). Todas as 10 são **subtarefas de auditoria/integração**, não declaração de que algo está ausente.
> [Voltar ao backlog](../BACKLOG_ANTIGRAVITY.md)

**Critério do marco:** textura gerada ≠ arte validada. Precisamos de legibilidade, poses genuínas, pipeline estável, compatibilidade física e benchmark.

### ABISMO-ART-101 — Inventariar assets ASCII efetivamente registrados e exibidos

**Status:** A AUDITAR. **Prioridade:** P1. **Relacionado:** ABISMO-GFX-001.

**Arquivos de partida:** src/ascii/{KnightArt,EnemyArt,BossArt,EnvironmentArt,LiquidsAndVFXArt,AsciiPalette,AsciiRenderer,TextureBootManager}.js; src/scenes/{BootScene,GameScene}.js; entidades.
**Dependências:** QA-101.
**Objetivo:** Catalogar cada chave de textura com origem, número de quadros, dimensões e consumidor real; separar asset definido de asset renderizado.

**Procedimento**
1. Listar todas as chamadas de registro de textura.
2. Cruzar chaves com setTexture, play e criação de sprites.
3. Identificar fallback, textura não utilizada e dimensão inesperada.
4. Criar mapa asset→key→bioma/entidade/ação.

**Aceite e evidência**
- [ ] Mapa de todas as texturas da biblioteca atual, com lacunas explícitas.
- [ ] Nenhuma duplicata ou incompatibilidade de chave omitida.
- [ ] Anexar teste visual no gameplay, build/status, versão e data; marcar não executado quando for o caso.

---

### ABISMO-ART-102 — Auditar cavaleiro de referência, escala e física

**Status:** A AUDITAR. **Prioridade:** P1. **Relacionado:** ABISMO-GFX-001; ABISMO-PLY-001/003/005.

**Arquivos de partida:** src/ascii/{KnightArt,TextureBootManager,AsciiRenderer}.js; src/entities/Player.js.
**Dependências:** ART-101; QA-102.
**Objetivo:** Conservar a qualidade volumétrica do cavaleiro de referência enquanto idle/walk/attack/block mantêm escala, origem e hitbox corretas.

**Procedimento**
1. Inspecionar art master e RLE sem substituir a referência.
2. Comparar grade fonte 200×100 de idle/walk contra quadros menores.
3. Capturar alternância entre poses no jogo e depurar sprite/body.
4. Ajustar apenas pipeline de escala/offset se teste comprovar discrepância.

**Aceite e evidência**
- [ ] Elmo, braços, mãos, arma, pernas e manto visíveis na escala de gameplay.
- [ ] Nenhum salto de tamanho/origem nem mudança física involuntária.
- [ ] Anexar teste visual no gameplay, build/status, versão e data; marcar não executado quando for o caso.

---

### ABISMO-ART-103 — Produzir frames genuínos de caminhada e idle

**Status:** A AUDITAR. **Prioridade:** P2. **Relacionado:** ABISMO-GFX-001; ABISMO-PLY-001.

**Arquivos de partida:** src/ascii/KnightArt.js; src/ascii/TextureBootManager.js.
**Dependências:** ART-102; referência visual fornecida.
**Objetivo:** Corrigir poses repetidas e garantir animação perceptível com a mesma identidade visual e resolução.

**Procedimento**
1. Confirmar duplicação de walk_1 e quadros de idle no código.
2. Definir grade, ponto de ancoragem e partes estáveis do cavaleiro.
3. Criar/reutilizar novos quadros de perna, braço e manto sem apenas trocar cores.
4. Atualizar registro de frames se necessário e testar reprodução.

**Aceite e evidência**
- [ ] Walk_0 e walk_1 são poses visivelmente distintas e coerentes.
- [ ] Animação sem tremulação de toda a grade e FPS mantido.
- [ ] Anexar teste visual no gameplay, build/status, versão e data; marcar não executado quando for o caso.

---

### ABISMO-ART-104 — Ampliar animações de ataque, bloqueio, parry e dodge

**Status:** A AUDITAR. **Prioridade:** P2. **Relacionado:** ABISMO-GFX-001; ABISMO-PLY-002/003/005.

**Arquivos de partida:** src/ascii/KnightArt.js; src/ascii/TextureBootManager.js; src/entities/Player.js.
**Dependências:** ART-102, ART-103, regras COMB-01.
**Objetivo:** Representar movimento com anatomia e arma conectada à mão, sem alterar janelas de dano, esquiva ou parry.

**Procedimento**
1. Mapear todos os estados lógicos já existentes em Player.js.
2. Desenhar frames para estados sem visual próprio, priorizando ações usadas.
3. Alinhar espadas/escudo/mãos ao eixo de ação.
4. Manter o evento lógico de ataque e janelas de invulnerabilidade intocados.

**Aceite e evidência**
- [ ] Ataque, defesa, parry e esquiva possuem leitura distinta no jogo.
- [ ] Nenhuma alteração de dano, stamina, hitbox ou i-frames não solicitada.
- [ ] Anexar teste visual no gameplay, build/status, versão e data; marcar não executado quando for o caso.

---

### ABISMO-ART-105 — Integrar ilustrações únicas de inimigos ao gameplay

**Status:** A AUDITAR. **Prioridade:** P2. **Relacionado:** ABISMO-ENM-001; ABISMO-GFX-001.

**Arquivos de partida:** src/ascii/EnemyArt.js; src/ascii/TextureBootManager.js; src/entities/Enemy.js; src/data/enemies.js.
**Dependências:** ART-101, WLD-103.
**Objetivo:** Garantir que cada arquétipo/pool encontre textura detalhada compatível, e não fallback repetido.

**Procedimento**
1. Relacionar templates inimigos aos seis ou mais arquétipos desenhados.
2. Verificar como Enemy escolhe textura e o que ocorre para IDs sem sprite.
3. Propor textura/variante para os que faltam, com anatomia própria.
4. Testar visual em situações de combate e vários biomas.

**Aceite e evidência**
- [ ] Inimigos diferenciáveis por silhueta e ataque.
- [ ] Nenhum template quebra por ausência de textura; fallbacks documentados.
- [ ] Anexar teste visual no gameplay, build/status, versão e data; marcar não executado quando for o caso.

---

### ABISMO-ART-106 — Verificar identidade visual e duas fases dos dez chefes

**Status:** A AUDITAR. **Prioridade:** P2. **Relacionado:** ABISMO-ENM-002/003; ABISMO-GFX-001.

**Arquivos de partida:** src/ascii/BossArt.js; src/ascii/TextureBootManager.js; src/entities/Boss.js; src/data/enemies.js.
**Dependências:** ART-101, WLD-104.
**Objetivo:** Validar que todos os bosses usam arte própria, fases e transições com leitura clara.

**Procedimento**
1. Cruzar os dez bossPool com BOSS_TEMPLATES e BOSS_ART.
2. Inspecionar se a textura phase2 realmente aparece quando a fase muda.
3. Conferir escala, clipping, bossbar, telegraph e feedback.
4. Corrigir apenas lacunas verificadas, sem alterar balanceamento sem tarefa.

**Aceite e evidência**
- [ ] Dez IDs de boss mapeados a sprites e cenas reais.
- [ ] Fase 2 visivelmente distinta ou pendência explicitada com prova.
- [ ] Anexar teste visual no gameplay, build/status, versão e data; marcar não executado quando for o caso.

---

### ABISMO-ART-107 — Aprimorar água, sangue e magma animados

**Status:** A AUDITAR. **Prioridade:** P2. **Relacionado:** ABISMO-BIO-001..010; ABISMO-GFX-001.

**Arquivos de partida:** src/ascii/LiquidsAndVFXArt.js; src/ascii/TextureBootManager.js; src/scenes/GameScene.js.
**Dependências:** ART-101; guia de biomas.
**Objetivo:** Assegurar gradiente ASCII, reflexos, espuma e fluxo sem cair em repetições minimalistas.

**Procedimento**
1. Localizar os quatro quadros de água e registros de blood/magma.
2. Verificar quais texturas são usadas nos tiles/hazards reais.
3. Inspecionar animação, transparência, margens e continuidade entre tiles.
4. Implementar variantes apenas após registrar a lacuna e medir custo.

**Aceite e evidência**
- [ ] Água possui deslocamento coerente e não apenas linhas ~.
- [ ] Sangue e magma distinguíveis, hazard legível e memória estável.
- [ ] Anexar teste visual no gameplay, build/status, versão e data; marcar não executado quando for o caso.

---

### ABISMO-ART-108 — Modularizar blocos, pisos, portas e objetos detalhados

**Status:** A AUDITAR. **Prioridade:** P2. **Relacionado:** ABISMO-GFX-001; ABISMO-WLD-001.

**Arquivos de partida:** src/ascii/EnvironmentArt.js; src/ascii/TextureBootManager.js; src/world/RoomGenerator.js.
**Dependências:** ART-101; WLD-101.
**Objetivo:** Usar tijolos, juntas, rachaduras, pilares, portas, santuários e baús com conexões sem costura.

**Procedimento**
1. Inventariar variantes e regras de escolha por tile.
2. Renderizar mosaicos 3×3 e 5×5.
3. Verificar se decoração coincide com colisão e conectividade de portas.
4. Adicionar variantes visualmente consistentes, preservando keys e hitboxes.

**Aceite e evidência**
- [ ] Paredes e pisos não apresentam padrão único repetitivo óbvio.
- [ ] Sem lacunas nas bordas nem portas visualmente bloqueadas.
- [ ] Anexar teste visual no gameplay, build/status, versão e data; marcar não executado quando for o caso.

---

### ABISMO-ART-109 — Definir materiais e texturas próprias por bioma

**Status:** A AUDITAR. **Prioridade:** P2. **Relacionado:** ABISMO-BIO-001..010; ABISMO-GFX-001.

**Arquivos de partida:** src/ascii/AsciiPalette.js; src/ascii/EnvironmentArt.js; src/data/biomes.js.
**Dependências:** ART-107, ART-108.
**Objetivo:** Cada bioma tem identidade por densidade de glifos, material e arquitetura, não apenas recoloração.

**Procedimento**
1. Comparar paletas existentes e material resolvers.
2. Catalogar piso, parede, perigo e estruturas de cada bioma.
3. Priorizar diferenças estruturais de cinzas, água, ferro, sangue, vegetação, cristais, livros e vazio.
4. Validar contraste de hazard e legibilidade do player em todas as paletas.

**Aceite e evidência**
- [ ] Dez biomas distinguíveis em capturas sem legenda por combinações de textura e estrutura.
- [ ] Textura específica não impede efeitos de tint necessários ao jogo.
- [ ] Anexar teste visual no gameplay, build/status, versão e data; marcar não executado quando for o caso.

---

### ABISMO-ART-110 — Otimizar pré-renderização ASCII e orçamento de memória

**Status:** A AUDITAR. **Prioridade:** P1. **Relacionado:** ABISMO-GFX-001; qualidade transversal.

**Arquivos de partida:** src/ascii/AsciiRenderer.js; src/ascii/TextureBootManager.js; src/scenes/BootScene.js.
**Dependências:** ART-101, QA-102.
**Objetivo:** Evitar stalls de boot, textura gigante, uso excessivo de canvas e quedas severas de FPS.

**Procedimento**
1. Medir número/dimensões de texturas e criação em BootScene.
2. Conferir custo da referência mestre de alta resolução e RLE.
3. Auditar caches, variantes redundantes, lifecycle e fallback WebGL.
4. Otimizar com benchmark e comparação visual objetiva.

**Aceite e evidência**
- [ ] Sem regressão de qualidade visível na mesma escala.
- [ ] Tempo de boot, FPS e memória antes/depois documentados.
- [ ] Anexar teste visual no gameplay, build/status, versão e data; marcar não executado quando for o caso.
