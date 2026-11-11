// Builds the end-of-session summary from the answer log
import { LEVELS, getLevel } from '@/config/gameConfig'

/**
 * @param {Array} log  entries: { question, levelIndex, given, result, points, bonus, timeMs }
 * @param {{highestLevelIndex:number, finalLevelIndex:number}} opts
 */
export function summarize(log, { highestLevelIndex = 0, finalLevelIndex = 0 } = {}) {
  const perLevel = LEVELS.map((l) => ({
    id: l.id, label: l.label, description: l.description,
    correct: 0, wrong: 0, skipped: 0, points: 0,
  }))
  const missed = []
  let totalPoints = 0, correct = 0, wrong = 0, skipped = 0
  let run = 0, longestStreak = 0
  let timeMs = 0, timedCount = 0
  let hardest = null

  for (const e of log) {
    const row = perLevel[e.levelIndex]
    totalPoints += e.points
    row.points += e.points

    if (e.result === 'correct') {
      correct++
      row.correct++
      run++
      longestStreak = Math.max(longestStreak, run)
      const q = e.question
      if (
        !hardest ||
        e.levelIndex > hardest.levelIndex ||
        (e.levelIndex === hardest.levelIndex && q.answer > hardest.answer)
      ) {
        hardest = { text: q.text, answer: q.answer, levelIndex: e.levelIndex }
      }
    } else {
      run = 0
      if (e.result === 'wrong') { wrong++; row.wrong++ } else { skipped++; row.skipped++ }
      missed.push({ text: e.question.text, answer: e.question.answer, given: e.given, result: e.result })
    }

    if (e.result !== 'skip') { timeMs += e.timeMs; timedCount++ }
  }

  const attempted = correct + wrong
  const high = getLevel(highestLevelIndex)

  return {
    totalPoints,
    totalQuestions: log.length,
    correct, wrong, skipped,
    accuracy: attempted ? Math.round((correct / attempted) * 100) : null,
    perLevel,
    highestLevel: { index: highestLevelIndex, id: high.id, label: high.label },
    finalLevelIndex,
    hardestCorrect: hardest,
    longestStreak,
    avgSeconds: timedCount ? Math.round(timeMs / timedCount / 100) / 10 : null,
    missed,
  }
}