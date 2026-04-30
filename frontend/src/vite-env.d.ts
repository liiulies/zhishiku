/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  // 如果以后还有别的环境变量，比如 VITE_APP_TITLE，也像上面一样加在这里
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}