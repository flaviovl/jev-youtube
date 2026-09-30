#!/bin/bash
# Etapa 3 — bloqueia edição de caminhos protegidos (gerados, congelados, artefatos aprovados).
# Ajuste a lista PROTECTED para o seu repositório.
path=$(jq -r '.tool_input.file_path // ""' < /dev/stdin)
rel="${path#${CLAUDE_PROJECT_DIR:-$PWD}/}"

PROTECTED=("src/gen/" "vendor/" ".github/workflows/")
for p in "${PROTECTED[@]}"; do
  if [[ "$rel" == "$p"* ]]; then
    echo "Caminho protegido: $rel. Não edite arquivos em $p sem autorização explícita." >&2
    exit 2
  fi
done

# Artefatos SDLC aprovados só mudam com aprovação humana (edite você mesmo ou reabra como draft).
# Os caminhos docs/product e docs/changes também estão em .claude/skills/sdlc/scripts/status.sh; mude os dois juntos.
if [[ "$rel" == docs/product/vision.md || "$rel" == docs/changes/*/intent.md || "$rel" == docs/changes/*/spec.md ]] &&
  [ -f "$path" ]; then
  if grep -q 'Status: approved' "$path"; then
    echo "$rel está aprovado. Para mudar, o humano deve voltar o Status para draft primeiro." >&2
    exit 2
  fi
fi
exit 0
