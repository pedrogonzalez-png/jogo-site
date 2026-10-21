# Jogador e combate — tarefas do Abismo

> Conteúdo reorganizado do checklist de 2026-10-09. Status e evidências são históricos e **não foram revalidados** nesta reorganização.
> [Voltar ao checklist mestre](../TAREFAS_ABISMO.md) · [Índice da documentação](../README.md)

## SEÇÃO A — Jogador e combate

- [x] **ABISMO-PLY-001 — Movimentação base e corrida** `[P1]` `[x] Implementado e validado`
  - **Objetivo:** Movimento em oito direções e transição para corrida.
  - **Arquivos:** `Player.js`.
  - **Dependências:** Sistema de input.
  - **Critério de conclusão:** Jogador se move em 8-way fluidamente e o sprint consome estamina de forma correta.
  - **Evidência atual:** Testes comprovaram transição e consumo de stamina funcionando perfeitamente em `Player.js`.

- [x] **ABISMO-PLY-002 — Esquiva e invulnerabilidade** `[P1]` `[x] Implementado e validado`
  - **Objetivo:** Esquiva com iframes e consumo de stamina.
  - **Arquivos:** `Player.js`.
  - **Dependências:** `ABISMO-PLY-001`.
  - **Critério de conclusão:** iframes anulam dano durante a animação de rolagem.
  - **Evidência atual:** `isInvincible` ativado no estado `DODGE` cancela recebimento de hits via `CombatSystem`.

- [-] **ABISMO-PLY-003 — Ataques leves e pesados** `[P1]` `[-] Parcial`
  - **Objetivo:** Diferenciar ataques comuns de carregados/pesados (consumo, timming e dano).
  - **Arquivos:** `Player.js`, `CombatSystem.js`.
  - **Dependências:** Sistema de armas.
  - **Critério de conclusão:** Dano e stamina variam entre ataques leves e pesados de acordo com GDD.
  - **Evidência atual:** Combate existe com hits padronizados e engatilhos iniciais de charge, mas falta diferenciação absoluta na entrada do jogador.

- [ ] **ABISMO-PLY-004 — Combos e ataques durante esquiva** `[P2]` `[ ] Pendente`
  - **Objetivo:** Encadeamento de ataques fluidos e strikes no meio do rolamento.
  - **Arquivos:** `Player.js`.
  - **Dependências:** `ABISMO-PLY-003`.
  - **Critério de conclusão:** Janela de input permite combos contínuos e variação de animação.
  - **Evidência atual:** Pendente.

- [x] **ABISMO-PLY-005 — Bloqueio, quebra de guarda e parry** `[P1]` `[x] Implementado e validado`
  - **Objetivo:** Mecânicas de defesa ativa e aparar (parry) perfeitamente para anular dano e estontear adversário.
  - **Arquivos:** `CombatSystem.js`, `DamageSystem.js`.
  - **Dependências:** `Player.js`.
  - **Critério de conclusão:** Parry exato anula dano e causa stagger; defesa comum consome stamina e quebra guarda.
  - **Evidência atual:** Testes comprovaram o acionamento de `STATE.BLOCK` e `STATE.PARRY`, e o recuo em hits no escudo com quebra de guarda funcionando na ausência de Vigor.

- [ ] **ABISMO-PLY-006 — Contra-ataques após bloqueio** `[P2]` `[ ] Pendente`
  - **Objetivo:** Habilidade de desferir hit rápido (contra-golpe) logo após bloquear um ataque comum e absorver impacto.
  - **Arquivos:** `Player.js`.
  - **Dependências:** `ABISMO-PLY-005`.
  - **Critério de conclusão:** Input aceito em curtíssimo momento (janela de oportunidade) pós-defesa bem sucedida.
  - **Evidência atual:** Pendente.

- [x] **ABISMO-PLY-007 — Stagger, equilíbrio e crítico** `[P1]` `[x] Implementado e validado`
  - **Objetivo:** Dano de equilíbrio contínuo (Poise) que rompe a postura e permite dano maior.
  - **Arquivos:** `BalanceSystem.js`, `DamageSystem.js`.
  - **Dependências:** Nenhuma.
  - **Critério de conclusão:** Inimigos (e player) staggados entram em animação vulnerável e os multiplicadores críticos aplicam.
  - **Evidência atual:** Sistema de postura atuando. Barra de poise quebrando ativa `STATE.STAGGER` e tinturas.
