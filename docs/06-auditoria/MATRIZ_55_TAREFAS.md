# Matriz dos 55 IDs legados — status histórico x evidência atual

> **Data:** 2026-10-21. Este documento faz reconciliação documental dos 55 IDs encontrados nos nove documentos de tarefas legados.
>
> **Regra de interpretação:** a coluna **Status histórico** reproduz o registro de 09/10 e **não é um novo selo de validação**. A coluna **Evidência atual** informa o que de fato foi inspecionado ou testado neste ciclo. “Sem teste específico” não quer dizer inexistente.
>
> **Sem falsear progresso:** como não foi feita sessão de gameplay completa no browser, os percentuais 25/55 + etc. continuam **snapshot histórico**, não números atualizados do jogo.
>
> [Relatório de código](AUDITORIA_CODIGO_2026-10-21.md) · [Checklist mestre](../TAREFAS_ABISMO.md) · [Plano de QA](../04-gestao/PLANO_DE_VALIDACAO.md)

## Os 55 itens originais, um por um

| ID | Tarefa | Estado descrito em 09/10 | Evidência parcial de 21/10 | Origem |
|---|---|---|---|---|
| `ABISMO-ARM-001` | Slots, status e penalidades de desnível | Validado no relatório antigo (09/10) | Código inspecionado no contexto da auditoria; **sem teste específico concluído neste ciclo**. | [Fonte](../01-gameplay/ARMAS_EQUIPAMENTOS_E_ITENS.md) |
| `ABISMO-ARM-002` | Aprimoramentos (+0 a +20) e Raridades | Implementado não validado no relatório antigo | Código inspecionado no contexto da auditoria; **sem teste específico concluído neste ciclo**. | [Fonte](../01-gameplay/ARMAS_EQUIPAMENTOS_E_ITENS.md) |
| `ABISMO-BIO-001` | Arredores Cinzentos | Validado no relatório antigo (09/10) | Geração de bioma/pools testada; hazard específico e ASCII **não testados no jogo**. | [Fonte](../02-mundo/BIOMAS.md) |
| `ABISMO-BIO-002` | Aqueduto Submerso | Validado no relatório antigo (09/10) | Geração de bioma/pools testada; hazard específico e ASCII **não testados no jogo**. | [Fonte](../02-mundo/BIOMAS.md) |
| `ABISMO-BIO-003` | Catacumbas Ecoantes | Validado no relatório antigo (09/10) | Geração de bioma/pools testada; hazard específico e ASCII **não testados no jogo**. | [Fonte](../02-mundo/BIOMAS.md) |
| `ABISMO-BIO-004` | Forja Maculada | Validado no relatório antigo (09/10) | Geração de bioma/pools testada; hazard específico e ASCII **não testados no jogo**. | [Fonte](../02-mundo/BIOMAS.md) |
| `ABISMO-BIO-005` | Jardim Pútrido | Validado no relatório antigo (09/10) | Geração de bioma/pools testada; hazard específico e ASCII **não testados no jogo**. | [Fonte](../02-mundo/BIOMAS.md) |
| `ABISMO-BIO-006` | Cidade Subterrânea | Validado no relatório antigo (09/10) | Geração de bioma/pools testada; hazard específico e ASCII **não testados no jogo**. | [Fonte](../02-mundo/BIOMAS.md) |
| `ABISMO-BIO-007` | Abismo Cristalino | Validado no relatório antigo (09/10) | Geração de bioma/pools testada; hazard específico e ASCII **não testados no jogo**. | [Fonte](../02-mundo/BIOMAS.md) |
| `ABISMO-BIO-008` | Cárcere de Sangue | Validado no relatório antigo (09/10) | Geração de bioma/pools testada; hazard específico e ASCII **não testados no jogo**. | [Fonte](../02-mundo/BIOMAS.md) |
| `ABISMO-BIO-009` | Biblioteca do Oculto | Validado no relatório antigo (09/10) | Geração de bioma/pools testada; hazard específico e ASCII **não testados no jogo**. | [Fonte](../02-mundo/BIOMAS.md) |
| `ABISMO-BIO-010` | Coração do Abismo | Validado no relatório antigo (09/10) | Geração de bioma/pools testada; hazard específico e ASCII **não testados no jogo**. | [Fonte](../02-mundo/BIOMAS.md) |
| `ABISMO-CHA-001` | Multiplicadores de Recompensa nos Níveis (+50 a +200) | Implementado não validado no relatório antigo | Tiers e pontos testados (+50/+100/+150/+200); item concreto/recompensa especial +200 **incompletos**. | [Fonte](../01-gameplay/PROGRESSAO_E_DESAFIOS.md) |
| `ABISMO-DTH-001` | XP e Morte (Perda total / Orbe) | Validado no relatório antigo (09/10) | XPSystem segunda morte/recuperação em teste unitário; orbe visual/reload real pendente. | [Fonte](../01-gameplay/PROGRESSAO_E_DESAFIOS.md) |
| `ABISMO-DTH-002` | Respawn em Santuários, Cura, Levels e Mobs | Validado no relatório antigo (09/10) | Código inspecionado no contexto da auditoria; **sem teste específico concluído neste ciclo**. | [Fonte](../01-gameplay/PROGRESSAO_E_DESAFIOS.md) |
| `ABISMO-ENM-001` | Pools de inimigos por bioma, elites e anomalias | Pendente no relatório antigo | Referências de enemyPool/elitePool e templates verificadas; combate e spawns reais pendentes. | [Fonte](../02-mundo/INIMIGOS_E_CHEFES.md) |
| `ABISMO-ENM-002` | Chefes base de biomas (Obrigatórios/Opcionais) | Implementado não validado no relatório antigo | Referências de bossPool e templates dos 10 biomas verificadas; fases reais pendentes. | [Fonte](../02-mundo/INIMIGOS_E_CHEFES.md) |
| `ABISMO-ENM-003` | Geração Modular de Chefes (Profundidade) | Pendente no relatório antigo | Código inspecionado no contexto da auditoria; **sem teste específico concluído neste ciclo**. | [Fonte](../02-mundo/INIMIGOS_E_CHEFES.md) |
| `ABISMO-FUT-001` | Multiplayer Fantasma e Leaderboards | Pendente no relatório antigo | Código inspecionado no contexto da auditoria; **sem teste específico concluído neste ciclo**. | [Fonte](../04-gestao/FUTURO_E_MVP.md) |
| `ABISMO-GFX-001` | Animações Finais, Pixels Definitivos e Partículas | Parcial no relatório antigo | Biblioteca ASCII e compilação verificadas; sprites/anim. em gameplay ainda não validados. | [Fonte](../03-conteudo/INTERFACE_AUDIO_E_SAVE.md) |
| `ABISMO-HEL-001` | Cargas de Cura (Frascos) | Validado no relatório antigo (09/10) | Código inspecionado no contexto da auditoria; **sem teste específico concluído neste ciclo**. | [Fonte](../01-gameplay/PROGRESSAO_E_DESAFIOS.md) |
| `ABISMO-HEL-002` | Upgrades permanentes e Materiais Consumíveis | Pendente no relatório antigo | Código inspecionado no contexto da auditoria; **sem teste específico concluído neste ciclo**. | [Fonte](../01-gameplay/PROGRESSAO_E_DESAFIOS.md) |
| `ABISMO-HUD-001` | Layout Geral, Inventário UI e Status | Parcial no relatório antigo | Código inspecionado no contexto da auditoria; **sem teste específico concluído neste ciclo**. | [Fonte](../03-conteudo/INTERFACE_AUDIO_E_SAVE.md) |
| `ABISMO-HUD-002` | Joystick e Inputs Personalizáveis | Pendente no relatório antigo | Código inspecionado no contexto da auditoria; **sem teste específico concluído neste ciclo**. | [Fonte](../03-conteudo/INTERFACE_AUDIO_E_SAVE.md) |
| `ABISMO-INV-001` | Bolsas, Categorias, Loot comum e Relíquias | Validado no relatório antigo (09/10) | Código inspecionado no contexto da auditoria; **sem teste específico concluído neste ciclo**. | [Fonte](../01-gameplay/ARMAS_EQUIPAMENTOS_E_ITENS.md) |
| `ABISMO-INV-002` | Únicos não-repetíveis e tabelas de Chefes | Pendente no relatório antigo | Histórico de ID de item Único implementado e teste de serialize/deserialize aprovado; fluxo real de loot pendente. | [Fonte](../01-gameplay/ARMAS_EQUIPAMENTOS_E_ITENS.md) |
| `ABISMO-MAP-001` | Limitação a 5-8 biomas na seed principal | Pendente no relatório antigo | Código inspecionado no contexto da auditoria; **sem teste específico concluído neste ciclo**. | [Fonte](../02-mundo/GERACAO_E_ENDGAME.md) |
| `ABISMO-MAP-002` | A Profundidade Abissal Infinita | Pendente no relatório antigo | Código inspecionado no contexto da auditoria; **sem teste específico concluído neste ciclo**. | [Fonte](../02-mundo/GERACAO_E_ENDGAME.md) |
| `ABISMO-MVP-001` | MVP e Ciclo Core (GDD) | Validado no relatório antigo (09/10) | Código inspecionado no contexto da auditoria; **sem teste específico concluído neste ciclo**. | [Fonte](../04-gestao/FUTURO_E_MVP.md) |
| `ABISMO-NPC-001` | História Ambiental, Lore e NPCs Seedados | Pendente no relatório antigo | Código inspecionado no contexto da auditoria; **sem teste específico concluído neste ciclo**. | [Fonte](../03-conteudo/NARRATIVA.md) |
| `ABISMO-PLY-001` | Movimentação base e corrida | Validado no relatório antigo (09/10) | Leitura estática de Player + teste unitário de stamina; **sem teste de movimento no navegador**. | [Fonte](../01-gameplay/JOGADOR_E_COMBATE.md) |
| `ABISMO-PLY-002` | Esquiva e invulnerabilidade | Validado no relatório antigo (09/10) | Código da esquiva inspecionado; parry não substitui teste de iframe. **Pendente gameplay**. | [Fonte](../01-gameplay/JOGADOR_E_COMBATE.md) |
| `ABISMO-PLY-003` | Ataques leves e pesados | Parcial no relatório antigo | Cálculo de ataque pesado corrigido em GameScene; **pendente ataque/hitbox em gameplay**. | [Fonte](../01-gameplay/JOGADOR_E_COMBATE.md) |
| `ABISMO-PLY-004` | Combos e ataques durante esquiva | Pendente no relatório antigo | Código inspecionado no contexto da auditoria; **sem teste específico concluído neste ciclo**. | [Fonte](../01-gameplay/JOGADOR_E_COMBATE.md) |
| `ABISMO-PLY-005` | Bloqueio, quebra de guarda e parry | Validado no relatório antigo (09/10) | Teste unitário de parry (200 ms) e stamina aprovado; **bloqueio real/guarda pendentes**. | [Fonte](../01-gameplay/JOGADOR_E_COMBATE.md) |
| `ABISMO-PLY-006` | Contra-ataques após bloqueio | Pendente no relatório antigo | Código inspecionado no contexto da auditoria; **sem teste específico concluído neste ciclo**. | [Fonte](../01-gameplay/JOGADOR_E_COMBATE.md) |
| `ABISMO-PLY-007` | Stagger, equilíbrio e crítico | Validado no relatório antigo (09/10) | Teste unitário de dano/defesa/crítico aprovado; poise/stagger em combate real pendente. | [Fonte](../01-gameplay/JOGADOR_E_COMBATE.md) |
| `ABISMO-PRG-001` | Vigor, Força, Destreza, Resistência e Arcano | Validado no relatório antigo (09/10) | Teste automatizado de alocação de atributos; validação da UI pendente. | [Fonte](../01-gameplay/PROGRESSAO_E_DESAFIOS.md) |
| `ABISMO-PRG-002` | Level-up manual, limites e XP acumulada | Validado no relatório antigo (09/10) | Código inspecionado no contexto da auditoria; **sem teste específico concluído neste ciclo**. | [Fonte](../01-gameplay/PROGRESSAO_E_DESAFIOS.md) |
| `ABISMO-PRG-003` | Escalamento de armas e níveis extremos | Parcial no relatório antigo | Código inspecionado no contexto da auditoria; **sem teste específico concluído neste ciclo**. | [Fonte](../01-gameplay/PROGRESSAO_E_DESAFIOS.md) |
| `ABISMO-SAV-001` | IndexedDB, Sessões, Seeds e Integridade | Validado no relatório antigo (09/10) | Serialização/teste legado de SaveSystem aprovados; IndexedDB no browser ainda não testado. | [Fonte](../03-conteudo/INTERFACE_AUDIO_E_SAVE.md) |
| `ABISMO-SND-001` | Integração de SFX e BGM | Pendente no relatório antigo | Código inspecionado no contexto da auditoria; **sem teste específico concluído neste ciclo**. | [Fonte](../03-conteudo/INTERFACE_AUDIO_E_SAVE.md) |
| `ABISMO-STA-001` | Buildups contínuos (Fogo, Gelo, Veneno, Sangramento, etc) | Validado no relatório antigo (09/10) | Código inspecionado no contexto da auditoria; **sem teste específico concluído neste ciclo**. | [Fonte](../01-gameplay/ARMAS_EQUIPAMENTOS_E_ITENS.md) |
| `ABISMO-STA-002` | Imunidades e resistência crescente | Pendente no relatório antigo | Código inspecionado no contexto da auditoria; **sem teste específico concluído neste ciclo**. | [Fonte](../01-gameplay/ARMAS_EQUIPAMENTOS_E_ITENS.md) |
| `ABISMO-WLD-001` | Estruturas e conectividade seguras | Validado no relatório antigo (09/10) | Geração determinística e portas bidirecionais testadas em 10 biomas; navegação real pendente. | [Fonte](../02-mundo/GERACAO_E_ENDGAME.md) |
| `ABISMO-WLD-002` | Segredos, Cavernas Extras, Eventos e Spawn Variado | Pendente no relatório antigo | Código inspecionado no contexto da auditoria; **sem teste específico concluído neste ciclo**. | [Fonte](../02-mundo/GERACAO_E_ENDGAME.md) |
| `ABISMO-WPN-001` | Adagas | Parcial no relatório antigo | Fonte possui **6 famílias**, versus 9 pretendidas no GDD; família/moveset/hitbox deste ID **exigem auditoria específica**. | [Fonte](../01-gameplay/ARMAS_EQUIPAMENTOS_E_ITENS.md) |
| `ABISMO-WPN-002` | Espadas | Parcial no relatório antigo | Fonte possui **6 famílias**, versus 9 pretendidas no GDD; família/moveset/hitbox deste ID **exigem auditoria específica**. | [Fonte](../01-gameplay/ARMAS_EQUIPAMENTOS_E_ITENS.md) |
| `ABISMO-WPN-003` | Espadas pesadas | Parcial no relatório antigo | Fonte possui **6 famílias**, versus 9 pretendidas no GDD; família/moveset/hitbox deste ID **exigem auditoria específica**. | [Fonte](../01-gameplay/ARMAS_EQUIPAMENTOS_E_ITENS.md) |
| `ABISMO-WPN-004` | Machados | Parcial no relatório antigo | Fonte possui **6 famílias**, versus 9 pretendidas no GDD; família/moveset/hitbox deste ID **exigem auditoria específica**. | [Fonte](../01-gameplay/ARMAS_EQUIPAMENTOS_E_ITENS.md) |
| `ABISMO-WPN-005` | Martelos | Parcial no relatório antigo | Fonte possui **6 famílias**, versus 9 pretendidas no GDD; família/moveset/hitbox deste ID **exigem auditoria específica**. | [Fonte](../01-gameplay/ARMAS_EQUIPAMENTOS_E_ITENS.md) |
| `ABISMO-WPN-006` | Lanças | Parcial no relatório antigo | Fonte possui **6 famílias**, versus 9 pretendidas no GDD; família/moveset/hitbox deste ID **exigem auditoria específica**. | [Fonte](../01-gameplay/ARMAS_EQUIPAMENTOS_E_ITENS.md) |
| `ABISMO-WPN-007` | Foices | Parcial no relatório antigo | Fonte possui **6 famílias**, versus 9 pretendidas no GDD; família/moveset/hitbox deste ID **exigem auditoria específica**. | [Fonte](../01-gameplay/ARMAS_EQUIPAMENTOS_E_ITENS.md) |
| `ABISMO-WPN-008` | Arcos | Parcial no relatório antigo | Fonte possui **6 famílias**, versus 9 pretendidas no GDD; família/moveset/hitbox deste ID **exigem auditoria específica**. | [Fonte](../01-gameplay/ARMAS_EQUIPAMENTOS_E_ITENS.md) |
| `ABISMO-WPN-009` | Armas Especiais e Habilidades Ativas (Spells) | Pendente no relatório antigo | Fonte possui **6 famílias**, versus 9 pretendidas no GDD; família/moveset/hitbox deste ID **exigem auditoria específica**. | [Fonte](../01-gameplay/ARMAS_EQUIPAMENTOS_E_ITENS.md) |

## Critério para atualizar o status oficial

1. **Código encontrado:** caminho, função e commit citados. Não confundir com teste.
2. **Teste automatizado:** nome e resultado do teste; cobertura do caso específico, não do sistema todo.
3. **Teste jogável:** seed/sala/bioma, ambiente, ação, resultado, log e screenshot quando visual.
4. **Mudança de status:** atualizar o documento temático e o checklist mestre, com evidência e data; recalcular os totais uma única vez a partir dos 55 itens.
5. **Tarefa operacional nova:** o backlog de 56 subtarefas é complementar, não deve ser somado a esses 55 IDs para percentual.

## O que esta matriz não cobre

- GDD autoral completo de 49 seções (a matriz histórica é apenas rastreabilidade).
- Testes em todos os aparelhos/navegadores.
- Metragens de FPS da arte ASCII ou estados visuais de cada boss.
- Métricas de cobertura de statements/branches do código inteiro; foram criados testes dirigidos a invariantes e rotas de dados.

**Próximo passo do Antigravity:** realizar QA por bioma e sistema com os roteiros, anexar logs e só então declarar um novo número de progresso.
