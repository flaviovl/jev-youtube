# Review: 002-voice-command-core

<!--
Registro dos reviews deste item (Etapa 5). Uma seção por rodada, a mais recente no fim, gravada pela /sdlc-review.
A política de como revisar está em .claude/skills/sdlc-review/policy.md. O review informa; quem aprova é um humano.
-->

## Rodada 1 · 2026-10-02 · `81b1c34..ae3c31d` (código do item; HEAD em `b295a8c`)

Sem PR: a `main` já tinha recebido a `develop`, então o diff revisado é o intervalo dos commits do item. Evidência
mecânica rodada agora em `b295a8c`: `npm test` 50 de 50, `npm run e2e` 7 de 7, `npm run lint` sem warnings. Este review
foi feito na mesma sessão que escreveu o código; o verifier, com contexto limpo, rodou antes e os três achados dele
estão corrigidos em `ae3c31d`.

- [Important] [Conformidade] `docs/changes/002-voice-command-core/plan.md:139`: CA-05 (6 sites) e CA-06 (≥ 10 falas de
  "clica em entrar") foram reduzidos por um desvio no plan, mas são critérios de aceitação do spec
  (`spec.md:205`, `spec.md:207`). Pela regra do `/sdlc-build`, mudança de critério do spec não é desvio: volta ao spec.
  Sugestão: reabrir o spec e ajustar CA-05 e CA-06 ao que foi aceito, ou completar o roteiro falado nos 4 sites e
  mais 4 falas.
- [Important] [Conformidade] `src/background/service-worker.js:37`: o RF-11 (Must) promete avisar que não lê PDF, e o
  código depende de `document.contentType` ser `application/pdf` no visualizador do Chrome. Isso não tem prova: o e2e
  só cobre `chrome://`, e na POC 001 o script rodou no PDF e leu 0 elementos, sem registrar o `contentType`. Se o
  valor for outro, a frase vai ao Jev com a página vazia. Sugestão: abrir um PDF no Chrome e conferir o aviso, ou um
  e2e com um PDF servido localmente.
- [Nit] [Bugs] `src/background/service-worker.js:27`: qualquer exceção na execução (por exemplo, `chrome.tabs.goBack`
  sem histórico, `src/background/acoes.js:25`, ou injeção numa página que acabou de navegar) chega ao painel como
  "falha interna da extensão". Sugestão: tratar "não há página anterior" com um código próprio.
- [Nit] [Conformidade] `tests/e2e/comando.test.js:124`: o CA-09 cita `chrome://extensions` e a mensagem do painel; o
  teste usa `chrome://version` e confere o código `pagina-ilegivel`, não o texto mostrado. Sugestão: aceitar como
  equivalente no spec ou ajustar o teste.

Sem achados de segurança: o proxy confere a `Origin` antes de tudo e escuta só em 127.0.0.1
(`proxy/server.js:18`, `proxy/server.js:59`); a leitura não envia valores, conteúdo editável nem query de links; os logs
passam pelo filtro de `src/log.js`; o service worker só aceita mensagens de páginas da extensão
(`src/background/service-worker.js:23`) e nunca executa sem o pedido do painel.

Important: 2 · Nit: 2 · Risco: alto · Aprovação: você, como product owner, tech lead e dono da `seguranca-acoes-voz`
