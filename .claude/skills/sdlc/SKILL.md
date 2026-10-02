---
name: sdlc
description: >-
  Orquestra o fluxo SDLC deste repositório (produto → backlog → mudanças: feature, POC ou bug, de intent a concluído) a
  partir de docs/product/, docs/backlog/ e docs/changes/. Use sempre que o usuário quiser começar um projeto, uma
  funcionalidade ou a correção de um bug, anotar uma ideia, um problema ou um bug que surgiu no meio de outro trabalho,
  perguntar status, andamento ou onde parou, saber a próxima fase, seguir ou continuar um item, adicionar ou mudar um
  detalhe no produto, num intent, spec ou plano, voltar a uma fase anterior, reabrir algo aprovado ou marcar um item
  como concluído, mesmo sem citar "sdlc" nem o número do item. Neste repositório, prefira esta skill a fluxos genéricos
  de funcionalidade.
argument-hint: "[status | seguir | novo | anotar | detalhe | voltar | concluir] [NNN] [texto]"
allowed-tools:
  - Bash(${CLAUDE_SKILL_DIR}/scripts/status.sh)
  - Bash(${CLAUDE_SKILL_DIR}/scripts/status.sh *)
  - Bash(.claude/skills/sdlc/scripts/status.sh)
  - Bash(.claude/skills/sdlc/scripts/status.sh *)
---

# SDLC: orquestrador

Estado atual, calculado agora a partir dos artefatos:

!`${CLAUDE_SKILL_DIR}/scripts/status.sh`

Pedido: $ARGUMENTS

Esta skill não executa etapas. Ela responde sobre o ciclo a partir do estado acima e, quando a próxima ação é do Claude,
invoca a skill da etapa. As etapas também podem ser chamadas direto (`/sdlc-spec 001`) e conferem o estado sozinhas pelo
mesmo script. Para o detalhe de um item (tipo, estado, origem, findings, attachments), rode `${CLAUDE_SKILL_DIR}/scripts/status.sh <NNN>`.

## O ciclo

```
projeto novo ─▶ docs/product/vision.md (sdlc-product) ─▶ aprovado
ideia, problema ou bug a qualquer momento ─▶ docs/backlog/<slug>.md (operação anotar)
    └─ escolhido ─▶ docs/changes/NNN-slug/ (a entrada vira origin.md)
        feature: intent ─▶ spec ─▶ plan ─▶ build (passos [x]) ─▶ review + main ─▶ plan Status: done
        poc:     intent ─▶ plan ─▶ build ─▶ findings.md ─▶ respostas no vision.md ─▶ plan Status: done
        bug:     intent ─▶ plan test-first ─▶ correção (sdlc-bugfix) ─▶ review + main ─▶ plan Status: done
alerta ou incidente ─▶ intent novo (sdlc-incident)
```

- `docs/product/vision.md`: visão, princípios, restrições e fora do escopo que valem para todo item. Tem portão de
  aprovação (`Status`), mas não é um item. Uma `feature` só gera spec com ele aprovado; `poc` e `bug` não
  esperam por ele.
- `docs/backlog/`: um arquivo por ideia, problema ou bug que ainda não virou trabalho. Sem aprovação. Quando vira item,
  o arquivo é movido para a pasta do item como `origin.md`; quando é descartado, é apagado e o motivo é dito na conversa.
- `docs/changes/` e `docs/backlog/` são o histórico local do trabalho e ficam fora do git
  (`${CLAUDE_SKILL_DIR}/references/git.md`). O que precisar durar no repositório vira um documento próprio.
- `docs/changes/NNN-slug/`: uma pasta por item, com `origin.md` (se veio do backlog), `intent.md`, `spec.md` (só
  feature), `plan.md`, `findings.md` (só poc), `review.md` (feature e bug, uma rodada por review) e `attachments/`.

| Etapa           | Skill           | Artefato                                              | Quem aprova                                                |
| --------------- | --------------- | ----------------------------------------------------- | ---------------------------------------------------------- |
| Produto         | `sdlc-product`  | `docs/product/vision.md`                              | você na conversa; o Claude grava `approved`                |
| 1 Plan          | `sdlc-intent`   | `intent.md` (`Tipo: feature` ou `poc`)                | você na conversa; o Claude grava `approved`                |
| 2 Design        | `sdlc-spec`     | `spec.md` (só feature)                                | você (se o risco for alto, também o dono da política)      |
| 3 Build (plano) | `sdlc-plan`     | `plan.md`                                             | você na conversa; o Claude grava `approved`                |
| 3–4 Build/Test  | `sdlc-build`    | código, passos `[x]`, verifier; `findings.md` na poc  | CI e você                                                  |
| Bug             | `sdlc-bugfix`   | `intent.md` (`Tipo: bug`), `plan.md`, teste e código  | você: intent e plano, depois a entrega na `main`           |
| 5 Deploy        | `sdlc-review`   | `review.md` na pasta do item; comentários no PR no CI | você aprova; a `develop` vai para a `main` com o seu sim   |
| 6 Maintain      | `sdlc-incident` | novo `intent.md` e linha em `docs/lessons.md`         | você faz a triagem: corrigir agora, agendar ou descartar   |

Neste repositório uma pessoa ocupa todos os papéis (originador, product owner, engenheiro, tech lead, code owner), e
"você" é essa pessoa. Os portões continuam valendo: a sua resposta na conversa é a assinatura, e o Claude grava o
`Status` e a "Decisão". Como perguntar, gravar, commitar e reabrir está em
`${CLAUDE_SKILL_DIR}/references/portao.md`. Commit é opcional e só com o seu sim; push e entrega na `main`, o Claude
no máximo sugere. Todo trabalho fica na `develop`, sem branch por item (`${CLAUDE_SKILL_DIR}/references/git.md`).

## Operações

Descubra a operação pelo pedido, com ou sem palavra-chave. Sem número de item: se só um item está em andamento (nem
concluído nem encerrado), use esse; se houver mais de um, pergunte qual. Sem pedido nenhum, faça `status`.

**Produto primeiro.** Se o cabeçalho diz que o produto não existe e o pedido cria trabalho (`novo`, `seguir`), proponha
escrever o `docs/product/vision.md` antes e, com o ok, invoque `sdlc-product`. `status` e `anotar` funcionam sem ele.

### status

"Onde parei?", "como está o 001?", "o que falta?". Só leitura: não altere arquivos. Diga a situação do produto quando
ele não estiver aprovado e quantas entradas há no backlog. Para cada item pedido, diga o tipo, a fase, se está concluído
e a próxima ação com quem a faz. Ao retomar um item, rode `${CLAUDE_SKILL_DIR}/scripts/status.sh <NNN>` e leia o
artefato da fase atual (e "Desvios" do plan, se o build começou) para dizer em uma ou duas linhas o que falta de fato,
não só o Status. A aprovação vale pelo `Status` no arquivo.

### seguir

"Qual a próxima fase?", "continua o 001", "pode seguir".

- Próxima ação é aprovar um artefato em rascunho: leia o artefato e siga o portão
  (`${CLAUDE_SKILL_DIR}/references/portao.md`), perguntando se aprova e segue, aprova e para, ou quer alterar.
- Outra ação sua (entregar na `main`, testar algo, decidir uma pergunta em aberto): diga exatamente o que fazer e pare.
- Próxima ação do Claude: diga numa linha qual etapa vem e invoque a skill que a tabela do estado indica (a coluna
  "Próxima ação"), com a ferramenta Skill e o número do item como argumento (por exemplo, skill `sdlc-spec` com
  argumento `001`). Para `sdlc-plan`, lembre que o ideal é estar em plan mode (Shift+Tab).

### novo

"Quero começar um projeto", "vamos fazer a funcionalidade X", "quero uma POC de Y", "corrige o bug Z". Com o produto
existindo, invoque `sdlc-intent` (feature ou POC) ou `sdlc-bugfix` (bug), passando a descrição ou o nome da entrada do
backlog. Se o pedido é algo para depois, e não trabalho para agora, é `anotar`; na dúvida, pergunte: "anoto no backlog
ou começo agora?".

### anotar

"Tive uma ideia", "anota isso para depois", "achei um bug", ou algo que surge no meio de outro trabalho. Crie
`docs/backlog/<slug-em-ingles>.md` a partir de `${CLAUDE_SKILL_DIR}/assets/backlog-entry.md`: título, `Tipo` (ideia,
problema ou bug), data, origem (item em andamento, conversa ou pesquisa) e poucas linhas de descrição; para bug, o que
acontece, como reproduzir e o que era esperado. Não abra item, não mude o item em andamento e volte ao que estava sendo
feito. Se a anotação muda um princípio, uma restrição ou o escopo do produto, ela não é backlog: é `detalhe` no
`docs/product/vision.md`.

### detalhe

"Adiciona no plano que...", "o spec precisa prever...". Primeiro decida o alvo: se o detalhe vale para o produto todo
(princípio, restrição, fora do escopo, público, métrica), o alvo é o `docs/product/vision.md`, não o item (para uma
revisão ampla, invoque `sdlc-product`); depois confira se algum item em andamento contradiz a mudança e aponte qual. Se
é uma funcionalidade nova, e não um ajuste do item, é `anotar`. Então escolha o caminho pelo status do artefato-alvo:

1. Artefato em rascunho: edite na seção certa do template. Antes, confira se o detalhe contradiz a fase anterior
   (produto; Restrições e Fora do escopo do intent; requisitos do spec). Se contradiz, não edite: mostre o conflito com
   as linhas citadas e pergunte qual lado vale.
2. Produto, intent ou spec aprovado: não edite. Mudar escopo aprovado exige nova aprovação, e o hook `protect-paths.sh`
   bloqueia a edição. Ofereça reabrir a fase (operação `voltar`), abrir um item novo ou anotar no backlog, com a sua
   recomendação.
3. Plan aprovado:
   - detalhe de implementação que cabe no spec: registre em "Desvios durante a implementação" (data, o quê, motivo) e,
     se for trabalho novo, acrescente um passo `- [ ]` na Ordem do trabalho;
   - detalhe que muda requisito ou critério de aceitação do spec: é `voltar` ao spec.

### voltar

"Preciso rever o spec", "mudou o escopo", "reabre o intent". O seu pedido na conversa basta. Siga "Reabrir" em `${CLAUDE_SKILL_DIR}/references/portao.md`: a fase pedida e as
seguintes voltam para `Status: draft`, com `Reaberto em AAAA-MM-DD: <motivo>` em cada uma. Próximo passo: a skill da
fase reaberta.

### concluir

"Foi pro ar", "mergeou", "pode fechar o 001". Só com a sua confirmação de que a entrega aconteceu: a `develop` com o
item chegou à `main` numa feature ou num bug; numa poc, `findings.md` escrito e as respostas levadas ao `docs/product/vision.md`. Se o estado não
for "Em review", "Revisado" nem "POC terminada", diga o que falta e pergunte se quer concluir mesmo assim. Troque
`Status: approved` por `Status: done` no `plan.md`.

## Referência

Para instalar o kit em outro repositório, métricas de cada etapa, automação no CI, template de skill de política
(`assets/policy.md`) e fidelidade ao playbook da Anthropic, leia `references/kit.md`.
