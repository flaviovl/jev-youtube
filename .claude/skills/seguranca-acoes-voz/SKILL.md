---
name: seguranca-acoes-voz
description: Política de segurança para ações disparadas por voz no navegador. Use sempre que criar ou alterar código que lê a página, envia dados ao Jev, ou executa ações (clique, navegação, digitação) a partir de um comando de voz.
---

# Segurança de ações por voz

Quando você criar ou alterar código que lê a página ou executa ações por voz:
1. **Confirmação obrigatória**: ações classificadas como perigosas (comprar, pagar, excluir,
   enviar, publicar, transferir, confirmar pedido) só executam após confirmação explícita do
   usuário. A classificação combina lista fixa de palavras-chave E o julgamento do Jev — basta
   um dos dois marcar como perigoso.
2. **Dados sensíveis nunca saem do navegador**: não envie ao Jev valor de campos
   `type=password`, campos com `autocomplete` de cartão (`cc-*`), nem conteúdo de inputs
   preenchidos. Envie só rótulo, tipo e texto visível.
3. **Limiares antes de agir**: nenhuma ação executa se "É comando?" < limiar ou "Terminou a
   frase?" = não. Os limiares ficam em um único arquivo de configuração, nunca espalhados.
4. **Sem logs de conteúdo**: não registre transcrições ou conteúdo de página em logs
   persistentes; use IDs e métricas.
5. **Teste por regra**: cada regra acima tem ao menos um teste automatizado.
