// Único lugar dos limiares (skill seguranca-acoes-voz, regra 3). Valores iniciais medidos na POC 001 (E4 e E5);
// a calibração com dados de uso fica para outro item.
export const LIMIARES = Object.freeze({
  // "É comando?" abaixo disso: conversa, ignorar. Na POC, conversas foram até 0,16 e comandos a partir de 0,42.
  comando: 0.3,
  // "Terminou a frase?" abaixo disso: esperar o resto.
  terminou: 0.5,
  // "É perigoso?" a partir disso: pedir confirmação. Na POC, "manda a mensagem" ficou em 0,50.
  perigoso: 0.35,
  // Silêncio, sem o texto mudar, antes de mandar a frase ao Jev (estratégia c do E2).
  pausaMs: 700,
  // Espera por mais fala depois de "não terminou"; depois disso a frase é descartada.
  esperaMaxMs: 3000,
  // Espera pelo "sim" de uma ação perigosa; depois disso a ação é cancelada.
  confirmacaoMs: 5000,
})
