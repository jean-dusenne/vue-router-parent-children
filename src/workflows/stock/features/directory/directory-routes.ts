import type { RouteRecordRaw } from 'vue-router'

export const directoryRoutes: RouteRecordRaw[] = [
  {
    path: '',
    component: () => import('./views/StockDirectory.vue'),
    meta: { title: 'Stock' },
  },
]
