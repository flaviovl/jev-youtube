# jev-youtube

Navegador por voz: a pessoa fala um comando em português ("abre o youtube", "clica em entrar") e o Chrome executa a ação
na página aberta. Conversa comum é ignorada, e uma ação perigosa ("clica em comprar agora") só acontece depois que a
pessoa confirma.

Ainda não há código. O primeiro trabalho é uma POC de viabilidade da transcrição, da leitura da página e do contrato com
o Jev, o modelo que interpreta cada frase: `docs/changes/001-feasibility-poc/`.

## Documentos

- `docs/product/vision.md`: visão, princípios e restrições que valem para todo trabalho, métricas, riscos e glossário.
- `docs/product/navegador-por-voz.svg`: diagrama da solução completa.
- `docs/changes/`: uma pasta por trabalho (feature, POC ou bug), com intent, spec, plano, findings e review.
- `docs/backlog/`: ideias, problemas e bugs que ainda não viraram trabalho.

## Processo

O desenvolvimento segue o [ai-native-sdlc-kit](https://github.com/flaviovl/ai-native-sdlc-kit): skills do Claude Code em
que cada etapa grava um artefato versionado e cada aprovação é um commit humano. No Claude Code, `/sdlc status` mostra
onde cada trabalho está e qual é a próxima ação. Mudanças no processo são feitas no kit e trazidas para cá.
