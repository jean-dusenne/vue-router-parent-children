import { extname } from 'node:path'

import fastifyStatic from '@fastify/static'
import Fastify from 'fastify'

export function buildServer(root: string, logger = false) {
  const app = Fastify({ logger })

  app.register(fastifyStatic, { root })

  // Only document navigations fall back to the SPA; missing assets stay 404.
  app.setNotFoundHandler((request, reply) => {
    const isNavigation =
      request.method === 'GET' &&
      request.headers.accept?.includes('text/html') &&
      !extname(request.url.split('?')[0] ?? '')

    if (isNavigation) return reply.type('text/html').sendFile('index.html')
    return reply.code(404).send({ error: 'Not Found' })
  })

  return app
}
