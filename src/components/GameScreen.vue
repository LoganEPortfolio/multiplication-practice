<script setup>
import { ref } from 'vue'
import StatusBar from './StatusBar.vue'
import QuestionCard from './QuestionCard.vue'

defineProps({ session: { type: Object, required: true } })
const confirmEnd = ref(false)
</script>

<template>
  <div>
    <StatusBar :session="session" />

    <section v-if="session.status === 'paused'" class="mc-panel center">
      <h2>Paused</h2>
      <p>Your timer is stopped. Take a breather!</p>
      <button class="mc-btn mc-btn--primary" @click="session.resume()">Resume</button>
    </section>

    <template v-else>
      <p v-if="session.timeUp" class="banner">Time's up! Finish this last question.</p>
      <QuestionCard :session="session" />
    </template>

    <div class="controls">
      <button v-if="session.status === 'playing'" class="mc-btn" @click="session.pause()">Pause</button>

      <template v-if="!confirmEnd">
        <button class="mc-btn mc-btn--danger" @click="confirmEnd = true">End Session</button>
      </template>
      <template v-else>
        <span class="controls__ask">End now and see results?</span>
        <button class="mc-btn mc-btn--danger" @click="session.endEarly()">Yes, end</button>
        <button class="mc-btn" @click="confirmEnd = false">Keep playing</button>
      </template>
    </div>
  </div>
</template>