import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Gavel, Menu, X, AlertTriangle } from "lucide-react";
import { Button } from "../ui/Button";
import { useWeb3 } from "../../context/Web3Context";
import { truncateAddress } from "../../utils/formatters";

export function Navbar() {
  const { address, connecting, connect, disconnect, isCorrectNetwork, switchToArc } = useWeb3();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { to: "/explore", label: "Explore" },
    { to: "/create", label: "Create" },
    { to: "/my-bids", label: "My Bids" },
  ];

  return (
    <>
      {/* Network Warning Banner */}
      {address && !isCorrectNetwork && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 flex items-center justify-center gap-3 text-sm">
          <AlertTriangle size={15} className="text-amber-400 flex-shrink-0" />
          <span className="text-amber-300">Wrong network. SealBid runs on Arc Testnet.</span>
          <button
            onClick={switchToArc}
            className="text-amber-400 hover:text-amber-300 font-semibold underline text-xs ml-1"
          >
            Switch Now
          </button>
        </div>
      )}

      <nav className="border-b border-[#2a2a3d] bg-[#0a0a0f]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Gavel size={14} className="text-white" />
              </div>
              <span className="font-bold text-[#f1f5f9] tracking-tight">SealBid</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden sm:flex items-center gap-1">
              {navItems.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "text-[#f1f5f9] bg-[#1a1a28]"
                        : "text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-white/5"
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </div>

            {/* Wallet */}
            <div className="flex items-center gap-2">
              {address ? (
                <button
                  onClick={disconnect}
                  className="flex items-center gap-2 bg-[#1a1a28] border border-[#2a2a3d] rounded-lg px-3 py-1.5 text-sm text-[#f1f5f9] hover:border-[#3a3a55] transition-colors"
                  aria-label="Disconnect wallet"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                  <span className="font-mono">{truncateAddress(address, 4)}</span>
                </button>
              ) : (
                <Button variant="gradient" size="sm" onClick={connect} loading={connecting}>
                  Connect
                </Button>
              )}

              {/* Mobile Menu Button */}
              <button
                className="sm:hidden p-1.5 text-[#94a3b8] hover:text-[#f1f5f9]"
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
          <div className="sm:hidden border-t border-[#2a2a3d] bg-[#0a0a0f] px-4 py-3 space-y-1">
            {navItems.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive ? "bg-[#1a1a28] text-[#f1f5f9]" : "text-[#94a3b8]"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        )}
      </nav>
    </>
  );
}
