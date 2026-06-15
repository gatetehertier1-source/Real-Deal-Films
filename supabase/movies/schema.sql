-- Movie catalog tables (TMDb cache)
-- Run in Supabase SQL editor.

create table if not exists public.movies (
  movie_id integer primary key,
  title text not null,
  original_title text,
  overview text,
  poster_url text,
  backdrop_url text,
  logo_url text,

  year integer,
  rating numeric,
  match_score integer,
  duration text,
  genres jsonb not null default '[]'::jsonb,
  cast text[] not null default '{}',
  director text,

  accent text,
  featured boolean not null default false,
  trending boolean not null default false,
  new_release boolean not null default false,

  trailer_color text,
  trailer_key text,

  tmdb_popularity numeric,
  tmdb_vote_average numeric,
  adult boolean not null default false,

  last_synced_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.movies enable row level security;

-- Allow public read (catalog is shared across users)
create policy "movies_select_public"
  on public.movies
  for select
  using (true);

