import { test } from 'node:test'
import assert from 'node:assert/strict'
import { site, direcao, termoDeBusca, urlDeBusca } from '../src/rules/argumento.js'

test('sites da lista fixa', () => {
  assert.equal(site('abre o youtube'), 'https://www.youtube.com/')
  assert.equal(site('Abra o YouTube'), 'https://www.youtube.com/')
  assert.equal(site('abre o google'), 'https://www.google.com.br/')
  assert.equal(site('abre a wikipédia'), 'https://pt.wikipedia.org/')
  assert.equal(site('Abra o G1'), 'https://g1.globo.com/')
  assert.equal(site('abre o mercado livre'), 'https://www.mercadolivre.com.br/')
  assert.equal(site('Abra o MercadoLivre'), 'https://www.mercadolivre.com.br/')
  assert.equal(site('abre o github'), 'https://github.com/')
  assert.equal(site('abre o gmail'), 'https://mail.google.com/')
})

test('domínio falado ou escrito', () => {
  assert.equal(site('abre exemplo ponto com'), 'https://exemplo.com/')
  assert.equal(site('abre exemplo ponto com ponto br'), 'https://exemplo.com.br/')
  assert.equal(site('abre exemplo.org'), 'https://exemplo.org/')
})

test('site desconhecido', () => {
  assert.equal(site('abre aquele site'), null)
})

test('direção da rolagem', () => {
  assert.equal(direcao('rola para baixo'), 'baixo')
  assert.equal(direcao('desce a página'), 'baixo')
  assert.equal(direcao('rola pra cima'), 'cima')
  assert.equal(direcao('sobe'), 'cima')
  assert.equal(direcao('rola'), null)
})

test('termo de busca é o resto da frase depois do verbo', () => {
  assert.equal(termoDeBusca('pesquisa receita de bolo'), 'receita de bolo')
  assert.equal(termoDeBusca('busca por tênis de corrida'), 'tênis de corrida')
  assert.equal(termoDeBusca('procure sobre a Copa'), 'a Copa')
  assert.equal(termoDeBusca('pesquisa'), null)
  assert.equal(termoDeBusca('clica em entrar'), null)
  assert.equal(urlDeBusca('receita de bolo'), 'https://www.google.com/search?q=receita%20de%20bolo')
})
