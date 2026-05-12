import { USDC_DECIMALS } from "./constants";

/**
 * Format raw USDC units (BigInt) to a human-readable string.
 * @param {bigint|string|number} raw
 * @param {number} dp - decimal places to show
 */
export function formatUSDC(raw, dp = 2) {
  if (raw === null || raw === undefined) return "0.00";
  const n = Number(raw) / 10 ** USDC_DECIMALS;
  return n.toLocaleString("en-US", {
    minimumFractionDigits: dp,
    maximumFractionDigits: dp,
  });
}

/**
 * Parse a human-readable USDC amount to raw units (BigInt).
 * e.g. "100.50" → 100500000n
 */
export function parseUSDC(amount) {
  if (!amount) return 0n;
  const parts = String(amount).split(".");
  const whole = BigInt(parts[0] || "0");
  let frac = 0n;
  if (parts[1]) {
    const fracStr = parts[1].slice(0, USDC_DECIMALS).padEnd(USDC_DECIMALS, "0");
    frac = BigInt(fracStr);
  }
  return whole * BigInt(10 ** USDC_DECIMALS) + frac;
}

/**
 * Truncate an Ethereum address for display.
 */
export function truncateAddress(address, chars = 4) {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Format a Unix timestamp to a locale date string.
 */
export function formatDate(timestamp) {
  if (!timestamp) return "";
  return new Date(Number(timestamp) * 1000).toLocaleString();
}

/**
 * Pluralize a word based on count.
 */
export function pluralize(count, word) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

/**
 * Format seconds into a human-readable duration string.
 */
export function formatDuration(seconds) {
  if (seconds <= 0) return "0s";
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (s > 0 && d === 0) parts.push(`${s}s`);
  return parts.join(" ");
}

/**
 * Map common revert messages to user-friendly text.
 */
export function friendlyError(err) {
  const msg = err?.reason || err?.message || String(err);
  const map = {
    "Not in commit phase": "This auction is not currently accepting bids.",
    "Auction is not in commit phase": "This auction is not currently accepting bids.",
    "Not in reveal phase": "The reveal phase has not started yet.",
    "Reveal phase not ended": "The reveal phase is still active.",
    "Hash mismatch: invalid bid receipt": "Your bid receipt doesn't match. Double-check your receipt file.",
    "Deposit is less than revealed bid amount": "Your deposit was less than your bid. The reveal is invalid.",
    "Already revealed": "You have already revealed your bid for this auction.",
    "No commitment found": "No bid was found for your address in this auction.",
    "Already refunded": "Your refund has already been claimed.",
    "No deposit to refund": "There is no deposit to refund for your address.",
    "Auction not yet settled": "The auction hasn't been settled yet.",
    "Cannot cancel: bids already received": "You cannot cancel an auction that already has bids.",
    "Can only cancel during commit phase": "Auctions can only be cancelled during the bidding phase.",
    "Not the creator": "Only the auction creator can perform this action.",
    "user rejected": "Transaction cancelled.",
    "User rejected": "Transaction cancelled.",
    "insufficient funds": "Insufficient USDC balance. Get testnet USDC at faucet.circle.com",
    "USDC transfer failed": "USDC transfer failed. Make sure you have approved enough USDC.",
  };
  for (const [key, friendly] of Object.entries(map)) {
    if (msg.includes(key)) return friendly;
  }
  if (msg.length > 120) return msg.slice(0, 120) + "…";
  return msg;
}
