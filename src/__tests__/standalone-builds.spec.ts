import { mkdtempSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import { build } from 'vite'

const outDirs: string[] = []

async function buildChunks(moduleName: string) {
  const outDir = mkdtempSync(join(tmpdir(), `build-${moduleName || 'default'}-`))
  outDirs.push(outDir)
  const previous = process.env.VITE_APP_MODULE
  process.env.VITE_APP_MODULE = moduleName
  try {
    await build({ logLevel: 'silent', build: { outDir, emptyOutDir: true } })
  } finally {
    if (previous === undefined) delete process.env.VITE_APP_MODULE
    else process.env.VITE_APP_MODULE = previous
  }
  return readdirSync(join(outDir, 'assets')).filter((file) => file.endsWith('.js'))
}

afterAll(() => outDirs.forEach((dir) => rmSync(dir, { recursive: true, force: true })))

describe('standalone builds', () => {
  it('builds Refill without the Stock pages', async () => {
    const chunks = await buildChunks('refill')

    expect(chunks.some((file) => file.startsWith('RefillOverview'))).toBe(true)
    expect(chunks.some((file) => file.startsWith('Stock'))).toBe(false)
  })

  it('builds Stock without the Refill pages', async () => {
    const chunks = await buildChunks('stock')

    expect(chunks.some((file) => file.startsWith('StockDirectory'))).toBe(true)
    expect(chunks.some((file) => file.startsWith('Refill'))).toBe(false)
  })

  it('builds the default app with both modules', async () => {
    const chunks = await buildChunks('')

    expect(chunks.some((file) => file.startsWith('StockDirectory'))).toBe(true)
    expect(chunks.some((file) => file.startsWith('RefillOverview'))).toBe(true)
  })
}, 60_000)
