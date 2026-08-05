<script setup lang="ts">
definePageMeta({
  layout: 'community',
  middleware: ['auth', 'community'],
});

const route = useRoute();
const communitySlug = computed(() => route.params.communitySlug as string);

useHead({ title: () => `${communitySlug.value} — FoundryRooms` });
</script>

<template>
  <section>
    <h1>Community: {{ communitySlug }}</h1>
    <p>Community overview placeholder.</p>
  </section>
</template>
