import { normalizar } from './texto.js'

// Lista fixa de ações perigosas (skill seguranca-acoes-voz, regra 1): basta ela OU o Jev marcar.
// São formas verbais inteiras, e não prefixos: "pag" ou "exclu" pegariam "página" e "exclusivas".
// Além dos verbos da skill, entram sinônimos que o Jev deixou no limite em teste ("manda a mensagem").
const PERIGO = new RegExp(
  [
    '\\bcompr(ar|a|e|o|ou|ei)\\b',
    '\\bpag(ar|a|ue|o|ou|uei|amento)\\b',
    '\\bexclu(ir|a|i|o|iu)\\b',
    '\\b(envi|mand)(ar|a|e|o|ou|ei)\\b',
    '\\b(apag|delet)(ar|a|ue|e|o|ou)\\b',
    '\\b(public(ar|a|o|ou)|publique)\\b',
    '\\btransfer(ir|e|a|i|iu|encia)\\b',
    '\\b(confirm|fech|finaliz)\\w*\\s+(o\\s+|a\\s+)?(pedido|compra)\\b',
  ].join('|'),
)

export const ehPerigoso = (texto) => PERIGO.test(normalizar(texto ?? ''))
