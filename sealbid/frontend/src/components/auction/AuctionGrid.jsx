import { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import { AuctionCard } from "./AuctionCard";
import { AUCTION_ABI } from "../../utils/constants";
import { Loader2, Gavel } from "lucide-react";
import { Link } from "react-router-dom";

// Always use direct RPC — no wallet dependency
function getProvider() {
  const rpc = import.meta.env.VITE_ARC_RPC_URL || "https://rpc.testnet.arc.network";
  return new ethers.JsonRpcProvider(rpc);
}

export function AuctionGrid({ addresses, emptyMessage = "No auctions found.", loading: externalLoading }) {
  const [infos, setInfos] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchInfos = useCallback(async () => {
    if (!addresses || addresses.length === 0) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const prov = getProvider();
    try {
      const results = await Promise.allSettled(
        addresses.map(async (addr) => {
          const contract = new ethers.Contract(addr, AUCTION_ABI, prov);
          const raw = await contract.getAuctionInfo();
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
      const newInfos = {};
      for (const r of results) {
        if (r.status === "fulfilled") newInfos[r.value.addr] = r.value.info;
      }
      setInfos(newInfos);
    } catch (err) {
      console.error("AuctionGrid fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(addresses)]);

  // Fire immediately when addresses change — no wallet needed
  useEffect(() => {
    fetchInfos();
  }, [fetchInfos]);

  const isLoading = externalLoading || loading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="animate-spin text-arc-400" size={28} />
      </div>
    );
  }

  if (!addresses || addresses.length === 0 || Object.keys(infos).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
          <Gavel size={24} className="text-slate-500" />
        </div>
        <p className="text-slate-400 text-sm mb-4">{emptyMessage}</p>
        <Link to="/create" className="text-arc-400 hover:text-arc-300 text-sm font-medium transition-colors">
          Create the first auction →
        </Link>
      </div>
    );
  }

  const sorted = [...addresses]
    .filter((a) => infos[a])
    .sort((a, b) => (infos[b]?.createdAt || 0) - (infos[a]?.createdAt || 0));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {sorted.map((addr) => (
        <AuctionCard key={addr} address={addr} info={infos[addr]} />
      ))}
    </div>
  );
}
