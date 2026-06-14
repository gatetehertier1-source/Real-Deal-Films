import { useEffect, useRef, useState } from "react";
import { useStore } from "../store/useStore";
import { IconSearch, IconBell, IconMenu } from "./Icons";

export default function TopBar() {
  const { openSearch, activeProfile, toggleSidebar, activeNav, setActiveNav } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [time, setTime] = useState<string>("");
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setTime(
        d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }) +
          " · " +
          d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })
      );
      raf.current = window.setTimeout(tick, 30_000) as unknown as number;
    };
    tick();
    return () => {
      if (raf.current) clearTimeout(raf.current);
    };
  }, []);

  return (
    <header
      className={`sticky top-0 z-20 transition-all ${
        scrolled
          ? "border-b border-border-glass/60 bg-obsidian/80 backdrop-blur-xl"
          : "border-b border-transparent bg-gradient-to-b from-obsidian via-obsidian/70 to-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1800px] items-center gap-4 px-4 md:px-8">
        {/* Mobile menu */}
        <button
          onClick={toggleSidebar}
          className="grid h-10 w-10 place-items-center rounded-xl border border-border-glass bg-white/[0.03] text-ink-dim md:hidden"
        >
          <IconMenu size={18} />
        </button>

        {/* Wordmark */}
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-crimson to-crimson-hot text-white shadow-neon-crimson text-xl">
            🎬
          </div>
          <div className="hidden sm:block">
            <div className="text-[15px] font-black tracking-[0.1em] text-ink">The Reel Deal <span className="text-gradient-crimson">Films</span></div>
            <div className="text-[10px] font-medium uppercase tracking-[0.3em] text-ink-mute">PREMIUM CINEMA · ON DEMAND</div>
          </div>
        </div>

        {/* Primary nav pills */}
        <nav className="ml-6 hidden items-center gap-1 lg:flex">
          {[
            { label: "Home", id: "home" },
            { label: "Series", id: "movies" },
            { label: "Films", id: "movies" },
            { label: "New & Popular", id: "new" },
            { label: "My List", id: "watchlist" },
          ].map((t) => (
            <button
              key={t.label}
              onClick={() => setActiveNav(t.id as any)}
              className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition ${
                activeNav === t.id
                  ? "bg-white/[0.06] text-ink"
                  : "text-ink-dim hover:bg-white/[0.04] hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {/* Time / status */}
          <div className="hidden items-center gap-2 rounded-full border border-border-glass bg-white/[0.02] px-3 py-1.5 text-[11.5px] text-ink-dim md:flex">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-teal" />
            </span>
            <span className="font-mono">{time}</span>
          </div>

          {/* Search */}
          <button
            onClick={openSearch}
            className="group flex items-center gap-2 rounded-full border border-border-glass bg-white/[0.03] px-3 py-2 text-[13px] text-ink-dim transition hover:border-border-strong hover:bg-white/[0.06] hover:text-ink"
          >
            <IconSearch size={16} />
            <span className="hidden md:inline">Search titles, cast, genres…</span>
            <kbd className="ml-4 hidden rounded-md border border-border-strong bg-obsidian-3 px-1.5 py-0.5 font-mono text-[10px] text-ink-mute md:inline">⌘K</kbd>
          </button>

          {/* Notifications */}
          <button className="relative grid h-10 w-10 place-items-center rounded-full border border-border-glass bg-white/[0.03] text-ink-dim transition hover:bg-white/[0.06] hover:text-ink">
            <IconBell size={18} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-crimson shadow-[0_0_10px_rgba(229,9,20,0.8)]" />
          </button>

          {/* Profile */}
          <button
            className="group flex items-center gap-2 rounded-full border border-border-glass bg-white/[0.03] py-1 pl-1 pr-3 transition hover:border-border-strong"
            title={`Profile: ${activeProfile.name}`}
          >
            <span
              className="grid h-8 w-8 place-items-center rounded-full text-base"
              style={{ background: `linear-gradient(135deg, ${activeProfile.color}, ${activeProfile.color}66)`, boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.15)` }}
            >
              {activeProfile.avatar}
            </span>
            <span className="hidden text-[13px] font-medium text-ink sm:inline">{activeProfile.name}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
