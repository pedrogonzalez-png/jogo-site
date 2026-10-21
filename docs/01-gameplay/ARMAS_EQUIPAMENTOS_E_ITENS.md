# Armas, armaduras, elementos e inventário — tarefas do Abismo

> Conteúdo reorganizado do checklist de 2026-10-09. Status e evidências são históricos e **não foram revalidados** nesta reorganização.
> [Voltar ao checklist mestre](../TAREFAS_ABISMO.md) · [Índice da documentação](../README.md)

## SEÇÃO C — Armas

*(Nota: As categorias requerem frames de animação, hitbox poligonal/circular, alcance, stamina cost e stagger associados ao design estipulado no GDD, individualizados).*

- [-] **ABISMO-WPN-001 — Adagas** `[P1]` `[-] Parcial` (Extrema vel., alcance baixo, crítico alto). Faltam mecânicas.
- [-] **ABISMO-WPN-002 — Espadas** `[P1]` `[-] Parcial` (Dano e speed médios). Faltam hitboxes.
- [-] **ABISMO-WPN-003 — Espadas pesadas** `[P1]` `[-] Parcial` (Alto poise damage, lentidão). Faltam hitboxes colossais.
- [-] **ABISMO-WPN-004 — Machados** `[P1]` `[-] Parcial` (Força, quebra fácil escudo). Pendente de hitbox arco-curta.
- [-] **ABISMO-WPN-005 — Martelos** `[P1]` `[-] Parcial` (Lentíssimo, dano de equilíbrio extremo). Pendente hitbox esférica na ponta.
- [-] **ABISMO-WPN-006 — Lanças** `[P1]` `[-] Parcial` (Alcance linear massivo / thrust). Pendente hitbox fina retangular longa.
- [-] **ABISMO-WPN-007 — Foices** `[P1]` `[-] Parcial` (Área cleave). Pendente hitbox em arco enorme.
- [-] **ABISMO-WPN-008 — Arcos** `[P1]` `[-] Parcial` (Range mágico/físico distanciado). Pendente ligar aos `_activeProjectiles`.
- [ ] **ABISMO-WPN-009 — Armas Especiais e Habilidades Ativas (Spells)** `[P2]` `[ ] Pendente`
  - **Objetivo:** Magias em armas Raras a Únicas que consomem estamina ou uso.
  - **Arquivos:** `WeaponSystem.js`, `GameScene.js`.
  - **Critério de conclusão:** Armas raras concedem habilidades acionáveis exclusivas, armas normais não.
  - **Evidência atual:** A habilidade (Skill Mágica MVP) era universalmente ativada pela tecla e não checava dinamicamente as permissões de rarity na pool de armas (habilidades ativas próprias).

---

## SEÇÃO D — Armaduras e aprimoramentos

- [x] **ABISMO-ARM-001 — Slots, status e penalidades de desnível** `[P2]` `[x] Implementado e validado`
  - **Objetivo:** 4 slots, 6 atributos permitidos; nenhuma penalidade de peso ou durabilidade; player perde bônus em 2 armaduras à escolha se segurar arma sem ter level apropriado.
  - **Arquivos:** `ArmorSystem.js`, `InventorySystem.js`.
  - **Dependências:** Sistema de Atributos.
  - **Critério de conclusão:** Todos os requisitos negativos (disable de slots pelo overlevel da arma) validados.
  - **Evidência atual:** Sistema integrado, logado nos feedbacks de inspeção anteriores. O peso inexiste de acordo com os pilares originais.

- [~] **ABISMO-ARM-002 — Aprimoramentos (+0 a +20) e Raridades** `[P2]` `[~] Implementado, mas não validado`
  - **Objetivo:** Forjas adicionam níveis, upgrades desbloqueiam atributos em mudanças de cor/tier; itens não viram Únicos em upgrades manuais.
  - **Arquivos:** `ArmorSystem.js`.
  - **Dependências:** Forja (UI).
  - **Critério de conclusão:** Modificadores escalam em progressão fixa. Únicos (Uniques) não caem na mesa de re-roll.
  - **Evidência atual:** Lógica e faixas presentes no `.js`, carente de interface unificada e debug in-game.

---

## SEÇÃO E — Elementos e status

- [x] **ABISMO-STA-001 — Buildups contínuos (Fogo, Gelo, Veneno, Sangramento, etc)** `[P1]` `[x] Implementado e validado`
  - **Objetivo:** A cada hit o inimigo/player ganha uma carga. No 100%, causa dano (Poison DoT) ou estouro (Bleed). Resistência reduz taxa.
  - **Arquivos:** `StatusEffectSystem.js`.
  - **Dependências:** `EnvironmentalHazards.js` ou Combat.
  - **Critério de conclusão:** Os medidores reagem, descem devagar e ativam adequadamente.
  - **Evidência atual:** Testes com ToxicPlant (Veneno) e ThermalEruption (Fogo) comprovaram operação sem bugs.

- [ ] **ABISMO-STA-002 — Imunidades e resistência crescente** `[P2]` `[ ] Pendente`
  - **Objetivo:** Cada vez que um inimigo sofre de um status, a próxima exigência aumenta (ex: 150%, 300%) e chefes têm imunidades a status instakill (Podridão profunda se houver).
  - **Arquivos:** `StatusEffectSystem.js`, `Boss.js`.
  - **Critério de conclusão:** Limites dinâmicos, impedindo cheese.
  - **Evidência atual:** A resistência funciona de forma linear básica ainda.

---

## SEÇÃO F — Inventário, loot e relíquias

- [x] **ABISMO-INV-001 — Bolsas, Categorias, Loot comum e Relíquias** `[P2]` `[x] Implementado e validado`
  - **Objetivo:** Múltiplas abas. Consumíveis, relíquias passivas e chaves separadas. Armazenamento infinito. Drops provindos de inimigos sem dinheiro (currency).
  - **Arquivos:** `InventorySystem.js`, `LootSystem.js`.
  - **Critério de conclusão:** Tabelas respeitam % e itens vão pra bag para equipar.
  - **Evidência atual:** Sistema robusto rodando em memória e serializado no salvamento. Relíquias funcionam como buffs ocultos lidos nos getteres.

- [ ] **ABISMO-INV-002 — Únicos não-repetíveis e tabelas de Chefes** `[P2]` `[ ] Pendente`
  - **Objetivo:** Equipamentos Raros a Épicos dependem das tables; Únicos são garantidos uma única vez por save e jamais dropam de novo. Drops de chefes garantem qualidade.
  - **Arquivos:** `LootSystem.js`, `SaveSystem.js`.
  - **Critério de conclusão:** Save arquiva `uniquesObtained: []` e proíbe drops idênticos na mesma jornada.
  - **Evidência atual:** O registro exato dos Unique Pools e Elites tables garantidas ainda não foi isolado em testes.
