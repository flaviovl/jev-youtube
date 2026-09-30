#!/bin/bash
# Uso: check.sh <eval.json> <result.json> <sha-base>
eval_file="$1"; result="$2"; base="${3:-HEAD}"
ok=0
n=$(jq '.checks | length' "$eval_file")
for i in $(seq 0 $((n-1))); do
  c=$(jq -c ".checks[$i]" "$eval_file")
  type=$(jq -r '.type' <<<"$c")
  case "$type" in
    command)
      run=$(jq -r '.run' <<<"$c"); want=$(jq -r '.expect_exit // 0' <<<"$c")
      bash -c "$run" >/dev/null 2>&1; got=$?
      [ "$got" -eq "$want" ] || { echo "  x command '$run' saiu $got (esperado $want)"; ok=1; } ;;
    not_modified)
      for p in $(jq -r '.paths[]' <<<"$c"); do
        if [ -n "$(git diff --name-only "$base" -- "$p"; git ls-files --others --exclude-standard -- "$p")" ]; then
          echo "  x '$p' foi modificado"; ok=1
        fi
      done ;;
    output_contains)
      t=$(jq -r '.text' <<<"$c")
      jq -r '.result // ""' "$result" | grep -qF "$t" || { echo "  x saída não contém '$t'"; ok=1; } ;;
    *) echo "  ? check desconhecido: $type"; ok=1 ;;
  esac
done
exit $ok
