/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_GOOGLE_CLIENT_ID: string
  readonly VITE_APP_URL: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_DEV_MODE: string
  readonly VITE_ENABLE_DEBUG: string
  readonly VITE_ALLOWED_ORIGINS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 