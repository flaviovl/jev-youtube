# Portão de aprovação

Vale para `vision.md`, `intent.md`, `spec.md`, `plan.md` e para o teste que reproduz um bug. O humano aprova na
conversa; o Claude grava. O Claude nunca aprova o próprio trabalho sem essa resposta.

## Ao terminar o artefato

1. Mostre um resumo curto: o que o artefato decide e o que ficou em aberto.
2. Pergunte com a ferramenta AskUserQuestion, numa chamada só:
   - "Aprovar `<artefato>`?", com as opções "Aprovar e seguir para `<próxima etapa>`" (primeira; na descrição, o que a
     próxima etapa faz), "Aprovar e parar" e "Quero alterar".
   - Só para `docs/product/vision.md`, que é versionado: "Commit?", com as opções "Commitar agora" (na descrição, a
     mensagem proposta) e "Sem commit". Intent, spec, plan, findings e review ficam em `docs/changes/`, fora do git, e
     não têm pergunta de commit.
3. Fora da ferramenta, qualquer afirmação para seguir ("ok", "aprovado", "pode seguir", "continua") vale como "Aprovar e
   seguir", sem commit se nada foi dito sobre ele. Um pedido de mudança vale como "Quero alterar": aplique e pergunte de
   novo.

## Com a aprovação

- Grave `Status: approved` no artefato e, na seção "Decisão" (no `plan.md`, nos campos do cabeçalho), `approved por
  <nome> na conversa em AAAA-MM-DD`. O nome é o do git (`git config user.name`) ou o que a pessoa usou na conversa.
- "Commitar agora": commit local, só com o artefato, mensagem de uma linha no padrão do repositório. Nunca faça push,
  merge ou mudança para a `main` por conta própria; no máximo sugira numa linha.
- "Aprovar e seguir": diga numa linha qual é a próxima etapa e invoque a skill dela com o número do item.
- "Aprovar e parar": diga a próxima etapa e pare.

## Rejeitar

`Status: rejected` e o motivo em "Decisão".

## Reabrir

Só quando o humano pedir na conversa ("reabre o spec", "mudou o escopo"):

1. Troque `Status: approved` por `Status: draft` numa edição que muda só essa linha. Em artefato aprovado, o hook
   `protect-paths.sh` permite só essa troca.
2. Registre em "Decisão" (no `plan.md`, em "Desvios"): `Reaberto em AAAA-MM-DD: <motivo>`.
3. Reabrir uma fase devolve as seguintes para rascunho: faça o mesmo em cada uma delas. Se o build já começou (passos
   `[x]`), avise que o código será revisto contra o plano novo.
