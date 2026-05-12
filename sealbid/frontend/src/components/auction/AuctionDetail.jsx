import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import toast from "react-hot-toast";
import {
  Trophy, RefreshCw, Clock, Users, TrendingUp, Lock,
  AlertTriangle, CheckCircle2, XCircle, ExternalLink
} from "lucide-react";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { BidForm } from "./BidForm";
import { RevealForm } from "./RevealForm";
import { PhaseTimer } from "./PhaseTimer";
import { useAuction } from "../../hooks/useAuction";
import { useWeb3 } from "../../context/Web3Context";
import { formatUSDC, truncateAddress, formatDate, pluralize, friendlyError } from "../../utils/formatters";
import { AUCTION_STATE, BLOCK_EXPLORER_URL } from "../../utils/constants";

export function AuctionDetail({ auctionAddress }) {
  const { address } = useWeb3();
  const {
    auctionInfo,
    commitment,
    revealedBids,
    loading,
    txPending,
    refresh,
    commitBid,
    revealBid,
    settleAuction,
    claimRefund,
    cancelAuction,
  } = useAuction(auctionAddress);

  const confettiFired = useRef(false);

  useEffect(() => {
    if (
      auctionInfo?.state === AUCTION_STATE.SETTLED &&
      auctionInfo.winner?.toLowerCase() === address?.toLowerCase() &&
      !confettiFired.current
    ) {
      confettiFired.current = true;
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    }
  }, [auctionInfo, address]);

  if (loading && !auctionInfo) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="animate-spin text-indigo-400" size={28} />
      </div>
    );
  }

  if (!auctionInfo) {
    return (
      <div className="text-center py-20">
        <XCircle size={36} className="text-[#475569] mx-auto mb-3" />
        <p className="text-[#94a3b8]">Auction not found or failed to load.</p>
        <Button variant="secondary" className="mt-4" onClick={refresh}>Retry</Button>
      </div>
    );
  }

  const { state } = auctionInfo;
  const isCreator = address?.toLowerCase() === auctionInfo.creator?.toLowerCase();
  const isWinner = address?.toLowerCase() === auctionInfo.winner?.toLowerCase();
  const userBid = commitment;
  const canSettle = state === AUCTION_STATE.REVEAL && Date.now() / 1000 > auctionInfo.revealDeadline;
  const canClaimRefund =
    (state === AUCTION_STATE.SETTLED || state === AUCTION_STATE.CANCELLED) &&
    userBid &&
    !userBid.refunded;

  const STATE_VARIANT = { 0: "commit", 1: "reveal", 2: "settled", 3: "cancelled" };
  const STATE_LABELS = { 0: "Bidding Open", 1: "Reveal Phase", 2: "Settled", 3: "Cancelled" };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-[#1a1a28] border border-[#2a2a3d] rounded-xl p-6">
        <div className="flex flex-wrap items-start gap-3 mb-3">
          <Badge>{auctionInfo.category}</Badge>
          <Badge variant={STATE_VARIANT[state]}>{STATE_LABELS[state]}</Badge>
        </div>
        <h1 className="text-2xl font-bold text-[#f1f5f9] mb-2">{auctionInfo.title}</h1>
        {auctionInfo.description && (
          <p className="text-[#94a3b8] text-sm leading-relaxed mb-4">{auctionInfo.description}</p>
        )}
        {auctionInfo.imageUrl && (
          <img
            src={auctionInfo.imageUrl}
            alt={auctionInfo.title}
            className="w-full max-h-64 object-cover rounded-lg mb-4"
            onError={(e) => (e.target.style.display = "none")}
          />
        )}
        <div className="flex flex-wrap gap-4 text-sm text-[#475569]">
          <span>
            Creator:{" "}
            <a
              href={`${BLOCK_EXPLORER_URL}/address/${auctionInfo.creator}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 font-mono"
            >
              {truncateAddress(auctionInfo.creator)}
            </a>
          </span>
          <span className="flex items-center gap-1">
            <Users size={13} />
            {pluralize(auctionInfo.commitCount, "sealed bid")}
          </span>
          {auctionInfo.reserveVisible && auctionInfo.reservePrice > 0n ? (
            <span className="flex items-center gap-1">
              <TrendingUp size={13} />
              Reserve: {formatUSDC(auctionInfo.reservePrice)} USDC
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Lock size={13} />
              Reserve hidden
            </span>
          )}
        </div>
      </div>

      {/* Settled Winner Banner */}
      {state === AUCTION_STATE.SETTLED && auctionInfo.winningBid > 0n && (
        <div className={`rounded-xl p-5 border-2 ${isWinner ? "border-yellow-500/40 bg-yellow-500/5" : "border-emerald-500/20 bg-emerald-500/5"}`}>
          <div className="flex items-center gap-3">
            <Trophy size={28} className={isWinner ? "text-yellow-400" : "text-emerald-400"} />
            <div>
              <p className={`font-bold text-lg ${isWinner ? "text-yellow-400" : "text-emerald-400"}`}>
                {isWinner ? "🎉 You Won!" : "Auction Settled"}
              </p>
              <p className="text-[#94a3b8] text-sm">
                Winner: <span className="font-mono text-[#f1f5f9]">{truncateAddress(auctionInfo.winner)}</span>{" "}
                — Winning bid: <span className="text-[#f1f5f9] font-semibold">{formatUSDC(auctionInfo.winningBid)} USDC</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cancelled — reserve not met */}
      {state === AUCTION_STATE.CANCELLED && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <XCircle size={22} className="text-red-400" />
            <div>
              <p className="text-red-400 font-semibold">Auction Cancelled</p>
              <p className="text-[#94a3b8] text-sm mt-0.5">
                {auctionInfo.commitCount === 0
                  ? "No bids were received."
                  : "Reserve price was not met. All deposits can be refunded."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Phase Timers */}
      {(state === AUCTION_STATE.COMMIT || state === AUCTION_STATE.REVEAL) && (
        <div className="bg-[#1a1a28] border border-[#2a2a3d] rounded-xl p-6 flex flex-col items-center">
          <PhaseTimer
            commitDeadline={auctionInfo.commitDeadline}
            revealDeadline={auctionInfo.revealDeadline}
            state={state}
            onPhaseEnd={refresh}
          />
        </div>
      )}

      {/* BidForm — commit phase */}
      {state === AUCTION_STATE.COMMIT && address && (
        <BidForm
          auctionAddress={auctionAddress}
          auctionTitle={auctionInfo.title}
          onCommitSuccess={commitBid}
          existingCommitment={userBid}
        />
      )}

      {/* RevealForm — reveal phase */}
      {state === AUCTION_STATE.REVEAL && address && userBid && (
        <RevealForm
          auctionAddress={auctionAddress}
          commitment={userBid}
          onRevealSuccess={revealBid}
        />
      )}

      {/* Live leaderboard during reveal */}
      {(state === AUCTION_STATE.REVEAL || state === AUCTION_STATE.SETTLED) && revealedBids.length > 0 && (
        <div className="bg-[#1a1a28] border border-[#2a2a3d] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#2a2a3d]">
            <h2 className="text-[#f1f5f9] font-semibold">
              {state === AUCTION_STATE.REVEAL ? "Revealed Bids (Live)" : "Final Bids"}
            </h2>
          </div>
          <div className="divide-y divide-[#2a2a3d]">
            {revealedBids.map((bid, i) => {
              const isThisWinner = bid.bidder?.toLowerCase() === auctionInfo.winner?.toLowerCase();
              const isMe = bid.bidder?.toLowerCase() === address?.toLowerCase();
              return (
                <div
                  key={bid.bidder}
                  className={`flex items-center justify-between px-5 py-3 ${isThisWinner ? "bg-yellow-500/5" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[#475569] text-sm w-5">{i + 1}</span>
                    <a
                      href={`${BLOCK_EXPLORER_URL}/address/${bid.bidder}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:text-indigo-300 font-mono text-sm"
                    >
                      {truncateAddress(bid.bidder)}{isMe ? " (you)" : ""}
                    </a>
                    {isThisWinner && <Badge variant="winner">Winner</Badge>}
                  </div>
                  <span className={`font-semibold text-sm ${isThisWinner ? "text-yellow-400" : bid.revealed ? "text-[#f1f5f9]" : "text-[#475569]"}`}>
                    {bid.revealed ? `${formatUSDC(bid.amount)} USDC` : "Hidden"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Settle Button */}
      {canSettle && (
        <div className="bg-[#1a1a28] border border-[#2a2a3d] rounded-xl p-5">
          <p className="text-[#94a3b8] text-sm mb-3">Reveal phase ended. Settle the auction to determine the winner.</p>
          <Button
            variant="gradient"
            onClick={async () => {
              try {
                await settleAuction();
                toast.success("Auction settled!");
              } catch (err) {
                toast.error(friendlyError(err));
              }
            }}
            loading={txPending}
          >
            Settle Auction
          </Button>
        </div>
      )}

      {/* Claim Refund */}
      {canClaimRefund && (
        <div className="bg-[#1a1a28] border border-[#2a2a3d] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={18} className="text-emerald-400" />
            <p className="text-[#f1f5f9] font-medium">Refund Available</p>
          </div>
          <p className="text-[#94a3b8] text-sm mb-3">
            {isWinner
              ? `You can claim your excess deposit (${formatUSDC(userBid.deposit - auctionInfo.winningBid)} USDC).`
              : `Your deposit of ${formatUSDC(userBid.deposit)} USDC is ready to be refunded.`}
          </p>
          <Button
            variant="success"
            onClick={async () => {
              try {
                await claimRefund();
                toast.success("Refund claimed!");
              } catch (err) {
                toast.error(friendlyError(err));
              }
            }}
            loading={txPending}
          >
            Claim Refund
          </Button>
        </div>
      )}

      {/* Creator Controls */}
      {isCreator && state === AUCTION_STATE.COMMIT && auctionInfo.commitCount === 0 && (
        <div className="bg-[#1a1a28] border border-red-500/20 rounded-xl p-5">
          <p className="text-[#94a3b8] text-sm mb-3">No bids yet. You can cancel this auction.</p>
          <Button
            variant="danger"
            onClick={async () => {
              try {
                await cancelAuction();
                toast.success("Auction cancelled.");
              } catch (err) {
                toast.error(friendlyError(err));
              }
            }}
            loading={txPending}
          >
            Cancel Auction
          </Button>
        </div>
      )}

      {/* Not connected prompt */}
      {!address && state === AUCTION_STATE.COMMIT && (
        <div className="bg-[#1a1a28] border border-[#2a2a3d] rounded-xl p-5 text-center">
          <AlertTriangle size={24} className="text-amber-400 mx-auto mb-2" />
          <p className="text-[#94a3b8] text-sm">Connect your wallet to place a bid.</p>
        </div>
      )}
    </div>
  );
}
