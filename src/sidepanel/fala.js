// Reconhecimento de fala do Chrome (Web Speech API), em pt-BR, na nuvem do Google ou no modo local.
const Ctor = self.SpeechRecognition || self.webkitSpeechRecognition
const PT_BR_LOCAL = { langs: ['pt-BR'], processLocally: true }

export function reconhecer({ continuous, processLocally }, emitir) {
  if (typeof Ctor !== 'function') {
    emitir('erro', { erro: 'sem-api' })
    emitir('end', {})
    return { parar() {} }
  }
  const r = new Ctor()
  r.lang = 'pt-BR'
  r.continuous = continuous
  r.interimResults = true
  r.maxAlternatives = 1
  if (processLocally) r.processLocally = true
  r.addEventListener('error', (e) => emitir('erro', { erro: e.error }))
  r.addEventListener('result', (e) => emitir('result', { texto: Array.from(e.results, (res) => res[0].transcript).join('') }))
  r.addEventListener('end', () => emitir('end', {}))
  r.start()
  return { parar: () => r.stop() }
}

// "available", "downloadable", "downloading" ou "unavailable".
export async function disponibilidadeLocal() {
  if (typeof Ctor?.available !== 'function') return 'unavailable'
  return Ctor.available(PT_BR_LOCAL)
}

export const instalarLocal = () => Ctor.install(PT_BR_LOCAL)
