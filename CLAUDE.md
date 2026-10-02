# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projeto

Navegador por voz: o usuário fala um comando em pt-BR ("abre o youtube", "clica em entrar") e o Chrome executa a ação
na página aberta. Visão, princípios e restrições que valem para todo item, métricas, riscos e glossário (Jev, quiz,
limiares) estão em `docs/product/vision.md`; o diagrama da solução completa, em `docs/product/navegador-por-voz.svg`.

## Comandos

Ainda não existem (Build, Teste, Lint, Rodar local). Preencha esta seção e "Verificando seu trabalho" quando o
`plan.md` do primeiro item de produto (feature) definir a stack; o verifier e os evals leem esses comandos daqui. Os
evals de exemplo (`.claude/evals/exemplo-*.json`) já presumem `npm test`, `npm run lint`, `src/rules/`, `src/config/` e
`tests/`.

## Convenções

- Documentos e artefatos em português do Brasil. Markdown segue `.prettierrc.json` (largura 120, `proseWrap: always`).
- Código que lê a página, envia dados ao Jev ou executa ações segue a skill `seguranca-acoes-voz`: confirmação para ação
  perigosa (palavra-chave OU julgamento do Jev), senha/cartão/conteúdo de input nunca saem do navegador, limiares num
  único arquivo de configuração, sem transcrição ou conteúdo de página em log, um teste por regra.
- Aprovação é sempre humana, dada na conversa: o Claude só grava `Status: approved` depois do sim do humano, seguindo
  `.claude/skills/sdlc/references/portao.md`. Commit só com o sim do humano; push e merge, no máximo sugira.

## Arquitetura do processo

- Hooks em `.claude/settings.json` (precisam de `jq`) bloqueiam com exit 2; a mensagem de stderr diz o motivo:
  - `protect-paths.sh`: `src/gen/`, `vendor/`, `.github/workflows/` e vision/intent/spec já aprovados em `docs/` (só a
    troca de `Status: approved` para `draft`, ao reabrir, passa).
  - `protect-tests.sh`: qualquer arquivo de teste enquanto existir `.claude/.tests-locked` (fase C do `/sdlc-bugfix`).
  - `block-secrets.sh`: conteúdo com formato de credencial.
  - `production-gate.sh`: comandos com `deploy` + `prod` ou publicação na Chrome Web Store sem `RELEASE_APPROVAL`.
- `.claude/agents/verifier.md` confere o trabalho com contexto limpo ao fim do `/sdlc-build` e não corrige nada.
- `.claude/skills/sdlc-review/policy.md` define como revisar (passes Bugs/Segurança/Conformidade, no máximo cinco
  nits, contagem final); é lida pela skill `/sdlc-review`, local e no `.github/workflows/claude-review.yml`. Cada rodada
  de review de um item fica em `docs/changes/<NNN-slug>/review.md`.
- `.claude/evals/` testa o comportamento do agente, não o produto: `run.sh [padrão]` roda cada `*.json` com
  `claude -p` e `check.sh` avalia. Requer `claude`, `jq`, git e `ANTHROPIC_API_KEY`. Todo incidente vira um eval.
- `.claude/skills/sdlc-incident/bands.yaml` define as faixas de métrica que disparam `/sdlc-incident`, que só
  diagnostica e escreve um novo intent.
- O fluxo é feito de skills: `sdlc` orquestra e `sdlc-<etapa>` executa cada etapa, com o template em `assets/`.
  `.claude/skills/sdlc/scripts/status.sh` calcula o estado de cada item; `references/kit.md` tem instalação,
  métricas e fidelidade ao playbook.
- O kit veio do template https://github.com/flaviovl/ai-native-sdlc-kit. Mudanças no processo (skills `sdlc*`, hooks,
  evals, workflows) são feitas lá e depois trazidas para cá; aqui fica só a aplicação.

## Coisas que o Claude erra

Nenhuma registrada ainda. Quando um achado de review se repetir pela segunda vez, ele entra aqui.

## Fluxo SDLC deste repositório

- `docs/product/vision.md` descreve o produto e vale para todo item; tem portão de aprovação, mas fica fora do ciclo.
  Uma feature só gera spec com ele aprovado.
- Uma pasta por trabalho em `docs/changes/<NNN-slug>/` (slug em inglês). Feature: `intent.md` → `spec.md` → `plan.md`.
  POC (`Tipo: poc`): `intent.md` → `plan.md` → `findings.md`, código descartável. Bug (`Tipo: bug`, `/sdlc-bugfix`):
  `intent.md` → `plan.md` test-first. Feature e bug terminam com `review.md` (uma rodada por review). Material de
  apoio do item em `attachments/`. Templates ficam nas skills
  (`.claude/skills/sdlc*/assets/`).
- Ideia, problema ou bug que surgir no meio de qualquer trabalho ou pesquisa vira um arquivo em `docs/backlog/`
  (`/sdlc anotar`); não amplie o item em andamento. Ao virar trabalho, a entrada vai para a pasta do item como
  `origin.md`.
- Não escreva código de produção sem um `plan.md` com `Status: approved` para a tarefa.
- Entrada: `/sdlc` (status, seguir, novo, anotar, detalhe, voltar, concluir). Produto: `/sdlc-product`. Etapas:
  `/sdlc-intent`, `/sdlc-spec`, `/sdlc-plan`, `/sdlc-build`, `/sdlc-bugfix`, `/sdlc-review`, `/sdlc-incident`.
- A resposta do humano na conversa é a assinatura de cada artefato; a implementação acontece em branches
  `sdlc/<NNN>-<slug>`. Um item está concluído quando o `plan.md` tem `Status: done`, gravado só depois que o humano
  confirma a entrega.
- Se um hook bloquear uma edição, não contorne pelo Bash (`sed`, `echo >`, `cp`): diga ao humano o que ele precisa
  mudar.

## Verificando seu trabalho

- Build: a definir no `plan.md` do primeiro item de produto (deve terminar sem erro)
- Teste: a definir (tudo verde; nunca pule nem apague teste falhando)
- Lint: a definir (zero warnings)

Rode os três antes de dizer que a tarefa terminou e cole a saída. Se um teste falhar, corrija o código, não o teste.
