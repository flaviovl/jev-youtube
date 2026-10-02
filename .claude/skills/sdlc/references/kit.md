# Kit SDLC AI-native: instalação, métricas e fidelidade

Conteúdo de consulta que não precisa estar no contexto a cada uso: instalar o kit em outro repositório, medir cada
etapa, automatizar no CI e saber o que vem do playbook da Anthropic e o que é adaptação deste kit.

> "Every stage commits an artifact the next stage can read. Together, the intent, the spec, the plan, the diff and the
> review findings are the audit trail." (Anthropic)

## Sumário

1. Mapa do kit
2. Instalação em outro repositório
3. Automação no CI
4. Métricas por etapa
5. Dev solo ou time pequeno
6. Papéis por etapa em time
7. Fidelidade ao playbook
8. Fontes

## 1. Mapa do kit

```
CLAUDE.md                          contexto do projeto; seção "Fluxo SDLC" com as regras que valem em toda etapa
docs/product/vision.md             documento de produto: visão, princípios e restrições de todo item (fora do ciclo)
docs/backlog/<slug>.md             ideias, problemas e bugs que ainda não viraram trabalho (sem aprovação)
docs/changes/<NNN-slug>/           um trabalho: origin.md, intent.md, spec.md (feature), plan.md, findings.md (poc),
                                   review.md (feature e bug), attachments/
docs/lessons.md                    lições de incidentes (Etapa 6)
.claude/skills/sdlc/               orquestrador; scripts/status.sh calcula o estado de todos os itens
.claude/skills/sdlc-product/       documento de produto; template em assets/
.claude/skills/sdlc-<etapa>/       uma skill por etapa; templates em assets/
.claude/skills/sdlc-review/policy.md  política de review (Etapa 5), lida pela skill local e no CI
.claude/skills/<política>/         políticas como skills (exemplo: seguranca-acoes-voz)
.claude/agents/verifier.md         subagente que verifica com contexto limpo (Etapa 4)
.claude/hooks/*.sh + settings.json portões determinísticos (Etapas 3 a 5)
.claude/evals/                     suíte de evals do agente (Etapa 4); o CI roda quando .claude/** muda
.claude/skills/sdlc-incident/bands.yaml  faixas de controle (Etapa 6), lidas só pela sdlc-incident
.github/workflows/                 review automático e evals no CI
.github/PULL_REQUEST_TEMPLATE.md   PR opcional (develop → main), ligado a intent, spec e plan
```

Os caminhos `docs/changes`, `docs/backlog` e `docs/product/vision.md` estão definidos em dois lugares:
`scripts/status.sh` (variáveis no topo) e `.claude/hooks/protect-paths.sh`. Para mudar, altere os dois e a seção "Fluxo
SDLC" do `CLAUDE.md`.

## 2. Instalação em outro repositório

1. Copie `.claude/`, `.github/` e `.prettierrc.json` e crie `docs/lessons.md`. Copie
   `.claude/skills/sdlc/assets/CLAUDE.md` para a raiz e troque os marcadores; se o projeto já tiver um `CLAUDE.md`,
   junte a ele as seções "Convenções" (aprovação humana), "Arquitetura do processo", "Fluxo SDLC" e "Verificando seu
   trabalho". Comece pelo produto: `/sdlc-product` cria o `docs/product/vision.md`; o `docs/backlog/` nasce na primeira
   `/sdlc anotar`.
2. Rode `/init` para completar o `CLAUDE.md` com os comandos e a arquitetura reais; mantenha-o em até uma página.
3. `chmod +x .claude/hooks/*.sh .claude/skills/sdlc/scripts/*.sh .claude/evals/*.sh`. Os hooks precisam do `jq`.
4. Escreva as políticas do projeto como skills em `.claude/skills/<nome>/SKILL.md`, a partir de
   `.claude/skills/sdlc/assets/policy.md`. Uma política por skill, com dono.
5. No GitHub: secret `ANTHROPIC_API_KEY`, branch protection em `main` exigindo aprovação de code owner e um
   `CODEOWNERS`.
6. Faça commit. `/sdlc` e as skills `/sdlc-*` aparecem no Claude Code.

## 3. Automação no CI

- Spec automático (opcional, fiel ao playbook): quando um intent é aprovado, um job não interativo roda
  `claude -p "/sdlc-spec NNN"` e abre o spec como PR.
- Incidente: quando uma faixa de `.claude/skills/sdlc-incident/bands.yaml` é rompida, o CI chama
  `claude -p "/sdlc-incident <dados>"`.
- Review: `.github/workflows/claude-review.yml` revisa todo PR com a skill `/sdlc-review`, que segue a política em
  `.claude/skills/sdlc-review/policy.md` e posta os achados no PR; `@claude` num comentário pede a correção.
- Evals: `.github/workflows/agent-evals.yml` roda `.claude/evals/run.sh` todo dia e quando mudam `CLAUDE.md` ou
  `.claude/**`. Mudar uma skill ou template do fluxo dispara os evals. Até existir `package.json`, o job é pulado,
  porque os evals de exemplo rodam `npm test` e `npm run lint`.
- Autonomia por ambiente: em dev o agente age livre, em staging é misto e em produção passa pelo portão
  (`production-gate.sh` exige `RELEASE_APPROVAL`, dada pelo release manager). O rollback deve ser o caminho mais
  ensaiado.

## 4. Métricas por etapa

| Etapa      | Métricas                                                                                                                                     |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 Plan     | tempo da primeira conversa até o intent aprovado (data em Decisão; espera-se horas); proporção de intents que chegam à 2                     |
| 2 Design   | tempo entre a aprovação do intent e a do spec; retrabalho de requisitos (reaberturas do spec após o primeiro plan)                           |
| 3 Build    | merges na primeira implementação; tempo da aprovação do plano até o merge; diff final bate com o plan                                        |
| 4 Test     | sucesso no CI na primeira tentativa; tempo de review por PR; taxa de falha de mudanças                                                       |
| 5 Deploy   | tempo até o primeiro review; comentários resolvidos sem humano na branch; defeitos pegos antes do merge contra os que escapam; métricas DORA |
| 6 Maintain | tempo do rompimento da faixa até o intent na fila; achados que viram correção; incidentes repetidos                                          |

## 5. Dev solo ou time pequeno

- Você é originador, product owner, engenheiro e tech lead. Mantenha os portões mesmo assim: a sua resposta na conversa
  é a assinatura, e o Claude grava o `Status` (`references/portao.md`). Commit é opcional; push e merge são seus.
- O fluxo segue na mesma sessão depois de cada aprovação. Se quiser contexto limpo para revisar um artefato, abra outra
  sessão; o verifier já roda com contexto limpo.
- Comece pequeno: versione intent, spec e plan de um único módulo e mantenha a aprovação humana até ter evidência de que
  mudanças de baixo risco podem ser automatizadas.
- Ordem de adoção: primeiro intent, `CLAUDE.md`, skills, ciclo de feedback, hooks e plan mode; depois subagentes, evals,
  requisitos e design, review de PR, CI/CD e fechamento do ciclo.
- Sessões paralelas: para trabalhos independentes, uma sessão por `git worktree`. Tarefas que se repetem viram
  subagentes em `.claude/agents/`.

## 6. Papéis por etapa em time

Quando cada papel é uma pessoa diferente (a skill `sdlc` assume uma pessoa só):

| Etapa      | Quem produz                           | Quem aprova                                                         | O que dispara a próxima              |
| ---------- | ------------------------------------- | ------------------------------------------------------------------- | ------------------------------------ |
| 1 Plan     | originador + Claude                   | product owner                                                       | intent `approved`                    |
| 2 Design   | Claude com as skills de política      | product owner (+ tech lead e donos de política se o risco for alto) | spec `approved`                      |
| 3 Build    | engenheiro + Claude em plan mode      | engenheiro (tech lead se o risco for alto)                          | PR aberto                            |
| 4 Test     | Claude (ciclo de feedback) + verifier | automático (CI)                                                     | evidência anexada ao PR              |
| 5 Deploy   | review do Claude + humano             | code owner; release manager para produção                           | merge; deploy com `RELEASE_APPROVAL` |
| 6 Maintain | script determinístico + Claude        | dono do serviço (triagem)                                           | novo intent volta à Etapa 1          |

## 7. Fidelidade ao playbook

| Elemento                                                                                             | Situação                                                                                                                                 |
| ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 6 etapas, artefatos, quem aprova, métricas                                                           | fiel ao playbook                                                                                                                         |
| prompts do spec e do plan                                                                            | texto original em inglês, citado nas skills                                                                                              |
| template de intent, `CLAUDE.md`, política de review, `bands.yaml`, verifier, hook de produção, evals | baseados nos exemplos publicados, traduzidos e ajustados                                                                                 |
| seções "Fora do escopo" e "Como saberemos que deu certo" do intent                                   | acréscimo do kit: o playbook só as cita no brainstorm                                                                                    |
| template de plan                                                                                     | segue o exemplo do playbook; a checklist e o `Status: done` são deste kit                                                                |
| template de spec                                                                                     | adaptação: a Anthropic só descreve o conteúdo                                                                                            |
| artefatos versionados como trilha de auditoria                                                       | adaptação: `docs/changes/` e `docs/backlog/` ficam locais, fora do git; versionados ficam código, testes e docs duráveis |
| aprovação de cada artefato                                                                           | adaptação: o humano aprova na conversa e o Claude grava o `Status` (`references/portao.md`); commit é opcional, e não a assinatura       |
| branch por item, PR e merge                                                                          | adaptação: todo trabalho na `develop`, entregue na `main` por fast-forward (`references/git.md`); PR opcional                            |
| pastas `docs/changes/`, `docs/backlog/`, `docs/product/`, skills `sdlc-*`, `status.sh`, hooks        | implementação deste kit                                                                                                                  |
| `vision.md` acima dos itens, backlog e itens `Tipo: poc` e `Tipo: bug`                               | implementação deste kit: o playbook trata só de mudanças num código existente, sem projeto novo, roadmap nem POC; bug fica fora do ciclo |
| fora do kit                                                                                          | managed settings via MDM, Code Review gerenciado, Claude Security, Claude Tag em on-call, PSR                                            |

## 8. Fontes

- [The AI-native SDLC playbook (Claude blog)](https://claude.com/blog/the-ai-native-sdlc-playbook)
- [Curso: The AI-native SDLC playbook (Claude Academy)](https://academy.claude.com/courses/ai-native-sdlc-playbook)
- [Capture as intent.md](https://academy.claude.com/courses/ai-native-sdlc-playbook/capture-intent) ·
  [Requirements and design](https://academy.claude.com/courses/ai-native-sdlc-playbook/requirements-and-design)
- [How Anthropic secures its AI-native SDLC](https://claude.com/blog/how-anthropic-secures-its-ai-native-software-development-lifecycle)
- [Skills no Claude Code](https://code.claude.com/docs/en/skills)
