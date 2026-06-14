import { useEffect, useRef, useState } from "react";
import type { Movie } from "../data/tmdb";
import { useStore } from "../store/useStore";
import { IconPlay, IconInfo, IconPlus, IconCheck, IconChevronLeft, IconChevronRight, IconStar, IconClock, IconSpark } from "./Icons";

interface HeroProps {
  featuredMovies: Movie[];
}

export default function Hero({ featuredMovies }: HeroProps) {
  const slides = featuredMovies.length > 0 ? featuredMovies.slice(0, 5) : [];
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (paused) return;
    timer.current = window.setTimeout(() => setIdx((i) => (i + 1) % slides.length), 7000);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [idx, paused, slides.length]);

  const current = slides[idx];

  return (
    <section
      className="relative isolate overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Backdrops stack */}
      <div className="relative h-[78vh] min-h-[560px] w-full">
        {slides.map((s, i) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-[1400ms] ease-out ${
              i === idx ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={s.backdrop}
              alt={s.title}
              loading={i === 0 ? "eager" : "lazy"}
              className="h-full w-full object-cover"
            />
            {/* Layered cinematic overlays */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,transparent_0%,rgba(8,8,12,0.55)_55%,#08080C_95%)]" />
            <div className="absolute inset-0 bg-gradient-to-r from-obsidian via-obsidian/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/30 to-transparent" />
            {/* Subtle scanline / grain */}
            <div className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-overlay" style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/></svg>\")" }} />
            {/* Accent tint */}
            <div className="pointer-events-none absolute inset-0 opacity-40 mix-blend-screen" style={{ background: `radial-gradient(60% 60% at 75% 30%, ${s.trailerColor}33, transparent 70%)` }} />
          </div>
        ))}

        {/* Top grid accent */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 grid-bg opacity-40 mask-fade-b" />

        {/* Scan line */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal/60 to-transparent animate-scan" />

        {/* Content */}
        <div className="relative z-10 mx-auto flex h-full max-w-[1800px] flex-col justify-end px-4 pb-16 md:px-8 md:pb-20">
          <HeroContent movie={current} key={current.id} />
        </div>

        {/* Slide arrows */}
        <button
          aria-label="Previous"
          onClick={() => setIdx((i) => (i - 1 + slides.length) % slides.length)}
          className="absolute left-4 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-border-glass bg-obsidian/60 p-3 text-ink backdrop-blur-md transition hover:bg-obsidian md:grid"
        >
          <IconChevronLeft size={20} />
        </button>
        <button
          aria-label="Next"
          onClick={() => setIdx((i) => (i + 1) % slides.length)}
          className="absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-border-glass bg-obsidian/60 p-3 text-ink backdrop-blur-md transition hover:bg-obsidian md:grid"
        >
          <IconChevronRight size={20} />
        </button>

        {/* Slide indicators */}
        <div className="absolute bottom-6 right-4 z-10 hidden items-center gap-2 md:flex md:right-8">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setIdx(i)}
              className="group relative h-1.5 overflow-hidden rounded-full bg-white/15"
              style={{ width: i === idx ? 64 : 28 }}
              aria-label={`Slide ${i + 1}`}
            >
              <span
                className={`absolute inset-y-0 left-0 bg-gradient-to-r from-crimson to-crimson-hot ${
                  i === idx ? "animate-[pulseSlow]" : ""
                }`}
                style={{ width: i === idx ? "100%" : "0%", transition: "width 150ms linear" }}
              />
              {i === idx && (
                <span
                  className="absolute inset-y-0 left-0 bg-white/30"
                  style={{ animation: paused ? "none" : "progress 7s linear forwards" }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <style>{`@keyframes progress { from { width: 0%; } to { width: 100%; } }`}</style>
    </section>
  );
}

function HeroContent({ movie }: { movie: Movie }) {
  const { openPlayer, openDetail, toggleWatchlist, isInWatchlist } = useStore();
  const inList = isInWatchlist(movie.id);

  return (
    <div className="max-w-2xl">
      {/* Eyebrow */}
          <div className="mb-4 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.35em]">
            <span className="rounded-full border border-crimson/40 bg-crimson/10 px-2.5 py-1 text-crimson-hot">
              🎬 REEL DEAL ORIGINAL
            </span>
        <span className="rounded-full border border-teal/30 bg-teal/10 px-2.5 py-1 text-teal">
          <IconSpark size={12} className="mr-1 inline -translate-y-[1px]" />
          FEATURED TONIGHT
        </span>
        <span className="text-ink-dim">{movie.year} · {movie.duration}</span>
      </div>

      {/* Title treatment */}
      <h1 className="text-[clamp(2.5rem,6vw,5.5rem)] font-black leading-[0.95] tracking-tight text-ink">
        <span className="block text-gradient-crimson drop-shadow-[0_4px_30px_rgba(229,9,20,0.35)]">
          {movie.title}
        </span>
      </h1>

      {/* Meta row */}
      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13.5px] text-ink-dim">
        <span className="flex items-center gap-1.5 font-semibold text-amber-300">
          <IconStar size={14} /> {movie.rating.toFixed(1)}
          <span className="text-ink-mute">/10</span>
        </span>
        <span className="flex items-center gap-1.5 text-teal">
          <IconSpark size={14} /> {movie.match}% Match
        </span>
        <span className="flex items-center gap-1.5"><IconClock size={14} /> {movie.duration}</span>
        <span className="rounded border border-border-strong px-1.5 py-0.5 font-mono text-[10px] text-ink-dim">HD · 5.1 · HDR</span>
      </div>

      {/* Logline */}
      <p className="mt-5 max-w-xl text-[15.5px] leading-relaxed text-ink/90">
        {movie.logline}
      </p>

      {/* Genres chips */}
      <div className="mt-5 flex flex-wrap gap-2">
        {movie.genres.map((g) => (
          <span key={g} className="rounded-full border border-border-glass bg-white/[0.04] px-3 py-1 text-[11.5px] font-medium text-ink-dim">
            {g}
          </span>
        ))}
      </div>

      {/* CTAs */}
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button
          onClick={() => openPlayer(movie)}
          className="group inline-flex items-center gap-2.5 rounded-xl bg-white px-6 py-3 text-[14.5px] font-bold text-obsidian transition hover:bg-crimson hover:text-white"
        >
          <span className="grid h-7 w-7 place-items-center rounded-full bg-obsidian text-white group-hover:bg-white group-hover:text-crimson">
            <IconPlay size={14} />
          </span>
          PLAY TRAILER
        </button>
        <button
          onClick={() => openDetail(movie)}
          className="inline-flex items-center gap-2.5 rounded-xl border border-border-strong bg-obsidian/50 px-6 py-3 text-[14.5px] font-semibold text-ink backdrop-blur-md transition hover:bg-white/[0.06]"
        >
          <IconInfo size={16} /> MORE INFO
        </button>
        <button
          onClick={() => toggleWatchlist(movie.id)}
          className={`grid h-12 w-12 place-items-center rounded-xl border transition ${
            inList
              ? "border-teal/50 bg-teal/10 text-teal shadow-neon-teal"
              : "border-border-glass bg-white/[0.03] text-ink-dim hover:bg-white/[0.06] hover:text-ink"
          }`}
          title={inList ? "Remove from watchlist" : "Add to watchlist"}
        >
          {inList ? <IconCheck size={18} /> : <IconPlus size={18} />}
        </button>
      </div>

      {/* Cast strip */}
      <div className="mt-8 flex items-center gap-3 text-[12px] text-ink-dim">
        <span className="font-semibold uppercase tracking-[0.25em] text-ink-mute">Starring</span>
        <div className="flex -space-x-2">
          {movie.cast.slice(0, 4).map((c, i) => (
            <span
              key={c}
              className="grid h-8 w-8 place-items-center rounded-full border border-border-strong text-[10px] font-semibold text-ink"
              style={{ background: `linear-gradient(135deg, hsl(${(i * 57) % 360} 50% 25%), hsl(${(i * 57 + 40) % 360} 50% 15%))` }}
              title={c}
            >
              {c.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </span>
          ))}
        </div>
        <span className="truncate">{movie.cast.slice(0, 3).join(" · ")} · Dir. {movie.director}</span>
      </div>
    </div>
  );
}
