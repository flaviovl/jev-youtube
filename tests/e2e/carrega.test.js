import { test } from 'node:test'
import assert from 'node:assert/strict'
import { abrirComExtensao } from './chromium.js'

test('a extensão carrega no Chromium sem erro de manifest nem de execução', async () => {
  const ctx = await abrirComExtensao()
  try {
    const pagina = await ctx.newPage()
    await pagina.goto('chrome://extensions')
    const extensoes = await pagina.evaluate(() => new Promise((ok) => chrome.developerPrivate.getExtensionsInfo(ok)))
    const nossa = extensoes.find((e) => e.name === 'Jev: navegador por voz')
    assert.ok(nossa, 'extensão não carregou')
    assert.equal(nossa.state, 'ENABLED')
    assert.deepEqual([...nossa.manifestErrors, ...nossa.runtimeErrors, ...nossa.installWarnings], [])
  } finally {
    await ctx.close()
  }
})
