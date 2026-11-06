import { createRouter, createWebHistory } from 'vue-router'
import { createStockRoutes } from '@/modules/stock'
import { createRefillRoutes } from '@/modules/refill'

const EmptyRoute = { render: () => null }

// VITE_APP_MODULE=refill|stock mounts a single module at "/" (no prefix in the URL)
export const appModule = import.meta.env.VITE_APP_MODULE

function buildRoutes() {
  if (appModule === 'refill') return createRefillRoutes('')
  if (appModule === 'stock') return createStockRoutes('')
  return [
    { path: '/', component: EmptyRoute, meta: { title: 'Vue Router POC' } },
    ...createStockRoutes(),
    ...createRefillRoutes(),
  ]
}

const routes = buildRoutes()

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})


export default router
