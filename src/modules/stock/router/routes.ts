import type { RouteRecordRaw } from 'vue-router'
import { assertStockIdAllowed } from './stock-id-guard'

export const createStockRoutes = (prefix = '/stock'): RouteRecordRaw[] => [
  {
    path: prefix || '/',
    component: () => import('../views/StockLayout.vue'),
    children: [
      {
        path: '',
        name: 'stock-directory',
        component: () => import('../views/StockDirectory.vue'),
        meta: { title: 'Stock' },
      },
      {
        path: ':id',
        name: 'stock-details',
        components: { default: () => import('../views/StockDetails.vue') },
        props: { default: true },
        beforeEnter: (to) => assertStockIdAllowed(to.params.id),
        meta: { title: 'Stock details' },
      },
    ],
  },
]
