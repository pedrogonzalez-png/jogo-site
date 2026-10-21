# Inimigos e chefes — tarefas do Abismo

> Conteúdo reorganizado do checklist de 2026-10-09. Status e evidências são históricos e **não foram revalidados** nesta reorganização.
> [Voltar ao checklist mestre](../TAREFAS_ABISMO.md) · [Índice da documentação](../README.md)

## SEÇÃO L — Inimigos e chefes

- [ ] **ABISMO-ENM-001 — Pools de inimigos por bioma, elites e anomalias** `[P2]` `[ ] Pendente`
  - **Objetivo:** Adicionar os monstros base por bioma de acordo com o GDD. Diferenciar o padrão de magos/ranged para melee puro. Inserir elites com drops raros e anomalias de altíssimo nível spawnando randomicamente.
  - **Arquivos:** `enemies.js`, `Enemy.js`.
  - **Evidência atual:** Instanciamos o "Guerreiro Clássico" sem grandes variações, mas a engine o aceita bem.

- [~] **ABISMO-ENM-002 — Chefes base de biomas (Obrigatórios/Opcionais)** `[P1]` `[~] Implementado, mas não validado`
  - **Objetivo:** A cada fim de área central, o Boss do cenário desperta, acionando 2 fases por barra de vida (HP) e tendo sua hitbox/telegraph definidos em rotinas visíveis ao player.
  - **Arquivos:** `Boss.js`.
  - **Critério de conclusão:** 10 modelos fixos funcionando. Recompensas essenciais dropando e liberando passagem.
  - **Evidência atual:** A classe baseada em HP e triggers funcionou perfeitamente no Abismo Cristalino com os projéteis. Necessita balanço.

- [ ] **ABISMO-ENM-003 — Geração Modular de Chefes (Profundidade)** `[P2]` `[ ] Pendente`
  - **Objetivo:** Arquétipos mistos (Arma X com Elemento Y e Modificadores V). Exemplo: Boss Gigante Tóxico Rápido.
  - **Arquivos:** `Boss.js`.
  - **Critério de conclusão:** Geração determinística (seed based) compõe perigos absurdos não hardcodeds nos andares do endgame para renovação da experiência, garantindo loots épicos/únicos de recompensa escalonável.
  - **Evidência atual:** Classe permite mods (`_trySpecialAbility`), faltando integrador de atributos.
