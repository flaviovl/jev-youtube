# ai-native-sdlc-kit

Kit para o [Claude Code](https://code.claude.com/docs) que transforma o **AI-native SDLC playbook** da Anthropic num
fluxo de trabalho feito de skills. Cada etapa grava um artefato versionado no git, que a etapa seguinte lê. Um humano
aprova cada artefato mudando o `Status` e fazendo commit. O Claude nunca aprova o próprio trabalho.

Você conversa em linguagem natural ("onde parei?", "tive uma ideia", "pode seguir com o 001") ou usa `/sdlc`. A skill
orquestradora lê os artefatos, calcula em que ponto cada trabalho está e executa a próxima etapa, ou diz qual ação é
sua.

## De onde vem

A base é o [AI-native SDLC playbook](https://claude.com/blog/the-ai-native-sdlc-playbook), da Anthropic, e o
[curso na Claude Academy](https://academy.claude.com/courses/ai-native-sdlc-playbook). A parte de segurança segue
[How Anthropic secures its AI-native SDLC](https://claude.com/blog/how-anthropic-secures-its-ai-native-software-development-lifecycle).
O kit foi bastante modificado, mas mantém os princípios.

**Mantido do playbook**

- Seis etapas (Plan, Design, Build, Test, Deploy, Maintain), cada uma terminando num artefato versionado: intent, spec,
  plan, diff e achados de review formam a trilha de auditoria.
- Aprovação humana em cada portão; quem escreveu o código não aprova.
- Revisão de design antes do código: o plano é discutido em plan mode e só depois vira `plan.md`.
- Ciclo de feedback com meta verificável e um verificador com contexto limpo no fim do build.
- Correção de bug test-first, com os testes travados enquanto o código é corrigido.
- Políticas da organização escritas como skills; regras que não podem falhar aplicadas por hooks.
- Evals do comportamento do agente rodando no CI; todo incidente vira um eval.
- Faixas de controle por métrica, e alerta ou incidente virando um novo intent.

**Diferente do playbook**

- Um documento de produto (`docs/product/vision.md`) acima dos itens. O playbook trata só de mudanças num código que já
  existe e não cobre projeto novo.
- Um backlog (`docs/backlog/`) para ideias, problemas e bugs que surgem no meio do trabalho, sem inchar o item em
  andamento.
- Três tipos de item: `feature` (o ciclo completo), `poc` (sem spec; termina num `findings.md` com respostas medidas) e
  `bug` (intent e plano test-first, sem spec).
- Uma pasta por trabalho em `docs/changes/NNN-slug/`, com a origem, os artefatos, os findings e cada rodada de review.
- Um script determinístico (`status.sh`) que calcula o estado de todos os itens a partir dos artefatos, usado pelo
  orquestrador e por todas as skills.
- Adaptação para quem ocupa todos os papéis sozinho: os portões continuam, e o commit é a assinatura.

A comparação elemento a elemento está em `.claude/skills/sdlc/references/kit.md`, seção "Fidelidade ao playbook".

## Como funciona

```
projeto novo ─▶ docs/product/vision.md (sdlc-product) ─▶ aprovado
ideia, problema ou bug a qualquer momento ─▶ docs/backlog/<slug>.md (/sdlc anotar)
    └─ escolhido ─▶ docs/changes/NNN-slug/ (a entrada vira origin.md)
        feature: intent ─▶ spec ─▶ plan ─▶ build (passos [x]) ─▶ review + merge ─▶ plan Status: done
        poc:     intent ─▶ plan ─▶ build ─▶ findings.md ─▶ respostas no vision.md ─▶ plan Status: done
        bug:     intent ─▶ plan test-first ─▶ correção (sdlc-bugfix) ─▶ review + merge ─▶ plan Status: done
alerta ou incidente ─▶ intent novo (sdlc-incident)
```

O estado de cada item sai só dos artefatos: a linha `Status:` de cada arquivo, o `Tipo:` do intent, as caixas marcadas
na "Ordem do trabalho" do plano e a existência de `findings.md` e `review.md`. Não há arquivo de estado separado para
ficar desatualizado. Exemplo de saída do `status.sh`:

```
Trabalho: docs/changes · produto (docs/product/vision.md): approved · backlog (docs/backlog): 1 aberto(s) · próximo número: 004 · git: branch main

| Item | Intent | Spec | Plan | Build | Estado | Próxima ação | Quem |
|---|---|---|---|---|---|---|---|
| 001-feasibility (poc) | approved | - | done | 5/5 | Concluído | nenhuma | - |
| 002-voice-commands | approved | approved | approved | 2/4 | Build 2/4 | /sdlc-build 002 (continua do passo 3) | Claude |
| 003-double-scroll (bug) | draft | - | - | - | Intent em rascunho | revisar intent.md, preencher Decisão, mudar para Status: approved e commitar | você |
```

## Como usar

1. Crie um repositório a partir deste template (botão "Use this template") ou copie `.claude/`, `.github/`,
   `.prettierrc.json` e `.gitignore` para um repositório que já existe.
2. Copie `.claude/skills/sdlc/assets/CLAUDE.md` para a raiz como `CLAUDE.md` e troque os marcadores `<…>`. Se o projeto
   já tiver um `CLAUDE.md`, junte a ele as seções "Arquitetura do processo", "Fluxo SDLC" e "Verificando seu trabalho",
   e a regra de aprovação humana das "Convenções".
3. Instale o `jq` (os hooks dependem dele).
4. Troque os exemplos do projeto de origem pelos seus: `.claude/skills/sdlc-incident/bands.yaml`,
   `.claude/skills/sdlc-review/policy.md`, `.claude/hooks/production-gate.sh` e `.claude/evals/exemplo-*.json`.
5. Escreva as políticas do projeto como skills, a partir de `.claude/skills/sdlc/assets/policy.md`.
6. No GitHub: secret `ANTHROPIC_API_KEY`, branch protection em `main` exigindo aprovação de code owner e um
   `CODEOWNERS`.
7. Abra o Claude Code e comece pelo produto: `/sdlc-product`.

### Operações do orquestrador

| Você diz, ou `/sdlc …` | O que acontece                                                                                |
| ---------------------- | --------------------------------------------------------------------------------------------- |
| `status`               | Onde cada item está, se terminou e qual a próxima ação, com quem a faz. Não altera nada.      |
| `seguir [NNN]`         | Se a próxima ação é do Claude, invoca a skill da etapa; se é sua, diz exatamente o que fazer. |
| `novo <texto>`         | Começa uma feature, uma POC ou um bug. Sem produto, propõe escrever o `vision.md` primeiro.   |
| `anotar <texto>`       | Grava uma ideia, um problema ou um bug em `docs/backlog/` e volta ao que estava sendo feito.  |
| `detalhe <texto>`      | Ajusta o artefato certo conforme o status dele; em algo aprovado, propõe reabrir.             |
| `voltar NNN <fase>`    | Reabre uma fase: você volta o `Status` para draft, e as fases seguintes voltam junto.         |
| `concluir NNN`         | Marca `Status: done` no plano, depois que você confirma a entrega.                            |

As etapas também podem ser chamadas direto: `/sdlc-product`, `/sdlc-intent`, `/sdlc-spec`, `/sdlc-plan`, `/sdlc-build`,
`/sdlc-bugfix`, `/sdlc-review`, `/sdlc-incident`. Cada uma confere o estado do item antes de agir e para se a etapa
anterior não foi aprovada.

## O que tem dentro

```
.claude/
  settings.json                  liga os hooks
  hooks/                         portões determinísticos (tabela abaixo)
  agents/verifier.md             verifica o build com contexto limpo, sem corrigir nada
  evals/                         evals do comportamento do agente (run.sh, check.sh, exemplos)
  skills/
    sdlc/                        orquestrador
      scripts/status.sh          estado de todos os itens; único lugar que conhece os caminhos
      references/kit.md          instalação, automação no CI, métricas por etapa, fidelidade ao playbook
      assets/                    templates de CLAUDE.md, entrada de backlog e skill de política
    sdlc-product/                docs/product/vision.md
    sdlc-intent/                 intent de feature ou POC
    sdlc-spec/                   requisitos e design (só feature)
    sdlc-plan/                   plano com checklist, riscos e provas
    sdlc-build/                  implementação com ciclo de feedback; findings da POC
    sdlc-bugfix/                 bug como item: intent, plano test-first, correção
    sdlc-review/                 review em três passes; policy.md é a política de review
    sdlc-incident/               diagnóstico de alerta ou incidente; bands.yaml são as faixas
.github/
  workflows/agent-evals.yml      evals quando .claude/** ou CLAUDE.md mudam, e uma vez por dia
  workflows/claude-review.yml    review de todo PR com a skill sdlc-review; @claude pede correção
  PULL_REQUEST_TEMPLATE.md       PR ligado à pasta do item
docs/
  lessons.md                     lições de incidentes
  product/ backlog/ changes/     criados pelo fluxo
```

### Portões

| Hook                 | Bloqueia                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------- |
| `protect-paths.sh`   | edição de `vision.md`, intent e spec aprovados; `src/gen/`, `vendor/`, `.github/workflows/` |
| `protect-tests.sh`   | edição de arquivos de teste enquanto existir `.claude/.tests-locked` (correção de bug)      |
| `block-secrets.sh`   | conteúdo com formato de credencial                                                          |
| `production-gate.sh` | deploy em produção sem `RELEASE_APPROVAL`                                                   |

Os hooks só interceptam as ferramentas de edição e o Bash do Claude. O `CLAUDE.md` do template proíbe contorná-los por
outro caminho.

## Requisitos

- Claude Code com suporte a skills (testado na 2.1.285), bash e `jq`.
- git; o commit é a assinatura de cada aprovação.
- `gh`, para o review de PR pelo terminal.
- No CI, `ANTHROPIC_API_KEY`. Node só é necessário quando o projeto tiver `package.json`.

## Limitações conhecidas

- Os evals de exemplo vieram do projeto de origem e presumem `npm test` e `npm run lint`. Por isso o workflow de evals é
  pulado enquanto não existir `package.json`, e até lá uma mudança nas skills não é avaliada pelo CI.
- Não está verificado se o `claude-code-action` carrega uma skill do projeto citada no prompt. Por isso o prompt do
  review aponta também os caminhos da skill e da política.
- O fluxo foi testado com `claude -p` em cenários isolados: status e retomada, bloqueio de etapa sem aprovação, conflito
  de escopo, geração de spec, reabertura, ideia no meio do trabalho, produto em draft e POC. A injeção de estado em plan
  mode e a execução completa de um bug ainda não foram testadas.

## Licença

MIT. Veja `LICENSE`.
