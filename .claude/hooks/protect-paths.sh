#!/bin/bash
# Etapa 3 — bloqueia edição de caminhos protegidos (gerados, congelados, artefatos aprovados).
# Ajuste a lista PROTECTED para o seu repositório.
input=$(cat)
path=$(jq -r '.tool_input.file_path // ""' <<<"$input")
rel="${path#${CLAUDE_PROJECT_DIR:-$PWD}/}"

PROTECTED=("src/gen/" "vendor/" ".github/workflows/")
for p in "${PROTECTED[@]}"; do
  if [[ "$rel" == "$p"* ]]; then
    echo "Caminho protegido: $rel. Não edite arquivos em $p sem autorização explícita." >&2
    exit 2
  fi
done

# Artefatos SDLC aprovados só mudam depois de reabertos. Reabrir é pedido pelo humano na conversa, e a única edição
# permitida num artefato aprovado é a que troca "Status: approved" por "Status: draft" e não muda mais nada.
# Os caminhos docs/product e docs/changes também estão em .claude/skills/sdlc/scripts/status.sh; mude os dois juntos.
if [[ "$rel" == docs/product/vision.md || "$rel" == docs/changes/*/intent.md || "$rel" == docs/changes/*/spec.md ]] &&
  [ -f "$path" ]; then
  if grep -q 'Status: approved' "$path"; then
    old=$(jq -r '.tool_input.old_string // ""' <<<"$input")
    new=$(jq -r '.tool_input.new_string // ""' <<<"$input")
    if [[ "$old" == *"Status: approved"* && "${old//Status: approved/Status: draft}" == "$new" ]]; then
      exit 0
    fi
    echo "$rel está aprovado. Para mudar, reabra (o humano pede na conversa e só a linha de Status vira draft)." >&2
    exit 2
  fi
fi
exit 0
