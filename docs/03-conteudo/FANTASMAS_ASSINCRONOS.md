# Fantasmas assíncronos, corridas contra si mesmo e rankings — proposta

> **Origem:** recurso discutido como possibilidade futura do Abismo. **Não declarar implementado** sem módulo, persistência e reprodução testados. **Sem multiplayer em tempo real.**
> [Backlog de fantasmas](../04-gestao/tarefas/04-FANTASMAS_ASSINCRONOS.md) · [Decisões pendentes](../01-projeto/DECISOES_PENDENTES.md)

## 1. Experiência pretendida

O jogador realiza uma tentativa e grava um rastro de sua execução. Depois pode:
- Enfrentar seu próprio melhor tempo/rota anterior como “fantasma”.
- Comparar progresso, profundidade, tempo, número de mortes e desempenho.
- Futuramente optar por baixar fantasmas de terceiros e consultar rankings assíncronos.

O fantasma é **apenas um replay visual de uma run gravada**, e não outra entidade conectada à simulação em tempo real. Ele não deve colidir com o jogador, bloquear portas, causar dano ou alterar os resultados da seed.

## 2. Fases recomendadas

**Fase A — prova offline/local:** gravar/reproduzir a própria tentativa em uma mesma versão do jogo e mesma seed, com filtro de eventos para evitar gravação gigantesca. Salvar localmente; sem conexão, login ou servidor.

**Fase B — comparações locais:** maior profundidade, menor tempo, estatísticas e seleção manual de ghost para assistir/correr contra; incompatibilidades de versão visíveis.

**Fase C — contrato de compartilhamento:** estrutura versionada, validação, compressão, política de publicação e privacidade. Só após decisão específica haverá backend/ranking.

**Fase D — comunidade:** classificação e seleção de desafios por seed/bioma/dificuldade/versão, com regras de moderação e anti-fraude.

## 3. Modelo conceitual de dados (proposta, não schema já existente)

- **meta:** replayVersion, gameVersion, buildHash, seed, biomeId, startArea, endArea, startLevel, outcome.
- **timing:** duração total e relógio monotônico relativo à run, sem usar timestamp absoluto para física.
- **amostragem:** instantes relativos, coordenadas x/y, direção/pose, ações significativas, vida/estamina se necessária à visualização.
- **eventos:** transição de sala, ataque, esquiva, bloqueio, parry, morte, boss iniciado/vencido, avanço de área.
- **resultado:** nível, profundidade máxima, objetivos cumpridos, tempo, mortes, métricas comparáveis.
- **integridade:** hash do payload, limites de tamanho/tempo, normalização de valores e rejeição de formatos desconhecidos.

**Escolha técnica ainda aberta:** gravar inputs determinísticos ou snapshots posicionais. Seeds iguais **não garantem** reprodução de física/comportamento idênticos em versões distintas; se inputs forem usados, exigir controle de versões e determinismo de simulação. Snapshots podem reduzir dependência determinística, mas exigem interpolação e maior espaço.

## 4. Regras de separação de gameplay

- Replay nunca deve invocar funções de dano, loot, XP, IA, boss ou save de progresso.
- Uma entidade de fantasma é apenas visual, em camada distinta, com opacidade e opção de ocultar.
- Mudança de sala precisa carregar trecho correspondente do replay sem teleportar o jogador real.
- Fantasma ausente/incompatível não impede partida ou save.
- Toda exportação de ghost precisa ser opcional; não publicar dados pessoais por padrão.
- Comparar tempos apenas quando as condições de seed, versão e desafio forem compatíveis.

## 5. UX e acessibilidade

- Controles: gravar ou não, escolher ghost, ocultar/mostrar, controlar transparência.
- Legenda/ícone que o diferencie de inimigos, aliados e áreas perigosas.
- Modo solo sem ruído visual extra; flash/flicker limitados.
- Resumo pós-run com comparação fundamentada nos dados realmente gravados.

## 6. Segurança, rede e privacidade — se chegar à fase online

- Nenhuma chave de API, senha ou token no cliente/repositório.
- Validar payload e limitar armazenamento/tráfego no backend.
- Não confiar em tempo, vida ou posição fornecidos apenas pelo cliente para ranking competitivo.
- Política clara de exclusão, publicação voluntária, versionamento e replays expirados.
- Não prometer anti-cheat infalível; usar verificações reproduzíveis conforme viabilidade.

## 7. Aceite mínimo de MVP do fantasma

1. Reproduzir run salva do próprio jogador depois de reiniciar o navegador.
2. Mostrar fantasma sincronizado em idle/walk/dodge sem afetar colisão/combat/save.
3. Detectar e recusar replay incompatível, com aviso discreto.
4. Registrar métricas reproduzíveis e manter tamanho de arquivo limitado.
5. Funcionar offline e sem backend.
6. Ter testes de versão, sala, seed, memória, pausa, speedrun e corrupção de dados.

**Estado documental em 2026-10-21:** requisito futuro consolidado, não implementação confirmada.
