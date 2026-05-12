export function Badge({ children, variant = "default", className = "" }) {
  const variants = {
    default: "bg-[#2a2a3d] text-[#94a3b8] border-[#3a3a55]",
    commit: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
    reveal: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    settled: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    cancelled: "bg-red-500/10 text-red-400 border-red-500/30",
    winner: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    loser: "bg-[#2a2a3d] text-[#94a3b8] border-[#3a3a55]",
    services: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    "digital assets": "bg-purple-500/10 text-purple-400 border-purple-500/20",
    domains: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    other: "bg-[#2a2a3d] text-[#94a3b8] border-[#3a3a55]",
  };

  const key = (children || "").toString().toLowerCase();
  const style = variants[key] || variants[variant] || variants.default;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${style} ${className}`}
    >
      {children}
    </span>
  );
}
