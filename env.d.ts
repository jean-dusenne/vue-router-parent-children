/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_MODULE?: 'refill' | 'stock'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
