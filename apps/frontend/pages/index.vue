<script setup lang="ts">
useHead({ title: 'FoundryRooms — Home' });
</script>

<template>
  <section class="home">
    <h1>Welcome to FoundryRooms</h1>
    <p>A community platform with a modular monolith architecture.</p>
    <NuxtLink to="/auth/login" class="home-cta">Get started</NuxtLink>
  </section>
</template>

<style scoped>
.home {
  text-align: center;
  padding: var(--fr-space-4);
}

.home-cta {
  display: inline-block;
  margin-top: var(--fr-space-3);
  padding: var(--fr-space-2) var(--fr-space-4);
  border: 1px solid var(--fr-color-border);
  border-radius: var(--fr-radius);
  text-decoration: none;
  color: var(--fr-color-text);
}
</style>
