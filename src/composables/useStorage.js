import { reactive } from 'vue'
import { STORAGE_KEY } from '@/config/gameConfig'

const MAX_ENTRIES = 5

function load() {
  const fallback = { playerName: '', leaderboards: {} }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback
  } catch {
    return fallback
  }
}

// Module-level so every component shares the same data
const data = reactive(load())

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    /* storage unavailable (private mode, etc.) - fail silently */
  }
}

export function useStorage() {
  function setPlayerName(name) {
    data.playerName = name
    persist()
  }

  /** Saves to the top-5 list for that time mode. Returns true if it's the new #1. */
  function recordSession({ name, minutes, score, highestLevel, correct }) {
    const list = data.leaderboards[minutes] ?? []
    const isNewBest = score > 0 && (list.length === 0 || score > list[0].score)
    const entry = { name, score, highestLevel, correct, date: new Date().toISOString() }
    data.leaderboards[minutes] = [...list, entry]
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_ENTRIES)
    persist()
    return isNewBest
  }

  function clearScores() {
    data.leaderboards = {}
    persist()
  }

  return { data, setPlayerName, recordSession, clearScores }
}