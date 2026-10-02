#!/bin/bash
# Etapa 4 — durante um /sdlc-bugfix, depois que o teste que reproduz o bug foi aprovado,
# o arquivo .claude/.tests-locked existe e nenhum arquivo de teste pode ser editado.
lock="${CLAUDE_PROJECT_DIR:-.}/.claude/.tests-locked"
[ -f "$lock" ] || exit 0
path=$(jq -r '.tool_input.file_path // ""' < /dev/stdin)
case "$path" in
  */test/*|*/tests/*|*/__tests__/*|*/spec/*|*_test.*|*.test.*|*.spec.*|*/test_*|test_*)
    echo "Testes travados durante a correção (.claude/.tests-locked). Corrija o código, não o teste: $path" >&2
    exit 2 ;;
esac
exit 0
