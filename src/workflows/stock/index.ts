import type { RouteRecordRaw } from 'vue-router'
import { directoryRoutes } from './features/directory'
import { detailsRoutes } from './features/details'

export const stockRoutes: RouteRecordRaw[] = [
  {
    path: '/stock',
    component: () => import('./layout/StockLayout.vue'),
    children: [...directoryRoutes, ...detailsRoutes],
  },
]
