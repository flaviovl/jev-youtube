---
name: sdlc-plan
description:
  Etapa 3 (Build, planejamento) do SDLC deste repositório. Produz plan.md com arquivos que mudam, ordem do trabalho em
  checklist, riscos e provas, a partir de intent e spec aprovados, sem editar código. Use quando pedirem o plano de
  implementação de um item NNN, ou quando a skill sdlc encaminhar.
argument-hint: "<NNN>"
allowed-tools:
  - Bash(${CLAUDE_PROJECT_DIR}/.claude/skills/sdlc/scripts/status.sh)
  - Bash(${CLAUDE_PROJECT_DIR}/.claude/skills/sdlc/scripts/status.sh *)
  - Bash(.claude/skills/sdlc/scripts/status.sh)
  - Bash(.claude/skills/sdlc/scripts/status.sh *)
---

# Etapa 3: BUILD (planejamento) → plan.md

Item: $ARGUMENTS

Estado atual:

!`${CLAUDE_PROJECT_DIR}/.claude/skills/sdlc/scripts/status.sh`

A revisão de design acontece antes do código. **Não edite nenhum arquivo de código nesta etapa.** O único arquivo que
você escreve é o `plan.md`, e só depois que o engenheiro aprovar o plano. O ideal é rodar em plan mode (Shift+Tab até
aparecer "plan mode"); se não estiver, sugira uma vez e siga.

## Pré-condições

- Ache o item na tabela. Esta etapa só roda com o estado "Plan a gerar" ou "Plan em rascunho". Em qualquer outro estado,
  pare e diga o estado e a próxima ação que a tabela mostra.
- Leia `intent.md` e `spec.md` da pasta do item, o `CLAUDE.md`, as skills de política relevantes em `.claude/skills/` e
  o código que será tocado.
- Item `Tipo: poc` não tem spec: leia o intent e o `docs/product/vision.md`. A Ordem do trabalho são os experimentos, um
  por pergunta do intent e com time-box, e a Prova de cada passo é a evidência que responde a pergunta. Código de POC é
  descartável; não planeje testes de produção para ele.
- Item `Tipo: bug` é planejado pela skill `sdlc-bugfix`, não por esta.

## Tarefa (do playbook)

> Give Claude the intent.md and the spec.md and ask for an implementation plan that names the files that change, the
> order of the work, and the tests that prove it.

Produza o plano no formato de `${CLAUDE_SKILL_DIR}/assets/plan.md`:

- **Arquivos que mudam**, com caminhos reais do repositório.
- **Ordem do trabalho** como checklist `- [ ] N. passo`, em passos pequenos e verificáveis. O `/sdlc-build` marca `[x]`
  em cada passo concluído, e o status do item é calculado a partir dessas caixas; por isso cada passo precisa ter um fim
  verificável.
- **Riscos**: o que pode quebrar, qual o passo mais arriscado, alternativas consideradas.
- **Prova**: testes e comandos que demonstram cada critério de aceitação do spec, com meta quantificável ("todos os
  testes em X passam", "endpoint retorna 200 com o campo Y").

## Interrogação

Apresente o plano e convide o engenheiro a questioná-lo: o que pode quebrar, qual o passo mais arriscado, que outras
opções existem. Itere até que um engenheiro novo consiga implementar só com o plano.

## Ao final

Siga o portão de `${CLAUDE_PROJECT_DIR}/.claude/skills/sdlc/references/portao.md`: artefato `plan.md`; próxima etapa
`/sdlc-build <NNN>`; commit `plan: <título>`. Em plan mode, a pergunta de aprovação é o ExitPlanMode: aceito, ele vale
como "Aprovar"; então grave `plan.md` com `Status: approved`, `Aprovado por: <nome>` e a data, e faça só as perguntas
que faltam (seguir ou parar, e commit).
