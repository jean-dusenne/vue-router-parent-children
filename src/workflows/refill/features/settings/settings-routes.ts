import type { RouteRecordRaw } from 'vue-router'

export const settingsRoutes: RouteRecordRaw[] = [
  {
    path: ':id/settings',
    components: { default: () => import('./views/RefillSettings.vue') },
    props: { default: true },
    meta: { title: 'Refill settings' },
  },
]
