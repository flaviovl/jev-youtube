#!/bin/bash
# Roda cada eval em modo não interativo (claude -p) e avalia com check.sh.
# Requer: claude (npm i -g @anthropic-ai/claude-code), jq, git, ANTHROPIC_API_KEY.
set -u
cd "$(dirname "$0")/../.."  # raiz do repositório (o script fica em .claude/evals/)
pattern="${1:-*}"
min="${EVAL_MIN_PASS_RATE:-0.9}"
total=0; passed=0

for eval in .claude/evals/${pattern}.json; do
  [ -f "$eval" ] || continue
  total=$((total+1))
  id=$(jq -r '.id' "$eval")
  git stash -u -q 2>/dev/null; base=$(git rev-parse HEAD)
  setup=$(jq -r '.setup // ""' "$eval"); [ -n "$setup" ] && bash -c "$setup"

  claude -p "$(jq -r '.prompt' "$eval")" \
    --allowedTools "Read,Edit,Write,Glob,Grep,Bash(npm test*),Bash(npm run *)" \
    --output-format json > "/tmp/eval-$id.json" 2>/dev/null

  if ./.claude/evals/check.sh "$eval" "/tmp/eval-$id.json" "$base"; then
    passed=$((passed+1)); echo "PASS $id"
  else
    echo "FAIL $id"
  fi
  git reset -q --hard "$base"; git clean -fdq; rm -f .claude/.tests-locked
  git stash pop -q 2>/dev/null
done

rate=$(awk -v p=$passed -v t=$total 'BEGIN{ if (t==0) print 0; else printf "%.2f", p/t }')
echo "Resultado: $passed/$total ($rate) — mínimo $min"
awk -v r="$rate" -v m="$min" 'BEGIN{ exit !(r>=m) }'
