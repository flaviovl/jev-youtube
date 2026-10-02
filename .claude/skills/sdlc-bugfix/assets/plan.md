# Plan: <título do bug> (de intent.md <data>)

Status: draft · Aprovado por: <nome> · Data: <AAAA-MM-DD>

<!--
Plano de correção de bug (intent com Tipo: bug), test-first. Os quatro passos são fixos; o que muda é o diagnóstico.
Status: draft → approved (você aprova na conversa) → done (entrega confirmada pelo humano).
O /sdlc-bugfix marca [x] em cada passo concluído; o status do item é calculado a partir dessas caixas.
-->

## Diagnóstico

- Causa suspeita: <…>
- Arquivos prováveis: `<caminho>`
- Teste que reproduz: `<arquivo de teste>`, que afirma <comportamento esperado>

## Ordem do trabalho

- [ ] 1. Teste que reproduz o bug escrito e falhando pelo motivo esperado (saída colada)
- [ ] 2. Teste aprovado e testes travados (`touch .claude/.tests-locked`)
- [ ] 3. Correção só no código de produção; o teste passa
- [ ] 4. Suíte inteira e lint verdes; trava removida (`rm .claude/.tests-locked`)

## Riscos

- <o que a correção pode quebrar>

## Desvios durante a implementação

<preencher se algo mudou em relação ao plano, com motivo>
