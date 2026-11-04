import { createRouter, createWebHistory } from 'vue-router'
import { stockRoutes } from '@/modules/stock'
import { refillRoutes } from '@/modules/refill'

const EmptyRoute = { render: () => null }

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: EmptyRoute,
      meta: { title: 'Vue Router POC' }
    },
    ...stockRoutes,
    ...refillRoutes,
  ],
})


export default router
