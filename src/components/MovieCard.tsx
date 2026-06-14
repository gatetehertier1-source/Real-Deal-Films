import { useState } from "react";
import type { Movie } from "../data/tmdb";
import { useStore } from "../store/useStore";
import { IconPlay, IconPlus, IconCheck, IconInfo, IconStar, IconClock, IconHeart } from "./Icons";

type Props = {
  movie: Movie;
  variant?: "poster" | "backdrop";
  compact?: boolean;
};

export default function MovieCard({ movie, variant = "poster", compact = false }: Props) {
  const { openPlayer, openDetail, toggleWatchlist, isInWatchlist, toggleFavorite, isFavorite, watched } = useStore();
  const inList = isInWatchlist(movie.id);
  const inFavorites = isFavorite(movie.id);
  const progress = watched[movie.id] ?? 0;
  const [hover, setHover] = useState(false);

  const isBackdrop = variant === "backdrop";
  const aspect = isBackdrop ? "aspect-[16/10]" : "aspect-[2/3]";
  const src = isBackdrop ? movie.backdrop : movie.poster;

  return (
    <div
      className={`group relative shrink-0 ${compact ? "w-40 md:w-48" : "w-44 md:w-56"}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Card */}
      <button
        onClick={() => openDetail(movie)}
        className={`relative block w-full overflow-hidden rounded-2xl border border-border-glass bg-obsidian-3 text-left transition-all duration-500 ${aspect} ${
          hover
            ? "scale-[1.04] border-border-strong shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8),0_0_0_1px_rgba(229,9,20,0.25)]"
            : "hover:border-border-strong"
        }`}
      >
        <img
          src={src}
          alt={movie.title}
          loading="lazy"
          className={`h-full w-full object-cover transition-transform duration-[1200ms] ease-out ${
            hover ? "scale-110" : "scale-100"
          }`}
        />

        {/* Gradient readability layer */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/30 to-transparent" />

        {/* Accent corner */}
        <div
          className="pointer-events-none absolute left-0 top-0 h-1 w-16 origin-left scale-x-0 bg-gradient-to-r from-crimson to-transparent transition-transform duration-500 group-hover:scale-x-100"
          style={{ borderTopLeftRadius: "1rem" }}
        />

        {/* Top-left badge */}
        <div className="absolute left-3 top-3 flex items-center gap-1.5">
          {movie.newRelease && (
            <span className="rounded-md bg-crimson px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-white shadow-neon-crimson">NEW</span>
          )}
          {movie.trending && !movie.newRelease && (
            <span className="rounded-md border border-teal/40 bg-teal/15 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-teal">TRENDING</span>
          )}
        </div>

        {/* Top-right match */}
        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-md border border-border-strong bg-obsidian/70 px-1.5 py-0.5 text-[10px] font-bold text-teal backdrop-blur">
          <span className="h-1 w-1 rounded-full bg-teal shadow-[0_0_8px_rgba(0,242,254,0.8)]" />
          {movie.match}%
        </div>

        {/* Bottom title (always visible) */}
        <div className="absolute inset-x-0 bottom-0 p-3">
          <div className="flex items-end justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-[13.5px] font-bold leading-tight text-ink">{movie.title}</h3>
              <div className="mt-1 flex items-center gap-2 text-[11px] text-ink-dim">
                <span className="flex items-center gap-1 text-amber-300"><IconStar size={10} />{movie.rating.toFixed(1)}</span>
                <span>·</span>
                <span>{movie.year}</span>
                <span>·</span>
                <span className="flex items-center gap-1"><IconClock size={10} />{movie.duration}</span>
              </div>
            </div>
          </div>

          {/* Progress bar if watched */}
          {progress > 0 && (
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-gradient-to-r from-crimson to-crimson-hot"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
          )}
        </div>

        {/* Hover quick-actions */}
        <div
          className={`absolute inset-x-0 bottom-0 translate-y-2 p-3 transition-all duration-500 ${
            hover ? "translate-y-0 opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <div className="flex items-center gap-1.5 pt-10">
            <button
              onClick={(e) => { e.stopPropagation(); openPlayer(movie); }}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-[11.5px] font-bold text-obsidian transition hover:bg-crimson hover:text-white"
            >
              <IconPlay size={12} /> Play
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); toggleWatchlist(movie.id); }}
              className={`grid h-8 w-8 place-items-center rounded-lg border transition ${
                inList
                  ? "border-teal/50 bg-teal/15 text-teal"
                  : "border-border-strong bg-obsidian/70 text-ink hover:bg-white/10"
              }`}
              title={inList ? "Remove from list" : "Add to list"}
            >
              {inList ? <IconCheck size={14} /> : <IconPlus size={14} />}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); toggleFavorite(movie.id); }}
              className={`grid h-8 w-8 place-items-center rounded-lg border transition ${
                inFavorites
                  ? "border-crimson/50 bg-crimson/15 text-crimson-hot"
                  : "border-border-strong bg-obsidian/70 text-ink hover:bg-white/10"
              }`}
              title={inFavorites ? "Remove from favorites" : "Add to favorites"}
            >
              <IconHeart size={14} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); openDetail(movie); }}
              className="grid h-8 w-8 place-items-center rounded-lg border border-border-strong bg-obsidian/70 text-ink transition hover:bg-white/10"
              title="More info"
            >
              <IconInfo size={14} />
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {movie.genres.slice(0, 3).map((g, i) => (
              <span key={g} className="rounded-full bg-white/[0.06] px-1.5 py-0.5 text-[9.5px] font-medium text-ink-dim">
                {g}{i < Math.min(movie.genres.length, 3) - 1 ? "" : ""}
              </span>
            ))}
          </div>
        </div>
      </button>
    </div>
  );
}
