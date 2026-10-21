# Visão canônica e GDD consolidado — Abismo

> **Tipo:** consolidação de design para Antigravity, atualizada em 2026-10-21.
> **Origem:** decisões comunicadas no desenvolvimento e textos históricos do repositório. **Este documento NÃO é uma transcrição integral do GDD original de 49 seções**; a matriz de rastreabilidade de 49 tópicos está em [Rastreabilidade](../04-gestao/RASTREABILIDADE_GDD.md). Onde faltam especificações fechadas, há indicação de pendência.
> **Atenção:** “regra desejada” não é “implementação comprovada”.

## 1. Identidade do jogo

- **Nome:** Abismo.
- **Gênero:** RPG de ação em tempo real, exploração top-down, combate souls-like, estrutura de salas e mundo procedural.
- **Referências de intenção:** combate preciso e punitivo, leitura de ataques, esquiva, bloqueio, parry, poise, builds variadas, chefes memoráveis e exploração com risco/recompensa.
- **Pilares:** jogador compreende o motivo da derrota; domínio de timings importa; progressão recompensa desafio; salas procedurais permanecem navegáveis; itens únicos e descobertas importam.
- **Linguagem visual atual desejada:** ASCII art de altíssima densidade, com anatomia, materialidade, profundidade, luz/sombra e animações, não apenas símbolos de roguelike clássico.
- **Stack mantida:** Phaser 4.2.1, Vite 8.3 e JavaScript ESM. Sem React, sem recriar motor do zero.

## 2. Loop principal esperado

1. Selecionar/criar save e seed.
2. Iniciar área/sala; explorar rotas principais e opcionais.
3. Enfrentar monstros, elites e chefes, descobrindo mecânicas do bioma.
4. Obter XP, itens, melhorias e recursos de recuperação.
5. Descansar em santuários, gerenciar build e recuperar recursos segundo as regras de jogo.
6. Progredir para novos biomas/áreas e, posteriormente, profundidades cada vez maiores.
7. Em morte, lidar com perda/recuperação da orbe de XP, mantendo consistência do save e respawn.

## 3. Controles e combate

- Movimento em **oito direções**; corrida com gasto de stamina.
- Ataque leve, pesado/carregado e possibilidades de combos e ataques situacionais, quando configurados.
- Esquiva com janela de invulnerabilidade (i-frames); custo de stamina e consequências de erro.
- Bloqueio, quebra de guarda, **parry** com janela de referência de **200 ms**, contra-ataques e poise/stagger.
- Dano influenciado por ataque, defesa e crítico. Fórmula intencional descrita nas discussões: **dano = Ataque × (1 − Defesa / (2,5 × Ataque))**, truncado em zero quando defesa for ao menos 2,5 vezes o ataque efetivo. Confirmar implementação exata em DamageSystem antes de ajustar balanceamento.
- Crítico é processado antes da mitigação de defesa, conforme design discutido; efeitos elementais exigem testes próprios.
- Toda arma precisa ter distância, tempo, hitbox e comportamento coerentes, não apenas multiplicadores numéricos.
- O jogador deve conseguir reconhecer o estado por pose/efeito/feedback visual sem perder responsividade.

## 4. Progressão, atributos e XP

- Cinco atributos principais: **Vigor, Força, Destreza, Resistência e Arcano**; distribuição de pontos manual.
- XP é o recurso central para subir nível, aprimorar e outras despesas especificadas; evitar adicionar moedas paralelas sem decisão explícita.
- Escalonamento de níveis/depth deve comportar desafios grandes e o endgame infinito.
- Builds devem preservar distinções e tradeoffs, com soft caps quando previstos no balanceamento.
- Mortes derrubam uma orbe de XP; o XP é recuperado ao alcançá-la antes da morte seguinte. A nova morte descarta a orbe anterior, segundo a especificação.
- Santuários funcionam como pontos de referência, progressão/descanso e proteção: não gerar inimigos na sala segura.

## 5. Desafio de disparidade de níveis

A diferença relevante é **nível do inimigo − nível do jogador capturado no início do combate**, impedindo manipulação pelo nível ganho durante a luta. Escalonamento pretendido:

| Diferença ao iniciar | Bônus de pontos | Item extra | Observação |
|---|---:|---|---|
| +50 ou mais | +5 | Não especificado nesse tier | Faixa 1 |
| +100 ou mais | +10 | Raro | Faixa 2 |
| +150 ou mais | +20 | Épico | Faixa 3 |
| +200 ou mais | +30 | Arma única + item único + recompensa especial a definir | Faixa 4/cap do bônus |

- Aplicar apenas a faixa mais alta, não somar todas as faixas.
- A recompensa da faixa +200 é tema que exige especificação adicional para impedir duplicatas de itens **Únicos** e definir a recompensa especial.
- Referências de código: **src/progression/AbyssChallengeSystem.js** e **src/data/balance.js**. O código atual retorna uma categoria de item, mas o item concreto, o histórico de unicidade e a integração visual exigem verificação.

## 6. Armas, armaduras e itens

### Armas

Famílias previstas: adagas, espadas, espadas pesadas/colossais, machados, martelos, lanças, foices, arcos e especiais. A documentação histórica descreve **9 famílias**; conferir as chaves concretas em src/data/weapons.js.

- Ataques e hitboxes característicos, velocidade, alcance, stamina, escalonamento, animações e habilidades especiais.
- Upgrades de armas por XP, sem transformação de raridade em Único.
- Sem durabilidade de equipamento.
- Não usar bloqueio rígido de nível para equipar: equipamento acima do recomendado pode ser usado com penalidades.

### Armaduras

- Quatro slots de armadura.
- Penalidade intencional de arma acima do nível recomendado: **inutilizar/remover funcionalmente duas peças de armadura** segundo regra do GDD. Confirmar cálculo e UI.
- Defesa muito superior ao ataque pode resultar em dano zero conforme fórmula.
- Upgrades e custos precisam de rastreabilidade na economia de XP.

### Raridade

Progressão de raridade prevista de **Comum a Único**, passando por categorias intermediárias documentadas no sistema. **Lendário e Único não são equivalentes**; itens únicos são recompensas especiais e não devem ser obtidos por aprimorar itens comuns. Lendários e únicos podem ter restrições de origem por chefes, conforme regras de drop.

**Invariante:** um item marcado Único não pode ser obtido duas vezes no mesmo histórico de save, inclusive após salvar e carregar. Não presumir que verificar o ID de evento de recompensa resolve unicidade de item.

## 7. Elementos e condições de status

Combate utiliza acumulação de efeitos elementais/status, resistências e condições temporárias. Os arquivos centrais são **StatusEffectSystem.js** e dados de balanceamento. A documentação do projeto refere **oito tipos de efeito**; o agente deve enumerá-los pela lista efetiva de código e pelo GDD original antes de tratar IDs, resistências ou imunidades como definitivos.

Efeitos de ambiente (veneno, água, queimadura etc.) devem conectar-se à mesma lógica de estados do jogador sem criar penalidades ocultas inconsistentes.

## 8. Estrutura do mundo

- Áreas compostas de salas procedurais, rotas necessárias, ramificações opcionais, santuário e chefe.
- Seed reproduzível, RNG isolado por área e sala; conectividade global via grafo e validação das passagens.
- Perfis arquitetônicos por bioma, sem depender somente de mudança de cor.
- Portas e transições não podem causar softlock nem deixar resíduos de inimigos/hazards de salas anteriores.
- A proposta original menciona variedade de extensão de partida (seleção de 5–8 biomas) e profundidade abissal sem teto prático; confirmar fluxo desejado antes de implementar seleção de rota.

## 9. Os dez biomas oficiais (nomes de design e IDs atuais)

| ID técnico em src/data/biomes.js | Nome |
|---|---|
| ARREDORES_CINZENTOS | Os Arredores Cinzentos |
| AQUEDUTO_SUBMERSO | O Aqueduto Submerso |
| CATACUMBAS_ECOANTES | As Catacumbas Ecoantes |
| FORJA_MACULADA | A Forja Maculada |
| JARDIM_PUTRIDO | O Jardim Pútrido |
| CIDADE_SUBTERRANEA | A Cidade Subterrânea |
| ABISMO_CRISTALINO | O Abismo Cristalino |
| CARCERE_DE_SANGUE | O Cárcere de Sangue |
| BIBLIOTECA_DO_OCULTO | A Biblioteca do Oculto |
| CORACAO_DO_ABISMO | O Coração do Abismo |

Cada bioma precisa unir: layout característico, paleta, hazard, inimigos, elites, chefe, partículas, arte ASCII apropriada e identidade sonora/narrativa. Detalhes estão no [guia de biomas](../02-mundo/GUIA_DE_BIOMAS.md).

## 10. Inimigos e chefes

- Inimigos comuns, variações de arquétipo, elites e 10 chefes com identidades diferentes.
- IA de aproximação, ataque, telegraph, defesa/postura e resistências, respeitando limites de cada entidade.
- Chefes com fases e padrões distintos; no modo infinito, chefes podem combinar módulos e características segundo um construtor configurável.
- Existência de templates/dados por bioma no código **não significa** que todos os 10 tenham sido testados no navegador.

## 11. Direção artística: ASCII detalhada

O cavaleiro enviado como referência fixa o **patamar de acabamento**, não é um padrão para copiar a mesma silhueta em todos os assets.

- Glifos densos (@, %, #, *, +, =, -, :, . e variações) usados para anatomia, luz/sombra e materiais.
- Personagem com elmo, rosto/visores, ombros, braços, mãos, armas fisicamente ligadas, pernas, botas e manto.
- Estados de idle, caminhada, corrida (se existir), ataque, bloqueio, parry, esquiva, dano e morte; direção/pose compatível com top-down.
- Água com camadas, reflexos, espuma, profundidade e animação; rochas, paredes e blocos com juntas, fendas e desgaste.
- Chefes e inimigos próprios, sem letras substituindo entidades inteiras.
- Biblioteca de arte, renderizador, integração e testes de resolução/performance separados. Veja [especificação de arte](../03-conteudo/DIRECAO_ARTISTICA_ASCII.md).

## 12. História, NPCs e áudio

- Mundo sombrio com narrativa ambiental, descobertas, NPCs e missões a construir em dados separados do motor quando possível.
- Possibilidade futura de diálogos/questões por bioma, rastreamento de eventos e santuários.
- Música e efeitos por bioma e evento de combate; preferências persistidas e tratamento adequado de dispositivos e acessibilidade.
- **História detalhada, personagem protagonista, textos definitivos e trilhas sonoras** não estão suficientemente especificados neste documento: não inventar canon em uma tarefa técnica.

## 13. Recursos futuros: competição assíncrona

- Fantasmas/“ghosts”, mensagens, rastros de runs e classificações de profundidade foram discutidos como recursos futuros.
- A intenção é competir com o registro anterior de outro jogador ou consigo mesmo **sem implementar multiplayer em tempo real**.
- Antes de projetar rede/saves externos, definir dados de replay, versão, seed, determinismo, anti-trapaça e consentimento.
- Ver [especificação de fantasmas](../03-conteudo/FANTASMAS_ASSINCRONOS.md).

## 14. Limites do documento

1. Se existir versão integral do GDD fora do repositório, ela ainda precisa ser importada **sem substituir silenciosamente** o conteúdo consolidado.
2. Status detalhados estão no [backlog](../04-gestao/BACKLOG_ANTIGRAVITY.md) e no [checklist legado](../TAREFAS_ABISMO.md).
3. Divergências entre codebase de 2026-10-21 e auditoria de 2026-10-09 constam no [registro de divergências](../04-gestao/REGISTRO_DE_DIVERGENCIAS.md).
4. Este documento estabelece o comportamento **pretendido**; valide código e gameplay separadamente.
