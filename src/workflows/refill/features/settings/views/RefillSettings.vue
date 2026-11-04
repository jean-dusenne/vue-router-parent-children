<script setup lang="ts">
defineProps<{ id: string }>()
</script>

<template>
  <article class="route-page">
    <h3>Refill {{ id }} settings</h3>
    <p>This settings page is loaded as a child of the refill route.</p>
  </article>
</template>