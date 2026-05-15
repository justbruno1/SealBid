import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, AlertTriangle, Sun, Moon } from "lucide-react";
import { useWeb3 } from "../../context/Web3Context";
import { useTheme } from "../../context/ThemeContext";
import { truncateAddress } from "../../utils/formatters";
import logoSvg from "../../assets/logo.svg";

export function Navbar() {
  const { address, connecting, connect, disconnect, isCorrectNetwork, switchToArc } = useWeb3();
  const { isDark, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { to: "/explore", label: "Explore" },
    { to: "/create",  label: "Create"  },
    { to: "/my-bids", label: "My Bids" },
  ];

  const navBg     = isDark
    ? "bg-[#071428]/80 border-white/10"
    : "bg-white/70 border-blue-200/60";
  const navText   = isDark
    ? "text-slate-300 hover:text-white"
    : "text-slate-600 hover:text-slate-900";
  const activeClass = isDark
    ? "text-white bg-white/10"
    : "text-slate-900 bg-blue-50";
  const walletBg  = isDark
    ? "bg-white/10 border-white/20 hover:border-arc-400/60 text-white"
    : "bg-white border-blue-200 hover:border-arc-400/60 text-slate-800";
  const mobileBg  = isDark
    ? "bg-[#071428]/95 border-white/10"
    : "bg-white/95 border-blue-200/60";
  const iconBtn   = isDark
    ? "text-slate-400 hover:text-arc-400 hover:bg-white/10"
    : "text-slate-500 hover:text-arc-500 hover:bg-blue-50";

  return (
    <>
      {/* Wrong Network Banner */}
      {address && !isCorrectNetwork && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-center gap-3 text-sm">
          <AlertTriangle size={14} className="text-amber-400 flex-shrink-0" />
          <span className="text-amber-300">Wrong network — SealBid runs on Arc Testnet.</span>
          <button onClick={switchToArc}
            className="text-amber-400 hover:text-amber-300 font-semibold underline text-xs ml-1">
            Switch Now
          </button>
        </div>
      )}

      <nav className={`border-b ${navBg} backdrop-blur-md sticky top-0 z-40 transition-colors duration-300`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">

            {/* Logo — uses the actual SVG file */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <img
                src={logoSvg}
                alt="SealBid logo"
                className="w-8 h-8 flex-shrink-0"
              />
              <span className={`font-bold text-lg tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                Seal<span className="text-arc-400">Bid</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden sm:flex items-center gap-1">
              {navItems.map(({ to, label }) => (
                <NavLink key={to} to={to}
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isActive ? activeClass : navText}`
                  }
                >{label}</NavLink>
              ))}
            </div>

            {/* Right: theme toggle + wallet + mobile menu */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <button
                onClick={toggle}
                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                className={`p-2 rounded-lg transition-all duration-200 ${iconBtn}`}
              >
                {isDark ? <Sun size={17} /> : <Moon size={17} />}
              </button>

              {/* Wallet */}
              {address ? (
                <button
                  onClick={disconnect}
                  className={`flex items-center gap-2 border rounded-lg px-3 py-1.5 text-sm transition-all ${walletBg}`}
                  aria-label="Disconnect wallet"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-arc-400 animate-pulse" />
                  <span className="font-mono">{truncateAddress(address, 4)}</span>
                </button>
              ) : (
                <button
                  onClick={connect}
                  disabled={connecting}
                  className="btn-arc px-4 py-1.5 text-sm rounded-lg"
                >
                  {connecting ? "Connecting…" : "Connect"}
                </button>
              )}

              {/* Mobile menu button */}
              <button
                className={`sm:hidden p-1.5 rounded-lg transition-colors ${iconBtn}`}
                onClick={() => setMenuOpen((o) => !o)}
                aria-label="Toggle navigation menu"
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className={`sm:hidden border-t ${mobileBg} px-4 py-3 space-y-1 transition-colors`}>
            {navItems.map(({ to, label }) => (
              <NavLink key={to} to={to} onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-lg text-sm font-medium ${isActive ? activeClass : navText}`
                }
              >{label}</NavLink>
            ))}
          </div>
        )}
      </nav>
    </>
  );
}
