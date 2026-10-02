import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { abrirComExtensao } from './chromium.js'
import { criarServidor } from '../../proxy/server.js'

// Caminho inteiro sem voz: página do painel → service worker → leitura na aba → proxy de verdade → Jev falso → regras
// → ação. O Jev falso responde pela frase, como o Jev real respondeu na POC 001.
const PORTA_PROXY = 8787
const JEV = {
  'clica em entrar': { intencao: 'clicar', alvo: 'Entrar', comando: 0.86, terminou: 0.82, perigoso: 0.05 },
  'clica em comprar agora': { intencao: 'clicar', alvo: 'Comprar agora', comando: 0.81, terminou: 0.85, perigoso: 0.66 },
  'nossa que legal': { intencao: 'nenhuma', comando: 0.02, terminou: 0.76, perigoso: 0.02 },
  'rola para baixo': { intencao: 'rolar', comando: 0.91, terminou: 0.74, perigoso: 0.02 },
}

let ctx, painel, fixture, servidores, pedidosAoJev
const ouvir = (servidor, porta = 0) =>
  new Promise((ok, erro) => {
    servidor.once('error', erro)
    servidor.listen(porta, '127.0.0.1', () => ok(`http://127.0.0.1:${servidor.address().port}`))
  })

before(async () => {
  pedidosAoJev = 0
  const html = await readFile(new URL('../fixtures/pagina-teste.html', import.meta.url))
  const site = createServer((req, res) => res.writeHead(200, { 'content-type': 'text/html' }).end(html))
  const jevFalso = createServer(async (req, res) => {
    let corpo = ''
    for await (const parte of req) corpo += parte
    pedidosAoJev++
    const { state, questions } = JSON.parse(corpo)
    const r = JEV[state.frase]
    const alvo = Object.entries(questions.elemento.criteria).find(([, d]) => r.alvo && d.includes(`"${r.alvo}"`))
    res.end(
      JSON.stringify({
        answers: {
          intencao: { type: 'choice', choice: r.intencao, confidence: 1 },
          elemento: { type: 'choice', choice: alvo?.[0] ?? 'nenhum', confidence: 0.9 },
          e_comando: { type: 'noul', noul: r.comando },
          terminou: { type: 'noul', noul: r.terminou },
          perigoso: { type: 'noul', noul: r.perigoso },
        },
      }),
    )
  })
  fixture = `${await ouvir(site)}/pagina-teste.html`
  const urlJev = await ouvir(jevFalso)

  ctx = await abrirComExtensao()
  const sw = ctx.serviceWorkers()[0] ?? (await ctx.waitForEvent('serviceworker'))
  const extensaoId = new URL(sw.url()).host
  const proxy = criarServidor({ chave: 'chave-de-teste', extensaoId, modelo: 'jev-falso', jevUrl: urlJev })
  await ouvir(proxy, PORTA_PROXY).catch(() => assert.fail(`porta ${PORTA_PROXY} ocupada: pare o proxy local`))
  servidores = [site, jevFalso, proxy]

  painel = await ctx.newPage()
  await painel.goto(`chrome-extension://${extensaoId}/sidepanel/sidepanel.html`)
})
after(async () => {
  await ctx?.close()
  for (const s of servidores ?? []) s.close()
})

async function abrirAba(url) {
  const pagina = await ctx.newPage()
  await pagina.goto(url)
  // Sem a permissão "tabs", a URL de páginas chrome:// não aparece: a aba recém-aberta é a de maior ID.
  const abaId = await painel.evaluate(async () => Math.max(...(await chrome.tabs.query({})).map((t) => t.id)))
  return { pagina, abaId }
}
const mandar = (msg) => painel.evaluate((m) => chrome.runtime.sendMessage(m), msg)

test('"clica em entrar" clica de verdade no botão Entrar', async () => {
  const { pagina, abaId } = await abrirAba(fixture)
  const r = await mandar({ tipo: 'comando', frase: 'clica em entrar', abaId })
  assert.equal(r.decisao, 'executar')
  assert.deepEqual(r.resultado, { acao: 'clicar', ok: true })
  assert.match(await pagina.textContent('#status'), /Clicou em: Entrar/)
  await pagina.close()
})

test('ação perigosa pede confirmação e só executa com o pedido de execução', async () => {
  const { pagina, abaId } = await abrirAba(fixture)
  const r = await mandar({ tipo: 'comando', frase: 'clica em comprar agora', abaId })
  assert.equal(r.decisao, 'confirmar')
  assert.equal(r.resultado, undefined)
  assert.match(await pagina.textContent('#status'), /Nenhum clique ainda/)
  const e = await mandar({ tipo: 'executar', pendente: r.pendente })
  assert.deepEqual(e.resultado, { acao: 'clicar', ok: true })
  assert.match(await pagina.textContent('#status'), /Clicou em: Comprar agora/)
  await pagina.close()
})

test('conversa é ignorada e nada acontece na página', async () => {
  const { pagina, abaId } = await abrirAba(fixture)
  const r = await mandar({ tipo: 'comando', frase: 'nossa que legal', abaId })
  assert.equal(r.decisao, 'ignorar')
  assert.match(await pagina.textContent('#status'), /Nenhum clique ainda/)
  await pagina.close()
})

test('"rola para baixo" rola a página', async () => {
  const { pagina, abaId } = await abrirAba(fixture)
  const r = await mandar({ tipo: 'comando', frase: 'rola para baixo', abaId })
  assert.deepEqual(r.resultado, { acao: 'rolar', ok: true })
  assert.ok((await pagina.evaluate(() => scrollY)) > 0)
  await pagina.close()
})

// CA-09: página que a extensão não lê → aviso, e nada vai ao Jev.
test('página chrome:// avisa que não lê e não chama o Jev', async () => {
  const antes = pedidosAoJev
  const { pagina, abaId } = await abrirAba('chrome://version/')
  const r = await mandar({ tipo: 'comando', frase: 'clica em entrar', abaId })
  assert.deepEqual(r, { decisao: 'erro', erro: 'pagina-ilegivel' })
  assert.equal(pedidosAoJev, antes)
  await pagina.close()
})
