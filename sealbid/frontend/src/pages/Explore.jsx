import { useState, useEffect, useMemo } from "react";
import { ethers } from "ethers";
import { Search } from "lucide-react";
import { AuctionCard } from "../components/auction/AuctionCard";
import { useFactory } from "../hooks/useFactory";
import { useWeb3 } from "../context/Web3Context";
import { AUCTION_ABI, CATEGORIES, AUCTION_STATE } from "../utils/constants";
import { Loader2, Gavel } from "lucide-react";
import { Link } from "react-router-dom";

const STATUS_FILTERS = ["All", "Bidding", "Reveal", "Settled", "Cancelled"];
const STATUS_MAP = { Bidding: 0, Reveal: 1, Settled: 2, Cancelled: 3 };

export function Explore() {
  const { getAuctions } = useFactory();
  const { provider } = useWeb3();
  const [addresses, setAddresses] = useState([]);
  const [infos, setInfos] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [sort, setSort] = useState("Newest");

  useEffect(() => {
    if (!provider) return;
    (async () => {
      setLoading(true);
      try {
        const all = await getAuctions();
        setAddresses(all);
        const results = await Promise.allSettled(
          all.map(async (addr) => {
            const c = new ethers.Contract(addr, AUCTION_ABI, provider);
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
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [provider]);

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
    if (category !== "All") {
      list = list.filter((a) => infos[a].category === category);
    }
    if (status !== "All") {
      list = list.filter((a) => infos[a].state === STATUS_MAP[status]);
    }
    list.sort((a, b) => {
      if (sort === "Newest") return infos[b].createdAt - infos[a].createdAt;
      if (sort === "Oldest") return infos[a].createdAt - infos[b].createdAt;
      if (sort === "Most Bids") return infos[b].commitCount - infos[a].commitCount;
      if (sort === "Ending Soon") {
        const now = Date.now() / 1000;
        const deadA = infos[a].state === 0 ? infos[a].commitDeadline : infos[a].revealDeadline;
        const deadB = infos[b].state === 0 ? infos[b].commitDeadline : infos[b].revealDeadline;
        return deadA - deadB;
      }
      return 0;
    });
    return list;
  }, [addresses, infos, search, category, status, sort]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-bold text-[#f1f5f9] mb-8">Explore Auctions</h1>

      {/* Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search auctions..."
            className="w-full bg-[#1a1a28] border border-[#2a2a3d] rounded-lg pl-9 pr-4 py-2.5 text-sm text-[#f1f5f9] placeholder:text-[#475569] focus:outline-none focus:border-indigo-500/50"
            aria-label="Search auctions"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="bg-[#1a1a28] border border-[#2a2a3d] rounded-lg px-3 py-2.5 text-sm text-[#f1f5f9] focus:outline-none focus:border-indigo-500/50"
          aria-label="Sort auctions"
        >
          {["Newest", "Oldest", "Most Bids", "Ending Soon"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-4 scrollbar-none" role="tablist" aria-label="Filter by category">
        {["All", ...CATEGORIES].map((c) => (
          <button
            key={c}
            role="tab"
            aria-selected={category === c}
            onClick={() => setCategory(c)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              category === c
                ? "bg-indigo-500 text-white"
                : "bg-[#1a1a28] text-[#94a3b8] border border-[#2a2a3d] hover:border-[#3a3a55]"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-8 scrollbar-none" role="tablist" aria-label="Filter by status">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            role="tab"
            aria-selected={status === s}
            onClick={() => setStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              status === s
                ? "bg-[#2a2a3d] text-[#f1f5f9] border border-[#3a3a55]"
                : "text-[#475569] hover:text-[#94a3b8]"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-indigo-400" size={28} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#1a1a28] border border-[#2a2a3d] flex items-center justify-center mb-4">
            <Gavel size={24} className="text-[#475569]" />
          </div>
          <p className="text-[#94a3b8] text-sm mb-4">
            {search || category !== "All" || status !== "All"
              ? "No auctions match your filters."
              : "No auctions yet — be the first to create one."}
          </p>
          <Link to="/create" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">
            Create the first auction →
          </Link>
        </div>
      ) : (
        <>
          <p className="text-[#475569] text-xs mb-4">{filtered.length} auction{filtered.length !== 1 ? "s" : ""} found</p>
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
