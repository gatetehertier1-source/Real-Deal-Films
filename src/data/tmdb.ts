// TheMovieDB (TMDb) API Integration
// Real movie data with HD images

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL || "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = import.meta.env.VITE_TMDB_IMAGE_BASE_URL || "https://image.tmdb.org/t/p";

// HD Image sizes
const BACKDROP_SIZE = "original"; // Full HD/4K backdrops
const POSTER_SIZE = "w780"; // High quality posters

export type TMDBMovie = {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  genre_ids: number[];
  vote_average: number;
  vote_count: number;
  popularity: number;
  adult: boolean;
  video: boolean;
};

export type TMDBMovieDetails = TMDBMovie & {
  runtime: number | null;
  genres: { id: number; name: string }[];
  credits?: {
    cast: { id: number; name: string; character: string; profile_path: string | null }[];
    crew: { id: number; name: string; job: string; department: string }[];
  };
  videos?: {
    results: { key: string; site: string; type: string; name: string }[];
  };
  similar?: {
    results: TMDBMovie[];
  };
};

export type Movie = {
  id: number;
  title: string;
  year: number;
  rating: number;
  match: number;
  duration: string;
  genres: string[];
  cast: string[];
  director: string;
  logline: string;
  overview: string;
  backdrop: string;
  poster: string;
  logo?: string;
  accent: "crimson" | "teal" | "amber" | "violet";
  featured?: boolean;
  trending?: boolean;
  newRelease?: boolean;
  trailerColor: string;
  trailerKey?: string;
};

// Genre ID to name mapping
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

// Accent colors based on genre
const GENRE_ACCENTS: Record<string, "crimson" | "teal" | "amber" | "violet"> = {
  "Action": "crimson",
  "Adventure": "amber",
  "Animation": "teal",
  "Comedy": "amber",
  "Crime": "crimson",
  "Documentary": "teal",
  "Drama": "violet",
  "Family": "amber",
  "Fantasy": "teal",
  "History": "amber",
  "Horror": "crimson",
  "Music": "teal",
  "Mystery": "violet",
  "Romance": "crimson",
  "Sci-Fi": "teal",
  "Thriller": "violet",
  "War": "crimson",
  "Western": "amber",
};

// Trailer colors
const ACCENT_COLORS = {
  crimson: "#E50914",
  teal: "#00F2FE",
  amber: "#F59E0B",
  violet: "#8B5CF6",
};

// Helper functions
export function getImageUrl(path: string | null, size: string = POSTER_SIZE): string {
  if (!path) return "https://via.placeholder.com/780x1170?text=No+Image";
  return `${IMAGE_BASE_URL}/${size}${path}`;
}

export function getBackdropUrl(path: string | null): string {
  if (!path) return "https://via.placeholder.com/1920x1080?text=No+Backdrop";
  return `${IMAGE_BASE_URL}/${BACKDROP_SIZE}${path}`;
}

export function formatDuration(minutes: number | null): string {
  if (!minutes) return "1h 45m";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

export function calculateMatch(popularity: number, voteAverage: number): number {
  // Algorithm to calculate match percentage based on popularity and rating
  const baseMatch = Math.round((voteAverage / 10) * 100);
  const popularityBoost = Math.min(15, Math.round(popularity / 100));
  return Math.min(99, Math.max(70, baseMatch + popularityBoost));
}

export function generateLogline(overview: string): string {
  // Extract first sentence or first 120 characters
  const firstSentence = overview.split(/[.!?]/)[0];
  if (firstSentence.length > 120) {
    return firstSentence.substring(0, 120) + "...";
  }
  return firstSentence + ".";
}

// Transform TMDB movie to our Movie type
export function transformMovie(movie: TMDBMovie | TMDBMovieDetails, isFeatured = false): Movie {
  const details = movie as TMDBMovieDetails;
  const primaryGenre = movie.genre_ids?.[0] 
    ? GENRE_MAP[movie.genre_ids[0]] 
    : details.genres?.[0]?.name || "Drama";
  
  const accent = GENRE_ACCENTS[primaryGenre] || "violet";
  const year = movie.release_date ? parseInt(movie.release_date.split("-")[0]) : 2024;
  const isNew: boolean = year >= 2024 || !!(movie.release_date && new Date(movie.release_date) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000));
  
  // Get cast and director
  const cast = details.credits?.cast?.slice(0, 5).map(c => c.name) || [];
  const director = details.credits?.crew?.find(c => c.job === "Director")?.name || "Unknown";
  
  // Get trailer key if available
  const trailer = details.videos?.results?.find(v => v.type === "Trailer" && v.site === "YouTube");
  
  return {
    id: movie.id,
    title: movie.title,
    year,
    rating: parseFloat((movie.vote_average / 2).toFixed(1)), // Convert to 5-star scale
    match: calculateMatch(movie.popularity, movie.vote_average),
    duration: formatDuration(details.runtime),
    genres: movie.genre_ids?.map(id => GENRE_MAP[id]).filter(Boolean) || details.genres?.map(g => g.name) || ["Drama"],
    cast: cast.length > 0 ? cast : ["Unknown Cast"],
    director,
    logline: generateLogline(movie.overview),
    overview: movie.overview,
    backdrop: getBackdropUrl(movie.backdrop_path),
    poster: getImageUrl(movie.poster_path, POSTER_SIZE),
    accent,
    featured: isFeatured,
    trending: movie.popularity > 100,
    newRelease: isNew,
    trailerColor: ACCENT_COLORS[accent],
    trailerKey: trailer?.key,
  };
}

// API Functions
export async function fetchTrendingMovies(timeWindow: "day" | "week" = "week"): Promise<Movie[]> {
  const response = await fetch(
    `${BASE_URL}/trending/movie/${timeWindow}?api_key=${API_KEY}&language=en-US`
  );
  const data = await response.json();
  return data.results.slice(0, 20).map((m: TMDBMovie) => transformMovie(m, false));
}

export async function fetchNowPlaying(): Promise<Movie[]> {
  const response = await fetch(
    `${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=en-US&page=1&region=US`
  );
  const data = await response.json();
  return data.results.slice(0, 20).map((m: TMDBMovie) => transformMovie(m, false));
}

export async function fetchTopRated(): Promise<Movie[]> {
  const response = await fetch(
    `${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=en-US&page=1`
  );
  const data = await response.json();
  return data.results.slice(0, 20).map((m: TMDBMovie) => transformMovie(m, false));
}

export async function fetchUpcoming(): Promise<Movie[]> {
  const response = await fetch(
    `${BASE_URL}/movie/upcoming?api_key=${API_KEY}&language=en-US&page=1&region=US`
  );
  const data = await response.json();
  return data.results.slice(0, 20).map((m: TMDBMovie) => transformMovie(m, false));
}

export async function fetchPopular(): Promise<Movie[]> {
  const response = await fetch(
    `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=1`
  );
  const data = await response.json();
  return data.results.slice(0, 20).map((m: TMDBMovie) => transformMovie(m, false));
}

export async function fetchMoviesByGenre(genreId: number): Promise<Movie[]> {
  const response = await fetch(
    `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&with_genres=${genreId}&page=1`
  );
  const data = await response.json();
  return data.results.slice(0, 20).map((m: TMDBMovie) => transformMovie(m, false));
}

export async function fetchMovieDetails(movieId: number): Promise<Movie> {
  const response = await fetch(
    `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=en-US&append_to_response=credits,videos,similar`
  );
  const data: TMDBMovieDetails = await response.json();
  return transformMovie(data, false);
}

export async function searchMovies(query: string): Promise<Movie[]> {
  if (!query.trim()) return [];
  const response = await fetch(
    `${BASE_URL}/search/movie?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=1`
  );
  const data = await response.json();
  return data.results.slice(0, 20).map((m: TMDBMovie) => transformMovie(m, false));
}

export async function fetchFeaturedMovie(): Promise<Movie | null> {
  // Get a popular movie with good backdrop as featured
  const response = await fetch(
    `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=1`
  );
  const data = await response.json();
  const featured = data.results.find((m: TMDBMovie) => m.backdrop_path && m.vote_average > 7);
  if (featured) {
    return fetchMovieDetails(featured.id);
  }
  return null;
}

// Genre list
export const TMDB_GENRES = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" },
  { id: 36, name: "History" },
  { id: 27, name: "Horror" },
  { id: 10402, name: "Music" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Sci-Fi" },
  { id: 53, name: "Thriller" },
  { id: 10752, name: "War" },
  { id: 37, name: "Western" },
];

// Cache for movies
let movieCache: Movie[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getAllMovies(): Promise<Movie[]> {
  if (movieCache && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return movieCache;
  }
  
  try {
    const [trending, popular, topRated, nowPlaying] = await Promise.all([
      fetchTrendingMovies(),
      fetchPopular(),
      fetchTopRated(),
      fetchNowPlaying(),
    ]);
    
    // Combine and deduplicate
    const allMovies = [...trending, ...popular, ...topRated, ...nowPlaying];
    const uniqueMovies = Array.from(new Map(allMovies.map(m => [m.id, m])).values());
    
    // Mark featured movies (top rated with good backdrops)
    const featured = uniqueMovies
      .filter(m => m.rating >= 4 && m.backdrop.includes("image.tmdb.org"))
      .slice(0, 5);
    featured.forEach(m => m.featured = true);
    
    movieCache = uniqueMovies;
    cacheTimestamp = Date.now();
    return uniqueMovies;
  } catch (error) {
    console.error("Error fetching movies:", error);
    return movieCache || [];
  }
}

export function getFeaturedMovies(movies: Movie[]): Movie[] {
  return movies.filter(m => m.featured).slice(0, 5);
}

export function getTrendingMovies(movies: Movie[]): Movie[] {
  return movies.filter(m => m.trending).slice(0, 20);
}

export function getNewReleases(movies: Movie[]): Movie[] {
  return movies.filter(m => m.newRelease).slice(0, 20);
}

export function getMoviesByGenreName(movies: Movie[], genre: string): Movie[] {
  if (genre === "All") return movies;
  return movies.filter(m => m.genres.includes(genre));
}

export function searchMovieCatalog(movies: Movie[], query: string): Movie[] {
  if (!query.trim()) return movies;
  const needle = query.toLowerCase();
  return movies.filter(m => 
    m.title.toLowerCase().includes(needle) ||
    m.overview.toLowerCase().includes(needle) ||
    m.cast.some(c => c.toLowerCase().includes(needle)) ||
    m.director.toLowerCase().includes(needle) ||
    m.genres.some(g => g.toLowerCase().includes(needle))
  );
}

export function getContentRails(movies: Movie[]) {
  return [
    { label: "Trending Now", items: getTrendingMovies(movies) },
    { label: "New Releases", items: getNewReleases(movies) },
    { label: "Top Rated", items: movies.filter(m => m.rating >= 4.2).slice(0, 20) },
    { label: "Action & Adventure", items: movies.filter(m => m.genres.some(g => ["Action", "Adventure"].includes(g))).slice(0, 20) },
    { label: "Sci-Fi & Fantasy", items: movies.filter(m => m.genres.some(g => ["Sci-Fi", "Fantasy"].includes(g))).slice(0, 20) },
    { label: "Drama & Thriller", items: movies.filter(m => m.genres.some(g => ["Drama", "Thriller", "Mystery"].includes(g))).slice(0, 20) },
    { label: "Comedy & Family", items: movies.filter(m => m.genres.some(g => ["Comedy", "Family", "Animation"].includes(g))).slice(0, 20) },
  ];
}
