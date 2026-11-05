import { readdirSync } from 'node:fs'

import type { Linter } from 'eslint'
import { globalIgnores } from 'eslint/config'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import pluginVitest from '@vitest/eslint-plugin'
import pluginOxlint from 'eslint-plugin-oxlint'
import skipFormatting from 'eslint-config-prettier/flat'

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

const modules = readdirSync('src/modules', { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)

// Modules never import one another, and shared never imports a module.
function restrictModules(blocked: string[], message: string): Linter.RulesRecord {
  return {
    'no-restricted-imports': [
      'error',
      {
        patterns: blocked.map((name) => ({
          group: [`@/modules/${name}`, `@/modules/${name}/**`, `../**/${name}`, `../**/${name}/**`],
          message,
        })),
      },
    ],
  }
}

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{vue,ts,mts,tsx}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  ...pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,

  {
    ...pluginVitest.configs.recommended,
    files: ['src/**/__tests__/*'],
  },

  ...pluginOxlint.buildFromOxlintConfigFile('.oxlintrc.json'),

  ...modules.map((name) => ({
    name: `app/module-boundaries/${name}`,
    files: [`src/modules/${name}/**/*.{vue,ts,mts,tsx}`],
    rules: restrictModules(
      modules.filter((other) => other !== name),
      'A module must not import another module. Move shared code to src/shared.',
    ),
  })),

  {
    name: 'app/module-boundaries/shared',
    files: ['src/shared/**/*.{vue,ts,mts,tsx}'],
    rules: restrictModules(modules, 'src/shared must not depend on a module.'),
  },

  skipFormatting,
)
