<script setup lang="ts">
import Home from "./components/Home.vue";
import LoadingScreen from "./components/LoadingScreen.vue";
</script>

<template>
  <Suspense>
    <Home />
    <template #fallback>
      <LoadingScreen />
    </template>
  </Suspense>
</template>
