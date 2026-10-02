import { normalizar } from './texto.js'

// O Jev não devolve texto (POC 001, E4): site, direção e termo de busca saem da própria frase.

const SITES = [
  [/\byoutube\b/, 'https://www.youtube.com/'],
  [/\bgmail\b/, 'https://mail.google.com/'],
  [/\bgoogle\b/, 'https://www.google.com.br/'],
  [/\bwikipedia\b/, 'https://pt.wikipedia.org/'],
  [/\bg ?1\b|\bge um\b/, 'https://g1.globo.com/'],
  [/\bmercado ?livre\b/, 'https://www.mercadolivre.com.br/'],
  [/\bgithub\b/, 'https://github.com/'],
]

// "exemplo ponto com", "exemplo ponto com ponto br" ou "exemplo.com.br".
const DOMINIO = /\b([a-z0-9-]+)\s*(?:\.|ponto)\s*(com|org|net|gov|edu|br)\b(?:\s*(?:\.|ponto)\s*(br)\b)?/

export function site(frase) {
  const texto = normalizar(frase)
  const conhecido = SITES.find(([padrao]) => padrao.test(texto))
  if (conhecido) return conhecido[1]
  const dominio = texto.match(DOMINIO)
  if (!dominio) return null
  const [, nome, tld, br] = dominio
  return `https://${nome}.${tld}${br ? '.br' : ''}/`
}

export function direcao(frase) {
  const texto = normalizar(frase)
  if (/\b(baixo|desce|descer|desca)\b/.test(texto)) return 'baixo'
  if (/\b(cima|sobe|subir|suba)\b/.test(texto)) return 'cima'
  return null
}

const VERBO_BUSCA = /\b(pesquis|busc|procur)\w*\s+(?:por\s+|sobre\s+)?/

export function termoDeBusca(frase) {
  const texto = frase.trim()
  const achado = VERBO_BUSCA.exec(normalizar(texto))
  if (!achado) return null
  // A transcrição chega em forma composta (NFC), e normalizar mantém o comprimento dela: o índice vale no original.
  const termo = texto.slice(achado.index + achado[0].length).trim()
  return termo || null
}

export const urlDeBusca = (termo) => `https://www.google.com/search?q=${encodeURIComponent(termo)}`
