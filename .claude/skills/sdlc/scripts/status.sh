#!/bin/bash
# Estado do trabalho SDLC, derivado só dos artefatos (linhas "Status:" e "Tipo:", checklist do plan.md, findings.md,
# vision.md do produto, arquivos do backlog) e do git. Único lugar que sabe onde ficam os itens e como o estado é
# calculado: as skills sdlc-* e o verifier consultam este script. Sai sempre com 0 porque a injeção `!` das skills
# aborta a invocação inteira em qualquer erro.
#   status.sh          cabeçalho (pastas, produto, backlog, próximo número, git) + tabela de todos os itens
#   status.sh <item>   detalhe de um item: número (1 ou 001) ou parte do slug
# Os caminhos abaixo também estão em .claude/hooks/protect-paths.sh; mude os dois juntos.

root="$(cd "$(dirname "$0")/../../../.." && pwd)"
changes_rel="docs/changes"
backlog_rel="docs/backlog"
product_rel="docs/product/vision.md"
dir="$root/$changes_rel"

status_of() { # arquivo -> valor da primeira linha "Status:", "-" se o arquivo não existe
  [ -f "$1" ] || { echo "-"; return; }
  local s
  s=$(grep -m1 -oE 'Status:(\*\*)? *[A-Za-z]+' "$1" | sed -E 's/.*[ *:]//')
  echo "${s:-?}"
}

tipo_of() { # intent.md -> feature | poc | bug
  local t
  [ -f "$1" ] && t=$(grep -m1 -oE 'Tipo:(\*\*)? *[A-Za-z]+' "$1" | sed -E 's/.*[ *:]//')
  echo "${t:-feature}"
}

steps() { # plan.md -> "feitos total" das caixas de marcar da seção "Ordem do trabalho"
  [ -f "$1" ] || { echo "0 0"; return; }
  awk '/^## /{sec=($0 ~ /^## Ordem do trabalho/)}
       sec && /^[[:space:]]*[-*] \[[ xX]\]/{t++; if ($0 ~ /\[[xX]\]/) d++}
       END{print d+0, t+0}' "$1"
}

estado() { # pasta número -> "estado|próxima ação|quem"
  local d="$1" n="$2" i s p tipo prod feitos total planner builder
  i=$(status_of "$d/intent.md"); s=$(status_of "$d/spec.md"); p=$(status_of "$d/plan.md")
  tipo=$(tipo_of "$d/intent.md")
  planner="/sdlc-plan $n (em plan mode)"; builder="/sdlc-build $n"
  [ "$tipo" = "bug" ] && { planner="/sdlc-bugfix $n"; builder="/sdlc-bugfix $n"; }
  if [ "$i" = "-" ]; then echo "Sem intent|/sdlc-intent|Claude"; return; fi
  case "$i" in
    rejected) echo "Encerrado (intent rejeitado)|nenhuma|-"; return ;;
    approved) ;;
    *) echo "Intent em rascunho|aprovar o intent na conversa (/sdlc seguir $n)|você"; return ;;
  esac
  # Só feature tem spec, e só gera spec com o produto aprovado. POC e bug vão direto ao plano.
  if [ "$tipo" = "feature" ]; then
    if [ "$s" = "-" ]; then
      prod=$(status_of "$root/$product_rel")
      if [ "$prod" = "-" ]; then echo "Aguardando produto|escrever $product_rel (/sdlc-product)|Claude, com você"
      elif [ "$prod" != "approved" ]; then
        echo "Aguardando produto|aprovar $product_rel na conversa (/sdlc-product)|você"
      else echo "Spec a gerar|/sdlc-spec $n|Claude"; fi
      return
    fi
    if [ "$s" != "approved" ]; then
      echo "Spec em rascunho|revisar spec.md e Áreas de preocupação e aprovar na conversa (/sdlc seguir $n)|você"; return
    fi
  fi
  if [ "$p" = "-" ]; then echo "Plan a gerar|$planner|Claude, com você"; return; fi
  case "$p" in
    done) echo "Concluído|nenhuma|-"; return ;;
    approved) ;;
    *) echo "Plan em rascunho|$planner para discutir e aprovar o plano|você"; return ;;
  esac
  read -r feitos total < <(steps "$d/plan.md")
  if [ "$total" -eq 0 ]; then
    echo "Build (plano sem checklist)|$builder|Claude"
  elif [ "$feitos" -eq 0 ]; then
    echo "Build a iniciar|$builder|Claude"
  elif [ "$feitos" -lt "$total" ]; then
    echo "Build $feitos/$total|$builder (continua do passo $((feitos + 1)))|Claude"
  elif [ "$tipo" = "poc" ] && [ ! -f "$d/findings.md" ]; then
    echo "Escrever findings|/sdlc-build $n (registrar as respostas em findings.md)|Claude"
  elif [ "$tipo" = "poc" ]; then
    echo "POC terminada|levar as respostas ao $product_rel (/sdlc detalhe) e /sdlc concluir $n|você"
  elif [ -f "$d/review.md" ]; then
    echo "Revisado|ler review.md, aprovar e levar a develop para a main; depois /sdlc concluir $n|você"
  else
    echo "Em review|/sdlc-review $n; depois, levar a develop para a main e /sdlc concluir $n|Claude revisa, você aprova a entrega"
  fi
}

git_info() {
  if ! git -C "$root" rev-parse --git-dir >/dev/null 2>&1; then
    echo "git: não é repositório (sem histórico de commits)"
  elif ! git -C "$root" rev-parse HEAD >/dev/null 2>&1; then
    echo "git: branch $(git -C "$root" symbolic-ref --short HEAD 2>/dev/null), sem commits"
  else
    echo "git: branch $(git -C "$root" branch --show-current)"
  fi
}

items() { ls -d "$dir"/[0-9][0-9][0-9]-*/ 2>/dev/null | sed 's:/$::'; }

proximo() {
  local last
  last=$(items | sed -E 's:.*/([0-9]{3})-.*:\1:' | sort -n | tail -1)
  printf '%03d' $((10#${last:-0} + 1))
}

detalhe() { # pasta
  local d="$1" base n e feitos total
  base=$(basename "$d"); n=${base%%-*}
  IFS='|' read -r e acao quem < <(estado "$d" "$n")
  read -r feitos total < <(steps "$d/plan.md")
  echo "Item: $base (tipo: $(tipo_of "$d/intent.md"))"
  echo "Pasta: $changes_rel/$base"
  echo "Intent: $(status_of "$d/intent.md") · Spec: $(status_of "$d/spec.md") · Plan: $(status_of "$d/plan.md") · Passos do build: $feitos/$total"
  echo "Estado: $e"
  echo "Próxima ação: $acao (quem: $quem)"
  if git -C "$root" rev-parse --git-dir >/dev/null 2>&1; then
    local last na_main=não pend
    last=$(git -C "$root" log -1 --format='%h %ad %s' --date=short -- "$changes_rel/$base" 2>/dev/null)
    # O item chegou à main quando o último commit da pasta dele está nela (fluxo develop → main).
    git -C "$root" merge-base --is-ancestor "${last%% *}" main 2>/dev/null && na_main=sim
    pend=$(git -C "$root" status --porcelain -- "$changes_rel/$base" 2>/dev/null | awk -v p="$changes_rel/$base/" \
      '{f=$2; if (index(f, p) == 1) f = substr(f, length(p) + 1); print (f == "" ? "pasta inteira" : f)}' | tr '\n' ' ')
    [ -n "$last" ] && echo "Na main: $na_main"
    echo "Último commit na pasta: ${last:-nenhum}"
    echo "Não commitado: ${pend:-nada}"
  fi
  [ -f "$d/origin.md" ] && echo "Origem (entrada do backlog): $changes_rel/$base/origin.md"
  [ -f "$d/findings.md" ] && echo "Findings: $changes_rel/$base/findings.md"
  [ -f "$d/review.md" ] && echo "Review: $changes_rel/$base/review.md ($(grep -c '^## Rodada' "$d/review.md") rodada(s))"
  [ -d "$d/attachments" ] && echo "Anexos (attachments/): $(ls "$d/attachments" | tr '\n' ' ')"
}

produto=$(status_of "$root/$product_rel"); [ "$produto" = "-" ] && produto="não existe"
backlog=$(ls "$root/$backlog_rel"/*.md 2>/dev/null | wc -l)
echo "Trabalho: $changes_rel · produto ($product_rel): $produto · backlog ($backlog_rel): $backlog aberto(s) ·" \
  "próximo número: $(proximo) · $(git_info)"

if [ -n "$1" ]; then
  if [[ "$1" =~ ^[0-9]+$ ]]; then
    matches=$(ls -d "$dir/$(printf '%03d' $((10#$1)))"-*/ 2>/dev/null | sed 's:/$::')
  else
    matches=$(items | grep -i -- "$1")
  fi
  count=$(printf '%s' "$matches" | grep -c .)
  if [ "$count" -eq 1 ]; then detalhe "$matches"; exit 0; fi
  if [ "$count" -eq 0 ]; then echo "Item não encontrado: $1"; else echo "Mais de um item combina com '$1':"; fi
fi

list=$(items)
if [ -z "$list" ]; then
  if [ "$produto" = "não existe" ]; then echo "Nenhum item em $changes_rel. Comece pelo produto: /sdlc-product."
  else echo "Nenhum item em $changes_rel. Comece com /sdlc-intent <problema> ou /sdlc-bugfix <bug>."; fi
  exit 0
fi
echo
echo "| Item | Intent | Spec | Plan | Build | Estado | Próxima ação | Quem |"
echo "|---|---|---|---|---|---|---|---|"
while read -r d; do
  base=$(basename "$d"); n=${base%%-*}
  IFS='|' read -r e acao quem < <(estado "$d" "$n")
  read -r feitos total < <(steps "$d/plan.md")
  b="-"; [ "$total" -gt 0 ] && b="$feitos/$total"
  tipo=$(tipo_of "$d/intent.md"); [ "$tipo" != "feature" ] && base="$base ($tipo)"
  echo "| $base | $(status_of "$d/intent.md") | $(status_of "$d/spec.md") | $(status_of "$d/plan.md") | $b | $e | $acao | $quem |"
done <<<"$list"
exit 0
