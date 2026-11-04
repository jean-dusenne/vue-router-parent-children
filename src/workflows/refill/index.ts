import type { RouteRecordRaw } from 'vue-router'
import { overviewRoutes } from './features/overview'
import { settingsRoutes } from './features/settings'

export const refillRoutes: RouteRecordRaw[] = [
  {
    path: '/refill',
    component: () => import('./layout/RefillLayout.vue'),
    children: [...overviewRoutes, ...settingsRoutes],
  },
]
