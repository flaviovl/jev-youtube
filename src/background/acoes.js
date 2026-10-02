import { site, direcao, termoDeBusca, urlDeBusca } from '../rules/argumento.js'
import { agir } from '../pagina/agir.js'

const naAba = async (abaId, args) => {
  const [{ result }] = await chrome.scripting.executeScript({ target: { tabId: abaId }, func: agir, args: [args] })
  return result
}

// Executa a intenção na aba. O argumento (site, direção, termo) sai da frase, porque o Jev não devolve texto.
export async function executar({ abaId, intencao, elementoId, frase }) {
  switch (intencao) {
    case 'abrir_site': {
      const url = site(frase)
      if (!url) return { acao: 'abrir', ok: false, erro: 'site-desconhecido' }
      await chrome.tabs.update(abaId, { url })
      return { acao: 'abrir', ok: true }
    }
    case 'buscar': {
      const termo = termoDeBusca(frase)
      if (!termo) return { acao: 'buscar', ok: false, erro: 'termo-ausente' }
      await chrome.tabs.update(abaId, { url: urlDeBusca(termo) })
      return { acao: 'buscar', ok: true }
    }
    case 'voltar':
      try {
        await chrome.tabs.goBack(abaId)
      } catch {
        // O Chrome rejeita quando a aba não tem página anterior.
        return { acao: 'voltar', ok: false, erro: 'sem-pagina-anterior' }
      }
      return { acao: 'voltar', ok: true }
    case 'rolar': {
      const sentido = direcao(frase)
      if (!sentido) return { acao: 'rolar', ok: false, erro: 'direcao-ausente' }
      return { acao: 'rolar', ...(await naAba(abaId, { acao: 'rolar', direcao: sentido })) }
    }
    case 'clicar':
      if (!elementoId || elementoId === 'nenhum') return { acao: 'clicar', ok: false, erro: 'elemento-ausente' }
      return { acao: 'clicar', ...(await naAba(abaId, { acao: 'clicar', id: elementoId })) }
    default:
      return { acao: 'nenhuma', ok: false, erro: 'sem-acao' }
  }
}
