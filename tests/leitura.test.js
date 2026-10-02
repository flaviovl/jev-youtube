import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { chromium } from 'playwright'
import { lerPagina } from '../src/pagina/leitura.js'
import { agir } from '../src/pagina/agir.js'

// Roda no Chromium de verdade: sem layout (jsdom), todo elemento pareceria oculto e o teste de vazamento passaria vazio.
const FIXTURE = new URL('./fixtures/pagina-teste.html', import.meta.url).href
const PLANTADOS = [
  'usuario-plantado-8841',
  'SENHA-PLANTADA-7391',
  '4111 1111 1111 1111',
  'INPUT-PLANTADO-BUSCA',
  'TEXTO-PLANTADO-TEXTAREA',
  'CONTEUDO-PLANTADO-EDITAVEL',
  'OPCAO-PLANTADA-SELECIONADA',
  'TOKEN-PLANTADO-URL',
  'LINK-PLANTADO-EDITAVEL',
  'TITULO-PLANTADO-EDITAVEL',
  'ROTULO-PLANTADO-EDITAVEL',
  'segredo',
]

let navegador, pagina, leitura
before(async () => {
  navegador = await chromium.launch()
  pagina = await navegador.newPage({ viewport: { width: 1280, height: 720 } })
  await pagina.goto(FIXTURE)
  leitura = await pagina.evaluate(lerPagina)
})
after(() => navegador?.close())

const porNome = (nome) => leitura.elementos.filter((e) => e.nome === nome)

// Regra 2 da skill: nada digitado ou escolhido sai do navegador (CA-03).
test('nenhum valor plantado aparece na leitura', () => {
  const texto = JSON.stringify(leitura).toLowerCase()
  for (const valor of PLANTADOS) assert.ok(!texto.includes(valor.toLowerCase()), `vazou ${valor}`)
})

test('senha e cartão vão só com tipo e rótulo', () => {
  const [senha] = porNome('Senha')
  const [cartao] = porNome('Número do cartão')
  assert.deepEqual([senha.tipo, cartao.tipo], ['password', 'cartao'])
})

test('destino de link sem query nem hash', () => {
  assert.equal(porNome('Busca avançada')[0].destino, '/busca')
})

test('no máximo 100 elementos, os da tela primeiro', () => {
  assert.equal(leitura.elementos.length, 100)
  const primeiroFora = leitura.elementos.findIndex((e) => !e.noViewport)
  assert.ok(primeiroFora > 0)
  assert.ok(leitura.elementos.slice(primeiroFora).every((e) => !e.noViewport))
})

test('lê shadow root aberto e iframe da mesma origem, e deixa os ocultos de fora', () => {
  assert.equal(porNome('Botão na sombra').length, 1)
  assert.equal(porNome('Comentar no quadro').length, 1)
  for (const nome of ['Oculto display', 'Oculto hidden', 'Oculto visibility', 'Oculto aria', 'Oculto tamanho zero'])
    assert.equal(porNome(nome).length, 0, nome)
})

test('o mesmo nome, papel e destino entra uma vez só', () => {
  assert.equal(porNome('Início').length, 1)
})

test('leitura em menos de 200 ms', () => {
  assert.ok(leitura.ms < 200, `${leitura.ms} ms`)
})

test('clica pelo ID da leitura, inclusive dentro de shadow root e iframe', async () => {
  for (const nome of ['Entrar', 'Botão na sombra']) {
    const { id } = porNome(nome)[0]
    assert.deepEqual(await pagina.evaluate(agir, { acao: 'clicar', id }), { ok: true })
    assert.match(await pagina.textContent('#status'), new RegExp(`Clicou em: ${nome}`))
  }
  const { id } = porNome('Comentar no quadro')[0]
  const quadro = pagina.frames().find((f) => f.parentFrame())
  await quadro.evaluate(() => {
    window.clicou = false
    document.querySelector('button').addEventListener('click', () => (window.clicou = true))
  })
  await pagina.evaluate(agir, { acao: 'clicar', id })
  assert.equal(await quadro.evaluate(() => window.clicou), true)
})

test('rola para baixo e para cima', async () => {
  await pagina.evaluate(() => scrollTo(0, 0))
  await pagina.evaluate(agir, { acao: 'rolar', direcao: 'baixo' })
  const desceu = await pagina.evaluate(() => scrollY)
  assert.ok(desceu > 0)
  await pagina.evaluate(agir, { acao: 'rolar', direcao: 'cima' })
  assert.ok((await pagina.evaluate(() => scrollY)) < desceu)
})

test('ID que não existe mais não clica nada', async () => {
  assert.deepEqual(await pagina.evaluate(agir, { acao: 'clicar', id: 'j999' }), { ok: false, erro: 'elemento-sumiu' })
})
