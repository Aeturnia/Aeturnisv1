/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_WS_URL: string
  readonly VITE_USE_MOCKS: string
  readonly VITE_APP_VERSION: string
  readonly MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}