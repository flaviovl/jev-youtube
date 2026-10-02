// Único ponto de log (skill seguranca-acoes-voz, regra 4): só eventos, decisões, códigos de erro, probabilidades e
// tempos. Qualquer outro campo é descartado, para frase, nome de elemento ou URL nunca irem parar no console.
const ENUMS = {
  decisao: ['ignorar', 'esperar', 'confirmar', 'executar', 'descartada', 'cancelada', 'sem fala', 'erro'],
  intencao: ['abrir_site', 'clicar', 'rolar', 'voltar', 'buscar', 'nenhuma'],
  acao: ['abrir', 'clicar', 'rolar', 'voltar', 'buscar', 'nenhuma'],
  confirmacao: ['sim', 'nao', 'silencio'],
}
const NUMEROS = ['comando', 'terminou', 'perigoso', 'elementos', 'status']
// Código de erro tem hífen ("pagina-ilegivel"): uma palavra solta, que pode ser fala, não passa.
const CODIGO = /^[a-z]+(-[a-z]+)+$/

export function filtrar(dados = {}) {
  const saida = {}
  for (const [chave, valor] of Object.entries(dados)) {
    const numero = Number.isFinite(valor) && (chave.endsWith('Ms') || NUMEROS.includes(chave))
    if (numero || ENUMS[chave]?.includes(valor) || (chave === 'erro' && CODIGO.test(valor))) saida[chave] = valor
  }
  return saida
}

export function registrar(evento, dados) {
  if (!CODIGO.test(evento)) throw new Error('evento de log precisa ser um código, como "comando-decidido"')
  console.info('[jev]', evento, filtrar(dados))
}
