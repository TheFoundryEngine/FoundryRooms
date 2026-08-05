<script setup lang="ts">
definePageMeta({
  layout: 'community',
  middleware: ['auth', 'community'],
});

const route = useRoute();
const communitySlug = computed(() => route.params.communitySlug as string);

useHead({ title: () => `Events — ${communitySlug.value}` });
</script>

<template>
  <section>
    <h1>Events</h1>
    <p>Events list placeholder for {{ communitySlug }}.</p>
  </section>
</template>
