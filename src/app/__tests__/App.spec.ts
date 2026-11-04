import { describe, it, expect } from 'vitest'

import { flushPromises, mount } from '@vue/test-utils'
import App from '../App.vue'
import router from '../router'

describe('App', () => {
  it('lazy-loads a distinct component for each child route', () => {
    const childComponents = [
      '/stock',
      '/stock/42',
      '/refill',
      '/refill/42/settings',
    ].map((path) => {
      const matched = router.resolve(path).matched
      return matched[matched.length - 1]?.components?.default
    })

    expect(childComponents.every((component) => typeof component === 'function')).toBe(true)
    expect(new Set(childComponents).size).toBe(childComponents.length)
  })

  it('renders navigation for each route family', async () => {
    await router.push('/stock')
    const wrapper = mount(App, { global: { plugins: [router] } })

    expect(wrapper.text()).toContain('Stock')
    expect(wrapper.text()).toContain('Refill')
    expect(wrapper.text()).toContain('Stock directory')
  })

  it('uses a distinct parent layout for stock and refill', async () => {
    await router.push('/stock')
    const stockLayout = router.resolve('/stock').matched[0]?.components?.default

    await router.push('/refill')
    const refillLayout = router.resolve('/refill').matched[0]?.components?.default

    expect(stockLayout).not.toBe(refillLayout)
  })

  it('resolves distinct child routes with route metadata', () => {
    const stockRoute = router.resolve('/stock/99')
    const refillRoute = router.resolve('/refill/73/settings')

    expect(stockRoute.matched.map((record) => record.path)).toEqual([
      '/stock',
      '/stock/:id',
    ])
    expect(stockRoute.meta.title).toBe('Stock details')
    expect(refillRoute.matched.map((record) => record.path)).toEqual([
      '/refill',
      '/refill/:id/settings',
    ])
    expect(refillRoute.meta.title).toBe('Refill settings')
    expect(stockRoute.matched[1]?.props.default).toBe(true)
    expect(stockRoute.params.id).toBe('99')
    expect(refillRoute.matched[1]?.props.default).toBe(true)
    expect(refillRoute.params.id).toBe('73')
    expect(router.resolve('/gesture-1/42').matched).toHaveLength(0)
    expect(router.resolve('/gesture-2/42/settings').matched).toHaveLength(0)
    expect(router.resolve('/teams/42').matched).toHaveLength(0)
    expect(router.resolve('/projects/42/settings').matched).toHaveLength(0)
  })

  it('keeps default-page titles on child routes only', () => {
    const stockRoute = router.resolve('/stock')
    const refillRoute = router.resolve('/refill')

    expect(stockRoute.matched[0]?.meta.title).toBeUndefined()
    expect(stockRoute.meta.title).toBe('Stock')
    expect(refillRoute.matched[0]?.meta.title).toBeUndefined()
    expect(refillRoute.meta.title).toBe('Refill')
  })

  it('sets the document title from route metadata', async () => {
    const wrapper = mount(App, { global: { plugins: [router] } })

    await router.push('/refill')
    await flushPromises()
    expect(document.title).toBe('Refill')

    await router.push('/stock')
    await flushPromises()

    expect(document.title).toBe('Stock')

    await router.push('/stock/42')
    await flushPromises()
    expect(document.title).toBe('Stock details 42')

    await router.push('/refill/73/settings')
    await flushPromises()
    expect(document.title).toBe('Refill settings 73')
    wrapper.unmount()
  })

  it('matches the root path without redirecting or showing route content', async () => {
    await router.push('/')
    const wrapper = mount(App, { global: { plugins: [router] } })
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/')
    expect(router.resolve('/').matched).toHaveLength(1)
    expect(wrapper.text()).not.toContain('Stock directory')
    wrapper.unmount()
  })

  it('throws an error when the stock id is 404', async () => {
    await expect(router.push('/stock/404')).rejects.toThrow('Stock ID 404 not found')
  })

  it('throws an error when changing the stock id to 404', async () => {
    await router.push('/stock/42')
    const wrapper = mount(App, { global: { plugins: [router] } })

    await expect(router.push('/stock/404')).rejects.toThrow('Stock ID 404 not found')
    wrapper.unmount()
  })

  it('shows the stock ID error when the Stock 404 link is clicked', async () => {
    await router.push('/stock')
    const wrapper = mount(App, { global: { plugins: [router] } })

    await wrapper.get('a[href="/stock/404"]').trigger('click')
    await flushPromises()

    expect(wrapper.get('.stock-layout [role="alert"]').text()).toBe('Stock ID 404 not found')
    expect(wrapper.find('.app-shell > [role="alert"]').exists()).toBe(false)
    expect(router.currentRoute.value.path).toBe('/stock')
    wrapper.unmount()
  })

  it('shows the stock ID error while a valid stock detail remains active', async () => {
    await router.push('/stock/42')
    const wrapper = mount(App, { global: { plugins: [router] } })

    await expect(router.push('/stock/404')).rejects.toThrow('Stock ID 404 not found')
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/stock/42')
    expect(wrapper.get('.stock-layout [role="alert"]').text()).toBe('Stock ID 404 not found')
    wrapper.unmount()
  })

  it('clears the stock ID error when clicking the link of the stock detail already active', async () => {
    await router.push('/stock/42')
    const wrapper = mount(App, { global: { plugins: [router] } })

    await expect(router.push('/stock/404')).rejects.toThrow('Stock ID 404 not found')
    await flushPromises()
    expect(wrapper.find('.stock-layout [role="alert"]').exists()).toBe(true)

    await wrapper.get('a[href="/stock/42"]').trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/stock/42')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    wrapper.unmount()
  })
})
