# Marco 04 — fantasmas, ghost replay e rankings assíncronos

> **FUTURO (P4), não em execução nesta etapa.** Não projetar multiplayer em tempo real. Leia [especificação de fantasmas](../../03-conteudo/FANTASMAS_ASSINCRONOS.md) antes de criar arquivos.
> **Observação sobre ID legado:** a seção R do checklist histórico cobre recursos assíncronos; conferir o ID exato antes de associar formalmente. IDs GHO são subtarefas propostas.
> [Voltar ao backlog](../BACKLOG_ANTIGRAVITY.md)

### ABISMO-GHO-101 — Definir formato versionado e invariantes de replay

- **Status:** PROPOSTA FUTURA; não implementado nem testado por esta documentação.
- **Prioridade:** P4. **Referência:** ABISMO-ASY-001 se existir no legado; seção R (recursos futuros).
- **Arquivos/sistemas:** docs/03-conteudo/FANTASMAS_ASSINCRONOS.md; src/world/SeedSystem.js; src/save/SaveSystem.js. **Dependências:** DEC-007; SYS-101.
- **Objetivo:** Especificar seed/versão/tempo/salas/snapshots ou inputs sem escolher backend prematuramente.

**Plano de trabalho**
1. Comparar replay por inputs e snapshots posicionais com riscos de determinismo.
2. Definir schema, limites de payload e taxas de amostragem.
3. Definir compatibilidade de versões e regra de replay inválido.
4. Garantir separação total entre fantasma e física/combat do jogador.

**Aceite**
- [ ] Contrato de dados versionado, com casos válidos/inválidos documentados.
- [ ] Modo offline não exige servidor nem credencial.
- [ ] Evidência de versão/seed/replay, teste e impacto de performance registrados.

---

### ABISMO-GHO-102 — Prototipar gravação de run local e opcional

- **Status:** PROPOSTA FUTURA; não implementado nem testado por esta documentação.
- **Prioridade:** P4. **Referência:** Seção R; funcionalidade futura.
- **Arquivos/sistemas:** módulo novo apenas após desenho aprovado; src/scenes/GameScene.js; src/save/SaveSystem.js. **Dependências:** GHO-101; SYS-102.
- **Objetivo:** Capturar eventos/snapshots essenciais sem gravar cada frame bruto desnecessariamente.

**Plano de trabalho**
1. Medir impacto de gravação em FPS/memória.
2. Registrar trechos por sala, relógio relativo e eventos relevantes.
3. Salvar localmente em área separada do save de campanha.
4. Adicionar opt-in/opt-out e limites.

**Aceite**
- [ ] Run reinicia e se recupera sem afetar campanha.
- [ ] Limites de armazenamento e corrupção tratados.
- [ ] Evidência de versão/seed/replay, teste e impacto de performance registrados.

---

### ABISMO-GHO-103 — Reproduzir fantasma visual não interativo

- **Status:** PROPOSTA FUTURA; não implementado nem testado por esta documentação.
- **Prioridade:** P4. **Referência:** Seção R; funcionalidade futura.
- **Arquivos/sistemas:** sistema de replay dedicado; cena de teste; assets ASCII. **Dependências:** GHO-102; ART-102.
- **Objetivo:** Desenhar sombra/ghost na posição e pose correspondente sem colisão nem dano.

**Plano de trabalho**
1. Ler payload sem executar input do player real.
2. Interpolar posições/poses e lidar com pausa/troca de sala.
3. Inibir qualquer chamada de combate, loot, XP ou física.
4. Criar controles de opacidade e ocultar.

**Aceite**
- [ ] Replay sincronizado com dados gravados.
- [ ] Nenhuma mudança no estado do mundo, colisões ou save principal.
- [ ] Evidência de versão/seed/replay, teste e impacto de performance registrados.

---

### ABISMO-GHO-104 — Criar comparação com a própria tentativa anterior

- **Status:** PROPOSTA FUTURA; não implementado nem testado por esta documentação.
- **Prioridade:** P4. **Referência:** Seção R.
- **Arquivos/sistemas:** UI de seleção/resultado, armazenamento de runs. **Dependências:** GHO-103.
- **Objetivo:** Permitir competir contra si mesmo usando seed e regras comparáveis.

**Plano de trabalho**
1. Definir critérios de compatibilidade por versão, seed e dificuldade.
2. Exibir ghost anterior e tempos/profundidade sem ranking externo.
3. Diferenciar comparações válidas de corridas incompatíveis.
4. Permitir apagar replay sem apagar campanha.

**Aceite**
- [ ] Comparação honesta e offline.
- [ ] Sem confundir fantasma com inimigo ou outro jogador conectado.
- [ ] Evidência de versão/seed/replay, teste e impacto de performance registrados.

---

### ABISMO-GHO-105 — Testar replays longos, pausar, migrar e reabrir

- **Status:** PROPOSTA FUTURA; não implementado nem testado por esta documentação.
- **Prioridade:** P4. **Referência:** Seção R.
- **Arquivos/sistemas:** Replay storage; plano de QA; módulos de navegação. **Dependências:** GHO-103, GHO-104.
- **Objetivo:** Provar estabilidade de run longa, troca de versão e ausência de vazamento.

**Plano de trabalho**
1. Testar longa duração e múltiplas transições de sala.
2. Corromper payload de teste e validar fallback seguro.
3. Alterar versão e confirmar recusa ou migração explícita.
4. Medir memória e limpeza de entidades fantasma.

**Aceite**
- [ ] Replay danificado não quebra o jogo.
- [ ] Metragens grandes permanecem em limite testado.
- [ ] Evidência de versão/seed/replay, teste e impacto de performance registrados.

---

### ABISMO-GHO-106 — Planejar publicação e ranking global assíncrono

- **Status:** PROPOSTA FUTURA; não implementado nem testado por esta documentação.
- **Prioridade:** P4. **Referência:** Seção R.
- **Arquivos/sistemas:** Documento de API futura; sem backend obrigatório nesta etapa. **Dependências:** DEC-008; GHO-105.
- **Objetivo:** Definir seleção de replays públicos, validação, privacidade e scoreboards sem realtime.

**Plano de trabalho**
1. Especificar opt-in, exclusão, consentimento e limites de dados.
2. Descrever API conceitual, autenticação e cache sem secrets no client.
3. Definir critérios de versão/seed/dificuldade e mitigação de fraude.
4. Submeter proposta à aprovação antes de implementar backend.

**Aceite**
- [ ] Documento de arquitetura/regras pronto para aprovação.
- [ ] Nenhuma integração externa ou multiplayer online presumidos.
- [ ] Evidência de versão/seed/replay, teste e impacto de performance registrados.
