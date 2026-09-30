# Intent: POC de viabilidade do navegador por voz

Autor: Flavio (produto) · Status: approved · Criado: 2026-09-30

Tipo: poc · Origem: perguntas técnicas em aberto do `docs/product/vision.md`

## Problema

O produto depende de hipóteses que ninguém testou: se a transcrição do Chrome funciona em pt-BR dentro de uma extensão,
se dá para ler os elementos clicáveis de uma página de um jeito útil para o Jev, e o que o Jev precisa receber e
devolver. Escrever o spec da primeira funcionalidade em cima dessas incógnitas arrisca retrabalho.

## Resultado proposto

Respostas com evidência para as perguntas abaixo, registradas em `findings.md` nesta pasta, e uma recomendação de como
seguir na primeira funcionalidade do produto.

## Usuários e sistemas afetados

- Usuários: nenhum; a POC não é entregue.
- Sistemas: transcrição de voz do Chrome, leitura da página e o contrato de entrada e saída do Jev.

## Restrições

- Código descartável, numa branch que nunca é mergeada.
- Time-box de 1 a 2 dias por experimento.

## Fora do escopo

- Qualidade de produção, testes completos, interface final e publicação.
- Decidir o que é o Jev (pergunta de produto): a POC usa um substituto só para testar o contrato.

## Como saberemos que deu certo

- Cada pergunta abaixo tem resposta (sim, não ou valor medido) com evidência em `findings.md`.
- `findings.md` termina com uma recomendação para a primeira funcionalidade: o que se confirma no `vision.md` e o que
  muda.

## Perguntas em aberto

- [ ] A Web Speech API (`webkitSpeechRecognition`) atende em qualidade e latência para pt-BR, e funciona dentro de uma
      extensão (service worker ou offscreen document) ou só numa página?
- [ ] Como detectar que a frase terminou: resultado final da API, pausa ou o próprio Jev?
- [ ] Extensão do Chrome com content script serve como formato do produto?
- [ ] Quais elementos entram na leitura (links, botões, inputs, `role="button"`, elementos com `onclick`), como escolher
      os 100 quando houver mais, e que dados enviar de cada um sem vazar campos sensíveis?
- [ ] Que formato de resposta o Jev precisa devolver (as cinco respostas do quiz com confiança de 0 a 1?) e qual
      latência por chamada é aceitável?

## Decisão

approved por Flavio em 2026-09-30, na conversa com o Claude, que registrou a decisão e fez o commit.
