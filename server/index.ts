import { resolve } from 'node:path'

import { buildServer } from './app.ts'

const root = resolve(process.env.STATIC_ROOT ?? 'dist/app')
const port = Number(process.env.PORT ?? 3000)

await buildServer(root, true).listen({ host: '0.0.0.0', port })
