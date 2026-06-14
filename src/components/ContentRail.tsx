import { useRef } from "react";
import type { Movie } from "../data/tmdb";
import MovieCard from "./MovieCard";
import { IconChevronLeft, IconChevronRight } from "./Icons";

type Props = {
  label: string;
  items: Movie[];
  variant?: "poster" | "backdrop";
  compact?: boolean;
  eyebrow?: string;
};

export default function ContentRail({ label, items, variant = "poster", compact, eyebrow }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    if (!ref.current) return;
    const card = ref.current.querySelector<HTMLDivElement>("[data-card]");
    const step = (card?.offsetWidth ?? 240) + 16;
    ref.current.scrollBy({ left: dir * step * 3, behavior: "smooth" });
  };

  if (items.length === 0) return null;

  return (
    <section className="relative py-8">
      <div className="mx-auto max-w-[1800px] px-4 md:px-8">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            {eyebrow && (
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-crimson-hot">
                {eyebrow}
              </div>
            )}
            <h2 className="flex items-center gap-3 text-[22px] font-bold tracking-tight text-ink md:text-[26px]">
              <span className="inline-block h-5 w-1 rounded-full bg-gradient-to-b from-crimson to-crimson-hot" />
              {label}
              <span className="text-[12px] font-medium text-ink-mute">· {items.length} titles</span>
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollBy(-1)}
              className="grid h-9 w-9 place-items-center rounded-full border border-border-glass bg-white/[0.03] text-ink-dim transition hover:bg-white/[0.06] hover:text-ink"
              aria-label="Scroll left"
            >
              <IconChevronLeft size={16} />
            </button>
            <button
              onClick={() => scrollBy(1)}
              className="grid h-9 w-9 place-items-center rounded-full border border-border-glass bg-white/[0.03] text-ink-dim transition hover:bg-white/[0.06] hover:text-ink"
              aria-label="Scroll right"
            >
              <IconChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="group/rail relative">
          {/* Edge fade masks */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-obsidian to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-obsidian to-transparent" />

          <div
            ref={ref}
            className="no-scrollbar flex snap-x gap-4 overflow-x-auto scroll-smooth pb-6 pt-2"
          >
            {items.map((m) => (
              <div key={m.id} data-card className="snap-start">
                <MovieCard movie={m} variant={variant} compact={compact} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
