<script setup>
import LevelBadge from './LevelBadge.vue'

defineProps({ session: { type: Object, required: true } })
</script>

<template>
  <div v-if="session.summary">
    <header class="center">
      <h1>Session Complete!</h1>
      <p>Nice work, {{ session.playerName }}!</p>
    </header>

    <section class="mc-panel center">
      <p v-if="session.isNewBest" class="banner banner--gold">New best score for {{ session.durationMinutes }} minutes!</p>
      <p class="status__label">Total Points</p>
      <p class="big-score">{{ session.summary.totalPoints }}</p>
    </section>

    <section class="mc-panel">
      <h2>Stats</h2>
      <div class="stat-grid">
        <div class="stat"><span class="stat__v">{{ session.summary.correct }}</span><span>Correct</span></div>
        <div class="stat"><span class="stat__v">{{ session.summary.wrong }}</span><span>Incorrect</span></div>
        <div class="stat"><span class="stat__v">{{ session.summary.skipped }}</span><span>Skipped</span></div>
        <div class="stat">
          <span class="stat__v">{{ session.summary.accuracy === null ? '-' : session.summary.accuracy + '%' }}</span>
          <span>Accuracy</span>
        </div>
        <div class="stat"><span class="stat__v">{{ session.summary.longestStreak }}</span><span>Best streak</span></div>
        <div class="stat">
          <span class="stat__v">{{ session.summary.avgSeconds === null ? '-' : session.summary.avgSeconds + 's' }}</span>
          <span>Avg. time</span>
        </div>
      </div>

      <p>
        <strong>Highest level reached:</strong>
        <LevelBadge :level-index="session.summary.highestLevel.index" />
      </p>
      <p>
        <strong>Hardest problem solved:</strong>
        <template v-if="session.summary.hardestCorrect">
          {{ session.summary.hardestCorrect.text }} = {{ session.summary.hardestCorrect.answer }}
          <LevelBadge :level-index="session.summary.hardestCorrect.levelIndex" />
        </template>
        <template v-else>none yet</template>
      </p>
    </section>

    <section class="mc-panel">
      <h2>By Level</h2>
      <table class="table">
        <thead>
          <tr><th>Level</th><th>Correct</th><th>Wrong</th><th>Skipped</th><th>Points</th></tr>
        </thead>
        <tbody>
          <tr v-for="row in session.summary.perLevel" :key="row.id">
            <td>{{ row.label }}</td>
            <td>{{ row.correct }}</td>
            <td>{{ row.wrong }}</td>
            <td>{{ row.skipped }}</td>
            <td>{{ row.points }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section v-if="session.summary.missed.length" class="mc-panel">
      <h2>Review Missed Problems</h2>
      <ul class="missed">
        <li v-for="(m, i) in session.summary.missed" :key="i">
          <strong>{{ m.text }} = {{ m.answer }}</strong>
          <span class="muted">
            <template v-if="m.result === 'wrong'"> (you answered {{ m.given }})</template>
            <template v-else> (skipped)</template>
          </span>
        </li>
      </ul>
    </section>

    <div class="center">
      <button class="mc-btn mc-btn--primary mc-btn--big" @click="session.reset()">Play Again</button>
    </div>
  </div>

  <div v-else class="center">
    <p>No questions were answered this time.</p>
    <button class="mc-btn mc-btn--primary" @click="session.reset()">Back to Start</button>
  </div>
</template>