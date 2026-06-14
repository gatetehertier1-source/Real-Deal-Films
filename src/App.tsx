import { useEffect, useState } from "react";
import { StoreProvider, useStore } from "./store/useStore";
import { 
  getAllMovies, 
  getFeaturedMovies, 
  getTrendingMovies, 
  getNewReleases, 
  getContentRails,
  getMoviesByGenreName,
  type Movie,
} from "./data/tmdb";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import Hero from "./components/Hero";
import ContentRail from "./components/ContentRail";
import MovieCard from "./components/MovieCard";
import SearchModal from "./components/SearchModal";
import DetailModal from "./components/DetailModal";
import VideoPlayer from "./components/VideoPlayer";
import WelcomeAnimation from "./components/WelcomeAnimation";
import { IconSpark, IconTrending, IconFlame, IconStar, IconBookmark, IconPlay } from "./components/Icons";

function Shell() {
  const { watchlist, favorites, watched, activeGenre, openSearch, activeProfile, setActiveGenre, activeNav, setActiveNav } = useStore();
  
  // Welcome animation state
  const [showWelcome, setShowWelcome] = useState(true);
  
  // Real movie data from TMDb
  const [movies, setMovies] = useState<Movie[]>([]);
  const [featured, setFeatured] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Handle welcome animation complete
  const handleWelcomeComplete = () => {
    setShowWelcome(false);
  };

  // Fetch movies on mount
  useEffect(() => {
    const loadMovies = async () => {
      try {
        setIsLoading(true);
        const allMovies = await getAllMovies();
        setMovies(allMovies);
        setFeatured(getFeaturedMovies(allMovies));
        setError(null);
      } catch (err) {
        console.error("Failed to load movies:", err);
        setError("Failed to load movies. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    loadMovies();
  }, []);

  // ⌘K / Ctrl+K to open search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openSearch();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openSearch]);

  // Filter movies for different sections
  const watchedIds = Object.entries(watched)
    .filter(([, p]) => p > 0.02 && p < 0.98)
    .map(([id]) => Number(id));
  const continueWatching = watchedIds
    .map((id) => movies.find((m) => m.id === id))
    .filter((m): m is Movie => Boolean(m));

  const watchlistMovies = watchlist
    .map((id) => movies.find((m) => m.id === id))
    .filter((m): m is Movie => Boolean(m));

  const favoriteMovies = favorites
    .map((id) => movies.find((m) => m.id === id))
    .filter((m): m is Movie => Boolean(m));

  // Filter content based on active navigation
  const getFilteredContent = (): Movie[] | null => {
    switch (activeNav) {
      case "trending":
        return getTrendingMovies(movies);
      case "new":
        return getNewReleases(movies);
      case "movies":
        return movies;
      case "originals":
        return featured;
      case "watchlist":
        return watchlistMovies;
      case "favorites":
        return favoriteMovies;
      case "home":
      default:
        return null; // Show all rails
    }
  };

  const filteredContent = getFilteredContent();
  const allRails = getContentRails(movies);
  const genreMovies = activeGenre !== "All" ? getMoviesByGenreName(movies, activeGenre) : [];

  if (showWelcome) {
    return <WelcomeAnimation onComplete={handleWelcomeComplete} />;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-obsidian text-ink flex items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-white/20 border-t-crimson mx-auto mb-4" />
          <p className="text-ink-dim">Loading cinematic content...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-obsidian text-ink flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="text-5xl mb-4">🎬</div>
          <h2 className="text-xl font-bold text-ink mb-2">Something went wrong</h2>
          <p className="text-ink-dim mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="rounded-full bg-gradient-to-r from-crimson to-crimson-hot px-6 py-2 text-sm font-semibold text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Welcome Animation */}
      {showWelcome && <WelcomeAnimation onComplete={handleWelcomeComplete} />}
      
      <div className="min-h-screen bg-obsidian text-ink">
        <div className="flex">
        <Sidebar />
        <main className="min-w-0 flex-1">
          <TopBar />

          {/* Hero - pass featured movies */}
          {featured.length > 0 && <Hero featuredMovies={featured} />}

          {/* Category hero strip */}
          <section className="mx-auto -mt-6 max-w-[1800px] px-4 md:px-8">
            <div className="glass-strong flex flex-wrap items-center gap-3 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-crimson-hot">
                <IconSpark size={14} /> Browsing as
              </div>
              <span
                className="grid h-7 w-7 place-items-center rounded-full text-sm"
                style={{ background: `linear-gradient(135deg, ${activeProfile.color}, ${activeProfile.color}66)` }}
              >
                {activeProfile.avatar}
              </span>
              <span className="text-[13.5px] font-semibold text-ink">{activeProfile.name}</span>
              <span className="mx-2 hidden h-5 w-px bg-border-glass md:block" />
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { label: "All", id: "home" },
                  { label: "Trending", id: "trending" },
                  { label: "New", id: "new" },
                  { label: "Top Rated", id: "movies" },
                ].map((t) => {
                  const active = activeNav === t.id;
                  return (
                    <button
                      key={t.label}
                      onClick={() => setActiveNav(t.id as any)}
                      className={`rounded-full px-3 py-1.5 text-[12.5px] font-medium transition ${
                        active
                          ? "bg-gradient-to-r from-crimson to-crimson-hot text-white shadow-neon-crimson"
                          : "border border-border-glass bg-white/[0.03] text-ink-dim hover:bg-white/[0.06] hover:text-ink"
                      }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
              <div className="ml-auto hidden items-center gap-2 text-[11.5px] text-ink-dim md:flex">
                <span className="flex items-center gap-1.5"><IconTrending size={12} className="text-teal" /> Live audience</span>
                <span className="font-mono text-ink">2,418,902</span>
              </div>
            </div>
          </section>

          {/* Continue watching */}
          {continueWatching.length > 0 && (
            <ContentRail label={`Continue Watching for ${activeProfile.name}`} items={continueWatching} eyebrow="Resume" />
          )}

          {/* Watchlist */}
          {watchlistMovies.length > 0 && (
            <ContentRail label={`${activeProfile.name}'s Watchlist`} items={watchlistMovies} eyebrow="My List" />
          )}

          {/* Empty watchlist call to action */}
          {watchlistMovies.length === 0 && (
            <section className="mx-auto max-w-[1800px] px-4 md:px-8">
              <div className="glass mt-6 flex flex-wrap items-center gap-4 rounded-2xl p-6">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-teal/20 to-teal/5 text-teal">
                  <IconBookmark size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-teal">Your Watchlist</div>
                  <h3 className="text-lg font-bold text-ink">Start building your personal queue</h3>
                  <p className="text-sm text-ink-dim">Tap the <span className="text-ink">+</span> icon on any title to save it here. We'll also sync progress across devices.</p>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-border-glass bg-white/[0.03] px-3 py-1.5 text-[11.5px] text-ink-dim">
                  <IconPlay size={12} /> Tip: hover any card
                </div>
              </div>
            </section>
          )}

          {/* Genre filtered view */}
          {activeGenre !== "All" && (
            <section className="mx-auto max-w-[1800px] px-4 py-8 md:px-8">
              <div className="mb-4 flex items-end justify-between">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.35em] text-crimson-hot">Filtered</div>
                  <h2 className="text-2xl font-bold text-ink md:text-3xl">{activeGenre} <span className="text-ink-mute">· {genreMovies.length}</span></h2>
                </div>
                <button onClick={() => setActiveGenre("All")} className="rounded-full border border-border-glass bg-white/[0.03] px-3 py-1.5 text-[12px] text-ink-dim hover:text-ink">
                  Clear filter
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {genreMovies.map((m) => (
                  <MovieCard key={m.id} movie={m} compact />
                ))}
              </div>
            </section>
          )}

          {/* Navigation filtered view */}
          {filteredContent && (
            <section className="mx-auto max-w-[1800px] px-4 py-8 md:px-8">
              <div className="mb-6 flex items-end justify-between">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.35em] text-crimson-hot">
                    {activeNav === "watchlist" ? "Your Collection" : activeNav === "favorites" ? "Loved" : "Curated"}
                  </div>
                  <h2 className="text-2xl font-bold text-ink md:text-3xl">
                    {activeNav === "trending" && "Trending Now"}
                    {activeNav === "new" && "New Releases"}
                    {activeNav === "movies" && "All Movies"}
                    {activeNav === "originals" && "Reel Deal Originals"}
                    {activeNav === "watchlist" && `${activeProfile.name}'s Watchlist`}
                    {activeNav === "favorites" && `${activeProfile.name}'s Favorites`}
                    <span className="text-ink-mute"> · {filteredContent.length}</span>
                  </h2>
                </div>
                <button 
                  onClick={() => setActiveNav("home")} 
                  className="rounded-full border border-border-glass bg-white/[0.03] px-4 py-2 text-[12px] text-ink-dim hover:text-ink transition"
                >
                  ← Back to Home
                </button>
              </div>
              {filteredContent.length === 0 ? (
                <div className="grid place-items-center rounded-3xl border border-dashed border-border-glass bg-white/[0.02] py-24 text-center">
                  <div className="text-5xl">🎬</div>
                  <div className="mt-4 text-lg font-semibold text-ink">
                    {activeNav === "watchlist" ? "Your watchlist is empty" : activeNav === "favorites" ? "No favorites yet" : "No content found"}
                  </div>
                  <div className="mt-1 text-sm text-ink-dim">
                    {activeNav === "watchlist" ? "Add movies to your watchlist to see them here." : activeNav === "favorites" ? "Heart your favorite films to save them here." : "Try a different filter."}
                  </div>
                  <button 
                    onClick={() => setActiveNav("home")}
                    className="mt-4 rounded-full bg-gradient-to-r from-crimson to-crimson-hot px-5 py-2 text-sm font-semibold text-white shadow-neon-crimson"
                  >
                    Browse Home
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {filteredContent.map((m) => (
                    <MovieCard key={m.id} movie={m} compact />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Dynamic rails - only show on home */}
          {!filteredContent && allRails.map((r, i) => (
            <ContentRail
              key={r.label}
              label={r.label}
              items={r.items}
              eyebrow={["Row 01", "Row 02", "Row 03", "Row 04", "Row 05", "Row 06", "Row 07"][i]}
            />
          ))}

          {/* Stats strip */}
          <section className="mx-auto max-w-[1800px] px-4 pb-4 md:px-8">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                { icon: IconTrending, label: "Titles streaming", value: movies.length.toLocaleString(), sub: "curated" },
                { icon: IconFlame, label: "New this week", value: getNewReleases(movies).length.toString(), sub: "fresh drops" },
                { icon: IconStar, label: "Avg. rating", value: "8.4", sub: "critics & users" },
                { icon: IconSpark, label: "Match accuracy", value: "96%", sub: "personalized" },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="glass rounded-2xl p-5">
                    <div className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.3em] text-ink-mute">
                      <Icon size={14} className="text-crimson-hot" /> {s.label}
                    </div>
                    <div className="mt-2 text-3xl font-black text-ink">{s.value}</div>
                    <div className="text-[11.5px] text-ink-dim">{s.sub}</div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Marquee */}
          <section className="relative overflow-hidden border-y border-border-glass bg-obsidian-2/50">
            <div className="flex w-max animate-marquee items-center gap-10 py-4 text-[11px] font-semibold uppercase tracking-[0.35em] text-ink-mute">
              {Array.from({ length: 2 }).map((_, k) => (
                <div key={k} className="flex items-center gap-10">
                  {["THE REEL DEAL", "4K HDR", "DOLBY ATMOS", "ZERO ADS", "OFFLINE DOWNLOADS", "4 SIMULTANEOUS STREAMS", "CINEMATIC AUDIO", "CURATED FILMS", "PERSONALIZED QUEUES", "LIVE PREMIERES"].map((t) => (
                    <span key={t + k} className="flex items-center gap-3 whitespace-nowrap">
                      <span className="h-1 w-1 rounded-full bg-crimson" />
                      {t}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </section>

          {/* Footer */}
          <footer className="mx-auto max-w-[1800px] px-4 py-14 md:px-8">
            <div className="grid gap-10 md:grid-cols-4">
              <div className="md:col-span-2">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-crimson to-crimson-hot shadow-neon-crimson text-xl">
                    🎬
                  </div>
                  <div>
                    <div className="text-[15px] font-black tracking-[0.1em] text-ink">The Reel Deal <span className="text-gradient-crimson">Films</span></div>
                    <div className="text-[10px] font-medium uppercase tracking-[0.3em] text-ink-mute">PREMIUM CINEMA · ON DEMAND</div>
                  </div>
                </div>
                <p className="mt-4 max-w-md text-[13.5px] leading-relaxed text-ink-dim">
                  A premium streaming platform engineered for film lovers. Cinematic discovery, curated collections, and personalized queues — all inside a deliberately crafted interface for the ultimate movie night experience.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {["iOS", "Android", "tvOS", "Web", "PlayStation", "Xbox"].map((p) => (
                    <span key={p} className="rounded-full border border-border-glass bg-white/[0.03] px-3 py-1.5 text-[11.5px] text-ink-dim">{p}</span>
                  ))}
                </div>
              </div>
              {[
                { title: "Product", items: ["Films", "Series", "Live Events", "Reel Deal Originals", "Downloads"] },
                { title: "Company", items: ["About", "Press", "Careers", "Privacy", "Terms"] },
              ].map((col) => (
                <div key={col.title}>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.35em] text-crimson-hot">{col.title}</div>
                  <ul className="mt-4 space-y-2 text-[13px] text-ink-dim">
                    {col.items.map((i) => (
                      <li key={i} className="transition hover:text-ink">{i}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border-glass pt-6 text-[11.5px] text-ink-mute">
              <span>© {new Date().getFullYear()} The Reel Deal Films · All rights reserved.</span>
              <span className="font-mono">build 2.6.1 · optimized for 4K HDR</span>
            </div>
          </footer>
        </main>
      </div>

      <SearchModal movies={movies} />
      <DetailModal />
      <VideoPlayer />
    </div>
    </>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}
