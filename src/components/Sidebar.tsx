import { useStore } from "../store/useStore";
import {
  IconHome, IconFilm, IconTrending, IconFlame, IconSpark,
  IconBookmark, IconHeart, IconUser, IconChevronLeft, IconChevronRight,
} from "./Icons";

const NAV = [
  { id: "home", label: "Home", icon: IconHome, primary: true },
  { id: "trending", label: "Trending", icon: IconTrending },
  { id: "new", label: "New Releases", icon: IconFlame },
  { id: "movies", label: "Movies", icon: IconFilm },
  { id: "originals", label: "Reel Deal Originals", icon: IconSpark },
  { id: "watchlist", label: "My Watchlist", icon: IconBookmark },
  { id: "favorites", label: "Favorites", icon: IconHeart },
];

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar, activeGenre, setActiveGenre, activeNav, setActiveNav } = useStore();

  return (
    <aside
      className={`group/side sticky top-0 z-30 hidden h-screen shrink-0 border-r border-border-glass/60 bg-obsidian-2/60 backdrop-blur-xl transition-[width] duration-500 md:flex md:flex-col ${
        sidebarOpen ? "md:w-64" : "md:w-20"
      }`}
    >
        {/* Brand */}
      <div className="flex items-center gap-3 px-5 pt-6 pb-4">
        <div className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-crimson to-crimson-hot shadow-neon-crimson">
          <span className="text-xl">🎬</span>
          <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_50%)]" />
        </div>
        <div className={`overflow-hidden transition-all ${sidebarOpen ? "w-auto opacity-100" : "w-0 opacity-0"}`}>
          <div className="whitespace-nowrap text-[15px] font-bold tracking-[0.12em] text-ink">The Reel Deal</div>
          <div className="whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.3em] text-ink-dim">FILMS · v2.6</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="mt-2 flex-1 overflow-y-auto px-3 pb-6 no-scrollbar">
        <div className={`mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-ink-mute transition-opacity ${sidebarOpen ? "opacity-100" : "opacity-0"}`}>
          Discover
        </div>
        <ul className="space-y-1">
          {NAV.map((n) => {
            const Icon = n.icon;
            const active = activeNav === n.id;
            return (
              <li key={n.id}>
                <button
                  onClick={() => setActiveNav(n.id as any)}
                  className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                    active
                      ? "bg-gradient-to-r from-crimson/20 to-transparent text-white shadow-[inset_0_0_0_1px_rgba(229,9,20,0.35)]"
                      : "text-ink-dim hover:bg-white/[0.04] hover:text-ink"
                  }`}
                  title={n.label}
                >
                  <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${active ? "bg-crimson/20 text-crimson-hot" : "text-ink-dim group-hover:text-ink"}`}>
                    <Icon size={18} />
                  </span>
                  <span className={`truncate text-[13.5px] font-medium ${sidebarOpen ? "opacity-100" : "w-0 opacity-0"}`}>
                    {n.label}
                  </span>
                  {active && sidebarOpen && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-crimson shadow-[0_0_12px_2px_rgba(229,9,20,0.7)]" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Genres */}
        <div className="mt-6">
          <div className={`mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-ink-mute transition-opacity ${sidebarOpen ? "opacity-100" : "opacity-0"}`}>
            Genres
          </div>
          <ul className="space-y-1">
            {["All", "Action", "Adventure", "Animation", "Comedy", "Crime", "Drama", "Fantasy", "Horror", "Mystery", "Romance", "Sci-Fi", "Thriller"].slice(0, sidebarOpen ? 10 : 5).map((g) => {
              const active = activeGenre === g;
              return (
                <li key={g}>
                  <button
                    onClick={() => setActiveGenre(g)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13px] transition-all ${
                      active
                        ? "bg-teal/10 text-teal shadow-[inset_0_0_0_1px_rgba(0,242,254,0.35)]"
                        : "text-ink-dim hover:bg-white/[0.04] hover:text-ink"
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-teal shadow-[0_0_10px_rgba(0,242,254,0.8)]" : "bg-ink-mute"}`} />
                    <span className={`truncate ${sidebarOpen ? "opacity-100" : "w-0 opacity-0"}`}>{g}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Profile card */}
        <div className="mt-6">
          <ProfileCard expanded={sidebarOpen} />
        </div>
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="m-3 flex items-center justify-center gap-2 rounded-xl border border-border-glass bg-white/[0.03] py-2 text-xs text-ink-dim transition hover:bg-white/[0.06] hover:text-ink"
      >
        {sidebarOpen ? <IconChevronLeft size={16} /> : <IconChevronRight size={16} />}
        <span className={`${sidebarOpen ? "inline" : "hidden"}`}>Collapse</span>
      </button>
    </aside>
  );
}

function ProfileCard({ expanded }: { expanded: boolean }) {
  const { activeProfile, profiles, setActiveProfile } = useStore();
  return (
    <div className="glass rounded-2xl p-3">
      <div className="flex items-center gap-3">
        <div
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-lg"
          style={{ background: `linear-gradient(135deg, ${activeProfile.color}33, ${activeProfile.color}11)`, boxShadow: `inset 0 0 0 1px ${activeProfile.color}55` }}
        >
          <span>{activeProfile.avatar}</span>
        </div>
        <div className={`min-w-0 flex-1 ${expanded ? "block" : "hidden"}`}>
          <div className="truncate text-[13px] font-semibold text-ink">{activeProfile.name}</div>
          <div className="truncate text-[11px] text-ink-dim">{profiles.length} profiles</div>
        </div>
        <IconUser size={16} className="text-ink-mute" />
      </div>
      {expanded && (
        <div className="mt-3 grid grid-cols-4 gap-2 border-t border-border-glass pt-3">
          {profiles.map((p) => (
            <button
              key={p.id}
              onClick={() => setActiveProfile(p.id)}
              title={p.name}
              className={`grid h-9 place-items-center rounded-lg text-base transition ${
                p.id === activeProfile.id
                  ? "ring-2 ring-offset-2 ring-offset-obsidian-2"
                  : "opacity-70 hover:opacity-100"
              }`}
              style={{
                background: `linear-gradient(135deg, ${p.color}44, ${p.color}11)`,
                // @ts-ignore custom ring color
                "--tw-ring-color": p.color,
              }}
            >
              {p.avatar}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
