/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_GROQ_API_KEY: string
  readonly VITE_GROQ_KEY_1: string
  readonly VITE_GROQ_KEY_2: string
  readonly VITE_GROQ_KEY_3: string
  readonly VITE_GROQ_KEY_4: string
  readonly VITE_GROQ_KEY_5: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
