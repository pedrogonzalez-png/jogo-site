# Leia primeiro — guia obrigatório para Antigravity IDE

> Atualização documental: **2026-10-21**. Objetivo: permitir que um agente novo continue o desenvolvimento do Abismo sem misturar requisitos, código real, auditorias antigas e ideias futuras.
> **Escopo desta entrega:** apenas Markdown. Nenhuma funcionalidade foi implementada, testada no navegador ou modificada por esta reorganização.

## 0. Ordem de leitura obrigatória

1. [Índice geral](README.md): escolha o subsistema correto.
2. [Visão canônica e GDD consolidado](01-projeto/VISAO_CANONICA_E_GDD.md): regras e objetivos do produto.
3. [Decisões e regras de gameplay](01-projeto/REGRAS_DE_GAMEPLAY.md): invariantes que não podem ser quebradas.
4. [Registro de divergências](04-gestao/REGISTRO_DE_DIVERGENCIAS.md): fatos do código atual que contradizem os relatórios antigos.
5. [Backlog por marcos](04-gestao/BACKLOG_ANTIGRAVITY.md): tarefas com IDs, prioridades, dependências e critérios de aceite.
6. [Plano de validação](04-gestao/PLANO_DE_VALIDACAO.md): como provar que uma mudança funciona.
7. [Checklist histórico](TAREFAS_ABISMO.md) e [Auditoria histórica](auditoria_abismo.md): contexto anterior; não são verdade absoluta sobre a versão atual.

## 1. Tecnologia e limites

- Jogo de ação RPG top-down em **JavaScript ESM, Phaser 4.2.1 e Vite 8.3**, sem React.
- Física Arcade, gravidade vertical zero, sala/grid procedurais e seed determinística.
- Persistência por **IndexedDB**. Não quebrar saves existentes sem estratégia de migração.
- Renderer atual: biblioteca de arte ASCII em **src/ascii/**, textura pré-renderizada a partir de caracteres em **src/ascii/TextureBootManager.js**.
- Não introduzir multiplayer em tempo real por padrão. Fantasmas e rankings são propostas **assíncronas** e devem ser avaliados em tarefas futuras.
- Não fazer uma refatoração global para implementar uma única tarefa visual.

## 2. Hierarquia de evidências (fundamental)

**Nível A — Código inspecionado no commit atual:** pode-se afirmar que uma classe, propriedade, função ou rota *existe no código*, citando caminho e símbolo. Isso **não garante** funcionamento no navegador.

**Nível B — Teste reproduzido:** build, teste automatizado ou sessão jogável, com comando, ambiente, resultado e data. Somente este nível permite afirmar que aquele cenário foi validado, especificando o tipo de validação.

**Nível C — Relatórios anteriores:** auditoria/checklist de 2026-10-09 e outras declarações anteriores são evidência histórica, mesmo quando dizem “100% validado”.

**Nível D — Requisito de design:** decisões do usuário e especificações deste repositório descrevem o que deve acontecer, não o que já está implementado.

**Nível E — Ideia/proposta em aberto:** hipótese que ainda exige decisão ou confirmação. Não transformar em compromisso técnico irrevogável.

Ao atualizar um status, anote o nível de evidência. Nunca mude um requisito porque o código atual diverge: primeiro registre a divergência e proponha a resolução.

## 3. Protocolo de execução de cada tarefa

1. **Escolher um ID** do backlog e conferir se ele corresponde a um ID legado; impedir duplicação.
2. **Ler os arquivos reais** citados pela tarefa e seus consumidores; procurar efeitos colaterais e os contratos públicos.
3. **Registrar o estado inicial**, incluindo versões, sintomas e comportamento reproduzido.
4. **Definir escopo mínimo**: quais arquivos realmente precisam ser tocados; arquivos proibidos por padrão.
5. **Implementar** com compatibilidade da API e do save; não atualizar status antes da evidência.
6. **Validar** build, testes técnicos e, quando possível, jogo real. Não confundir compilação com gameplay aprovado.
7. **Documentar** alterações no arquivo de domínio, tarefa individual e [registro de validações](04-gestao/PLANO_DE_VALIDACAO.md).
8. **Relatar** arquivos alterados, comportamento antes/depois, testes executados, testes não executados, riscos e próximos passos.

## 4. Convenções de tarefas

- IDs legados: **ABISMO-PLY-001**, **ABISMO-ENM-001**, etc. Não renomear nem apagar.
- IDs de complementação: grupos **ABISMO-DOC-1xx, ART-1xx, WLD-1xx, GHO-1xx, QA-1xx, NAR-1xx, SYS-1xx**; suas tarefas são propostas **para conferência**, não substituem automaticamente os 55 itens históricos.
- Status: **A AUDITAR**, **PENDENTE CONFIRMADO**, **EM ANDAMENTO**, **IMPLEMENTADO NÃO VALIDADO**, **VALIDADO [TIPO]**, **BLOQUEADO** ou **DESCARTADO COM JUSTIFICATIVA**.
- Prioridades: **P0** risco de perda de dados/crash/bloqueio, **P1** jogabilidade/infra crítica, **P2** conteúdo essencial, **P3** acabamento, **P4** futuro.
- Dependência explícita: outra tarefa, decisão do usuário, arquivo de referência ou teste necessário.
- Uma tarefa “A AUDITAR” pode já estar parcial ou totalmente codificada. **Nunca reimplemente sem examinar.**

## 5. Regras de proteção do projeto

- Não modificar arquivos fora do escopo da tarefa sem justificativa e rastreabilidade.
- Preservar nomes de exports, assinaturas de métodos, chaves de texturas, dados serializados e IDs de itens/inimigos.
- Geração de mundo deve continuar reproduzível pela mesma seed; não usar Math.random isolado em caminhos determinísticos.
- Santuários devem permanecer seguros; conectividade e portas nunca podem produzir softlock.
- Melhorias visuais não podem alterar colisões, dano, hitboxes, i-frames ou estatísticas inadvertidamente.
- Separar biblioteca ASCII, renderização e integração com cena; não incorporar arte gigante dentro de GameScene sem necessidade.
- Não presumir que a referência do cavaleiro seja uma imagem externa: o repositório atual contém **KnightArt.js** e referência codificada. Verifique se são a fonte aprovada antes de substituir.
- O README não autoriza apagar a auditoria original nem documentos legados sem migração verificada.

## 6. Saída padrão do agente após cada implementação

**Objetivo/ID:** ...
**Arquivos inspecionados:** ...
**Arquivos modificados:** ...
**Mudanças de comportamento:** ...
**Condições preservadas:** ...
**Evidências:** build/testes/jogo manual, com data e resultado.
**Não verificado:** ...
**Pendências/risco:** ...
**Documentação atualizada:** ...

## 7. Onde registrar mudanças

- Especificações: documentos em **docs/01-projeto**, **docs/02-mundo** e **docs/03-conteudo**.
- Tarefas: **docs/04-gestao/tarefas/** e [índice do backlog](04-gestao/BACKLOG_ANTIGRAVITY.md).
- Inconsistências ou afirmações conflitantes: [Registro de divergências](04-gestao/REGISTRO_DE_DIVERGENCIAS.md).
- Relatórios datados: **docs/05-historico/**; não reescrever a história.
- Resumo: [Checklist mestre](TAREFAS_ABISMO.md), com contadores atualizados apenas após reconciliação.
