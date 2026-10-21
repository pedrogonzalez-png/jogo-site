# Marco 00 — fundação, auditoria e baseline

> **Natureza:** subtarefas operacionais complementares ao checklist histórico, propostas em 2026-10-21. **Não adicionar essas 7 subtarefas aos 55 legados sem reconciliação.**
> [Índice do backlog](../BACKLOG_ANTIGRAVITY.md) · [Guia obrigatório](../../ANTIGRAVITY_LEIA_PRIMEIRO.md)

**Meta:** saber com precisão o que já existe antes de alterar código. Executar primeiro as verificações críticas.

### ABISMO-DOC-101 — Reconciliar os 55 estados do checklist legado

- **Status inicial:** A AUDITAR (tarefa de execução; não presume falha atual).
- **Prioridade:** P1. **Relação com legados:** todas as 55 tarefas; não criar versões duplicadas.
- **Arquivos para inspecionar:** docs/TAREFAS_ABISMO.md; src/**; documentos de cada domínio.
- **Dependências:** Acesso ao repositório e matriz de testes.
- **Objetivo:** Produzir um inventário honesto de estados atuais sem mudar status por intuição.

**Passo a passo no Antigravity**
1. Enumerar 55 IDs e a evidência histórica registrada.
2. Mapear cada ID a arquivo, função, consumidor e teste.
3. Classificar: implementado comprovado em código, não implementado, conflito documental, bloqueado, ou exige jogo real.
4. Atualizar status somente com evidência suficiente; preservar histórico e justificar transições.
5. Atualizar contadores e data após conferir todos os IDs.

**Critérios de aceite**
- [ ] 55/55 IDs rastreados, sem remoção ou duplicação.
- [ ] Cada mudança de status aponta arquivo/commit/teste datado.
- [ ] Números do painel recalculados a partir de estados individuais, não copiados do relatório antigo.

**Evidência para fechamento:** arquivos e funções consultadas, commits, execução de testes, resultado real, limitações e data.

---

### ABISMO-DOC-102 — Integrar auditoria histórica e corrigir divergências

- **Status inicial:** A AUDITAR (tarefa de execução; não presume falha atual).
- **Prioridade:** P1. **Relação com legados:** auditoria de 09/10; ABISMO-ENM-001/002; ABISMO-GFX-001; ABISMO-DTH-002.
- **Arquivos para inspecionar:** docs/auditoria_abismo.md; docs/05-historico/**; docs/04-gestao/REGISTRO_DE_DIVERGENCIAS.md.
- **Dependências:** DOC-101 parcialmente executada; código atual legível.
- **Objetivo:** Impedir que problemas antigos já resolvidos sejam reaplicados.

**Passo a passo no Antigravity**
1. Conferir se pools/chefes/santuário/arte ASCII atuais realmente funcionam.
2. Para cada DIV, registrar presença de código, teste e comportamento verificado.
3. Atualizar guia de agentes com qualquer mudança que afete próximos passos.
4. Manter auditoria original íntegra; não eliminar histórico.

**Critérios de aceite**
- [ ] Nenhum defeito histórico é tratado como pendente sem verificação atual.
- [ ] Relatório novo diferencia código, teste de browser e afirmação histórica.
- [ ] Links de navegação e documentos arquivados continuam acessíveis.

**Evidência para fechamento:** arquivos e funções consultadas, commits, execução de testes, resultado real, limitações e data.

---

### ABISMO-DOC-103 — Localizar e importar o GDD integral de 49 seções

- **Status inicial:** A AUDITAR (tarefa de execução; não presume falha atual).
- **Prioridade:** P2. **Relação com legados:** Matriz de rastreabilidade do GDD; todas as áreas.
- **Arquivos para inspecionar:** docs/01-projeto/VISAO_CANONICA_E_GDD.md; docs/04-gestao/RASTREABILIDADE_GDD.md; arquivo original quando disponível.
- **Dependências:** GDD completo fornecido/recuperável.
- **Objetivo:** Ter a redação integral do design com versão, fonte e registro de diferenças.

**Passo a passo no Antigravity**
1. Identificar a versão fonte do GDD completo.
2. Preservá-la sem resumir nem substituir indevidamente.
3. Construir comparação item a item com matriz de 49 tópicos e regras consolidadas.
4. Criar decisões pendentes quando existir conflito real.

**Critérios de aceite**
- [ ] Fonte original datada e preservada; nenhuma seção descartada.
- [ ] Tabela mostra seção, tarefa legado, requisito e divergência.
- [ ] Sem inferir requisitos ausentes como se fossem decisões do usuário.

**Evidência para fechamento:** arquivos e funções consultadas, commits, execução de testes, resultado real, limitações e data.

---

### ABISMO-SYS-101 — Mapear contratos entre módulos críticos

- **Status inicial:** A AUDITAR (tarefa de execução; não presume falha atual).
- **Prioridade:** P1. **Relação com legados:** ABISMO-MVP-001, ABISMO-SAV-001, sistemas do checklist.
- **Arquivos para inspecionar:** src/scenes/**; src/entities/**; src/combat/**; src/equipment/**; src/save/**.
- **Dependências:** DOC-101.
- **Objetivo:** Criar mapa prático de exports, eventos, chaves e dados de save que não podem quebrar.

**Passo a passo no Antigravity**
1. Listar imports/exports e eventos entre GameScene, Player, Enemy, Boss e sistemas.
2. Identificar contratos de textura, animação, dados de itens/biomas e serializer.
3. Registrar invariantes da seed, lifecycle e limpeza de eventos.
4. Documentar regiões de alto risco e dependências cruzadas.

**Critérios de aceite**
- [ ] Módulos críticos possuem consumidores descritos.
- [ ] Agente consegue modificar um componente sem quebrar eventos/exports não previstos.
- [ ] Contratos frágeis têm teste de regressão associado.

**Evidência para fechamento:** arquivos e funções consultadas, commits, execução de testes, resultado real, limitações e data.

---

### ABISMO-SYS-102 — Auditar persistência e preparar migrações de save

- **Status inicial:** A AUDITAR (tarefa de execução; não presume falha atual).
- **Prioridade:** P1. **Relação com legados:** ABISMO-SAV-001, ABISMO-INV-002.
- **Arquivos para inspecionar:** src/save/SaveSystem.js; src/equipment/InventorySystem.js; src/progression/**.
- **Dependências:** SYS-101.
- **Objetivo:** Garantir compatibilidade de saves, XP, itens únicos e dados futuros sem apagar progresso.

**Passo a passo no Antigravity**
1. Catalogar DB_NAME, versão, object store, chaves e schema persistido.
2. Criar cenários old-save → new-save, interrupção, corrupção parcial e dois slots.
3. Definir procedimento de versionamento antes de acrescentar campos de replay/arte/inventário.
4. Confirmar unicidade de loot após reload.

**Critérios de aceite**
- [ ] Fluxos salvar/carregar/voltar/salvar sem duplicar progresso.
- [ ] Mudança de schema possui fallback/migração ou é declarada incompatível.
- [ ] Nenhum save é apagado no processo de diagnóstico.

**Evidência para fechamento:** arquivos e funções consultadas, commits, execução de testes, resultado real, limitações e data.

---

### ABISMO-QA-101 — Estabelecer baseline reproduzível do jogo

- **Status inicial:** A AUDITAR (tarefa de execução; não presume falha atual).
- **Prioridade:** P1. **Relação com legados:** ABISMO-MVP-001; checklist geral.
- **Arquivos para inspecionar:** package.json, package-lock.json, src/main.js, src/scenes/**.
- **Dependências:** Dependências instaláveis no filesystem escolhido.
- **Objetivo:** Criar evidência técnica de referência para comparar alterações futuras.

**Passo a passo no Antigravity**
1. Registrar Node/npm, OS, navegador, renderer e GPU.
2. Executar npm ci quando o filesystem permitir, npm run build e npm run dev.
3. Testar abrir menu, iniciar save, mover, atacar, mudar de sala e retornar.
4. Capturar erros de console e distinguir warnings conhecidos de falhas.
5. Registrar seed e versão para regressão.

**Critérios de aceite**
- [ ] Relatório contém resultados reais de build e smoke test.
- [ ] Falhas e impossibilidades não são registradas como sucesso.
- [ ] Baseline disponível para próximo agente.

**Evidência para fechamento:** arquivos e funções consultadas, commits, execução de testes, resultado real, limitações e data.

---

### ABISMO-QA-102 — Definir triagem e política de regressão visual

- **Status inicial:** A AUDITAR (tarefa de execução; não presume falha atual).
- **Prioridade:** P2. **Relação com legados:** ABISMO-GFX-001; ABISMO-HUD-001; ABISMO-ENM-002.
- **Arquivos para inspecionar:** src/ascii/**; src/scenes/BootScene.js; docs/04-gestao/PLANO_DE_VALIDACAO.md.
- **Dependências:** QA-101, inventário de artes ART-101.
- **Objetivo:** Medir qualidade ASCII e performance antes de alterar milhares de células.

**Passo a passo no Antigravity**
1. Criar screenshots padronizadas idle/walk/attack/block e tilemap, sempre na mesma resolução.
2. Registrar tempo de boot, FPS e consumo de memória aproximado.
3. Definir casos de zoom/escala e leitura de silhueta nas telas do jogo.
4. Manter comparativo antes/depois com versão dos assets.

**Critérios de aceite**
- [ ] Matriz de teste visual criada e aplicada a um baseline.
- [ ] Problemas de escala, hitbox e textura podem ser reproduzidos.
- [ ] Nenhum veredito de qualidade com base apenas na compilação.

**Evidência para fechamento:** arquivos e funções consultadas, commits, execução de testes, resultado real, limitações e data.
