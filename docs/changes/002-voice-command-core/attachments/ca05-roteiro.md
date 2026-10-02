# CA-05: roteiro falado

Rodada de 2026-10-01, falada pelo engenheiro no Chrome dele, com a extensão carregada sem compactação, o proxy local e o
Jev de verdade. O resultado de cada comando veio do botão "Copiar resultados" do painel (site, decisão, ação, erro e
tempo, sem a frase), na ordem em que aconteceu. As frases são as do roteiro; a associação entre resultado e frase é pela
ordem do roteiro e foi feita pelo Claude.

## Página de teste (`http://127.0.0.1:8000/pagina-teste.html`)

| Cenário                                   | Resultado                                                              | Atende |
| ----------------------------------------- | ---------------------------------------------------------------------- | ------ |
| 2. "clica em entrar"                      | 6 cliques de verdade, todos certos                                     | sim    |
| 3. "nossa que legal"                      | ignorado (2 vezes)                                                     | sim    |
| 5. "clica no" e silêncio                  | descartada depois da espera (3 vezes)                                  | sim    |
| 4. "clica em comprar agora" + "sim"       | pediu confirmação; com "sim", clicou de verdade                        | sim    |
| 4. "clica em comprar agora" + "não"       | pediu confirmação; com "não", cancelou                                 | sim    |
| "rola para baixo"                         | rolou                                                                  | sim    |

Fora do roteiro: um comando virou "executar" com intenção `nenhuma` ("entendi, mas não há ação para isso"), e a primeira
fala da rodada foi descartada. Qual frase gerou cada um não ficou registrado.

## YouTube

| Cenário                                   | Resultado                                                              | Atende |
| ----------------------------------------- | ---------------------------------------------------------------------- | ------ |
| 3. "nossa que legal"                      | ignorado                                                               | sim    |
| 5. "clica no" e silêncio                  | descartada                                                             | sim    |
| 4. "clica em comprar agora"               | pediu confirmação; a resposta reconhecida foi "sim", e o clique foi feito | sim (a trava pediu confirmação) |
| 2. "clica em entrar"                      | clicou e abriu `accounts.google.com`                                   | sim    |
| 1. "abre o youtube"                       | abriu o YouTube a partir do Google (2 vezes)                           | sim    |

O engenheiro testou também, por voz: voltar (2), rolar (2), mais 2 cliques e buscar (2). Todos executaram.

## O que não rodou

Wikipédia, g1, Mercado Livre e GitHub ficaram sem roteiro falado, por decisão do engenheiro (ver Desvios do plano). A
leitura e a decisão nesses sites foram testadas na POC 001 (E5, parte I) com frases digitadas e o mesmo Jev.

Resposta ao CA-05: atendido na página de teste e no YouTube, com clique de verdade, "sim" executando e "não" cancelando;
parcial nos 6 sites (1 de 6 falado).
