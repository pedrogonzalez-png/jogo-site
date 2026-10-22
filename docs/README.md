# Documentação do Abismo — índice geral

> Atualizada em **2026-10-21** para uso no Antigravity IDE. **Esta entrega reorganiza e amplia documentação, não código.**
> O projeto utiliza **Phaser 4.2.1, Vite 8.3 e JavaScript ESM**, com exploração top-down, combate souls-like, biomas procedurais e direção artística ASCII de alta densidade.

## 1. Comece aqui## Auditoria de código de 21/10/2026**[Relatório final da auditoria (24 testes + Chromium)](06-auditoria/RELATORIO_FINAL_2026-10-21.md)** — correções consolidadas, resultados reais do navegador, pendências e próximo passo de QA.



**[Relatório técnico de auditoria — 45 fontes JavaScript inspecionadas](06-auditoria/AUDITORIA_CODIGO_2026-10-21.md)**: problemas identificados, correções propostas no PR #3, evidências reais e lacunas ainda existentes.

**[Matriz de evidências dos 55 IDs históricos](06-auditoria/MATRIZ_55_TAREFAS.md)**: relaciona cada tarefa antiga à evidência atual, sem confundir status histórico com teste recente.

A branch de auditoria introduziu testes automatizados com **21 casos aprovados** e build Vite aprovado no [GitHub Actions](https://github.com/pedrogonzalez-png/jogo-site/actions/runs/39677024455). **Ainda não há validação visual/jogável completa dos dez biomas.** As correções só chegam à `main` após revisão e merge do PR #3.

---



| Preciso de... | Abrir |
|---|---|
| **Instruções para qualquer agente do Antigravity** | [ANTIGRAVITY_LEIA_PRIMEIRO.md](ANTIGRAVITY_LEIA_PRIMEIRO.md) |
| **GDD e regras consolidadas do produto** | [Visão canônica](01-projeto/VISAO_CANONICA_E_GDD.md) |
| **O que executar e em que ordem** | [Backlog Antigravity](04-gestao/BACKLOG_ANTIGRAVITY.md) |
| **Cronograma lógico e dependências** | [Roadmap de marcos](04-gestao/ROADMAP_E_DEPENDENCIAS.md) |
| **Riscos de informações antigas** | [Registro de divergências](04-gestao/REGISTRO_DE_DIVERGENCIAS.md) |
| **Como testar e comprovar o resultado** | [Plano de validação](04-gestao/PLANO_DE_VALIDACAO.md) |
| **Lista original das 55 tarefas** | [Checklist mestre](TAREFAS_ABISMO.md) |
| **Auditoria original, separada por áreas** | [Auditoria — índice](auditoria_abismo.md) |

## 2. Produto, regras e especificação

- [Visão canônica e GDD consolidado](01-projeto/VISAO_CANONICA_E_GDD.md) — identidade, loop, combate, progressão, itens, biomas, ASCII e fantasmas.
- [Regras e invariantes de gameplay](01-projeto/REGRAS_DE_GAMEPLAY.md) — dano, XP, parry, saves, mundo e física.
- [Decisões pendentes](01-projeto/DECISOES_PENDENTES.md) — não inventar canon, recompensa +200, backend, escala ou controle.
- [Matriz dos 49 tópicos do GDD histórico](04-gestao/RASTREABILIDADE_GDD.md) — rastreabilidade original, **não** transcrição integral do GDD.

## 3. Arquitetura e execução

- [Índice antigo de arquitetura](ESTRUTURA_DO_PROJETO.md) — caminho preservado para scripts/agentes anteriores.
- [Estrutura e inicialização](00-arquitetura/ESTRUTURA_E_INICIALIZACAO.md) — árvore de código, cenas e carregamento.
- [Mundo e biomas — arquitetura](00-arquitetura/MUNDO_E_BIOMAS.md) — seed, salas, perigos ambientais.
- [Sistemas, execução e manutenção](00-arquitetura/SISTEMAS_EXECUCAO_E_MANUTENCAO.md) — combate/equipamento e cuidados com execução.
- [Guia de agentes](ANTIGRAVITY_LEIA_PRIMEIRO.md) — fluxo de trabalho, prioridades e critérios de evidência.

## 4. Gameplay e conteúdo técnico histórico

Documentação dividida do checklist de 2026-10-09, com texto preservado por seção:

- [Jogador e combate](01-gameplay/JOGADOR_E_COMBATE.md)
- [Progressão, desafios, morte e cura](01-gameplay/PROGRESSAO_E_DESAFIOS.md)
- [Armas, armaduras, elementos e inventário](01-gameplay/ARMAS_EQUIPAMENTOS_E_ITENS.md)
- [Geração procedural e endgame](02-mundo/GERACAO_E_ENDGAME.md)
- [Biomas — tarefas históricas](02-mundo/BIOMAS.md)
- [Inimigos e chefes — tarefas históricas](02-mundo/INIMIGOS_E_CHEFES.md)
- [Narrativa — tarefas históricas](03-conteudo/NARRATIVA.md)
- [Interface, áudio, animações e save — tarefas históricas](03-conteudo/INTERFACE_AUDIO_E_SAVE.md)
- [Futuro e MVP](04-gestao/FUTURO_E_MVP.md)

## 5. Especificações detalhadas atuais

- [Guia dos dez biomas](02-mundo/GUIA_DE_BIOMAS.md) — IDs, faixas, pools, hazards, ASCII e testes.
- [Direção artística ASCII](03-conteudo/DIRECAO_ARTISTICA_ASCII.md)
- [Direção artística V2 — cenários, inimigos e chefes](03-conteudo/DIRECAO_ARTISTICA_V2.md) — diagnóstico visual, padrões de bioma, etapas de produção e critérios de aceite. — referência do cavaleiro, animações, inimigos, chefes, água, paredes, materiais, pré-renderização e QA.
- [Fantasmas e rankings assíncronos](03-conteudo/FANTASMAS_ASSINCRONOS.md) — competir contra a própria run e futuras corridas assíncronas; proposta, não implementado.
- [Narrativa, áudio, interface e acessibilidade](03-conteudo/NARRATIVA_AUDIO_E_INTERFACE.md) — contratos e requisitos, sem canon inventado.

## 6. Backlog operacional — sete marcos / 56 subtarefas

| Marco | Documento | Subtarefas |
|---|---|---:|
| 00 | [Fundação e auditoria](04-gestao/tarefas/00-FUNDACAO_E_AUDITORIA.md) | 7 |
| 01 | [Arte ASCII](04-gestao/tarefas/01-ARTE_ASCII.md) | 10 |
| 02 | [Mundo, inimigos e chefes](04-gestao/tarefas/02-MUNDO_E_INIMIGOS.md) | 9 |
| 03 | [Combate, progressão e save](04-gestao/tarefas/03-COMBATE_E_PROGRESSAO.md) | 9 |
| 04 | [Fantasmas assíncronos](04-gestao/tarefas/04-FANTASMAS_ASSINCRONOS.md) | 6 |
| 05 | [Narrativa, áudio, UI e acessibilidade](04-gestao/tarefas/05-CONTEUDO_E_ACESSIBILIDADE.md) | 8 |
| 06 | [QA e regressão](04-gestao/tarefas/06_TESTES_E_RELEASE.md) | 7 |

**Atenção:** as 56 subtarefas especificam/auditam atividades; **não equivalem a 56 funcionalidades inéditas**, nem devem ser somadas diretamente aos **55 IDs históricos** para medir conclusão do projeto. Tarefas indicadas como “A AUDITAR” podem já estar no código.

## 7. Relatórios históricos e auditoria

- [Índice da auditoria de 09/10/2026](auditoria_abismo.md).
- [Original preservado sem alterações](05-historico/AUDITORIA_ORIGINAL_2026-10-09.md).
- [Arquitetura — auditoria antiga](05-historico/ARQUITETURA_2026-10-09.md).
- [Sistemas relatados como funcionais](05-historico/SISTEMAS_REPORTADOS_2026-10-09.md).
- [Defeitos identificados naquela data](05-historico/PROBLEMAS_2026-10-09.md).
- [Biomas descritos naquela data](05-historico/BIOMAS_2026-10-09.md).
- [Plano antigo de implementação](05-historico/PLANO_2026-10-09.md).
- [Riscos históricos](05-historico/RISCOS_2026-10-09.md).
- [Validações relatadas, não reproduzidas nesta edição](05-historico/VALIDACOES_REPORTADAS_2026-10-09.md).

## 8. Gestão e atualização

- [Registro de divergências](04-gestao/REGISTRO_DE_DIVERGENCIAS.md)
- [Plano de validação](04-gestao/PLANO_DE_VALIDACAO.md)
- [Roadmap e dependências](04-gestao/ROADMAP_E_DEPENDENCIAS.md)
- [Changelog da documentação](04-gestao/CHANGELOG_DOCUMENTACAO.md)
- [Checklist legado e seu histórico de status](TAREFAS_ABISMO.md)

**Regra fundamental:** ver uma classe no código NÃO comprova que o comportamento funciona; compilar NÃO equivale a validar no jogo; a auditoria de 09/10/2026 NÃO garante que o estado é atual. Qualquer status novo precisa de teste, versão, data e evidência.

## 9. Como continuar em um novo chat do Antigravity

Abra **GEMINI.md** (na raiz) ou este README; forneça o ID da tarefa desejada e peça ao agente para seguir [ANTIGRAVITY_LEIA_PRIMEIRO.md](ANTIGRAVITY_LEIA_PRIMEIRO.md). Para arte, forneça a referência original do cavaleiro se ela não estiver acessível; não invente a fonte visual.

**Não apague os três arquivos antigos:** TAREFAS_ABISMO.md, ESTRUTURA_DO_PROJETO.md e auditoria_abismo.md agora são **índices estáveis** com links para documentação temática e histórica.
