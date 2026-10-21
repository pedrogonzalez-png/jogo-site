# Backlog operacional por marcos — Antigravity IDE

> **Leitura de entrada obrigatória após auditoria de código:** [20 achados/correções com evidências](../06-auditoria/AUDITORIA_CODIGO_2026-10-21.md) · [matriz de 55 tarefas](../06-auditoria/MATRIZ_55_TAREFAS.md). A branch `fix/auditoria-integral-2026-10-21` passou por 21 testes automatizados e build no GitHub Actions. **As tarefas de gameplay/arte ainda exigem verificação no navegador.** Há **6 famílias de armas definidas** no código, não as 9 desejadas, e os prêmios concretos da faixa +200 ainda estão incompletos.

> **Atualizado em 2026-10-21.** Este backlog divide trabalho em **56 subtarefas operacionais propostas**, distribuídas em sete arquivos. **Não são 56 novas funcionalidades**: muitas verificam, aprofundam ou implementam as 55 tarefas históricas da [lista original](../TAREFAS_ABISMO.md). **Não somar 55 + 56 para medir progresso.**
>
> **Estado inicial das subtarefas:** a auditar, a executar ou futuro. Nenhuma tarefa foi implementada/testada em código por esta edição documental.

## 1. Entradas obrigatórias

- [Guia do Antigravity](../ANTIGRAVITY_LEIA_PRIMEIRO.md).
- [GDD consolidado](../01-projeto/VISAO_CANONICA_E_GDD.md).
- [Regras de gameplay](../01-projeto/REGRAS_DE_GAMEPLAY.md).
- [Divergências entre código e auditoria antiga](REGISTRO_DE_DIVERGENCIAS.md).
- [Matriz de validação](PLANO_DE_VALIDACAO.md).
- [Roadmap e dependências](ROADMAP_E_DEPENDENCIAS.md).

## 2. Índice dos sete marcos

| Marco | Arquivo | Subtarefas | Prioridade inicial |
|---|---|---:|---|
| **00 — Fundação e auditoria** | [00-FUNDACAO_E_AUDITORIA.md](tarefas/00-FUNDACAO_E_AUDITORIA.md) | 7 | P1; iniciar aqui |
| **01 — Arte ASCII** | [01-ARTE_ASCII.md](tarefas/01-ARTE_ASCII.md) | 10 | P1/P2; foco na qualidade do cavaleiro e do mundo |
| **02 — Mundo, inimigos e chefes** | [02-MUNDO_E_INIMIGOS.md](tarefas/02-MUNDO_E_INIMIGOS.md) | 9 | P1/P2; primeiro auditar os pools atuais |
| **03 — Combate, progressão e saves** | [03-COMBATE_E_PROGRESSAO.md](tarefas/03-COMBATE_E_PROGRESSAO.md) | 9 | P1/P2; integridade de regras e recompensas |
| **04 — Fantasmas assíncronos** | [04-FANTASMAS_ASSINCRONOS.md](tarefas/04-FANTASMAS_ASSINCRONOS.md) | 6 | P4; futuro, não realtime |
| **05 — Narrativa, áudio, UI e acessibilidade** | [05-CONTEUDO_E_ACESSIBILIDADE.md](tarefas/05-CONTEUDO_E_ACESSIBILIDADE.md) | 8 | P2/P3; requer decisões de conteúdo |
| **06 — QA e release** | [06_TESTES_E_RELEASE.md](tarefas/06_TESTES_E_RELEASE.md) | 7 | P1; casos obrigatórios em todos os marcos |
| **TOTAL** | **7 arquivos** | **56** | **Subtarefas; não contagem de features** |

## 3. Próxima execução sugerida no Antigravity

Não executar todas as 56 de uma vez. Fluxo recomendado:

1. **ABISMO-QA-101:** construir baseline de build e gameplay em um navegador real.
2. **ABISMO-DOC-101/102:** reconciliar as 55 tarefas e divergências da auditoria antiga.
3. **ABISMO-ART-101/102:** catalogar texturas e verificar cavaleiro no tamanho de gameplay.
4. **ABISMO-ART-103/104:** criar poses genuínas e completar os estados realmente ausentes.
5. **ABISMO-ART-107/108/109:** revisar água, blocos e biomas por ordem de impacto, usando screenshot e FPS.
6. Em paralelo onde couber, **ABISMO-WLD-103/104** auditar pools/chefes e **ABISMO-SYS-206/207** validar unicidade e desafio +200.
7. Rodar **QA-205/206/207** antes de fechar cada lote.

**Atenção:** já existem classes e arte ASCII no código (incluindo KnightArt e TextureBootManager). O trabalho começa por inspeção, não por reimplementar tudo.

## 4. Como interpretar os IDs

**Tarefas históricas:** ABISMO-PLY-001, ABISMO-WPN-001, ABISMO-ENM-001, ABISMO-GFX-001 etc. São compromissos do checklist anterior, preservados com seu ID original.

**Subtarefas de agente:** ABISMO-ART-101, ABISMO-WLD-101, ABISMO-QA-201 etc. Fatiam critérios para execução e verificação. **Não substituir ou marcar um ID legado por conclusão parcial de subtarefa**; a tarefa original exige o conjunto de critérios correspondente.

**Ao fechar uma subtarefa:** informar commit, arquivos inspecionados, arquivos alterados, teste real, casos não testados, resultado e efeito nos IDs legados. A decisão de atualizar os contadores gerais só é possível após reconciliar a matriz.

## 5. Regras de alteração de escopo

- Documentação pode ser detalhada sem codificar; uma tarefa de arte não autoriza mexer em combate.
- A existência de arquivos de arte não autoriza marcar qualidade como validada.
- Fantasmas estão em futuro P4; não implementar servidor sem aprovação explícita do projeto.
- Não criar lore definitiva, recompensa especial da faixa +200 ou nome de raridade ausente sem material autoral.
- Ao encontrar decisão ausente, registrar em [Decisões pendentes](../01-projeto/DECISOES_PENDENTES.md).

## 6. Segurança dos dados e histórico

- Preserve a auditoria integral em [arquivo histórico](../05-historico/AUDITORIA_ORIGINAL_2026-10-09.md).
- Preserve a matriz do GDD e os IDs legados.
- Preserve nomes de exports, chaves de textura, seeds e formatos de save, salvo migração deliberada.
- Não remova README/índices históricos: eles servem como entradas para agentes antigos e novos.

## 7. Critérios de término de marco

Cada marco deve exibir: tarefas com aceite marcado, evidências verificáveis, status de regressão, impacto nos outros marcos e registro de dependências ainda abertas.

**Versão de rastreabilidade:** documentação 2026-10-21, sem intervenção de código e sem novos testes de execução.
