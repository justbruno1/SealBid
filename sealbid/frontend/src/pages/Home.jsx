import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Gavel, Eye, Coins, ArrowRight, ExternalLink, Lock, Unlock, Trophy } from "lucide-react";
import { Button } from "../components/ui/Button";
import { AuctionGrid } from "../components/auction/AuctionGrid";
import { useFactory } from "../hooks/useFactory";
import { useWeb3 } from "../context/Web3Context";

export function Home() {
  const { getAuctions, getAuctionCount } = useFactory();
  const { provider } = useWeb3();
  const [recentAddresses, setRecentAddresses] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (!provider) return;
    (async () => {
      try {
        const all = await getAuctions();
        const count = all.length;
        setTotalCount(count);
        // Last 6
        setRecentAddresses([...all].reverse().slice(0, 6));
      } catch {
        // Factory not deployed yet — that's OK in dev
      }
    })();
  }, [provider]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      {/* Network Banner */}
      <div className="mt-6 mb-2 flex items-center justify-center">
        <div className="inline-flex items-center gap-2 bg-indigo-500/5 border border-indigo-500/20 rounded-full px-4 py-1.5 text-xs text-indigo-300">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live on Arc Testnet · Get USDC at{" "}
          <a
            href="https://faucet.circle.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline flex items-center gap-0.5"
          >
            faucet.circle.com <ExternalLink size={10} />
          </a>
        </div>
      </div>

      {/* Hero */}
      <section className="text-center py-20">
        <h1 className="text-5xl sm:text-6xl font-bold text-[#f1f5f9] mb-4 tracking-tight leading-tight">
          Sealed.{" "}
          <span className="bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
            Fair.
          </span>{" "}
          Final.
        </h1>
        <p className="text-[#94a3b8] text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          Create blind auctions on Arc Network. Bids are sealed on-chain — nobody sees your
          amount until the reveal. Winner is settled automatically in USDC.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/explore">
            <Button variant="gradient" size="lg">
              Explore Auctions
              <ArrowRight size={16} />
            </Button>
          </Link>
          <Link to="/create">
            <Button variant="secondary" size="lg">
              Create Auction
            </Button>
          </Link>
        </div>
      </section>

      {/* Stats Bar */}
      {totalCount > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-16">
          {[
            { label: "Total Auctions", value: totalCount },
            { label: "Active Now", value: recentAddresses.length },
            { label: "Network", value: "Arc Testnet" },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="bg-[#1a1a28] border border-[#2a2a3d] rounded-xl p-4 text-center"
            >
              <p className="text-2xl font-bold text-[#f1f5f9]">{value}</p>
              <p className="text-[#475569] text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* How it works */}
      <section className="mb-20">
        <h2 className="text-2xl font-bold text-[#f1f5f9] text-center mb-10">How It Works</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              icon: Lock,
              step: "01",
              title: "Commit",
              desc: "Submit a cryptographic hash of your bid. Your amount stays hidden. Deposit USDC as collateral.",
              color: "indigo",
            },
            {
              icon: Unlock,
              step: "02",
              title: "Reveal",
              desc: "After bidding closes, upload your bid receipt to reveal your amount. The contract verifies it matches your hash.",
              color: "purple",
            },
            {
              icon: Trophy,
              step: "03",
              title: "Settle",
              desc: "The highest valid revealed bid wins. USDC is automatically transferred to the seller. Losers get full refunds.",
              color: "emerald",
            },
          ].map(({ icon: Icon, step, title, desc, color }) => (
            <div
              key={step}
              className="bg-[#1a1a28] border border-[#2a2a3d] rounded-xl p-6 relative overflow-hidden group hover:border-indigo-500/30 transition-colors"
            >
              <div className="absolute top-4 right-4 text-5xl font-black text-[#2a2a3d] group-hover:text-[#333350] transition-colors select-none">
                {step}
              </div>
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
                  color === "indigo"
                    ? "bg-indigo-500/10 text-indigo-400"
                    : color === "purple"
                    ? "bg-purple-500/10 text-purple-400"
                    : "bg-emerald-500/10 text-emerald-400"
                }`}
              >
                <Icon size={20} />
              </div>
              <h3 className="text-[#f1f5f9] font-semibold mb-2">{title}</h3>
              <p className="text-[#94a3b8] text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Auctions */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#f1f5f9]">Recent Auctions</h2>
          <Link
            to="/explore"
            className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1 transition-colors"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <AuctionGrid
          addresses={recentAddresses}
          emptyMessage="No auctions yet — be the first to create one."
        />
      </section>
    </div>
  );
}
