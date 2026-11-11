// Pure level-progression rules. Results: 'correct' | 'wrong' | 'skip'
import { PROGRESSION, MIN_LEVEL_INDEX, MAX_LEVEL_INDEX } from '@/config/gameConfig'

export function createProgressState(levelIndex = MIN_LEVEL_INDEX) {
  return { levelIndex, correctStreak: 0, wrongStreak: 0 }
}

/**
 * Apply one result. Returns { state, change } where change is 'up' | 'down' | null.
 * - correct: correct streak +1, wrong streak cleared; level up at the threshold
 * - wrong:   wrong streak +1, correct streak cleared; level down at the threshold (not below Easy)
 * - skip:    correct streak cleared, wrong streak untouched
 * Streaks reset whenever the level changes.
 */
export function applyResult(state, result) {
  let { levelIndex, correctStreak, wrongStreak } = state
  let change = null

  if (result === 'correct') {
    correctStreak++
    wrongStreak = 0
    if (correctStreak >= PROGRESSION.correctToLevelUp) {
      if (levelIndex < MAX_LEVEL_INDEX) {
        levelIndex++
        change = 'up'
      }
      correctStreak = 0
    }
  } else if (result === 'wrong') {
    wrongStreak++
    correctStreak = 0
    if (wrongStreak >= PROGRESSION.wrongToLevelDown) {
      if (levelIndex > MIN_LEVEL_INDEX) {
        levelIndex--
        change = 'down'
      }
      wrongStreak = 0
    }
  } else if (result === 'skip') {
    correctStreak = 0
  }

  return { state: { levelIndex, correctStreak, wrongStreak }, change }
}