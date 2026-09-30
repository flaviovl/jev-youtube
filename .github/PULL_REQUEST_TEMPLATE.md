## Item SDLC
- Intent: `docs/changes/<NNN>-<slug>/intent.md`
- Spec: `docs/changes/<NNN>-<slug>/spec.md` (só feature)
- Plan: `docs/changes/<NNN>-<slug>/plan.md`
- Review: `docs/changes/<NNN>-<slug>/review.md` (se o review rodou local)

## O que muda
<resumo em 2–3 linhas>

## Evidência (cole a saída)
- [ ] Build: 
- [ ] Testes: 
- [ ] Lint: 
- [ ] Verifier: 

## Critérios de aceitação → prova
| CA | Evidência |
|----|-----------|
| CA-01 | |

## Conformidade
- [ ] O diff bate com o `plan.md` (desvios registrados na seção "Desvios")
- [ ] Nenhum teste editado para passar
- [ ] Skills/políticas aplicáveis seguidas
- Risco: rotina / alto (auth, pagamentos, migrações, infra, ações irreversíveis)
