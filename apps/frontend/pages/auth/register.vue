<script setup lang="ts">
import { useAuth } from '~/composables/useAuth';

definePageMeta({ layout: 'default' });
useHead({ title: 'Register — FoundryRooms' });

const email = ref('');
const password = ref('');
const displayName = ref('');
const { register, store } = useAuth();

async function handleSubmit() {
  try {
    await register(email.value, password.value, displayName.value);
    await navigateTo('/settings');
  } catch {
    // error is surfaced via store.error
  }
}
</script>

<template>
  <section class="auth-page">
    <h1>Create your account</h1>
    <form class="auth-form" @submit.prevent="handleSubmit">
      <label>
        Display name
        <input v-model="displayName" type="text" required autocomplete="name" />
      </label>
      <label>
        Email
        <input v-model="email" type="email" required autocomplete="email" />
      </label>
      <label>
        Password
        <input v-model="password" type="password" required autocomplete="new-password" />
      </label>
      <button type="submit" :disabled="store.loading">
        {{ store.loading ? 'Creating…' : 'Create account' }}
      </button>
      <p v-if="store.error" class="auth-error">{{ store.error.message }}</p>
    </form>
    <p>
      Already have an account? <NuxtLink to="/auth/login">Sign in</NuxtLink>
    </p>
  </section>
</template>

<style scoped>
.auth-page {
  max-width: 360px;
  margin: 0 auto;
  padding: var(--fr-space-4);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--fr-space-3);
}

.auth-form label {
  display: flex;
  flex-direction: column;
  gap: var(--fr-space-1);
}

.auth-error {
  color: #c00;
}
</style>
