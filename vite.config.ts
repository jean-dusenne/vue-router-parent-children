import { readdirSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

const modulesDir = fileURLToPath(new URL('./src/modules', import.meta.url))

// When VITE_APP_MODULE targets a single module, fail the build if code from any other
// src/modules/<name> folder makes it into the bundle.
function excludeOtherModules(appModule: string | undefined): Plugin {
  const excluded = appModule
    ? readdirSync(modulesDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && entry.name !== appModule)
        .map((entry) => `${modulesDir}/${entry.name}/`)
    : []

  return {
    name: 'exclude-other-modules',
    apply: 'build',
    generateBundle(_, bundle) {
      const leaked = new Set<string>()
      for (const chunk of Object.values(bundle)) {
        if (chunk.type !== 'chunk') continue
        for (const [id, info] of Object.entries(chunk.modules)) {
          if (info.renderedLength > 0 && excluded.some((dir) => id.startsWith(dir))) leaked.add(id)
        }
      }
      if (leaked.size) {
        this.error(
          `Build for module "${appModule}" includes code from other modules:\n${[...leaked].join('\n')}`,
        )
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const appModule = process.env.VITE_APP_MODULE ?? env.VITE_APP_MODULE

  return {
    plugins: [
      vue(),
      vueDevTools(),
      excludeOtherModules(appModule)
      ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
