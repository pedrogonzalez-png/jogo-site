# Plano de QA, testes e evidências para Antigravity

> **Situação desta reorganização (2026-10-21):** nenhum build ou teste de jogo foi executado; o trabalho consiste em documentação e revisão **estática parcial** de código. O relatório histórico de 09/10 está em [Auditoria e validações antigas](../auditoria_abismo.md).

## 1. Vocabulário de evidência

- **INSPECIONADO:** arquivo/símbolo presente; não demonstra funcionamento.
- **COMPILOU:** npm run build concluiu; não demonstra uso dos recursos.
- **TESTE AUTOMATIZADO:** caso, entradas, saída esperada, resultado e ambiente registrados.
- **TESTE VISUAL:** sprite/tile/efeito analisado em resolução real; print/seed e condições.
- **TESTE JOGÁVEL:** ação reproduzida na UI real e resultado observado.
- **REGRESSÃO:** reproduzido após alteração e comparado ao resultado anterior.
- **NÃO EXECUTADO:** indicar explicitamente por quê.

**Proibido:** converter “compilou” em “validado 100%”.

## 2. Ambiente de referência

- Node.js e npm compatíveis com Vite 8; verificar versões locais.
- Dependências do package-lock; iniciar com **npm ci** em filesystem que suporte symlinks.
- Executar **npm run build** e **npm run dev**. Abrir URL exibida pelo Vite, capturar console e alertas de WebGL/canvas.
- Em unidades exFAT/Ventoy, node_modules pode falhar em symlinks (EPERM). **Não apagar/reinstalar projeto** para contornar sem plano; usar diretório de dependências em filesystem compatível ou fluxo validado pelo ambiente.
- Registrar navegador, OS, GPU, resolução e modo de renderer.
- Resolução lógica do protótipo documentada: **1280×720**. Verificar redimensionamento e escala de pixel.

## 3. Suite de regressão mínima

| Caso | Ação | Evidência/aceite |
|---|---|---|
| QA-COM-01 | Caminhar em 8 direções e sprint | Direção, câmera e stamina corretas |
| QA-COM-02 | Esquivar no último frame de i-frame | Dano negado apenas durante janela lógica |
| QA-COM-03 | Bloquear, parry em ~200ms e errar parry | Guarda e punições condizentes |
| QA-COM-04 | Ataque leve/pesado/dodge/counter | Hitbox/dano/stamina sem divergência visual |
| QA-COM-05 | Defesa ≥ 2,5× ataque | Fórmula arredondada como especificada e sem valores negativos |
| QA-PROG-01 | Subir nível, aplicar pontos, salvar/recarregar | Atributos e XP sem perda/duplicação |
| QA-PROG-02 | Desafio diferenças 49,50,100,150,200,201 | Tier correto e sem sobreposição |
| QA-ITEM-01 | Equipar arma acima do nível | Penalidade das duas peças e retorno normal |
| QA-ITEM-02 | Obter item Único e repetir após reload | Não duplicar o mesmo ID de item |
| QA-DTH-01 | Morrer, recuperar orbe, morrer duas vezes | Sem duplicação e conforme estado |
| QA-WLD-01 | Gerar mesma seed duas vezes | Mesmo grafo, rotas e conteúdo determinístico |
| QA-WLD-02 | Transitar em quatro direções, voltar à sala | Porta correta e limpeza de entidades |
| QA-WLD-03 | Descansar em santuário | Sem inimigos no santuário/respawn seguro |
| QA-WLD-04 | Explorar todas as salas de cada bioma | Entrada–santuário–boss alcançáveis |
| QA-WLD-05 | Alterar profundidade extrema | Sem NaN, travas ou crescimento infinito de entidades |
| QA-ART-01 | Alternar idle/walk/attack/block | Sprite legível, sem salto de escala e sem colisão falsa |
| QA-ART-02 | Visualizar água, magma, sangue e efeito | Materiais distintos, animação coerente e FPS medido |
| QA-ART-03 | Tilemap em 3×3 e 5×5 | Sem emendas e com variantes perceptíveis |
| QA-BOSS-01 | Invocar chefe de cada bioma | Template/padrão correspondente e fase funcional |
| QA-GHO-01 | Reproduzir ghost local — **futuro** | Sem colisão, rede ou contaminação de save |
| QA-UI-01 | Abrir inventário e pausar durante combate | Inputs e estado de jogo não corrompidos |

## 4. Matriz de biomas

Para cada um dos dez IDs listados no [guia de biomas](../02-mundo/GUIA_DE_BIOMAS.md), executar:
1. Entrada com seed documentada.
2. Layout e paredes/portas sem bloqueio.
3. Inimigos comuns, elite e boss com identidade e template corretos.
4. Hazard específico acionado e desacionado.
5. Efeito visual ASCII correspondente (não mero placeholder genérico).
6. Santuário seguro e descanso.
7. Saída do bioma e reentrada após save.
8. Queda/estabilidade de FPS e uso de memória em cenas densas.
9. Captura de console, resultado e versão.

**Status inicial desta matriz:** NÃO REVALIDADO NESTA REORGANIZAÇÃO. Resultados anteriores estão disponíveis, mas não substituem teste fresco.

## 5. Benchmark artístico

Coletar, quando possível:
- FPS médio, mínimo aproximado e frame time em idle, combate e cena com muitos hazards.
- Número de texturas ASCII geradas e dimensão máxima; estimativa de memória.
- Tempo de boot, uso de cache e eventuais travamentos de GPU.
- Teste 1280×720 e redução de janela, com foco em fonte/célula, contorno e clareza de ataque.
- Para o cavaleiro, prints de idle 0/1, walk 0/1, attack e block na **mesma escala** e com o body desenhado em modo debug de física quando disponível.

## 6. Registro obrigatório de execução

| Campo | Exemplo de preenchimento |
|---|---|
| ID da tarefa | ABISMO-ART-103 |
| Commit/branch | Hash + branch real |
| Ambiente | Node, navegador, OS, GPU, resolução |
| Caso executado | QA-ART-01 |
| Seed/bioma/sala | Valores efetivos |
| Esperado | O que o GDD/critério exige |
| Obtido | Evidência objetiva observada |
| Artefatos | Screenshot, vídeo, log, teste |
| Resultado | PASSOU, FALHOU, BLOQUEADO, NÃO EXECUTADO |
| Regressão | Antes/depois |
| Pendências | Erro reproduzível e próximo passo |
| Data | Data do teste |

## 7. Revisão documental

Depois de cada validação, atualizar: (a) tarefa temática, (b) [registro de divergências](REGISTRO_DE_DIVERGENCIAS.md) se aplicável, (c) contadores do checklist legado **somente após auditoria/reconciliação**, (d) snapshot/relatório de QA com rastreabilidade.

## 8. Critério para dizer “marco concluído”

Um marco só está concluído quando suas tarefas obrigatórias têm critérios de aceite atendidos, o caminho crítico passou por regressão e nenhuma falha P0/P1 aberta impede o fluxo pretendido. No caso da arte ASCII, também exige **evidência visual** e benchmark aceitável — código compilado não basta.
