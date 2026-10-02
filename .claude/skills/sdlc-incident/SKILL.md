---
name: sdlc-incident
description:
  Etapa 6 (Maintain) do SDLC deste repositório. Diagnostica um alerta das faixas de bands.yaml ou um incidente e escreve
  um novo intent.md com anomalia e evidências, fechando o ciclo. Use quando uma métrica sair da faixa, o CI reportar
  anomalia ou o usuário relatar um incidente em produção que precise de diagnóstico, não de correção imediata.
argument-hint: "<alerta, métrica rompida, log ou descrição do incidente>"
allowed-tools:
  - Read
  - Grep
  - Glob
  - Write
  - Edit
  - Bash(gh run view *)
  - Bash(git log *)
  - Bash(${CLAUDE_PROJECT_DIR}/.claude/skills/sdlc/scripts/status.sh)
  - Bash(${CLAUDE_PROJECT_DIR}/.claude/skills/sdlc/scripts/status.sh *)
  - Bash(.claude/skills/sdlc/scripts/status.sh)
  - Bash(.claude/skills/sdlc/scripts/status.sh *)
---

# Etapa 6: MAINTAIN → novo intent.md

Algo em produção ou no CI saiu da faixa (ver `${CLAUDE_SKILL_DIR}/bands.yaml`) ou um incidente foi reportado.

Sinal: $ARGUMENTS

Estado atual (pastas, produto, próximo número e itens):

!`${CLAUDE_PROJECT_DIR}/.claude/skills/sdlc/scripts/status.sh`

## Limites

- Você só **diagnostica e propõe**. Não faça deploy, rollback nem altere produção.
- Use apenas as ferramentas permitidas pelo tier da métrica em `${CLAUDE_SKILL_DIR}/bands.yaml`.
- Correções pequenas e óbvias seguem pelo fluxo normal de bug (`/sdlc-bugfix`); o resto vira intent.

## Passos

1. Colete evidências: métrica, janela, valores contra o baseline, logs e runs relevantes, commits recentes suspeitos
   (`git log`).
2. Formule a hipótese de causa raiz, com o grau de confiança. Leia `docs/product/vision.md`: o intent herda dele
   princípios e restrições, e um incidente que exija mudar o produto aponta isso nas perguntas em aberto.
3. Escreva `docs/changes/<próximo número>-<slug>/intent.md` no formato da Etapa 1
   (`${CLAUDE_PROJECT_DIR}/.claude/skills/sdlc-intent/assets/intent.md`), com `Status: draft`,
   `Origem: alerta|incidente` e a seção **Anomalia e evidências** preenchida, além de resultado proposto, sistemas
   afetados e perguntas em aberto.
4. Registre uma lição em `docs/lessons.md` (data, sintoma, causa, o que muda, item).
5. Recomende: corrigir agora, agendar ou descartar (descartes ajustam as faixas). Lembre que, quando a correção chegar
   em produção, entra um eval em `.claude/evals/` para a classe do incidente.
