import { useState, useEffect } from "react";

export function CountdownTimer({ deadline, onExpire }) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const calc = () => Math.max(0, Math.floor(deadline - Date.now() / 1000));
    setTimeLeft(calc());
    const interval = setInterval(() => {
      const t = calc();
      setTimeLeft(t);
      if (t === 0) onExpire?.();
    }, 1000);
    return () => clearInterval(interval);
  }, [deadline, onExpire]);

  const d = Math.floor(timeLeft / 86400);
  const h = Math.floor((timeLeft % 86400) / 3600);
  const m = Math.floor((timeLeft % 3600) / 60);
  const s = timeLeft % 60;

  const pad = (n) => String(n).padStart(2, "0");

  if (timeLeft <= 0) {
    return (
      <span className="text-[#475569] font-mono text-sm">Expired</span>
    );
  }

  return (
    <span className="font-mono text-sm text-[#f1f5f9]">
      {d > 0 && <span>{d}d </span>}
      {pad(h)}:{pad(m)}:{pad(s)}
    </span>
  );
}
