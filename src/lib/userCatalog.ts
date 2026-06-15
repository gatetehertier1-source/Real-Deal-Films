import { supabase } from "./supabaseClient";

export async function fetchUserWatchlist(userId: string) {
  const { data, error } = await supabase
    .from("user_watchlist")
    .select("movie_id")
    .eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).map((r: any) => r.movie_id as number);
}

export async function fetchUserFavorites(userId: string) {
  const { data, error } = await supabase
    .from("user_favorites")
    .select("movie_id")
    .eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).map((r: any) => r.movie_id as number);
}

export async function fetchUserWatchedProgress(userId: string) {
  const { data, error } = await supabase
    .from("user_watched_progress")
    .select("movie_id,progress")
    .eq("user_id", userId);
  if (error) throw error;
  const out: Record<number, number> = {};
  for (const r of data ?? []) out[r.movie_id as number] = r.progress as number;
  return out;
}

export async function upsertWatchedProgress(userId: string, movieId: number, progress: number) {
  const clamped = Math.max(0, Math.min(1, progress));
  const { error } = await supabase.from("user_watched_progress").upsert({
    user_id: userId,
    movie_id: movieId,
    progress: clamped,
  });
  if (error) throw error;
}

export async function toggleWatchlistRow(userId: string, movieId: number, shouldAdd: boolean) {
  if (shouldAdd) {
    const { error } = await supabase.from("user_watchlist").upsert({ user_id: userId, movie_id: movieId });
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("user_watchlist")
      .delete()
      .eq("user_id", userId)
      .eq("movie_id", movieId);
    if (error) throw error;
  }
}

export async function toggleFavoritesRow(userId: string, movieId: number, shouldAdd: boolean) {
  if (shouldAdd) {
    const { error } = await supabase.from("user_favorites").upsert({ user_id: userId, movie_id: movieId });
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("user_favorites")
      .delete()
      .eq("user_id", userId)
      .eq("movie_id", movieId);
    if (error) throw error;
  }
}

