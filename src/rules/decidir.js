import { LIMIARES } from '../config/limiares.js'
import { ehPerigoso } from './perigo.js'

// Decide o que fazer com as respostas do quiz (skill seguranca-acoes-voz, regras 1 e 3).
// respostas: probabilidades de "sim" do Jev para comando, terminou e perigoso.
export function decidir(respostas, { frase, nomeElemento = '' }, limiares = LIMIARES) {
  const { comando, terminou, perigoso } = respostas
  // Resposta incompleta não pode virar ação: NaN em qualquer comparação cairia em "executar".
  if (![comando, terminou, perigoso].every(Number.isFinite)) throw new Error('resposta do Jev incompleta')
  if (comando < limiares.comando) return 'ignorar'
  if (terminou < limiares.terminou) return 'esperar'
  if (perigoso >= limiares.perigoso || ehPerigoso(frase) || ehPerigoso(nomeElemento)) return 'confirmar'
  return 'executar'
}
