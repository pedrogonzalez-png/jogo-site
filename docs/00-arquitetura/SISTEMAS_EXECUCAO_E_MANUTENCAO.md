# Sistemas, execução e manutenção — Abismo

> Extraído de `docs/ESTRUTURA_DO_PROJETO.md` (versão documentada em 2026-10-09). Descrição histórica, não significa validação do código atual.
> [Índice da arquitetura](../ESTRUTURA_DO_PROJETO.md) · [Índice geral](../README.md)

## E. Sistemas de Jogo

O **Combate** interliga `DamageSystem`, `BalanceSystem` e `StaminaSystem`. Defender gasta _stamina_. O ataque possui pesos para gasto de stamina e para dano de _poise_ (equilíbrio) na vítima. Bater e receber ataques consome instâncias via `CombatSystem`. Efeitos contínuos ou temporários usam o `StatusEffectSystem`.
O **Equipamento** impacta atributos passivos pelo `WeaponSystem` e `ArmorSystem`, controlados pelo `InventorySystem` e salvos periodicamente pelo `SaveSystem` via serialização IndexedDB. Em mortes, todo XP atual é dropado (`XPSystem`), devendo ser coletado. Uma segunda morte destrói os vestígios permanentemente.

---

## G. Como executar e testar

1. **Instalar dependências**: `npm install` (via Node.js).
2. **Executar em dev**: `npm run dev` para iniciar o Vite e rodar em ambiente local na porta exposta.
3. **Build para produção**: `npm run build` cria a pasta `dist` gerando os bundles (o minificador pode acusar warns de chunking alto devido ao Phaser incorporado no source).

---

## H. Guia para Futuros Agentes

- **Integração Visual vs Mecânica:** Texturas (`BootScene.js`) são cinzas (ou deveriam ser) que recebem aplicação de "tint" (tintura) provenientes do `biomes.js`. Qualquer nova estrutura visual precisa se beneficiar da geração via Graphics na `BootScene`. Não anexe imagens, respeite a renderização procedural programática!
- **Mecânicas Ambientais:** Alterações físicas no mundo (espinhos, correntes) **NÃO USAM COLISÕES NO SISTEMA DE ARCADES** devido ao design das salas. Para evitar conflito e bloqueio físico incorreto nos obstáculos e paredes, todo _hazard_ de mecânica ambiental (`EnvironmentalHazards.js`) aplica o efeito por _distância matemática (Phaser.Math.Distance)_ durante os _ticks_ do método _update()_.
- **RoomGenerator**: A conectividade da sala é garantida por _Flood Fill_. Sempre utilize `_isReserved()` para impedir a geração de colunas nos eixos de conexão das portas (Norte, Sul, Leste e Oeste) e garanta que sua modificação arquitetural contemple essa liberação (já garantida no `_carveHallways()`).

---

## I. Limitações e Pendências

- **Sistema de Inimigos Clônico:** Atualmente, todos os 10 Biomas fazem spawn dos mesmos "Ash Walkers" e do "Ashen Lord" boss (`GameScene`). Não há pools instanciados para abrigar um leque único inimigo/boss por bioma.
- **BootScene**: Em revisões anteriores foi relatado problemas de coloração no sistema "Tint", sendo aconselhável gerar texturas com escala total de cinza.
- **Audios Inexistentes:** Embora haja metadados de configuração no `biomes.js`, os sons (SFX) não têm integração existente.
