# jev-youtube

Navegador por voz: a pessoa fala um comando em português ("abre o youtube", "clica em entrar") e o Chrome executa a ação
na página aberta. Conversa comum é ignorada, e uma ação perigosa ("clica em comprar agora") só acontece depois que a
pessoa confirma.

O código é uma extensão do Chrome (`src/`) com um proxy local (`proxy/`) que fala com o Jev, o modelo que interpreta
cada frase. Como rodar e testar está no `CLAUDE.md`, em "Comandos".

## Documentos

- `docs/product/vision.md`: visão, princípios e restrições que valem para todo trabalho, métricas, riscos e glossário.
- `docs/product/navegador-por-voz.svg`: diagrama da solução completa.
- `docs/arquitetura.md`: componentes, fluxo de um comando, leitura da página, contrato com o Jev, regras e segurança.

`docs/changes/` e `docs/backlog/` guardam o histórico local do trabalho (intent, spec, plano, review, ideias) e ficam
fora do git.

## Processo

O desenvolvimento segue o [ai-native-sdlc-kit](https://github.com/flaviovl/ai-native-sdlc-kit): skills do Claude Code em
que cada etapa grava um artefato local e cada aprovação é dada na conversa. O trabalho fica na `develop` e chega à
`main` por fast-forward depois do review. No Claude Code, `/sdlc status` mostra
onde cada trabalho está e qual é a próxima ação. Mudanças no processo são feitas no kit e trazidas para cá.
