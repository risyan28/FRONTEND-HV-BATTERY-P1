/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_SENTRY_DSN?: string
  readonly VITE_ENABLE_OTEL?: string
  readonly VITE_OTEL_ENDPOINT?: string
  readonly VITE_APP_VERSION?: string
  readonly VITE_APP_ENV?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
