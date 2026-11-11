<script setup>
import { reactive } from 'vue'
import { useGameSession } from '@/composables/useGameSession'
import StartScreen from '@/components/StartScreen.vue'
import GameScreen from '@/components/GameScreen.vue'
import ResultsScreen from '@/components/ResultsScreen.vue'

// reactive() unwraps the refs so components can read session.score, etc. directly
const session = reactive(useGameSession())
</script>

<template>
  <main class="app">
    <StartScreen v-if="session.status === 'idle'" :session="session" />
    <GameScreen v-else-if="session.status === 'playing' || session.status === 'paused'" :session="session" />
    <ResultsScreen v-else :session="session" />
  </main>
</template>