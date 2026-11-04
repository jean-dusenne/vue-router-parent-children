import { createRouter, createWebHistory } from 'vue-router'
import { stockRoutes } from '@/workflows/stock'
import { refillRoutes } from '@/workflows/refill'

const EmptyRoute = { render: () => null }

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: EmptyRoute,
      meta: { title: 'Vue Router POC' },
    },
    ...stockRoutes,
    ...refillRoutes,
  ],
})

export default router
