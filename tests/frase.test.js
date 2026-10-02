import { test } from 'node:test'
import assert from 'node:assert/strict'
import { criarFrase, criarConfirmacao } from '../src/sidepanel/frase.js'
import { criarRelogio } from './relogio.js'

function montar() {
  const relogio = criarRelogio()
  const enviadas = []
  const fins = []
  const frase = criarFrase({
    agendar: relogio.agendar,
    enviar: (t) => enviadas.push(t),
    terminar: (motivo, t) => fins.push([motivo, t]),
  })
  return { relogio, enviadas, fins, frase }
}

test('frase completa vai ao Jev depois de 700 ms sem o texto mudar', () => {
  const { relogio, enviadas, fins, frase } = montar()
  frase.texto('clica')
  relogio.avancar(200)
  frase.texto('clica em entrar')
  relogio.avancar(699)
  assert.deepEqual(enviadas, [])
  relogio.avancar(1)
  assert.deepEqual(enviadas, ['clica em entrar'])
  frase.resposta('clica em entrar', 'executar')
  assert.deepEqual(fins, [['executar', 'clica em entrar']])
})

test('parcial repetido durante a pausa não adia o envio', () => {
  const { relogio, enviadas, frase } = montar()
  frase.texto('rola para baixo')
  relogio.avancar(500)
  frase.texto('rola para baixo ')
  relogio.avancar(200)
  assert.deepEqual(enviadas, ['rola para baixo'])
})

// Regra 3 da skill: frase incompleta não age; espera o resto.
test('pausa no meio: "não terminou" espera, e a fala retomada manda a frase inteira', () => {
  const { relogio, enviadas, fins, frase } = montar()
  frase.texto('clica em')
  relogio.avancar(700)
  frase.resposta('clica em', 'esperar')
  assert.equal(frase.estado, 'esperando')
  relogio.avancar(1000)
  frase.texto('clica em entrar')
  relogio.avancar(700)
  assert.deepEqual(enviadas, ['clica em', 'clica em entrar'])
  assert.deepEqual(fins, [])
})

test('sem mais fala, desiste 3 s depois do "não terminou"', () => {
  const { relogio, fins, frase } = montar()
  frase.texto('clica no')
  relogio.avancar(700)
  frase.resposta('clica no', 'esperar')
  relogio.avancar(2999)
  assert.deepEqual(fins, [])
  relogio.avancar(1)
  assert.deepEqual(fins, [['descartada', 'clica no']])
})

test('fala nova enquanto o Jev responde: a resposta velha é ignorada', () => {
  const { relogio, enviadas, fins, frase } = montar()
  frase.texto('clica em')
  relogio.avancar(700)
  frase.texto('clica em entrar')
  frase.resposta('clica em', 'executar')
  assert.deepEqual(fins, [])
  relogio.avancar(700)
  assert.deepEqual(enviadas, ['clica em', 'clica em entrar'])
})

test('reconhecimento termina sem fala', () => {
  const { fins, frase } = montar()
  frase.fimDaFala()
  assert.deepEqual(fins, [['sem fala', '']])
})

function confirmar() {
  const relogio = criarRelogio()
  const resultados = []
  const c = criarConfirmacao({ agendar: relogio.agendar, concluir: (r) => resultados.push(r) })
  return { relogio, resultados, c }
}

// Regra 1 da skill: ação perigosa só com "sim".
test('confirmação com "sim" executa', () => {
  const { resultados, c } = confirmar()
  c.texto('Sim')
  c.fimDaFala()
  assert.deepEqual(resultados, ['sim'])
})

test('confirmação com outra resposta cancela', () => {
  const { resultados, c } = confirmar()
  c.texto('não')
  c.fimDaFala()
  assert.deepEqual(resultados, ['nao'])
  const outra = confirmar()
  outra.c.texto('assim não')
  outra.c.fimDaFala()
  assert.deepEqual(outra.resultados, ['nao'])
})

test('confirmação em silêncio cancela depois de 5 s', () => {
  const { relogio, resultados } = confirmar()
  relogio.avancar(4999)
  assert.deepEqual(resultados, [])
  relogio.avancar(1)
  assert.deepEqual(resultados, ['silencio'])
})

test('"sim" junto com outra coisa não confirma', () => {
  for (const fala of ['não, sim', 'sim não', 'acho que sim, não, espera', 'não sei se sim', 'sim, pode']) {
    const { resultados, c } = confirmar()
    c.texto(fala)
    c.fimDaFala()
    assert.deepEqual(resultados, ['nao'], fala)
  }
  for (const fala of ['Sim.', 'sim sim']) {
    const { resultados, c } = confirmar()
    c.texto(fala)
    c.fimDaFala()
    assert.deepEqual(resultados, ['sim'], fala)
  }
})
