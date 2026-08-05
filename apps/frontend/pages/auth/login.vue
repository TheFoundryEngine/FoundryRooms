<script setup lang="ts">
import { useAuth } from '~/composables/useAuth';

definePageMeta({ layout: 'default' });
useHead({ title: 'Sign in — FoundryRooms' });

const email = ref('');
const password = ref('');
const { login, store } = useAuth();

async function handleSubmit() {
  try {
    await login(email.value, password.value);
    await navigateTo('/settings');
  } catch {
    // error is surfaced via store.error
  }
}
</script>

<template>
  <section class="auth-page">
    <h1>Sign in</h1>
    <form class="auth-form" @submit.prevent="handleSubmit">
      <label>
        Email
        <input v-model="email" type="email" required autocomplete="email" />
      </label>
      <label>
        Password
        <input v-model="password" type="password" required autocomplete="current-password" />
      </label>
      <button type="submit" :disabled="store.loading">
        {{ store.loading ? 'Signing in…' : 'Sign in' }}
      </button>
      <p v-if="store.error" class="auth-error">{{ store.error.message }}</p>
    </form>
    <p>
      <NuxtLink to="/auth/reset">Forgot your password?</NuxtLink>
    </p>
    <p>
      Need an account? <NuxtLink to="/auth/register">Register</NuxtLink>
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
