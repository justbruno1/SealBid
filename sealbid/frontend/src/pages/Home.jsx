import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ethers } from "ethers";
import {
  ArrowRight, ExternalLink, Lock, Unlock, Trophy,
  Eye, Zap, Shield, Users, ChevronDown, ChevronUp,
  TrendingUp, AlertTriangle, CheckCircle2
} from "lucide-react";
import { AuctionGrid } from "../components/auction/AuctionGrid";
import { useTheme } from "../context/ThemeContext";
import { FACTORY_ADDRESS, FACTORY_ABI } from "../utils/constants";
import { formatUSDC } from "../utils/formatters";

function getFallbackProvider() {
  const rpc = import.meta.env.VITE_ARC_RPC_URL || "https://rpc.testnet.arc.network";
  return new ethers.JsonRpcProvider(rpc);
}

// ── Scrolling stats ticker (like eBidz) ──────────────────────────────────────
function StatsTicker({ stats }) {
  const items = [...stats, ...stats]; // duplicate for seamless loop
  return (
    <div className="overflow-hidden border-y border-white/10 bg-white/5 backdrop-blur-sm py-2.5">
      <div className="flex animate-[ticker_30s_linear_infinite] whitespace-nowrap">
        {items.map((s, i) => (
          <span key={i} className="inline-flex items-center gap-2 mx-8 text-xs font-mono tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-arc-400 flex-shrink-0" />
            <span className="text-slate-400">{s.label}</span>
            <span className="text-arc-400 font-semibold">{s.value}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ── FAQ accordion item ────────────────────────────────────────────────────────
function FAQItem({ num, question, answer, isDark }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border-b transition-colors ${isDark ? "border-white/10" : "border-blue-200/60"}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-5 text-left gap-4"
        aria-expanded={open}
      >
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono text-arc-400 flex-shrink-0">{num}</span>
          <span className={`font-medium text-sm sm:text-base ${isDark ? "text-white" : "text-slate-900"}`}>
            {question}
          </span>
        </div>
        {open
          ? <ChevronUp size={16} className="text-arc-400 flex-shrink-0" />
          : <ChevronDown size={16} className={`flex-shrink-0 ${isDark ? "text-slate-400" : "text-slate-500"}`} />
        }
      </button>
      {open && (
        <p className={`pb-5 pl-8 text-sm leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
          {answer}
        </p>
      )}
    </div>
  );
}

const FAQS = [
  {
    q: "How does sealed bidding work?",
    a: "When you place a bid, your amount is hashed client-side using a secret salt. Only the hash is stored on-chain — nobody, not even the contract, can see your actual amount. During the reveal phase you upload your bid receipt which proves your original bid. The contract verifies the hash matches and records your revealed amount."
  },
  {
    q: "Can the auction creator see my bid?",
    a: "No. During the commit phase, bids are stored only as cryptographic hashes. The actual amount is invisible to everyone including the creator, other bidders, and any on-chain observers. Only you hold the salt needed to reveal your bid."
  },
  {
    q: "What happens if I lose my bid receipt?",
    a: "You cannot reveal your bid without your receipt file — it contains the secret salt. If you lose it, your deposit is locked until the auction settles. If no valid reveal is found for your commitment, your deposit can be refunded after settlement. Always download and back up your receipt immediately."
  },
  {
    q: "What is the gas cost?",
    a: "Arc Network uses USDC as the native gas token. Each transaction costs approximately $0.01 USDC. A full bid cycle (approve + commit + reveal) costs roughly $0.03 USDC total in gas. Get free testnet USDC at faucet.circle.com."
  },
  {
    q: "What if the reserve price is not met?",
    a: "If no revealed bid meets the reserve price, the auction transitions to CANCELLED state. All deposited USDC is fully refunded to every bidder. The seller receives nothing and can create a new auction."
  },
  {
    q: "Can I update my bid after committing?",
    a: "Yes, during the commit phase only. Submitting a new commitment replaces your old one and refunds your previous deposit. Once the reveal phase begins, no changes are possible."
  },
  {
    q: "How is the winner determined if there is a tie?",
    a: "If two bidders reveal the same amount, the earlier commitment timestamp wins. This rewards decisive bidding and is handled automatically by the smart contract."
  },
];

export function Home() {
  const { isDark } = useTheme();
  const [recentAddresses, setRecentAddresses] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalSettled, setTotalSettled] = useState(0);
  const [loadingAuctions, setLoadingAuctions] = useState(true);

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

  const stats = [
    { label: "Total Auctions",   value: totalCount || "0" },
    { label: "Network",          value: "Arc Testnet" },
    { label: "Gas Token",        value: "USDC" },
    { label: "Bid Privacy",      value: "100%" },
    { label: "Chain ID",         value: "5042002" },
    { label: "Settlement",       value: "Automatic" },
    { label: "Powered By",       value: "Arc Network" },
  ];

  const bodyText  = isDark ? "text-white"     : "text-slate-900";
  const mutedText = isDark ? "text-slate-300" : "text-slate-600";
  const subText   = isDark ? "text-slate-400" : "text-slate-500";
  const cardBg    = isDark
    ? "bg-white/5 border-white/10"
    : "bg-white/70 border-blue-200/60 shadow-sm";
  const sectionLabel = isDark ? "text-arc-400" : "text-arc-500";

  return (
    <div>
      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-24 relative">
        {/* Decorative glow */}
        <div className="absolute right-0 top-0 w-96 h-96 rounded-full blur-3xl opacity-10 bg-arc-400 pointer-events-none" />

        <p className={`text-xs font-mono tracking-widest uppercase mb-6 flex items-center gap-2 ${sectionLabel}`}>
          <span>01 / PROTOCOL</span>
          <span className="h-px w-12 bg-arc-400/40 inline-block" />
          <span className={`px-2 py-0.5 border rounded text-xs ${isDark ? "border-arc-400/30 bg-arc-400/5" : "border-arc-400/40 bg-arc-400/10"}`}>
            POWERED BY ARC NETWORK
          </span>
        </p>

        <h1 className={`text-5xl sm:text-7xl font-bold leading-[1.05] tracking-tight mb-6 ${bodyText}`}>
          The sealed bid<br />
          auction layer for<br />
          <span className="text-arc-400">fair</span> onchain<br />
          markets.
        </h1>

        <p className={`text-lg max-w-2xl mb-10 leading-relaxed ${mutedText}`}>
          SealBid is a blind auction protocol where bids are cryptographically hidden on-chain.
          No bidder, no creator, and no validator can see your amount before the reveal.
          Settlement is automatic in USDC on Arc Network.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/explore">
            <button className="btn-arc px-7 py-3.5 text-base rounded-xl inline-flex items-center gap-2 font-semibold">
              BROWSE LIVE AUCTIONS <ArrowRight size={16} />
            </button>
          </Link>
          <Link to="/create">
            <button className={`inline-flex items-center gap-2 px-7 py-3.5 text-base rounded-xl border font-semibold transition-all
              ${isDark
                ? "border-white/20 text-white hover:border-arc-400/50 hover:bg-white/5"
                : "border-blue-300 text-slate-800 hover:border-arc-400/60 hover:bg-white/60"}`}>
              LAUNCH AN AUCTION
            </button>
          </Link>
        </div>
      </section>

      {/* ── STATS TICKER ──────────────────────────────────────────── */}
      <StatsTicker stats={stats} />

      {/* ── PROBLEM SECTION ───────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
        <p className={`text-xs font-mono tracking-widest uppercase mb-4 flex items-center gap-2 ${sectionLabel}`}>
          <span>02 / PROBLEM</span>
          <span className="h-px w-12 bg-arc-400/40 inline-block" />
        </p>
        <h2 className={`text-4xl sm:text-5xl font-bold leading-tight mb-4 ${bodyText}`}>
          Onchain auctions are<br />
          <span className="text-arc-400">fundamentally broken.</span>
        </h2>
        <p className={`text-base max-w-2xl mb-14 ${mutedText}`}>
          Every transparent bid is a leak. Every plaintext transaction is an invitation to
          manipulate. Traditional onchain auctions are not price-discovery — they are games for insiders.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              num: "/01", icon: Zap, color: "text-red-400",
              stat: "Front-running", label: "BIDS ARE PUBLIC",
              desc: "Every bid hits the mempool as plaintext. Bots can see your amount and react before your tx is confirmed."
            },
            {
              num: "/02", icon: Eye, color: "text-orange-400",
              stat: "0% Privacy", label: "IN OPEN AUCTIONS",
              desc: "In open ascending auctions every bid is visible. Retail bidders are at a permanent disadvantage against chain monitors."
            },
            {
              num: "/03", icon: Users, color: "text-yellow-400",
              stat: "Shill Bids", label: "FAKE COMPETITION",
              desc: "Auction creators and coordinated groups place fake bids to inflate prices and suppress honest competition."
            },
            {
              num: "/04", icon: TrendingUp, color: "text-arc-400",
              stat: "SealBid fixes this", label: "COMMIT-REVEAL SCHEME",
              desc: "Bids are hashed client-side. Nobody sees your amount until the reveal phase. Settlement is automatic and trustless."
            },
          ].map(({ num, icon: Icon, color, stat, label, desc }) => (
            <div key={num} className={`rounded-xl p-5 border ${cardBg}`}>
              <div className="flex items-center justify-between mb-4">
                <span className={`text-xs font-mono ${subText}`}>{num}</span>
                <Icon size={16} className={color} />
              </div>
              <p className={`text-2xl font-bold mb-1 ${color}`}>{stat}</p>
              <p className={`text-xs font-mono tracking-widest uppercase mb-3 ${subText}`}>{label}</p>
              <p className={`text-xs leading-relaxed ${mutedText}`}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────── */}
      <section className={`py-24 ${isDark ? "bg-white/[0.02]" : "bg-white/30"} border-y ${isDark ? "border-white/10" : "border-blue-200/40"}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <p className={`text-xs font-mono tracking-widest uppercase mb-4 flex items-center gap-2 ${sectionLabel}`}>
            <span>03 / PROTOCOL</span>
            <span className="h-px w-12 bg-arc-400/40 inline-block" />
          </p>
          <h2 className={`text-4xl sm:text-5xl font-bold mb-14 ${bodyText}`}>
            How it works.
          </h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                step: "01", icon: Lock, title: "Commit",
                desc: "Enter your bid amount. A secret salt is generated client-side. The hash of (amount + salt + your address + auction address) is submitted on-chain with your USDC deposit. Your actual amount is invisible to everyone."
              },
              {
                step: "02", icon: Unlock, title: "Reveal",
                desc: "After the commit window closes, upload your bid receipt to reveal. The contract recomputes the hash and verifies it matches your stored commitment. Your amount is now public and enters the leaderboard."
              },
              {
                step: "03", icon: Trophy, title: "Settle",
                desc: "After the reveal window ends, anyone can call settle(). The highest valid revealed bid wins. USDC is automatically transferred to the seller. All losing bidders can claim full refunds instantly."
              },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="relative">
                <div className={`text-7xl font-black select-none absolute -top-4 -left-2 ${isDark ? "text-white/5" : "text-slate-100"}`}>
                  {step}
                </div>
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-arc-400/15 text-arc-400 flex items-center justify-center mb-4">
                    <Icon size={20} />
                  </div>
                  <h3 className={`text-xl font-bold mb-3 ${bodyText}`}>{title}</h3>
                  <p className={`text-sm leading-relaxed ${mutedText}`}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECURITY / WHY SEALBID ────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
        <p className={`text-xs font-mono tracking-widest uppercase mb-4 flex items-center gap-2 ${sectionLabel}`}>
          <span>04 / SECURITY</span>
          <span className="h-px w-12 bg-arc-400/40 inline-block" />
        </p>
        <h2 className={`text-4xl sm:text-5xl font-bold mb-4 ${bodyText}`}>
          No admin keys.<br />No backdoors.<br />
          <span className="text-arc-400">No trust required.</span>
        </h2>
        <p className={`text-base max-w-xl mb-14 ${mutedText}`}>
          The protocol guarantees you a refund or the item, no matter what fails.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: Shield, title: "Escrow-only funds",
              desc: "USDC deposits live entirely in the auction contract. Neither the creator nor anyone else has withdrawal rights."
            },
            {
              icon: Zap, title: "Permissionless settlement",
              desc: "settle() is callable by anyone after the reveal deadline. No trusted party or relayer is needed for liveness."
            },
            {
              icon: CheckCircle2, title: "Automatic refunds",
              desc: "Losing bidders can always call claimRefund() after settlement. The contract guarantees their full deposit back."
            },
            {
              icon: Lock, title: "Replay-proof hashing",
              desc: "Commitment hashes include your address and the auction address, preventing replay attacks across auctions."
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className={`rounded-xl p-5 border ${cardBg}`}>
              <Icon size={18} className="text-arc-400 mb-3" />
              <p className={`font-semibold text-sm mb-2 ${bodyText}`}>{title}</p>
              <p className={`text-xs leading-relaxed ${mutedText}`}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── LIVE AUCTIONS ─────────────────────────────────────────── */}
      <section className={`py-24 ${isDark ? "bg-white/[0.02]" : "bg-white/30"} border-y ${isDark ? "border-white/10" : "border-blue-200/40"}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <p className={`text-xs font-mono tracking-widest uppercase mb-4 flex items-center gap-2 ${sectionLabel}`}>
            <span>05 / MARKETPLACE</span>
            <span className="h-px w-12 bg-arc-400/40 inline-block" />
          </p>
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className={`text-4xl font-bold ${bodyText}`}>Live auctions.</h2>
              <p className={`text-sm mt-1 ${subText}`}>
                {totalCount > 0 ? `${totalCount} on-chain auction${totalCount !== 1 ? "s" : ""} found on Arc Testnet` : "Be the first to create an auction"}
              </p>
            </div>
            <Link to="/explore"
              className="text-arc-400 hover:text-arc-300 text-sm flex items-center gap-1 font-medium transition-colors">
              VIEW ALL <ArrowRight size={14} />
            </Link>
          </div>
          <AuctionGrid
            addresses={recentAddresses}
            emptyMessage="No auctions yet — be the first to create one."
            loading={loadingAuctions}
          />
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
        <p className={`text-xs font-mono tracking-widest uppercase mb-4 flex items-center gap-2 ${sectionLabel}`}>
          <span>06 / FAQ</span>
          <span className="h-px w-12 bg-arc-400/40 inline-block" />
        </p>
        <h2 className={`text-4xl sm:text-5xl font-bold mb-12 ${bodyText}`}>
          Frequently asked.
        </h2>
        <div className={`rounded-2xl border overflow-hidden ${isDark ? "border-white/10" : "border-blue-200/60"}`}>
          {FAQS.map((faq, i) => (
            <FAQItem
              key={i}
              num={`0${i + 1}`}
              question={faq.q}
              answer={faq.a}
              isDark={isDark}
            />
          ))}
        </div>
      </section>

      {/* ── BOTTOM CTA ────────────────────────────────────────────── */}
      <section className={`py-24 border-t ${isDark ? "border-white/10 bg-white/[0.02]" : "border-blue-200/40 bg-white/30"}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h2 className={`text-4xl sm:text-5xl font-bold mb-4 ${bodyText}`}>
            Ready to bid sealed?
          </h2>
          <p className={`text-base mb-10 ${mutedText}`}>
            Get testnet USDC from the faucet and start bidding in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/create">
              <button className="btn-arc px-7 py-3.5 text-base rounded-xl inline-flex items-center gap-2 font-semibold">
                LAUNCH YOUR FIRST AUCTION <ArrowRight size={16} />
              </button>
            </Link>
            <Link to="/explore">
              <button className={`inline-flex items-center gap-2 px-7 py-3.5 text-base rounded-xl border font-semibold transition-all
                ${isDark
                  ? "border-white/20 text-white hover:border-arc-400/50 hover:bg-white/5"
                  : "border-blue-300 text-slate-800 hover:border-arc-400/60 hover:bg-white/60"}`}>
                BROWSE MARKETPLACE
              </button>
            </Link>
          </div>
          <div className="mt-10 flex items-center justify-center gap-2">
            <a href="https://faucet.circle.com" target="_blank" rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 text-xs ${isDark ? "text-slate-400 hover:text-arc-400" : "text-slate-500 hover:text-arc-500"} transition-colors`}>
              <ExternalLink size={11} /> Get testnet USDC at faucet.circle.com
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
