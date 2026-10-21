# Progressão, desafio, morte e cura — tarefas do Abismo

> Conteúdo reorganizado do checklist de 2026-10-09. Status e evidências são históricos e **não foram revalidados** nesta reorganização.
> [Voltar ao checklist mestre](../TAREFAS_ABISMO.md) · [Índice da documentação](../README.md)

## SEÇÃO B — Atributos e progressão

- [x] **ABISMO-PRG-001 — Vigor, Força, Destreza, Resistência e Arcano** `[P1]` `[x] Implementado e validado`
  - **Objetivo:** Base de escalamento das classes do jogador com os 5 atributos exigidos no GDD.
  - **Arquivos:** `StatSystem.js`, `LevelSystem.js`.
  - **Dependências:** Nenhuma.
  - **Critério de conclusão:** Um ponto por nível alocável sem teto limitador, operando as soft-caps originais.
  - **Evidência atual:** Soft-caps e funções lineares de diminuição presentes no `StatSystem.js`.

- [x] **ABISMO-PRG-002 — Level-up manual, limites e XP acumulada** `[P1]` `[x] Implementado e validado`
  - **Objetivo:** Escolher onde gastar pontos nos santuários e manter a XP infinitamente guardada. Sem bloqueio ou max-level fixo.
  - **Arquivos:** `LevelSystem.js`, `GameScene.js`.
  - **Dependências:** Santuário interativo.
  - **Critério de conclusão:** A XP sobe com farming e a tabela permite que os atributos subam eternamente (crescimento no abismo). Nível do jogador desvinculado dos inimigos locais.
  - **Evidência atual:** Santuários possuem interface UI operante para gastos. A desvinculação ocorre (inimigos usam a *profundidade* para nível, não o nível do jogador).

- [-] **ABISMO-PRG-003 — Escalamento de armas e níveis extremos** `[P2]` `[-] Parcial`
  - **Objetivo:** Armas se beneficiam de letras (S,A,B,C,D,E) em atributos. Testes nos níveis colossais.
  - **Arquivos:** `WeaponSystem.js`.
  - **Dependências:** Atributos.
  - **Critério de conclusão:** Dano base da arma + (Bônus de Escalamento de Destreza ou Força, etc).
  - **Evidência atual:** As propriedades literais existem no construtor de armas e somam ao Attack Power, porém o balanceamento no Late Game com stats 99+ carece de testes estressados.

---

## SEÇÃO G — Desafio de Abismo

- [~] **ABISMO-CHA-001 — Multiplicadores de Recompensa nos Níveis (+50 a +200)** `[P2]` `[~] Implementado, mas não validado`
  - **Objetivo:** Sistema que captura a vida e nível da entidade no primeiro hit. Se a diferença de gap for de 50 (5pt), 100 (10pt, item raro), 150 (20pt, épico) e limite 200 (30pt e único especial), concede bônus brutal ao derrotá-lo.
  - **Arquivos:** `AbyssChallengeSystem.js`.
  - **Critério de conclusão:** Prevenção de manipulação durante o embate. Limite restrito a +200 (não melhora recompensas em +400).
  - **Evidência atual:** Classe implementada e ativada no `GameScene.js` (on attack). Exige playtest com níveis absurdos gerados na Fenda de progressão do Endgame (Profundidade >200).

---

## SEÇÃO H — Morte e santuários

- [x] **ABISMO-DTH-001 — XP e Morte (Perda total / Orbe)** `[P1]` `[x] Implementado e validado`
  - **Objetivo:** Morrer reseta player ao checkpoint e apaga a XP estocada na bag, deixando um sinalizador.
  - **Arquivos:** `XPSystem.js`, `GameScene.js`.
  - **Critério de conclusão:** Morte com o orbe já ativo, ou em outra sala, o apaga e atualiza o local no novo percurso fatal.
  - **Evidência atual:** Testes comprovaram transição. XP volta integral se orbe for tocado.

- [x] **ABISMO-DTH-002 — Respawn em Santuários, Cura, Levels e Mobs** `[P1]` `[x] Implementado e validado`
  - **Objetivo:** Retorno integral; monstros lixos (comuns) reaparecem, mas Chefões (Main bosses) mortos ficam mortos na run. Autosave em toda meditação. Fast-travel entre descobertos.
  - **Arquivos:** `GameScene.js`, `SaveSystem.js`.
  - **Critério de conclusão:** Hub central funcional.
  - **Evidência atual:** Lógicas de `cleared = false` para os spawners rodaram lindamente, mas Boss mantêm `cleared = true`. Save é persistente.

---

## SEÇÃO I — Cura e consumíveis

- [x] **ABISMO-HEL-001 — Cargas de Cura (Frascos)** `[P1]` `[x] Implementado e validado`
  - **Objetivo:** 3 cargas iniciais ao jogador. Usa no combate para curar instantâneo ou regen rápido. Restaura as cargas nos santuários.
  - **Arquivos:** `Player.js`.
  - **Critério de conclusão:** Recargas operantes. Consumo imediato.
  - **Evidência atual:** A variável `healCharges` e o input funcionam e são atualizados no checkpoint.

- [ ] **ABISMO-HEL-002 — Upgrades permanentes e Materiais Consumíveis** `[P2]` `[ ] Pendente`
  - **Objetivo:** Expandir as 3 poções (até X) e sua potência por meio de itens secretos da fenda; Uso de poções de resinas (gelo/fogo) pelo inventário rápido.
  - **Arquivos:** `InventorySystem.js`.
  - **Evidência atual:** Lógica de potências pendente. Sem consumíveis elementais programados até agora.
