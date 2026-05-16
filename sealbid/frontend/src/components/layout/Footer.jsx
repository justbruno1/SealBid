import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import logoSvg from "../../assets/logo.svg";

export function Footer() {
  const { isDark } = useTheme();

  const border  = isDark ? "border-white/10"  : "border-blue-200/50";
  const bg      = isDark ? "bg-white/[0.02]"  : "bg-white/40";
  const bodyText= isDark ? "text-white"        : "text-slate-900";
  const subText = isDark ? "text-slate-400"    : "text-slate-500";
  const linkCls = `text-sm transition-colors ${isDark ? "text-slate-400 hover:text-arc-400" : "text-slate-500 hover:text-arc-500"}`;

  return (
    <footer className={`border-t ${border} ${bg} backdrop-blur-sm`}>
      {/* Main footer grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-10">

          {/* Brand column */}
          <div className="sm:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <img src={logoSvg} alt="SealBid logo" className="w-8 h-8 flex-shrink-0" />
              <span className={`font-bold text-lg tracking-tight ${bodyText}`}>
                Seal<span className="text-arc-400">Bid</span>
              </span>
            </Link>
            <p className={`text-xs leading-relaxed mb-6 ${subText}`}>
              Sealed-bid auctions on Arc Network. Bids stay hidden until the reveal phase.
              Fair price discovery without front-running or insider collusion.
            </p>
            <a
              href="https://faucet.circle.com"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors
                ${isDark
                  ? "border-arc-400/30 text-arc-400 hover:bg-arc-400/5"
                  : "border-arc-400/40 text-arc-500 hover:bg-arc-400/5"}`}
            >
              <ExternalLink size={11} />
              Get testnet USDC
            </a>
          </div>

          {/* Protocol column */}
          <div>
            <p className={`text-xs font-mono tracking-widest uppercase mb-5 ${subText}`}>PROTOCOL</p>
            <ul className="space-y-3">
              {[
                { label: "How it works", to: "/#how-it-works" },
                { label: "FAQ",          to: "/#faq" },
                { label: "Explore",      to: "/explore" },
                { label: "Create Auction", to: "/create" },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className={linkCls}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Arc Network column */}
          <div>
            <p className={`text-xs font-mono tracking-widest uppercase mb-5 ${subText}`}>ARC NETWORK</p>
            <ul className="space-y-3">
              {[
                { label: "Arc Website",     href: "https://arc.network" },
                { label: "Documentation",   href: "https://docs.arc.network" },
                { label: "Block Explorer",  href: "https://testnet.arcscan.app" },
                { label: "Testnet Faucet",  href: "https://faucet.circle.com" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noopener noreferrer"
                    className={`${linkCls} inline-flex items-center gap-1`}>
                    {label} <ExternalLink size={10} />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Network status column */}
          <div>
            <p className={`text-xs font-mono tracking-widest uppercase mb-5 ${subText}`}>NETWORK STATUS</p>
            <div className="space-y-3">
              {[
                { label: "Network",    value: "Arc Testnet" },
                { label: "Chain ID",   value: "5042002" },
                { label: "Gas Token",  value: "USDC" },
                { label: "Finality",   value: "Sub-second" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className={`text-xs ${subText}`}>{label}</span>
                  <span className={`text-xs font-mono ${isDark ? "text-slate-200" : "text-slate-700"}`}>{value}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 pt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-emerald-400 font-mono">ALL SYSTEMS OPERATIONAL</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className={`border-t ${border}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className={`text-xs font-mono ${subText}`}>
            © 2026 SEALBID · ALL RIGHTS RESERVED
          </span>
          <a
            href="https://arc.network"
            target="_blank"
            rel="noopener noreferrer"
            className={`text-xs font-mono flex items-center gap-1.5 transition-colors ${isDark ? "text-slate-500 hover:text-arc-400" : "text-slate-400 hover:text-arc-500"}`}
          >
            POWERED BY ARC NETWORK <ExternalLink size={10} />
          </a>
          <span className={`text-xs font-mono ${subText}`}>
            TESTNET · CHAIN ID 5042002
          </span>
        </div>
      </div>
    </footer>
  );
}
