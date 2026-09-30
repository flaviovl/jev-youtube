---
name: sdlc-bugfix
description: >-
  Correção de bug do SDLC deste repositório como item em docs/changes/NNN-slug/ (Tipo: bug): registra o bug num intent,
  planeja e corrige test-first (teste que falha, testes travados com .claude/.tests-locked, correção só no código). Use
  quando o usuário relatar um bug, um teste falhando por defeito do produto ou um issue a corrigir que não precise de
  decisão de produto, quando promover um bug de docs/backlog/, ou para continuar um item de bug.
argument-hint: "<descrição do bug, nome da entrada do backlog ou NNN de um bug em andamento>"
allowed-tools: Read, Grep, Glob, Edit, Write, Bash
---

# Correção de bug test-first

Bug: $ARGUMENTS

Estado atual (pastas, backlog, próximo número e itens):

!`${CLAUDE_PROJECT_DIR}/.claude/skills/sdlc/scripts/status.sh`

Todo bug vira um item em `docs/changes/<NNN>-<slug>/` com `Tipo: bug`. O fluxo é intent → plan → correção → review →
`done`, sem spec, e não espera o produto estar aprovado. Se o argumento é o número de um bug que já existe, siga pelo
estado dele na tabela.

## 1. Registrar (bug sem item)

- Se o bug é grande (vários sistemas, decisão de produto), pare e sugira `/sdlc-intent` para tratá-lo como feature.
- Crie `docs/changes/<próximo número>-<slug em inglês>/intent.md` a partir de
  `${CLAUDE_PROJECT_DIR}/.claude/skills/sdlc-intent/assets/intent.md`, com `Tipo: bug` e `Status: draft`. Em "Problema",
  ponha o sintoma e como reproduzir; em "Resultado proposto", o comportamento esperado; em "Perguntas em aberto", a
  causa suspeita.
- Se o bug veio de `docs/backlog/`, mova a entrada para a pasta do item como `origin.md`.
- Não mude o status para `approved`. Peça: "Se estiver certo, mude `Status: approved`, preencha **Decisão** e faça
  commit. Para um bug pequeno, dá para aprovar o intent e o plano no mesmo commit."

## 2. Planejar (estado "Plan a gerar" ou "Plan em rascunho")

Leia o código relevante e proponha o plano a partir de `${CLAUDE_SKILL_DIR}/assets/plan.md`: causa suspeita, arquivos
prováveis e o teste que vai reproduzir o bug. Os quatro passos da Ordem do trabalho são fixos. Quando o usuário aprovar
na conversa, grave `plan.md` na pasta do item com `Status: approved` e peça o commit.

## 3. Corrigir (estado "Build a iniciar" ou "Build k/n")

Trabalhe na branch `sdlc/<NNN>-<slug>` e marque `[x]` em cada passo do `plan.md` assim que ele terminar:

1. Escreva um teste que **reproduz** o bug, rode e confirme que ele **falha pelo motivo esperado** (cole a saída).
2. Peça ao usuário para aprovar e fazer commit do teste (`git commit -m "test: reproduz <bug>"`). Depois do commit, crie
   a trava: `touch .claude/.tests-locked`. Com ela, o hook `protect-tests.sh` bloqueia qualquer edição em arquivos de
   teste.
3. Altere apenas código de produção até o teste passar. **Não edite o teste.**
4. Rode a suíte inteira e o lint (seção "Verificando seu trabalho" do `CLAUDE.md`) e remova a trava:
   `rm .claude/.tests-locked`.

## 4. Entregar

Prepare o PR com `.github/PULL_REQUEST_TEMPLATE.md`, ligado à pasta do item. Se o bug veio de um incidente, sugira
adicionar um eval em `.claude/evals/` para que a classe de erro não volte. Próximo: `/sdlc-review`; depois do merge,
`/sdlc concluir <NNN>`.
