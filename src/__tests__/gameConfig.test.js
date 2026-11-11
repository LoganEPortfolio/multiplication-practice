import { describe, it, expect } from 'vitest'
import {
  LEVELS,
  MIN_LEVEL_INDEX,
  MAX_LEVEL_INDEX,
  PROGRESSION,
  STREAK_BONUS,
  SESSION_OPTIONS,
  getLevel,
} from '@/config/gameConfig'

describe('LEVELS', () => {
  it('has four levels in the expected order', () => {
    expect(LEVELS.map((l) => l.id)).toEqual(['easy', 'medium', 'hard', 'veryHard'])
  })

  it('has unique ids', () => {
    const ids = LEVELS.map((l) => l.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('awards strictly more points at each higher level', () => {
    for (let i = 1; i < LEVELS.length; i++) {
      expect(LEVELS[i].points).toBeGreaterThan(LEVELS[i - 1].points)
    }
  })

  it('has valid factor ranges (min <= max, both factors present)', () => {
    for (const level of LEVELS) {
      expect(level.factors).toHaveLength(2)
      for (const { min, max } of level.factors) {
        expect(Number.isInteger(min)).toBe(true)
        expect(Number.isInteger(max)).toBe(true)
        expect(min).toBeLessThanOrEqual(max)
      }
    }
  })

  it('keeps Easy to single digits 2-9', () => {
    for (const { min, max } of LEVELS[0].factors) {
      expect(min).toBe(2)
      expect(max).toBe(9)
    }
  })
})

describe('level bounds and getLevel', () => {
  it('exposes correct index bounds', () => {
    expect(MIN_LEVEL_INDEX).toBe(0)
    expect(MAX_LEVEL_INDEX).toBe(3)
  })

  it('returns the right level for a valid index', () => {
    expect(getLevel(2).id).toBe('hard')
  })

  it('clamps out-of-range indexes', () => {
    expect(getLevel(-5).id).toBe('easy')
    expect(getLevel(99).id).toBe('veryHard')
  })
})

describe('rules', () => {
  it('uses the agreed progression thresholds', () => {
    expect(PROGRESSION.correctToLevelUp).toBe(5)
    expect(PROGRESSION.wrongToLevelDown).toBe(3)
  })

  it('has a sane streak bonus', () => {
    expect(STREAK_BONUS.startsAt).toBe(3)
    expect(STREAK_BONUS.perStep).toBeGreaterThan(0)
    expect(STREAK_BONUS.maxBonus).toBeGreaterThanOrEqual(STREAK_BONUS.perStep)
  })

  it('offers 10 and 20 minute sessions', () => {
    expect(SESSION_OPTIONS.map((o) => o.minutes)).toEqual([5, 10, 20])
  })
})

describe('frozen config', () => {
  it('cannot be mutated', () => {
    expect(Object.isFrozen(LEVELS)).toBe(true)
    expect(Object.isFrozen(PROGRESSION)).toBe(true)
  })
})