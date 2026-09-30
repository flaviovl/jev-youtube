# Instruções de review

<!-- Política de review do repositório (Etapa 5 — DEPLOY), lida pela skill sdlc-review, local e no CI. Dono: tech lead.
     Revisar mensalmente: avaliar os achados (docs/changes/*/review.md) e ajustar o que gera ruído. -->

## Passes
Faça três passes e marque cada achado com o passe:
- **Bugs:** erros de lógica, casos de borda quebrados, regressões sutis.
- **Segurança:** injeção, falhas de autenticação, dados pessoais em logs, segredos no diff.
- **Conformidade:** a mudança bate com `spec.md`, `plan.md` e os princípios de design.

## Severidade
- **Important:** quebra comportamento, vaza dados ou viola política.
- **Nit:** estilo e nomes.

## Limite de nits
Reporte no máximo cinco nits por review; resuma o resto como contagem.

## Não reportar
Arquivos gerados em `<src/gen/>` e qualquer coisa que o CI já verifica (lint, formatação).

## Risco da mudança
- Rotina (pode ser aprovada com menos supervisão): documentação, formatação.
- Alto risco (exige aprovação humana do dono do código): autenticação, pagamentos,
  migrações, infraestrutura, <no nosso caso: ações irreversíveis na página, dados de áudio/página enviados a terceiros>.

## Saída
Termine com uma contagem: `Important: N · Nit: N · Riscos: <rotina|alto>`.
O review informa; quem aprova o PR é um humano — nunca o agente que escreveu o código.
