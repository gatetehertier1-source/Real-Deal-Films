import { useEffect, useMemo, useRef, useState } from "react";
import { searchMovieCatalog, type Movie } from "../data/tmdb";
import { useStore } from "../store/useStore";
import MovieCard from "./MovieCard";
import { IconClose, IconSearch, IconFilm, IconSpark, IconTrending } from "./Icons";

const SUGGESTIONS = [
  "action", "adventure", "sci-fi", "thriller",
  "tom cruise", "christopher nolan", "marvel", "2024", "animation",
];

interface SearchModalProps {
  movies: Movie[];
}

export default function SearchModal({ movies }: SearchModalProps) {
  const { searchOpen, closeSearch } = useStore();
  const [q, setQ] = useState("");
  const [genre, setGenre] = useState("All");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQ("");
      setGenre("All");
    }
  }, [searchOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        // open handled by topbar listener in App
      }
      if (e.key === "Escape" && searchOpen) closeSearch();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen, closeSearch]);

  const results = useMemo(() => {
    const searched = searchMovieCatalog(movies, q);
    if (genre === "All") return searched;
    return searched.filter(m => m.genres.includes(genre));
  }, [q, genre, movies]);

  if (!searchOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-obsidian/95 backdrop-blur-2xl">
      {/* Decorative grid */}
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-30" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-crimson/10 to-transparent" />

      <div className="relative mx-auto max-w-[1600px] px-4 py-8 md:px-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-crimson to-crimson-hot text-white shadow-neon-crimson text-xl">
              🎬
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.35em] text-crimson-hot">The Reel Deal Films</div>
              <h2 className="text-2xl font-bold text-ink md:text-3xl">Find your next obsession</h2>
            </div>
          </div>
          <button
            onClick={closeSearch}
            className="grid h-11 w-11 place-items-center rounded-xl border border-border-glass bg-white/[0.04] text-ink-dim transition hover:bg-white/[0.08] hover:text-ink"
            aria-label="Close search"
          >
            <IconClose size={18} />
          </button>
        </div>

        {/* Input */}
        <div className="mt-8">
          <div className="glass-strong flex items-center gap-3 rounded-2xl px-5 py-4">
            <IconSearch size={22} className="text-ink-dim" />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search titles, directors, actors, genres…"
              className="w-full bg-transparent text-lg text-ink placeholder:text-ink-mute focus:outline-none md:text-xl"
            />
            {q && (
              <button onClick={() => setQ("")} className="rounded-full border border-border-glass px-2.5 py-1 text-[11px] text-ink-dim hover:text-ink">
                Clear
              </button>
            )}
            <kbd className="hidden rounded-md border border-border-strong bg-obsidian-3 px-2 py-1 font-mono text-[10px] text-ink-mute md:inline">ESC</kbd>
          </div>

          {/* Genre chips */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-ink-mute">Filter</span>
            {["All", "Action", "Adventure", "Animation", "Comedy", "Crime", "Drama", "Fantasy", "Horror", "Mystery", "Romance", "Sci-Fi", "Thriller"].map((g) => (
              <button
                key={g}
                onClick={() => setGenre(g)}
                className={`rounded-full border px-3 py-1.5 text-[12px] font-medium transition ${
                  genre === g
                    ? "border-teal/50 bg-teal/10 text-teal shadow-neon-teal"
                    : "border-border-glass bg-white/[0.03] text-ink-dim hover:bg-white/[0.06] hover:text-ink"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Suggestions when empty */}
        {q.trim() === "" && (
          <div className="mt-10">
            <div className="mb-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-ink-mute">
              <IconSpark size={14} className="text-teal" /> Trending Searches
            </div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setQ(s)}
                  className="group flex items-center gap-2 rounded-full border border-border-glass bg-white/[0.03] px-4 py-2 text-[13px] text-ink-dim transition hover:border-crimson/40 hover:bg-crimson/10 hover:text-crimson-hot"
                >
                  <IconTrending size={14} className="opacity-60 group-hover:opacity-100" />
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        <div className="mt-10">
          <div className="mb-4 flex items-end justify-between">
            <h3 className="flex items-center gap-2 text-lg font-bold text-ink">
              <IconFilm size={18} className="text-crimson-hot" />
              {q || genre !== "All" ? "Results" : "Everything"}
              <span className="text-sm font-medium text-ink-mute">· {results.length} titles</span>
            </h3>
          </div>

          {results.length === 0 ? (
            <div className="grid place-items-center rounded-3xl border border-dashed border-border-glass bg-white/[0.02] py-24 text-center">
              <div className="text-5xl">🔍</div>
              <div className="mt-4 text-lg font-semibold text-ink">Nothing in this dimension</div>
              <div className="mt-1 text-sm text-ink-dim">Try a different keyword or clear the genre filter.</div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {results.map((m) => (
                <MovieCard key={m.id} movie={m} compact />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
