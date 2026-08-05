<script setup lang="ts">
import { authApi } from '~/services/api/auth';

definePageMeta({ layout: 'default' });
useHead({ title: 'Reset password — FoundryRooms' });

const email = ref('');
const submitted = ref(false);
const error = ref<string | null>(null);

async function handleSubmit() {
  error.value = null;
  try {
    await authApi.requestPasswordReset({ email: email.value });
    submitted.value = true;
  } catch (err: unknown) {
    const e = err as { message?: string };
    error.value = e?.message ?? 'Reset request failed';
  }
}
</script>

<template>
  <section class="auth-page">
    <h1>Reset your password</h1>
    <p v-if="submitted">If an account exists for {{ email }}, a reset link has been sent.</p>
    <form v-else class="auth-form" @submit.prevent="handleSubmit">
      <label>
        Email
        <input v-model="email" type="email" required autocomplete="email" />
      </label>
      <button type="submit">Send reset link</button>
      <p v-if="error" class="auth-error">{{ error }}</p>
    </form>
    <p>
      <NuxtLink to="/auth/login">Back to sign in</NuxtLink>
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
