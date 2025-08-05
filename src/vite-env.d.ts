/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Firebase Configuration
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_STORAGE_BUCKET: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
  readonly VITE_FIREBASE_APP_ID: string
  readonly VITE_FIREBASE_MEASUREMENT_ID: string
  
  // Google OAuth Configuration
  readonly VITE_GOOGLE_CLIENT_ID: string
  readonly VITE_GOOGLE_CLIENT_SECRET: string
  
  // Application Configuration
  readonly VITE_APP_URL: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  
  // Development Configuration
  readonly VITE_DEV_MODE: string
  readonly VITE_ENABLE_DEBUG: string
  readonly VITE_USE_EMULATOR: string
  
  // Security Configuration
  readonly VITE_ALLOWED_ORIGINS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}