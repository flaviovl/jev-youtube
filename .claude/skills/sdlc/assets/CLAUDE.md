# CLAUDE.md

<!-- Template do kit SDLC: copie para a raiz de um projeto novo e troque os marcadores <…>. Mantenha em até uma página;
     o que é do produto vai em docs/product/vision.md, não aqui. -->

## Projeto

<O que o produto faz, em duas ou três frases.> Visão, princípios e restrições que valem para todo item, métricas, riscos
e glossário estão em `docs/product/vision.md`.

## Comandos

- Build: `<ex.: npm run build>`
- Teste: `<ex.: npm test>`
- Lint: `<ex.: npm run lint>`
- Rodar local: `<ex.: npm run dev>`

Enquanto a stack não existir, escreva "a definir no `plan.md` do primeiro item de produto". O verifier e os evals leem
esses comandos daqui.

## Convenções

- Documentos e artefatos em <idioma>. Markdown segue `.prettierrc.json` (largura 120, `proseWrap: always`).
- <Linguagem, versão e framework.>
- <Política do projeto escrita como skill, ex.: "código que toca X segue a skill `<nome>`".>
- Aprovação é sempre humana. Não mude `Status` de product, intent ou spec para `approved`; o `plan.md` só é gravado como
  `approved` depois que o engenheiro aprova na conversa. Não faça merge de PR.

## Arquitetura

- `<pasta>/`: <responsabilidade>

## Arquitetura do processo

- Hooks em `.claude/settings.json` (precisam de `jq`) bloqueiam com exit 2; a mensagem de stderr diz o motivo:
  - `protect-paths.sh`: `src/gen/`, `vendor/`, `.github/workflows/` e vision/intent/spec já aprovados em `docs/`.
  - `protect-tests.sh`: qualquer arquivo de teste enquanto existir `.claude/.tests-locked` (`/sdlc-bugfix`).
  - `block-secrets.sh`: conteúdo com formato de credencial.
  - `production-gate.sh`: comandos de deploy em produção sem `RELEASE_APPROVAL` (ajuste os padrões ao projeto).
- `.claude/agents/verifier.md` confere o trabalho com contexto limpo ao fim do `/sdlc-build` e não corrige nada.
- `.claude/skills/sdlc-review/policy.md` define como revisar; cada rodada de review de um item fica em
  `docs/changes/<NNN-slug>/review.md`.
- `.claude/evals/` testa o comportamento do agente, não o produto. Todo incidente vira um eval.
- `.claude/skills/sdlc-incident/bands.yaml` define as faixas de métrica que disparam `/sdlc-incident`.
- O fluxo é feito de skills: `sdlc` orquestra e `sdlc-<etapa>` executa cada etapa, com o template em `assets/`.
  `.claude/skills/sdlc/scripts/status.sh` calcula o estado de cada item; `references/kit.md` tem instalação, métricas e
  fidelidade ao playbook.

## Coisas que o Claude erra

Nenhuma registrada ainda. Quando um achado de review se repetir pela segunda vez, ele entra aqui.

## Fluxo SDLC deste repositório

- `docs/product/vision.md` descreve o produto e vale para todo item; tem portão de aprovação, mas fica fora do ciclo.
  Uma feature só gera spec com ele aprovado.
- Uma pasta por trabalho em `docs/changes/<NNN-slug>/` (slug em inglês). Feature: `intent.md` → `spec.md` → `plan.md`.
  POC (`Tipo: poc`): `intent.md` → `plan.md` → `findings.md`, código descartável. Bug (`Tipo: bug`, `/sdlc-bugfix`):
  `intent.md` → `plan.md` test-first. Feature e bug terminam com `review.md` (uma rodada por review). Material de apoio
  do item em `attachments/`. Templates ficam nas skills (`.claude/skills/sdlc*/assets/`).
- Ideia, problema ou bug que surgir no meio de qualquer trabalho ou pesquisa vira um arquivo em `docs/backlog/`
  (`/sdlc anotar`); não amplie o item em andamento. Ao virar trabalho, a entrada vai para a pasta do item como
  `origin.md`.
- Não escreva código de produção sem um `plan.md` com `Status: approved` para a tarefa.
- Entrada: `/sdlc` (status, seguir, novo, anotar, detalhe, voltar, concluir). Produto: `/sdlc-product`. Etapas:
  `/sdlc-intent`, `/sdlc-spec`, `/sdlc-plan`, `/sdlc-build`, `/sdlc-bugfix`, `/sdlc-review`, `/sdlc-incident`.
- Commit é a assinatura de aprovação de cada artefato; a implementação acontece em branches `sdlc/<NNN>-<slug>`. Um item
  está concluído quando o `plan.md` tem `Status: done`, gravado só depois que o humano confirma a entrega.
- Se um hook bloquear uma edição, não contorne pelo Bash (`sed`, `echo >`, `cp`): diga ao humano o que ele precisa
  mudar.

## Verificando seu trabalho

- Build: `<comando>` (deve terminar sem erro)
- Teste: `<comando>` (tudo verde; nunca pule nem apague teste falhando)
- Lint: `<comando>` (zero warnings)

Rode os três antes de dizer que a tarefa terminou e cole a saída. Se um teste falhar, corrija o código, não o teste.
