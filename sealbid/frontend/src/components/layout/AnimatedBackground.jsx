import { useEffect, useRef } from "react";
import { useTheme } from "../../context/ThemeContext";

// Draws floating orbs + a moving grid on a canvas — lightweight, GPU-accelerated
export function AnimatedBackground() {
  const canvasRef = useRef(null);
  const { isDark } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let W, H;

    // Orb config
    const ORBS = [
      { x: 0.15, y: 0.2,  r: 0.28, speed: 0.00018, angle: 0,    color: isDark ? "rgba(0,194,184,0.055)" : "rgba(0,194,184,0.07)"  },
      { x: 0.8,  y: 0.75, r: 0.22, speed: 0.00023, angle: 2.1,  color: isDark ? "rgba(0,120,210,0.045)" : "rgba(0,120,210,0.06)"  },
      { x: 0.5,  y: 0.5,  r: 0.35, speed: 0.00012, angle: 4.2,  color: isDark ? "rgba(0,194,184,0.025)" : "rgba(0,194,184,0.035)" },
      { x: 0.9,  y: 0.1,  r: 0.18, speed: 0.0003,  angle: 1.0,  color: isDark ? "rgba(100,60,255,0.03)"  : "rgba(100,60,255,0.04)"  },
    ];

    // Grid lines config
    const GRID_SPACING = 60;
    const GRID_SPEED   = 0.18; // px per frame
    let gridOffset     = 0;

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    function draw(ts) {
      ctx.clearRect(0, 0, W, H);

      // ── Scrolling grid ──────────────────────────────────────────
      gridOffset = (gridOffset + GRID_SPEED) % GRID_SPACING;
      const gridColor = isDark ? "rgba(0,194,184,0.045)" : "rgba(0,150,140,0.055)";
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 0.5;

      // vertical lines
      for (let x = -GRID_SPACING + gridOffset; x < W + GRID_SPACING; x += GRID_SPACING) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      // horizontal lines (static — only vertical moves for a "flow" effect)
      for (let y = 0; y < H + GRID_SPACING; y += GRID_SPACING) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      // ── Floating orbs ───────────────────────────────────────────
      ORBS.forEach((orb) => {
        orb.angle += orb.speed * (ts || 1);
        const cx = (orb.x + Math.sin(orb.angle)       * 0.1) * W;
        const cy = (orb.y + Math.cos(orb.angle * 0.7) * 0.08) * H;
        const radius = orb.r * Math.min(W, H);

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        grad.addColorStop(0,   orb.color);
        grad.addColorStop(1,   "rgba(0,0,0,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // ── Subtle vignette ─────────────────────────────────────────
      const vignette = ctx.createRadialGradient(W/2, H/2, H*0.2, W/2, H/2, H*0.85);
      vignette.addColorStop(0, "rgba(0,0,0,0)");
      vignette.addColorStop(1, isDark ? "rgba(5,13,26,0.55)" : "rgba(240,246,255,0.45)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, W, H);

      animId = requestAnimationFrame(draw);
    }

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
