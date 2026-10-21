# Decisões abertas e perguntas de especificação

> Este documento impede que um agente invente regras definitivas. Não é bloqueio para leitura, organização, QA ou tarefas já suficientemente definidas.

| ID | Decisão ainda não fechada | O que pode ser feito agora | O que **não** assumir |
|---|---|---|---|
| DEC-001 | Texto integral do GDD de 49 seções | Usar [GDD consolidado](VISAO_CANONICA_E_GDD.md) e matriz histórica | Que a matriz seja o texto integral do GDD |
| DEC-002 | Recompensa especial de +200 níveis | Validar tiers, unicidade e persistence | Item especial com efeito/nome inventado |
| DEC-003 | Lista final de raridades e restrições por categoria | Conferir dados do código e documento histórico | Que qualquer lendário possa virar único |
| DEC-004 | Comportamento exato de animação ASCII em oito direções | Auditar quadros/texel density, propor teste em escala | Criar movimentos não previstos no input |
| DEC-005 | Layout definitivo de câmera/zoom e escala da arte ASCII | Medir legibilidade na resolução de jogo | Aumentar hitbox para acompanhar textura |
| DEC-006 | GDD final de NPCs, lore, quests e diálogos | Catalogar hooks e criar estrutura de dados | Criar narrativa canônica sozinho |
| DEC-007 | Fantasmas: formato de replay e quem pode publicar | Projetar schema e protótipo offline | Backend/multiplayer em tempo real |
| DEC-008 | Política de ranking global, temporada e moderação | Documentar proposta e privacidade | API pública, contas e ranking já aprovados |
| DEC-009 | Regras de partida de 5–8 biomas e modo infinito | Identificar código atual e caminhos possíveis | Que a seleção de biomas já exista |
| DEC-010 | Sons/trilhas específicas e licença dos arquivos | Projetar API, placeholders e preferências | Inserir obras protegidas sem licença |
| DEC-011 | Visual ASCII em dispositivos de menor potência | Benchmark e estratégia de cache | Renderizar dezenas de milhares de glifos por frame |
| DEC-012 | Consistência entre nomes antigos de biomas e IDs atuais | Usar os IDs vigentes no código | Renomear saves/dados para corresponder ao texto de 09/10 |

## Como resolver uma decisão

1. Confronte o **código atual** e as decisões explícitas de design.
2. Quando a decisão não afetar o escopo atual, registre e prossiga sem implementá-la.
3. Se realmente necessária, apresente 2–3 alternativas com consequências e solicite decisão do responsável.
4. Registre resultado com data, motivo, módulos afetados e novos testes de aceite.

**Importante:** não transformar uma escolha provisória de um agente em regra canônica sem registro.
