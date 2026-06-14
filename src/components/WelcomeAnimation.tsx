import { useEffect, useState } from "react";

interface WelcomeAnimationProps {
  onComplete: () => void;
}

export default function WelcomeAnimation({ onComplete }: WelcomeAnimationProps) {
  const [phase, setPhase] = useState<"enter" | "hold" | "exit">("enter");

  useEffect(() => {
    const holdTimer = window.setTimeout(() => setPhase("hold"), 180);
    const exitTimer = window.setTimeout(() => setPhase("exit"), 2050);
    const completeTimer = window.setTimeout(onComplete, 2700);

    return () => {
      window.clearTimeout(holdTimer);
      window.clearTimeout(exitTimer);
      window.clearTimeout(completeTimer);
    };
  }, [onComplete]);

  const entering = phase === "enter";
  const exiting = phase === "exit";

  return (
    <div
      className={`fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-[#050507] transition-opacity duration-700 ${
        exiting ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_46%,rgba(229,9,20,0.115),transparent_32%),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.014)_1px,transparent_1px)] bg-[length:auto,80px_80px,80px_80px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.46)_64%,rgba(0,0,0,0.88)_100%)]" />
      <div className="absolute inset-x-0 top-1/2 h-px -translate-y-10 bg-gradient-to-r from-transparent via-crimson/35 to-transparent" />

      <div
        className={`relative text-center transition-all duration-700 ease-out ${
          entering
            ? "translate-y-5 scale-[0.97] opacity-0 blur-sm"
            : exiting
              ? "-translate-y-4 scale-[1.02] opacity-0 blur-sm"
              : "translate-y-0 scale-100 opacity-100 blur-0"
        }`}
      >
        <h1 className="font-black uppercase leading-none tracking-[-0.06em] text-[clamp(2.75rem,6.2vw,4.4rem)]">
          <span className="inline-block animate-[reelLogoIn_900ms_cubic-bezier(.2,.8,.2,1)_both] text-[#ff101a] drop-shadow-[0_0_26px_rgba(229,9,20,0.28)]">
            THE REEL
          </span>
          <span className="ml-3 inline-block animate-[reelLogoIn_900ms_cubic-bezier(.2,.8,.2,1)_180ms_both] text-[#f4f4f6] drop-shadow-[0_0_22px_rgba(255,255,255,0.08)]">
            DEAL
          </span>
        </h1>
        <p className="mt-4 animate-[reelSubtitleIn_900ms_cubic-bezier(.2,.8,.2,1)_520ms_both] text-[clamp(0.66rem,1.1vw,0.82rem)] font-medium uppercase tracking-[0.55em] text-[#6f6878]">
          FILMS · CINEMA · STORIES
        </p>
      </div>

      <style>{`
        @keyframes reelLogoIn {
          0% { opacity: 0; transform: translateY(18px) scaleX(0.94); filter: blur(8px); }
          58% { opacity: 1; filter: blur(0); }
          100% { opacity: 1; transform: translateY(0) scaleX(1); filter: blur(0); }
        }
        @keyframes reelSubtitleIn {
          0% { opacity: 0; transform: translateY(8px); letter-spacing: 0.75em; }
          100% { opacity: 1; transform: translateY(0); letter-spacing: 0.55em; }
        }
      `}</style>
    </div>
  );
}