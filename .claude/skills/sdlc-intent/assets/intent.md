# Intent: <título curto>

Autor: <nome> (<área/papel>) · Status: draft · Criado: <AAAA-MM-DD>

Tipo: <feature | poc | bug> · Origem: <entrada do backlog (origin.md) | conversa | ticket | incidente | alerta de bands.yaml | scan de segurança>

<!--
Etapa 1 — PLAN. Diz O QUE se quer, POR QUÊ e sob QUAIS RESTRIÇÕES.
Não descreve solução técnica (isso é spec.md). Cabe em uma tela.
Herda visão, princípios e fora do escopo de docs/product/vision.md: aqui vai só o que é próprio deste item.
Tipo feature: intent → spec → plan → build → review → done.
Tipo poc: intent → plan → build → findings.md → done; sem spec, código descartável, as respostas voltam ao vision.md.
Tipo bug: intent (sintoma, como reproduzir, esperado) → plan test-first → correção → review → done; sem spec.
Status: draft → approved (aprovado pelo product owner via merge/commit)
        | rejected (motivo registrado no fim).
-->

## Problema
<O que não dá para fazer hoje, para quem, e qual a dor. Em linguagem de quem sofre o problema.>

## Resultado proposto
<Como fica melhor. Estado final observável pelo usuário, não a implementação.>

## Usuários e sistemas afetados
- Usuários: <quem>
- Sistemas: <serviços, APIs, telas, dados tocados>

## Restrições
- <Só as próprias do item; as do docs/product/vision.md valem sempre. Ex.: custo máximo, prazo, time-box da POC…>

## Fora do escopo
- <O que explicitamente NÃO será feito agora>

## Como saberemos que deu certo
- <Critério observável/mensurável 1>
- <Critério 2>

## Perguntas em aberto
- [ ] <Pergunta que precisa de resposta antes ou durante o spec. Numa POC, são as perguntas que ela responde.>

<!-- Se Origem = incidente/alerta, adicionar:
## Anomalia e evidências
<métrica, janela, valores, links de log/run>
-->

## Decisão
<preenchido pelo product owner: approved/rejected, por quem, quando, motivo>
