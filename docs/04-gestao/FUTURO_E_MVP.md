# Futuro e protótipo jogável — Abismo

> Material do checklist de 2026-10-09. Status registrados originalmente; não revalidados nesta edição.
> [Checklist mestre](../TAREFAS_ABISMO.md) · [Índice geral](../README.md)

## SEÇÃO R — Recursos futuros

- [ ] **ABISMO-FUT-001 — Multiplayer Fantasma e Leaderboards** `[P4]` `[ ] Pendente`
  - **Objetivo:** Mensagens, espectros passados e rankings de profundidade assíncronos (não requer real-time).
  - **Dependências:** Backend API e isolamento na V2.

---

## SEÇÃO S — Protótipo jogável

- [x] **ABISMO-MVP-001 — MVP e Ciclo Core (GDD)** `[P1]` `[x] Implementado e validado`
  - **Objetivo:** O GDD exigia o protótipo: Jogador, 1 Sala, 1 Santuário, 1 Inimigo, 1 Boss, Stamina, Ataque, Parry, XP, Loot, Morte.
  - **Evidência atual:** Tudo conectado no loop central da engine Phaser rodando em `GameScene.js`. A espinha dorsal atende 100% da lógica exigida, validando o teste do motor matemático de seed.

---
