<script setup lang="ts">
import TopNavigation from './TopNavigation.vue'
import { navGroups } from '@/composables/auth'
defineProps<{ layout: string; selected: string }>()
const emit = defineEmits<{ (e: 'select', key: string): void }>()

</script>
<template>
  <TopNavigation v-if="layout === 'top'" />
  <nav v-else class="adaptive-nav m-rail" aria-label="模块导航">
    <div v-for="group in navGroups" :key="group.key" class="adaptive-group">
      <button type="button" class="adaptive-item" :aria-pressed="selected === group.key" @click="emit('select', group.key)">{{ group.label }}</button>
    </div>
  </nav>
</template>
