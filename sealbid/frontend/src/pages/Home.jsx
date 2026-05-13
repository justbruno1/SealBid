import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Lock, Unlock, Trophy, ArrowRight, ExternalLink } from "lucide-react";
import { AuctionGrid } from "../components/auction/AuctionGrid";
import { useFactory } from "../hooks/useFactory";
import { useWeb3 } from "../context/Web3Context";
import { useTheme } from "../context/ThemeContext";

export function Home() {
  const { getAuctions } = useFactory();
  const { provider } = useWeb3();
  const { isDark } = useTheme();
  const [recentAddresses, setRecentAddresses] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (!provider) return;
    (async () => {
      try {
        const all = await getAuctions();
        setTotalCount(all.length);
        setRecentAddresses([...all].reverse().slice(0, 6));
      } catch {}
    })();
  }, [provider]);

  const cardBg   = isDark ? "bg-dark-card border-dark-border" : "bg-white border-light-border shadow-sm";
  const mutedText = isDark ? "text-slate-400" : "text-slate-500";
  const bodyText  = isDark ? "text-slate-100" : "text-slate-900";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">

      {/* Network Banner */}
      <div className="mt-6 mb-2 flex justify-center">
        <div className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs border
          ${isDark
            ? "bg-arc-400/5 border-arc-400/20 text-arc-300"
            : "bg-arc-400/10 border-arc-400/30 text-arc-600"}`}>
          <div className="w-1.5 h-1.5 rounded-full bg-arc-400 animate-pulse" />
          Live on Arc Testnet · Get USDC at{" "}
          <a href="https://faucet.circle.com" target="_blank" rel="noopener noreferrer"
            className="underline flex items-center gap-0.5 hover:text-arc-400 transition-colors">
            faucet.circle.com <ExternalLink size={10} />
          </a>
        </div>
      </div>

      {/* Hero */}
      <section className="text-center py-20 relative">
        {/* Decorative glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden>
          <div className={`w-96 h-96 rounded-full blur-3xl opacity-10
            ${isDark ? "bg-arc-400" : "bg-arc-300"}`} />
        </div>

        <h1 className={`text-5xl sm:text-6xl font-bold mb-4 tracking-tight leading-tight ${bodyText}`}>
          Sealed.{" "}
          <span className="text-arc-400">Fair.</span>{" "}
          Final.
        </h1>
        <p className={`text-lg max-w-xl mx-auto mb-10 leading-relaxed ${mutedText}`}>
          Create blind auctions on Arc Network. Bids are sealed on-chain — nobody sees your
          amount until the reveal. Winner is settled automatically in USDC.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/explore">
            <button className="btn-arc px-6 py-3 text-base rounded-xl inline-flex items-center gap-2">
              Explore Auctions <ArrowRight size={16} />
            </button>
          </Link>
          <Link to="/create">
            <button className={`inline-flex items-center gap-2 px-6 py-3 text-base rounded-xl border font-medium transition-all
              ${isDark
                ? "border-dark-border text-slate-200 hover:border-arc-400/40 hover:bg-dark-card"
                : "border-light-border text-slate-700 hover:border-arc-400/50 hover:bg-light-hover"}`}>
              Create Auction
            </button>
          </Link>
        </div>
      </section>

      {/* Stats */}
      {totalCount > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-16">
          {[
            { label: "Total Auctions", value: totalCount },
            { label: "Active Now",     value: recentAddresses.length },
            { label: "Network",        value: "Arc Testnet" },
          ].map(({ label, value }) => (
            <div key={label} className={`rounded-xl p-4 text-center border ${cardBg}`}>
              <p className={`text-2xl font-bold ${isDark ? "text-arc-400" : "text-arc-500"}`}>{value}</p>
              <p className={`text-xs mt-1 ${mutedText}`}>{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* How it works */}
      <section className="mb-20">
        <h2 className={`text-2xl font-bold text-center mb-10 ${bodyText}`}>How It Works</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { icon: Lock,   step: "01", title: "Commit",  color: "arc",     desc: "Submit a cryptographic hash of your bid. Your amount stays hidden. Deposit USDC as collateral." },
            { icon: Unlock, step: "02", title: "Reveal",  color: "blue",    desc: "After bidding closes, upload your bid receipt to reveal your amount. The contract verifies it matches your hash." },
            { icon: Trophy, step: "03", title: "Settle",  color: "emerald", desc: "The highest valid revealed bid wins. USDC transfers to the seller automatically. Losers get full refunds." },
          ].map(({ icon: Icon, step, title, desc, color }) => (
            <div key={step}
              className={`rounded-xl p-6 relative overflow-hidden group border transition-all duration-200 ${cardBg}
                hover:border-arc-400/30`}>
              <div className={`absolute top-4 right-4 text-5xl font-black select-none transition-colors
                ${isDark ? "text-dark-border group-hover:text-dark-hover" : "text-light-border group-hover:text-slate-200"}`}>
                {step}
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
                color === "arc"     ? "bg-arc-400/10 text-arc-400" :
                color === "blue"   ? "bg-blue-500/10 text-blue-400" :
                                     "bg-emerald-500/10 text-emerald-400"
              }`}>
                <Icon size={20} />
              </div>
              <h3 className={`font-semibold mb-2 ${bodyText}`}>{title}</h3>
              <p className={`text-sm leading-relaxed ${mutedText}`}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Auctions */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-2xl font-bold ${bodyText}`}>Recent Auctions</h2>
          <Link to="/explore"
            className="text-arc-400 hover:text-arc-300 text-sm flex items-center gap-1 transition-colors">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <AuctionGrid addresses={recentAddresses} emptyMessage="No auctions yet — be the first to create one." />
      </section>
    </div>
  );
}
