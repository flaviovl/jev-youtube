// Proxy local: o único lugar com a chave do OpenRouter (spec 002, seção 4.1). Escuta só em 127.0.0.1 e só atende a
// extensão: página nenhuma consegue falsificar o cabeçalho Origin, então um site aberto não gasta a chave.
// Uso: npm run proxy (lê o .env).
import { createServer } from 'node:http'
import { pathToFileURL } from 'node:url'
import { perguntar, URL_JEV } from './jev.js'
import { avisar, registrar } from './log.js'

const MAX_CORPO = 256 * 1024

export function criarServidor({ chave, extensaoId, modelo, jevUrl = URL_JEV, timeoutMs = 3000 }) {
  const origem = `chrome-extension://${extensaoId}`
  return createServer(async (req, res) => {
    const responder = (status, obj) => {
      res.writeHead(status, { 'content-type': 'application/json' })
      res.end(JSON.stringify(obj))
    }
    if (req.headers.origin !== origem) {
      registrar('pedido-recusado', { status: 403 })
      return responder(403, { erro: 'origem-recusada' })
    }
    if (req.method !== 'POST' || req.url !== '/jev') return responder(404, { erro: 'rota-inexistente' })

    let corpo = ''
    for await (const parte of req) {
      corpo += parte
      if (corpo.length > MAX_CORPO) return responder(413, { erro: 'pedido-grande-demais' })
    }
    let frase, pagina
    try {
      ;({ frase, pagina } = JSON.parse(corpo))
    } catch {
      return responder(400, { erro: 'pedido-invalido' })
    }
    const valido =
      typeof frase === 'string' && frase.length <= 300 && Array.isArray(pagina?.elementos) && pagina.elementos.length <= 100
    if (!valido) return responder(400, { erro: 'pedido-invalido' })

    try {
      const r = await perguntar({ url: jevUrl, chave, modelo, frase, pagina, timeoutMs })
      registrar('jev-respondeu', { status: r.status, jevMs: r.ms, elementos: pagina.elementos.length })
      if (!r.respostas) return responder(502, { erro: 'jev-falhou' })
      responder(200, { ms: r.ms, respostas: r.respostas })
    } catch (e) {
      const tempo = e.name === 'TimeoutError'
      registrar('jev-erro', { erro: tempo ? 'jev-tempo-esgotado' : 'jev-indisponivel' })
      responder(tempo ? 504 : 502, { erro: tempo ? 'jev-tempo-esgotado' : 'jev-indisponivel' })
    }
  })
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { OPENROUTER_API_KEY: chave, EXTENSAO_ID: extensaoId, JEV_MODELO: modelo, PORTA = '8787' } = process.env
  if (!chave || !extensaoId || !modelo) {
    avisar('Preencha OPENROUTER_API_KEY, EXTENSAO_ID e JEV_MODELO no .env (veja .env.example).')
    process.exit(1)
  }
  criarServidor({ chave, extensaoId, modelo }).listen(Number(PORTA), '127.0.0.1', () =>
    avisar(`Proxy do Jev em http://127.0.0.1:${PORTA}, só para chrome-extension://${extensaoId}.`),
  )
}
