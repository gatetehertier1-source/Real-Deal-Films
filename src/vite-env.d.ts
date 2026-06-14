/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TMDB_API_KEY: string;
  readonly VITE_TMDB_BASE_URL: string;
  readonly VITE_TMDB_IMAGE_BASE_URL: string;
  readonly VITE_TMDB_BACKDROP_SIZE: string;
  readonly VITE_TMDB_POSTER_SIZE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
