<script setup lang="ts">
import { onBeforeRouteUpdate } from 'vue-router'
import { assertStockIdAllowed } from '../router/stock-id-guard'

defineProps<{ id: string }>()

onBeforeRouteUpdate((to) => assertStockIdAllowed(to.params.id))
</script>

<template>
  <article class="route-page">
    <h3>Stock {{ id }}</h3>
    <p>This detail page is loaded as a child of the stock route.</p>
  </article>
</template>