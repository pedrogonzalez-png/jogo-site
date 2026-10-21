# Changelog da documentação — Abismo

## 2026-10-21 — encerramento da fase técnica da auditoria (PR #3)

- O relatório final foi consolidado em [docs/06-auditoria/RELATORIO_FINAL_2026-10-21.md](../06-auditoria/RELATORIO_FINAL_2026-10-21.md).
- Resultado comprovado no commit `1a3bf089d`: **24 testes aprovados**, build Vite aprovado, smoke real com Chromium aprovado e screenshots de menu, gameplay, inventário, morte e respawn.
- Mais quatro defeitos concretos corrigidos: overlay de morte remanescente, projéteis persistentes após transição, multiplicador de nível de anomalia incorreto e baú sem autosave após recompensa.
- Continua pendente QA jogável profundo em dez biomas, performance/visual humano, todas as habilidades/chefes, recompensas +200, três famílias de armas, conteúdo de áudio/ghosts e migrações antigas complexas.
- A branch permanece isolada da `main`; **não houve merge automático**.


## 2026-10-21 — auditoria real do código e evidências (PR #3)

- Foram inspecionados estaticamente **45 arquivos JavaScript** em `src/`, com atualizações de gameplay, inventário, loot, geração de salas e saves propostas em branch separada.
- Adicionada [auditoria técnica detalhada](../06-auditoria/AUDITORIA_CODIGO_2026-10-21.md) com defeitos observados, correções efetuadas, limitações e casos de QA não executados.
- Adicionada [matriz dos 55 IDs legados](../06-auditoria/MATRIZ_55_TAREFAS.md), sem alterar indevidamente o snapshot de conclusão de 09/10.
- Introduzidos 3 arquivos de testes e CI (21 casos aprovados, 0 falhas, build Vite aprovado); **nenhuma validação jogável ou de FPS feita até aqui**.
- Lacunas documentadas: 6 famílias de armas concretas versus 9 previstas; recompensa especial +200 incompleta; animações do cavaleiro a revisar; áudio/replays sem confirmação de integração real.
- As correções propostas pertencem ao PR #3, separado do merge documental anterior.


## 2026-10-21 — organização e preparação para Antigravity

**Natureza:** alterações exclusivas em Markdown. Sem implementação, build novo ou execução do jogo.

### Preservação de documentos existentes

- Checklist original de 55 tarefas: separação temática preservando IDs, critérios e a matriz de 49 tópicos do GDD; o arquivo antigo tornou-se índice.
- Estrutura de projeto: separada em três documentos de arquitetura; caminho antigo preservado.
- Auditoria de 2026-10-09: original preservado integralmente em **docs/05-historico/AUDITORIA_ORIGINAL_2026-10-09.md**, sete seções extraídas e documento antigo transformado em índice.
- README da raiz e docs/README.md agora servem de orientação e links para os documentos novos.

### Materiais novos

- Guia obrigatório do Antigravity, regras do GDD consolidado e decisões em aberto.
- Direção artística ASCII detalhada (cavaleiro, quadros, inimigos, boss, água, tiles, paletas e pipeline de texturas).
- Guia dos dez biomas baseado nos IDs e pools presentes em src/data/biomes.js.
- Proposta de ghosts assíncronos, corrida contra si mesmo e rankings futuros sem multiplayer em tempo real.
- Conteúdo sobre narrativa, áudio, HUD, preferências e acessibilidade.
- Registro de divergências entre auditoria antiga e leitura estática parcial do código atual.
- Plano de QA com matriz de casos e evidências.
- Backlog com **56 subtarefas** em **7 marcos**, complementares aos **55 itens históricos**.

### O que ainda não foi feito

- Não foi importado o GDD original integral de 49 seções; a consolidação existente usa as decisões e a matriz de rastreabilidade disponíveis.
- Não foram auditados individualmente todos os 55 status contra execução real.
- Não foram testadas no navegador as 56 subtarefas nem as implementações atuais.
- Nenhuma linha de src/, public/, package.json, sistema de áudio ou renderer foi modificada.

### Documentos principais

[Guia Antigravity](../ANTIGRAVITY_LEIA_PRIMEIRO.md) · [Índice geral](../README.md) · [Backlog](BACKLOG_ANTIGRAVITY.md) · [Roadmap](ROADMAP_E_DEPENDENCIAS.md) · [QA](PLANO_DE_VALIDACAO.md)

## 2026-10-09 — base histórica importada

A arquitetura, o checklist e a auditoria originais pertencem à revisão de 2026-10-09; qualquer alegação de implementação ou teste nesses arquivos é **histórica** até validação atual.
