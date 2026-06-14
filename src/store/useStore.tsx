import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Movie } from "../data/tmdb";

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

  // Persist
  useEffect(() => {
    const payload = { activeProfileId, watchlist, watched, activeGenre };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      /* ignore */
    }
  }, [activeProfileId, watchlist, watched, activeGenre]);

  // Lock body scroll when player/search open
  useEffect(() => {
    const locked = playerMovie !== null || searchOpen;
    document.body.style.overflow = locked ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [playerMovie, searchOpen]);

  const toggleWatchlist = useCallback((id: number) => {
    setWatchlist((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const isInWatchlist = useCallback((id: number) => watchlist.includes(id), [watchlist]);

  const toggleFavorite = useCallback((id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const isFavorite = useCallback((id: number) => favorites.includes(id), [favorites]);

  const setProgress = useCallback((id: number, p: number) => {
    setWatched((prev) => ({ ...prev, [id]: Math.max(0, Math.min(1, p)) }));
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
