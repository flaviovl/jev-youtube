# CA-06: latência com voz

Mesma rodada do `ca05-roteiro.md` (2026-10-01). O tempo vai da última mudança do texto reconhecido até a ação feita
(RNF-01 do spec); o intervalo entre o fim real da fala e a última mudança do texto não é medido.

| Conjunto                                         | n  | p50      | p95      | Máximo   |
| ------------------------------------------------ | -- | -------- | -------- | -------- |
| Todas as ações executadas por voz                | 18 | 1.083 ms | 1.201 ms | 1.201 ms |
| "clica em entrar" na página de teste             | 6  | 1.053 ms | 1.201 ms | 1.201 ms |

Valores das 6 de "clica em entrar": 1.053, 1.162, 1.189, 990, 990 e 1.201 ms. As 18 incluem cliques, rolagens, voltar,
abrir site e buscar, na página de teste, no YouTube e no Google.

Resposta ao CA-06: p50 de 1.083 ms, abaixo de 2 s. O critério pedia ≥ 10 falas de "clica em entrar" na página de teste;
foram 6 desse comando e 18 ações no total, por decisão do engenheiro (ver Desvios do plano). A pausa de 700 ms do fim
da frase é a maior parte do tempo; o resto é leitura, Jev (p50 de cerca de 300 ms) e ação.
