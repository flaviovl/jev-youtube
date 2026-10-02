// Pedido ao Jev pela Decisions API do OpenRouter: o quiz do vision.md como perguntas tipadas (docs/arquitetura.md, Jev).
export const URL_JEV = 'https://openrouter.ai/api/alpha/decisions'

const INTENCOES = {
  abrir_site: 'Abrir um site pelo nome ou pelo endereço.',
  clicar: 'Clicar, apertar, entrar ou ativar algo que está na página aberta.',
  rolar: 'Rolar a página para cima ou para baixo.',
  voltar: 'Voltar para a página anterior.',
  buscar: 'Pesquisar ou buscar um termo.',
  nenhuma: 'A frase não pede nenhuma ação ao navegador.',
}

const descrever = (e) =>
  [e.tag, e.role && `role=${e.role}`, e.tipo && `tipo=${e.tipo}`, `"${e.nome}"`, e.destino && `→ ${e.destino}`]
    .filter(Boolean)
    .join(' ')

export function montarPedido(modelo, frase, pagina) {
  return {
    model: modelo,
    state: {
      contexto:
        'Frase transcrita da voz de uma pessoa diante do navegador. Pode estar incompleta ou ter erros de transcrição.',
      frase,
      pagina: { url: pagina.url, titulo: pagina.titulo },
    },
    questions: {
      intencao: { type: 'choice', instructions: 'Que ação no navegador a pessoa pediu com a frase?', criteria: INTENCOES },
      elemento: {
        type: 'choice',
        instructions:
          'Qual elemento da página aberta é o alvo da frase? Escolha "nenhum" se o pedido não é sobre um elemento ' +
          'desta página ou se a frase ainda não diz qual.',
        criteria: {
          ...Object.fromEntries(pagina.elementos.map((e) => [e.id, descrever(e)])),
          nenhum: 'Nenhum elemento desta página.',
        },
      },
      e_comando: {
        type: 'noul',
        instructions: 'A frase é um pedido para o navegador fazer algo agora?',
        criteria: {
          true: 'Pedido ou ordem ao navegador, mesmo que ainda incompleto (ex.: "aperta o play", "sobe a página").',
          false:
            'Conversa comum, comentário ou fala com outra pessoa, mesmo com verbos como abrir, clicar ou comprar ' +
            '(ex.: "que dia lindo", "amanhã eu abro a loja").',
        },
      },
      terminou: {
        type: 'noul',
        instructions: 'A frase já está completa, ou a pessoa ainda vai continuar falando?',
        criteria: {
          true: 'Completa: diz o que fazer e, quando precisa, sobre o quê (ex.: "aperta o play"). Conversa completa conta.',
          false: 'Incompleta: termina em artigo, preposição ou verbo sem o complemento (ex.: "aperta o", "desce até").',
        },
      },
      perigoso: {
        type: 'noul',
        instructions: 'Executar o pedido seria uma ação perigosa, difícil de desfazer?',
        criteria: {
          true: 'Comprar, pagar, excluir, enviar, publicar, transferir ou confirmar pedido.',
          false: 'Ação fácil de desfazer, ou a frase não pede ação nenhuma.',
        },
      },
    },
  }
}

// Resposta da Decisions API → contrato do spec (seção 4.3). Resposta fora do formato vira null.
export function mapearRespostas(a) {
  const escolha = (q) => q?.type === 'choice' && typeof q.choice === 'string' && { escolha: q.choice, confianca: q.confidence }
  const sim = (q) => (q?.type === 'noul' && Number.isFinite(q.noul) ? q.noul : null)
  const r = {
    intencao: escolha(a?.intencao),
    elemento: escolha(a?.elemento),
    comando: sim(a?.e_comando),
    terminou: sim(a?.terminou),
    perigoso: sim(a?.perigoso),
  }
  return Object.values(r).every((v) => v !== false && v !== null && v !== undefined) ? r : null
}

export async function perguntar({ url = URL_JEV, chave, modelo, frase, pagina, timeoutMs }) {
  const t0 = performance.now()
  const r = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${chave}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(montarPedido(modelo, frase, pagina)),
    signal: AbortSignal.timeout(timeoutMs),
  })
  const corpo = await r.json().catch(() => ({}))
  return { status: r.status, ms: Math.round(performance.now() - t0), respostas: r.ok ? mapearRespostas(corpo.answers) : null }
}
