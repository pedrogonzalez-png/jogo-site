# Auditoria histórica do Abismo — seção C

> **Fonte:** [auditoria original de 2026-10-09](AUDITORIA_ORIGINAL_2026-10-09.md). Este é um **relato histórico**, não a situação atual comprovada. Afirmações de validação reproduzem o relatório antigo; não foram repetidas nesta edição.
> [Índice da auditoria](../auditoria_abismo.md) · [Índice da documentação](../README.md)

## C. Sistemas Parciais ou Defeituosos (Classificados)

### 🔴 Problema #1 — Inimigos e chefes idênticos em todos os biomas (Pendente)
**Severidade: Alta**
Todos os 10 biomas utilizam o pool básico: `enemyPool: ['ash_walker']` e o boss é sempre *hardcoded* (`const template = { ...BOSS_TEMPLATES.ashen_lord };`) na `GameScene`, ignorando o pool do bioma. Mudar de bioma não altera a experiência de combate com o monstrário.

### 🟡 Problema #2 — Santuário respawna inimigos na própria sala (Pendente)
**Severidade: Média-Alta**
Ao descansar, a flag `cleared` é resetada e a `GameScene` aciona a função `_spawnEnemies()`. Se o tipo da sala atual for `SANCTUARY`, monstros podem aparecer em cima do jogador e quebrar as áreas de segurança. (Necessário adicionar filtro: `this._currentRoom.type !== 'SANCTUARY'`).

### 🟡 Problema #3 — Texturas de tile hardcoded para um único bioma (Parcial)
**Severidade: Alta**
As texturas geradas na `BootScene` usam tons cinza-marrom (baseados no Vale das Cinzas). O recurso `setTint` da `GameScene` multiplica a cor por cima. Cores vibrantes (ex: Azul em Cidades Submersas) acabam obscurecidas ou distorcidas por conta da cor base não ser um neutro (como `0x808080`). 

### 🟡 Problema #4 — Partículas ambientes genéricas (Parcial)
**Severidade: Média**
O bioma possui a tag `ambientParticles`, mas a função que cria as partículas faz bolhas genéricas simples em vez de efeitos climáticos distintos baseados na propriedade definida. 

---
