<script setup>
import { computed } from 'vue'
import LevelBadge from './LevelBadge.vue'
import { PROGRESSION, MAX_LEVEL_INDEX, MIN_LEVEL_INDEX, STREAK_BONUS } from '@/config/gameConfig'

const props = defineProps({ session: { type: Object, required: true } })

const atMax = computed(() => props.session.levelIndex === MAX_LEVEL_INDEX)
const showHearts = computed(() => props.session.levelIndex > MIN_LEVEL_INDEX)
const timerLow = computed(() => props.session.remainingMs < 60000)

const pips = computed(() =>
  Array.from({ length: PROGRESSION.correctToLevelUp }, (_, i) => i < props.session.correctStreak),
)
const hearts = computed(() =>
  Array.from(
    { length: PROGRESSION.wrongToLevelDown },
    (_, i) => i < PROGRESSION.wrongToLevelDown - props.session.wrongStreak,
  ),
)
</script>

<template>
  <section class="mc-panel status">
    <div class="status__row">
      <div class="status__cell">
        <span class="status__label">Time</span>
        <span class="status__value" :class="{ 'status__value--low': timerLow }">{{ session.timeLabel }}</span>
      </div>
      <div class="status__cell">
        <span class="status__label">Score</span>
        <span class="status__value">{{ session.score }}</span>
      </div>
      <div class="status__cell">
        <span class="status__label">Level</span>
        <LevelBadge :level-index="session.levelIndex" />
      </div>
    </div>

    <div class="status__row status__row--meters">
      <div class="meter" :title="`${PROGRESSION.correctToLevelUp} correct in a row to level up`">
        <span class="status__label">{{ atMax ? 'Max level!' : 'Level up' }}</span>
        <span v-if="!atMax" class="pips">
          <span v-for="(on, i) in pips" :key="i" class="pip" :class="{ 'pip--on': on }"></span>
        </span>
      </div>

      <div v-if="showHearts" class="meter" :title="`${PROGRESSION.wrongToLevelDown} wrong in a row drops a level`">
        <span class="status__label">Lives</span>
        <span class="hearts">
          <span v-for="(on, i) in hearts" :key="i" class="heart" :class="{ 'heart--off': !on }">♥</span>
        </span>
      </div>

      <div class="meter">
        <span class="status__label">Streak</span>
        <span class="streak" :class="{ 'streak--hot': session.comboStreak >= STREAK_BONUS.startsAt }">
          {{ session.comboStreak }}
        </span>
      </div>
    </div>
  </section>
</template>