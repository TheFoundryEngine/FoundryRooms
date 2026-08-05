<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: 'auth',
});

useHead({ title: 'Settings — FoundryRooms' });
</script>

<template>
  <section class="settings">
    <h1>Settings</h1>
    <p>Account settings placeholder.</p>
  </section>
</template>

<style scoped>
.settings {
  max-width: 640px;
  margin: 0 auto;
  padding: var(--fr-space-4);
}
</style>
