import js from '@eslint/js'
import globals from 'globals'

export default [
  { ignores: ['_poc/', 'draft/', 'node_modules/', 'docs/'] },
  js.configs.recommended,
  {
    // Regra 4 da skill seguranca-acoes-voz: só os módulos de log escrevem no console, e eles filtram o conteúdo.
    rules: { 'no-console': 'error' },
  },
  { files: ['src/log.js', 'proxy/log.js'], rules: { 'no-console': 'off' } },
  { files: ['src/**/*.js'], languageOptions: { globals: { ...globals.browser, ...globals.webextensions } } },
  { files: ['proxy/**/*.js', 'scripts/**/*.js', 'tests/**/*.js', '*.config.js'], languageOptions: { globals: globals.node } },
  // O e2e roda trechos dentro do Chromium com page.evaluate, onde existem as APIs do navegador e da extensão.
  { files: ['tests/e2e/**/*.js'], languageOptions: { globals: { ...globals.browser, ...globals.webextensions } } },
]
