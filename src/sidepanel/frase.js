import { LIMIARES } from '../config/limiares.js'
import { normalizar } from '../rules/texto.js'

// Fim da frase (POC 001, estratégia c do E2): depois de pausaMs sem o texto mudar, a frase vai ao Jev; se ele disser
// que não terminou, espera mais fala por até esperaMaxMs. Sem I/O: o relógio vem de fora, para o teste controlar.
// agendar(fn, ms) devolve uma função que cancela o agendamento.
export function criarFrase({ agendar, enviar, terminar, limiares = LIMIARES }) {
  let texto = ''
  let estado = 'ouvindo'
  let cancelar = () => {}
  const reagendar = (fn, ms) => {
    cancelar()
    cancelar = agendar(fn, ms)
  }
  const fim = (motivo) => {
    cancelar()
    estado = 'terminado'
    terminar(motivo, texto)
  }

  return {
    get estado() {
      return estado
    },
    // Cada resultado do reconhecimento. A API repete o mesmo parcial durante a pausa: só mudança de texto conta.
    texto(novo) {
      novo = novo.trim()
      if (estado === 'terminado' || !novo || novo === texto) return
      texto = novo
      estado = 'ouvindo'
      reagendar(() => {
        estado = 'pensando'
        enviar(texto)
      }, limiares.pausaMs)
    },
    // Decisão das regras para a frase enviada.
    resposta(frase, decisao) {
      // Chegou fala nova enquanto o Jev respondia: o timer novo manda a frase completa.
      if (estado === 'terminado' || frase !== texto) return
      if (decisao !== 'esperar') return fim(decisao)
      estado = 'esperando'
      reagendar(() => fim('descartada'), limiares.esperaMaxMs)
    },
    // O reconhecimento terminou sem nenhuma fala.
    fimDaFala() {
      if (estado !== 'terminado' && !texto) fim('sem fala')
    },
    parar() {
      if (estado !== 'terminado') fim('cancelada')
    },
  }
}

// Confirmação falada de ação perigosa (skill seguranca-acoes-voz, regra 1): só "sim" executa; outra resposta ou
// confirmacaoMs de silêncio cancela.
export function criarConfirmacao({ agendar, concluir, limiares = LIMIARES }) {
  let texto = ''
  let feito = false
  const fim = (resultado) => {
    if (feito) return
    feito = true
    cancelar()
    concluir(resultado)
  }
  const cancelar = agendar(() => fim('silencio'), limiares.confirmacaoMs)

  return {
    texto(novo) {
      texto = novo.trim()
    },
    fimDaFala() {
      if (!texto) return fim('silencio')
      fim(/\bsim\b/.test(normalizar(texto)) ? 'sim' : 'nao')
    },
  }
}
