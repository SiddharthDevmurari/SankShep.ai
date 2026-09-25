/// <reference types="vite/client" />

// Provider keys are server-side only (api/chat.ts); never read them here, or Vite inlines them into the bundle.
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
