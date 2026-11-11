<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'

const props = defineProps({ session: { type: Object, required: true } })

const answer = ref('')
const inputEl = ref(null)

function focusInput() {
  nextTick(() => inputEl.value?.focus())
}

onMounted(focusInput)
watch(() => props.session.currentQuestion, () => {
  answer.value = ''
  focusInput()
})

function onInput(e) {
  answer.value = e.target.value.replace(/\D/g, '') // digits only
  e.target.value = answer.value
}

function submit() {
  if (!answer.value) return
  props.session.submitAnswer(answer.value)
  answer.value = ''
  focusInput()
}

function skip() {
  props.session.skip()
  answer.value = ''
  focusInput()
}
</script>

<template>
  <section class="mc-panel question">
    <p v-if="session.currentQuestion" class="question__text">{{ session.currentQuestion.text }} = ?</p>

    <form class="question__form" @submit.prevent="submit">
      <input
        ref="inputEl"
        class="mc-input"
        type="text"
        inputmode="numeric"
        pattern="[0-9]*"
        autocomplete="off"
        aria-label="Your answer"
        placeholder="?"
        :value="answer"
        @input="onInput"
      />
      <div class="question__buttons">
        <button type="submit" class="mc-btn mc-btn--primary" :disabled="!answer">Submit</button>
        <button type="button" class="mc-btn" @click="skip">Skip</button>
      </div>
    </form>

    <p v-if="session.feedback" :key="session.feedback.id" class="feedback" :class="`feedback--${session.feedback.result}`">
      <template v-if="session.feedback.result === 'correct'">
        Correct! +{{ session.feedback.points }}
        <span v-if="session.feedback.bonus">(includes +{{ session.feedback.bonus }} streak bonus)</span>
      </template>
      <template v-else-if="session.feedback.result === 'wrong'">
        Not quite: {{ session.feedback.text }} = {{ session.feedback.answer }}
      </template>
      <template v-else>
        Skipped: {{ session.feedback.text }} = {{ session.feedback.answer }}. Streak lost.
      </template>
      <span v-if="session.feedback.levelChange === 'up'" class="feedback__level feedback__level--up">
        Level up! Now mining {{ session.feedback.newLevelLabel }}
      </span>
      <span v-if="session.feedback.levelChange === 'down'" class="feedback__level feedback__level--down">
        Back down to {{ session.feedback.newLevelLabel }}
      </span>
    </p>
  </section>
</template>