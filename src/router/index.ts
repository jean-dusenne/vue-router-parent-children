import { createRouter, createWebHistory } from 'vue-router'
import { assertStockIdAllowed } from './stock-id-guard'

const EmptyRoute = { render: () => null }

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: EmptyRoute,
      meta: { title: 'Vue Router POC' }
    },
    {
      path: '/stock',
      component: () => import('../views/StockLayout.vue'),
      children: [
        {
          path: '',
          component: () => import('../views/StockDirectory.vue'),
          meta: { title: 'Stock' },
        },
        {
          path: ':id',
          components: { default: () => import('../views/StockDetails.vue') },
          props: { default: true },
          beforeEnter: (to) => assertStockIdAllowed(to.params.id),
          meta: { title: 'Stock details' },
        },
      ],
    },
    {
      path: '/refill',
      component: () => import('../views/RefillLayout.vue'),
      children: [
        {
          path: '',
          component: () => import('../views/RefillOverview.vue'),
          meta: { title: 'Refill' },
        },
        {
          path: ':id/settings',
          components: { default: () => import('../views/RefillSettings.vue') },
          props: { default: true },
          meta: { title: 'Refill settings' },
        },
      ],
    },
  ],
})


export default router
