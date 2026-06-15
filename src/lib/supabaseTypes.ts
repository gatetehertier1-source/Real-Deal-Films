export type SupabaseUserProfile = {
  id: string;
  display_name: string | null;
  avatar: string | null;
  color: string | null;
  mature: boolean;
};

export type UserWatchlistRow = {
  user_id: string;
  movie_id: number;
};

export type UserFavoritesRow = {
  user_id: string;
  movie_id: number;
};

export type UserWatchedProgressRow = {
  user_id: string;
  movie_id: number;
  progress: number;
};

