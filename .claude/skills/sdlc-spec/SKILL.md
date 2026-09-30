---
name: sdlc-spec
description:
  Etapa 2 (Design) do SDLC deste repositório. Gera spec.md (requisitos e design) a partir de um intent.md aprovado,
  aplicando as skills de política do projeto. Use quando pedirem o spec, os requisitos ou o design de um item NNN, ou
  quando a skill sdlc encaminhar.
argument-hint: "<NNN>"
allowed-tools:
  - Bash(${CLAUDE_PROJECT_DIR}/.claude/skills/sdlc/scripts/status.sh)
  - Bash(${CLAUDE_PROJECT_DIR}/.claude/skills/sdlc/scripts/status.sh *)
  - Bash(.claude/skills/sdlc/scripts/status.sh)
  - Bash(.claude/skills/sdlc/scripts/status.sh *)
---

# Etapa 2: DESIGN → spec.md

Item: $ARGUMENTS

Estado atual:

!`${CLAUDE_PROJECT_DIR}/.claude/skills/sdlc/scripts/status.sh`

## Pré-condições (antes de tudo)

- Ache o item na tabela. Esta etapa só roda com o estado "Spec a gerar" ou "Spec em rascunho" (refazer um spec que ainda
  não foi aprovado). Itens `Tipo: poc` e `Tipo: bug` não têm spec, e uma feature com o produto ainda não aprovado
  aparece como "Aguardando produto". Em qualquer outro estado, pare e diga o estado e a próxima ação que a tabela
  mostra.
- Leia o `intent.md` da pasta do item, o `docs/product/vision.md`, o `CLAUDE.md` e o código existente o bastante para
  saber onde a mudança encaixa.
- Trate os princípios e restrições do `vision.md` como política: na seção 5 (Conformidade) do spec, inclua uma linha
  para ele, e um conflito com ele vai para "Áreas de preocupação".
- Liste as skills de política em `.claude/skills/` (as que não começam com `sdlc`): segurança, UX, marca, compliance.

## Tarefa (prompt original do playbook)

> Read the attached intent.md and produce a requirements and design spec for integrating it into our existing codebase.
> Apply the skills available to you so the plan conforms to our brand guidelines, security policies and UX standards.
> Document the spec fully as spec.md, ready to hand to the engineering team. Describe clearly any areas of concern,
> especially where you cannot satisfy contradicting policies.

## Regras

- Salve `spec.md` na pasta do item, ao lado do intent, seguindo `${CLAUDE_SKILL_DIR}/assets/spec.md`, com
  `Status: draft`.
- Todo requisito aponta para algo no intent. Não invente escopo; se achar necessário, ponha em "Áreas de preocupação".
- Responda as "Perguntas em aberto" do intent que o código ou a pesquisa permitirem; as demais ficam pendentes,
  indicando se bloqueiam.
- Critérios de aceitação verificáveis por comando ou observação objetiva.
- Classifique o risco (seção 7) e diga quem precisa aprovar.
- Não escreva código.

## Ao final

Resuma em 5 linhas: requisitos principais, risco, áreas de preocupação que precisam de dono de política. Diga: "Revise
contra a ideia original; resolva as preocupações com os donos das políticas; se aprovar, mude `Status: approved`,
preencha **Decisão** e faça commit. Depois: `/sdlc-plan <NNN>`, de preferência numa sessão nova e em plan mode
(Shift+Tab)."
