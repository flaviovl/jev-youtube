// Lê a página aberta: até 100 elementos acionáveis, sem nenhum valor digitado ou escolhido (skill
// seguranca-acoes-voz, regra 2). Regras do E3 da POC 001.
// É injetada na aba por chrome.scripting.executeScript({ func }), que serializa só o corpo da função: tudo o que ela
// usa precisa estar aqui dentro.
export function lerPagina() {
  const LIMITE = 100
  const SELETOR = [
    'a[href]',
    'button',
    'input:not([type=hidden])',
    'select',
    'textarea',
    'summary',
    '[onclick]',
    '[tabindex]:not([tabindex^="-"])',
    '[contenteditable]:not([contenteditable=false])',
    ...['button', 'link', 'tab', 'menuitem', 'checkbox', 'radio', 'switch', 'option'].map((r) => `[role=${r}]`),
  ].join(',')
  // Texto dentro destes elementos é o que a pessoa digitou ou escolheu: nunca sai do navegador.
  const SEM_TEXTO = 'textarea, select, option, script, style, noscript, [contenteditable]:not([contenteditable=false])'
  const PAPEL_IMPLICITO = { A: 'link', BUTTON: 'button', SUMMARY: 'button', SELECT: 'combobox', TEXTAREA: 'textbox' }

  const t0 = performance.now()
  const limpar = (s) => (s ?? '').replace(/\s+/g, ' ').trim()

  // Documento, shadow roots abertos e iframes da mesma origem, com o deslocamento do iframe na tela.
  function raizes() {
    const saida = []
    const visitar = (raiz, dx, dy) => {
      saida.push({ raiz, dx, dy })
      for (const el of raiz.querySelectorAll('*')) {
        if (el.shadowRoot) visitar(el.shadowRoot, dx, dy)
        if (el.tagName !== 'IFRAME') continue
        let doc = null
        try {
          doc = el.contentDocument
        } catch {
          // iframe de outra origem: o navegador não deixa ler.
        }
        if (!doc) continue
        const r = el.getBoundingClientRect()
        visitar(doc, dx + r.left, dy + r.top)
      }
    }
    visitar(document, 0, 0)
    return saida
  }

  function visivel(el) {
    if (el.closest('[aria-hidden="true"]')) return false
    if (!el.checkVisibility({ checkVisibilityCSS: true, visibilityProperty: true })) return false
    const r = el.getBoundingClientRect()
    return r.width > 0 && r.height > 0
  }

  function textoSeguro(el) {
    if (el.matches('input, ' + SEM_TEXTO)) return ''
    const w = el.ownerDocument.createTreeWalker(el, NodeFilter.SHOW_TEXT)
    let s = ''
    for (let n = w.nextNode(); n && s.length < 200; n = w.nextNode())
      if (!n.parentElement?.closest(SEM_TEXTO)) s += ' ' + n.nodeValue
    return s
  }

  function nomeAcessivel(el) {
    const aria = limpar(el.getAttribute('aria-label'))
    if (aria) return aria
    const ids = el.getAttribute('aria-labelledby')
    if (ids) {
      const raiz = el.getRootNode()
      const t = limpar(ids.split(/\s+/).map((id) => textoSeguro(raiz.getElementById?.(id) ?? el)).join(' '))
      if (t) return t
    }
    if (el.labels?.length) {
      const t = limpar(Array.from(el.labels, textoSeguro).join(' '))
      if (t) return t
    }
    // Em submit, button e reset, o value é o rótulo do botão, não conteúdo digitado.
    if (el.tagName === 'INPUT' && ['submit', 'button', 'reset'].includes(el.type) && limpar(el.value))
      return limpar(el.value)
    const t = limpar(textoSeguro(el))
    if (t) return t
    return limpar(
      el.getAttribute('title') || el.querySelector('img[alt]')?.alt || el.getAttribute('alt') || el.getAttribute('placeholder'),
    )
  }

  function tipo(el) {
    if (el.tagName !== 'INPUT') return null
    // Campo de cartão vai só como "cartao" e o rótulo; o tipo text esconderia que é sensível.
    if (/(^|\s)cc-/.test(el.getAttribute('autocomplete') ?? '')) return 'cartao'
    return el.type
  }

  function destino(el) {
    if (typeof el.href !== 'string' || !el.href) return null
    try {
      const u = new URL(el.href)
      // Só host e caminho: query e hash podem carregar token ou e-mail.
      return u.host === location.host ? u.pathname : u.host + u.pathname
    } catch {
      return null
    }
  }

  const lista = raizes()
  for (const { raiz } of lista) raiz.querySelectorAll('[data-jev-id]').forEach((el) => el.removeAttribute('data-jev-id'))

  const vistos = new Set()
  const visiveis = []
  for (const { raiz, dx, dy } of lista)
    for (const el of raiz.querySelectorAll(SELETOR)) {
      if (vistos.has(el)) continue
      vistos.add(el)
      // Dentro de um campo editável tudo é conteúdo da pessoa (um link digitado num rascunho, por exemplo): só o campo
      // entra, com o rótulo dele.
      if (el.parentElement?.closest('[contenteditable]:not([contenteditable=false])')) continue
      if (!visivel(el)) continue
      const r = el.getBoundingClientRect()
      const top = r.top + dy
      const left = r.left + dx
      const noViewport = top + r.height > 0 && left + r.width > 0 && top < innerHeight && left < innerWidth
      const distancia = noViewport
        ? 0
        : top >= innerHeight
          ? top - innerHeight
          : top + r.height <= 0
            ? -(top + r.height)
            : Math.abs(left)
      visiveis.push({ el, noViewport, distancia })
    }

  // Primeiro o que está na tela, em ordem do DOM; depois o resto, do mais perto ao mais longe.
  const ordenados = [
    ...visiveis.filter((c) => c.noViewport),
    ...visiveis.filter((c) => !c.noViewport).sort((a, b) => a.distancia - b.distancia),
  ]

  const elementos = []
  const chaves = new Set()
  for (const { el, noViewport } of ordenados) {
    if (elementos.length === LIMITE) break
    const item = {
      tag: el.tagName.toLowerCase(),
      role: el.getAttribute('role') ?? null,
      tipo: tipo(el),
      nome: nomeAcessivel(el).slice(0, 80),
      destino: destino(el),
      noViewport,
    }
    // O mesmo nome, papel e destino aparece uma vez só: libera vagas e tira a ambiguidade (POC 001, E3).
    const chave = [item.role ?? PAPEL_IMPLICITO[el.tagName] ?? item.tag, item.nome, item.destino].join('|')
    if (item.nome && chaves.has(chave)) continue
    chaves.add(chave)
    const id = `j${elementos.length + 1}`
    el.setAttribute('data-jev-id', id)
    elementos.push({ id, ...item })
  }

  return {
    url: location.origin + location.pathname,
    // O visualizador de PDF fica fora do DOM: o service worker usa o tipo para avisar que não lê a página.
    tipoDocumento: document.contentType,
    titulo: document.title.slice(0, 80),
    ms: Math.round(performance.now() - t0),
    elementos,
  }
}
