import { describe, it, expect } from 'vitest'
import { generateQuestion, isSameProblem } from '@/logic/questionGenerator'
import { LEVELS } from '@/config/gameConfig'

/** RNG that replays a fixed list of values (cycling if it runs out) */
function sequenceRng(values) {
  let i = 0
  return () => values[i++ % values.length]
}

/** An rng value that lands on `offset` within a range of `span` values */
function at(offset, span) {
  return (offset + 0.5) / span
}

const digits = (n) => String(n).length

describe('generateQuestion: ranges and correctness', () => {
  LEVELS.forEach((level, index) => {
    it(`${level.id}: factors stay in range and the answer is correct`, () => {
      const [rangeA, rangeB] = level.factors
      const inRange = (n, r) => n >= r.min && n <= r.max

      for (let i = 0; i < 500; i++) {
        const q = generateQuestion(index)
        const fitsNormal = inRange(q.a, rangeA) && inRange(q.b, rangeB)
        const fitsSwapped = inRange(q.a, rangeB) && inRange(q.b, rangeA)

        expect(fitsNormal || fitsSwapped).toBe(true)
        expect(q.answer).toBe(q.a * q.b)
        expect(q.levelIndex).toBe(index)
        expect(q.levelId).toBe(level.id)
        expect(q.text).toBe(`${q.a} × ${q.b}`)
      }
    })
  })
})

describe('generateQuestion: digit formats', () => {
  const collect = (levelIndex, n = 300) =>
    Array.from({ length: n }, () => generateQuestion(levelIndex))
      .map((q) => [digits(q.a), digits(q.b)].sort())

  it('easy is always 1-digit × 1-digit', () => {
    for (const d of collect(0)) expect(d).toEqual([1, 1])
  })

  it('medium is always 1-digit × 2-digit', () => {
    for (const d of collect(1)) expect(d).toEqual([1, 2])
  })

  it('hard is always 1-digit × 3-digit', () => {
    for (const d of collect(2)) expect(d).toEqual([1, 3])
  })

  it('very hard is always 2-digit × 2-digit', () => {
    for (const d of collect(3)) expect(d).toEqual([2, 2])
  })
})

describe('generateQuestion: randomness control', () => {
  it('produces the lowest values when rng always returns 0', () => {
    const q = generateQuestion(0, { rng: () => 0 })
    expect(q.a).toBe(2)
    expect(q.b).toBe(2)
    expect(q.answer).toBe(4)
    expect(q.text).toBe('2 × 2')
  })

  it('produces the highest values when rng is just under 1', () => {
    const q = generateQuestion(0, { rng: () => 0.999999 })
    expect(q.a).toBe(9)
    expect(q.b).toBe(9)
    expect(q.answer).toBe(81)
  })

  it('swaps factor order when the swap roll is >= 0.5', () => {
    // Medium: a from 11-49, b from 2-9. Pick a=20, b=3, then swap.
    const rng = sequenceRng([at(9, 39), at(1, 8), 0.9])
    const q = generateQuestion(1, { rng })
    expect(q.a).toBe(3)
    expect(q.b).toBe(20)
    expect(q.answer).toBe(60)
    expect(q.text).toBe('3 × 20')
  })

  it('does not swap when the swap roll is < 0.5', () => {
    const rng = sequenceRng([at(9, 39), at(1, 8), 0.1])
    const q = generateQuestion(1, { rng })
    expect(q.a).toBe(20)
    expect(q.b).toBe(3)
  })
})

describe('generateQuestion: multiples of ten are allowed', () => {
  it('can produce a 2-digit number ending in 0 at medium', () => {
    const rng = sequenceRng([at(9, 39), at(0, 8), 0]) // 20 × 2
    const q = generateQuestion(1, { rng })
    expect(q.a).toBe(20)
    expect(q.answer).toBe(40)
  })

  it('can produce a round 3-digit number at hard', () => {
    const rng = sequenceRng([at(99, 399), at(0, 8), 0]) // 200 × 2
    const q = generateQuestion(2, { rng })
    expect(q.a).toBe(200)
    expect(q.answer).toBe(400)
  })
})

describe('generateQuestion: avoiding repeats', () => {
  it('re-rolls when the first candidate matches the previous question', () => {
    const previous = { a: 2, b: 2 }
    // Attempt 1: 2×2 (repeat), attempt 2: 2×2 (repeat), attempt 3: 9×2
    const rng = sequenceRng([0, 0, 0, 0, 0, 0, 0.99, 0, 0])
    const q = generateQuestion(0, { previous, rng })
    expect(q.a).toBe(9)
    expect(q.b).toBe(2)
  })

  it('never returns the same problem twice in a row on easy', () => {
    let previous = null
    for (let i = 0; i < 1000; i++) {
      const q = generateQuestion(0, { previous })
      expect(isSameProblem(q, previous)).toBe(false)
      previous = q
    }
  })

  it('gives up instead of looping forever if re-rolls keep repeating', () => {
    const previous = { a: 2, b: 2 }
    const q = generateQuestion(0, { previous, rng: () => 0 }) // always 2×2
    expect(q.answer).toBe(4)
  })
})

describe('generateQuestion: level clamping', () => {
  it('clamps a too-high level to the highest', () => {
    expect(generateQuestion(99).levelId).toBe('veryHard')
  })

  it('clamps a negative level to the lowest', () => {
    expect(generateQuestion(-3).levelId).toBe('easy')
  })
})

describe('isSameProblem', () => {
  it('matches the same factors in either order', () => {
    expect(isSameProblem({ a: 6, b: 34 }, { a: 34, b: 6 })).toBe(true)
    expect(isSameProblem({ a: 6, b: 34 }, { a: 6, b: 34 })).toBe(true)
  })

  it('does not match different problems', () => {
    expect(isSameProblem({ a: 6, b: 34 }, { a: 6, b: 35 })).toBe(false)
  })

  it('handles null/undefined safely', () => {
    expect(isSameProblem(null, { a: 1, b: 2 })).toBe(false)
    expect(isSameProblem({ a: 1, b: 2 }, undefined)).toBe(false)
  })
})