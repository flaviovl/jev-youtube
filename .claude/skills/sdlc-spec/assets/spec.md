# Spec: <título> 

Intent: ./intent.md (<data da aprovação>) · Status: draft · Autor: Claude + <product owner>
Skills aplicadas: <lista das skills/políticas usadas: segurança, UX, marca, compliance…>

<!--
Etapa 2 — DESIGN. Requisitos + design em um único documento, conforme as skills
(políticas) do projeto. Pronto para entregar à engenharia.
Status: draft → approved (product owner na conversa, tech lead quando risco alto; o Claude grava).
A aprovação dispara a Etapa 3 (plan.md).
-->

## 1. Resumo
<2–4 frases: o que será construído e por que, ligando ao intent.>

## 2. Requisitos funcionais
| ID | Requisito | Origem no intent | Prioridade |
|----|-----------|------------------|------------|
| RF-01 | <o sistema deve…> | <seção/critério do intent> | Must/Should/Could |

## 3. Requisitos não funcionais
| ID | Categoria | Requisito mensurável |
|----|-----------|----------------------|
| RNF-01 | Desempenho | <ex.: p95 < 2 s entre fala e ação> |
| RNF-02 | Segurança/Privacidade | <…> |
| RNF-03 | Acessibilidade/UX | <…> |

## 4. Design
### 4.1 Visão geral da arquitetura
<Componentes e fluxo. Diagrama mermaid se ajudar.>

### 4.2 Integração com o código existente
<Onde encaixa, módulos tocados, o que NÃO muda.>

### 4.3 Contratos de dados / interfaces
<Formatos de entrada/saída, APIs, eventos, esquemas JSON.>

### 4.4 Fluxos e estados
<Caminho feliz, erros, estados de UI.>

### 4.5 Alternativas consideradas
| Opção | Prós | Contras | Decisão |
|-------|------|---------|---------|

## 5. Conformidade com políticas (skills)
| Política/skill | Como o design atende | Status (ok / conflito / n.a.) |
|----------------|----------------------|-------------------------------|
| `docs/product/vision.md` (princípios e restrições) | <…> | <ok / conflito> |

## 6. Áreas de preocupação
<OBRIGATÓRIO. Riscos, ambiguidades do intent e, em especial, onde políticas se
contradizem e não podem ser satisfeitas ao mesmo tempo. Para cada item: impacto,
dono da política a consultar e recomendação.>

## 7. Classificação de risco
- Nível: <baixo | médio | alto>
- Motivo: <toca autenticação, pagamentos, migrações, infraestrutura, dados pessoais, ações irreversíveis?>
- Aprovação necessária: <product owner | + tech lead | + dono da política>

## 8. Critérios de aceitação (verificáveis)
- [ ] CA-01 <dado/quando/então ou comando que prova: "npm test passa", "endpoint retorna 200 com campo X">

## 9. Perguntas resolvidas e pendentes
- Resolvida: <pergunta do intent> → <resposta>
- Pendente: <…> (bloqueia? sim/não)

## Decisão
<approved/rejected por quem, quando; condições>
