<script setup>
import { ref } from 'vue'
import LevelBadge from './LevelBadge.vue'
import { LEVELS, SESSION_OPTIONS, PROGRESSION, STREAK_BONUS } from '@/config/gameConfig'
import { useStorage } from '@/composables/useStorage'

const props = defineProps({ session: { type: Object, required: true } })

const storage = useStorage()
const name = ref(storage.data.playerName || '')
const minutes = ref(SESSION_OPTIONS[0].minutes)
const showHowTo = ref(false)

function begin() {
  showHowTo.value = false
  props.session.start({ minutes: minutes.value, name: name.value })
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString()
}
</script>

<template>
  <div>
    <header class="center">
      <h1>Multiplication Mine</h1>
      <p>Dig through the levels by answering multiplication problems!</p>
    </header>

    <section class="mc-panel">
      <label class="field">
        <span>Your name (optional)</span>
        <input v-model="name" class="mc-input mc-input--small" type="text" maxlength="16" placeholder="Adventurer" />
      </label>

      <p class="field__label">How long do you want to play?</p>
      <div class="choice-row">
        <button
          v-for="opt in SESSION_OPTIONS"
          :key="opt.minutes"
          class="mc-btn"
          :class="{ 'mc-btn--selected': minutes === opt.minutes }"
          @click="minutes = opt.minutes"
        >
          {{ opt.label }}
        </button>
      </div>

      <div class="center">
        <button class="mc-btn mc-btn--primary mc-btn--big" @click="showHowTo = true">Start Mining!</button>
      </div>
    </section>

    <section class="mc-panel">
      <h2>Levels</h2>
      <ul class="level-list">
        <li v-for="(l, i) in LEVELS" :key="l.id">
          <LevelBadge :level-index="i" />
          <span>{{ l.description }}</span>
          <span class="level-list__pts">{{ l.points }} pts</span>
        </li>
      </ul>
    </section>

    <section class="mc-panel">
      <h2>Best Scores</h2>
      <div v-for="opt in SESSION_OPTIONS" :key="opt.minutes" class="board">
        <h3>{{ opt.label }}</h3>
        <ol v-if="storage.data.leaderboards[opt.minutes]?.length">
          <li v-for="(e, i) in storage.data.leaderboards[opt.minutes]" :key="i">
            <strong>{{ e.name }}</strong>: {{ e.score }} pts
            <small>(reached {{ e.highestLevel }}, {{ formatDate(e.date) }})</small>
          </li>
        </ol>
        <p v-else class="muted">No scores yet. Be the first!</p>
      </div>
    </section>

    <!-- How-to-play prompt shown before every session -->
    <div v-if="showHowTo" class="overlay" @click.self="showHowTo = false">
      <div class="mc-panel modal" role="dialog" aria-modal="true" aria-label="How to play">
        <h2>How to Play</h2>
        <ul class="howto">
          <li><strong>Submit</strong>: type your answer and press Enter or tap Submit.</li>
          <li>
            <strong>Skip</strong>: too tough? Skip it! You won't lose a life, but
            <strong>your streak is reset</strong>, so you lose any streak bonus.
          </li>
          <li><strong>Pause</strong>: stops the timer if you need a break.</li>
          <li><strong>Level up</strong>: get {{ PROGRESSION.correctToLevelUp }} right in a row.</li>
          <li><strong>Level down</strong>: {{ PROGRESSION.wrongToLevelDown }} wrong in a row drops you one level (Wood never drops).</li>
          <li><strong>Streak bonus</strong>: {{ STREAK_BONUS.startsAt }}+ correct in a row earns extra points!</li>
          <li>When time runs out, finish your last question and see your results.</li>
        </ul>
        <div class="choice-row">
          <button class="mc-btn" @click="showHowTo = false">Back</button>
          <button class="mc-btn mc-btn--primary" @click="begin">Got it, let's go!</button>
        </div>
      </div>
    </div>
  </div>
</template>