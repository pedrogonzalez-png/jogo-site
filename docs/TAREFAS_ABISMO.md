# ABISMO — CHECKLIST MESTRE DE DESENVOLVIMENTO

> **Data da última revisão:** 2026-10-09
> **Estado geral do projeto:** Protótipo jogável funcional com base de arquitetura procedural e combate concluídas. Os 10 biomas, chefes base e mecânicas ambientais operam, porém os sistemas de progressão escalável (pools de inimigos), variação de mecânicas de ataque de armas e refinamentos visuais encontram-se em estágio inicial ou pendentes.
> 
> **Resumo de Tarefas:**
> - [x] Implementado e validado: 25
> - [~] Implementado, mas não validado: 3
> - [-] Parcial: 12
> - [ ] Pendente: 15
> - [!] Bloqueado: 0
>
> **Resumo por Prioridades:**
> - P0 (Bloqueante): 0
> - P1 (Essencial): 23
> - P2 (Conteúdo principal): 25
> - P3 (Polimento): 6
> - P4 (Futuro): 1
> 
> **Próximas cinco tarefas recomendadas:**
> 1. **ABISMO-WPN-001 a 008:** As famílias de armas (Adagas à Arcos) precisam das hitboxes próprias, visto que o jogo atualmente depende de um fallback universal, impedindo a distinção de gameplay.
> 2. **ABISMO-ENM-001:** Criação de pools de inimigos comuns por bioma (atualmente repetindo clones), essencial para dar identidade a cada cenário.
> 3. **ABISMO-ENM-003:** Iniciar o construtor modular de chefes, garantindo que o Abismo infinito possa misturar atributos.
> 4. **ABISMO-CHA-001:** Testar a drop table de itens nas lutas com alta disparidade de level, assegurando recompensas corretas e justas.
> 5. **ABISMO-INV-002:** Garantir que itens Únicos (Unique) não caiam em duplicata no histórico de Drop Tables por Save.

---

## 6. COMO MANTER O CHECKLIST ATUALIZADO
- Reavalie os status com base no código atual.
- Marque tarefas concluídas somente com evidências objetivas ou referenciadas ao código.
- Adicione tarefas novas quando uma necessidade for descoberta.
- Preserve IDs e histórico.
- Não apague pendências sem justificativa clara.
- Atualize prioridades e dependências.
- Registre alterações relevantes nos sistemas.
- Distinga build, testes automatizados e validação dentro do jogo real.

---

## SEÇÃO A — Jogador e combate

- [x] **ABISMO-PLY-001 — Movimentação base e corrida** `[P1]` `[x] Implementado e validado`
  - **Objetivo:** Movimento em oito direções e transição para corrida.
  - **Arquivos:** `Player.js`.
  - **Dependências:** Sistema de input.
  - **Critério de conclusão:** Jogador se move em 8-way fluidamente e o sprint consome estamina de forma correta.
  - **Evidência atual:** Testes comprovaram transição e consumo de stamina funcionando perfeitamente em `Player.js`.

- [x] **ABISMO-PLY-002 — Esquiva e invulnerabilidade** `[P1]` `[x] Implementado e validado`
  - **Objetivo:** Esquiva com iframes e consumo de stamina.
  - **Arquivos:** `Player.js`.
  - **Dependências:** `ABISMO-PLY-001`.
  - **Critério de conclusão:** iframes anulam dano durante a animação de rolagem.
  - **Evidência atual:** `isInvincible` ativado no estado `DODGE` cancela recebimento de hits via `CombatSystem`.

- [-] **ABISMO-PLY-003 — Ataques leves e pesados** `[P1]` `[-] Parcial`
  - **Objetivo:** Diferenciar ataques comuns de carregados/pesados (consumo, timming e dano).
  - **Arquivos:** `Player.js`, `CombatSystem.js`.
  - **Dependências:** Sistema de armas.
  - **Critério de conclusão:** Dano e stamina variam entre ataques leves e pesados de acordo com GDD.
  - **Evidência atual:** Combate existe com hits padronizados e engatilhos iniciais de charge, mas falta diferenciação absoluta na entrada do jogador.

- [ ] **ABISMO-PLY-004 — Combos e ataques durante esquiva** `[P2]` `[ ] Pendente`
  - **Objetivo:** Encadeamento de ataques fluidos e strikes no meio do rolamento.
  - **Arquivos:** `Player.js`.
  - **Dependências:** `ABISMO-PLY-003`.
  - **Critério de conclusão:** Janela de input permite combos contínuos e variação de animação.
  - **Evidência atual:** Pendente.

- [x] **ABISMO-PLY-005 — Bloqueio, quebra de guarda e parry** `[P1]` `[x] Implementado e validado`
  - **Objetivo:** Mecânicas de defesa ativa e aparar (parry) perfeitamente para anular dano e estontear adversário.
  - **Arquivos:** `CombatSystem.js`, `DamageSystem.js`.
  - **Dependências:** `Player.js`.
  - **Critério de conclusão:** Parry exato anula dano e causa stagger; defesa comum consome stamina e quebra guarda.
  - **Evidência atual:** Testes comprovaram o acionamento de `STATE.BLOCK` e `STATE.PARRY`, e o recuo em hits no escudo com quebra de guarda funcionando na ausência de Vigor.

- [ ] **ABISMO-PLY-006 — Contra-ataques após bloqueio** `[P2]` `[ ] Pendente`
  - **Objetivo:** Habilidade de desferir hit rápido (contra-golpe) logo após bloquear um ataque comum e absorver impacto.
  - **Arquivos:** `Player.js`.
  - **Dependências:** `ABISMO-PLY-005`.
  - **Critério de conclusão:** Input aceito em curtíssimo momento (janela de oportunidade) pós-defesa bem sucedida.
  - **Evidência atual:** Pendente.

- [x] **ABISMO-PLY-007 — Stagger, equilíbrio e crítico** `[P1]` `[x] Implementado e validado`
  - **Objetivo:** Dano de equilíbrio contínuo (Poise) que rompe a postura e permite dano maior.
  - **Arquivos:** `BalanceSystem.js`, `DamageSystem.js`.
  - **Dependências:** Nenhuma.
  - **Critério de conclusão:** Inimigos (e player) staggados entram em animação vulnerável e os multiplicadores críticos aplicam.
  - **Evidência atual:** Sistema de postura atuando. Barra de poise quebrando ativa `STATE.STAGGER` e tinturas.

## SEÇÃO B — Atributos e progressão

- [x] **ABISMO-PRG-001 — Vigor, Força, Destreza, Resistência e Arcano** `[P1]` `[x] Implementado e validado`
  - **Objetivo:** Base de escalamento das classes do jogador com os 5 atributos exigidos no GDD.
  - **Arquivos:** `StatSystem.js`, `LevelSystem.js`.
  - **Dependências:** Nenhuma.
  - **Critério de conclusão:** Um ponto por nível alocável sem teto limitador, operando as soft-caps originais.
  - **Evidência atual:** Soft-caps e funções lineares de diminuição presentes no `StatSystem.js`.

- [x] **ABISMO-PRG-002 — Level-up manual, limites e XP acumulada** `[P1]` `[x] Implementado e validado`
  - **Objetivo:** Escolher onde gastar pontos nos santuários e manter a XP infinitamente guardada. Sem bloqueio ou max-level fixo.
  - **Arquivos:** `LevelSystem.js`, `GameScene.js`.
  - **Dependências:** Santuário interativo.
  - **Critério de conclusão:** A XP sobe com farming e a tabela permite que os atributos subam eternamente (crescimento no abismo). Nível do jogador desvinculado dos inimigos locais.
  - **Evidência atual:** Santuários possuem interface UI operante para gastos. A desvinculação ocorre (inimigos usam a *profundidade* para nível, não o nível do jogador).

- [-] **ABISMO-PRG-003 — Escalamento de armas e níveis extremos** `[P2]` `[-] Parcial`
  - **Objetivo:** Armas se beneficiam de letras (S,A,B,C,D,E) em atributos. Testes nos níveis colossais.
  - **Arquivos:** `WeaponSystem.js`.
  - **Dependências:** Atributos.
  - **Critério de conclusão:** Dano base da arma + (Bônus de Escalamento de Destreza ou Força, etc).
  - **Evidência atual:** As propriedades literais existem no construtor de armas e somam ao Attack Power, porém o balanceamento no Late Game com stats 99+ carece de testes estressados.

## SEÇÃO C — Armas

*(Nota: As categorias requerem frames de animação, hitbox poligonal/circular, alcance, stamina cost e stagger associados ao design estipulado no GDD, individualizados).*

- [-] **ABISMO-WPN-001 — Adagas** `[P1]` `[-] Parcial` (Extrema vel., alcance baixo, crítico alto). Faltam mecânicas.
- [-] **ABISMO-WPN-002 — Espadas** `[P1]` `[-] Parcial` (Dano e speed médios). Faltam hitboxes.
- [-] **ABISMO-WPN-003 — Espadas pesadas** `[P1]` `[-] Parcial` (Alto poise damage, lentidão). Faltam hitboxes colossais.
- [-] **ABISMO-WPN-004 — Machados** `[P1]` `[-] Parcial` (Força, quebra fácil escudo). Pendente de hitbox arco-curta.
- [-] **ABISMO-WPN-005 — Martelos** `[P1]` `[-] Parcial` (Lentíssimo, dano de equilíbrio extremo). Pendente hitbox esférica na ponta.
- [-] **ABISMO-WPN-006 — Lanças** `[P1]` `[-] Parcial` (Alcance linear massivo / thrust). Pendente hitbox fina retangular longa.
- [-] **ABISMO-WPN-007 — Foices** `[P1]` `[-] Parcial` (Área cleave). Pendente hitbox em arco enorme.
- [-] **ABISMO-WPN-008 — Arcos** `[P1]` `[-] Parcial` (Range mágico/físico distanciado). Pendente ligar aos `_activeProjectiles`.
- [ ] **ABISMO-WPN-009 — Armas Especiais e Habilidades Ativas (Spells)** `[P2]` `[ ] Pendente`
  - **Objetivo:** Magias em armas Raras a Únicas que consomem estamina ou uso.
  - **Arquivos:** `WeaponSystem.js`, `GameScene.js`.
  - **Critério de conclusão:** Armas raras concedem habilidades acionáveis exclusivas, armas normais não.
  - **Evidência atual:** A habilidade (Skill Mágica MVP) era universalmente ativada pela tecla e não checava dinamicamente as permissões de rarity na pool de armas (habilidades ativas próprias).

## SEÇÃO D — Armaduras e aprimoramentos

- [x] **ABISMO-ARM-001 — Slots, status e penalidades de desnível** `[P2]` `[x] Implementado e validado`
  - **Objetivo:** 4 slots, 6 atributos permitidos; nenhuma penalidade de peso ou durabilidade; player perde bônus em 2 armaduras à escolha se segurar arma sem ter level apropriado.
  - **Arquivos:** `ArmorSystem.js`, `InventorySystem.js`.
  - **Dependências:** Sistema de Atributos.
  - **Critério de conclusão:** Todos os requisitos negativos (disable de slots pelo overlevel da arma) validados.
  - **Evidência atual:** Sistema integrado, logado nos feedbacks de inspeção anteriores. O peso inexiste de acordo com os pilares originais.

- [~] **ABISMO-ARM-002 — Aprimoramentos (+0 a +20) e Raridades** `[P2]` `[~] Implementado, mas não validado`
  - **Objetivo:** Forjas adicionam níveis, upgrades desbloqueiam atributos em mudanças de cor/tier; itens não viram Únicos em upgrades manuais.
  - **Arquivos:** `ArmorSystem.js`.
  - **Dependências:** Forja (UI).
  - **Critério de conclusão:** Modificadores escalam em progressão fixa. Únicos (Uniques) não caem na mesa de re-roll.
  - **Evidência atual:** Lógica e faixas presentes no `.js`, carente de interface unificada e debug in-game.

## SEÇÃO E — Elementos e status

- [x] **ABISMO-STA-001 — Buildups contínuos (Fogo, Gelo, Veneno, Sangramento, etc)** `[P1]` `[x] Implementado e validado`
  - **Objetivo:** A cada hit o inimigo/player ganha uma carga. No 100%, causa dano (Poison DoT) ou estouro (Bleed). Resistência reduz taxa.
  - **Arquivos:** `StatusEffectSystem.js`.
  - **Dependências:** `EnvironmentalHazards.js` ou Combat.
  - **Critério de conclusão:** Os medidores reagem, descem devagar e ativam adequadamente.
  - **Evidência atual:** Testes com ToxicPlant (Veneno) e ThermalEruption (Fogo) comprovaram operação sem bugs.

- [ ] **ABISMO-STA-002 — Imunidades e resistência crescente** `[P2]` `[ ] Pendente`
  - **Objetivo:** Cada vez que um inimigo sofre de um status, a próxima exigência aumenta (ex: 150%, 300%) e chefes têm imunidades a status instakill (Podridão profunda se houver).
  - **Arquivos:** `StatusEffectSystem.js`, `Boss.js`.
  - **Critério de conclusão:** Limites dinâmicos, impedindo cheese.
  - **Evidência atual:** A resistência funciona de forma linear básica ainda.

## SEÇÃO F — Inventário, loot e relíquias

- [x] **ABISMO-INV-001 — Bolsas, Categorias, Loot comum e Relíquias** `[P2]` `[x] Implementado e validado`
  - **Objetivo:** Múltiplas abas. Consumíveis, relíquias passivas e chaves separadas. Armazenamento infinito. Drops provindos de inimigos sem dinheiro (currency).
  - **Arquivos:** `InventorySystem.js`, `LootSystem.js`.
  - **Critério de conclusão:** Tabelas respeitam % e itens vão pra bag para equipar.
  - **Evidência atual:** Sistema robusto rodando em memória e serializado no salvamento. Relíquias funcionam como buffs ocultos lidos nos getteres.

- [ ] **ABISMO-INV-002 — Únicos não-repetíveis e tabelas de Chefes** `[P2]` `[ ] Pendente`
  - **Objetivo:** Equipamentos Raros a Épicos dependem das tables; Únicos são garantidos uma única vez por save e jamais dropam de novo. Drops de chefes garantem qualidade.
  - **Arquivos:** `LootSystem.js`, `SaveSystem.js`.
  - **Critério de conclusão:** Save arquiva `uniquesObtained: []` e proíbe drops idênticos na mesma jornada.
  - **Evidência atual:** O registro exato dos Unique Pools e Elites tables garantidas ainda não foi isolado em testes.

## SEÇÃO G — Desafio de Abismo

- [~] **ABISMO-CHA-001 — Multiplicadores de Recompensa nos Níveis (+50 a +200)** `[P2]` `[~] Implementado, mas não validado`
  - **Objetivo:** Sistema que captura a vida e nível da entidade no primeiro hit. Se a diferença de gap for de 50 (5pt), 100 (10pt, item raro), 150 (20pt, épico) e limite 200 (30pt e único especial), concede bônus brutal ao derrotá-lo.
  - **Arquivos:** `AbyssChallengeSystem.js`.
  - **Critério de conclusão:** Prevenção de manipulação durante o embate. Limite restrito a +200 (não melhora recompensas em +400).
  - **Evidência atual:** Classe implementada e ativada no `GameScene.js` (on attack). Exige playtest com níveis absurdos gerados na Fenda de progressão do Endgame (Profundidade >200).

## SEÇÃO H — Morte e santuários

- [x] **ABISMO-DTH-001 — XP e Morte (Perda total / Orbe)** `[P1]` `[x] Implementado e validado`
  - **Objetivo:** Morrer reseta player ao checkpoint e apaga a XP estocada na bag, deixando um sinalizador.
  - **Arquivos:** `XPSystem.js`, `GameScene.js`.
  - **Critério de conclusão:** Morte com o orbe já ativo, ou em outra sala, o apaga e atualiza o local no novo percurso fatal.
  - **Evidência atual:** Testes comprovaram transição. XP volta integral se orbe for tocado.

- [x] **ABISMO-DTH-002 — Respawn em Santuários, Cura, Levels e Mobs** `[P1]` `[x] Implementado e validado`
  - **Objetivo:** Retorno integral; monstros lixos (comuns) reaparecem, mas Chefões (Main bosses) mortos ficam mortos na run. Autosave em toda meditação. Fast-travel entre descobertos.
  - **Arquivos:** `GameScene.js`, `SaveSystem.js`.
  - **Critério de conclusão:** Hub central funcional.
  - **Evidência atual:** Lógicas de `cleared = false` para os spawners rodaram lindamente, mas Boss mantêm `cleared = true`. Save é persistente.

## SEÇÃO I — Cura e consumíveis

- [x] **ABISMO-HEL-001 — Cargas de Cura (Frascos)** `[P1]` `[x] Implementado e validado`
  - **Objetivo:** 3 cargas iniciais ao jogador. Usa no combate para curar instantâneo ou regen rápido. Restaura as cargas nos santuários.
  - **Arquivos:** `Player.js`.
  - **Critério de conclusão:** Recargas operantes. Consumo imediato.
  - **Evidência atual:** A variável `healCharges` e o input funcionam e são atualizados no checkpoint.

- [ ] **ABISMO-HEL-002 — Upgrades permanentes e Materiais Consumíveis** `[P2]` `[ ] Pendente`
  - **Objetivo:** Expandir as 3 poções (até X) e sua potência por meio de itens secretos da fenda; Uso de poções de resinas (gelo/fogo) pelo inventário rápido.
  - **Arquivos:** `InventorySystem.js`.
  - **Evidência atual:** Lógica de potências pendente. Sem consumíveis elementais programados até agora.

## SEÇÃO J — Mundo procedural

- [x] **ABISMO-WLD-001 — Estruturas e conectividade seguras** `[P1]` `[x] Implementado e validado`
  - **Objetivo:** A seed precisa desenhar fluxos principais (Salas Normais -> Santuários -> Chefes) inquebráveis, com bifurcações orgânicas e ramificações extras. Entradas e saídas acessíveis sempre. Geração matemática sem loops infinitos na ramificação.
  - **Arquivos:** `WorldGenerator.js`.
  - **Critério de conclusão:** Navegação consistente. Transições limpas e precisas de sala para sala via colisão com blocos delimitadores das portas.
  - **Evidência atual:** BFS validado; as conexões (N/S/L/O) não prendem jogadores em paredes em nenhum dos biomas testados, graças à reserva matemática do `_carveHallways()`.

- [ ] **ABISMO-WLD-002 — Segredos, Cavernas Extras, Eventos e Spawn Variado** `[P3]` `[ ] Pendente`
  - **Objetivo:** Baús em salas mortas, salas falsas (cavernas extras do GDD) e injeção de pontos de interesse nos grafos anexos da árvore de path.
  - **Arquivos:** `WorldGenerator.js`, `RoomGenerator.js`.
  - **Evidência atual:** Os tiles "especiais" são vagamente usados, precisando de conteúdo rico inserido.

## SEÇÃO K — Biomas (Especificações 10 Biomas Atuais)

*(Nota: O GDD original continha uma lista primordial que diferiu dos 10 atuais em produção — consideramos o código final para testes.)*

- [x] **ABISMO-BIO-001 — Arredores Cinzentos** `[P2]` `[x] Implementado e validado` | Lentidão e ash-patches.
- [x] **ABISMO-BIO-002 — Aqueduto Submerso** `[P2]` `[x] Implementado e validado` | Correntezas (`WATER`) e colisão escorregadia.
- [x] **ABISMO-BIO-003 — Catacumbas Ecoantes** `[P2]` `[x] Implementado e validado` | Chão desaba atrasado / aggro sonoro nos monstros próximos.
- [x] **ABISMO-BIO-004 — Forja Maculada** `[P2]` `[x] Implementado e validado` | Erupções de magma via time-delay com aviso.
- [x] **ABISMO-BIO-005 — Jardim Pútrido** `[P2]` `[x] Implementado e validado` | Plantas soltam nuvens tóxicas reativas ao ataque.
- [x] **ABISMO-BIO-006 — Cidade Subterrânea** `[P2]` `[x] Implementado e validado` | Paredes intransponíveis destruídas ao iluminar postes da área.
- [x] **ABISMO-BIO-007 — Abismo Cristalino** `[P2]` `[x] Implementado e validado` | Projéteis com vetores (vX, vY) ricocheteiam no ambiente refrativo (Cristais).
- [x] **ABISMO-BIO-008 — Cárcere de Sangue** `[P2]` `[x] Implementado e validado` | Lifesteal das zonas sugam staminas e curam bestas.
- [x] **ABISMO-BIO-009 — Biblioteca do Oculto** `[P2]` `[x] Implementado e validado` | Portais falsos ilusórios transportam jogadores (sem soft-lock, boss intocado).
- [x] **ABISMO-BIO-010 — Coração do Abismo** `[P2]` `[x] Implementado e validado` | Anomalia grave, iframes e pulos modificados via hook `GRAVITY`.

## SEÇÃO L — Inimigos e chefes

- [ ] **ABISMO-ENM-001 — Pools de inimigos por bioma, elites e anomalias** `[P2]` `[ ] Pendente`
  - **Objetivo:** Adicionar os monstros base por bioma de acordo com o GDD. Diferenciar o padrão de magos/ranged para melee puro. Inserir elites com drops raros e anomalias de altíssimo nível spawnando randomicamente.
  - **Arquivos:** `enemies.js`, `Enemy.js`.
  - **Evidência atual:** Instanciamos o "Guerreiro Clássico" sem grandes variações, mas a engine o aceita bem.

- [~] **ABISMO-ENM-002 — Chefes base de biomas (Obrigatórios/Opcionais)** `[P1]` `[~] Implementado, mas não validado`
  - **Objetivo:** A cada fim de área central, o Boss do cenário desperta, acionando 2 fases por barra de vida (HP) e tendo sua hitbox/telegraph definidos em rotinas visíveis ao player.
  - **Arquivos:** `Boss.js`.
  - **Critério de conclusão:** 10 modelos fixos funcionando. Recompensas essenciais dropando e liberando passagem.
  - **Evidência atual:** A classe baseada em HP e triggers funcionou perfeitamente no Abismo Cristalino com os projéteis. Necessita balanço.

- [ ] **ABISMO-ENM-003 — Geração Modular de Chefes (Profundidade)** `[P2]` `[ ] Pendente`
  - **Objetivo:** Arquétipos mistos (Arma X com Elemento Y e Modificadores V). Exemplo: Boss Gigante Tóxico Rápido.
  - **Arquivos:** `Boss.js`.
  - **Critério de conclusão:** Geração determinística (seed based) compõe perigos absurdos não hardcodeds nos andares do endgame para renovação da experiência, garantindo loots épicos/únicos de recompensa escalonável.
  - **Evidência atual:** Classe permite mods (`_trySpecialAbility`), faltando integrador de atributos.

## SEÇÃO M — Biomas por partida e endgame

- [ ] **ABISMO-MAP-001 — Limitação a 5-8 biomas na seed principal** `[P2]` `[ ] Pendente`
  - **Objetivo:** As "partidas" (saves) normais limitam a apresentação dos 10 cenários para que os jogadores se familiarizem, exigindo novas "fendas" (endgames/runs diferentes) para verem as paletas ocultas que a seed ocultou.
  - **Arquivos:** `WorldGenerator.js`.
  - **Critério de conclusão:** Pool extrai de 5 a 8 e descarta o restante durante o build inicial.

- [ ] **ABISMO-MAP-002 — A Profundidade Abissal Infinita** `[P3]` `[ ] Pendente`
  - **Objetivo:** Ausência de teto. Ao derrotar biomas normais da seed, abrir brechas com inimigos sobrelevedados independentes do nosso próprio LVL (se estamos LVL20, a Fenda cria inimigos 80). Zonas anômalas repetitivas com melhores Drops (farming).
  - **Arquivos:** `GameScene.js` (AbyssPortal).
  - **Evidência atual:** Portal instanciado. Variável `areaIndex` cresce ad infinitum, mas a matemática que força o cap dos monstros e tabelas únicas para esses andares avançados carece de ajustes.

## SEÇÃO N — NPCs, missões e história

- [ ] **ABISMO-NPC-001 — História Ambiental, Lore e NPCs Seedados** `[P3]` `[ ] Pendente`
  - **Objetivo:** Espalhar NPCs na fogueira (Santuários) ou rotas falsas (Eventos) e registrar seus diálogos de progresso via logs de missões nos arquivos de save. Adicionar itens puramente narrativos com lore descritivo.
  - **Arquivos:** Nenhum atualmente.
  - **Critério de conclusão:** Recompensas concedidas baseadas nas resoluções.
  - **Evidência atual:** Inexistente.

## SEÇÃO O — Interface e apresentação

- [-] **ABISMO-HUD-001 — Layout Geral, Inventário UI e Status** `[P2]` `[-] Parcial`
  - **Objetivo:** Consolidar painéis de Atributos, Bossbar, Estamina/Curas com clareza imediata do impacto. Apresentar dicas visuais dos efeitos ambientais e Biomas.
  - **Arquivos:** `HUD.js`, `BossBar.js`, `InventoryUI.js`.
  - **Evidência atual:** HUD rudimentar funcional, interações iterativas operando via texto, requerendo refinamento da acessibilidade e organização.

- [ ] **ABISMO-HUD-002 — Joystick e Inputs Personalizáveis** `[P3]` `[ ] Pendente`
  - **Objetivo:** Remapeamento, Gamepad via Input Plugin do Phaser e adaptadores.

## SEÇÃO P — Áudio, animações e polimento

- [ ] **ABISMO-SND-001 — Integração de SFX e BGM** `[P3]` `[ ] Pendente`
  - **Objetivo:** Áudio imersivo de golpes (hit feedback), músicas exclusivas de Biomas ou Bosses.

- [-] **ABISMO-GFX-001 — Animações Finais, Pixels Definitivos e Partículas** `[P3]` `[-] Parcial`
  - **Objetivo:** Substituir as renderizações procedurais por primitivos geométricos (quadrados, cores uniformes tintadas via `Graphics`) por assets estáticos autênticos e efeitos de combate legíveis.
  - **Evidência atual:** Renderiza os fallbacks geométricos criados na `BootScene` com as paletas determinísticas via tint do Bioma (perfeito para teste, mas insatisfatório na apresentação final). Partículas ambientais aplicadas.

## SEÇÃO Q — Save e continuidade

- [x] **ABISMO-SAV-001 — IndexedDB, Sessões, Seeds e Integridade** `[P1]` `[x] Implementado e validado`
  - **Objetivo:** Armazenar todos os stats base e chaves ativas do jogador a cada autosave de fogueira, preservando o layout orgânico entre fechamentos via Seed atada.
  - **Arquivos:** `SaveSystem.js`.
  - **Critério de conclusão:** Multislots; recarregar o browser carrega posições da área e level exato; tratar nulos com defaults para patches retroativos.
  - **Evidência atual:** Extensos testes das strings JSON confirmaram a robustez do formato. 

## SEÇÃO R — Recursos futuros

- [ ] **ABISMO-FUT-001 — Multiplayer Fantasma e Leaderboards** `[P4]` `[ ] Pendente`
  - **Objetivo:** Mensagens, espectros passados e rankings de profundidade assíncronos (não requer real-time).
  - **Dependências:** Backend API e isolamento na V2.

## SEÇÃO S — Protótipo jogável

- [x] **ABISMO-MVP-001 — MVP e Ciclo Core (GDD)** `[P1]` `[x] Implementado e validado`
  - **Objetivo:** O GDD exigia o protótipo: Jogador, 1 Sala, 1 Santuário, 1 Inimigo, 1 Boss, Stamina, Ataque, Parry, XP, Loot, Morte.
  - **Evidência atual:** Tudo conectado no loop central da engine Phaser rodando em `GameScene.js`. A espinha dorsal atende 100% da lógica exigida, validando o teste do motor matemático de seed.

---

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
