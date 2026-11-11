// Points for a correct answer: level base points + streak bonus
import { getLevel, STREAK_BONUS } from '@/config/gameConfig'

/** Bonus for the Nth correct answer in a row (N includes the current answer) */
export function streakBonus(streak) {
  if (streak < STREAK_BONUS.startsAt) return 0
  const steps = streak - STREAK_BONUS.startsAt + 1
  return Math.min(STREAK_BONUS.maxBonus, steps * STREAK_BONUS.perStep)
}

export function pointsForCorrect(levelIndex, streak) {
  const base = getLevel(levelIndex).points
  const bonus = streakBonus(streak)
  return { base, bonus, total: base + bonus }
}