import { criarFrase, criarConfirmacao } from './frase.js'
import { reconhecer, disponibilidadeLocal, instalarLocal } from './fala.js'
import { registrar } from '../log.js'

const $ = (id) => document.getElementById(id)
const janelaId = (await chrome.windows.getCurrent()).id
const agendar = (fn, ms) => {
  const t = setTimeout(fn, ms)
  return () => clearTimeout(t)
}

const ESTADOS = {
  ouvindo: 'Ouvindo…',
  pensando: 'Pensando…',
  esperando: 'Esperando o resto da frase…',
  confirmando: 'Confirma?',
  feito: 'Feito.',
  ignorar: 'Ignorado: não parece um comando.',
  descartada: 'Frase incompleta: descartada.',
  'sem fala': 'Não ouvi nada.',
  cancelada: 'Cancelado.',
  erro: 'Erro:',
}
const ERROS = {
  'pagina-ilegivel': 'não consigo ler esta página.',
  'sem-acesso-ao-site':
    'a extensão não tem acesso a este site. Em chrome://extensions, Detalhes do Jev, "Acesso ao site": Em todos os sites.',
  'leitura-falhou': 'a leitura da página falhou.',
  'jev-indisponivel': 'o Jev não respondeu. O proxy local está no ar (npm run proxy)?',
  'jev-tempo-esgotado': 'o Jev demorou demais.',
  'jev-falhou': 'o Jev devolveu uma resposta inválida.',
  'origem-recusada': 'o proxy recusou a extensão. Confira EXTENSAO_ID no .env.',
  'site-desconhecido': 'não sei qual site abrir.',
  'termo-ausente': 'faltou o que buscar.',
  'direcao-ausente': 'faltou a direção (para cima ou para baixo).',
  'elemento-ausente': 'não achei o elemento na página.',
  'elemento-sumiu': 'a página mudou antes do clique.',
  'sem-acao': 'entendi, mas não há ação para isso.',
  'not-allowed': 'sem permissão para o microfone.',
  'audio-capture': 'nenhum microfone encontrado.',
  network: 'a transcrição na nuvem falhou (rede).',
  'sem-api': 'este Chrome não tem reconhecimento de fala.',
  'falha-interna': 'falha interna da extensão.',
}
const ACOES = { abrir: 'Abri o site', buscar: 'Busquei', voltar: 'Voltei', rolar: 'Rolei a página', clicar: 'Cliquei em' }

let ocupado = false
const tempos = []

function mostrar(estado, detalhe = '') {
  $('estado').textContent = ESTADOS[estado] ?? estado
  $('detalhe').textContent = detalhe
}

function mostrarResultado(r) {
  if (r.resultado?.ok) return mostrar('feito', `${ACOES[r.resultado.acao]}${r.resultado.acao === 'clicar' ? ` "${r.elemento.nome}"` : ''}.`)
  mostrar('erro', ERROS[r.resultado?.erro ?? r.erro] ?? r.resultado?.erro ?? r.erro)
}

function liberar() {
  ocupado = false
  $('falar').disabled = false
}

const modoLocal = async () => (await chrome.storage.local.get('modo')).modo === 'local'

async function falar() {
  if (ocupado) return
  ocupado = true
  $('falar').disabled = true
  $('microfone').hidden = true
  $('frase').textContent = ''
  const [aba] = await chrome.tabs.query({ active: true, windowId: janelaId })
  const processLocally = await modoLocal()
  let ultimaMudanca = 0
  let ultimaResposta = null
  let erroDaFala = null
  let fala = null
  let aoTerminarFala
  const falaTerminou = new Promise((ok) => (aoTerminarFala = ok))

  const frase = criarFrase({
    agendar,
    enviar: async (texto) => {
      mostrar('pensando')
      let r
      try {
        r = await chrome.runtime.sendMessage({ tipo: 'comando', frase: texto, abaId: aba.id })
      } catch {
        r = { decisao: 'erro', erro: 'falha-interna' }
      }
      // Da última mudança do texto até a ação feita (POC 001: o speechend não dispara no modo contínuo).
      r.totalMs = Math.round(performance.now() - ultimaMudanca)
      ultimaResposta = r
      frase.resposta(texto, r.decisao)
      if (frase.estado === 'esperando') mostrar('esperando')
    },
    terminar: async (motivo) => {
      fala?.parar()
      const r = ultimaResposta
      if (motivo === 'executar') {
        mostrarResultado(r)
        if (r.resultado?.ok) tempos.push(r.totalMs)
        registrar('comando-concluido', { decisao: motivo, totalMs: r.totalMs, ...r.tempos })
        atualizarMetricas()
      } else if (motivo === 'confirmar') {
        await falaTerminou
        return confirmar(r, processLocally)
      } else if (motivo === 'erro') mostrarResultado(r)
      else if (erroDaFala && (motivo === 'cancelada' || motivo === 'sem fala')) mostrarErroDaFala(erroDaFala)
      else mostrar(motivo)
      liberar()
    },
  })

  mostrar('ouvindo')
  fala = reconhecer({ continuous: true, processLocally }, (nome, dados) => {
    if (nome === 'result') {
      const texto = dados.texto.trim()
      if (texto && texto !== $('frase').textContent) ultimaMudanca = performance.now()
      $('frase').textContent = texto
      frase.texto(texto)
    }
    if (nome === 'erro' && dados.erro !== 'no-speech' && dados.erro !== 'aborted') erroDaFala = dados.erro
    if (nome === 'end') {
      aoTerminarFala()
      if (erroDaFala && frase.estado !== 'terminado') return frase.parar()
      frase.fimDaFala()
    }
  })
}

function mostrarErroDaFala(erro) {
  mostrar('erro', ERROS[erro] ?? erro)
  if (erro === 'not-allowed') $('microfone').hidden = false
}

// Ação perigosa: só "sim" falado executa (skill seguranca-acoes-voz, regra 1).
function confirmar(r, processLocally) {
  const alvo = r.elemento.nome ? ` "${r.elemento.nome}"` : ''
  mostrar('confirmando', `${r.intencao === 'clicar' ? 'Clicar em' : 'Executar'}${alvo}? Diga "sim" ou "não".`)
  let fala = null
  const c = criarConfirmacao({
    agendar,
    concluir: async (resposta) => {
      fala?.parar()
      registrar('confirmacao-respondida', { confirmacao: resposta })
      if (resposta !== 'sim') {
        mostrar('cancelada')
        return liberar()
      }
      try {
        mostrarResultado({ ...r, ...(await chrome.runtime.sendMessage({ tipo: 'executar', pendente: r.pendente })) })
      } catch {
        mostrar('erro', ERROS['falha-interna'])
      }
      liberar()
    },
  })
  fala = reconhecer({ continuous: false, processLocally }, (nome, dados) => {
    if (nome === 'result') {
      $('frase').textContent = dados.texto
      c.texto(dados.texto)
    }
    if (nome === 'end') c.fimDaFala()
  })
}

function atualizarMetricas() {
  if (!tempos.length) return
  const ordenados = [...tempos].sort((a, b) => a - b)
  const p50 = ordenados[Math.ceil(ordenados.length / 2) - 1]
  $('metricas').textContent = `${tempos.length} ações · p50 de ${p50} ms da última palavra até a ação.`
}

// Modo da transcrição: nuvem (padrão) ou local, com o pacote de pt-BR baixado sob pedido.
async function mostrarModo() {
  const local = await modoLocal()
  document.querySelector(`input[name=modo][value=${local ? 'local' : 'nuvem'}]`).checked = true
  $('baixar').hidden = true
  $('modo-local').textContent = ''
  if (!local) return
  const estado = await disponibilidadeLocal()
  if (estado === 'available') return ($('modo-local').textContent = 'Pacote local de pt-BR pronto.')
  if (estado === 'unavailable') {
    await chrome.storage.local.set({ modo: 'nuvem' })
    $('modo-local').textContent = 'O modo local não está disponível neste Chrome; voltei para a nuvem.'
    return mostrarModo()
  }
  $('modo-local').textContent = estado === 'downloading' ? 'Baixando o pacote de pt-BR…' : 'Falta baixar o pacote de pt-BR.'
  $('baixar').hidden = estado !== 'downloadable'
}

for (const radio of document.querySelectorAll('input[name=modo]'))
  radio.addEventListener('change', async () => {
    await chrome.storage.local.set({ modo: radio.value })
    mostrarModo()
  })
$('baixar').addEventListener('click', async () => {
  $('modo-local').textContent = 'Baixando o pacote de pt-BR…'
  await instalarLocal().catch(() => {})
  mostrarModo()
})

$('falar').addEventListener('click', falar)
document.addEventListener('keydown', (e) => {
  if (e.code !== 'Space' || e.target.closest('button, input')) return
  e.preventDefault()
  falar()
})
$('permitir').addEventListener('click', () => chrome.tabs.create({ url: chrome.runtime.getURL('permissao/permissao.html') }))
$('copiar').addEventListener('click', () => navigator.clipboard.writeText(JSON.stringify({ totalMs: tempos })))

// Atalho da extensão: o service worker abre o painel e pede para ouvir.
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.tipo !== 'falar') return
  chrome.storage.session.remove('falarAoAbrir')
  falar()
})
if ((await chrome.storage.session.get('falarAoAbrir')).falarAoAbrir) {
  await chrome.storage.session.remove('falarAoAbrir')
  falar()
}
mostrarModo()
