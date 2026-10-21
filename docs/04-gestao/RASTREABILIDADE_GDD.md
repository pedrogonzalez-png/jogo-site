# Rastreabilidade do GDD — Abismo

> Material do checklist de 2026-10-09. Status registrados originalmente; não revalidados nesta edição.
> [Checklist mestre](../TAREFAS_ABISMO.md) · [Índice geral](../README.md)

## 7. MATRIZ DE RASTREABILIDADE DO GDD

| Seção (GDD Base) | Tema/Assunto | Tarefas Associadas | Status | Obs. |
|---|---|---|---|---|
| 01 | Introdução / Visão Geral | ABISMO-MVP-001 | Validado | O fluxo core. |
| 02 | Controles (Teclado/Gamepad) | ABISMO-HUD-002 | Pendente | Gamepad ausente. |
| 03 | Câmera | ABISMO-MVP-001 | Validado | Follow básico no Phaser. |
| 04 | Movimentação em 8-way | ABISMO-PLY-001 | Validado | - |
| 05 | Corrida (Sprint) | ABISMO-PLY-001 | Validado | Consumo de estamina. |
| 06 | Esquiva (I-Frames) | ABISMO-PLY-002 | Validado | Dodge e cancel. |
| 07 | Ataques Básicos | ABISMO-PLY-003 | Parcial | - |
| 08 | Ataques Carregados e Combos | ABISMO-PLY-003, ABISMO-PLY-004 | Pendente | Combos em dodge inoperantes. |
| 09 | Gestão de Stamina | ABISMO-PLY-001, ABISMO-PLY-005 | Validado | Sistema punitivo validado. |
| 10 | Bloqueio | ABISMO-PLY-005 | Validado | - |
| 11 | Quebra de Guarda | ABISMO-PLY-005 | Validado | Ficar sem estamina bloqueando gera debuff. |
| 12 | Parry | ABISMO-PLY-005 | Validado | Ações oportunas. |
| 13 | Equilíbrio e Poise | ABISMO-PLY-007 | Validado | - |
| 14 | Stagger (Atordoamento) | ABISMO-PLY-007 | Validado | - |
| 15 | Fórmulas e Críticos | ABISMO-PLY-007 | Validado | Sistema matemático consolidado. |
| 16 | Atributos Primários | ABISMO-PRG-001 | Validado | 5 cores essenciais operantes. |
| 17 | Nível e Progressão Pura | ABISMO-PRG-002 | Validado | Curva sem tetos impeditivos. |
| 18 | Escalamento de Dano | ABISMO-PRG-003 | Parcial | Pendente testes colossais com ranks elevados (S, A). |
| 19 | Famílias de Armas (9 Tipos) | ABISMO-WPN-001 a ABISMO-WPN-008 | Parcial | Todos os dados definidos matematicamente, hitbox padronizada (ruim) nas categorias. |
| 20 | Habilidades Especiais (Magias) | ABISMO-WPN-009 | Pendente | Armas épicas com spells. |
| 21 | Slots de Armadura e Peso | ABISMO-ARM-001 | Validado | 4 espaços, overlevel anula 2. |
| 22 | Upgrades / Forja de Stats | ABISMO-ARM-002 | Parcial | Faixas operantes mas UI restrita. |
| 23 | Efeitos Elementais | ABISMO-STA-001 | Validado | DoTs validados. |
| 24 | Resistências Exponenciais | ABISMO-STA-002 | Pendente | Inimigos perdem imunidade? |
| 25 | Design de Inventário | ABISMO-INV-001 | Validado | Abas sem peso / sem moeda. |
| 26 | Drops e Loot Tables Fixas | ABISMO-INV-001 | Validado | Base de monstros matemáticos ok. |
| 27 | Drops Únicos (Limites) | ABISMO-INV-002 | Pendente | Faltam barreiras contra itens repetidos únicos globais. |
| 28 | Relíquias | ABISMO-INV-001 | Validado | Passivas acopladas nos Getters. |
| 29 | O Desafio do Abismo (+200) | ABISMO-CHA-001 | Parcial | Recompensas de Overlevel calculadas no Backend, faltam interfaces. |
| 30 | A Morte e A Orbe | ABISMO-DTH-001 | Validado | Destruído na falha secundária. |
| 31 | Santuários | ABISMO-DTH-002 | Validado | Respawners autênticos, reset funcional. |
| 32 | Cura Limitada | ABISMO-HEL-001 | Validado | 3 Poções básicas ativas. |
| 33 | Consumíveis de Melhoria | ABISMO-HEL-002 | Pendente | Aumento numérico permanente e power-ups (resinas). |
| 34 | Estrutura Procedural e Conexões | ABISMO-WLD-001 | Validado | BFS perfeitamente seguro e alocado na room/portas. |
| 35 | Transições e Performance | ABISMO-TECH-002 | Parcial | Trocas ok, falta benchmarkings. |
| 36 | 10 Biomas / Configs de Ambient | ABISMO-BIO-001 a ABISMO-BIO-010 | Validado | Os Hazards (perigos físicos e mágicos) funcionam 100%. |
| 37 | Dungeons/Salas Extras | ABISMO-WLD-002 | Pendente | Segredos. |
| 38 | Inimigos Normais | ABISMO-ENM-001 | Pendente | Clones genéricos usados no lugar de pools por Bioma. |
| 39 | Elites e Anomalias | ABISMO-ENM-001 | Pendente | - |
| 40 | Chefes Fixos de Fim de Bioma | ABISMO-ENM-002 | Parcial | As Fases/HP engatilhadas mas sem polimento autêntico. |
| 41 | Chefes Modulares | ABISMO-ENM-003 | Pendente | Arquétipos hibridizados da profundidade. |
| 42 | Profundidade Abissal Infinita | ABISMO-MAP-002 | Pendente | Tabela base existe; escalonamento ad infinitum não estressado. |
| 43 | Seleção de Biomas 5-8 na Seed | ABISMO-MAP-001 | Pendente | Filtros ausentes para partidas curtas. |
| 44 | Narrativa, História e Lore | ABISMO-NPC-001 | Pendente | - |
| 45 | NPCs procedurais e Quests | ABISMO-NPC-001 | Pendente | - |
| 46 | HUD / Interface Gráfica | ABISMO-HUD-001 | Parcial | Necessita revisão premium de Acessibilidade. |
| 47 | Efeitos e Animações (Pixels) | ABISMO-GFX-001 | Parcial | Assets fallbacks. |
| 48 | Áudio, BGM e SFX | ABISMO-SND-001 | Pendente | Não há som ainda. |
| 49 | IndexedDB Saves e Múltiplos Slots | ABISMO-SAV-001 | Validado | Transições arquivadas sem dados corrompidos. |
