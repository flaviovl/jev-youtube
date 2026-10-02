import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { criarServidor } from '../proxy/server.js'

// O Jev é a dependência externa: um servidor falso no lugar do OpenRouter. O proxy é o código sob teste.
const ID = 'abcdefghijklmnopabcdefghijklmnop'
const CHAVE = 'chave-de-teste'
const RESPOSTA_JEV = {
  answers: {
    intencao: { type: 'choice', choice: 'clicar', confidence: 1 },
    elemento: { type: 'choice', choice: 'j1', confidence: 0.93 },
    e_comando: { type: 'noul', noul: 0.86 },
    terminou: { type: 'noul', noul: 0.82 },
    perigoso: { type: 'noul', noul: 0.05 },
  },
}
const PEDIDO = {
  frase: 'clica em entrar',
  pagina: { url: 'https://exemplo.com/', titulo: 'Exemplo', elementos: [{ id: 'j1', tag: 'button', nome: 'Entrar' }] },
}

let jevFalso, proxy, urlProxy, atrasoMs, recebidos
const ouvir = (servidor) =>
  new Promise((ok) => servidor.listen(0, '127.0.0.1', () => ok(`http://127.0.0.1:${servidor.address().port}`)))

before(async () => {
  jevFalso = createServer(async (req, res) => {
    let corpo = ''
    for await (const parte of req) corpo += parte
    recebidos.push({ autorizacao: req.headers.authorization, corpo: JSON.parse(corpo) })
    setTimeout(() => res.end(JSON.stringify(RESPOSTA_JEV)), atrasoMs)
  })
  const urlJev = await ouvir(jevFalso)
  proxy = criarServidor({ chave: CHAVE, extensaoId: ID, modelo: 'typesafe/jev-1.13', jevUrl: urlJev, timeoutMs: 200 })
  urlProxy = await ouvir(proxy)
})
after(() => {
  proxy?.close()
  jevFalso?.close()
})

async function pedir(origem, corpo = PEDIDO) {
  atrasoMs ??= 0
  recebidos = []
  const headers = { 'content-type': 'application/json', ...(origem && { origin: origem }) }
  const r = await fetch(`${urlProxy}/jev`, { method: 'POST', headers, body: JSON.stringify(corpo) })
  return { status: r.status, corpo: await r.json() }
}

// CA-07: só a extensão usa o proxy.
test('pedido sem Origin é recusado e não chega ao Jev', async () => {
  const r = await pedir(null)
  assert.equal(r.status, 403)
  assert.equal(recebidos.length, 0)
})

test('pedido de uma página ou de outra extensão é recusado', async () => {
  assert.equal((await pedir('https://site-qualquer.com')).status, 403)
  assert.equal((await pedir('chrome-extension://outraextensaooutraextensaooutra')).status, 403)
  assert.equal(recebidos.length, 0)
})

test('pedido da extensão chega ao Jev com a chave e volta no contrato do spec', async () => {
  const r = await pedir(`chrome-extension://${ID}`)
  assert.equal(r.status, 200)
  assert.deepEqual(r.corpo.respostas, {
    intencao: { escolha: 'clicar', confianca: 1 },
    elemento: { escolha: 'j1', confianca: 0.93 },
    comando: 0.86,
    terminou: 0.82,
    perigoso: 0.05,
  })
  assert.equal(recebidos[0].autorizacao, `Bearer ${CHAVE}`)
  assert.equal(recebidos[0].corpo.state.frase, 'clica em entrar')
  assert.ok(recebidos[0].corpo.questions.elemento.criteria.j1.includes('"Entrar"'))
})

test('Jev lento vira 504 sem resposta inventada', async () => {
  atrasoMs = 500
  const r = await pedir(`chrome-extension://${ID}`)
  atrasoMs = 0
  assert.equal(r.status, 504)
  assert.deepEqual(r.corpo, { erro: 'jev-tempo-esgotado' })
})

test('pedido fora do formato é recusado', async () => {
  const r = await pedir(`chrome-extension://${ID}`, { frase: 'x'.repeat(301), pagina: PEDIDO.pagina })
  assert.equal(r.status, 400)
})

test('o proxy não registra frase nem conteúdo da página', async (t) => {
  const log = t.mock.method(console, 'log', () => {})
  await pedir(`chrome-extension://${ID}`)
  const escrito = JSON.stringify(log.mock.calls)
  for (const conteudo of ['clica em entrar', 'Entrar', 'exemplo.com']) assert.ok(!escrito.includes(conteudo))
})
