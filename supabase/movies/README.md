# Supabase TMDb movie ingestion

## Important
Supabase **Edge Functions** are not authored in this repo using your Vite/TypeScript toolchain. The file you see under:
- `supabase/movies/edge-function/tmdbSync/index.ts`

is provided as a reference template.

If you want to deploy it, create/use the Supabase CLI project in the `supabase/` folder and generate an Edge Function using:
- `supabase functions new tmdbSync`

and paste the logic into that generated function file.

## Schema
Run:
- `supabase/movies/schema.sql`

in the Supabase SQL editor.

## Runtime
Configure Edge Function environment variables:
- `TMDB_API_KEY`
- `TMDB_BASE_URL` (optional)
- `TMDB_IMAGE_BASE_URL` (optional)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Trigger
The function currently expects `POST`. Hook it to a scheduler/cron if you want automatic refresh.

## Frontend changes
Replace calls to `src/data/tmdb.ts` with reads from the `public.movies` table.

