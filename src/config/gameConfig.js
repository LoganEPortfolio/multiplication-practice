// src/config/gameConfig.js
//
// All tunable game rules live here. No Vue, no logic, just data.
// Levels are referenced elsewhere by their INDEX (0 = lowest) or their id.

/**
 * @typedef {Object} FactorRange
 * @property {number} min  Smallest allowed value (inclusive)
 * @property {number} max  Largest allowed value (inclusive)
 */

/**
 * @typedef {Object} Level
 * @property {string} id           Stable key used in code and saved data
 * @property {string} label        Display name (Minecraft tier)
 * @property {string} description  Kid-friendly description of the format
 * @property {number} points       Base points for a correct answer
 * @property {[FactorRange, FactorRange]} factors  Ranges for the two factors
 */

/** @type {ReadonlyArray<Level>} Ordered easiest -> hardest */
export const LEVELS = Object.freeze([
  Object.freeze({
    id: 'easy',
    label: 'Wood',
    description: '1-digit × 1-digit',
    points: 10,
    factors: [
      { min: 2, max: 9 },
      { min: 2, max: 9 },
    ],
  }),
  Object.freeze({
    id: 'medium',
    label: 'Stone',
    description: '2-digit × 1-digit',
    points: 20,
    factors: [
      { min: 11, max: 49 },
      { min: 2, max: 9 },
    ],
  }),
  Object.freeze({
    id: 'hard',
    label: 'Iron',
    description: '3-digit × 1-digit',
    points: 35,
    factors: [
      { min: 101, max: 499 },
      { min: 2, max: 9 },
    ],
  }),
  Object.freeze({
    id: 'veryHard',
    label: 'Diamond',
    description: '2-digit × 2-digit',
    points: 50,
    factors: [
      { min: 11, max: 30 },
      { min: 11, max: 25 },
    ],
  }),
])

export const MIN_LEVEL_INDEX = 0
export const MAX_LEVEL_INDEX = LEVELS.length - 1

/** Rules for moving between levels */
export const PROGRESSION = Object.freeze({
  /** Correct answers in a row (at one level) needed to move up */
  correctToLevelUp: 5,
  /** Wrong answers in a row (at one level) that move the player down */
  wrongToLevelDown: 3,
})

/** Bonus points for answering correctly in a row (skips/wrongs reset it) */
export const STREAK_BONUS = Object.freeze({
  /** Streak length at which the bonus begins */
  startsAt: 3,
  /** Bonus at `startsAt`, growing by this much for each extra correct answer */
  perStep: 2,
  /** The bonus never exceeds this many points */
  maxBonus: 10,
})

/** Session length choices shown on the start screen */
export const SESSION_OPTIONS = Object.freeze([
  Object.freeze({ minutes: 10, label: '10 Minutes' }),
  Object.freeze({ minutes: 20, label: '20 Minutes' }),
])

/** Name used when the player doesn't enter one */
export const DEFAULT_PLAYER_NAME = 'Adventurer'

/** localStorage key (namespaced so it can't collide with other apps) */
export const STORAGE_KEY = 'multiplication-practice:v1'

/**
 * Look up a level by index. Out-of-range indexes are clamped
 * so callers always get a valid level.
 * @param {number} index
 * @returns {Level}
 */
export function getLevel(index) {
  const clamped = Math.min(Math.max(index, MIN_LEVEL_INDEX), MAX_LEVEL_INDEX)
  return LEVELS[clamped]
}