# Abismo

RPG de ação e exploração **top-down**, com combate souls-like, geração procedural e identidade visual ASCII de alta densidade.

## Tecnologias

- JavaScript ES Modules, sem React
- Phaser **4.2.1**
- Vite **8.3**
- IndexedDB para saves

## Rodar localmente

É necessário Node.js e npm compatíveis com a versão instalada do Vite.

```bash
npm ci
npm run dev
```

Para compilar:

```bash
npm run build
```

> Em unidades exFAT/Ventoy, algumas dependências do npm podem falhar por falta de suporte a symlinks. Prefira instalar dependências em um filesystem compatível; consulte o guia de execução antes de alterar o projeto. A execução acima não foi reproduzida nesta reorganização documental.

## Documentação para desenvolvimento

**[Abrir o índice completo da documentação](docs/README.md)**

| Preciso de | Abrir |
|---|---|
| Começar a trabalhar no **Antigravity IDE** | [Guia obrigatório](docs/ANTIGRAVITY_LEIA_PRIMEIRO.md) |
| Regras e design do jogo | [GDD consolidado](docs/01-projeto/VISAO_CANONICA_E_GDD.md) |
| Status legado das tarefas | [Checklist de 55 itens](docs/TAREFAS_ABISMO.md) |
| Próximas tarefas detalhadas | [Backlog de 7 marcos e 56 subtarefas](docs/04-gestao/BACKLOG_ANTIGRAVITY.md) |
| Arte detalhada do cavaleiro, inimigos, água e mundo | [Direção artística ASCII](docs/03-conteudo/DIRECAO_ARTISTICA_ASCII.md) |
| Mundo, hazards e inimigos dos 10 biomas | [Guia dos biomas](docs/02-mundo/GUIA_DE_BIOMAS.md) |
| Replays e fantasmas assíncronos | [Especificação futura](docs/03-conteudo/FANTASMAS_ASSINCRONOS.md) |
| Divergências dos relatórios antigos | [Registro de divergências](docs/04-gestao/REGISTRO_DE_DIVERGENCIAS.md) |
| Testes e evidências de validação | [Plano de QA](docs/04-gestao/PLANO_DE_VALIDACAO.md) |
| Relatórios históricos | [Auditoria do Abismo](docs/auditoria_abismo.md) |

O arquivo [GEMINI.md](GEMINI.md) resume as regras essenciais para agentes Gemini/Antigravity; todos os detalhes estão em docs/.

## Estado da documentação

A documentação de **9 de outubro de 2026** foi preservada e separada em temas; em **21 de outubro de 2026** recebeu uma consolidação de requisitos e um backlog operacional. Os relatos antigos de implementação/validação **não foram retestados** nesta mudança.

**Nenhuma mecânica, arte do jogo ou arquivo JavaScript foi alterado por essa reorganização Markdown.**
