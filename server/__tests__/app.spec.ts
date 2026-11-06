// @vitest-environment node
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { buildServer } from '../app.ts'

const root = mkdtempSync(join(tmpdir(), 'static-root-'))
const html = { accept: 'text/html' }
const app = buildServer(root)

beforeAll(async () => {
  mkdirSync(join(root, 'assets'))
  writeFileSync(join(root, 'index.html'), '<div id="app"></div>')
  writeFileSync(join(root, 'assets', 'app.js'), 'console.log(1)')
  await app.ready()
})

afterAll(async () => {
  await app.close()
  rmSync(root, { recursive: true, force: true })
})

describe('static server', () => {
  it('serves the application entry point at the root', async () => {
    const response = await app.inject({ url: '/', headers: html })

    expect(response.statusCode).toBe(200)
    expect(response.body).toContain('id="app"')
  })

  it('serves existing static assets', async () => {
    const response = await app.inject({ url: '/assets/app.js' })

    expect(response.statusCode).toBe(200)
    expect(response.body).toBe('console.log(1)')
  })

  it.each(['/42', '/42/settings', '/stock?tab=1'])(
    'falls back to the entry point for the route %s',
    async (url) => {
      const response = await app.inject({ url, headers: html })

      expect(response.statusCode).toBe(200)
      expect(response.headers['content-type']).toContain('text/html')
      expect(response.body).toContain('id="app"')
    },
  )

  it('returns 404 for a missing static asset', async () => {
    const asset = await app.inject({ url: '/assets/missing.js' })
    const navigation = await app.inject({ url: '/assets/missing.js', headers: html })

    expect(asset.statusCode).toBe(404)
    expect(navigation.statusCode).toBe(404)
  })

  it('returns 404 for a non-navigation request to an unknown route', async () => {
    const response = await app.inject({ url: '/42' })

    expect(response.statusCode).toBe(404)
  })
})
