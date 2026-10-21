# Marco 03 — combate, progressão, itens e salvamento

> Subtarefas de auditoria e refinamento do GDD existente; correspondência com IDs antigos explícita. Não contar em dobro. Segurança de XP e saves tem precedência sobre polimento.
> [Regras](../../01-projeto/REGRAS_DE_GAMEPLAY.md) · [Backlog](../BACKLOG_ANTIGRAVITY.md)

### ABISMO-SYS-201 — Garantir nove famílias de armas com comportamento distinto

**Prioridade:** P1. **Estado:** A AUDITAR; **ID legado:** ABISMO-WPN-001..008.
**Inspecionar:** src/data/weapons.js; src/equipment/WeaponSystem.js; src/entities/Player.js; src/combat/CombatSystem.js.
**Depende de:** QA-101, SYS-101.
**Objetivo:** Não basta ter dados: alcance, timing, stamina, hitbox, combo e efeitos precisam corresponder à família.

**Execução**
1. Inventariar as famílias realmente disponíveis e associar aos IDs legados.
2. Executar golpes leves/pesados e comparar área de ataque, velocidade e gasto.
3. Verificar ataques de arco e armas especiais sem inventar teleporte/projétil sem contrato.
4. Corrigir fallback universal apenas onde comprovado e com testes por arma.

**Aceite**
- [ ] Famílias funcionalmente distinguíveis, com critério de gameplay definido.
- [ ] Nenhuma regressão em parry, dodge ou dano de boss.
- [ ] Relatório com dados de teste, valores esperados/observados, commit e risco residual.

---

### ABISMO-SYS-202 — Auditar parry, esquiva, block counter e cancelamentos

**Prioridade:** P1. **Estado:** A AUDITAR; **ID legado:** ABISMO-PLY-002..005.
**Inspecionar:** src/entities/Player.js; src/combat/{ParrySystem,CombatSystem,StaminaSystem}.js.
**Depende de:** SYS-101.
**Objetivo:** Reproduzir timing de parry de 200ms, i-frames, guarda e transição de estados.

**Execução**
1. Extrair janelas e flags reais de estado.
2. Executar testes de limite da janela com inputs precisos.
3. Confrontar animações com janela lógica sem alterar física por estética.
4. Registrar cadeias permitidas/canceladas e reproduzir bugs.

**Aceite**
- [ ] Parry dentro/fora da janela reage coerentemente.
- [ ] Visual não concede dano, stamina ou i-frame extra.
- [ ] Relatório com dados de teste, valores esperados/observados, commit e risco residual.

---

### ABISMO-SYS-203 — Verificar fórmula de dano, crítico e escalonamento

**Prioridade:** P1. **Estado:** A AUDITAR; **ID legado:** ABISMO-PLY-007; ABISMO-PRG-003.
**Inspecionar:** src/combat/{DamageSystem,BalanceSystem}.js; src/data/balance.js.
**Depende de:** SYS-101.
**Objetivo:** Provar que dano, mitigação e poise obedecem ao design e escalam sem NaN.

**Execução**
1. Testar ataque zero, defesa 2,5×, crítico e níveis extremos.
2. Confirmar ordem dos multiplicadores em DamageSystem.
3. Conferir poise, stagger e resistências quando presentes.
4. Criar teste numérico com tabela de resultados.

**Aceite**
- [ ] Saídas numéricas explicáveis, sem dano negativo/NaN.
- [ ] Comportamento medido mantém leitura de combate.
- [ ] Relatório com dados de teste, valores esperados/observados, commit e risco residual.

---

### ABISMO-SYS-204 — Auditar stamina, carga de cura e status temporários

**Prioridade:** P1. **Estado:** A AUDITAR; **ID legado:** ABISMO-PLY-001/005; ABISMO-STA-001/002; ABISMO-HEL-001.
**Inspecionar:** src/entities/Player.js; src/combat/{StaminaSystem,StatusEffectSystem}.js.
**Depende de:** SYS-202, WLD-105.
**Objetivo:** Estado de stamina/status/poise consistentemente alterado e limpo em combate, pausa e transições.

**Execução**
1. Combinar sprint, dodge, bloco e hazard até limites de stamina.
2. Verificar custo da cura e interrupção durante ataque/dano.
3. Aplicar duas condições, mudar de sala e descansar.
4. Testar cooldown, persistência e tooltip de status.

**Aceite**
- [ ] Sem custo negativo, condição presa ou cura duplicada.
- [ ] Visual da HUD coincide com valores internos.
- [ ] Relatório com dados de teste, valores esperados/observados, commit e risco residual.

---

### ABISMO-SYS-205 — Verificar quatro slots e penalidade de arma acima do nível

**Prioridade:** P1. **Estado:** A AUDITAR; **ID legado:** ABISMO-ARM-001/002; ABISMO-WPN-009.
**Inspecionar:** src/equipment/{ArmorSystem,WeaponSystem,InventorySystem}.js; src/ui/InventoryUI.js.
**Depende de:** SYS-203.
**Objetivo:** Equipar armas overlevel deve ser permitido, mas exatamente duas peças precisam deixar de beneficiar, conforme GDD.

**Execução**
1. Inspecionar cálculo de requisito e seleção dos dois slots afetados.
2. Testar equipar, desequipar e trocar arma em vários níveis.
3. Conferir defesa real, peso e UI antes/depois.
4. Salvar/recarregar para evitar penalidade presa ou perdida.

**Aceite**
- [ ] Sem bloqueio obrigatório de equipamento; penalidade real e visível.
- [ ] Restauração correta ao voltar a arma normal.
- [ ] Relatório com dados de teste, valores esperados/observados, commit e risco residual.

---

### ABISMO-SYS-206 — Conferir unicidade real de loot por save

**Prioridade:** P1. **Estado:** A AUDITAR; **ID legado:** ABISMO-INV-002; ABISMO-CHA-001.
**Inspecionar:** src/equipment/{LootSystem,InventorySystem}.js; src/progression/AbyssChallengeSystem.js; src/save/SaveSystem.js.
**Depende de:** SYS-102.
**Objetivo:** O mesmo item com raridade Único não deve aparecer duas vezes no mesmo histórico do save.

**Execução**
1. Mapear o ID estável de item Único e histórico persistido.
2. Examinar uso atual de rewardId derivado de timestamp.
3. Testar boss repetido, recompensa +200 e reload.
4. Definir fallback para recompensa repetida sem inventar recurso novo.

**Aceite**
- [ ] Nenhuma duplicação do mesmo item único no mesmo save.
- [ ] Evento de combate e identidade do item são distintos.
- [ ] Relatório com dados de teste, valores esperados/observados, commit e risco residual.

---

### ABISMO-SYS-207 — Testar faixa +50/+100/+150/+200 e recompensa especial

**Prioridade:** P1. **Estado:** A AUDITAR; **ID legado:** ABISMO-CHA-001.
**Inspecionar:** src/progression/AbyssChallengeSystem.js; src/data/balance.js; src/equipment/LootSystem.js.
**Depende de:** SYS-206.
**Objetivo:** Bonificar diferença capturada no início do combate, aplicar apenas tier máximo e reconhecer recompensa especial indefinida.

**Execução**
1. Testar diffs 0/49/50/99/100/149/150/199/200/350.
2. Reproduzir level-up antes do kill e após início de combate.
3. Conferir pontos concedidos e categoria de item gerada.
4. Registrar lacuna de arma única/item único/recompensa especial quando não concretizada.

**Aceite**
- [ ] Sem soma incorreta de tiers, sem exploit de level-up.
- [ ] Itens raros/épicos/únicos previstos e status de implementação comprovados.
- [ ] Relatório com dados de teste, valores esperados/observados, commit e risco residual.

---

### ABISMO-SYS-208 — Testar morte, orbe de XP, checkpoints e saves

**Prioridade:** P1. **Estado:** A AUDITAR; **ID legado:** ABISMO-DTH-001/002; ABISMO-SAV-001.
**Inspecionar:** src/progression/XPSystem.js; src/save/SaveSystem.js; src/scenes/GameScene.js.
**Depende de:** SYS-102.
**Objetivo:** Proteger o fluxo morte → orbe → recuperação ou segunda morte → respawn e reload.

**Execução**
1. Morrer com XP, recuperar e conferir valores.
2. Morrer novamente antes de recuperar e confirmar descarte da primeira orbe.
3. Descansar em santuário e testar portal/transição.
4. Reabrir navegador em estados diferentes, sem clonar dados.

**Aceite**
- [ ] XP, orbe, checkpoint e stats mantêm consistência.
- [ ] Nenhum save corrompido e sem perda silenciosa em mudança de área.
- [ ] Relatório com dados de teste, valores esperados/observados, commit e risco residual.

---

### ABISMO-SYS-209 — Validar crafting/upgrades/consumíveis e economia de XP

**Prioridade:** P2. **Estado:** A AUDITAR; **ID legado:** ABISMO-ARM-002; ABISMO-HEL-002; ABISMO-INV-001.
**Inspecionar:** src/equipment/**; src/data/{items,weapons,armor,balance}.js; src/ui/InventoryUI.js.
**Depende de:** SYS-205, SYS-206.
**Objetivo:** Auditar upgrade até +20, restrições de raridade e consumíveis, sem moeda secundária ou durabilidade.

**Execução**
1. Conferir custos e limites realmente codificados.
2. Testar upgrade de arma/armadura em marcos e reload.
3. Impedir upgrade em Único ou conversão automática de raridade, conforme regra aprovada.
4. Testar consumíveis temporários e permanentes sem exploração de duplicação.

**Aceite**
- [ ] Custos e efeito exibidos batem com dados.
- [ ] Falhas e features ausentes explicitadas no checklist, sem simular conclusão.
- [ ] Relatório com dados de teste, valores esperados/observados, commit e risco residual.
