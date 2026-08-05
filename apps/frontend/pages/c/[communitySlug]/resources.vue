<script setup lang="ts">
definePageMeta({
  layout: 'community',
  middleware: ['auth', 'community'],
});

const route = useRoute();
const communitySlug = computed(() => route.params.communitySlug as string);

useHead({ title: () => `Resources — ${communitySlug.value}` });
</script>

<template>
  <section>
    <h1>Resources</h1>
    <p>Resources list placeholder for {{ communitySlug }}.</p>
  </section>
</template>
