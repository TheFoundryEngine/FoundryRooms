<script setup lang="ts">
definePageMeta({
  layout: 'community',
  middleware: ['auth', 'community'],
});

const route = useRoute();
const communitySlug = computed(() => route.params.communitySlug as string);

useHead({ title: () => `Discussions — ${communitySlug.value}` });
</script>

<template>
  <section>
    <h1>Discussions</h1>
    <p>Discussions list placeholder for {{ communitySlug }}.</p>
  </section>
</template>
