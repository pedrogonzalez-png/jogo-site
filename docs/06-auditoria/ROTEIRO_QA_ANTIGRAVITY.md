# Roteiro de validação jogável — entrega ao Antigravity IDE

> **Status em 21/10/2026:** o roteiro **COMPLETO de exploração e QA nos dez biomas NÃO FOI EXECUTADO**. Contudo, foi realizado um smoke real em Chromium/Phaser com menu, criação de partida, inventário, transição de sala, limpeza de projéteis, morte, respawn e persistência em IndexedDB: [execução aprovada](https://github.com/pedrogonzalez-png/jogo-site/actions/runs/39679081571). Esse subconjunto passou e possui cinco screenshots anexados à execução, mas **não comprova** FPS, estética, colisões exaustivas, bosses, hazards ou conteúdo final. Veja o [relatório final](RELATORIO_FINAL_2026-10-21.md).
> [Auditoria de código](AUDITORIA_CODIGO_2026-10-21.md) · [Plano de QA geral](../04-gestao/PLANO_DE_VALIDACAO.md) · [Matriz dos 55](MATRIZ_55_TAREFAS.md)

## Preparação e dados de teste

1. No Antigravity IDE, usar a versão do PR #3/branch `fix/auditoria-integral-2026-10-21` sem substituir o projeto principal. Fazer backup/exportar os saves importantes antes de exercitar migração/possível corrupção.
2. Conferir versão `node --version`; `npm ci`; `npm test`; `npm run build`; `npm run dev`.
3. Abrir o endereço do Vite no navegador, resolução lógica 1280×720 e DevTools Console aberto. **Registrar GPU, navegador, Node, SO, seed, área, sala, tempo e commit**.
4. Criar **slot de teste** independente dos saves do jogador. Seeds sugeridas (apenas para reprodução, não são fixtures com resultado previamente verificado): `ABISMO-QA-01`, `ABISMO-QA-02`, `ABISMO-QA-ASCII`. Repetir a mesma seed antes/depois do teste.
5. Habilitar logs/screenshot e, se necessário, desenhar os corpos físicos em modo debug sem publicar secrets/saves privados.

## QA-BRW-01 — menu, carregamento e slots

- [ ] Entrar em Novo Jogo e confirmar arma inicial, peças de armadura, 5 pontos livres e 2 relíquias no inventário.
- [ ] Abrir inventário (Tab) e conferir navegação, custo de XP, números e atributos.
- [ ] Criar save de teste, voltar ao menu, continuar, comparar seed, nível, items, slot, checkpoint, sala, XP e estados.
- [ ] Continuar slot inexistente/corrompido de teste: registrar fallback ou mensagem, sem travar tela ou sobrescrever outro slot.
- [ ] Garantir ausência de erros `Uncaught`, `undefined` ou falha de IndexedDB.

**Aceite:** inicialização e continuação sem perda de dados. **Evidência:** console, dois screenshots (menu, jogo), hash do commit e comparação dos campos do save.

## QA-BRW-02 — combate, defesa e parry

- [ ] WASD, diagonais e sprint/Shift: mudanças fluidas de velocidade e stamina.
- [ ] Z (leve), X (pesado): mesmo inimigo/defesa em condições comparáveis; confirmar diferença de dano, custo de stamina, raio e tempo do golpe.
- [ ] C (esquiva), F (bloqueio), V (parry ~200ms): acerto/erro, i-frames e stamina coerentes.
- [ ] Tentar ataques durante stagger, guard break e cura: confirmar transições permitidas.
- [ ] Usar E (habilidade da arma) contra inimigo que morre com o primeiro projétil; confirmar registro de desafio no combate e reward quando diferença ≥50.
- [ ] Verificar hitbox do cavaleiro distinta de suas texturas ASCII grandes. Não aceitar colisão fora do corpo.

**Aceite:** hit efetivo usa dados da família/skill, ataques pesados não usam dano leve, morrer no primeiro golpe não faz a recompensa desaparecer. **Evidência:** logs/HP antes e depois, screenshots do hit e valores de stamina.

## QA-BRW-03 — recompensas do desafio e raridade

- [ ] Usar fixtures/nível de teste para diferenças **49/50/99/100/149/150/199/200/201/350** calculadas **no primeiro contato**. Confirmar maior tier e pontos esperados.
- [ ] Não assumir que `itemTier` exibido na HUD é um item que foi adicionado ao inventário: conferir entrega real separadamente.
- [ ] Coletar itens comuns e de boss, tentar obter raridade `UNIQUE` de drop aleatório não exclusivo e verificar que isso não ocorre.
- [ ] Obter a arma Única de teste; guardá-la/equipá-la/trocá-la e tentar obtê-la novamente.
- [ ] Reiniciar o jogo após remoção/troca e confirmar que o mesmo **ID estável de item Único** não aparece outra vez. Saves antigos com Único descartado **antes** desta auditoria podem não trazer histórico.
- [ ] Ao aprimorar peça Épica, confirmar que o upgrade não rebaixa o item para Comum.

**Aceite:** sem duplicação do mesmo Único e sem raridade decrescente. **Bloqueio conhecido:** recompensas concretas de arma + item Único + especial da faixa +200 ainda incompletas; não fechar essa tarefa do GDD.

## QA-BRW-04 — penalidade da arma acima do nível

- [ ] Equipar uma arma que exige nível superior, conferir que **duas** peças de armadura são desativadas.
- [ ] Na UI, selecionar uma das desativadas para ativar e verificar que outra peça é automaticamente desativada, mantendo exatamente duas.
- [ ] Remover/trocar para arma adequada ao nível, verificar que a defesa e todos os slots se restauram.
- [ ] Save/load na condição de penalidade: conferir consistência de stats, equipamento e visual.

**Aceite:** nunca 0, 1, 3 ou 4 peças desativadas **enquanto a penalidade estiver vigente**, salvo mudança explícita do GDD.

## QA-BRW-05 — geração, entradas, inimigos e santuários

- [ ] Para cada bioma, usar seed conhecida, atravessar N/S/L/O, explorar ramificações e alcançar santuário, elite e boss.
- [ ] Verificar que inimigos nascem em chão livre, fora de paredes/obstáculos, e a ≥140px das entradas, sem sobreposição com player.
- [ ] Entrar em santuário e descansar repetidamente; confirmar nenhuma unidade hostil dentro dessa sala.
- [ ] Voltar à sala já limpa: registrar regra vigente de respawn em transição vs descanso, para avaliar inconsistências com GDD.
- [ ] Repetir exatamente a mesma seed e anotar correspondência de portas, layout, hazard e boss.
- [ ] Na Biblioteca do Oculto, entrar em porta comum várias vezes: deve seguir o grafo; efeitos ilusórios devem partir do **hazard específico** e não teleportar arbitrariamente por qualquer porta.

**Aceite:** sem spawn dentro de paredes, sem softlocks, sem inimigos na área segura, sem redirecionamento aleatório de porta normal.

## QA-BRW-06 — baús, XP, save e segunda morte

- [ ] Abrir baú por clique e por tecla de interação; verificar item e XP **realmente creditados**.
- [ ] Sair e reentrar na sala do baú; após fechar/abrir navegador, confirmar que o baú não pode conceder recompensa duas vezes.
- [ ] Encontrar orbe de XP após morrer, recuperar com tecla G e confirmar que a XP persiste após reload.
- [ ] Morrer duas vezes sem recuperar: o valor antigo é perdido, só a XP da segunda morte pode ser recuperada.
- [ ] Avançar área após derrotar boss e carregar save; verificar estado consistente de boss derrotado e área.

**Aceite:** sem farm acidental de baús/orbe após reload, salvamento sem corrupção.

## QA-BRW-07 — arte ASCII em 10 biomas

- [ ] Comparar `player_idle_0/1` e `player_walk_0/1`: a matriz atual é compartilhada em cada par; **registar que os frames não são genuinamente diferentes**, embora renderizados.
- [ ] Alternar idle→walk→attack→block/parry no tamanho real; capturar variação de escala do sprite, origem, hitbox e arma segurada pela mão.
- [ ] Comparar 10 boss arts em arena real, fases, transparência, telegraph e bossbar.
- [ ] Repetir piso/parede/porta em mosaicos 3×3 e 5×5, conferir junção sem costura perceptível.
- [ ] Água do Aqueduto, sangue do Cárcere e magma da Forja: quadros animados, leitura de profundidade, margens e warning de perigo.
- [ ] Medir FPS/frame time em santuário, sala com 4 inimigos e boss+hazard, com Vite DevTools/performance se disponível.

**Aceite:** desenho legível e frames coerentes sem hitbox ampliada; FPS e memória medidos. **Não aceitar** “visual finalizado” só porque `KnightArt.js` contém glifos.

## QA-BRW-08 — integridade da UI e navegação

- [ ] Abrir e fechar inventário em combate/pausa, durante ataques e hazards; confirmar que não dispara golpes indevidos.
- [ ] Valores de barras (HP, stamina, XP, poise), notificações e tooltip correspondem ao estado real.
- [ ] Testar mudança de abas/janela, reload em combate, santuário e boss.
- [ ] Verificar logs e eventos após transições longas, com atenção a entidades/tweens remanescentes.

## Registro padronizado de resultados

Para **cada caso**: `ID | commit | seed | bioma | sala | passos | esperado | observado | PASSOU/FALHOU/NÃO EXECUTADO | screenshot/log | data`.

**Ao concluir um caso:** atualizar [Plano de validação](../04-gestao/PLANO_DE_VALIDACAO.md), [Matriz de 55](MATRIZ_55_TAREFAS.md) e tarefa temática associada. Não apagar status históricos.

## Pendências que devem continuar abertas mesmo com QA-BRW completo

- Arma + item Único + recompensa especial de +200 precisam de definição e entrega real.
- Famílias Foice, Arco, Especiais não estão implementadas como três famílias concretas em `WEAPON_FAMILIES`.
- Ghosts, rankings, áudio completo e GDD autoral integral não foram implementados pela auditoria.
- Determinismo da posição interna de RNG de loot após reload parcial da área carece de persistência adicional.
- O CI verifica existência das artes ASCII, não avaliação estética final.

**Este roteiro é para ser executado no Antigravity. Nenhum caso foi marcado como passado sem observação real do navegador.**
