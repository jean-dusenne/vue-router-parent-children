import type { RouteRecordRaw } from 'vue-router'

export const createRefillRoutes = (prefix = '/refill'): RouteRecordRaw[] => [
  {
    path: prefix || '/',
    component: () => import('../views/RefillLayout.vue'),
    children: [
      {
        path: '',
        name: 'refill-overview',
        component: () => import('../views/RefillOverview.vue'),
        meta: { title: 'Refill' },
      },
      {
        path: ':id/settings',
        name: 'refill-settings',
        components: { default: () => import('../views/RefillSettings.vue') },
        props: { default: true },
        meta: { title: 'Refill settings' },
      },
    ],
  },
]
