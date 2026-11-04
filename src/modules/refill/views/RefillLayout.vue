<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="refill-layout">
    <aside class="refill-sidebar">
      <p class="sidebar-label">Refill</p>
      <h2>Workspace</h2>
      <nav aria-label="Refill child routes">
        <RouterLink :to="{ name: 'refill-overview' }">Overview</RouterLink>
        <RouterLink :to="{ name: 'refill-settings', params: { id: 42 } }">Refill 42 settings</RouterLink>
      </nav>
    </aside>
    <section class="refill-content">
      <header>
        <span>Workspace view</span>
        <span class="route-indicator" aria-hidden="true">RF</span>
      </header>
      <RouterView />
    </section>
  </div>
</template>

<style scoped>
.refill-layout {
  display: grid;
  min-height: 250px;
  grid-template-columns: minmax(160px, 220px) minmax(0, 1fr);
  overflow: hidden;
  border: 1px solid #b9cec8;
  border-radius: 6px;
  background: #fff;
}

.refill-sidebar {
  padding: 22px 18px;
  color: #f4faf8;
  background: #285d50;
}

.sidebar-label {
  margin: 0 0 7px;
  color: #c1e2d9;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

h2 {
  margin: 0;
  font-family: Georgia, serif;
  font-size: 1.4rem;
  font-weight: 500;
}

nav {
  display: grid;
  gap: 7px;
  margin-top: 24px;
}

nav a {
  padding: 8px 9px;
  border-radius: 3px;
  color: inherit;
  text-decoration: none;
}

nav a.router-link-active {
  color: #173c32;
  background: #d7eee7;
}

.refill-content {
  min-width: 0;
  padding: 20px 24px;
}

.refill-content > header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 14px;
  border-bottom: 1px solid #e1e8e5;
  color: #53625e;
  font-size: 0.8rem;
}

.route-indicator {
  color: #397565;
  font-weight: 700;
}

@media (max-width: 560px) {
  .refill-layout {
    grid-template-columns: minmax(0, 1fr);
  }

  .refill-sidebar {
    padding: 18px;
  }

  nav {
    display: flex;
    flex-wrap: wrap;
    margin-top: 14px;
  }

  .refill-content {
    padding: 18px;
  }
}
</style>