-- Supabase schema for persisting per-user watchlist, favorites and watched progress.
-- Run in Supabase SQL editor.

-- 1) Profiles table (optional but recommended for mapping app user -> app profile)
-- If you already have auth.users and a profiles table, adjust accordingly.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar text,
  color text,
  mature boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) Watchlist (user_id, movie_id)
create table if not exists public.user_watchlist (
  user_id uuid not null references auth.users(id) on delete cascade,
  movie_id integer not null,
  created_at timestamptz not null default now(),
  primary key (user_id, movie_id)
);

-- 3) Favorites (user_id, movie_id)
create table if not exists public.user_favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  movie_id integer not null,
  created_at timestamptz not null default now(),
  primary key (user_id, movie_id)
);

-- 4) Watched progress per movie (0..1)
create table if not exists public.user_watched_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  movie_id integer not null,
  progress double precision not null check (progress >= 0 and progress <= 1),
  updated_at timestamptz not null default now(),
  primary key (user_id, movie_id)
);

-- Indexes (already covered by PKs, but explicit for clarity)
create index if not exists user_watchlist_user_id_idx on public.user_watchlist (user_id);
create index if not exists user_favorites_user_id_idx on public.user_favorites (user_id);
create index if not exists user_watched_progress_user_id_idx on public.user_watched_progress (user_id);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.user_watchlist enable row level security;
alter table public.user_favorites enable row level security;
alter table public.user_watched_progress enable row level security;

-- Policies
-- profiles: allow user to read/write their own row
create policy "profiles_select_own"
  on public.profiles
  for select
  using (id = auth.uid());

create policy "profiles_insert_own"
  on public.profiles
  for insert
  with check (id = auth.uid());

create policy "profiles_update_own"
  on public.profiles
  for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- watchlist
create policy "watchlist_select_own"
  on public.user_watchlist
  for select
  using (user_id = auth.uid());

create policy "watchlist_insert_own"
  on public.user_watchlist
  for insert
  with check (user_id = auth.uid());

create policy "watchlist_delete_own"
  on public.user_watchlist
  for delete
  using (user_id = auth.uid());

-- favorites
create policy "favorites_select_own"
  on public.user_favorites
  for select
  using (user_id = auth.uid());

create policy "favorites_insert_own"
  on public.user_favorites
  for insert
  with check (user_id = auth.uid());

create policy "favorites_delete_own"
  on public.user_favorites
  for delete
  using (user_id = auth.uid());

-- watched progress
create policy "watched_select_own"
  on public.user_watched_progress
  for select
  using (user_id = auth.uid());

create policy "watched_upsert_own"
  on public.user_watched_progress
  for insert
  with check (user_id = auth.uid());

create policy "watched_update_own"
  on public.user_watched_progress
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Helpful trigger for updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists user_watched_progress_set_updated_at on public.user_watched_progress;
create trigger user_watched_progress_set_updated_at
before update on public.user_watched_progress
for each row execute function public.set_updated_at();

