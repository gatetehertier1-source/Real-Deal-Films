import { useEffect } from "react";
import { useStore } from "../store/useStore";
import MovieCard from "./MovieCard";
import {
  IconPlay, IconPlus, IconCheck, IconClose, IconStar, IconClock,
  IconSpark, IconVolume, IconChevronRight,
} from "./Icons";

export default function DetailModal() {
  const { detailMovie, closeDetail, openPlayer, toggleWatchlist, isInWatchlist } = useStore();
  const m = detailMovie;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && m) closeDetail();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [m, closeDetail]);

  if (!m) return null;
  const inList = isInWatchlist(m.id);

  // For related movies, we'll use a simplified approach since we don't have access to full catalog here
  // In a real app, you'd fetch related movies from the API
  const related: typeof m[] = [];

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/80 backdrop-blur-xl">
      <div className="mx-auto my-8 w-full max-w-5xl overflow-hidden rounded-3xl border border-border-strong bg-obsidian-2 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)]">
          {/* Hero */}
        <div className="relative h-[55vh] min-h-[420px] w-full overflow-hidden">
          <img src={m.backdrop} alt={m.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian-2 via-obsidian-2/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-obsidian-2 via-obsidian-2/60 to-transparent" />
          <div className="pointer-events-none absolute inset-0 opacity-30 mix-blend-screen" style={{ background: `radial-gradient(50% 50% at 70% 40%, ${m.trailerColor}55, transparent 70%)` }} />

          <button
            onClick={closeDetail}
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-black/60 text-white backdrop-blur transition hover:bg-white/10"
          >
            <IconClose size={18} />
          </button>

          <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
            <div className="mb-3 flex flex-wrap items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.3em]">
              <span className="rounded-full border border-crimson/40 bg-crimson/10 px-2.5 py-1 text-crimson-hot">
                <IconSpark size={12} className="mr-1 inline -translate-y-[1px]" /> 🎬 REEL DEAL
              </span>
              {m.newRelease && <span className="rounded-full bg-white text-obsidian px-2.5 py-1">NEW</span>}
              <span className="text-ink-dim">{m.year}</span>
            </div>
            <h2 className="text-4xl font-black leading-tight tracking-tight text-ink md:text-6xl">
              <span className="text-gradient-crimson">{m.title}</span>
            </h2>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-ink-dim">
              <span className="flex items-center gap-1.5 font-semibold text-amber-300"><IconStar size={14} /> {m.rating.toFixed(1)}<span className="text-ink-mute">/10</span></span>
              <span className="flex items-center gap-1.5 text-teal"><IconSpark size={14} /> {m.match}% Match</span>
              <span className="flex items-center gap-1.5"><IconClock size={14} /> {m.duration}</span>
              <span className="rounded border border-border-strong px-1.5 py-0.5 font-mono text-[10px]">HD · HDR</span>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => { openPlayer(m); }}
                className="group inline-flex items-center gap-2.5 rounded-xl bg-white px-6 py-3 text-[14px] font-bold text-obsidian transition hover:bg-crimson hover:text-white"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-obsidian text-white group-hover:bg-white group-hover:text-crimson"><IconPlay size={14} /></span>
                PLAY
              </button>
              <button
                onClick={() => toggleWatchlist(m.id)}
                className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-[13.5px] font-semibold transition ${
                  inList
                    ? "border-teal/50 bg-teal/10 text-teal shadow-neon-teal"
                    : "border-border-strong bg-black/50 text-ink hover:bg-white/[0.06]"
                }`}
              >
                {inList ? <IconCheck size={16} /> : <IconPlus size={16} />}
                {inList ? "In Watchlist" : "Add to Watchlist"}
              </button>
              <button className="grid h-12 w-12 place-items-center rounded-xl border border-border-strong bg-black/50 text-ink transition hover:bg-white/[0.06]" title="Trailer audio">
                <IconVolume size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="grid gap-8 p-6 md:grid-cols-3 md:p-10">
          <div className="md:col-span-2">
            <div className="mb-4 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-ink-mute">
              <span>Overview</span>
              <span className="h-px flex-1 bg-border-glass" />
            </div>
            <p className="text-[15.5px] leading-relaxed text-ink/90">{m.overview}</p>

            <div className="mt-6 grid grid-cols-2 gap-4 text-[13px] sm:grid-cols-3">
              <Info label="Genres" value={m.genres.join(", ")} />
              <Info label="Director" value={m.director} />
              <Info label="Year" value={String(m.year)} />
              <Info label="Runtime" value={m.duration} />
              <Info label="Rating" value={`${m.rating.toFixed(1)} / 10`} />
              <Info label="Match" value={`${m.match}%`} accent />
            </div>

            <div className="mt-8">
              <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-ink-mute">
                <span>Cast</span>
                <span className="h-px flex-1 bg-border-glass" />
              </div>
              <div className="flex flex-wrap gap-2">
                {m.cast.map((c, i) => (
                  <span key={c} className="flex items-center gap-2 rounded-full border border-border-glass bg-white/[0.03] px-3 py-1.5 text-[12.5px] text-ink">
                    <span
                      className="grid h-6 w-6 place-items-center rounded-full text-[10px] font-bold text-white"
                      style={{ background: `linear-gradient(135deg, hsl(${(i * 57) % 360} 60% 35%), hsl(${(i * 57 + 40) % 360} 60% 20%))` }}
                    >
                      {c.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </span>
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar: similar */}
          <aside>
            <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-ink-mute">
              <span>More Like This</span>
              <IconChevronRight size={14} />
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-1">
              {related.map((r) => (
                <MovieCard key={r.id} movie={r} compact />
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-border-glass bg-white/[0.02] p-3">
      <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-ink-mute">{label}</div>
      <div className={`mt-1 text-[13.5px] font-medium ${accent ? "text-teal" : "text-ink"}`}>{value}</div>
    </div>
  );
}
