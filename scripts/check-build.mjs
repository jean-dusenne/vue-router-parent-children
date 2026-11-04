// Fails fast when the build of a mode is missing, so `vite preview` never serves a wrong or empty directory.
import { existsSync } from 'node:fs'

const mode = process.argv[2]
if (!existsSync(`dist/${mode}/index.html`)) {
  const script = mode === 'default' ? 'build' : `build:${mode}`
  console.error(`No build found in dist/${mode}. Run "npm run ${script}" first.`)
  process.exit(1)
}
