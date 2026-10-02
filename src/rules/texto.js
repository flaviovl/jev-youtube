// Minúsculas e sem acento, para comparar frases transcritas com as listas fixas.
export const normalizar = (texto) =>
  texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
