# ABISMO — CHECKLIST MESTRE DE DESENVOLVIMENTO

> **Evidência nova (21/10/2026):**> **Encerramento de auditoria:** [relatório final com 24 testes + smoke Chromium](06-auditoria/RELATORIO_FINAL_2026-10-21.md). A validação integral dos 55 itens pelo navegador **continua pendente**.
 [auditoria de código e correções](06-auditoria/AUDITORIA_CODIGO_2026-10-21.md) · [matriz de todos os 55 IDs](06-auditoria/MATRIZ_55_TAREFAS.md).
> Os percentuais e selos de "validado" a seguir são um **snapshot de 09/10**, preservado como histórico. **21 testes automatizados** e build passaram na branch de auditoria, mas não validam os 55 requisitos integralmente.

> **Data da última revisão:** 2026-10-09
> **Estado geral do projeto:** Protótipo jogável funcional com base de arquitetura procedural e combate concluídas. Os 10 biomas, chefes base e mecânicas ambientais operam, porém os sistemas de progressão escalável (pools de inimigos), variação de mecânicas de ataque de armas e refinamentos visuais encontram-se em estágio inicial ou pendentes.
> 
> **Resumo de Tarefas:**
> - [x] Implementado e validado: 25
> - [~] Implementado, mas não validado: 3
> - [-] Parcial: 12
> - [ ] Pendente: 15
> - [!] Bloqueado: 0
>
> **Resumo por Prioridades:**
> - P0 (Bloqueante): 0
> - P1 (Essencial): 23
> - P2 (Conteúdo principal): 25
> - P3 (Polimento): 6
> - P4 (Futuro): 1
> 
> **Próximas cinco tarefas recomendadas:**
> 1. **ABISMO-WPN-001 a 008:** As famílias de armas (Adagas à Arcos) precisam das hitboxes próprias, visto que o jogo atualmente depende de um fallback universal, impedindo a distinção de gameplay.
> 2. **ABISMO-ENM-001:** Criação de pools de inimigos comuns por bioma (atualmente repetindo clones), essencial para dar identidade a cada cenário.
> 3. **ABISMO-ENM-003:** Iniciar o construtor modular de chefes, garantindo que o Abismo infinito possa misturar atributos.
> 4. **ABISMO-CHA-001:** Testar a drop table de itens nas lutas com alta disparidade de level, assegurando recompensas corretas e justas.
> 5. **ABISMO-INV-002:** Garantir que itens Únicos (Unique) não caiam em duplicata no histórico de Drop Tables por Save.

---

> **Novo para Antigravity (2026-10-21):** [Backlog operacional com 56 subtarefas](04-gestao/BACKLOG_ANTIGRAVITY.md) · [Guia do agente](ANTIGRAVITY_LEIA_PRIMEIRO.md) · [Divergências entre a auditoria antiga e o código](04-gestao/REGISTRO_DE_DIVERGENCIAS.md). **Os 55 status históricos abaixo não foram recalculados.**
>
> **Organização:** este arquivo funciona como painel geral e índice das tarefas. O conteúdo detalhado e os mesmos IDs, status, critérios e evidências da revisão de 2026-10-09 foram distribuídos nos documentos abaixo. **Os números acima são históricos e não foram revalidados nesta reorganização.**
>
> **Regra de navegação:** [Índice da documentação](README.md) · [Arquitetura](ESTRUTURA_DO_PROJETO.md) · [Rastreabilidade do GDD](04-gestao/RASTREABILIDADE_GDD.md)

---

## 1. Jogador e gameplay

| Documento | Seções originais |
|---|---|
| [Jogador e combate](01-gameplay/JOGADOR_E_COMBATE.md) | A — Jogador e combate |
| [Progressão, desafio, morte e cura](01-gameplay/PROGRESSAO_E_DESAFIOS.md) | B, G, H, I |
| [Armas, equipamentos e itens](01-gameplay/ARMAS_EQUIPAMENTOS_E_ITENS.md) | C, D, E, F |

## 2. Mundo e inimigos

| Documento | Seções originais |
|---|---|
| [Geração e endgame](02-mundo/GERACAO_E_ENDGAME.md) | J, M |
| [Biomas](02-mundo/BIOMAS.md) | K |
| [Inimigos e chefes](02-mundo/INIMIGOS_E_CHEFES.md) | L |

## 3. Conteúdo e apresentação

| Documento | Seções originais |
|---|---|
| [Narrativa e NPCs](03-conteudo/NARRATIVA.md) | N |
| [Interface, áudio, animações e save](03-conteudo/INTERFACE_AUDIO_E_SAVE.md) | O, P, Q |

## 4. Gestão do projeto

| Documento | Seções originais |
|---|---|
| [Futuro e MVP](04-gestao/FUTURO_E_MVP.md) | R, S |
| [Matriz de rastreabilidade do GDD](04-gestao/RASTREABILIDADE_GDD.md) | Matriz original, seção 7 |

---

## 5. Como usar este checklist

- Procure uma tarefa pelo ID `ABISMO-...` no documento do seu assunto.
- Preserve IDs, dependências, critérios de conclusão e evidências.
- Registre validações com indicação de testes realmente executados.
- Atualize resumos e prioridades quando as tarefas forem reavaliadas.

## 6. COMO MANTER O CHECKLIST ATUALIZADO
- Reavalie os status com base no código atual.
- Marque tarefas concluídas somente com evidências objetivas ou referenciadas ao código.
- Adicione tarefas novas quando uma necessidade for descoberta.
- Preserve IDs e histórico.
- Não apague pendências sem justificativa clara.
- Atualize prioridades e dependências.
- Registre alterações relevantes nos sistemas.
- Distinga build, testes automatizados e validação dentro do jogo real.

---

## 7. Histórico da reorganização

- **2026-10-21:** checklist distribuído por áreas temáticas, mantendo o texto de cada seção da revisão de 2026-10-09; nenhuma tarefa foi marcada como concluída nesta operação.
