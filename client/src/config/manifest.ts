import Manifest from '@mnfst/sdk'

// Manifest API Configuration
export const MANIFEST_CONFIG = {
  baseUrl: `${import.meta.env.VITE_BASE_URL}` || 'http://localhost:1111',
}

const manifest = new Manifest(MANIFEST_CONFIG.baseUrl)

export default manifest
