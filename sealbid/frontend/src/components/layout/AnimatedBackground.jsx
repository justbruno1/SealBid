import { useEffect, useRef } from "react";
import { useTheme } from "../../context/ThemeContext";

export function AnimatedBackground() {
  const canvasRef = useRef(null);
  const { isDark } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let W, H;

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    // Arc lines — like the curved white lines on arc.network
    const ARCS = [
      { startX: 0.75, startY: -0.05, cpX: 1.1,  cpY: 0.45, endX: 0.6,  endY: 1.05, width: 1.2, opacity: 0.18 },
      { startX: 0.85, startY: -0.05, cpX: 1.15, cpY: 0.5,  endX: 0.7,  endY: 1.05, width: 0.7, opacity: 0.10 },
      { startX: 0.65, startY: -0.05, cpX: 1.05, cpY: 0.4,  endX: 0.5,  endY: 1.05, width: 0.5, opacity: 0.07 },
    ];

    // Orbs — large soft glow blobs like Arc's blue-to-teal gradient
    const ORBS = [
      { x: 0.72, y: 0.18, r: 0.55, speed: 0.00010, angle: 0,   colorDark: "rgba(0,90,160,0.45)",  colorLight: "rgba(0,130,200,0.25)" },
      { x: 0.15, y: 0.65, r: 0.40, speed: 0.00015, angle: 2.0, colorDark: "rgba(0,170,160,0.30)", colorLight: "rgba(0,180,170,0.18)" },
      { x: 0.50, y: 0.40, r: 0.60, speed: 0.00008, angle: 4.0, colorDark: "rgba(0,50,120,0.35)",  colorLight: "rgba(0,100,180,0.15)" },
      { x: 0.90, y: 0.80, r: 0.35, speed: 0.00020, angle: 1.0, colorDark: "rgba(0,194,184,0.20)", colorLight: "rgba(0,194,184,0.12)" },
    ];

    function draw(ts) {
      ctx.clearRect(0, 0, W, H);

      // ── Base gradient — mimics Arc's deep blue-to-teal background ──
      const base = ctx.createLinearGradient(0, 0, W * 0.8, H);
      if (isDark) {
        base.addColorStop(0,   "#071428");
        base.addColorStop(0.5, "#0a1e3d");
        base.addColorStop(1,   "#081e2e");
      } else {
        base.addColorStop(0,   "#daeeff");
        base.addColorStop(0.5, "#c8e6f8");
        base.addColorStop(1,   "#bde0f5");
      }
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, W, H);

      // ── Floating glow orbs ──
      ORBS.forEach((orb) => {
        orb.angle += orb.speed;
        const cx = (orb.x + Math.sin(orb.angle)       * 0.06) * W;
        const cy = (orb.y + Math.cos(orb.angle * 0.8) * 0.05) * H;
        const radius = orb.r * Math.max(W, H);
        const color  = isDark ? orb.colorDark : orb.colorLight;

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        grad.addColorStop(0, color);
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // ── Arc curved lines (the signature Arc.network design element) ──
      ARCS.forEach((arc) => {
        ctx.beginPath();
        ctx.moveTo(arc.startX * W, arc.startY * H);
        ctx.quadraticCurveTo(arc.cpX * W, arc.cpY * H, arc.endX * W, arc.endY * H);
        ctx.strokeStyle = isDark
          ? `rgba(255,255,255,${arc.opacity})`
          : `rgba(0,80,160,${arc.opacity * 0.6})`;
        ctx.lineWidth = arc.width;
        ctx.stroke();
      });

      // ── Bottom teal glow strip ──
      const strip = ctx.createLinearGradient(0, H * 0.75, 0, H);
      strip.addColorStop(0, "rgba(0,0,0,0)");
      strip.addColorStop(1, isDark ? "rgba(0,170,160,0.12)" : "rgba(0,170,160,0.08)");
      ctx.fillStyle = strip;
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
