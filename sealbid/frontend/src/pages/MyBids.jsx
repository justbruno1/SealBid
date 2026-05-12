import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Link } from "react-router-dom";
import { AlertTriangle, Gavel, RefreshCw } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { useWeb3 } from "../context/Web3Context";
import { useFactory } from "../hooks/useFactory";
import { AUCTION_ABI, AUCTION_STATE, BLOCK_EXPLORER_URL } from "../utils/constants";
import { formatUSDC, truncateAddress, friendlyError } from "../utils/formatters";
import toast from "react-hot-toast";

const TAB_LABELS = ["My Auctions", "My Bids"];

export function MyBids() {
  const { address, connect, connecting, provider, signer, isCorrectNetwork } = useWeb3();
  const { getAuctionsByCreator, getAuctions } = useFactory();
  const [tab, setTab] = useState(0);
  const [myAuctions, setMyAuctions] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [loading, setLoading] = useState(false);
  const [txAddr, setTxAddr] = useState(null);

  useEffect(() => {
    if (!address || !provider) return;
    fetchData();
  }, [address, provider]);

  async function fetchData() {
    setLoading(true);
    try {
      // My auctions
      const createdAddrs = await getAuctionsByCreator(address);
      const createdInfos = await loadInfos(createdAddrs);
      setMyAuctions(createdInfos);

      // My bids — scan all auctions for my commitment
      const allAddrs = await getAuctions();
      const bidInfos = [];
      await Promise.allSettled(
        allAddrs.map(async (addr) => {
          const c = new ethers.Contract(addr, AUCTION_ABI, provider);
          const hasC = await c.hasCommitted(address);
          if (hasC) {
            const raw = await c.getAuctionInfo();
            const commit = await c.getCommitment(address);
            bidInfos.push({
              address: addr,
              info: parseInfo(raw),
              commitment: {
                commitHash: commit.commitHash,
                deposit: commit.deposit,
                revealed: commit.revealed,
                refunded: commit.refunded,
                revealedAmount: commit.revealedAmount,
                timestamp: Number(commit.timestamp),
              },
            });
          }
        })
      );
      bidInfos.sort((a, b) => b.commitment.timestamp - a.commitment.timestamp);
      setMyBids(bidInfos);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function loadInfos(addrs) {
    const results = await Promise.allSettled(
      addrs.map(async (addr) => {
        const c = new ethers.Contract(addr, AUCTION_ABI, provider);
        const raw = await c.getAuctionInfo();
        return { address: addr, info: parseInfo(raw) };
      })
    );
    return results.filter((r) => r.status === "fulfilled").map((r) => r.value);
  }

  function parseInfo(raw) {
    return {
      creator: raw.creator,
      title: raw.title,
      description: raw.description,
      category: raw.category,
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
    };
  }

  async function handleClaimRefund(auctionAddr) {
    if (!signer) return;
    setTxAddr(auctionAddr);
    try {
      const c = new ethers.Contract(auctionAddr, AUCTION_ABI, signer);
      const tx = await c.claimRefund();
      await tx.wait();
      toast.success("Refund claimed!");
      fetchData();
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setTxAddr(null);
    }
  }

  const STATE_LABELS = { 0: "Bidding Open", 1: "Reveal Phase", 2: "Settled", 3: "Cancelled" };
  const STATE_VARIANT = { 0: "commit", 1: "reveal", 2: "settled", 3: "cancelled" };

  if (!address) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 text-center">
        <AlertTriangle size={32} className="text-amber-400 mx-auto mb-3" />
        <p className="text-[#f1f5f9] font-medium mb-2">Wallet not connected</p>
        <p className="text-[#94a3b8] text-sm mb-5">Connect your wallet to see your auctions and bids.</p>
        <Button variant="gradient" onClick={connect} loading={connecting}>Connect Wallet</Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-[#f1f5f9]">My Activity</h1>
        <Button variant="ghost" size="sm" onClick={fetchData} loading={loading} aria-label="Refresh">
          <RefreshCw size={14} />
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#1a1a28] border border-[#2a2a3d] rounded-xl p-1 mb-6">
        {TAB_LABELS.map((label, i) => (
          <button
            key={label}
            onClick={() => setTab(i)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === i ? "bg-[#2a2a3d] text-[#f1f5f9]" : "text-[#475569] hover:text-[#94a3b8]"
            }`}
          >
            {label}
            {i === 0 && myAuctions.length > 0 && (
              <span className="ml-1.5 bg-indigo-500/20 text-indigo-400 text-xs px-1.5 py-0.5 rounded-full">
                {myAuctions.length}
              </span>
            )}
            {i === 1 && myBids.length > 0 && (
              <span className="ml-1.5 bg-indigo-500/20 text-indigo-400 text-xs px-1.5 py-0.5 rounded-full">
                {myBids.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="animate-spin text-indigo-400" size={24} />
        </div>
      ) : tab === 0 ? (
        /* My Auctions */
        myAuctions.length === 0 ? (
          <EmptyState message="You haven't created any auctions yet." cta={{ label: "Create your first →", to: "/create" }} />
        ) : (
          <div className="space-y-3">
            {myAuctions.map(({ address: addr, info }) => (
              <Link
                key={addr}
                to={`/auction/${addr}`}
                className="block bg-[#1a1a28] border border-[#2a2a3d] rounded-xl p-4 hover:border-indigo-500/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[#f1f5f9] font-medium text-sm truncate">{info.title}</p>
                    <p className="text-[#475569] text-xs mt-0.5">{info.commitCount} bids · {info.revealCount} revealed</p>
                  </div>
                  <Badge variant={STATE_VARIANT[info.state]}>{STATE_LABELS[info.state]}</Badge>
                </div>
                {info.state === AUCTION_STATE.SETTLED && info.winningBid > 0n && (
                  <p className="text-emerald-400 text-xs mt-2">Won for {formatUSDC(info.winningBid)} USDC</p>
                )}
              </Link>
            ))}
          </div>
        )
      ) : (
        /* My Bids */
        myBids.length === 0 ? (
          <EmptyState message="You haven't placed any bids yet." cta={{ label: "Explore auctions →", to: "/explore" }} />
        ) : (
          <div className="space-y-3">
            {myBids.map(({ address: addr, info, commitment }) => {
              const isWinner = info.winner?.toLowerCase() === address?.toLowerCase();
              const canRefund =
                (info.state === AUCTION_STATE.SETTLED || info.state === AUCTION_STATE.CANCELLED) &&
                !commitment.refunded;
              return (
                <div key={addr} className="bg-[#1a1a28] border border-[#2a2a3d] rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/auction/${addr}`}
                        className="text-[#f1f5f9] font-medium text-sm hover:text-indigo-300 transition-colors truncate block"
                      >
                        {info.title}
                      </Link>
                      <p className="text-[#475569] text-xs mt-0.5">
                        Deposit: {formatUSDC(commitment.deposit)} USDC
                        {commitment.revealed && ` · Revealed: ${formatUSDC(commitment.revealedAmount)} USDC`}
                      </p>
                    </div>
                    <Badge variant={STATE_VARIANT[info.state]}>{STATE_LABELS[info.state]}</Badge>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Committed badge */}
                    <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md px-2 py-0.5">
                      Bid Sealed ✓
                    </span>
                    {commitment.revealed && (
                      <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md px-2 py-0.5">
                        Revealed ✓
                      </span>
                    )}
                    {commitment.refunded && (
                      <span className="text-xs bg-[#2a2a3d] text-[#475569] border border-[#3a3a55] rounded-md px-2 py-0.5">
                        Refunded ✓
                      </span>
                    )}
                    {isWinner && info.state === AUCTION_STATE.SETTLED && (
                      <Badge variant="winner">🏆 Winner</Badge>
                    )}

                    {/* Quick Actions */}
                    {info.state === AUCTION_STATE.REVEAL && !commitment.revealed && (
                      <Link to={`/auction/${addr}`}>
                        <Button variant="secondary" size="sm">Reveal Now →</Button>
                      </Link>
                    )}
                    {canRefund && (
                      <Button
                        variant="success"
                        size="sm"
                        loading={txAddr === addr}
                        onClick={() => handleClaimRefund(addr)}
                      >
                        Claim Refund
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}

function EmptyState({ message, cta }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-2xl bg-[#1a1a28] border border-[#2a2a3d] flex items-center justify-center mb-4">
        <Gavel size={20} className="text-[#475569]" />
      </div>
      <p className="text-[#94a3b8] text-sm mb-4">{message}</p>
      <Link to={cta.to} className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">
        {cta.label}
      </Link>
    </div>
  );
}
