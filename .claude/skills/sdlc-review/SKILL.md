---
name: sdlc-review
description: >-
  Etapa 5 (Deploy) do SDLC deste repositório. Review agentic de um PR, branch ou diff segundo a política da própria
  skill, em três passes (bugs, segurança, conformidade com spec e plan), sem corrigir nada; registra cada rodada em
  docs/changes/NNN-slug/review.md. Use quando pedirem review de um PR ou das mudanças de um item, ou quando a skill sdlc
  encaminhar.
argument-hint: "<número do PR, branch, ou vazio para o diff atual>"
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash(git diff *)
  - Bash(git log *)
  - Bash(git rev-parse *)
  - Bash(gh pr view *)
  - Bash(gh pr diff *)
  - Bash(${CLAUDE_PROJECT_DIR}/.claude/skills/sdlc/scripts/status.sh *)
  - Bash(.claude/skills/sdlc/scripts/status.sh *)
disallowed-tools: Edit, NotebookEdit
---

# Etapa 5: DEPLOY → review

Você faz o review agentic de uma mudança. Você **não** aprova, não corrige e não faz merge: seu papel é informar o
revisor humano. Edit está desabilitado enquanto esta skill está ativa. O único arquivo que você grava é o `review.md` da
pasta do item; não use Write para mais nada.

Alvo: $ARGUMENTS (número do item, número de PR ou vazio; sem PR, o diff é `git diff main...develop`)

## Passos

1. Leia a política em `${CLAUDE_SKILL_DIR}/policy.md` e siga-a à risca (passes, severidade, limite de nits, o que não
   reportar).
2. Obtenha o diff (`gh pr diff <n>` se for PR; senão `git diff main...develop`). Identifique o item pelo número
   pedido, pelos links do PR ou pelo item em "Em review" no `status.sh`; rode `${CLAUDE_PROJECT_DIR}/.claude/skills/sdlc/scripts/status.sh <NNN>` para achar a pasta e leia `intent.md`,
   `spec.md` (se for feature), `plan.md` e o `review.md` anterior, se houver.
3. Faça os três passes:
   - **Bugs**: lógica, bordas, regressões.
   - **Segurança**: o equivalente a `/security-review`: onde entra input controlável por atacante, segredos, dados
     pessoais em log, permissões.
   - **Conformidade**: o diff bate com o `plan.md` (arquivos, ordem, provas, passos marcados `[x]`) e com os critérios
     de aceitação do `spec.md`? Algum arquivo fora do plano sem registro em "Desvios"? Algum teste editado numa
     correção? Achado de uma rodada anterior que continua sem correção?
4. Verifique se a evidência mecânica está no PR (saída de testes, build e lint).
5. Classifique o risco: rotina ou alto (auth, pagamentos, migrações, infra, ações irreversíveis).

## Saída

Achados ordenados por severidade, cada um com `[Bugs|Segurança|Conformidade]`, arquivo:linha, problema e sugestão.
Termine com `Important: N · Nit: N · Risco: <rotina|alto>` e quem precisa aprovar. Se o mesmo tipo de achado já apareceu
antes, sugira adicioná-lo a "Coisas que o Claude erra" no `CLAUDE.md`.

## Registro

- Rodando local: acrescente a rodada no fim de `<pasta do item>/review.md`, criando o arquivo a partir de
  `${CLAUDE_SKILL_DIR}/assets/review.md` se ele não existir. Numere a rodada, com data e o commit revisado
  (`git rev-parse --short HEAD`). Commit do `review.md` e das correções que vierem dele, só se o humano disser sim.
- Quando o pedido for postar no PR (é o caso do CI), não grave arquivos: poste os achados como comentários.

Depois, com o sim do humano, a `develop` vai para a `main` (`${CLAUDE_PROJECT_DIR}/.claude/skills/sdlc/references/git.md`)
e o próximo passo é `/sdlc concluir <NNN>`.
