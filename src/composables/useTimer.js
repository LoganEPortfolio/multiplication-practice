import { ref, computed, getCurrentScope, onScopeDispose } from 'vue'

// Countdown timer based on Date.now() so it stays accurate if the tab is throttled
export function useTimer({ onExpire } = {}) {
  const remainingMs = ref(0)
  const running = ref(false)
  const expired = ref(false)
  let endAt = 0
  let handle = null

  function clearHandle() {
    if (handle) { clearInterval(handle); handle = null }
  }

  function tick() {
    remainingMs.value = Math.max(0, endAt - Date.now())
    if (remainingMs.value <= 0) {
      clearHandle()
      running.value = false
      expired.value = true
      onExpire?.()
    }
  }

  function resume() {
    if (running.value || expired.value || remainingMs.value <= 0) return
    endAt = Date.now() + remainingMs.value
    running.value = true
    handle = setInterval(tick, 250)
  }

  function start(seconds) {
    stop()
    remainingMs.value = seconds * 1000
    expired.value = false
    resume()
  }

  function pause() {
    if (!running.value) return
    tick()
    if (!running.value) return // it expired during this tick
    clearHandle()
    running.value = false
  }

  function stop() {
    clearHandle()
    running.value = false
  }

  const formatted = computed(() => {
    const total = Math.ceil(remainingMs.value / 1000)
    const m = Math.floor(total / 60)
    const s = total % 60
    return `${m}:${String(s).padStart(2, '0')}`
  })

  if (getCurrentScope()) onScopeDispose(clearHandle)

  return { remainingMs, running, expired, formatted, start, pause, resume, stop }
}