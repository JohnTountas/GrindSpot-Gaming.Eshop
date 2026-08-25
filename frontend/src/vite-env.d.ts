/**
 * Type declarations provided by Vite for environment and module typing.
 */
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_API_HEALTH_URL?: string;
  readonly VITE_API_PROXY_TARGET?: string;
  readonly VITE_ENABLE_BACKEND_WARMUP_OVERLAY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
