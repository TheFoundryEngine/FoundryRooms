<script setup lang="ts">
import type { NavItem } from '~/types';

const navItems: NavItem[] = [
  { label: 'Home', to: '/' },
  { label: 'Settings', to: '/settings' },
  { label: 'Admin', to: '/admin' },
];
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <nav class="app-nav">
        <NuxtLink to="/" class="app-logo">FoundryRooms</NuxtLink>
        <ul class="app-nav-list">
          <li v-for="item in navItems" :key="item.to">
            <NuxtLink :to="item.to">{{ item.label }}</NuxtLink>
          </li>
        </ul>
      </nav>
      <div class="app-user-menu">
        <!-- User menu placeholder (Team D will wire to auth store) -->
        <ClientOnly>
          <NuxtLink to="/auth/login">Sign in</NuxtLink>
        </ClientOnly>
      </div>
    </header>

    <main class="app-main">
      <slot />
    </main>

    <footer class="app-footer">
      <p>&copy; {{ new Date().getFullYear() }} FoundryRooms</p>
    </footer>
  </div>
</template>

<style>
:root {
  --fr-color-bg: #ffffff;
  --fr-color-text: #1a1a1a;
  --fr-color-muted: #666666;
  --fr-color-border: #e5e5e5;
  --fr-space-1: 0.25rem;
  --fr-space-2: 0.5rem;
  --fr-space-3: 1rem;
  --fr-space-4: 2rem;
  --fr-radius: 6px;
}

.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--fr-color-bg);
  color: var(--fr-color-text);
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--fr-space-3) var(--fr-space-4);
  border-bottom: 1px solid var(--fr-color-border);
}

.app-nav {
  display: flex;
  align-items: center;
  gap: var(--fr-space-4);
}

.app-logo {
  font-weight: 700;
  text-decoration: none;
  color: var(--fr-color-text);
}

.app-nav-list {
  display: flex;
  gap: var(--fr-space-3);
  list-style: none;
  margin: 0;
  padding: 0;
}

.app-main {
  flex: 1;
  padding: var(--fr-space-4);
}

.app-footer {
  padding: var(--fr-space-3) var(--fr-space-4);
  border-top: 1px solid var(--fr-color-border);
  color: var(--fr-color-muted);
  font-size: 0.875rem;
}
</style>
