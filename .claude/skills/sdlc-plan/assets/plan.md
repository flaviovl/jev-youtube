# Plan: <título> (de intent.md <data> / spec.md <data>)

Status: draft · Aprovado por: <engenheiro | tech lead se risco alto> · Data: <AAAA-MM-DD>

<!--
Etapa 3 — BUILD. Produzido no plan mode do Claude Code ANTES de qualquer código.
Critério de pronto: um engenheiro novo conseguiria implementar só com este plano.
Se a implementação divergir, atualize este arquivo (o diff final deve bater com ele).
Status: draft → approved (engenheiro aprova na conversa; o Claude grava) → done (entrega confirmada pelo humano).
Ordem do trabalho: o /sdlc-build marca [x] em cada passo que passou em build, testes e lint; o status do item
é calculado a partir dessas caixas.
-->

## Arquivos que mudam
- `<caminho/arquivo>` (novo) — <por quê>
- `<caminho/arquivo>` — <o que muda>

## Ordem do trabalho
- [ ] 1. <passo pequeno e verificável>
- [ ] 2. <…>

## Riscos
- <o que pode quebrar; passo mais arriscado; mitigação>

## Alternativas descartadas
- <opção> — <por que não>

## Prova (testes e checagens que provam que está pronto)
- `<arquivo de teste>` cobre <casos> — mapeia para CA-01, CA-02 do spec
- Comando(s): `<make test / npm test / …>` verde
- <screenshot bate com o mock | endpoint retorna 200 com campo X>

## Desvios durante a implementação
<preencher se algo mudou em relação ao plano, com motivo>
