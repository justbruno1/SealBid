import { useState, useEffect, useMemo, useCallback } from "react";
import { ethers } from "ethers";
import { Search, RefreshCw, Gavel } from "lucide-react";
import { AuctionCard } from "../components/auction/AuctionCard";
import { useFactory } from "../hooks/useFactory";
import { useWeb3 } from "../context/Web3Context";
import { AUCTION_ABI, CATEGORIES } from "../utils/constants";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const STATUS_FILTERS = ["All", "Bidding", "Reveal", "Settled", "Cancelled"];
const STATUS_MAP = { Bidding: 0, Reveal: 1, Settled: 2, Cancelled: 3 };

// Read-only provider fallback — works even when wallet is not connected
function getReadProvider() {
  const rpc = import.meta.env.VITE_ARC_RPC_URL || "https://rpc.testnet.arc.network";
  return new ethers.JsonRpcProvider(rpc);
}

export function Explore() {
  const { getAuctions } = useFactory();
  const { provider } = useWeb3();
  const { isDark } = useTheme();
  const [addresses, setAddresses] = useState([]);
  const [infos, setInfos] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [sort, setSort] = useState("Newest");

  // Use wallet provider if available, otherwise fall back to public RPC
  const readProvider = useMemo(() => provider || getReadProvider(), [provider]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // getAuctions uses the factory contract — pass readProvider directly if hook isn't ready
      let allAddrs = [];
      try {
        allAddrs = await getAuctions();
      } catch {
        // Factory hook not ready yet — call directly
        const FACTORY = import.meta.env.VITE_FACTORY_ADDRESS;
        if (FACTORY) {
          const factoryAbi = ["function getAuctions() view returns (address[])"];
          const factory = new ethers.Contract(FACTORY, factoryAbi, readProvider);
          allAddrs = await factory.getAuctions();
        }
      }

      setAddresses(allAddrs);

      if (allAddrs.length === 0) { setLoading(false); return; }

      const results = await Promise.allSettled(
        allAddrs.map(async (addr) => {
          const c = new ethers.Contract(addr, AUCTION_ABI, readProvider);
          const raw = await c.getAuctionInfo();
          return {
            addr,
            info: {
              creator: raw.creator,
              title: raw.title,
              description: raw.description,
              category: raw.category,
              imageUrl: raw.imageUrl,
              reservePrice: raw.reservePrice,
              reserveVisible: raw.reserveVisible,
              commitDeadline: Number(raw.commitDeadline),
              revealDeadline: Number(raw.revealDeadline),
              state: Number(raw.state),
              winner: raw.winner,
              winningBid: raw.winningBid,
              commitCount: Number(raw.commitCount),
              revealCount: Number(raw.revealCount),
              createdAt: Number(raw.createdAt),
            },
          };
        })
      );
      const m = {};
      for (const r of results) {
        if (r.status === "fulfilled") m[r.value.addr] = r.value.info;
      }
      setInfos(m);
    } catch (err) {
      console.error("Explore fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [readProvider]);

  // Fetch on mount immediately — no longer waits for provider
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = useMemo(() => {
    let list = addresses.filter((a) => infos[a]);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) => infos[a].title.toLowerCase().includes(q) ||
               infos[a].description.toLowerCase().includes(q)
      );
    }
    if (category !== "All") list = list.filter((a) => infos[a].category === category);
    if (status !== "All")   list = list.filter((a) => infos[a].state === STATUS_MAP[status]);
    list.sort((a, b) => {
      if (sort === "Newest")     return infos[b].createdAt - infos[a].createdAt;
      if (sort === "Oldest")     return infos[a].createdAt - infos[b].createdAt;
      if (sort === "Most Bids")  return infos[b].commitCount - infos[a].commitCount;
      if (sort === "Ending Soon") {
        const now = Date.now() / 1000;
        const dA = infos[a].state === 0 ? infos[a].commitDeadline : infos[a].revealDeadline;
        const dB = infos[b].state === 0 ? infos[b].commitDeadline : infos[b].revealDeadline;
        return dA - dB;
      }
      return 0;
    });
    return list;
  }, [addresses, infos, search, category, status, sort]);

  const inputBg  = isDark ? "bg-dark-card border-dark-border text-slate-100 placeholder:text-slate-500" : "bg-white border-light-border text-slate-800 placeholder:text-slate-400";
  const selectBg = isDark ? "bg-dark-card border-dark-border text-slate-100" : "bg-white border-light-border text-slate-800";
  const bodyText = isDark ? "text-slate-100" : "text-slate-900";
  const mutedText= isDark ? "text-slate-400" : "text-slate-500";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className={`text-3xl font-bold ${bodyText}`}>Explore Auctions</h1>
        <button
          onClick={fetchData}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors
            ${isDark ? "border-dark-border text-slate-400 hover:text-arc-400 hover:border-arc-400/30" : "border-light-border text-slate-500 hover:text-arc-500"}`}
          aria-label="Refresh auctions"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={15} className={`absolute left-3 top-1/2 -translate-y-1/2 ${mutedText}`} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search auctions..."
            className={`w-full rounded-lg pl-9 pr-4 py-2.5 text-sm border focus:outline-none focus:border-arc-400/50 transition-colors ${inputBg}`}
            aria-label="Search auctions"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className={`rounded-lg px-3 py-2.5 text-sm border focus:outline-none focus:border-arc-400/50 transition-colors ${selectBg}`}
          aria-label="Sort auctions"
        >
          {["Newest", "Oldest", "Most Bids", "Ending Soon"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-3 scrollbar-none" role="tablist">
        {["All", ...CATEGORIES].map((c) => (
          <button key={c} role="tab" aria-selected={category === c}
            onClick={() => setCategory(c)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border ${
              category === c
                ? "bg-arc-400 text-white border-arc-400"
                : isDark
                  ? "bg-dark-card text-slate-400 border-dark-border hover:border-arc-400/30 hover:text-arc-400"
                  : "bg-white text-slate-500 border-light-border hover:border-arc-400/50 hover:text-arc-500"
            }`}
          >{c}</button>
        ))}
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-8 scrollbar-none" role="tablist">
        {STATUS_FILTERS.map((s) => (
          <button key={s} role="tab" aria-selected={status === s}
            onClick={() => setStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              status === s
                ? isDark ? "bg-dark-hover text-slate-100 border border-arc-400/30" : "bg-light-hover text-slate-900 border border-arc-400/40"
                : `border border-transparent ${mutedText} hover:text-arc-400`
            }`}
          >{s}</button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <RefreshCw className="animate-spin text-arc-400" size={28} />
          <p className={`text-sm ${mutedText}`}>Loading auctions from Arc Testnet…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 border
            ${isDark ? "bg-dark-card border-dark-border" : "bg-white border-light-border"}`}>
            <Gavel size={24} className={mutedText} />
          </div>
          <p className={`text-sm mb-4 ${mutedText}`}>
            {search || category !== "All" || status !== "All"
              ? "No auctions match your filters."
              : "No auctions yet — be the first to create one."}
          </p>
          <Link to="/create" className="text-arc-400 hover:text-arc-300 text-sm font-medium transition-colors">
            Create the first auction →
          </Link>
        </div>
      ) : (
        <>
          <p className={`text-xs mb-4 ${mutedText}`}>
            {filtered.length} auction{filtered.length !== 1 ? "s" : ""} found
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

