import { onBeforeUnmount, onMounted, ref } from 'vue'

/** Visitor-local `HH:MM`, refreshed twice a minute. `--:--` until mounted. */
export function useClock() {
  const time = ref('--:--')
  let id = 0
  const tick = () => {
    time.value = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }
  onMounted(() => {
    tick()
    id = window.setInterval(tick, 30_000)
  })
  onBeforeUnmount(() => clearInterval(id))
  return time
}
