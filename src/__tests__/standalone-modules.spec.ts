import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createRefillRoutes } from '@/modules/refill'
import { createStockRoutes } from '@/modules/stock'

function routerFor(routes: ReturnType<typeof createStockRoutes>) {
  return createRouter({ history: createMemoryHistory(), routes })
}

describe('module route factories', () => {
  it('mounts refill at the root when the prefix is empty', () => {
    const router = routerFor(createRefillRoutes(''))

    expect(router.resolve('/').name).toBe('refill-overview')
    expect(router.resolve('/42/settings').name).toBe('refill-settings')
    expect(router.resolve({ name: 'refill-settings', params: { id: 42 } }).href).toBe('/42/settings')
    expect(router.resolve('/refill').matched).toHaveLength(0)
  })

  it('mounts stock at the root when the prefix is empty', async () => {
    const router = routerFor(createStockRoutes(''))

    expect(router.resolve('/').name).toBe('stock-directory')
    expect(router.resolve('/42').name).toBe('stock-details')
    expect(router.resolve({ name: 'stock-details', params: { id: 42 } }).href).toBe('/42')
    await expect(router.push('/404')).rejects.toThrow('Stock ID 404 not found')
  })

  it('keeps the default prefixes', () => {
    const router = routerFor([...createStockRoutes(), ...createRefillRoutes()])

    expect(router.resolve('/stock').name).toBe('stock-directory')
    expect(router.resolve('/refill').name).toBe('refill-overview')
    expect(router.resolve({ name: 'stock-details', params: { id: 42 } }).href).toBe('/stock/42')
    expect(router.resolve({ name: 'refill-settings', params: { id: 42 } }).href).toBe('/refill/42/settings')
  })
})

describe('router composition from VITE_APP_MODULE', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  async function load(moduleName?: string) {
    vi.resetModules()
    vi.stubEnv('VITE_APP_MODULE', moduleName ?? '')
    const { default: App } = await import('../App.vue')
    const { default: router, appModule } = await import('../router')
    return { App, router, appModule }
  }

  it('serves the whole app with navigation when the variable is unset', async () => {
    const { App, router } = await load()
    await router.push('/stock')
    const wrapper = mount(App, { global: { plugins: [router] } })
    await flushPromises()

    expect(wrapper.find('nav[aria-label="Route families"]').exists()).toBe(true)
    expect(router.resolve('/refill').name).toBe('refill-overview')
    wrapper.unmount()
  })

  it('serves only refill at the root and hides the navigation', async () => {
    const { App, router, appModule } = await load('refill')
    await router.push('/')
    const wrapper = mount(App, { global: { plugins: [router] } })
    await flushPromises()

    expect(appModule).toBe('refill')
    expect(router.currentRoute.value.name).toBe('refill-overview')
    expect(wrapper.find('nav[aria-label="Route families"]').exists()).toBe(false)
    expect(wrapper.find('a[href="/42/settings"]').exists()).toBe(true)
    expect(wrapper.html()).not.toContain('/refill')
    wrapper.unmount()
  })

  it('serves only stock at the root and hides the navigation', async () => {
    const { App, router } = await load('stock')
    await router.push('/')
    const wrapper = mount(App, { global: { plugins: [router] } })
    await flushPromises()

    expect(router.currentRoute.value.name).toBe('stock-directory')
    expect(wrapper.find('nav[aria-label="Route families"]').exists()).toBe(false)
    expect(wrapper.find('a[href="/42"]').exists()).toBe(true)
    expect(wrapper.find('a[href="/404"]').exists()).toBe(true)
    expect(wrapper.html()).not.toContain('/stock"')
    wrapper.unmount()
  })
})
