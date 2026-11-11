<script setup>
import { computed } from 'vue'
import { getLevel } from '@/config/gameConfig'

const props = defineProps({
  levelIndex: { type: Number, required: true },
  showDescription: { type: Boolean, default: false },
})
const level = computed(() => getLevel(props.levelIndex))
</script>

<template>
  <span class="badge" :class="`badge--${level.id}`">
    <span class="badge__icon" aria-hidden="true"></span>
    <span>{{ level.label }}</span>
    <small v-if="showDescription" class="badge__desc">{{ level.description }}</small>
  </span>
</template>