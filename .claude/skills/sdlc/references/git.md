# Fluxo git

Sem branch por item. Todo trabalho acontece na `develop`; a `main` só recebe a `develop` depois do review, sempre por
fast-forward.

## Branches

- `develop`: código e documentação durável de todos os itens. Se não existir, crie a partir da `main`
  (`git switch -c develop main`).
- `main`: o que foi revisado e entregue. Nunca recebe commit direto, merge commit nem push forçado.

## O que vai para o git

- Código, testes, configuração e documentação durável do projeto (`README`, `docs/product/`, `docs/<tema>.md`).
- Nunca `docs/changes/` nem `docs/backlog/`: são o histórico local do que foi e está sendo feito (intent, spec, plan,
  findings, review, attachments) e ficam no `.gitignore`. O que desse histórico precisar durar no repositório vira um
  documento próprio, escrito para quem vai ler o código, e não uma cópia do artefato.

## Commits

Locais, na `develop`, só com o sim do humano: no portão do `vision.md` (`portao.md`) e, no build, com a resposta dada
uma vez por item. Só os arquivos do passo, com caminhos explícitos (nunca `git add -A`).

## Levar a develop para a main (entregar)

Só com o sim do humano, depois do review:

1. Se a `main` tem commits que a `develop` não tem, rebase da `develop` sobre ela: `git switch develop && git rebase
   main`. Rode de novo os testes e o lint.
2. Fast-forward da `main`: `git switch main && git merge --ff-only develop`. Se a troca de branch for barrada por
   arquivo local modificado, `git branch -f main develop` faz o mesmo, desde que `git merge-base --is-ancestor main
   develop` seja verdadeiro.
3. Volte para a `develop`.
4. Push só com o sim: `git push origin main develop`. Se o passo 1 reescreveu commits da `develop` que já estavam no
   remoto, a `develop` precisa de `git push --force-with-lease origin develop`; diga isso antes.

## POC

O código da POC é descartável e fica fora do git, numa pasta ignorada (por exemplo `_poc/`, com `_*` no `.gitignore`).
A pasta do item (`plan.md`, `findings.md`, `attachments/`) fica local, como toda `docs/changes/`.

## PR

Opcional. Quem quiser o review do CI (`.github/workflows/claude-review.yml`) abre um PR `develop` → `main` e, depois do
review, entrega pelo fast-forward acima, sem merge commit.
