import { test } from 'node:test'
import assert from 'node:assert/strict'
import { decidir } from '../src/rules/decidir.js'
import { ehPerigoso } from '../src/rules/perigo.js'
import { LIMIARES } from '../src/config/limiares.js'

const comandoSeguro = { comando: 0.86, terminou: 0.82, perigoso: 0.05 }

// Regra 3: nenhuma ação com "É comando?" abaixo do limiar.
test('conversa comum é ignorada', () => {
  assert.equal(decidir({ comando: 0.02, terminou: 0.76, perigoso: 0.02 }, { frase: 'nossa que legal' }), 'ignorar')
})

test('conversa com verbo perigoso também é ignorada, sem pedir confirmação', () => {
  const r = { comando: 0.04, terminou: 0.8, perigoso: 0.24 }
  assert.equal(decidir(r, { frase: 'acho que vou comprar um tênis' }), 'ignorar')
})

// Regra 3: nenhuma ação com "Terminou a frase?" abaixo do limiar.
test('frase incompleta espera o resto', () => {
  assert.equal(decidir({ comando: 0.75, terminou: 0.08, perigoso: 0.04 }, { frase: 'clica no' }), 'esperar')
})

test('limiar exato não ignora nem espera', () => {
  const r = { comando: LIMIARES.comando, terminou: LIMIARES.terminou, perigoso: 0 }
  assert.equal(decidir(r, { frase: 'clica em entrar' }), 'executar')
})

test('comando completo e seguro executa', () => {
  assert.equal(decidir(comandoSeguro, { frase: 'clica em entrar', nomeElemento: 'Entrar' }), 'executar')
})

// Regra 1: basta o Jev OU a lista fixa marcar como perigoso.
test('Jev marcando perigoso pede confirmação, mesmo sem palavra da lista', () => {
  const r = { ...comandoSeguro, perigoso: 0.5 }
  assert.equal(decidir(r, { frase: 'fecha aí', nomeElemento: 'Concluir' }), 'confirmar')
})

test('palavra da lista na frase pede confirmação, mesmo com o Jev dizendo seguro', () => {
  assert.equal(decidir(comandoSeguro, { frase: 'clica em comprar agora' }), 'confirmar')
})

test('palavra da lista no nome do elemento pede confirmação', () => {
  assert.equal(decidir(comandoSeguro, { frase: 'clica no botão vermelho', nomeElemento: 'Excluir conta' }), 'confirmar')
})

test('resposta incompleta do Jev não vira ação', () => {
  assert.throws(() => decidir({ comando: 0.9, terminou: 0.9 }, { frase: 'clica em entrar' }), /incompleta/)
})

test('limiares vêm do arquivo de configuração', () => {
  const r = { comando: 0.5, terminou: 0.9, perigoso: 0 }
  assert.equal(decidir(r, { frase: 'clica em entrar' }), 'executar')
  assert.equal(decidir(r, { frase: 'clica em entrar' }, { ...LIMIARES, comando: 0.6 }), 'ignorar')
})

test('lista fixa pega os verbos da skill, as formas usuais e os sinônimos', () => {
  for (const frase of [
    'clica em comprar agora',
    'compra esse aí',
    'pagar a conta',
    'pague agora',
    'excluir conta',
    'manda a mensagem',
    'enviar o formulário',
    'apaga o arquivo',
    'publique o post',
    'transferir dinheiro',
    'confirma o pedido',
    'fecha o pedido',
    'finalizar compra',
  ])
    assert.ok(ehPerigoso(frase), frase)
})

test('lista fixa não pega palavras parecidas', () => {
  for (const frase of ['abre a página inicial', 'ofertas exclusivas', 'clica em entrar', 'rola para baixo', 'pagamentos'])
    assert.ok(!ehPerigoso(frase), frase)
})
