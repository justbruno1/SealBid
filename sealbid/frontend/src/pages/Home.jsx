import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Lock, Unlock, Trophy, ArrowRight, ExternalLink } from "lucide-react";
import { ethers } from "ethers";
import { AuctionGrid } from "../components/auction/AuctionGrid";
import { useTheme } from "../context/ThemeContext";
import { FACTORY_ADDRESS, FACTORY_ABI, AUCTION_ABI } from "../utils/constants";

function getFallbackProvider() {
  const rpc = import.meta.env.VITE_ARC_RPC_URL || "https://rpc.testnet.arc.network";
  return new ethers.JsonRpcProvider(rpc);
}

export function Home() {
  const { isDark } = useTheme();
  const [recentAddresses, setRecentAddresses] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loadingAuctions, setLoadingAuctions] = useState(true);

  // Load auctions directly — no dependency on wallet provider at all
  useEffect(() => {
    (async () => {
      setLoadingAuctions(true);
      try {
        if (!FACTORY_ADDRESS) return;
        const prov = getFallbackProvider();
        const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, prov);
        const all = await factory.getAuctions();
        setTotalCount(all.length);
        setRecentAddresses([...all].reverse().slice(0, 6));
      } catch (err) {
        console.error("Home fetch error:", err);
      } finally {
        setLoadingAuctions(false);
      }
    })();
  }, []);

  const bodyText  = isDark ? "text-white"      : "text-slate-900";
  const mutedText = isDark ? "text-slate-300"  : "text-slate-600";
  const cardBg    = isDark
    ? "bg-white/5 border-white/10 hover:border-arc-400/40"
    : "bg-white/60 border-blue-200/60 hover:border-arc-400/50 shadow-sm";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">

      {/* Network Banner */}
      <div className="mt-6 mb-2 flex justify-center">
        <div className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs border
          ${isDark
            ? "bg-arc-400/5 border-arc-400/20 text-arc-300"
            : "bg-white/50 border-blue-300/50 text-arc-600"}`}>
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
                ? "border-white/20 text-white hover:border-arc-400/50 hover:bg-white/5"
                : "border-blue-200 text-slate-700 hover:border-arc-400/50 hover:bg-white/60"}`}>
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
            <div key={label} className={`rounded-xl p-4 text-center border transition-colors ${cardBg}`}>
              <p className="text-2xl font-bold text-arc-400">{value}</p>
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
            <div key={step} className={`rounded-xl p-6 relative overflow-hidden group border transition-all duration-200 ${cardBg}`}>
              <div className={`absolute top-4 right-4 text-5xl font-black select-none transition-colors
                ${isDark ? "text-white/5 group-hover:text-white/10" : "text-slate-100 group-hover:text-slate-200"}`}>
                {step}
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
                color === "arc"     ? "bg-arc-400/15 text-arc-400" :
                color === "blue"   ? "bg-blue-500/15 text-blue-400" :
                                     "bg-emerald-500/15 text-emerald-400"
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
        <AuctionGrid
          addresses={recentAddresses}
          emptyMessage="No auctions yet — be the first to create one."
          loading={loadingAuctions}
        />
      </section>
    </div>
  );
}
