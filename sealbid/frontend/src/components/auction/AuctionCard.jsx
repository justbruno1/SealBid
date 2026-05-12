import { Link } from "react-router-dom";
import { Clock, Users, Lock, Eye, TrendingUp } from "lucide-react";
import { Badge } from "../ui/Badge";
import { CountdownTimer } from "../ui/CountdownTimer";
import { formatUSDC, pluralize } from "../../utils/formatters";
import { AUCTION_STATE, AUCTION_STATE_LABELS } from "../../utils/constants";

const STATE_VARIANT = {
  0: "commit",
  1: "reveal",
  2: "settled",
  3: "cancelled",
};

export function AuctionCard({ address, info }) {
  const state = info.state;
  const isActive = state === AUCTION_STATE.COMMIT;
  const isReveal = state === AUCTION_STATE.REVEAL;

  return (
    <Link
      to={`/auction/${address}`}
      className="group block bg-[#1a1a28] border border-[#2a2a3d] rounded-xl p-5 hover:border-indigo-500/40 hover:bg-[#1e1e32] transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/5"
      aria-label={`View auction: ${info.title}`}
    >
      {/* Image */}
      {info.imageUrl && (
        <div className="w-full h-36 rounded-lg overflow-hidden mb-4 bg-[#2a2a3d]">
          <img
            src={info.imageUrl}
            alt={info.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => (e.target.style.display = "none")}
          />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-[#f1f5f9] font-semibold text-sm leading-snug line-clamp-2 group-hover:text-indigo-300 transition-colors">
            {info.title}
          </h3>
        </div>
        <Badge variant={STATE_VARIANT[state]}>{AUCTION_STATE_LABELS[state]}</Badge>
      </div>

      {/* Description */}
      {info.description && (
        <p className="text-[#94a3b8] text-xs leading-relaxed line-clamp-2 mb-3">
          {info.description}
        </p>
      )}

      {/* Category */}
      <div className="mb-4">
        <Badge>{info.category}</Badge>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-3 text-[#475569]">
          <span className="flex items-center gap-1">
            <Users size={12} aria-hidden="true" />
            {pluralize(info.commitCount, "bid")}
          </span>
          {info.reserveVisible && info.reservePrice > 0n && (
            <span className="flex items-center gap-1">
              <TrendingUp size={12} aria-hidden="true" />
              {formatUSDC(info.reservePrice)} USDC
            </span>
          )}
          {!info.reserveVisible && (
            <span className="flex items-center gap-1">
              <Lock size={12} aria-hidden="true" />
              Hidden reserve
            </span>
          )}
        </div>

        {/* Countdown */}
        {(isActive || isReveal) && (
          <span className="flex items-center gap-1 text-[#94a3b8]">
            <Clock size={12} aria-hidden="true" />
            <CountdownTimer
              deadline={isActive ? info.commitDeadline : info.revealDeadline}
            />
          </span>
        )}

        {state === AUCTION_STATE.SETTLED && info.winningBid > 0n && (
          <span className="text-emerald-400 font-medium">
            {formatUSDC(info.winningBid)} USDC
          </span>
        )}
      </div>
    </Link>
  );
}
