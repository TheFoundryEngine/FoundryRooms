<script setup lang="ts">
import type { NuxtError } from '#app';

const props = defineProps<{
  error: NuxtError;
}>();

function handleClear() {
  clearError({ redirect: '/' });
}
</script>

<template>
  <div class="error-page">
    <h1>{{ error.statusCode }}</h1>
    <p>{{ error.statusMessage || 'An unexpected error occurred.' }}</p>
    <button @click="handleClear">Back to home</button>
  </div>
</template>

<style scoped>
.error-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
  gap: var(--fr-space-2);
}

.error-page h1 {
  font-size: 3rem;
  margin: 0;
}

.error-page button {
  margin-top: var(--fr-space-3);
  padding: var(--fr-space-2) var(--fr-space-4);
  border: 1px solid var(--fr-color-border);
  border-radius: var(--fr-radius);
  background: var(--fr-color-bg);
  cursor: pointer;
}
</style>
