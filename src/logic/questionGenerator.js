// src/logic/questionGenerator.js
//
// Pure logic: builds a multiplication question for a given level.
// No Vue, no globals. The random source can be injected for testing.

import { getLevel, MIN_LEVEL_INDEX, MAX_LEVEL_INDEX } from '@/config/gameConfig'

/** How many times we re-roll to avoid repeating the previous question */
const MAX_REPEAT_RETRIES = 20

/**
 * @typedef {Object} Question
 * @property {number} a          First number shown
 * @property {number} b          Second number shown
 * @property {number} answer     a * b
 * @property {number} levelIndex Level this question was generated for
 * @property {string} levelId    Level id (stable key for stats/storage)
 * @property {string} text       Display text, e.g. "34 × 6"
 */

/**
 * Random integer in [min, max], inclusive.
 * @param {number} min
 * @param {number} max
 * @param {() => number} rng  Returns a float in [0, 1)
 */
function randomInt(min, max, rng) {
  return Math.floor(rng() * (max - min + 1)) + min
}

/**
 * Whether two questions are the same problem, ignoring factor order
 * (so 6 × 34 counts as a repeat of 34 × 6).
 * @param {{a:number,b:number}|null|undefined} q1
 * @param {{a:number,b:number}|null|undefined} q2
 */
export function isSameProblem(q1, q2) {
  if (!q1 || !q2) return false
  return (q1.a === q2.a && q1.b === q2.b) || (q1.a === q2.b && q1.b === q2.a)
}

/** Build one candidate question (may be a repeat; caller checks). */
function buildQuestion(levelIndex, rng) {
  const level = getLevel(levelIndex)
  const [rangeA, rangeB] = level.factors

  let a = randomInt(rangeA.min, rangeA.max, rng)
  let b = randomInt(rangeB.min, rangeB.max, rng)

  // Randomize which factor is shown first, so both "34 × 6" and "6 × 34" appear
  if (rng() >= 0.5) {
    ;[a, b] = [b, a]
  }

  return {
    a,
    b,
    answer: a * b,
    levelIndex,
    levelId: level.id,
    text: `${a} × ${b}`,
  }
}

/**
 * Generate a question for the given level.
 *
 * @param {number} levelIndex  0 = easiest. Out-of-range values are clamped.
 * @param {Object} [options]
 * @param {Question|null} [options.previous]  Last question asked; the new one
 *        won't be the same problem (unless the level has no other options).
 * @param {() => number} [options.rng]        Random source, defaults to Math.random
 * @returns {Question}
 */
export function generateQuestion(levelIndex, { previous = null, rng = Math.random } = {}) {
  const index = Math.min(Math.max(levelIndex, MIN_LEVEL_INDEX), MAX_LEVEL_INDEX)

  let question = buildQuestion(index, rng)
  let attempts = 0
  while (isSameProblem(question, previous) && attempts < MAX_REPEAT_RETRIES) {
    question = buildQuestion(index, rng)
    attempts++
  }
  return question
}