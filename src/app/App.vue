<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { useTitle } from '@vueuse/core'

const route = useRoute()
useTitle(computed(() => {
  const baseTitle = typeof route.meta.title === 'string' ? route.meta.title : 'Vue Router POC'
  const routeId = route.params.id

  return typeof routeId === 'string' && routeId ? `${baseTitle} ${routeId}` : baseTitle
}))

</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <div>
        <p class="eyebrow">Vue Router</p>
        <h1>Parent and child routes</h1>
      </div>
      <nav aria-label="Route families">
        <RouterLink class="primary-link" to="/stock">Stock</RouterLink>
        <RouterLink class="primary-link" to="/refill">Refill</RouterLink>
      </nav>
    </header>

    <main>
      <RouterView />
    </main>
  </div>
</template>

<style>
:root {
  color: #202a35;
  background: #f3f6f5;
  font-family: Avenir, 'Segoe UI', sans-serif;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
}

* {
  box-sizing: border-box;
}

body {
  min-width: 320px;
  min-height: 100vh;
  margin: 0;
}

a {
  color: inherit;
}

.app-shell {
  width: min(100% - 40px, 920px);
  margin: 0 auto;
  padding: 48px 0;
}

.app-header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #cdd8d5;
}

.eyebrow {
  margin: 0 0 8px;
  color: #397565;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

h1,
h2,
h3 {
  margin: 0;
  font-family: Georgia, serif;
  font-weight: 500;
}

h1 {
  font-size: 2rem;
}

nav {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.primary-link {
  padding: 9px 13px;
  border: 1px solid #397565;
  border-radius: 4px;
  color: #275b4d;
  text-decoration: none;
}

.primary-link.router-link-active {
  color: #fff;
  background: #397565;
}

main {
  padding-top: 28px;
}

.route-page {
  padding-top: 20px;
}

.route-page h3 {
  margin: 0;
  font-family: Georgia, serif;
  font-size: 1.2rem;
  font-weight: 500;
}

.route-page p {
  margin: 8px 0 0;
  color: #53625e;
  line-height: 1.6;
}

@media (max-width: 560px) {
  .app-shell {
    width: min(100% - 28px, 920px);
    padding: 28px 0;
  }

  .app-header {
    align-items: start;
    flex-direction: column;
  }
}
</style>
