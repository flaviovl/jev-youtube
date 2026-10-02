import { filtrar } from '../src/log.js'

// O proxy registra com o mesmo filtro da extensão: nada de frase, URL ou conteúdo da página.
export function registrar(evento, dados) {
  console.log(JSON.stringify({ em: new Date().toISOString(), evento, ...filtrar(dados) }))
}
