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

// Add each new workflow here so its import boundaries are enforced.
const workflows = ['stock', 'refill']

type RestrictedPattern = { group: string[]; message: string }

const restrictImports = (patterns: RestrictedPattern[]): ['error', { patterns: RestrictedPattern[] }] => [
  'error',
  { patterns },
]

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

  // Each file must match exactly one override: a later `no-restricted-imports` replaces an earlier one.
  {
    name: 'app/outside-workflows-boundaries',
    files: ['src/**/*.{vue,ts,mts,tsx}'],
    ignores: ['src/workflows/**'],
    rules: {
      'no-restricted-imports': restrictImports([
        {
          group: ['@/workflows/*/**', '**/workflows/*/**'],
          message: 'Import a workflow through its index.ts (e.g. @/workflows/stock).',
        },
      ]),
    },
  },

  ...workflows.map((workflow) => ({
    name: `workflows/${workflow}-boundaries`,
    files: [`src/workflows/${workflow}/**/*.{vue,ts,mts,tsx}`],
    rules: {
      'no-restricted-imports': restrictImports([
        {
          group: ['@/app', '@/app/**', '**/app', '**/app/**'],
          message: 'A workflow must not import from the app layer.',
        },
        ...workflows
          .filter((other) => other !== workflow)
          .map((other) => ({
            group: [`@/workflows/${other}/**`, `**/workflows/${other}/**`, `../**/${other}/**`],
            message: `Import the ${other} workflow through its index.ts (@/workflows/${other}).`,
          })),
      ]),
    },
  })),

  skipFormatting,
)
