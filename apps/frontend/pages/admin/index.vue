<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: ['auth', 'admin'],
});

useHead({ title: 'Admin — FoundryRooms' });
</script>

<template>
  <section class="admin">
    <h1>Admin</h1>
    <p>Administration dashboard placeholder.</p>
  </section>
</template>

<style scoped>
.admin {
  max-width: 960px;
  margin: 0 auto;
  padding: var(--fr-space-4);
}
</style>
