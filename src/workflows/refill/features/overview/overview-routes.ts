import type { RouteRecordRaw } from 'vue-router'

export const overviewRoutes: RouteRecordRaw[] = [
  {
    path: '',
    component: () => import('./views/RefillOverview.vue'),
    meta: { title: 'Refill' },
  },
]
