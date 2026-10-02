const NOMES = { granted: 'permitido', denied: 'negado', prompt: 'ainda não pedido' }
const estado = document.getElementById('estado')
const resultado = document.getElementById('resultado')

const permissao = await navigator.permissions.query({ name: 'microphone' })
const mostrar = () => (estado.textContent = NOMES[permissao.state] ?? permissao.state)
permissao.onchange = mostrar
mostrar()

document.getElementById('permitir').addEventListener('click', async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    stream.getTracks().forEach((t) => t.stop())
    resultado.textContent = 'Microfone permitido. Pode fechar esta aba e voltar ao painel.'
  } catch {
    resultado.textContent =
      'O Chrome não deu o microfone. Se você negou antes, libere em chrome://settings/content/microphone.'
  }
})
