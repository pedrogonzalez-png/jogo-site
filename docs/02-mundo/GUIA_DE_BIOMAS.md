# Guia técnico e artístico dos dez biomas

> **Fonte técnica verificada por leitura de arquivo em 2026-10-21:** src/data/biomes.js (nomes, IDs, faixas, enemyPool, elitePool, bossPool, ambientParticles). **Mecânicas/hazards:** documentos históricos de 2026-10-09 e arquivos de mundo referenciados; **funcionamento no jogo ainda exige teste**.
> [GDD](../01-projeto/VISAO_CANONICA_E_GDD.md) · [Arte ASCII](../03-conteudo/DIRECAO_ARTISTICA_ASCII.md) · [Tarefas de mundo](../04-gestao/tarefas/02-MUNDO_E_INIMIGOS.md)

## Contrato de dados comum

Para cada bioma, preservar **id, name, levelRange, palette, enemyPool, elitePool, bossPool, ambientParticles, music**, mais propriedades específicas quando presentes. A seed seleciona salas e conteúdo por regras determinísticas. Não substituir uma propriedade por nomes traduzidos em saves serializados. Não afirmar áudio implementado apenas porque a chave music existe.

## 01. Os Arredores Cinzentos — ARREDORES_CINZENTOS

- **Níveis declarados:** 1–40.
- **Pool comum:** caminhante_cinzento; sabujo_fuligem.
- **Elite:** sentinela_cinzenta. **Boss:** senhor_das_cinzas.
- **Partículas:** ASH. **Hazard histórico:** AshPatch, cinzas que reduzem deslocamento/acumulam efeito.
- **Arte ASCII requerida:** pedra fraturada, cinzas em camadas, pilastras partidas, estruturas em ruínas, sujeira, brasa discreta e contrastes frios/cinzentos.
- **Testes:** cinza visível antes de aplicar lentidão; santuário seguro; variedade de paredes; inimigos escolhidos apenas do pool; boss certo.

## 02. O Aqueduto Submerso — AQUEDUTO_SUBMERSO

- **Níveis:** 20–60. **Comuns:** afogado; espreitador_abissal.
- **Elite:** bruto_submerso. **Boss:** leviata_raso. **Partículas:** BUBBLES.
- **Hazard:** CurrentZone, corrente empurra entidade.
- **Arte:** água com reflexos e profundidade, espuma, margens molhadas, arcos de pedra, vazamentos, canais com fluxo direcional; não desenhar apenas ondas ASCII.
- **Testes:** direção da força, fluxo animado compatível com o hazard, margem sem emenda, saída da zona limpa estado de água.

## 03. As Catacumbas Ecoantes — CATACUMBAS_ECOANTES

- **Níveis:** 35–80. **Comuns:** esqueleto_desperto; espectro_ecoante.
- **Elite:** carrasco_tumular. **Boss:** amalgama_de_ossos. **Partículas:** MIST.
- **Hazard:** FragileFloor, piso rompe e pode atrair aggro.
- **Arte:** ossos e criptas, rachaduras com profundidade, lajes quebradas, arcos, urnas, pilares corroídos.
- **Testes:** queda/aviso visual, passagem ainda navegável, som/alerta de inimigos se implementado, arena sem bloqueio por tile quebrado.

## 04. A Forja Maculada — FORJA_MACULADA

- **Níveis:** 45–90. **Comuns:** construto_defeituoso; diabrete_de_ferro.
- **Elite:** golias_maculado. **Boss:** forjador_insano. **Partículas:** EMBERS.
- **Hazard:** ThermalEruption, aviso seguido de dano/buildup de fogo.
- **Arte:** metal oxidado, correntes, bigornas, fissuras incandescentes, lava estratificada, fuligem e cinza quente.
- **Testes:** telegraph antes do dano; magma não obscurece hitbox; erupção limpa estado no cooldown.

## 05. O Jardim Pútrido — JARDIM_PUTRIDO

- **Níveis:** 55–110. **Comuns:** brotar_toxico; vinha_rastejante.
- **Elite:** guardiao_putrido. **Boss:** flor_cadaverica. **Partículas:** LEAVES.
- **Hazard:** ToxicPlant, destruição libera nuvem venenosa.
- **Arte:** raízes e fungos em densidades diferentes, folhas degradadas, lodo, espinhos, estruturas tomadas por trepadeiras e esporos.
- **Testes:** nuvem distinta do fundo, dissipação e status, colisão de plantas que são obstáculos vs decoração.

## 06. A Cidade Subterrânea — CIDADE_SUBTERRANEA

- **Níveis:** 70–130. **Comuns:** cidadao_corrompido; lacaio_da_sombra.
- **Elite:** cavaleiro_caido. **Boss:** rei_dos_mendigos. **Partículas:** ASH.
- **Hazard:** LanternBridge, ponte/barreira revelada por interação luminosa.
- **Arte:** arquitetura monumental, arcadas, pontes esculpidas, correntes, vitrais e lanternas, sombras profundas.
- **Testes:** indicação da interação, passagem liberada corretamente, visual/colisão sincronizados, nenhuma porta falsa sem rota alternativa.

## 07. O Abismo Cristalino — ABISMO_CRISTALINO

- **Níveis:** 90–160. **Comuns:** golem_de_cristal; raio_refratado.
- **Elite:** entidade_prismatica. **Boss:** cristal_matriz. **Partículas:** SPARKS.
- **Hazard:** CrystalReflector, interação/ricochete de projéteis.
- **Arte:** facetas, arestas, reflexos em várias intensidades, pilares translúcidos simulados com caracteres.
- **Testes:** ângulo/velocidade do projétil, reflexo e dano, clipping em cristais, legibilidade durante efeitos.

## 08. O Cárcere de Sangue — CARCERE_DE_SANGUE

- **Níveis:** 110–200. **Comuns:** prisioneiro_sanguinario; mago_de_sangue.
- **Elite:** carcereiro_carmesim. **Boss:** vampiro_primordial. **Partículas declaradas:** HOLY.
- **Hazard:** BloodPool, poças drenam stamina e podem curar inimigos.
- **Arte:** pedra manchada, grades, correntes, aço escuro, sangue viscoso com brilho e profundidade.
- **Testes:** débito de stamina e cura do inimigo, redução de velocidade quando prevista, remoção após sair da poça.
- **Ponto de atenção:** ambientParticles=HOLY pode exigir revisão artística/semântica, **sem alterá-la automaticamente**.

## 09. A Biblioteca do Oculto — BIBLIOTECA_DO_OCULTO

- **Níveis:** 140–250. **Comuns:** sabio_enlouquecido; tomo_flutuante.
- **Elite:** arcanista_corrompido. **Boss:** bibliotecario_sombrio. **Partículas:** VOID.
- **Hazard:** IllusionDoor, portas ilusórias e desvio de rota.
- **Arte:** estantes, livros, grimórios, ornamentos, selos e passagens estranhas; contraste e pistas sutis.
- **Testes:** destino determinístico para seed, player nunca chega a sala inválida, retorno possível, nenhuma porta necessária fica intransitável.

## 10. O Coração do Abismo — CORACAO_DO_ABISMO

- **Níveis:** 200–99999 no dado atual (isso não prova limite do design). **Comuns:** fragmento_abissal; eco_do_vazio.
- **Elite:** manifestacao_da_ruina. **Boss:** entidade_final. **Partículas:** VOID.
- **Propriedade adicional:** anomalyChance=0.4.
- **Hazard:** GravityZone, deslocamento/atração e alterações na esquiva.
- **Arte:** estruturas impossíveis, fendas, volumes instáveis, contraste profundo, brilhos anômalos e padrões não euclidianos **apenas visuais**.
- **Testes:** força do campo, dodge e câmera, interação com obstáculo, estabilidade em profundidades altas.

## Regras transversais de bioma

1. **Dado ≠ comportamento.** Validar seleção de enemyPool/elitePool/bossPool na GameScene, não apenas os arrays.
2. **Dado ≠ asset.** Verificar textura ASCII/variante do inimigo, elite, boss e arquitetura em jogo.
3. **Dado ≠ som.** Chaves music não comprovam sistema de áudio.
4. **Anomalia ≠ softlock.** Mudanças de rota/gravidade exigem invariantes e testes de conectividade.
5. **Teste por seed.** Registrar seed, índice da área, tipo de sala, bioma e resultado.
6. **Mundo maior.** Benchmark de FPS e vazamento de memória ao atravessar várias áreas/entrar e sair de salas.
7. **Convenção de nomes.** Auditoria de 09/10 usa apelidos como “Vale das Cinzas” e “Pântano Afogado”; **ID canônico de implementação** continua o da tabela acima.

## Critérios gerais de liberação

Um bioma só está validado quando: tem rota alcançável, hazard funcional, inimigos/elite/boss selecionados corretamente, arte ASCII legível, transições sem softlock, save consistente, evidência de teste manual e relatório de performance. **Um build sem erros não substitui esses testes.**
