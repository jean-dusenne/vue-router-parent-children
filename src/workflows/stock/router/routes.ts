import type { RouteRecordRaw } from 'vue-router'
import { assertStockIdAllowed } from './stock-id-guard'

export const stockRoutes: RouteRecordRaw[] = [
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
]
