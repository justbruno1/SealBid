import { Loader2 } from "lucide-react";

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  className = "",
  onClick,
  type = "button",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0a0a0f] disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-indigo-500 hover:bg-indigo-400 text-white focus:ring-indigo-500 disabled:bg-indigo-500/40 disabled:text-white/50",
    secondary:
      "bg-[#2a2a3d] hover:bg-[#333350] text-[#f1f5f9] border border-[#3a3a55] focus:ring-[#2a2a3d] disabled:opacity-40",
    ghost:
      "bg-transparent hover:bg-white/5 text-[#94a3b8] hover:text-[#f1f5f9] focus:ring-white/10 disabled:opacity-40",
    danger:
      "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 focus:ring-red-500 disabled:opacity-40",
    success:
      "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 focus:ring-emerald-500 disabled:opacity-40",
    gradient:
      "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 focus:ring-indigo-500 disabled:opacity-40",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
    xl: "px-8 py-4 text-lg",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}
