# Interface, audiovisual e salvamento — Abismo

> Material do checklist de 2026-10-09. Status registrados originalmente; não revalidados nesta edição.
> [Checklist mestre](../TAREFAS_ABISMO.md) · [Índice geral](../README.md)

## SEÇÃO O — Interface e apresentação

- [-] **ABISMO-HUD-001 — Layout Geral, Inventário UI e Status** `[P2]` `[-] Parcial`
  - **Objetivo:** Consolidar painéis de Atributos, Bossbar, Estamina/Curas com clareza imediata do impacto. Apresentar dicas visuais dos efeitos ambientais e Biomas.
  - **Arquivos:** `HUD.js`, `BossBar.js`, `InventoryUI.js`.
  - **Evidência atual:** HUD rudimentar funcional, interações iterativas operando via texto, requerendo refinamento da acessibilidade e organização.

- [ ] **ABISMO-HUD-002 — Joystick e Inputs Personalizáveis** `[P3]` `[ ] Pendente`
  - **Objetivo:** Remapeamento, Gamepad via Input Plugin do Phaser e adaptadores.

---

## SEÇÃO P — Áudio, animações e polimento

- [ ] **ABISMO-SND-001 — Integração de SFX e BGM** `[P3]` `[ ] Pendente`
  - **Objetivo:** Áudio imersivo de golpes (hit feedback), músicas exclusivas de Biomas ou Bosses.

- [-] **ABISMO-GFX-001 — Animações Finais, Pixels Definitivos e Partículas** `[P3]` `[-] Parcial`
  - **Objetivo:** Substituir as renderizações procedurais por primitivos geométricos (quadrados, cores uniformes tintadas via `Graphics`) por assets estáticos autênticos e efeitos de combate legíveis.
  - **Evidência atual:** Renderiza os fallbacks geométricos criados na `BootScene` com as paletas determinísticas via tint do Bioma (perfeito para teste, mas insatisfatório na apresentação final). Partículas ambientais aplicadas.

---

## SEÇÃO Q — Save e continuidade

- [x] **ABISMO-SAV-001 — IndexedDB, Sessões, Seeds e Integridade** `[P1]` `[x] Implementado e validado`
  - **Objetivo:** Armazenar todos os stats base e chaves ativas do jogador a cada autosave de fogueira, preservando o layout orgânico entre fechamentos via Seed atada.
  - **Arquivos:** `SaveSystem.js`.
  - **Critério de conclusão:** Multislots; recarregar o browser carrega posições da área e level exato; tratar nulos com defaults para patches retroativos.
  - **Evidência atual:** Extensos testes das strings JSON confirmaram a robustez do formato.
