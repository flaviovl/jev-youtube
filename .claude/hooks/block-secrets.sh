#!/bin/bash
# Mantém credenciais fora do diff: bloqueia escrita de conteúdo com cara de segredo.
input=$(cat)
content=$(echo "$input" | jq -r '[.tool_input.content, .tool_input.new_string, (.tool_input.edits // [] | map(.new_string) | join("\n"))] | map(select(. != null)) | join("\n")')
patterns='(sk-ant-[A-Za-z0-9_-]{20,}|AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{35}|ghp_[A-Za-z0-9]{36}|-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----|xox[baprs]-[A-Za-z0-9-]{10,})'
if echo "$content" | grep -Eq "$patterns"; then
  echo "Parece haver uma credencial no conteúdo. Use variável de ambiente ou gerenciador de segredos." >&2
  exit 2
fi
exit 0
