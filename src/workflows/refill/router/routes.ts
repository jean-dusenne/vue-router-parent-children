import type { RouteRecordRaw } from 'vue-router'

export const refillRoutes: RouteRecordRaw[] = [
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
]
