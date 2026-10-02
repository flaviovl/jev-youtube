import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ESLint } from 'eslint'
import { filtrar, registrar } from '../src/log.js'

const evento = {
  frase: 'clica em entrar',
  nome: 'Entrar',
  url: 'https://exemplo.com/conta',
  elementos: 42,
  decisao: 'executar',
  intencao: 'clicar',
  comando: 0.86,
  jevMs: 307,
  erro: 'nossa',
}

// Regra 4 da skill: transcrição e conteúdo de página nunca vão para log.
test('o filtro deixa só decisões, probabilidades, contagens e tempos', () => {
  assert.deepEqual(filtrar(evento), { elementos: 42, decisao: 'executar', intencao: 'clicar', comando: 0.86, jevMs: 307 })
})

test('texto livre em campo de enum ou de erro não passa', () => {
  assert.deepEqual(filtrar({ decisao: 'clica em entrar', erro: 'sim', acao: 'compra tudo' }), {})
  assert.deepEqual(filtrar({ erro: 'pagina-ilegivel' }), { erro: 'pagina-ilegivel' })
})

test('registrar escreve só o que o filtro deixa', (t) => {
  const info = t.mock.method(console, 'info', () => {})
  registrar('comando-decidido', evento)
  const escrito = JSON.stringify(info.mock.calls[0].arguments)
  for (const conteudo of ['clica em entrar', 'Entrar', 'exemplo.com', 'nossa']) assert.ok(!escrito.includes(conteudo))
})

test('evento precisa ser um código, não uma frase', () => {
  assert.throws(() => registrar('clica em entrar', {}), /código/)
})

test('o lint barra console fora dos módulos de log', async () => {
  const eslint = new ESLint()
  const [fora] = await eslint.lintText("console.log('frase')\n", { filePath: 'src/background/qualquer.js' })
  assert.ok(fora.messages.some((m) => m.ruleId === 'no-console'))
  const [dentro] = await eslint.lintText("console.info('x')\n", { filePath: 'src/log.js' })
  assert.ok(!dentro.messages.some((m) => m.ruleId === 'no-console'))
})
