import { globalIgnores } from 'eslint/config'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import pluginVitest from '@vitest/eslint-plugin'
import pluginOxlint from 'eslint-plugin-oxlint'
import skipFormatting from 'eslint-config-prettier/flat'
import boundaries from 'eslint-plugin-boundaries'

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{vue,ts,mts,tsx}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**', '**/.history/**']),

  ...pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,

  {
    ...pluginVitest.configs.recommended,
    files: ['src/**/__tests__/*'],
  },

  ...pluginOxlint.buildFromOxlintConfigFile('.oxlintrc.json'),

  {
    name: 'app/module-boundaries',
    files: ['src/**/*.{vue,ts,mts,tsx}'],
    plugins: { boundaries },
    settings: {
      // Resolves the `@/` alias so that aliased and relative imports are classified the same way.
      'import/resolver': { typescript: { alwaysTryTypes: true } },
      // main.ts and App.vue are single files: classified as file descriptors, not elements.
      'boundaries/files': [{ pattern: ['src/main.ts', 'src/App.vue'], category: 'shell-entry' }],
      'boundaries/elements': [
        // The application shell: the router folder, plus the entry files classified below.
        { type: 'shell', pattern: 'src/router' },
        { type: 'module', pattern: 'src/modules/*', capture: ['moduleName'] },
        { type: 'shared', pattern: 'src/shared' },
      ],
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          // Fallback message, e.g. for the shell importing an internal file of a module.
          message:
            'Import not allowed: {{ from.element.type }} -> {{ to.element.type }}. ' +
            'Allowed: module -> shared or itself, shared -> shared, shell -> shared or a module index.ts only.',
          policies: [
            // Explicit refusals, only to give a precise error message.
            {
              from: { element: { type: 'module' } },
              disallow: [{ to: { element: { type: 'module' } } }],
              message:
                'Module "{{ from.element.captured.moduleName }}" must not import module ' +
                '"{{ to.element.captured.moduleName }}". Move shared code to src/shared.',
            },
            {
              from: { element: { type: 'module' } },
              disallow: [{ to: { element: { type: 'shell' } } }],
              message: 'Module "{{ from.element.captured.moduleName }}" must not import the application shell.',
            },
            {
              from: { element: { type: 'shared' } },
              disallow: [{ to: { element: { type: 'module' } } }],
              message: 'src/shared must not depend on module "{{ to.element.captured.moduleName }}".',
            },
            {
              from: { element: { type: 'shared' } },
              disallow: [{ to: { element: { type: 'shell' } } }],
              message: 'src/shared must not import the application shell.',
            },
            // Shell -> shared, and shell -> a module's public entry point only.
            {
              from: { element: { type: 'shell' } },
              allow: [
                { to: { element: { type: 'shell' } } },
                { to: { element: { type: 'shared' } } },
                { to: { element: { type: 'module', fileInternalPath: 'index.ts' } } },
              ],
            },
            // Entry files (main.ts, App.vue) follow the same rules as the rest of the shell.
            {
              from: { file: { categories: 'shell-entry' } },
              allow: [
                { to: { file: { categories: 'shell-entry' } } },
                { to: { element: { type: 'shell' } } },
                { to: { element: { type: 'shared' } } },
                { to: { element: { type: 'module', fileInternalPath: 'index.ts' } } },
              ],
            },
            // Module -> shared, and module -> itself. Never another module, never the shell.
            {
              from: { element: { type: 'module' } },
              allow: [
                { to: { element: { type: 'shared' } } },
                {
                  to: {
                    element: {
                      type: 'module',
                      captured: { moduleName: '{{ from.element.captured.moduleName }}' },
                    },
                  },
                },
              ],
            },
            // Shared -> shared only. Never a module, never the shell.
            {
              from: { element: { type: 'shared' } },
              allow: [{ to: { element: { type: 'shared' } } }],
            },
          ],
        },
      ],
    },
  },

  skipFormatting,
)
