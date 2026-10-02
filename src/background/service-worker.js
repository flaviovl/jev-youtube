import { decidir } from '../rules/decidir.js'
import { lerPagina } from '../pagina/leitura.js'
import { registrar } from '../log.js'
import { executar } from './acoes.js'

// Frase → leitura da aba → Jev (pelo proxy local, que guarda a chave) → regras → ação (docs/arquitetura.md).
const PROXY = 'http://127.0.0.1:8787/jev'
const TEMPO_PROXY_MS = 3500

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {})

// Atalho "Falar": abre o painel (precisa ser chamado direto no gesto) e pede para ouvir. Se o painel acabou de abrir e
// ainda não recebe mensagens, ele lê o pedido guardado na sessão.
chrome.commands.onCommand.addListener((nome, aba) => {
  if (nome !== 'falar') return
  chrome.sidePanel.open({ windowId: aba.windowId }).catch(() => {})
  chrome.storage.session.set({ falarAoAbrir: true })
  chrome.runtime.sendMessage({ tipo: 'falar' }).catch(() => {})
})

chrome.runtime.onMessage.addListener((msg, remetente, responder) => {
  // Só páginas da própria extensão (o painel) mandam comandos; os scripts injetados nas abas não mandam mensagens.
  if (remetente.id !== chrome.runtime.id || !remetente.url?.startsWith(chrome.runtime.getURL(''))) return
  const tratar = { comando: () => comando(msg.frase, msg.abaId), executar: () => executarMedindo(msg.pendente) }[
    msg.tipo
  ]
  if (!tratar) return
  tratar().then(responder, (e) => responder({ decisao: 'erro', erro: e.codigo ?? 'falha-interna' }))
  return true
})

const falha = (codigo) => Object.assign(new Error(codigo), { codigo })

async function ler(abaId) {
  try {
    const [{ result }] = await chrome.scripting.executeScript({ target: { tabId: abaId }, func: lerPagina })
    if (result.tipoDocumento === 'application/pdf') throw falha('pagina-ilegivel')
    return result
  } catch (e) {
    if (e.codigo) throw e
    const msg = String(e.message)
    // Acesso ao site negado ou "ao clicar" nos detalhes da extensão.
    if (/must request permission|Cannot access contents/i.test(msg)) throw falha('sem-acesso-ao-site')
    // chrome://, Chrome Web Store e outras páginas onde o Chrome não deixa injetar.
    if (/Cannot access a chrome|cannot be scripted|chrome-extension:\/\/|Cannot access/i.test(msg))
      throw falha('pagina-ilegivel')
    throw falha('leitura-falhou')
  }
}

async function perguntarAoJev(frase, pagina) {
  let r
  try {
    r = await fetch(PROXY, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ frase, pagina: { url: pagina.url, titulo: pagina.titulo, elementos: pagina.elementos } }),
      signal: AbortSignal.timeout(TEMPO_PROXY_MS),
    })
  } catch {
    throw falha('jev-indisponivel')
  }
  const corpo = await r.json().catch(() => ({}))
  if (!r.ok || !corpo.respostas) throw falha(corpo.erro ?? 'jev-indisponivel')
  return corpo
}

async function comando(frase, abaId) {
  const t0 = performance.now()
  try {
    const pagina = await ler(abaId)
    const t1 = performance.now()
    const jev = await perguntarAoJev(frase, pagina)
    const t2 = performance.now()
    const { intencao, elemento, comando, terminou, perigoso } = jev.respostas
    const nomeElemento = pagina.elementos.find((e) => e.id === elemento.escolha)?.nome ?? ''
    const decisao = decidir({ comando, terminou, perigoso }, { frase, nomeElemento })
    const base = {
      decisao,
      intencao: intencao.escolha,
      elemento: { id: elemento.escolha, nome: nomeElemento },
      tempos: { leituraMs: Math.round(t1 - t0), jevMs: jev.ms, servidorMs: Math.round(t2 - t1) },
    }
    registrar('comando-decidido', { decisao, intencao: intencao.escolha, comando, terminou, perigoso, ...base.tempos })
    if (decisao !== 'executar' && decisao !== 'confirmar') return base
    // Nada executa aqui: o painel pede a execução só se a frase ainda for a atual (a pessoa pode ter continuado
    // falando) e, na ação perigosa, só depois do "sim".
    return { ...base, pendente: { abaId, intencao: intencao.escolha, elementoId: elemento.escolha, frase } }
  } catch (e) {
    registrar('comando-falhou', { erro: e.codigo ?? 'falha-interna' })
    throw e
  }
}

async function executarMedindo(plano) {
  const t = performance.now()
  const resultado = await executar(plano)
  const acaoMs = Math.round(performance.now() - t)
  registrar('acao-executada', { acao: resultado.acao, erro: resultado.erro, acaoMs })
  return { resultado, acaoMs }
}
