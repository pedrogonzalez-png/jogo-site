# Roadmap e dependências — Abismo / Antigravity

> Documento de **sequenciamento sugerido**, não cronograma prometido e não confirmação de implementação. O objetivo é minimizar regressões e custo de retrabalho.

## A. Critérios de prioridade

- **P0:** perda de save, corrupção, crash ou softlock que impeça jogar.
- **P1:** integridade do núcleo, garantia de reprodutibilidade, bugs de combate/loot e falhas de performance críticas.
- **P2:** qualidade e diversidade de gameplay e arte ASCII, conteúdo necessário para lançamento.
- **P3:** refinamento e conveniência.
- **P4:** recursos futuros, especialmente ghosts/rankings.

## B. Fluxo recomendado

**Fundação (marco 00):** QA-101 → DOC-101/102 → SYS-101/102 → QA-102.

**Linha de arte (marco 01):** ART-101 → ART-102 → ART-103 e ART-104; em paralelo ART-105/106 após conhecer o mapeamento inimigos/chefes; ART-107 → ART-108 → ART-109 → ART-110 com QA-205/206.

**Linha de mundo (marco 02):** WLD-101 → WLD-102/103 → WLD-104/105/106 → WLD-107 → WLD-109; WLD-108 depende também de decisão sobre variação de duração da partida.

**Linha de sistemas (marco 03):** SYS-101 → SYS-202/203 → SYS-201/204/205; SYS-102 → SYS-206/208 → SYS-207/209; cada mudança deve passar pelo QA do subsistema.

**Linha de conteúdo (marco 05):** NAR-101 → NAR-102; NAR-103 → NAR-104/105; NAR-106 → NAR-107/108.

**Linha de fantasmas (marco 04, futuro):** DEC-007/008 → GHO-101 → GHO-102 → GHO-103 → GHO-104 → GHO-105 → GHO-106.

**QA (marco 06):** QA-201 é o gate inicial; QA-202/203/204/205 ocorrem durante respectivas frentes; QA-206 mede performance; QA-207 fecha o ciclo e atualiza documentação.

## C. Gates de qualidade

| Gate | Entradas | Condição de saída |
|---|---|---|
| G0 — Estado conhecido | Build e docs | Não confundir histórico com código e teste |
| G1 — Combate preservado | Correções de Player/Weapon | Hitboxes, stamina, poise e save sem regressão |
| G2 — ASCII validada | Artwork registrado | Capturas de tela e escala/colisão consistentes |
| G3 — Dez biomas | WorldGenerator, pools, hazards e boss | Casos por bioma com evidência |
| G4 — Progressão segura | XP, item único, rewards, saves | Reload, morte e drops sem duplicação |
| G5 — Conteúdo acessível | Narrativa/áudio/UI | Pausa, feedback, preferência e fallback confiáveis |
| G6 — Estabilidade | Benchmark e suites | Nenhuma falha P0/P1 aberta no escopo entregue |

## D. Entregas atômicas para agentes

Preferir um pacote por tarefa ou pequeno conjunto de IDs dependentes. Ao receber “implementar M1”:
1. Ler todos os contratos e status.
2. Separar **auditoria** de **modificação**.
3. Modificar só módulos necessários.
4. Produzir evidência incremental.
5. Deixar outros marcos intocados.

## E. O que não entra neste roadmap por suposição

- Datas finais ou metas de FPS sem ambiente/benchmark.
- Servidor, autenticação, monetização ou PvP em tempo real.
- Lore/quests definitivas sem fonte autoral.
- Troca de engine, migração para React/TypeScript ou reforma da arquitetura inteira.

## F. Relação com a documentação legada

Este plano é **complementar** ao checklist de 55 tarefas da revisão 2026-10-09. A conclusão de ART-103, por exemplo, não conclui ABISMO-GFX-001 sozinha. O inverso também vale: uma tarefa legado antiga marcada concluída não encerra QA de animação criado posteriormente.
