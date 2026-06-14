// Simulated TMDb-style content catalog.
// In production, swap `getCatalog()` for Supabase Edge Functions calling TMDb API.

export type Movie = {
  id: number;
  title: string;
  year: number;
  rating: number;        // TMDB vote_average / 10
  match: number;         // our "match %" algorithmic score
  duration: string;
  genres: string[];
  cast: string[];
  director: string;
  logline: string;
  overview: string;
  backdrop: string;      // high-res hero
  poster: string;        // card poster
  logo?: string;         // title treatment (emoji / wordmark)
  accent: "crimson" | "teal" | "amber" | "violet";
  featured?: boolean;
  trending?: boolean;
  newRelease?: boolean;
  trailerColor: string;  // hex for gradient tint
};

// Using Unsplash / Picsum-style curated imagery for a cinematic feel.
// These URLs resolve to real, CDN-hosted photography.
const img = (seed: string, w = 1200, h = 675) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

const poster = (seed: string) =>
  `https://picsum.photos/seed/${seed}-p/600/900`;

export const GENRES = [
  "All", "Sci-Fi", "Thriller", "Action", "Drama",
  "Cyberpunk", "Mystery", "Horror", "Adventure", "Animation",
];

export const CATALOG: Movie[] = [
  {
    id: 1,
    title: "NEXUS PROTOCOL",
    year: 2026,
    rating: 9.2,
    match: 98,
    duration: "2h 18m",
    genres: ["Sci-Fi", "Cyberpunk", "Thriller"],
    cast: ["Rinko Kikuchi", "Oscar Isaac", "Tilda Swinton", "John David Washington"],
    director: "Denis Villeneuve",
    logline: "When a rogue AI rewrites the city's memory, one analyst must cross the grid to find the truth before she is erased.",
    overview: "In a neon-drenched megacity where memories are currency, a cyber-analyst uncovers a conspiracy that blurs the line between human and machine. As reality fractures, she must decide what is worth remembering — and what must be forgotten.",
    backdrop: img("nexus-protocol-hero", 1800, 1000),
    poster: poster("nexus-protocol"),
    logo: "◆ NEXUS",
    accent: "crimson",
    featured: true,
    trending: true,
    newRelease: true,
    trailerColor: "#E50914",
  },
  {
    id: 2,
    title: "Midnight in Kyoto",
    year: 2025,
    rating: 8.6,
    match: 94,
    duration: "1h 58m",
    genres: ["Drama", "Mystery"],
    cast: ["Ana de Armas", "Ken Watanabe", "Rila Fukushima"],
    director: "Kogonada",
    logline: "A translator inherits a letter-writing shop — and the ghosts of the people who wrote through her.",
    overview: "A quiet, meditative journey through grief, language, and the luminous in-between of two cultures.",
    backdrop: img("midnight-kyoto", 1800, 1000),
    poster: poster("midnight-kyoto"),
    accent: "teal",
    trending: true,
    trailerColor: "#00F2FE",
  },
  {
    id: 3,
    title: "ORBITAL DECAY",
    year: 2026,
    rating: 8.9,
    match: 92,
    duration: "2h 05m",
    genres: ["Sci-Fi", "Action", "Thriller"],
    cast: ["Mahershala Ali", "Rebecca Ferguson", "Pedro Pascal"],
    director: "Alex Garland",
    logline: "The last space station is dying. The crew has 90 minutes. The signal, they discover, is coming from inside.",
    overview: "A taut, zero-gravity thriller where every breath is a negotiation with physics — and with each other.",
    backdrop: img("orbital-decay", 1800, 1000),
    poster: poster("orbital-decay"),
    accent: "violet",
    featured: true,
    newRelease: true,
    trailerColor: "#8B5CF6",
  },
  {
    id: 4,
    title: "The Last Cartographer",
    year: 2024,
    rating: 8.1,
    match: 88,
    duration: "2h 12m",
    genres: ["Adventure", "Drama"],
    cast: ["Cillian Murphy", "Florence Pugh"],
    director: "Christopher Nolan (adjacent)",
    logline: "A mapmaker races a rival expedition across a continent that shouldn't exist.",
    overview: "Sweeping, IMAX-scale adventure with practical cinematography and a haunting score.",
    backdrop: img("last-cartographer", 1800, 1000),
    poster: poster("last-cartographer"),
    accent: "amber",
    trailerColor: "#F59E0B",
  },
  {
    id: 5,
    title: "GHOSTLINE 2099",
    year: 2026,
    rating: 8.4,
    match: 91,
    duration: "1h 49m",
    genres: ["Cyberpunk", "Action", "Sci-Fi"],
    cast: ["Zendaya", "Timothée Chalamet", "Lakeith Stanfield"],
    director: "The Daniels",
    logline: "A courier who delivers souls discovers the next package is herself.",
    overview: "Hyper-stylized, kinetic cyberpunk with a surprisingly tender core.",
    backdrop: img("ghostline-2099", 1800, 1000),
    poster: poster("ghostline-2099"),
    accent: "crimson",
    trending: true,
    trailerColor: "#FF2A3A",
  },
  {
    id: 6,
    title: "Silent Tides",
    year: 2025,
    rating: 7.9,
    match: 85,
    duration: "1h 42m",
    genres: ["Drama", "Mystery"],
    cast: ["Emily Blunt", "Paul Mescal"],
    director: "Greta Gerwig",
    logline: "Two sisters return to the lighthouse their mother left them — and the messages she left in the fog.",
    overview: "An atmospheric, slow-burn mystery about inheritance and the sea.",
    backdrop: img("silent-tides", 1800, 1000),
    poster: poster("silent-tides"),
    accent: "teal",
    trailerColor: "#22D3EE",
  },
  {
    id: 7,
    title: "IRONHEART: SIEGE",
    year: 2026,
    rating: 8.7,
    match: 93,
    duration: "2h 22m",
    genres: ["Action", "Sci-Fi", "Adventure"],
    cast: ["Idris Elba", "Charlize Theron", "John Boyega"],
    director: "Chad Stahelski",
    logline: "A retired mech-pilot is pulled back into the cockpit for one last, impossible drop.",
    overview: "Practical stunt work, bone-rattling sound design, and a hero who refuses to stay down.",
    backdrop: img("ironheart-siege", 1800, 1000),
    poster: poster("ironheart-siege"),
    accent: "crimson",
    featured: true,
    trailerColor: "#E50914",
  },
  {
    id: 8,
    title: "Paper Cities",
    year: 2024,
    rating: 8.0,
    match: 86,
    duration: "1h 55m",
    genres: ["Animation", "Drama", "Adventure"],
    cast: ["Voiced by", "Awkwafina", "Dev Patel"],
    director: "Mamoru Hosoda",
    logline: "A paper-folded world folds in on itself — unless a little girl can find the last crease.",
    overview: "Hand-crafted animation with an emotional core that earns every tear.",
    backdrop: img("paper-cities", 1800, 1000),
    poster: poster("paper-cities"),
    accent: "amber",
    trailerColor: "#FBBF24",
  },
  {
    id: 9,
    title: "Beneath the Glass",
    year: 2025,
    rating: 8.3,
    match: 89,
    duration: "2h 08m",
    genres: ["Thriller", "Mystery"],
    cast: ["Michael B. Jordan", "Lupita Nyong'o"],
    director: "Jordan Peele",
    logline: "A luxury underwater hotel hides a guest who never checked in — and a secret that drowns everyone.",
    overview: "A claustrophobic, darkly funny thriller that weaponizes wealth and water.",
    backdrop: img("beneath-the-glass", 1800, 1000),
    poster: poster("beneath-the-glass"),
    accent: "teal",
    trending: true,
    trailerColor: "#06B6D4",
  },
  {
    id: 10,
    title: "ECHO CHAMBER",
    year: 2026,
    rating: 7.6,
    match: 82,
    duration: "1h 38m",
    genres: ["Horror", "Thriller"],
    cast: ["Anya Taylor-Joy", "Ralph Fiennes"],
    director: "Ari Aster",
    logline: "A voice assistant starts asking questions. The answers, it turns out, are lethal.",
    overview: "Slow-burn, existential horror with a sound design you'll feel in your teeth.",
    backdrop: img("echo-chamber", 1800, 1000),
    poster: poster("echo-chamber"),
    accent: "violet",
    newRelease: true,
    trailerColor: "#A78BFA",
  },
  {
    id: 11,
    title: "Atlas of Small Things",
    year: 2024,
    rating: 8.5,
    match: 90,
    duration: "1h 52m",
    genres: ["Drama"],
    cast: ["Frances McDormand", "Steven Yeun"],
    director: "Chloé Zhao",
    logline: "A retired librarian catalogs the objects left behind in her small town — and the stories they refuse to tell.",
    overview: "A quiet masterpiece about memory, place, and the people we almost were.",
    backdrop: img("atlas-small-things", 1800, 1000),
    poster: poster("atlas-small-things"),
    accent: "amber",
    trailerColor: "#D97706",
  },
  {
    id: 12,
    title: "VELOCITY//ZERO",
    year: 2026,
    rating: 8.2,
    match: 87,
    duration: "1h 46m",
    genres: ["Action", "Sci-Fi", "Cyberpunk"],
    cast: ["Simu Liu", "Dua Lipa", "Henry Golding"],
    director: "James Cameron (vibe)",
    logline: "A street racer in a gravity-bent city must outrun the corporation that owns the road — and the sky.",
    overview: "Pure adrenaline with a genuinely innovative chase through a vertical metropolis.",
    backdrop: img("velocity-zero", 1800, 1000),
    poster: poster("velocity-zero"),
    accent: "crimson",
    trailerColor: "#FF2A3A",
  },
];

export function getFeatured(): Movie[] {
  return CATALOG.filter((m) => m.featured);
}

export function getByGenre(genre: string): Movie[] {
  if (genre === "All") return CATALOG;
  return CATALOG.filter((m) => m.genres.includes(genre));
}

export function rails(): { label: string; items: Movie[] }[] {
  return [
    { label: "Trending Now on NEXUS", items: CATALOG.filter((m) => m.trending) },
    { label: "New Releases · This Week", items: CATALOG.filter((m) => m.newRelease) },
    { label: "Cinematic Sci-Fi", items: CATALOG.filter((m) => m.genres.includes("Sci-Fi")) },
    { label: "Critically Acclaimed", items: [...CATALOG].sort((a, b) => b.rating - a.rating).slice(0, 8) },
    { label: "Cyberpunk Nights", items: CATALOG.filter((m) => m.genres.includes("Cyberpunk")) },
    { label: "Thrillers That Keep You Up", items: CATALOG.filter((m) => m.genres.includes("Thriller")) },
    { label: "Because You Watched Blade Runner", items: CATALOG.slice().reverse() },
  ];
}

export function searchCatalog(q: string, genre = "All"): Movie[] {
  const needle = q.trim().toLowerCase();
  return CATALOG.filter((m) => {
    const inText =
      !needle ||
      m.title.toLowerCase().includes(needle) ||
      m.cast.some((c) => c.toLowerCase().includes(needle)) ||
      m.director.toLowerCase().includes(needle) ||
      m.genres.some((g) => g.toLowerCase().includes(needle));
    const inGenre = genre === "All" || m.genres.includes(genre);
    return inText && inGenre;
  });
}
