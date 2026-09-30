#!/bin/bash
# Etapa 5 — hook como portão de aprovação: deploy para produção exige autorização de release.
# Exit 2 bloqueia a ferramenta e devolve a mensagem de stderr para o Claude.
cmd=$(jq -r '.tool_input.command // ""' < /dev/stdin)
if [[ "$cmd" == *"deploy"* && "$cmd" == *"prod"* ]]; then
  if [ -z "$RELEASE_APPROVAL" ]; then
    echo "Deploy para produção precisa de autorização de release (RELEASE_APPROVAL não definida). Peça ao release manager." >&2
    exit 2
  fi
fi
# Publicação da extensão na Chrome Web Store também é produção
if [[ "$cmd" == *"chrome-webstore-upload"* || "$cmd" == *"webstore publish"* ]]; then
  if [ -z "$RELEASE_APPROVAL" ]; then
    echo "Publicação na Chrome Web Store precisa de autorização de release." >&2
    exit 2
  fi
fi
exit 0
