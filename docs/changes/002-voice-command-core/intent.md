# Intent: Core do navegador por voz

Autor: Flavio (produto) · Status: approved · Criado: 2026-10-01

Tipo: feature · Origem: conversa (recomendação do `findings.md` da POC 001)

## Problema

Ainda não dá para controlar o Chrome falando: só existe a POC 001, com código descartável, que provou cada peça em
separado (transcrição, leitura da página, Jev e ação). Quem quer usar o navegador sem mouse e teclado continua sem um
produto que entenda o comando e aja na página aberta.

## Resultado proposto

A pessoa instala a extensão, abre o painel dela e fala um comando em português. O Chrome executa na aba aberta: abre um
site, clica no elemento certo, rola, volta ou busca. O painel mostra o que foi entendido e o que foi feito. Conversa
comum é ignorada, frase incompleta espera o resto, e ação perigosa só acontece depois de um "sim" falado. Os 5 cenários
de referência do `docs/product/vision.md` funcionam de ponta a ponta, com voz.

## Usuários e sistemas afetados

- Usuários: quem usa o Chrome no desktop e quer comandá-lo por voz (o público exato está em aberto no `vision.md`).
- Sistemas: extensão do Chrome, transcrição de fala do Chrome, a página aberta e o Jev.

## Restrições

- A chave de acesso ao Jev nunca fica na extensão.
- Uso local: a extensão é carregada sem compactação pelo próprio usuário.
- A skill `seguranca-acoes-voz` vale inteira, com um teste automatizado por regra.

## Fora do escopo

- Publicação na Chrome Web Store.
- Alvo fora dos 100 elementos lidos: rolar e ler de novo fica para outro item.
- Calibração dos limiares com dados de uso; este item parte de valores iniciais.
- Interface final e onboarding: o painel é funcional, não acabado.

## Como saberemos que deu certo

- Os 5 cenários de referência funcionam falados, nos 6 sites públicos do roteiro da POC 001 e numa página de teste,
  com clique de verdade na página de teste e confirmação por "sim".
- Num conjunto de teste de frases e páginas: ≥ 90% dos cenários 1 e 2 corretos, 0 ação perigosa sem confirmação e
  ≤ 5% de conversa tratada como comando.
- Do fim da fala à ação, p50 ≤ 2 s, medido com voz.
- Teste automatizado prova que nenhum valor de senha, cartão ou campo preenchido é enviado ao Jev.

## Perguntas em aberto

- [ ] Onde fica a chave do Jev: um servidor próprio, um proxy local que o usuário roda, ou outra forma?
- [ ] Como a pessoa ativa a escuta neste item: botão ou atalho no painel (proposta, porque a escuta em segundo plano não
      foi medida) ou escuta contínua?
- [ ] Transcrição na nuvem do Google, no modo local ou escolha do usuário?
- [ ] Os limiares provisórios da POC 001 (É comando 0,3, Terminou 0,5, É perigoso 0,35) servem como valores iniciais?
- [ ] Como sai o argumento (site, termo de busca, direção): pergunta a mais ao Jev ou regra sobre a frase? E "abrir
      site" conhece quais sites?

## Decisão

approved por Flavio Vieira Leao na conversa em 2026-10-01.
