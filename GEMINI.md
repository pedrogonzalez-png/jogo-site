# Abismo — instruções de contexto para Gemini / Antigravity IDE

> **AUDITORIA TÉCNICA ATUAL (2026-10-21):** leia também `docs/06-auditoria/AUDITORIA_CODIGO_2026-10-21.md` e `docs/06-auditoria/MATRIZ_55_TAREFAS.md`. Elas registram as alterações de código, 21 testes automatizados aprovados e pendências como validação visual no navegador. **Não marcar o jogo inteiro como validado apenas pelo CI.**

Este repositório é um RPG de ação top-down com **Phaser 4.2.1 + Vite 8.3 + JavaScript ES Modules**. **Não usar React** nem reescrever o motor.

## Antes de editar qualquer arquivo

1. Leia **docs/ANTIGRAVITY_LEIA_PRIMEIRO.md** integralmente.
2. Localize o domínio em **docs/README.md**.
3. Veja os requisitos em **docs/01-projeto/VISAO_CANONICA_E_GDD.md** e **docs/01-projeto/REGRAS_DE_GAMEPLAY.md**.
4. Confira **docs/04-gestao/REGISTRO_DE_DIVERGENCIAS.md**. A auditoria de 2026-10-09 é histórica e pode estar desatualizada.
5. Escolha tarefa e dependências em **docs/04-gestao/BACKLOG_ANTIGRAVITY.md** e seus sete arquivos temáticos.
6. Confirme o código real antes de implementar. Faça validações conforme **docs/04-gestao/PLANO_DE_VALIDACAO.md**.

## Contratos que não podem ser quebrados

- Seed procedural reproduzível e conectividade das salas.
- IDs estáveis de biomas, itens, chefes, exports e chaves de texturas.
- Salvamento em IndexedDB e progressão sem duplicação de itens únicos.
- Combate com stamina, poise, i-frames e parry (200ms conforme design).
- Arte ASCII de alta densidade: **não voltar para player @, paredes ###, água ~ sem composição**.
- Sprite visual não determina tamanho da hitbox física.
- Fantasmas são proposta futura **assíncrona**, nunca multiplayer em tempo real por suposição.
- Alteração artística não é autorização para modificar regras de combate ou saves.

## Evidência e conclusão

Não afirmar “validado” apenas porque o código compila ou porque um relatório histórico assim declara. Informar arquivo, função, teste, ambiente e data. Ao não conseguir testar, escrever **NÃO EXECUTADO**.

**Escopo documental de 2026-10-21:** reorganização dos arquivos Markdown; nenhuma mudança de código JS. Atualize documentação do domínio e tarefa correspondente quando implementar no futuro.
