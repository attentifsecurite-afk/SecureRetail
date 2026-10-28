/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_MAPS_API_KEY: string
  readonly VITE_SHOPGUARD_API_URL: string
  readonly VITE_SHOPGUARD_WS_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
