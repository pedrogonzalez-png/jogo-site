# Documentação do Abismo

O Abismo é um RPG de ação e exploração **top-down**, inspirado em jogos souls-like e estruturado em salas e biomas procedurais. Este índice separa **arquitetura**, **gameplay**, **mundo**, **conteúdo** e **gestão** para facilitar a leitura e o trabalho de agentes de desenvolvimento.

> **Atenção:** os documentos técnicos e as tarefas reorganizados aqui vêm de revisões datadas de **2026-10-09**. Eles não constituem uma auditoria do estado atual do código. Nenhum sistema foi alterado nesta reorganização.

## Por onde começar?

| O que você procura? | Documento |
|---|---|
| **Visão rápida do projeto** | [Estrutura do projeto](ESTRUTURA_DO_PROJETO.md) |
| **O que falta desenvolver** | [Checklist mestre](TAREFAS_ABISMO.md) |
| **O que cada arquivo faz** | [Estrutura e inicialização](00-arquitetura/ESTRUTURA_E_INICIALIZACAO.md) |
| **Como funciona o jogo** | [Jogador e combate](01-gameplay/JOGADOR_E_COMBATE.md) |
| **Relação entre GDD e tarefas** | [Matriz de rastreabilidade](04-gestao/RASTREABILIDADE_GDD.md) |

## 00 — Arquitetura

- [Estrutura e inicialização](00-arquitetura/ESTRUTURA_E_INICIALIZACAO.md): árvore de pastas, responsabilidades e fluxo de boot.
- [Mundo e biomas](00-arquitetura/MUNDO_E_BIOMAS.md): arquitetura de geração procedural e definições ambientais.
- [Sistemas, execução e manutenção](00-arquitetura/SISTEMAS_EXECUCAO_E_MANUTENCAO.md): sistemas, testes de execução, notas técnicas e limitações.

## 01 — Gameplay e progressão

- [Jogador e combate](01-gameplay/JOGADOR_E_COMBATE.md).
- [Progressão, desafio, morte e cura](01-gameplay/PROGRESSAO_E_DESAFIOS.md).
- [Armas, armaduras, status e inventário](01-gameplay/ARMAS_EQUIPAMENTOS_E_ITENS.md).

## 02 — Mundo

- [Geração e endgame](02-mundo/GERACAO_E_ENDGAME.md).
- [Biomas — tarefas](02-mundo/BIOMAS.md).
- [Inimigos e chefes — tarefas](02-mundo/INIMIGOS_E_CHEFES.md).

## 03 — Conteúdo e apresentação

- [Narrativa e NPCs](03-conteudo/NARRATIVA.md).
- [Interface, áudio, animações e saves](03-conteudo/INTERFACE_AUDIO_E_SAVE.md).

## 04 — Acompanhamento

- [Futuro e MVP](04-gestao/FUTURO_E_MVP.md).
- [Rastreabilidade do GDD](04-gestao/RASTREABILIDADE_GDD.md).

## Regras para atualizar

1. Leia o [checklist mestre](TAREFAS_ABISMO.md) antes de alterar o status de uma tarefa.
2. Mantenha os IDs `ABISMO-...`, dependências, critérios e evidências.
3. Diferencie implementação, build, teste automatizado e validação jogando.
4. Ao modificar um sistema, atualize o arquivo temático correspondente e o resumo do checklist.
5. Não crie tarefas duplicadas: pesquise primeiro pelos IDs existentes.

## Organização

```text
docs/
├── README.md
├── TAREFAS_ABISMO.md
├── ESTRUTURA_DO_PROJETO.md
├── 00-arquitetura/
├── 01-gameplay/
├── 02-mundo/
├── 03-conteudo/
└── 04-gestao/
```

**Escopo desta atualização:** somente documentação Markdown. Os arquivos JavaScript e a lógica do jogo não foram alterados.
