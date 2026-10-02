// Age na página pelo ID da última leitura (data-jev-id). Injetada como lerPagina: tudo precisa estar aqui dentro.
export function agir({ acao, id, direcao }) {
  if (acao === 'rolar') {
    scrollBy({ top: (direcao === 'cima' ? -1 : 1) * innerHeight * 0.8, behavior: 'instant' })
    return { ok: true }
  }
  if (acao !== 'clicar') return { ok: false, erro: 'acao-desconhecida' }

  const procurar = (raiz) => {
    const achado = raiz.querySelector(`[data-jev-id="${CSS.escape(id)}"]`)
    if (achado) return achado
    for (const el of raiz.querySelectorAll('*')) {
      let filha = el.shadowRoot
      if (!filha && el.tagName === 'IFRAME') {
        try {
          filha = el.contentDocument
        } catch {
          // iframe de outra origem: não foi lido, então não tem o ID.
        }
      }
      const dentro = filha && procurar(filha)
      if (dentro) return dentro
    }
    return null
  }

  const el = procurar(document)
  // A página pode ter mudado entre a leitura e a ação.
  if (!el?.isConnected) return { ok: false, erro: 'elemento-sumiu' }
  el.scrollIntoView({ block: 'center', behavior: 'instant' })
  el.click()
  return { ok: true }
}
