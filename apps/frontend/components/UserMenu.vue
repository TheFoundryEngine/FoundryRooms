<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';

const auth = useAuthStore();
</script>

<template>
  <!-- Browser-only widget: wrapped in <ClientOnly> so it never renders during SSR. -->
  <ClientOnly>
    <div class="user-menu">
      <template v-if="auth.isAuthenticated">
        <span>{{ auth.user?.displayName }}</span>
      </template>
      <template v-else>
        <NuxtLink to="/auth/login">Sign in</NuxtLink>
      </template>
    </div>
    <template #fallback>
      <span class="user-menu-placeholder">…</span>
    </template>
  </ClientOnly>
</template>

<style scoped>
.user-menu {
  display: inline-flex;
  align-items: center;
  gap: var(--fr-space-2);
}

.user-menu-placeholder {
  color: var(--fr-color-muted);
}
</style>
