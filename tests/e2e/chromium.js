import { chromium } from 'playwright'
import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const PASTA_EXTENSAO = fileURLToPath(new URL('../../src', import.meta.url))

// O Chrome de marca não aceita --load-extension desde a versão 137; o Chromium do Playwright aceita.
export async function abrirComExtensao() {
  return chromium.launchPersistentContext(await mkdtemp(join(tmpdir(), 'jev-e2e-')), {
    channel: 'chromium',
    headless: true,
    args: [`--disable-extensions-except=${PASTA_EXTENSAO}`, `--load-extension=${PASTA_EXTENSAO}`],
  })
}
