// Relógio falso para máquinas de estado com agendar(fn, ms) → cancelar().
export function criarRelogio() {
  let agora = 0
  const tarefas = []
  return {
    agendar(fn, ms) {
      const tarefa = { em: agora + ms, fn, ativa: true }
      tarefas.push(tarefa)
      return () => (tarefa.ativa = false)
    },
    avancar(ms) {
      const alvo = agora + ms
      for (;;) {
        const proxima = tarefas.filter((t) => t.ativa && t.em <= alvo).sort((a, b) => a.em - b.em)[0]
        if (!proxima) break
        agora = proxima.em
        proxima.ativa = false
        proxima.fn()
      }
      agora = alvo
    },
  }
}
