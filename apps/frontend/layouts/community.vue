<script setup lang="ts">
import type { NavItem } from '~/types';

// Community-scoped navigation placeholder.
// Real navigation (spaces/channels) will be loaded from the
// community-structure API via a composable.
const communityNav: NavItem[] = [
  { label: 'Overview', to: '' },
  { label: 'Discussions', to: 'discussions' },
  { label: 'Events', to: 'events' },
  { label: 'Resources', to: 'resources' },
];
</script>

<template>
  <div class="community-shell">
    <aside class="community-sidebar">
      <nav>
        <ul class="community-nav-list">
          <li v-for="item in communityNav" :key="item.label">
            <NuxtLink :to="item.to">{{ item.label }}</NuxtLink>
          </li>
        </ul>
      </nav>
    </aside>

    <div class="community-content">
      <slot />
    </div>
  </div>
</template>

<style>
.community-shell {
  display: flex;
  min-height: 100%;
}

.community-sidebar {
  width: 240px;
  padding: var(--fr-space-3);
  border-right: 1px solid var(--fr-color-border);
}

.community-nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--fr-space-2);
}

.community-content {
  flex: 1;
  padding: var(--fr-space-4);
}
</style>
