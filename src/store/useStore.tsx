import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Movie } from "../data/tmdb";
import { ensureSupabaseUser } from "../lib/bootstrapAnonymousUser";
import { fetchUserFavorites, fetchUserWatchlist, fetchUserWatchedProgress, toggleFavoritesRow, toggleWatchlistRow, upsertWatchedProgress } from "../lib/userCatalog";


type Profile = {
  id: string;
  name: string;
  avatar: string;       // emoji
  color: string;        // hex
  mature: boolean;
};

type NavSection = "home" | "trending" | "new" | "movies" | "originals" | "watchlist" | "favorites";

type StoreState = {
  profiles: Profile[];
  activeProfileId: string;
  watchlist: number[];          // movie ids
  favorites: number[];          // favorite movie ids
  watched: Record<number, number>; // id -> 0..1 progress
  activeGenre: string;
  activeNav: NavSection;
  searchOpen: boolean;
  playerMovie: Movie | null;
  detailMovie: Movie | null;
  sidebarOpen: boolean;
};

type StoreActions = {
  setActiveProfile: (id: string) => void;
  toggleWatchlist: (id: number) => void;
  isInWatchlist: (id: number) => boolean;
  toggleFavorite: (id: number) => void;
  isFavorite: (id: number) => boolean;
  setProgress: (id: number, p: number) => void;
  setActiveGenre: (g: string) => void;
  setActiveNav: (nav: NavSection) => void;
  openSearch: () => void;
  closeSearch: () => void;
  openPlayer: (m: Movie) => void;
  closePlayer: () => void;
  openDetail: (m: Movie) => void;
  closeDetail: () => void;
  toggleSidebar: () => void;
  activeProfile: Profile;
};

const DEFAULT_PROFILES: Profile[] = [
  { id: "p1", name: "Alex", avatar: "🦊", color: "#E50914", mature: true },
  { id: "p2", name: "Mira", avatar: "🦉", color: "#00F2FE", mature: true },
  { id: "p3", name: "Kai", avatar: "🐼", color: "#FBBF24", mature: false },
  { id: "p4", name: "Nova", avatar: "🐙", color: "#A78BFA", mature: true },
];

const STORAGE_KEY = "nexus-stream-state-v1";

function safeMovieIdsUnique(ids: number[]) {
  return Array.from(new Set(ids.filter((n) => Number.isFinite(n))));
}


const StoreContext = createContext<(StoreState & StoreActions) | null>(null);

function loadInitial(): Partial<StoreState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const initial = loadInitial();

  const [profiles] = useState<Profile[]>(DEFAULT_PROFILES);
  const [activeProfileId, setActiveProfileId] = useState<string>(initial.activeProfileId ?? "p1");
  const [watchlist, setWatchlist] = useState<number[]>(initial.watchlist ?? [1, 3, 7]);
  const [favorites, setFavorites] = useState<number[]>(initial.favorites ?? []);
  const [watched, setWatched] = useState<Record<number, number>>(initial.watched ?? {});
  const [activeGenre, setActiveGenre] = useState<string>(initial.activeGenre ?? "All");
  const [activeNav, setActiveNav] = useState<NavSection>("home");
  const [searchOpen, setSearchOpen] = useState(false);
  const [playerMovie, setPlayerMovie] = useState<Movie | null>(null);
  const [detailMovie, setDetailMovie] = useState<Movie | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  // Persist only UI-ish state locally (profile + genre + selected profile)
  // Watchlist/favorites/progress are persisted to Supabase.
  useEffect(() => {
    const payload = { activeProfileId, activeGenre };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      /* ignore */
    }
  }, [activeProfileId, watched, activeGenre]);


  // Lock body scroll when player/search open
  useEffect(() => {
    const locked = playerMovie !== null || searchOpen;
    document.body.style.overflow = locked ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [playerMovie, searchOpen]);

  const supabaseUserIdRef = useRef<string | null>(null);

  // Load user persisted state from Supabase.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const userId = await ensureSupabaseUser();
        if (cancelled) return;
        supabaseUserIdRef.current = userId;

        const [wl, favs, prog] = await Promise.all([
          fetchUserWatchlist(userId),
          fetchUserFavorites(userId),
          fetchUserWatchedProgress(userId),
        ]);

        if (cancelled) return;
        setWatchlist(wl);
        setFavorites(favs);
        setWatched(prog);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn("Supabase sync failed; falling back to local defaults.", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const toggleWatchlist = useCallback((id: number) => {
    const userId = supabaseUserIdRef.current;
    setWatchlist((prev) => {
      const shouldAdd = !prev.includes(id);
      // Fire-and-forget sync.
      if (userId) {
        toggleWatchlistRow(userId, id, shouldAdd).catch(() => {
          // eslint-disable-next-line no-console
          console.warn("Failed to sync watchlist to Supabase");
        });
      }
      return shouldAdd ? safeMovieIdsUnique([...prev, id]) : prev.filter((x) => x !== id);
    });
  }, []);


  const isInWatchlist = useCallback((id: number) => watchlist.includes(id), [watchlist]);

  const toggleFavorite = useCallback((id: number) => {
    const userId = supabaseUserIdRef.current;
    setFavorites((prev) => {
      const shouldAdd = !prev.includes(id);
      if (userId) {
        toggleFavoritesRow(userId, id, shouldAdd).catch(() => {
          // eslint-disable-next-line no-console
          console.warn("Failed to sync favorites to Supabase");
        });
      }
      return shouldAdd ? safeMovieIdsUnique([...prev, id]) : prev.filter((x) => x !== id);
    });
  }, []);


  const isFavorite = useCallback((id: number) => favorites.includes(id), [favorites]);

  const setProgress = useCallback((id: number, p: number) => {
    const userId = supabaseUserIdRef.current;
    const clamped = Math.max(0, Math.min(1, p));

    setWatched((prev) => ({ ...prev, [id]: clamped }));

    if (userId) {
      upsertWatchedProgress(userId, id, clamped).catch(() => {
        // eslint-disable-next-line no-console
        console.warn("Failed to sync progress to Supabase");
      });
    }
  }, []);


  const activeProfile = useMemo(
    () => profiles.find((p) => p.id === activeProfileId) ?? profiles[0],
    [profiles, activeProfileId]
  );

  const value = {
    profiles,
    activeProfileId,
    watchlist,
    favorites,
    watched,
    activeGenre,
    activeNav,
    searchOpen,
    playerMovie,
    detailMovie,
    sidebarOpen,
    setActiveProfile: setActiveProfileId,
    toggleWatchlist,
    isInWatchlist,
    toggleFavorite,
    isFavorite,
    setProgress,
    setActiveGenre,
    setActiveNav,
    openSearch: () => setSearchOpen(true),
    closeSearch: () => setSearchOpen(false),
    openPlayer: (m: Movie) => setPlayerMovie(m),
    closePlayer: () => setPlayerMovie(null),
    openDetail: (m: Movie) => setDetailMovie(m),
    closeDetail: () => setDetailMovie(null),
    toggleSidebar: () => setSidebarOpen((v) => !v),
    activeProfile,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}
