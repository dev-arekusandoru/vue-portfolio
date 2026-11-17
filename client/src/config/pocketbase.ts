import PocketBase from 'pocketbase'

// Same origin in dev (the Vite proxy forwards /api to PocketBase) and in prod (PocketBase serves the build).
// VITE_PB_URL overrides.
export const PB_URL = import.meta.env.VITE_PB_URL || '/'

const pb = new PocketBase(PB_URL)

// Public read-only collections; no auth state to persist.
pb.autoCancellation(false)

export default pb
