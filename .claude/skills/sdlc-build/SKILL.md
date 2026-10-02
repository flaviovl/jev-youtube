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
- Trabalhe na `develop`, sem branch por item (`${CLAUDE_PROJECT_DIR}/.claude/skills/sdlc/references/git.md`). Rode
  `${CLAUDE_PROJECT_DIR}/.claude/skills/sdlc/scripts/status.sh <NNN>` para ver o último commit e o que falta commitar.
- Se o build já começou, continue do primeiro passo sem `[x]`; leia "Desvios" antes.

## Implementação

1. Siga a **Ordem do trabalho** do plano, um passo por vez.
2. Para cada passo, escreva ou atualize junto com o código os testes listados em **Prova**.
3. Aplique as skills de política relevantes (por exemplo, segurança) enquanto escreve, não depois.

## Ciclo de feedback (obrigatório)

Depois de cada passo, rode os comandos da seção "Verificando seu trabalho" do `CLAUDE.md` (build, testes, lint) e itere
até passar. Nunca pule, desative ou apague um teste que falha: corrija o código. Para UI, compare com o mock ou
screenshot e itere 2 a 3 rodadas. Quando o passo passar, marque `[x]` nele no `plan.md`: é isso que mostra o progresso
no status e o ponto de retomada. Commit não é pedido a cada passo: no início do build, pergunte uma vez (AskUserQuestion)
se o Claude faz um commit local pequeno a cada passo ou deixa tudo sem commit, e siga a resposta até o fim do item.

## Desvios

Se precisar fazer algo diferente do plano, pare, explique e, se o engenheiro concordar, registre em "Desvios durante a
implementação" do `plan.md` (data, o quê, motivo). O diff final deve bater com o plano. Se o desvio muda requisito ou
critério de aceitação do spec, não é desvio: pare e sugira voltar ao spec (skill `sdlc`, operação `voltar`).

## POC (`Tipo: poc`)

O código é descartável e fica fora do git, numa pasta ignorada (`_poc/`). O ciclo de feedback de cada passo é a medição da Prova, não
build, testes e lint de produção. No estado "Escrever findings", grave `findings.md` na pasta do item a partir de
`${CLAUDE_SKILL_DIR}/assets/findings.md`: uma seção por pergunta do intent, com resposta, evidência e impacto. Pule o
verifier e o review. A pasta do item (plan marcado, `findings.md`, `attachments/`) vai num commit na `develop`, se o
humano disser sim; o código da POC nunca é commitado.
Ideias que surgirem vão para `docs/backlog/` (skill `sdlc`, operação `anotar`). Próximo: levar as respostas ao
`docs/product/vision.md` (skill `sdlc`, operação `detalhe`) e `/sdlc concluir <NNN>`.

## Verificação independente

Ao terminar, delegue ao subagente **verifier** (`.claude/agents/verifier.md`) a checagem final com contexto limpo.
Corrija o que ele apontar e rode de novo.

## Entrega

- Cole a saída final de build, testes e lint.
- Mapeie cada critério de aceitação do spec para o teste ou evidência que o prova.
- Pergunte se o Claude commita o que falta na `develop`. Push só com o sim. PR `develop` → `main` é opcional; se o
  humano quiser, use `.github/PULL_REQUEST_TEMPLATE.md`.
- Próximo: `/sdlc-review <NNN>` (diff `main...develop`). Depois, com o sim do humano, levar a `develop` para a `main`
  (`${CLAUDE_PROJECT_DIR}/.claude/skills/sdlc/references/git.md`) e `/sdlc concluir <NNN>`.
