---
name: sdlc-build
description:
  Etapas 3 e 4 (Build e Test) do SDLC deste repositório. Implementa um plan.md aprovado passo a passo, com ciclo de
  feedback (build, testes, lint), marca cada passo concluído no plano e fecha com o subagente verifier. Use quando
  pedirem para implementar, construir ou continuar a implementação de um item NNN, ou quando a skill sdlc encaminhar.
argument-hint: "<NNN>"
allowed-tools:
  - Bash(${CLAUDE_PROJECT_DIR}/.claude/skills/sdlc/scripts/status.sh)
  - Bash(${CLAUDE_PROJECT_DIR}/.claude/skills/sdlc/scripts/status.sh *)
  - Bash(.claude/skills/sdlc/scripts/status.sh)
  - Bash(.claude/skills/sdlc/scripts/status.sh *)
---

# Etapas 3 e 4: BUILD com ciclo de feedback

Item: $ARGUMENTS

Estado atual:

!`${CLAUDE_PROJECT_DIR}/.claude/skills/sdlc/scripts/status.sh`

## Pré-condições

- Ache o item na tabela. Esta etapa só roda com `Plan: approved` e estado "Build a iniciar", "Build k/n" ou "Build
  (plano sem checklist)". Em qualquer outro estado, pare e diga o estado e a próxima ação que a tabela mostra.
- Leia `intent.md`, `spec.md` e `plan.md` da pasta do item, o `CLAUDE.md` e as skills de política aplicáveis.
- Trabalhe na branch `sdlc/<NNN>-<slug>`: `git switch -c sdlc/<NNN>-<slug>` se ela não existir, `git switch` se existir.
  Rode `${CLAUDE_PROJECT_DIR}/.claude/skills/sdlc/scripts/status.sh <NNN>` para ver a branch e o último commit.
- Se o build já começou, continue do primeiro passo sem `[x]`; leia "Desvios" antes.

## Implementação

1. Siga a **Ordem do trabalho** do plano, um passo por vez.
2. Para cada passo, escreva ou atualize junto com o código os testes listados em **Prova**.
3. Aplique as skills de política relevantes (por exemplo, segurança) enquanto escreve, não depois.

## Ciclo de feedback (obrigatório)

Depois de cada passo, rode os comandos da seção "Verificando seu trabalho" do `CLAUDE.md` (build, testes, lint) e itere
até passar. Nunca pule, desative ou apague um teste que falha: corrija o código. Para UI, compare com o mock ou
screenshot e itere 2 a 3 rodadas. Quando o passo passar, marque `[x]` nele no `plan.md` e faça um commit pequeno: é isso
que mostra o progresso no status e o ponto de retomada.

## Desvios

Se precisar fazer algo diferente do plano, pare, explique e, se o engenheiro concordar, registre em "Desvios durante a
implementação" do `plan.md` (data, o quê, motivo). O diff final deve bater com o plano. Se o desvio muda requisito ou
critério de aceitação do spec, não é desvio: pare e sugira voltar ao spec (skill `sdlc`, operação `voltar`).

## POC (`Tipo: poc`)

O código é descartável e fica na branch, sem PR para merge. O ciclo de feedback de cada passo é a medição da Prova, não
build, testes e lint de produção. No estado "Escrever findings", grave `findings.md` na pasta do item a partir de
`${CLAUDE_SKILL_DIR}/assets/findings.md`: uma seção por pergunta do intent, com resposta, evidência e impacto. Pule o
verifier e o review. Como a branch nunca é mergeada, traga a pasta do item (plan marcado, `findings.md`, `attachments/`)
para a `main` com `git checkout sdlc/<NNN>-<slug> -- <pasta do item>` e peça o commit; o código fica só na branch.
Ideias que surgirem vão para `docs/backlog/` (skill `sdlc`, operação `anotar`). Próximo: levar as respostas ao
`docs/product/vision.md` (skill `sdlc`, operação `detalhe`) e `/sdlc concluir <NNN>`.

## Verificação independente

Ao terminar, delegue ao subagente **verifier** (`.claude/agents/verifier.md`) a checagem final com contexto limpo.
Corrija o que ele apontar e rode de novo.

## Entrega

- Cole a saída final de build, testes e lint.
- Mapeie cada critério de aceitação do spec para o teste ou evidência que o prova.
- Prepare o PR com `.github/PULL_REQUEST_TEMPLATE.md`, com links para intent, spec e plan. **Não faça merge**: quem
  aprova é o dono do código.
- Próximo: `/sdlc-review` no PR. Depois do merge: `/sdlc concluir <NNN>`.
