# Auditoria técnica do código — Abismo (21/10/2026)

> **ATUALIZAÇÃO FINAL:** [Relatório de encerramento com CI atualizado e smoke real](RELATORIO_FINAL_2026-10-21.md). Os resultados que aparecem abaixo como **21 testes** descrevem uma etapa anterior: a validação mais recente do código no GitHub Actions aprovou **24 testes, build Vite e smoke Chromium** (menu, jogo, inventário, transição, morte/respawn e IndexedDB). Os 55 status de tarefas permanecem históricos até QA completo.

> **Status:** auditoria estática ampla com correções e testes automatizados de escopo delimitado.
> **Base examinada:** `main` após o merge do PR #2 (`bcf3c1dae9195c4994f5b749f3d856cd893bc9c0`).
> **Correções propostas:** branch `fix/auditoria-integral-2026-10-21`, PR #3.
> **Importante:** foram inspecionados **45 arquivos JavaScript de `src/`**, seus imports/exports e fluxos principais. Não houve sessão humana de gameplay, captura visual em navegador ou benchmark de GPU nesta auditoria. A suíte automatizada e o build foram executados no GitHub Actions.

## 1. Escopo por subsistema

| Subsistema | Arquivos JS examinados | Observações |
|---|---:|---|
| Arte ASCII | 9 | Cavaleiro, referências RLE, paletas, renderizador, boss, inimigos, ambiente, água/VFX, registro de texturas |
| Combate | 6 | Dano, stamina, poise, parry, efeitos de status, orquestração de hits |
| Dados | 6 | Armas, armaduras, itens, balanceamento, biomas, templates de inimigos |
| Entidades | 3 | Player, Enemy e Boss |
| Equipamentos | 5 | Armor, Inventory, Loot, Upgrade e Weapon |
| Progressão | 4 | AbyssChallenge, Level, Stats e XP |
| Save | 1 | IndexedDB, serialização e restauração |
| Cenas e inicialização | 4 | main, BootScene, GameScene, MainMenuScene |
| UI | 3 | HUD, BossBar e InventoryUI |
| Mundo | 4 | SeedSystem, WorldGenerator, RoomGenerator, EnvironmentalHazards |
| **Total** | **45** | O inventário da API do GitHub lista 45 fontes JS em `src/` |

Foram também inspecionados `package.json`, a estrutura dos HTML e o estado da documentação. Há um `dist/` versionado e assets adicionais; a presença do bundle não comprova que corresponde ao estado atual do fonte.

## 2. Correções aplicadas nesta branch

| ID | Gravidade | Diagnóstico concreto | Arquivos corrigidos | Status de evidência |
|---|---|---|---|---|
| AUD-001 | P1 | Desafio de Abismo era capturado a cada hit e **após** o cálculo de dano, de modo que um hit fatal podia emitir `enemy:died` antes do registro | `GameScene.js` | Corrigido em fonte; integração gráfica pendente |
| AUD-002 | P1 | Golpe pesado calculava dano em `WeaponSystem`, mas o dispatcher não repassava `attackData.damage` ao `CombatSystem` | `GameScene.js` | Corrigido em fonte; teste de golpe real pendente |
| AUD-003 | P1 | A progressão probabilística da raridade normal podia promover itens para `UNIQUE`, contrariando o GDD | `LootSystem.js` | Corrigido + teste automatizado |
| AUD-004 | P1 | Itens Únicos não tinham histórico de IDs persistente por item no inventário, permitindo duplicação | `InventorySystem.js`, `SaveSystem.js`, `GameScene.js` | Corrigido + teste de serialização/duplicata |
| AUD-005 | P1 | Armas equipadas eram copiadas, mas permaneciam na lista de inventário, diferentemente de armaduras; upgrades poderiam afetar instâncias diferentes | `InventoryUI.js`, `InventorySystem.js`, `SaveSystem.js` | Corrigido em fonte; clique real pendente |
| AUD-006 | P1 | Spawn de inimigos podia selecionar tiles sólidos e posições próximas a entradas | `GameScene.js` | Busca por piso livre com até 160 tentativas, separação de 140px das entradas; jogo real pendente |
| AUD-007 | P1 | `StatSystem.allocate` aceitava pontos negativos e chaves arbitrárias, inclusive propriedades não-estatísticas | `StatSystem.js` | Corrigido + teste automatizado |
| AUD-008 | P1 | `DamageSystem.calculate` podia produzir `NaN` quando ataque e defesa eram zero, e resistência não tratava entradas não finitas | `DamageSystem.js` | Corrigido + teste automatizado |
| AUD-009 | P2 | Stamina aceitava gastos/restaurações negativas; efeitos DoT perdiam ticks quando um frame passava de um segundo e podiam contar após expiração | `StaminaSystem.js`, `StatusEffectSystem.js` | Corrigido + testes automatizados |
| AUD-010 | P2 | Fallback de bioma utilizava o ID histórico `VALE_DAS_CINZAS`, ausente em `BIOMES` | `WorldGenerator.js` | Corrigido + teste de geração de mundo |
| AUD-011 | P1 | Todas as portas comuns da Biblioteca tinham redirecionamento de 25% além da mecânica própria `IllusionDoor`, com chance de deslocamento para salas não visitadas e inconsistências de conectividade | `GameScene.js` | Removido redirecionamento duplicado; jogo real pendente |
| AUD-012 | P1 | Falha ao carregar um save podia impedir a inicialização; slot vazio carregado ficava sem equipamento inicial | `GameScene.js`, `SaveSystem.js` | Tratamento de fallback; smoke test de UI pendente |
| AUD-013 | P2 | Baú concedia animação de XP sem creditar XP real; podia reaparecer após transição/reload | `GameScene.js`, `SaveSystem.js` | XP creditada, `openedChests` persistido; integração pendente |
| AUD-014 | P2 | Stream de loot iniciava a partir de `Date.now()` e baús de uma mesma área usavam a mesma sub-seed | `GameScene.js` | Loot agora deriva de seed/área; baú deriva de seed/sala. Persistência integral da stream ainda é pendência |
| AUD-015 | P2 | Projetéis do jogador poderiam matar inimigo sem gerar registro do desafio +50/+100/+150/+200 | `GameScene.js` | Captura agora compartilhada com ataques; teste de projétil real pendente |
| AUD-016 | P2 | `WeaponSystem.effectiveRarity` podia reclassificar uma arma `UNIQUE` como raridade inferior se upgrade baixo | `WeaponSystem.js` | Corrigido + teste automatizado |

**Observação de unicidade:** a migração recupera os itens Únicos ainda presentes no inventário ou equipados em saves antigos. **Não é possível reconstruir automaticamente IDs de itens já descartados** em saves antigos sem histórico; essa limitação precisa ser conhecida.

**Observação de recompensas de Abismo:** `AbyssChallengeSystem` calcula pontos e `itemTier`; a atribuição de **arma única + item único + recompensa especial** prevista na faixa +200 **ainda não foi implementada integralmente**. O campo `abyssUniqueObtained` atual se baseia em IDs de evento, não substitui o histórico de identidade de item.

## 3. Lacunas reais que NÃO devem ser marcadas como concluídas

| ID | Situação encontrada no código | Tratamento correto |
|---|---|---|
| GAP-001 — Famílias de armas | `WEAPON_FAMILIES` atualmente contém **SWORD, DAGGER, GREATSWORD, AXE, HAMMER e SPEAR** (6). O GDD prevê 9 famílias | Especificar/implementar famílias restantes (foice, arco e especiais) com modelos, dano e testes. Não inventar prazo ou afirmar nove implementadas |
| GAP-002 — Drops e +200 | Templates em `data/enemies.js` exibem principalmente tabela de XP; `itemTier` do desafio é apresentado na HUD, sem geração completa e entrega de recompensa de cada categoria | Implementar tabela/entrega real somente com itens autorizados, histórico de unicidade e teste de reload |
| GAP-003 — Fantasmas | Sem sistema de replay/ghost assíncrono encontrado em `src/` | Futuro; seguir especificação em `docs/03-conteudo/FANTASMAS_ASSINCRONOS.md` |
| GAP-004 — Áudio | Os biomas possuem metadados `music`, mas não foi identificado subsistema completo de música/SFX no fonte auditado | Não marcar áudio como implementado a partir de metadados |
| GAP-005 — Animações do cavaleiro | `KnightArt.js` reutiliza a matriz `WALK_ASCII_LINES` em `walk_0` e `walk_1`; ataque/bloqueio possuem resoluções distintas da arte 200×100 | Criar quadros realmente diferentes, auditar alinhamento/hitbox com screenshot |
| GAP-006 — Visual em uso | Há extensa biblioteca de texturas ASCII e recursos RLE; pré-registro não comprova que cada um aparece corretamente no gameplay | Requer captura da cena real, teste de performance e identificação do asset no jogador/inimigo/bioma |
| GAP-007 — Save e progressão extrema | Falta validação de saves antigos com histórico de Únicos descartados; não há benchmark de XP/nível/depth extremo | Testar migrações, limites numéricos, fluxo entre áreas e conteúdo por run |
| GAP-008 — Loot na volta ao save | A stream de loot agora é reproduzível a partir de seed/área, mas **não é serializada a posição interna do RNG** ao salvar no meio da área | Definir mecanismo de histórico/serialização por encontro antes de chamar loot interativo totalmente determinístico |
| GAP-009 — Material de distribuição | `dist/` já consta versionado no repositório; foi criado `.gitignore` para novos builds. `.gitignore` não remove automaticamente arquivos antigos já rastreados | Decidir se o build é usado para deploy antes de executar uma limpeza `git rm --cached` |
| GAP-010 — Testes jogáveis | A suíte atual cobre lógica pura, verificação de imports/sintaxe, geração de salas, dados e serialização. Não usa browser/Phaser interativo | Executar roteiro do [plano de validação](../04-gestao/PLANO_DE_VALIDACAO.md) no Antigravity e registrar prints/logs |

## 4. O que foi validado de fato

**GitHub Actions:** `Abismo - qualidade e regressao`, fluxo `.github/workflows/quality.yml`, Node.js 22 em Ubuntu, `npm ci`, `npm test`, `npm run build`.

**Cobertura automatizada criada:**

- `tests/core-systems.test.js`: dano e defesa, stats, stamina, parry, DoT, tiers do Abismo, raridade, itens Únicos, XP/orbe de morte.
- `tests/world-generation.test.js`: reproducibilidade de seed, portas bidirecionais e caminho crítico para 10 biomas e múltiplas seeds.
- `tests/source-integrity.test.js`: sintaxe JS (`node --check`), imports relativos, pools de inimigos/chefes, serialização e compatibilidade de saves antigos.

**Execução verificada mais recente após as correções e os três novos testes:** [GitHub Actions — run 39677024455](https://github.com/pedrogonzalez-png/jogo-site/actions/runs/39677024455), commit `913e29efc`, Ubuntu/Node.js 22: **21 testes aprovados, 0 falhas, 0 ignorados; Vite transformou 50 módulos e concluiu o build**. Foram lidos os passos e os logs do job. A execução inicial anterior [run 39675562791](https://github.com/pedrogonzalez-png/jogo-site/actions/runs/39675562791) tinha 18 testes e também passou. Os novos commits **somente de documentação** posteriores não alteram o resultado do código; se o JS mudar, executar CI novamente.

**Não validado:** frames ASCII em resolução real, movimento/colisões físicas no Phaser, suporte a navegador, combate completo com IA, boss de todos os biomas, travessia longa, áudio, save de usuário real e FPS/GPU.

## 5. Critérios para encerrar a auditoria

- [x] Inspeção estática dos 45 fontes JavaScript e identificação das funções principais.
- [x] Suíte de teste de lógica pura e build integrados ao repositório.
- [x] Corrigir falhas reproduzíveis pelas regras de invariantes sem alterar a identidade do jogo.
- [x] Registro de lacunas e de casos não exercitados em browser.
- [ ] Executar testes jogáveis no navegador usando o roteiro por bioma, capturar evidências.
- [ ] Verificar qualidade/escala de todos os assets ASCII com capturas, FPS e memória.
- [ ] Fechar as pendências funcionais acima ou marcá-las como adiadas com justificativa.
- [ ] Reconciliar individualmente cada ID legado de `TAREFAS_ABISMO.md` com código **e** evidência atual.

## 6. Instruções específicas ao Antigravity

1. Comece lendo [este relatório](AUDITORIA_CODIGO_2026-10-21.md), [GEMINI.md](../../GEMINI.md) e [backlog](../04-gestao/BACKLOG_ANTIGRAVITY.md).
2. Não reaplique bugs antigos já corrigidos; confira cada chamada real no código.
3. Execute `npm ci && npm test && npm run build && npm run dev` em filesystem compatível.
4. Teste manualmente **cada bioma** e cada alteração de gameplay com seed documentada.
5. Tire screenshots das poses do cavaleiro e dos efeitos ASCII no zoom real, com modo debug de física se possível.
6. Preserve saves antigos; valide reload ao receber item único e abrir baú.
7. Atualize status com três classificações separadas: **implementado em código**, **testado automaticamente** e **validado em gameplay**.
8. Ao concluir, registre console/seed/resultado no plano de QA; não marque “100% concluído” porque build passou.

**Nenhuma correção deste relatório altera voluntariamente lore, arquitetura de rede, gameplay dos chefes ou artes ASCII fornecidas; esses temas precisam de tarefa própria e validação.**

## 7. Complemento da auditoria: equipamento e integridade (21/10/2026)

As correções a seguir foram incorporadas depois do primeiro relatório de 16 itens.

| ID | Natureza | Problema identificado | Alteração | Evidência |
|---|---|---|---|---|
| AUD-017 | P1 — equipamento | Ao voltar um item Único do slot equipado para o inventário, a proteção contra duplicatas podia barrar a **transferência legítima**; armas equipadas também permaneciam no inventário como cópia | `InventorySystem.add(..., { transferOwned: true })`, transferência de armas e armaduras em `InventoryUI.js`, reconstrução de histórico de Únicos equipados no load | Teste automatizado de troca de único; clique e HUD ainda pendentes |
| AUD-018 | P2 — raridade | `UpgradeSystem.upgrade` podia devolver raridade abaixo da raridade originalmente obtida; getters de `WeaponSystem` e `ArmorSystem` também podiam rebaixar a classificação | Raridade resultante conserva a maior entre a original e o nível de aprimoramento, preservando Único | Teste automatizado de upgrade e classificação |
| AUD-019 | P1 — penalidade | Interface de equipamento acima do nível recomendado permitia desativar somente uma peça ao reativar uma das duas anteriormente penalizadas | Alternância em `InventoryUI.js` substitui uma peça desativada por outra para conservar exatamente duas | Revisão estática e build; **ainda exige clique no navegador** |
| AUD-020 | P2 — regressão | Não havia execução padronizada de testes antes de alterações futuras no código | `npm test` (Node built-in test runner), 3 arquivos de testes e `.github/workflows/quality.yml` | [21 testes e build aprovados](https://github.com/pedrogonzalez-png/jogo-site/actions/runs/39677024455) |

### O que a validação automatizada cobre e o que não cobre

**Coberto (21 testes):** propriedades numéricas de dano, custos/raridades, 4 limiares de desafio, parry, status, unicidade de identidade de item, transferência de item Único, XP/orbe lógica, geração de mundo por seed, grafo de dez biomas, caminhos relativos/imports, sintaxe de fontes e serialização de SaveSystem. **Os casos exatos encontram-se em `tests/`.**

**Não coberto por browser:** a UI de troca de equipamentos, animações, física do Arcade, visibilidade dos inimigos/chefes, status nas telas, abertura/fechamento de baús pela interface, IndexedDB real, FPS e desenho ASCII. CI aprovado não autoriza declarar essas funcionalidades validadas no gameplay.

### Novo fluxo de trabalho para o Antigravity

Ao abrir este PR no Antigravity, execute:
```bash
npm ci
npm test
npm run build
npm run dev
```

Na execução jogável, priorize: abrir save antigo, atacar um inimigo com golpe leve/pesado/skill, matar com golpe fatal, ganhar recompensa do desafio, equipar/trocar Único, abrir baú, trocar de sala e recarregar save. Capturar seed, screenshot e logs. Somente após esses casos atribuir **VALIDADO EM GAMEPLAY** aos itens de domínio.

### Interpretação correta dos números

- **45 fontes JS revisadas**: escopo da inspeção estática, não quantidade de sistemas completos.
- **21 testes aprovados**: número de casos automatizados, **não** 21 sistemas do GDD finalizados.
- **55 IDs históricos**: preservados, com evidências parciais em [matriz dos 55](MATRIZ_55_TAREFAS.md).
- **56 subtarefas propostas para o Antigravity**: continuam independentes do percentual de conclusão dos 55 IDs e não devem ser somadas ao painel de conclusão.
