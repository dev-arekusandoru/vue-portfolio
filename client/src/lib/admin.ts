// Admin data layer: superuser auth state and a small CRUD helper over PocketBase collections.
// Writes are superuser-only on the server, so the pages are only a convenience; nothing here is a security boundary.
import { ClientResponseError, type RecordModel } from 'pocketbase'
import { ref } from 'vue'
import pb from '@/config/pocketbase'
import { invalidatePortfolio } from '@/lib/data'

const isAdmin = () => pb.authStore.isValid && pb.authStore.isSuperuser
export const authed = ref(isAdmin())
pb.authStore.onChange(() => (authed.value = isAdmin()))

export const login = (email: string, password: string) =>
  pb.collection('_superusers').authWithPassword(email, password)
export const logout = () => pb.authStore.clear()

/** Extends a stored session; a stale or revoked token signs out. */
export async function refreshSession() {
  if (!authed.value) return
  try {
    await pb.collection('_superusers').authRefresh()
  } catch (e) {
    if (e instanceof ClientResponseError && [400, 401, 403].includes(e.status)) logout()
  }
}

/** Human-readable message for a failed request, including per-field validation errors. */
export function describe(e: unknown): string {
  if (!(e instanceof ClientResponseError)) return e instanceof Error ? e.message : String(e)
  if (e.status === 401 || e.status === 403) logout()
  const fields = Object.entries((e.response?.data ?? {}) as Record<string, { message?: string }>)
    .map(([k, v]) => `${k}: ${v?.message ?? ''}`)
    .join('; ')
  return [e.response?.message || e.message, fields].filter(Boolean).join(' — ')
}

export const dateIn = (v: unknown) => String(v ?? '').slice(0, 10)
export const dateOut = (v: string) => (v ? `${v} 00:00:00.000Z` : '')

export function useRecords(collection: string, sort: string) {
  const items = ref<RecordModel[]>([])
  const api = () => pb.collection(collection)
  const load = async () => {
    items.value = await api().getFullList({ sort })
  }
  const save = async (id: string | null, body: FormData | Record<string, unknown>) => {
    const rec = id ? await api().update(id, body) : await api().create(body)
    invalidatePortfolio()
    await load()
    return rec
  }
  const remove = async (id: string) => {
    await api().delete(id)
    invalidatePortfolio()
    await load()
  }
  return { items, load, save, remove }
}

/** Busy / success / error state for a save or delete button. `run` resolves true when `fn` succeeded. */
export function useStatus() {
  const busy = ref(false)
  const msg = ref('')
  const err = ref('')
  const run = async (fn: () => Promise<unknown>, ok: string) => {
    busy.value = true
    msg.value = err.value = ''
    try {
      await fn()
      msg.value = ok
      return true
    } catch (e) {
      err.value = describe(e)
      return false
    } finally {
      busy.value = false
    }
  }
  return { busy, msg, err, run }
}
