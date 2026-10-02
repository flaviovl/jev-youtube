# Plan: Core do navegador por voz (de intent.md 2026-10-01 / spec.md 2026-10-01)

Status: approved · Aprovado por: Flavio Vieira Leao (engenheiro e tech lead, risco alto) · Data: 2026-10-01

<!--
Etapa 3 — BUILD. Produzido no plan mode do Claude Code ANTES de qualquer código.
Critério de pronto: um engenheiro novo conseguiria implementar só com este plano.
Se a implementação divergir, atualize este arquivo (o diff final deve bater com ele).
Status: draft → approved (engenheiro aprova na conversa; o Claude grava) → done (entrega confirmada pelo humano).
Ordem do trabalho: o /sdlc-build marca [x] em cada passo que passou em build, testes e lint; o status do item
é calculado a partir dessas caixas.
-->

Branch `sdlc/002-voice-command-core`. JavaScript puro, sem bundler; `src/` é a raiz da extensão (carregada sem
compactação). O código da POC 001 (`_poc/`, ignorado pelo git) é referência, não é copiado como está.

## Arquivos que mudam

- `package.json` (novo): scripts `test` (`node --test tests/`), `lint` (`eslint . --max-warnings 0`), `proxy`
  (`node --env-file=.env proxy/server.js`), `eval` (`node --env-file=.env scripts/eval.js`) e `e2e`; dependências de
  desenvolvimento `eslint`, `@eslint/js`, `globals` e `playwright`.
- `eslint.config.js` (novo): `no-console` como erro, exceto em `src/log.js` e `proxy/log.js` (regra 4 da skill
  `seguranca-acoes-voz` aplicada pelo lint).
- `.env.example` (novo): `OPENROUTER_API_KEY=`, `EXTENSAO_ID=`, `JEV_MODELO=typesafe/jev-1.13`, sem valores.
- `src/manifest.json` (novo): MV3; `sidePanel`, `scripting`, `storage`, `commands`; `host_permissions` `<all_urls>`;
  atalho "Falar". Sem content script declarado.
- `src/config/limiares.js` (novo): `comando 0.3`, `terminou 0.5`, `perigoso 0.35`, `pausaMs 700`, `esperaMaxMs 3000`,
  `confirmacaoMs 5000`. Único lugar dos limiares.
- `src/rules/perigo.js` (novo): lista fixa de palavras perigosas, com formas verbais e sinônimos (manda, apaga, fecha o
  pedido) além dos verbos da skill.
- `src/rules/decidir.js` (novo): função pura (respostas do quiz, frase, nome do elemento) → `ignorar | esperar |
  confirmar | executar`.
- `src/rules/argumento.js` (novo): site (lista fixa do spec e domínio falado), direção de rolagem e termo de busca, a
  partir da frase.
- `src/sidepanel/frase.js` (novo): máquina de estados do fim da frase e da confirmação, sem I/O, com relógio injetado.
- `src/sidepanel/fala.js` (novo): wrapper da Web Speech API, nuvem ou local.
- `src/sidepanel/sidepanel.html`, `sidepanel.js` (novos): botão Falar, estados com `aria-live`, escolha nuvem ou local
  com o aviso de destino dos dados, confirmação.
- `src/permissao/permissao.html`, `permissao.js` (novos): concessão do microfone na primeira vez.
- `src/pagina/leitura.js` (novo): função injetada sob demanda que lê, marca (`data-jev-id`) e deduplica os elementos,
  com as regras do E3 da POC 001.
- `src/pagina/agir.js` (novo): função injetada que clica ou rola pelo ID da última leitura.
- `src/background/service-worker.js` (novo): orquestra injeção, proxy, regras e ação; trata o atalho.
- `src/background/acoes.js` (novo): abrir site, voltar e buscar por `chrome.tabs`; clicar e rolar por `agir.js`.
- `src/log.js`, `proxy/log.js` (novos): registram só evento, decisão e milissegundos; descartam qualquer outro campo.
- `proxy/server.js` (novo): 127.0.0.1:8787, `POST /jev`, 403 sem a `Origin` `chrome-extension://${EXTENSAO_ID}`, tempo
  limite de 3 s.
- `proxy/jev.js` (novo): monta o pedido da Decisions API (perguntas da POC 001) e mapeia a resposta para o contrato do
  spec; URL do Jev configurável por variável de ambiente para os testes.
- `scripts/eval.js` (novo): roda `tests/fixtures/casos.json` contra o Jev real e aplica as regras; calcula o acerto nos
  cenários 1 e 2, os perigosos executados e as conversas tratadas como comando.
- `tests/rules.test.js`, `tests/argumento.test.js`, `tests/frase.test.js`, `tests/log.test.js`, `tests/proxy.test.js`,
  `tests/leitura.test.js` (novos): os testes de unidade; a leitura roda no Chromium do Playwright, sobre a fixture.
- `tests/e2e.test.js` (novo, `npm run e2e`): carrega a extensão no Chromium, abre a página de teste e manda frases pela
  página do painel, com um Jev falso.
- `tests/fixtures/pagina-teste.html` (novo, da POC, com `contenteditable` preenchido), `tests/fixtures/casos.json` (os
  40 casos do E4), `tests/fixtures/snapshots/*.json` (os 7 da variante padrão do E3).
- `CLAUDE.md`: seções "Comandos", "Verificando seu trabalho" e o estado do repositório.
- `docs/changes/002-voice-command-core/attachments/ca04-eval.md`, `ca05-roteiro.md`, `ca06-latencia.md` (novos).
- `docs/changes/002-voice-command-core/plan.md`: passos marcados e desvios.

## Ordem do trabalho

- [x] 1. Esqueleto: `package.json`, `eslint.config.js`, manifest mínimo, `.env.example` e comandos no `CLAUDE.md`. Fim:
      `npm test` e `npm run lint` saem com 0, e a extensão carrega sem erro em `chrome://extensions`.
- [x] 2. Regras: `limiares.js`, `perigo.js`, `decidir.js`, `argumento.js` e testes. Fim: os testes cobrem a regra 1
      (lista fixa e Jev), a regra 3 (ignorar e esperar) e os argumentos dos 6 sites e das duas direções.
- [ ] 3. Fim da frase: `frase.js` com relógio falso. Fim: os testes cobrem frase completa, pausa com retomada,
      desistência depois de 3 s e confirmação com "sim", com "não" e com silêncio.
- [ ] 4. Leitura e ação na página: `leitura.js`, `agir.js` e `leitura.test.js` no Chromium. Fim: 0 valores plantados no
      resultado (CA-03), no máximo 100 elementos, viewport primeiro, shadow root e iframe da mesma origem lidos,
      duplicados removidos e clique por ID funcionando.
- [ ] 5. Log: `log.js`, `proxy/log.js`, teste e `no-console`. Fim: o teste prova que frase e conteúdo são descartados, e
      o lint falha com um `console.log` fora do log.
- [ ] 6. Proxy: `server.js` e `jev.js` com um Jev falso local. Fim: `proxy.test.js` prova 403 sem `Origin` e com outra
      origem, 200 com a `Origin` da extensão, o mapeamento da resposta e o tempo limite (CA-07); `grep -r OPENROUTER src/`
      não acha nada (CA-08).
- [ ] 7. Orquestração: `service-worker.js` e `acoes.js`. Fim: `npm run e2e` com o Jev falso prova clique real na
      fixture, "confirmar" em "Comprar agora", "ignorar" em conversa, rolagem, e aviso de página ilegível numa página
      `chrome://` sem pedido ao proxy (CA-09).
- [ ] 8. Painel: fala, estados, confirmação falada, nuvem ou local, permissão e atalho. Fim: o engenheiro fala "clica em
      entrar" na página de teste e o botão é clicado; o painel funciona só com teclado.
- [ ] 9. Eval do Jev: `scripts/eval.js` com os 40 casos. Fim: `attachments/ca04-eval.md` com ≥ 90% nos cenários 1 e 2,
      0 perigoso executado e ≤ 5% de conversas como comando (CA-04).
- [ ] 10. Roteiro falado e latência: o engenheiro fala e o Claude registra só métricas. Fim: `attachments/ca05-roteiro.md`
      com os 5 cenários nos 6 sites e na página de teste, com clique real, "sim" e "não", e `attachments/ca06-latencia.md`
      com p50 ≤ 2 s em ≥ 10 falas (CA-05, CA-06).
- [ ] 11. Verificação final: subagente verifier, mais `npm test`, `npm run lint` e `npm run e2e`.

## Riscos

- Passo mais arriscado, o 7: o Chrome de marca deixou de aceitar `--load-extension` (versão 137 em diante), então o e2e
  usa o Chromium do Playwright (download de cerca de 170 MB). Se a extensão não carregar nele, o passo 7 vira
  verificação manual, registrada como desvio.
- Leitura sem layout: o jsdom não calcula tamanho nem visibilidade, e o teste de vazamento passaria sem provar nada. Por
  isso a leitura é testada no Chromium.
- Os passos 8 e 10 dependem da voz do engenheiro; CA-05 e CA-06 não fecham sem ela.
- O eval (passo 9) chama o Jev de verdade: 40 chamadas, cerca de US$ 0,01.
- O ID da extensão sem compactação depende da pasta; o proxy lê `EXTENSAO_ID` do `.env`, e mudar a pasta muda o ID.

## Alternativas descartadas

- jsdom para a leitura: não tem layout.
- Puppeteer: equivalente ao Playwright aqui, sem vantagem.
- TypeScript com bundler: decidido no spec (seção 4.5).
- Campo de texto no painel para testes: seria um gatilho de teste dentro do produto; o e2e manda as frases pela página
  do painel.

## Prova (testes e checagens que provam que está pronto)

- `tests/rules.test.js`, `tests/frase.test.js`, `tests/log.test.js` e `tests/leitura.test.js` cobrem as regras 1 a 4
  da skill `seguranca-acoes-voz` — CA-01; `npm test` verde.
- `npm run lint` sem warnings — CA-02.
- `tests/leitura.test.js`: nenhum valor plantado no resultado; senha e cartão só com tipo e rótulo — CA-03.
- `npm run eval` gera `attachments/ca04-eval.md` com as três métricas dentro das metas — CA-04.
- `attachments/ca05-roteiro.md` — CA-05; `attachments/ca06-latencia.md` com p50 ≤ 2 s — CA-06.
- `tests/proxy.test.js`: 403 sem `Origin` ou com outra origem, 200 com a da extensão — CA-07.
- `grep -r OPENROUTER src/` vazio e nenhum arquivo versionado com a chave — CA-08.
- `tests/e2e.test.js`: página `chrome://` mostra o aviso e o proxy falso não recebe pedido — CA-09.

## Desvios durante a implementação

- 2026-10-01, testes e2e: ficam em `tests/e2e/*.test.js`, e não em `tests/e2e.test.js`, para o `npm test`
  (`tests/*.test.js`) não rodar o e2e. O passo 1 ganhou `tests/e2e/carrega.test.js`, que prova a carga da extensão no
  Chromium, e `tests/e2e/chromium.js`, que abre o Chromium com a extensão; `tests/manifest.test.js` confere que o
  manifest é MV3 e não declara content script. `.gitignore` ganhou `node_modules/`.
