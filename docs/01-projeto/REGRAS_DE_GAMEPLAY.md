# Regras e invariantes de gameplay — Abismo

> **Fonte:** design consolidado a partir de decisões de desenvolvimento; o código deve ser confrontado antes de alterar status. [GDD consolidado](VISAO_CANONICA_E_GDD.md) · [Tarefas](../04-gestao/BACKLOG_ANTIGRAVITY.md)

## COMB-01 — Combate em tempo real

**Regra:** o jogador controla movimento 8-way, corrida, ataques, esquiva, defesa, parry, cura e interação. A transição entre estados deve impedir ações incompatíveis sem travar o personagem.

**Invariantes**
- Esquiva consome stamina e concede i-frames somente na janela programada.
- Bloqueio afeta dano e stamina; a quebra de guarda produz consequência visível.
- Parry tem janela de referência de **200 ms**. Não ampliar o timing inadvertidamente para acompanhar a duração do sprite.
- Ataque leve, pesado, dodge attack e block counter têm regras distintas; a mudança de arte não altera alcance/frames de dano.
- Recuperação e stun precisam impedir spam de inputs sem tornar o player incontrolável.
- Feedback visual e hitbox obedecem aos mesmos eventos lógicos; animar uma arma não muda a colisão, salvo tarefa explícita de combate.

**Aceitação:** testes em 8 direções; esquiva e parry em limite da janela; bloqueio até zerar stamina; ataque cancelado/permitido somente nas transições previstas; nenhuma regressão com sprites ASCII grandes.

## COMB-02 — Dano, defesa, crítico e poise

**Referência de design:** dano calculado com ataque efetivo A e defesa D como max(0, A × (1 − D/(2,5×A))) para A positivo. A regra específica de arredondamento deve ser extraída de DamageSystem. Quando D ≥ 2,5×A, dano físico resultante é zero.

**Invariantes**
- Crítico antes da defesa, de acordo com design; separar multiplicadores situacionais e efeitos de status.
- Dano não deve gerar NaN/Infinity para ataque zero ou defesa extrema.
- Poise/stagger dependem de valores e limiares; não se tornam um efeito puramente visual.
- Efeitos elementais/buildup devem ter fontes, duração, acúmulo, limpeza e resistências definidas em um só lugar.

**Aceitação:** cenários de ataque baixo/alto, zero, defesa limite, crítico, poise e múltiplos status, com resultado calculado manualmente e comparado à implementação.

## PROG-01 — XP e atributos

**Regra:** XP é o recurso central. Cinco atributos alocáveis manualmente: Vigor, Força, Destreza, Resistência, Arcano.

**Invariantes:** custos consistentes, soft caps aplicados onde especificados, sem perda de nível em reload, sem duplicar XP com a mesma recompensa, UI exibindo custo e efeito reais.

**Aceitação:** comprar pontos, salvar/carregar, conferir custos progressivos e limites de atributos.

## PROG-02 — Desafio acima do próprio nível

- Capturar no início do combate a diferença de nível do inimigo menos nível do jogador.
- +50: 5 pontos; +100: 10 pontos + item raro; +150: 20 pontos + item épico; +200+: 30 pontos + recompensa de unicidade e especial a especificar.
- Um único tier por vitória, o maior alcançado. Diferença máxima **para bônus de pontos** é +200.
- O ID de evento de combate (ex.: timestamp) **não é substituto** de um identificador de item único persistido no save.
- Se o jogador repetir um boss/combate, o sistema não pode distribuir uma segunda cópia do mesmo item único.

**Aceitação:** diferenças 49/50/99/100/149/150/199/200/350; batalha iniciada antes de level-up; reload entre recompensa e confirmação.

## ITEM-01 — Equipamento, itens e raridade

- Nove famílias de armas previstas, cada uma com ataques e alcance apropriados.
- Quatro slots de armadura.
- Não impedir equipar arma de nível maior; aplicar penalidade definida (duas peças de armadura deixam de funcionar).
- Upgrades pagos com XP, faixa pretendida +0 a +20 onde aplicável.
- **Único** não é evolução de upgrade nem item farmável repetidamente no mesmo save.
- Lendário não é Único. Chefes e regras de drop precisam distinguir origem de raridade e upgrade.
- Sem durabilidade; não inserir manutenção de desgaste.

**Aceitação:** equipar arma acima de requisitos; conferir 2 slots afetados e restauração ao remover; testar combos por família; duplicata de único antes/depois de save.

## WORLD-01 — Seed e navegabilidade

- Todas as decisões procedurais que alteram mapa, pool, tesouro ou caminho exigem RNG determinístico derivado de seed.
- Grafo precisa ligar entrada, salas necessárias, santuário e boss. Portas correspondem entre vizinhos e caminhos críticos são alcançáveis.
- Sala de santuário sem spawn hostil. Spawn de inimigos evita sobrepor o jogador (distância mínima relatada de 140px; validar valor atual).
- Hazards não podem obstruir a única conexão da sala ou prender o personagem em um loop.
- Transição limpa entidades/eventos anteriores e preserva HP, stamina, status e save conforme regra da mecânica.

**Aceitação:** repetir seed, validar rota, descanso e respawn, transitar N/S/L/O e garantir ausência de estado fantasma.

## SAVE-01 — Persistência e morte

- Save local via IndexedDB, com slots coerentes.
- Morte gera orbe de XP; uma segunda morte antes da recuperação elimina a orbe anterior.
- Itens únicos obtidos, equipamentos, atributos, progressão e checkpoints devem sobreviver ao reload conforme configuração vigente.
- Alteração do schema exige migração ou versão; não destruir saves para facilitar uma feature.
- Validar interrupção entre prêmio, autosave e transição de área.

## ART-01 — Visual não altera física

A ilustração ASCII pode ter dezenas/centenas de caracteres e textura pré-renderizada maior que o corpo físico. **Dimensão visual ≠ hitbox**. Proteger origem, escala, offsets, depth, tint e alinhamento de ataques; personagem deve continuar legível na câmera top-down.

**Aceitação:** medir posição da sprite e do corpo em idle, walk, dodge e ataque; não detectar colisão fantasma ao trocar texturas.

## ROADMAP-01 — Regras de priorização

Primeiro regressões e integridade de save; depois interface entre sistemas; depois conteúdo e arte; recursos assíncronos e backend apenas após contrato de dados. Qualquer proposta diferente deve constar no [registro de decisões](DECISOES_PENDENTES.md).
