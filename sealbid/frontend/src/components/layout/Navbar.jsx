import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Gavel, Menu, X, AlertTriangle, Sun, Moon } from "lucide-react";
import { Button } from "../ui/Button";
import { useWeb3 } from "../../context/Web3Context";
import { useTheme } from "../../context/ThemeContext";
import { truncateAddress } from "../../utils/formatters";

export function Navbar() {
  const { address, connecting, connect, disconnect, isCorrectNetwork, switchToArc } = useWeb3();
  const { isDark, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { to: "/explore", label: "Explore" },
    { to: "/create",  label: "Create"  },
    { to: "/my-bids", label: "My Bids" },
  ];

  const surface  = isDark ? "bg-dark-bg/80 border-dark-border"   : "bg-white/80 border-light-border";
  const navText  = isDark ? "text-slate-400 hover:text-slate-100" : "text-slate-500 hover:text-slate-900";
  const activeClass = isDark ? "text-slate-100 bg-dark-card"      : "text-slate-900 bg-light-hover";
  const walletBg = isDark ? "bg-dark-card border-dark-border hover:border-arc-400/40"
                          : "bg-white border-light-border hover:border-arc-400/60";
  const mobileBg = isDark ? "bg-dark-bg border-dark-border"       : "bg-white border-light-border";

  return (
    <>
      {/* Wrong Network Banner */}
      {address && !isCorrectNetwork && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-center gap-3 text-sm">
          <AlertTriangle size={14} className="text-amber-400 flex-shrink-0" />
          <span className="text-amber-300">Wrong network — SealBid runs on Arc Testnet.</span>
          <button onClick={switchToArc} className="text-amber-400 hover:text-amber-300 font-semibold underline text-xs ml-1">
            Switch Now
          </button>
        </div>
      )}

      <nav className={`border-b ${surface} backdrop-blur-md sticky top-0 z-40 transition-colors duration-300`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 bg-gradient-to-br from-arc-400 to-arc-600 rounded-lg flex items-center justify-center shadow-md shadow-arc-400/30">
                <Gavel size={13} className="text-white" />
              </div>
              <span className={`font-bold tracking-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}>
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

            {/* Right side: theme toggle + wallet */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <button
                onClick={toggle}
                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  isDark
                    ? "text-slate-400 hover:text-arc-400 hover:bg-dark-card"
                    : "text-slate-500 hover:text-arc-500 hover:bg-light-hover"
                }`}
              >
                {isDark ? <Sun size={17} /> : <Moon size={17} />}
              </button>

              {/* Wallet Button */}
              {address ? (
                <button
                  onClick={disconnect}
                  className={`flex items-center gap-2 border rounded-lg px-3 py-1.5 text-sm transition-all ${walletBg} ${isDark ? "text-slate-100" : "text-slate-800"}`}
                  aria-label="Disconnect wallet"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-arc-400 animate-pulse" />
                  <span className="font-mono">{truncateAddress(address, 4)}</span>
                </button>
              ) : (
                <button
                  onClick={connect}
                  disabled={connecting}
                  className="btn-arc text-sm px-4 py-1.5 rounded-lg"
                >
                  {connecting ? "Connecting…" : "Connect"}
                </button>
              )}

              {/* Mobile Menu Toggle */}
              <button
                className={`sm:hidden p-1.5 rounded-lg transition-colors ${isDark ? "text-slate-400 hover:text-slate-100" : "text-slate-500 hover:text-slate-900"}`}
                onClick={() => setMenuOpen((o) => !o)}
                aria-label="Toggle navigation menu"
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
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