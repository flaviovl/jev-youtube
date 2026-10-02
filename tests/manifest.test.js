import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const manifest = JSON.parse(await readFile(new URL('../src/manifest.json', import.meta.url), 'utf8'))

test('manifest é MV3', () => {
  assert.equal(manifest.manifest_version, 3)
})

// Spec 4.5: o script da aba é injetado sob demanda; nenhum código fica rodando em toda página.
test('manifest não declara content script', () => {
  assert.equal(manifest.content_scripts, undefined)
})
