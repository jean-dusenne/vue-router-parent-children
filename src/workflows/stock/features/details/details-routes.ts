import type { RouteRecordRaw } from 'vue-router'
import { assertStockIdAllowed } from './model/stock-id-guard'

export const detailsRoutes: RouteRecordRaw[] = [
  {
    path: ':id',
    components: { default: () => import('./views/StockDetails.vue') },
    props: { default: true },
    beforeEnter: (to) => assertStockIdAllowed(to.params.id),
    meta: { title: 'Stock details' },
  },
]
