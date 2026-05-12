import { useState, useEffect } from "react";

export function PhaseTimer({ commitDeadline, revealDeadline, state, onPhaseEnd }) {
  const [now, setNow] = useState(Date.now() / 1000);

  useEffect(() => {
    const interval = setInterval(() => {
      const t = Date.now() / 1000;
      setNow(t);
      if (state === 0 && t > commitDeadline) onPhaseEnd?.();
      if (state === 1 && t > revealDeadline) onPhaseEnd?.();
    }, 1000);
    return () => clearInterval(interval);
  }, [commitDeadline, revealDeadline, state, onPhaseEnd]);

  let deadline, phaseStart, phaseName;

  if (state === 0) {
    deadline = commitDeadline;
    phaseStart = commitDeadline - (revealDeadline - commitDeadline) * 2; // approximate
    phaseName = "Bidding Closes";
  } else if (state === 1) {
    deadline = revealDeadline;
    phaseStart = commitDeadline;
    phaseName = "Reveal Closes";
  } else {
    return null;
  }

  const timeLeft = Math.max(0, Math.floor(deadline - now));
  const totalDuration = deadline - phaseStart;
  const progress = totalDuration > 0 ? timeLeft / totalDuration : 0;
  const pct = Math.min(1, Math.max(0, progress));

  const d = Math.floor(timeLeft / 86400);
  const h = Math.floor((timeLeft % 86400) / 3600);
  const m = Math.floor((timeLeft % 3600) / 60);
  const s = timeLeft % 60;
  const pad = (n) => String(n).padStart(2, "0");

  // Ring params
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dashOffset = circ * (1 - pct);

  let ringColor = "#10b981"; // green
  if (pct < 0.25) ringColor = "#ef4444";
  else if (pct < 0.5) ringColor = "#f59e0b";

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm font-medium text-[#94a3b8] uppercase tracking-widest">{phaseName}</p>
      <div className="relative w-36 h-36">
        <svg viewBox="0 0 128 128" className="w-full h-full -rotate-90" aria-hidden="true">
          {/* Track */}
          <circle
            cx="64"
            cy="64"
            r={r}
            fill="none"
            stroke="#2a2a3d"
            strokeWidth="8"
          />
          {/* Progress */}
          <circle
            cx="64"
            cy="64"
            r={r}
            fill="none"
            stroke={ringColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={dashOffset}
            style={{ transition: "stroke-dashoffset 1s linear, stroke 0.5s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {timeLeft <= 0 ? (
            <span className="text-sm text-[#475569] font-medium">Ended</span>
          ) : (
            <>
              {d > 0 ? (
                <span className="text-2xl font-bold text-[#f1f5f9] font-mono">{d}d {pad(h)}h</span>
              ) : (
                <span className="text-2xl font-bold text-[#f1f5f9] font-mono">
                  {pad(h)}:{pad(m)}:{pad(s)}
                </span>
              )}
            </>
          )}
        </div>
      </div>
      {timeLeft > 0 && (
        <p className="text-xs text-[#475569]">
          {d > 0
            ? `${d}d ${pad(h)}h ${pad(m)}m remaining`
            : `${pad(h)}:${pad(m)}:${pad(s)} remaining`}
        </p>
      )}
    </div>
  );
}
