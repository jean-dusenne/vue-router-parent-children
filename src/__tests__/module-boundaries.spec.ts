// @vitest-environment node
import { readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { beforeAll, describe, expect, it } from 'vitest'
import { ESLint } from 'eslint'

// Negative tests of the lint: each forbidden import must be rejected by `boundaries/dependencies`,
// and each allowed import must pass. If these tests fail, the isolation of the modules is no longer guaranteed.

const root = fileURLToPath(new URL('../../', import.meta.url))
const modules = readdirSync(`${root}src/modules`, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)

const RULE = 'boundaries/dependencies'

let eslint: ESLint

beforeAll(() => {
  eslint = new ESLint({ cwd: root })
})

// Lints `code` as if it was the file `path` (relative to the project root, the file does not need to exist).
async function violations(path: string, code: string) {
  const [result] = await eslint.lintText(code, { filePath: `${root}${path}` })
  return result!.messages.filter((message) => message.ruleId === RULE)
}

const probe = {
  module: (name: string) => `src/modules/${name}/__lint-probe__.ts`,
  shell: 'src/router/__lint-probe__.ts',
  shared: 'src/shared/__lint-probe__.ts',
}

describe('module boundaries (lint)', () => {
  it('has at least two modules to test the isolation between modules', () => {
    expect(modules.length).toBeGreaterThanOrEqual(2)
  })

  describe.each(modules.flatMap((from) => modules.filter((to) => to !== from).map((to) => [from, to] as const)))(
    'module %s must not import module %s',
    (from, to) => {
      it('through the public entry point (alias)', async () => {
        expect(await violations(probe.module(from), `import '@/modules/${to}'`)).not.toHaveLength(0)
      })

      it('through an internal file (alias)', async () => {
        expect(await violations(probe.module(from), `import '@/modules/${to}/router/routes'`)).not.toHaveLength(0)
      })

      it('through a relative path', async () => {
        expect(await violations(probe.module(from), `import '../${to}/router/routes'`)).not.toHaveLength(0)
      })

      it('through a dynamic import (lazy route)', async () => {
        expect(
          await violations(probe.module(from), `export const view = () => import('@/modules/${to}/router/routes')`),
        ).not.toHaveLength(0)
      })
    },
  )

  describe.each(modules)('module %s', (name) => {
    it('must not import the application shell', async () => {
      expect(await violations(probe.module(name), `import router from '@/router'`)).not.toHaveLength(0)
    })

    it('may import shared', async () => {
      expect(
        await violations(probe.module(name), `import '@/shared/composables/useNavigationError'`),
      ).toHaveLength(0)
    })

    it('may import its own files', async () => {
      expect(await violations(probe.module(name), `import './router/routes'`)).toHaveLength(0)
    })

    it('may be imported by the shell through its public entry point only', async () => {
      expect(await violations(probe.shell, `import '@/modules/${name}'`)).toHaveLength(0)
      expect(await violations(probe.shell, `import '@/modules/${name}/router/routes'`)).not.toHaveLength(0)
    })

    it('must not be imported by shared', async () => {
      expect(await violations(probe.shared, `import '@/modules/${name}'`)).not.toHaveLength(0)
    })
  })

  describe('shared', () => {
    it('must not import the application shell', async () => {
      expect(await violations(probe.shared, `import router from '@/router'`)).not.toHaveLength(0)
    })

    it('may import shared', async () => {
      expect(await violations(probe.shared, `import './composables/useNavigationError'`)).toHaveLength(0)
    })
  })

  describe('application shell', () => {
    it('may import shared', async () => {
      expect(await violations(probe.shell, `import '@/shared/composables/useNavigationError'`)).toHaveLength(0)
    })
  })
})
