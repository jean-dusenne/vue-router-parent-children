<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { useNavigationError } from '@/shared/composables/useNavigationError'

const route = useRoute()
const { navigationError } = useNavigationError()
</script>

<template>
  <section class="stock-layout">
    <header class="stock-header">
      <h2>Stock</h2>
      <nav aria-label="Stock child routes">
        <RouterLink :to="{ name: 'stock-directory' }">Directory</RouterLink>
        <RouterLink :to="{ name: 'stock-details', params: { id: 42 } }">Stock 42</RouterLink>
        <RouterLink :to="{ name: 'stock-details', params: { id: 404 } }">Stock 404 (error)</RouterLink>
      </nav>
    </header>
    <p v-if="navigationError && route.meta.title !== 'Stock details'" class="navigation-error" role="alert">
      {{ navigationError }}
    </p>
    <div class="stock-content">
      <RouterView />
    </div>
  </section>
</template>

<style scoped>
.stock-layout {
  overflow: hidden;
  border: 1px solid #d5dfdc;
  border-radius: 6px;
  background: #fff;
}

.stock-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 20px 24px;
  border-bottom: 1px solid #e1e8e5;
}

h2 {
  margin: 0;
  font-family: Georgia, serif;
  font-size: 1.5rem;
  font-weight: 500;
}

nav {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

nav a {
  color: #397565;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
}

.navigation-error {
  margin: 20px 24px 0;
  padding: 12px 16px;
  border-left: 4px solid #b6473b;
  color: #732b25;
  background: #fff0ed;
}

.stock-content {
  padding: 4px 24px 24px;
}

@media (max-width: 560px) {
  .stock-header {
    align-items: start;
    flex-direction: column;
    padding: 18px;
  }

  .stock-content {
    padding: 4px 18px 18px;
  }

  .navigation-error {
    margin-right: 18px;
    margin-left: 18px;
  }
}
</style>