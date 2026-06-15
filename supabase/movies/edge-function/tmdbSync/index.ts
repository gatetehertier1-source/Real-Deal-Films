/*
  Supabase Edge Function template for TMDb -> Supabase movie ingestion.

  IMPORTANT:
  - This file is for Deno runtime (Supabase Edge Functions), not Vite.
  - Your Vite TS compiler will likely show errors; that is expected.

  If you want to remove those editor/ts errors completely, create the Edge function
  via `supabase functions new tmdbSync` and paste the handler logic into it.
*/

import { serve } from "std/http/server.ts";
import { createClient } from "@supabase/supabase-js";

const TMDB_API_KEY = Deno.env.get("TMDB_API_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const BASE_URL = Deno.env.get("TMDB_BASE_URL") ?? "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = Deno.env.get("TMDB_IMAGE_BASE_URL") ?? "https://image.tmdb.org/t/p";
const BACKDROP_SIZE = "original";
const POSTER_SIZE = "w780";

const GENRE_MAP: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

const GENRE_ACCENTS: Record<string, "crimson" | "teal" | "amber" | "violet"> = {
  Action: "crimson",
  Adventure: "amber",
  Animation: "teal",
  Comedy: "amber",
  Crime: "crimson",
  Documentary: "teal",
  Drama: "violet",
  Family: "amber",
  Fantasy: "teal",
  History: "amber",
  Horror: "crimson",
  Music: "teal",
  Mystery: "violet",
  Romance: "crimson",
  "Sci-Fi": "teal",
  Thriller: "violet",
  War: "crimson",
  Western: "amber",
};

const ACCENT_COLORS = {
  crimson: "#E50914",
  teal: "#00F2FE",
  amber: "#F59E0B",
  violet: "#8B5CF6",
} as const;

function getImageUrl(path: string | null, size: string = POSTER_SIZE) {
  if (!path) return "https://via.placeholder.com/780x1170?text=No+Image";
  return `${IMAGE_BASE_URL}/${size}${path}`;
}

function getBackdropUrl(path: string | null) {
  if (!path) return "https://via.placeholder.com/1920x1080?text=No+Backdrop";
  return `${IMAGE_BASE_URL}/${BACKDROP_SIZE}${path}`;
}

function formatDuration(minutes: number | null) {
  if (!minutes) return "1h 45m";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

function calculateMatch(popularity: number, voteAverage: number) {
  const baseMatch = Math.round((voteAverage / 10) * 100);
  const popularityBoost = Math.min(15, Math.round(popularity / 100));
  return Math.min(99, Math.max(70, baseMatch + popularityBoost));
}

function toAccentForGenres(movieGenreIds: number[], detailsGenres: { id: number; name: string }[] | undefined) {
  const primary = movieGenreIds?.[0] ? GENRE_MAP[movieGenreIds[0]] : detailsGenres?.[0]?.name ?? "Drama";
  return GENRE_ACCENTS[primary] ?? "violet";
}

async function tmdbFetch(path: string) {
  const res = await fetch(
    `${BASE_URL}${path}&api_key=${encodeURIComponent(TMDB_API_KEY)}&language=en-US`,
  );
  if (!res.ok) throw new Error(`TMDb error: ${res.status}`);
  return await res.json();
}

async function fetchCategory(path: string) {
  const data = await tmdbFetch(path);
  return (data.results ?? []).slice(0, 20);
}

async function fetchMovieDetails(movieId: number) {
  return await tmdbFetch(`/movie/${movieId}?append_to_response=credits,videos,similar`);
}

serve(async (req: Request) => {
  try {
    if (!TMDB_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ error: "Missing env: TMDB_API_KEY / SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY" }),
        { status: 500, headers: { "content-type": "application/json" } },
      );
    }

    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Use POST" }), { status: 405 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    const [trending, popular, topRated, nowPlaying] = await Promise.all([
      fetchCategory(`/trending/movie/week?`),
      fetchCategory(`/movie/popular?`),
      fetchCategory(`/movie/top_rated?`),
      fetchCategory(`/movie/now_playing?region=US&page=1`),
    ]);

    const all = [...trending, ...popular, ...topRated, ...nowPlaying];
    const uniqueIds = Array.from(new Set(all.map((m: any) => m.id))).slice(0, 120);

    const details = await Promise.all(uniqueIds.map((id) => fetchMovieDetails(id)));

    const candidateFeatured = details.filter((d: any) => (d.vote_average / 2) >= 4 && d.backdrop_path);
    const featuredIds = new Set(candidateFeatured.slice(0, 5).map((d: any) => d.id));

    const rows = details.map((d: any) => {
      const genreIds: number[] = d.genre_ids ?? [];
      const detailsGenres: { id: number; name: string }[] = d.genres ?? [];
      const accent = toAccentForGenres(genreIds, detailsGenres);

      const year = d.release_date ? parseInt(String(d.release_date).split("-")[0]) : 2024;
      const isNew =
        year >= 2024 ||
        (d.release_date
          ? new Date(d.release_date) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
          : false);

      const cast = (d.credits?.cast ?? []).slice(0, 5).map((c: any) => c.name);
      const director = (d.credits?.crew ?? []).find((c: any) => c.job === "Director")?.name ?? "Unknown";

      const trailer = (d.videos?.results ?? []).find(
        (v: any) => v.type === "Trailer" && v.site === "YouTube",
      );

      const genres =
        genreIds.map((gid: number) => GENRE_MAP[gid]).filter(Boolean).length
          ? genreIds.map((gid: number) => GENRE_MAP[gid]).filter(Boolean)
          : detailsGenres.map((g) => g.name);

      return {
        movie_id: d.id,
        title: d.title,
        original_title: d.original_title,
        overview: d.overview,
        poster_url: getImageUrl(d.poster_path, POSTER_SIZE),
        backdrop_url: getBackdropUrl(d.backdrop_path),
        logo_url: null,
        year,
        rating: Number((d.vote_average / 2).toFixed(1)),
        match_score: calculateMatch(d.popularity, d.vote_average),
        duration: formatDuration(d.runtime),
        genres,
        cast: cast.length ? cast : ["Unknown Cast"],
        director,
        accent,
        featured: featuredIds.has(d.id),
        trending: d.popularity > 100,
        new_release: isNew,
        trailer_color: ACCENT_COLORS[accent as keyof typeof ACCENT_COLORS],
        trailer_key: trailer?.key ?? null,
        tmdb_popularity: d.popularity,
        tmdb_vote_average: d.vote_average,
        adult: Boolean(d.adult),
        last_synced_at: new Date().toISOString(),
      };
    });

    const { error } = await supabase.from("movies").upsert(rows, { onConflict: "movie_id" });
    if (error) throw error;

    return new Response(JSON.stringify({ ok: true, upserted: rows.length }), {
      headers: { "content-type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: String(e) }),
      { status: 500, headers: { "content-type": "application/json" } },
    );
  }
});


