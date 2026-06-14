import { useCallback, useEffect, useRef, useState } from "react";
import type { Movie } from "../data/tmdb";
import { useStore } from "../store/useStore";
import {
  IconPlay, IconPause, IconVolume, IconMute, IconFullscreen, IconTheater,
  IconClose, IconSkipBack, IconSkipFwd, IconStar, IconCheck, IconPlus,
} from "./Icons";

// This is a simulated cinematic player. In production, swap the <video>
// element for HLS/DASH and wire in real captions, multi-audio, DRM, etc.
// We use a public, royalty-free sample so the UI actually plays.

const SAMPLE_SRC =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
const SAMPLE_POSTER =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg";

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export default function VideoPlayer() {
  const { playerMovie, closePlayer, toggleWatchlist, isInWatchlist, setProgress } = useStore();
  const movie: Movie | null = playerMovie;

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<number | null>(null);

  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [theater, setTheater] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [buffered, setBuffered] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Reset on movie change
  useEffect(() => {
    if (!movie) return;
    setTime(0);
    setDuration(0);
    setPlaying(true);
    setIsLoading(true);
  }, [movie?.id]);

  // Sync play/pause
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (playing) v.play().catch(() => setPlaying(false));
    else v.pause();
  }, [playing, movie]);

  // Sync volume / mute
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = muted;
    v.volume = volume;
  }, [volume, muted]);

  // Sync playback rate
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.playbackRate = speed;
  }, [speed, movie]);

  // Persist progress
  useEffect(() => {
    if (!movie || duration === 0) return;
    setProgress(movie.id, time / duration);
  }, [time, duration, movie, setProgress]);

  const scheduleHide = useCallback(() => {
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      if (playing) setControlsVisible(false);
    }, 2600);
  }, [playing]);

  const showControls = useCallback(() => {
    setControlsVisible(true);
    scheduleHide();
  }, [scheduleHide]);

  useEffect(() => {
    showControls();
    return () => {
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
  }, [showControls, playing]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!movie) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { closePlayer(); return; }
      if (e.key === " ") { e.preventDefault(); setPlaying((p) => !p); return; }
      if (e.key === "ArrowRight") { seek(10); return; }
      if (e.key === "ArrowLeft") { seek(-10); return; }
      if (e.key.toLowerCase() === "m") setMuted((m) => !m);
      if (e.key.toLowerCase() === "f") toggleFullscreen();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movie]);

  const seek = (delta: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.duration || 0, v.currentTime + delta));
  };

  const onSeekBar = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    if (!v || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    v.currentTime = ratio * duration;
  };

  const onVolume = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setVolume(ratio);
    if (ratio > 0 && muted) setMuted(false);
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) el.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

  if (!movie) return null;
  const inList = isInWatchlist(movie.id);
  const pct = duration ? (time / duration) * 100 : 0;
  const bufPct = duration ? (buffered / duration) * 100 : 0;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/95 backdrop-blur-2xl">
      {/* Ambient glow from movie accent color */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{ background: `radial-gradient(60% 50% at 50% 50%, ${movie.trailerColor}33, transparent 70%)` }}
      />

      <div
        ref={containerRef}
        className={`relative overflow-hidden bg-black transition-all duration-500 ${
          theater ? "h-[92vh] w-[92vw] rounded-2xl" : "h-full w-full"
        }`}
        onMouseMove={showControls}
        onMouseLeave={() => playing && setControlsVisible(false)}
        onClick={showControls}
      >
        <video
          ref={videoRef}
          src={SAMPLE_SRC}
          poster={movie.backdrop || SAMPLE_POSTER}
          className="h-full w-full object-contain"
          playsInline
          onLoadedMetadata={(e) => {
            setDuration(e.currentTarget.duration);
            setIsLoading(false);
          }}
          onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
          onProgress={(e) => {
            const v = e.currentTarget;
            if (v.buffered.length) setBuffered(v.buffered.end(v.buffered.length - 1));
          }}
          onWaiting={() => setIsLoading(true)}
          onPlaying={() => setIsLoading(false)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          onClick={(e) => { e.stopPropagation(); setPlaying((p) => !p); }}
        />

        {/* Loading spinner */}
        {isLoading && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="h-14 w-14 animate-spin rounded-full border-2 border-white/20 border-t-crimson" />
          </div>
        )}

        {/* Top bar */}
        <div
          className={`pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-4 bg-gradient-to-b from-black/80 to-transparent p-5 transition-opacity duration-300 ${
            controlsVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="pointer-events-auto flex items-center gap-3">
            <button
              onClick={closePlayer}
              className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-black/50 text-white transition hover:bg-white/10"
              aria-label="Close player"
            >
              <IconClose size={18} />
            </button>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-crimson-hot">Now Playing</div>
              <h3 className="text-lg font-bold text-white md:text-xl">{movie.title}</h3>
            </div>
          </div>

          <div className="pointer-events-auto flex items-center gap-2">
            <button
              onClick={() => toggleWatchlist(movie.id)}
              className={`flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition ${
                inList
                  ? "border-teal/50 bg-teal/15 text-teal"
                  : "border-white/15 bg-black/40 text-white hover:bg-white/10"
              }`}
            >
              {inList ? <IconCheck size={14} /> : <IconPlus size={14} />}
              {inList ? "In Watchlist" : "Add to List"}
            </button>
            <div className="hidden items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3 py-2 text-xs font-semibold text-amber-300 md:flex">
              <IconStar size={12} /> {movie.rating.toFixed(1)}
            </div>
          </div>
        </div>

        {/* Center play tap-target */}
        {!playing && !isLoading && (
          <button
            onClick={() => setPlaying(true)}
            className="absolute inset-0 z-10 grid place-items-center"
            aria-label="Play"
          >
            <span className="grid h-20 w-20 place-items-center rounded-full bg-white/90 text-obsidian shadow-[0_20px_60px_-10px_rgba(0,0,0,0.8)] transition hover:scale-105 hover:bg-crimson hover:text-white">
              <IconPlay size={28} />
            </span>
          </button>
        )}

        {/* Bottom controls */}
        <div
          className={`absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-5 pb-5 pt-16 transition-opacity duration-300 ${
            controlsVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Title / chapter / metadata */}
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-[12px] text-white/70">
            <div className="flex items-center gap-3">
              <span className="rounded border border-white/20 px-1.5 py-0.5 font-mono text-[10px]">HD · 5.1</span>
              <span>{movie.genres.join(" · ")}</span>
            </div>
            <div className="font-mono tabular-nums">
              {formatTime(time)} <span className="text-white/40">/ {formatTime(duration)}</span>
            </div>
          </div>

          {/* Seek bar */}
          <div
            className="group/seek relative h-2 cursor-pointer rounded-full bg-white/15"
            onClick={onSeekBar}
          >
            <div className="absolute inset-y-0 left-0 rounded-full bg-white/25" style={{ width: `${bufPct}%` }} />
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-crimson to-crimson-hot"
              style={{ width: `${pct}%` }}
            />
            <div
              className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 shadow-[0_0_0_4px_rgba(229,9,20,0.35)] transition-opacity group-hover/seek:opacity-100"
              style={{ left: `${pct}%` }}
            />
          </div>

          {/* Controls row */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-white">
            <button onClick={() => setPlaying((p) => !p)} className="grid h-10 w-10 place-items-center rounded-full bg-white text-obsidian transition hover:bg-crimson hover:text-white">
              {playing ? <IconPause size={16} /> : <IconPlay size={16} />}
            </button>
            <button onClick={() => seek(-10)} className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-black/40 transition hover:bg-white/10" title="Back 10s">
              <IconSkipBack size={16} />
            </button>
            <button onClick={() => seek(10)} className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-black/40 transition hover:bg-white/10" title="Forward 10s">
              <IconSkipFwd size={16} />
            </button>

            {/* Volume */}
            <div className="ml-2 flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3 py-2">
              <button onClick={() => setMuted((m) => !m)} className="text-white/80 hover:text-white">
                {muted || volume === 0 ? <IconMute size={16} /> : <IconVolume size={16} />}
              </button>
              <div className="group/vol relative h-1.5 w-24 cursor-pointer rounded-full bg-white/20" onClick={onVolume}>
                <div className="absolute inset-y-0 left-0 rounded-full bg-white" style={{ width: `${(muted ? 0 : volume) * 100}%` }} />
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2">
              {/* Speed */}
              <div className="flex items-center gap-1 rounded-full border border-white/15 bg-black/40 px-1 py-1">
                {SPEEDS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                      speed === s ? "bg-white text-obsidian" : "text-white/70 hover:text-white"
                    }`}
                  >
                    {s}×
                  </button>
                ))}
              </div>

              {/* Theater */}
              <button
                onClick={() => setTheater((t) => !t)}
                className={`grid h-10 w-10 place-items-center rounded-full border transition ${
                  theater ? "border-teal/50 bg-teal/15 text-teal" : "border-white/15 bg-black/40 text-white/80 hover:bg-white/10 hover:text-white"
                }`}
                title="Theater mode"
              >
                <IconTheater size={16} />
              </button>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-black/40 text-white/80 transition hover:bg-white/10 hover:text-white"
                title="Fullscreen"
              >
                <IconFullscreen size={16} />
              </button>
            </div>
          </div>

          {/* Hint */}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-[10.5px] text-white/40">
            <span>Shortcuts:</span>
            <kbd className="rounded border border-white/15 bg-white/5 px-1.5 py-0.5 font-mono">Space</kbd> play/pause
            <kbd className="rounded border border-white/15 bg-white/5 px-1.5 py-0.5 font-mono">← →</kbd> seek 10s
            <kbd className="rounded border border-white/15 bg-white/5 px-1.5 py-0.5 font-mono">M</kbd> mute
            <kbd className="rounded border border-white/15 bg-white/5 px-1.5 py-0.5 font-mono">F</kbd> fullscreen
            <kbd className="rounded border border-white/15 bg-white/5 px-1.5 py-0.5 font-mono">Esc</kbd> close
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTime(s: number) {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  const h = Math.floor(m / 60);
  const mm = (m % 60).toString().padStart(2, "0");
  const ss = sec.toString().padStart(2, "0");
  if (h > 0) return `${h}:${mm}:${ss}`;
  return `${mm}:${ss}`;
}
