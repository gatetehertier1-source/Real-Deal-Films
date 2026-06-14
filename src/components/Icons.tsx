import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };

const base = (p: P) => ({
  width: p.size ?? 20,
  height: p.size ?? 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...p,
});

export const IconPlay = (p: P) => (
  <svg {...base(p)}><polygon points="7 5 20 12 7 19 7 5" fill="currentColor" stroke="none" /></svg>
);
export const IconPause = (p: P) => (
  <svg {...base(p)}><rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none" /><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none" /></svg>
);
export const IconPlus = (p: P) => (
  <svg {...base(p)}><path d="M12 5v14M5 12h14" /></svg>
);
export const IconCheck = (p: P) => (
  <svg {...base(p)}><path d="M5 12l5 5L20 7" /></svg>
);
export const IconInfo = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M12 8h.01M11 12h1v5h1" /></svg>
);
export const IconSearch = (p: P) => (
  <svg {...base(p)}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
);
export const IconHome = (p: P) => (
  <svg {...base(p)}><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></svg>
);
export const IconFilm = (p: P) => (
  <svg {...base(p)}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4" /></svg>
);
export const IconStar = (p: P) => (
  <svg {...base(p)}><polygon points="12 3 14.6 9 21 10 16.5 14.5 17.8 21 12 17.8 6.2 21 7.5 14.5 3 10 9.4 9 12 3" fill="currentColor" stroke="none" /></svg>
);
export const IconSpark = (p: P) => (
  <svg {...base(p)}><path d="M12 3v18M3 12h18M6 6l12 12M18 6L6 18" /></svg>
);
export const IconBookmark = (p: P) => (
  <svg {...base(p)}><path d="M6 3h12v18l-6-4-6 4z" /></svg>
);
export const IconClock = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
);
export const IconVolume = (p: P) => (
  <svg {...base(p)}><path d="M4 10v4h4l5 4V6L8 10H4z" /><path d="M17 8a5 5 0 0 1 0 8" /><path d="M20 5a9 9 0 0 1 0 14" /></svg>
);
export const IconMute = (p: P) => (
  <svg {...base(p)}><path d="M4 10v4h4l5 4V6L8 10H4z" /><path d="M17 9l5 5M22 9l-5 5" /></svg>
);
export const IconFullscreen = (p: P) => (
  <svg {...base(p)}><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg>
);
export const IconTheater = (p: P) => (
  <svg {...base(p)}><path d="M3 7h18v12H3z" /><path d="M7 7v12M17 7v12M3 12h18" /></svg>
);
export const IconClose = (p: P) => (
  <svg {...base(p)}><path d="M6 6l12 12M18 6L6 18" /></svg>
);
export const IconChevronLeft = (p: P) => (
  <svg {...base(p)}><path d="M15 6l-6 6 6 6" /></svg>
);
export const IconChevronRight = (p: P) => (
  <svg {...base(p)}><path d="M9 6l6 6-6 6" /></svg>
);
export const IconMenu = (p: P) => (
  <svg {...base(p)}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
);
export const IconBell = (p: P) => (
  <svg {...base(p)}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8z" /><path d="M10 21a2 2 0 0 0 4 0" /></svg>
);
export const IconUser = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
);
export const IconTrending = (p: P) => (
  <svg {...base(p)}><path d="M3 17l6-6 4 4 8-8" /><path d="M15 7h6v6" /></svg>
);
export const IconFlame = (p: P) => (
  <svg {...base(p)}><path d="M12 3c2 4 6 6 6 11a6 6 0 1 1-12 0c0-3 2-5 2-8 2 2 4 2 4-3z" /></svg>
);
export const IconHeart = (p: P) => (
  <svg {...base(p)}><path d="M12 20s-7-4.5-7-11a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 6.5-7 11-7 11z" /></svg>
);
export const IconSkipBack = (p: P) => (
  <svg {...base(p)}><path d="M11 7L4 12l7 5z" fill="currentColor" stroke="none"/><path d="M20 7v10" /></svg>
);
export const IconSkipFwd = (p: P) => (
  <svg {...base(p)}><path d="M13 7l7 5-7 5z" fill="currentColor" stroke="none"/><path d="M4 7v10" /></svg>
);
export const IconLogo = (p: P) => (
  <svg {...base({ ...p, strokeWidth: 2 })}>
    <rect x="3" y="3" width="18" height="18" rx="4" />
    <polygon points="10 8 10 16 17 12" fill="currentColor" stroke="none" />
  </svg>
);
