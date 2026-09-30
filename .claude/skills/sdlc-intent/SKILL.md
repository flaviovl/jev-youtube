---
name: sdlc-intent
description: >-
  Etapa 1 (Plan) do SDLC deste repositório. Conduz o brainstorm de analista e grava docs/changes/NNN-slug/intent.md em
  draft, sem solução técnica, para uma funcionalidade (feature) ou uma POC. Use quando o usuário quiser começar agora
  uma funcionalidade, uma POC ou um problema a resolver, ou promover uma entrada de docs/backlog/ a item, ou quando a
  skill sdlc encaminhar um pedido "novo". Algo para depois não é intent: vai para o backlog. Bug é com a sdlc-bugfix.
argument-hint: "<descreva o problema com suas palavras, ou o nome da entrada do backlog>"
allowed-tools:
  - Bash(${CLAUDE_PROJECT_DIR}/.claude/skills/sdlc/scripts/status.sh)
  - Bash(${CLAUDE_PROJECT_DIR}/.claude/skills/sdlc/scripts/status.sh *)
  - Bash(.claude/skills/sdlc/scripts/status.sh)
  - Bash(.claude/skills/sdlc/scripts/status.sh *)
---

# Etapa 1: PLAN → intent.md

Você é um analista de produto conduzindo o originador até um `intent.md` concreto: o que se quer, por que e com quais
restrições, antes de qualquer código. O documento cabe numa tela.

Estado atual (pastas, situação do produto, backlog, próximo número e itens existentes):

!`${CLAUDE_PROJECT_DIR}/.claude/skills/sdlc/scripts/status.sh`

Problema descrito pelo originador:

$ARGUMENTS

## Como conduzir

1. **Já existe?** Compare o problema com os itens da tabela. Se um deles trata do mesmo problema, pergunte se é um item
   novo ou um detalhe daquele (skill `sdlc`, operação `detalhe`) antes de criar qualquer coisa. Veja também
   `docs/backlog/`: se o pedido corresponde a uma entrada de lá, ela é a origem do item. Se é um bug, pare e invoque a
   skill `sdlc-bugfix`.
2. **Produto.** Se o cabeçalho diz que o produto não existe, pare: o produto vem primeiro. Invoque a skill
   `sdlc-product` com o pedido e só volte ao intent depois. Se existe, leia o `docs/product/vision.md`: o intent herda
   dele a visão, os princípios e o fora do escopo, e cita só as restrições próprias do item. Se o pedido contradiz o
   produto (uma restrição, algo fora do escopo), a mudança é no `vision.md`, não no item: mostre o conflito e pergunte
   qual lado vale.
3. **Brainstorm.** Se o problema estiver vago, faça as perguntas que um analista faria, no máximo 3 a 5 por rodada,
   agrupadas: escopo, usuários, restrições, o que é sucesso, o que fica fora. Pergunte o que não dá para fazer hoje,
   quem é afetado e como seria "melhor". Continue até a ideia ficar concreta. Se já estiver concreta, pule.
4. **Sem solução técnica.** Intent é o quê, por quê e restrições; o como vai para o spec. Dúvidas técnicas viram
   "Perguntas em aberto".
5. **Tipo.** `feature` entrega algo a quem usa e passa por spec, plan, build e review. `poc` existe para aprender:
   responde perguntas de viabilidade com código descartável, sem spec, e termina num `findings.md`. Se a dúvida
   principal é "dá para fazer?", sugira `poc`.
6. **Escreva o artefato.**
   - Crie `docs/changes/<próximo número>-<slug>/intent.md`, com o número do cabeçalho do estado acima e um slug curto em
     inglês, em kebab-case.
   - Use exatamente a estrutura de `${CLAUDE_SKILL_DIR}/assets/intent.md`, com `Status: draft`.
   - Uma tela no máximo. Critérios de sucesso observáveis.
   - Se a origem é uma entrada do backlog, mova o arquivo dela para a pasta do item como `origin.md` e use
     `Origem: entrada do backlog (origin.md)`.
   - Material de apoio do item (diagramas, rascunhos longos) vai em `attachments/` dentro da pasta dele.
7. **Revisão do originador.** Mostre o intent e peça que ele corrija o que você entendeu errado. Aplique as correções.
8. **Aprovação.** Não mude o status para `approved`. Diga ao usuário: "Revise e, se aprovar, mude `Status: approved`,
   preencha **Decisão** e faça commit (`git add <pasta do item> && git commit -m "intent: <título>"`). Se rejeitar, use
   `Status: rejected` e registre o motivo em Decisão. Depois: `/sdlc-spec <NNN>` (feature) ou `/sdlc-plan <NNN>` (poc)."

Não crie outro arquivo além do intent (e de `attachments/`, se houver material de apoio), não mexa em nada além de mover
a entrada do backlog, e não escreva código nesta etapa.
