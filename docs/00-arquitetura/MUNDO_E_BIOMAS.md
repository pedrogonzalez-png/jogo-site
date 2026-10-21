# Arquitetura do mundo e dos biomas — Abismo

> Extraído de `docs/ESTRUTURA_DO_PROJETO.md` (versão documentada em 2026-10-09). Descrição histórica, não significa validação do código atual.
> [Índice da arquitetura](../ESTRUTURA_DO_PROJETO.md) · [Índice geral](../README.md)

## D. Arquitetura do Mundo

* **SeedSystem**: RNG estrito (mulberry32). A função `fork()` isola RNGs por área/sala para garantir que o abate de um monstro numa sala, por exemplo, não altere o layout da próxima.
* **WorldGenerator**: Gera áreas definindo a navegação do player. Cria uma ramificação principal (Espinha dorsal: Entrance -> Normal -> Sanctuary -> Boss) e enxertos (ramificações opcionais e arenas de baú).
* **RoomGenerator**: Transforma a topologia em grids de tiles (40x22). Aplica diferentes perfis estruturais de acordo com o Bioma atual, variando densidade de colunas, formatos de corredores e espalhando elementos com base em `TILE_TYPES`. 
* **Transições e Progresso**: Ao chegar nas bordas de limite de porta de sala, `GameScene` dispara `_transitionToRoom()` rodando efeito visual, apagando instâncias físicas velhas, construindo a sala do destino e reiniciando o loop na nova. O avanço de áreas (`_advanceToNextArea()`) limpa e injeta o loop completo no `WorldGenerator` com `areaIndex` somado.

---

## F. Os Dez Biomas

O Abismo roda ciclicamente através de 10 domínios, cada um definindo uma experiência ambiental via paletas de cor, configuração e mecânicas próprias:

1. **Vale das Cinzas** (ARREDORES_CINZENTOS): Desacelera a movimentação do player nos poços de cinza.
2. **Floresta Velada** (JARDIM_PUTRIDO): Nuvens tóxicas brotam das plantas agredidas. 
3. **Pântano Afogado** (AQUEDUTO_SUBMERSO): Fluxos aquáticos que empurram entidades.
4. **Deserto Rubro** (FORJA_MACULADA): Erupções térmicas intermitentes avisam o dano em área.
5. **Minas de Ferro Negro** (CATACUMBAS_ECOANTES): Chão que racha após interações, atraindo atenção inimiga para investigações ao ceder.
6. **Montanhas do Trovão** (ABISMO_CRISTALINO): Instalações de cristal que rebatem disparos arcanos e habilidades de forma angular. 
7. **Cidade Submersa** (CIDADE_SUBTERRANEA): Bloqueios que exigem proximidade para ascender lanternas, iluminando o caminho de passagens bloqueadas.
8. **Catedral Partida** (BIBLIOTECA_DO_OCULTO): Portas falsas visuais com pistas imperceptíveis. Elas atuam ocasionalmente com um teleportador ilusório de labirinto para a sala não pretendida.
9. **Forja Escarlate** (CARCERE_DE_SANGUE): Círculos sanguíneos que sugam vida/stamina de jogadores enquanto curam hostis.
10. **Abismo Sem Fundo** (CORACAO_DO_ABISMO): Anomalias gravitacionais que deturpam a movimentação no seu eixo e distâncias de esquivas, sugando lentamante ou estendendo manobras de impulso.

**Nota técnica:** Estas mecânicas foram projetadas no `EnvironmentalHazards.js`. O ambiente varia o padrão estético (desenho do corredor) no `RoomGenerator.js`. Falta implementar pools diferentes de inimigos por bioma.
