import PocketBase from 'pocketbase'

// Dev: Vite serves the app on another port, so talk to PocketBase directly.
// Prod: PocketBase and the static build share one origin behind the tunnel.
export const PB_URL =
  import.meta.env.VITE_PB_URL || (import.meta.env.DEV ? 'http://127.0.0.1:8091' : '/')

const pb = new PocketBase(PB_URL)

// Public read-only collections; no auth state to persist.
pb.autoCancellation(false)

export default pb
