import { ref, computed, getCurrentScope, onScopeDispose } from 'vue'
import { getLevel, DEFAULT_PLAYER_NAME } from '@/config/gameConfig'
import { generateQuestion } from '@/logic/questionGenerator'
import { createProgressState, applyResult } from '@/logic/progression'
import { pointsForCorrect } from '@/logic/scoring'
import { summarize } from '@/logic/stats'
import { useTimer } from './useTimer'
import { useStorage } from './useStorage'

const FEEDBACK_MS = 2500

export function useGameSession() {
  const storage = useStorage()

  const status = ref('idle') // idle | playing | paused | finished
  const playerName = ref('')
  const durationMinutes = ref(10)
  const progress = ref(createProgressState())
  const comboStreak = ref(0) // correct-in-a-row for bonus points (persists across level-ups)
  const score = ref(0)
  const currentQuestion = ref(null)
  const log = ref([])
  const highestLevelIndex = ref(0)
  const feedback = ref(null)
  const timeUp = ref(false)
  const summary = ref(null)
  const isNewBest = ref(false)

  const timer = useTimer({ onExpire: () => { timeUp.value = true } })

  // --- per-question stopwatch (excludes paused time) ---
  let clockAcc = 0
  let clockStart = null
  const clockReset = () => { clockAcc = 0; clockStart = Date.now() }
  const clockPause = () => {
    if (clockStart !== null) { clockAcc += Date.now() - clockStart; clockStart = null }
  }
  const clockResume = () => { if (clockStart === null) clockStart = Date.now() }
  const clockElapsed = () => clockAcc + (clockStart !== null ? Date.now() - clockStart : 0)

  // --- feedback banner ---
  let feedbackHandle = null
  let feedbackId = 0
  function showFeedback(data) {
    clearTimeout(feedbackHandle)
    feedback.value = { id: ++feedbackId, ...data }
    feedbackHandle = setTimeout(() => { feedback.value = null }, FEEDBACK_MS)
  }
  function clearFeedback() {
    clearTimeout(feedbackHandle)
    feedback.value = null
  }

  function nextQuestion() {
    currentQuestion.value = generateQuestion(progress.value.levelIndex, {
      previous: currentQuestion.value,
    })
    clockReset()
  }

  function start({ minutes, name = '' }) {
    const trimmed = name.trim()
    storage.setPlayerName(trimmed)
    playerName.value = trimmed || DEFAULT_PLAYER_NAME
    durationMinutes.value = minutes

    progress.value = createProgressState()
    comboStreak.value = 0
    score.value = 0
    log.value = []
    highestLevelIndex.value = 0
    timeUp.value = false
    summary.value = null
    isNewBest.value = false
    currentQuestion.value = null
    clearFeedback()

    status.value = 'playing'
    timer.start(minutes * 60)
    nextQuestion()
  }

  function resolve(result, given) {
    const q = currentQuestion.value
    let points = 0
    let bonus = 0

    if (result === 'correct') {
      comboStreak.value++
      const p = pointsForCorrect(q.levelIndex, comboStreak.value)
      points = p.total
      bonus = p.bonus
      score.value += points
    } else {
      comboStreak.value = 0 // wrong answers and skips both end the streak
    }

    const { state, change } = applyResult(progress.value, result)
    progress.value = state
    highestLevelIndex.value = Math.max(highestLevelIndex.value, state.levelIndex)

    log.value.push({
      question: q, levelIndex: q.levelIndex, given, result, points, bonus, timeMs: clockElapsed(),
    })

    showFeedback({
      result, points, bonus,
      text: q.text, answer: q.answer,
      levelChange: change,
      newLevelLabel: getLevel(state.levelIndex).label,
    })

    if (timeUp.value) finish()
    else nextQuestion()
  }

  /** Returns false if the input isn't a valid number (nothing is recorded) */
  function submitAnswer(raw) {
    if (status.value !== 'playing' || !currentQuestion.value) return false
    const text = String(raw).trim()
    if (!/^\d+$/.test(text)) return false
    const given = Number.parseInt(text, 10)
    resolve(given === currentQuestion.value.answer ? 'correct' : 'wrong', given)
    return true
  }

  function skip() {
    if (status.value !== 'playing' || !currentQuestion.value) return
    resolve('skip', null)
  }

  function pause() {
    if (status.value !== 'playing') return
    clockPause()
    timer.pause()
    status.value = 'paused'
  }

  function resume() {
    if (status.value !== 'paused') return
    clockResume()
    timer.resume()
    status.value = 'playing'
  }

  function finish() {
    timer.stop()
    clockPause()
    clearFeedback()
    summary.value = summarize(log.value, {
      highestLevelIndex: highestLevelIndex.value,
      finalLevelIndex: progress.value.levelIndex,
    })
    if (log.value.length > 0) {
      isNewBest.value = storage.recordSession({
        name: playerName.value,
        minutes: durationMinutes.value,
        score: score.value,
        highestLevel: summary.value.highestLevel.label,
        correct: summary.value.correct,
      })
    }
    status.value = 'finished'
  }

  function endEarly() {
    if (status.value === 'playing' || status.value === 'paused') finish()
  }

  function reset() {
    timer.stop()
    clearFeedback()
    status.value = 'idle'
    currentQuestion.value = null
    summary.value = null
  }

  if (getCurrentScope()) onScopeDispose(() => clearTimeout(feedbackHandle))

  return {
    // state
    status, playerName, durationMinutes, score, comboStreak, currentQuestion,
    feedback, timeUp, summary, isNewBest,
    levelIndex: computed(() => progress.value.levelIndex),
    level: computed(() => getLevel(progress.value.levelIndex)),
    correctStreak: computed(() => progress.value.correctStreak),
    wrongStreak: computed(() => progress.value.wrongStreak),
    answeredCount: computed(() => log.value.length),
    timeLabel: timer.formatted,
    remainingMs: timer.remainingMs,
    // actions
    start, submitAnswer, skip, pause, resume, endEarly, reset,
  }
}