# Evals do agente (Etapa 4 — TEST)

Testes de regressão do **comportamento do agente**, não do produto. Rodam sempre que muda algo
que altera como o Claude trabalha: `CLAUDE.md`, `.claude/**` (skills, hooks, comandos, agentes)
ou o modelo. Também rodam todo dia no CI.

## Como montar a suíte
1. Colete de **20 a 50 tarefas reais** já feitas no projeto, com o resultado esperado.
2. Escreva cada uma como um arquivo `.claude/evals/<nome>.json`: um prompt + checagens que definem
   "aceitável" (testes passam, lint limpo, política seguida). Veja `exemplo-*.json`.
3. `check.sh` avalia o resultado de cada execução.
4. Mudanças de configuração só entram se a taxa de aprovação ficar acima do limiar
   (`EVAL_MIN_PASS_RATE`, padrão 0.9).
5. **Todo incidente de produção vira um eval permanente.**

## Formato
```json
{
  "id": "slug-unico",
  "prompt": "tarefa exatamente como um humano pediria",
  "setup": "comando opcional para preparar o repo (ex.: git checkout <sha>)",
  "checks": [
    { "type": "command", "run": "npm test", "expect_exit": 0 },
    { "type": "not_modified", "paths": ["tests/"] },
    { "type": "output_contains", "text": "Confirma?" }
  ]
}
```

## Rodar localmente
```bash
./.claude/evals/run.sh            # todos
./.claude/evals/run.sh exemplo-*  # filtro
```
