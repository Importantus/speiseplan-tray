<script setup lang="ts">
import Home  from "./components/Home.vue";
</script>

<template>
  <Suspense>
    <Home />
    <template #fallback>
      <div>Loading...</div>
    </template>
  </Suspense>
</template>
