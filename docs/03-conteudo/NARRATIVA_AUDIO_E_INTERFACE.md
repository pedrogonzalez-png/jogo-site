# Narrativa, áudio, interface e acessibilidade — contratos para agentes

> **Natureza:** requisitos e diretrizes de qualidade. História definitiva, diálogos, trilhas e identidade de NPCs exigem material autoral ou decisão futura. Não inventar canon.
> [Tarefas de conteúdo](../04-gestao/tarefas/05-CONTEUDO_E_ACESSIBILIDADE.md) · [Checklist legado](INTERFACE_AUDIO_E_SAVE.md)

## 1. Narrativa dirigida por dados (proposta)

Separar registros do conteúdo (NPCs, diálogos, entradas de lore, missões e eventos) dos controladores da GameScene. Um registro de evento deve possuir **ID estável**, gatilho, pré-condições, efeitos controlados e chaves de localização. Narrativa ambiental por bioma não deve comprometer conectividade ou combate.

Fluxos possíveis: descobrir nota/objeto → registrar no diário → acionar diálogo → atualizar missão → salvar estado; ações irreversíveis exigem persistência explícita.

**Não pressupor:** nomes finais de personagens, lore, desfechos, ordem canônica de biomas, tempo de campanha e sistema de escolhas aprovados.

## 2. Contratos de NPC/quest, se for implementado

- Definição de NPC: id, tipo, bioma, diálogo padrão, condições de encontro, estados persistentes.
- Quest: id, pré-condições, etapas, objetivos, eventos, flag de conclusão e recompensas.
- IDs estáveis entre saves; migrações testadas.
- Eventos de narrativa não podem duplicar loot, XP ou itens únicos ao carregar.
- Diálogo suporta teclado, gamepad caso venha a ser suportado, e fechamento sem softlock.

## 3. Áudio

- A chave music em src/data/biomes.js é metadado, **não evidência de reprodução sonora**.
- Definir APIs de música de bioma, tema de boss, ambiente, golpes, passos, bloqueio, parry, loot, UI, perigo ambiental e morte.
- Preferências separadas para música, efeitos e volume mestre, com mute e persistência.
- Respeitar regras do navegador para desbloqueio de áudio após gesto do usuário.
- Áudio procedural é opção de implementação, não obrigação desta reorganização; se usado, documentar sintetizador, ganho e limites de clipping.
- Não inserir mídias de terceiros sem licença.

## 4. Interface

Exibir HP, stamina, barras de poise quando relevante, efeitos acumulados, cargas de cura, XP, atributos, equipamentos, raridade, santuário/checkpoint, bossbar, avisos do ambiente e indicação da tecla de interação.

- Contraste e legibilidade no estilo ASCII.
- Textos de feedback não devem cobrir telegraphs e ataques.
- Menus pausados devem impedir inputs de combate indevidos.
- Teclado e mouse precisam continuar funcionais; gamepad/toque são requisitos a auditar, não funcionalidades verificadas.

## 5. Acessibilidade mínima

- Tamanho de texto ajustável quando viável; evitar fonte minúscula em menus, ainda que as texturas ASCII tenham alta densidade.
- Redução de flashes, tremulação e screen shake.
- Opções de áudio/mute claramente diferenciadas.
- Cores não devem ser a única forma de diferenciar status/inimigo/hazard.
- Rebinding de teclas e gamepad somente quando definidos por tarefa; não declarar suportado sem teste.
- Pausa durante animações complexas precisa congelar ou reconciliar estado visual e simulação.

## 6. Integração e testes

- Gameplay continua fonte de verdade do estado; a UI lê o modelo, não altera dano por engano.
- Configuração e preferências exigem persistência versionada e fallback.
- Testar reload, mudança de bioma, fim de boss, abertura de inventário, pausa e retorno.
- Testar foco do navegador, mudança de aba, repetição de entrada, acessibilidade por teclado e equipamentos diferentes.

**Documentar explicitamente** se um item é conceito, placeholder, codificado, integrado, ou validado no jogo.
