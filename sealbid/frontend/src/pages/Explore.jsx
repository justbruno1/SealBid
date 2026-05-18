import { useState, useEffect, useMemo, useCallback } from "react";
import { ethers } from "ethers";
import { Search, RefreshCw, Gavel } from "lucide-react";
import { AuctionCard } from "../components/auction/AuctionCard";
import { useTheme } from "../context/ThemeContext";
import { AUCTION_ABI, CATEGORIES, FACTORY_ADDRESS, FACTORY_ABI } from "../utils/constants";
import { Link } from "react-router-dom";

const STATUS_FILTERS = ["All", "Bidding", "Reveal", "Settled", "Cancelled"];
const STATUS_MAP = { Bidding: 0, Reveal: 1, Settled: 2, Cancelled: 3 };

// Always works — no wallet needed
function getProvider() {
  const rpc = import.meta.env.VITE_ARC_RPC_URL || "https://rpc.testnet.arc.network";
  return new ethers.JsonRpcProvider(rpc);
}

export function Explore() {
  const { isDark } = useTheme();
  const [addresses, setAddresses] = useState([]);
  const [infos, setInfos] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [sort, setSort] = useState("Newest");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!FACTORY_ADDRESS) {
        setError("Factory address not configured. Check your environment variables.");
        return;
      }

      const prov = getProvider();
      const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, prov);
      const allAddrs = await factory.getAuctions();
      setAddresses(allAddrs);

      if (allAddrs.length === 0) {
        setLoading(false);
        return;
      }

      // Fetch all auction infos in parallel
      const results = await Promise.allSettled(
        allAddrs.map(async (addr) => {
          const c = new ethers.Contract(addr, AUCTION_ABI, prov);
          const raw = await c.getAuctionInfo();
          return {
            addr,
            info: {
              creator:        raw.creator,
              title:          raw.title,
              description:    raw.description,
              category:       raw.category,
              imageUrl:       raw.imageUrl,
              reservePrice:   raw.reservePrice,
              reserveVisible: raw.reserveVisible,
              commitDeadline: Number(raw.commitDeadline),
              revealDeadline: Number(raw.revealDeadline),
              state:          Number(raw.state),
              winner:         raw.winner,
              winningBid:     raw.winningBid,
              commitCount:    Number(raw.commitCount),
              revealCount:    Number(raw.revealCount),
              createdAt:      Number(raw.createdAt),
            },
          };
        })
      );

      const m = {};
      for (const r of results) {
        if (r.status === "fulfilled") {
          m[r.value.addr] = r.value.info;
        }
      }
      setInfos(m);
    } catch (err) {
      console.error("Explore fetch error:", err);
      setError("Failed to load auctions. Please try refreshing.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch immediately on mount — no dependency on wallet at all
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = useMemo(() => {
    let list = addresses.filter((a) => infos[a]);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          infos[a].title.toLowerCase().includes(q) ||
          infos[a].description.toLowerCase().includes(q)
      );
    }
    if (category !== "All") list = list.filter((a) => infos[a].category === category);
    if (status !== "All")   list = list.filter((a) => infos[a].state === STATUS_MAP[status]);

    return [...list].sort((a, b) => {
      if (sort === "Newest")      return infos[b].createdAt - infos[a].createdAt;
      if (sort === "Oldest")      return infos[a].createdAt - infos[b].createdAt;
      if (sort === "Most Bids")   return infos[b].commitCount - infos[a].commitCount;
      if (sort === "Ending Soon") {
        const dA = infos[a].state === 0 ? infos[a].commitDeadline : infos[a].revealDeadline;
        const dB = infos[b].state === 0 ? infos[b].commitDeadline : infos[b].revealDeadline;
        return dA - dB;
      }
      return 0;
    });
    return list;
  }, [addresses, infos, search, category, status, sort]);

  // Styles
  const bodyText  = isDark ? "text-white"     : "text-slate-900";
  const mutedText = isDark ? "text-slate-300" : "text-slate-600";
  const subText   = isDark ? "text-slate-400" : "text-slate-500";
  const inputBg   = isDark
    ? "bg-white/10 border-white/15 text-white placeholder:text-slate-500 focus:border-arc-400/60"
    : "bg-white/80 border-blue-200 text-slate-800 placeholder:text-slate-400 focus:border-arc-400";
  const selectBg  = isDark
    ? "bg-white/10 border-white/15 text-white"
    : "bg-white/80 border-blue-200 text-slate-800";
  const tabActive = "bg-arc-400 text-white border-arc-400";
  const tabIdle   = isDark
    ? "bg-white/5 text-slate-400 border-white/10 hover:border-arc-400/40 hover:text-arc-400"
    : "bg-white/60 text-slate-500 border-blue-200/60 hover:border-arc-400/50 hover:text-arc-500";
  const statusActive = isDark
    ? "bg-white/10 text-white border border-arc-400/40"
    : "bg-white/70 text-slate-900 border border-arc-400/50";
  const statusIdle = `border border-transparent ${subText} hover:text-arc-400`;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className={`text-xs font-mono tracking-widest uppercase mb-1 text-arc-400`}>
            MARKETPLACE
          </p>
          <h1 className={`text-3xl font-bold ${bodyText}`}>Explore Auctions</h1>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors
            ${isDark
              ? "border-white/15 text-slate-400 hover:text-arc-400 hover:border-arc-400/30"
              : "border-blue-200 text-slate-500 hover:text-arc-500 hover:border-arc-400/40"}`}
          aria-label="Refresh auctions"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Search + Sort row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={15} className={`absolute left-3 top-1/2 -translate-y-1/2 ${subText}`} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search auctions..."
            className={`w-full rounded-lg pl-9 pr-4 py-2.5 text-sm border focus:outline-none focus:ring-1 focus:ring-arc-400/20 transition-colors ${inputBg}`}
            aria-label="Search auctions"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className={`rounded-lg px-3 py-2.5 text-sm border focus:outline-none transition-colors ${selectBg}`}
          aria-label="Sort auctions"
        >
          {["Newest", "Oldest", "Most Bids", "Ending Soon"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Category filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-3 scrollbar-none" role="tablist" aria-label="Filter by category">
        {["All", ...CATEGORIES].map((c) => (
          <button
            key={c}
            role="tab"
            aria-selected={category === c}
            onClick={() => setCategory(c)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
              category === c ? tabActive : tabIdle
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-8 scrollbar-none" role="tablist" aria-label="Filter by status">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            role="tab"
            aria-selected={status === s}
            onClick={() => setStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              status === s ? statusActive : statusIdle
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Results area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <RefreshCw className="animate-spin text-arc-400" size={32} />
          <p className={`text-sm ${subText}`}>Loading auctions from Arc Testnet…</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <Gavel size={24} className="text-red-400" />
          </div>
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={fetchData}
            className="text-arc-400 hover:text-arc-300 text-sm font-medium transition-colors"
          >
            Try again →
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 border
            ${isDark ? "bg-white/5 border-white/10" : "bg-white/60 border-blue-200/60"}`}>
            <Gavel size={24} className={subText} />
          </div>
          <p className={`text-sm mb-4 ${subText}`}>
            {search || category !== "All" || status !== "All"
              ? "No auctions match your filters."
              : "No auctions yet — be the first to create one."}
          </p>
          <Link
            to="/create"
            className="text-arc-400 hover:text-arc-300 text-sm font-medium transition-colors"
          >
            Create the first auction →
          </Link>
        </div>
      ) : (
        <>
          <p className={`text-xs mb-5 font-mono ${subText}`}>
            {filtered.length} AUCTION{filtered.length !== 1 ? "S" : ""} FOUND
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((addr) => (
              <AuctionCard key={addr} address={addr} info={infos[addr]} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
