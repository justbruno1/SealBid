import { Loader2 } from "lucide-react";

export function Button({
  children, variant = "primary", size = "md",
  loading = false, disabled = false,
  className = "", onClick, type = "button", ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 " +
    "focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed";

  const variants = {
    // Arc teal — main CTA
    primary:
      "bg-arc-400 hover:bg-arc-500 text-white shadow-lg shadow-arc-400/20 " +
      "focus:ring-arc-400/50 focus:ring-offset-dark-bg " +
      "disabled:bg-arc-400/30 disabled:text-white/50",

    // Subtle filled secondary
    secondary:
      "bg-dark-card hover:bg-dark-hover text-slate-200 border border-dark-border " +
      "hover:border-arc-400/30 focus:ring-arc-400/30 focus:ring-offset-dark-bg " +
      "disabled:opacity-40 " +
      // light mode override
      "dark:bg-dark-card light:bg-white light:text-slate-700 light:border-light-border " +
      "light:hover:border-arc-400/50 light:hover:bg-light-hover",

    ghost:
      "bg-transparent hover:bg-dark-card text-slate-400 hover:text-slate-100 " +
      "focus:ring-slate-500/30 focus:ring-offset-dark-bg disabled:opacity-40",

    danger:
      "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 " +
      "focus:ring-red-500/40 focus:ring-offset-dark-bg disabled:opacity-40",

    success:
      "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 " +
      "focus:ring-emerald-500/40 focus:ring-offset-dark-bg disabled:opacity-40",

    // Arc gradient — hero CTA
    gradient:
      "bg-gradient-to-r from-arc-400 to-arc-600 hover:from-arc-300 hover:to-arc-500 " +
      "text-white shadow-lg shadow-arc-400/25 " +
      "focus:ring-arc-400/50 focus:ring-offset-dark-bg disabled:opacity-40",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
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
      {loading && <Loader2 size={15} className="animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}
