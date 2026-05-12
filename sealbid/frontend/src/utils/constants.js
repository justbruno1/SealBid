// ─── Network Config ───────────────────────────────────────────────────────────
export const ARC_CHAIN_ID = 5042002;
export const ARC_CHAIN_ID_HEX = "0x4CE252"; // 5042002 in hex

export const ARC_NETWORK_CONFIG = {
  chainId: ARC_CHAIN_ID_HEX,
  chainName: "Arc Testnet",
  nativeCurrency: {
    name: "USDC",
    symbol: "USDC",
    decimals: 18, // native gas token uses 18 decimals
  },
  rpcUrls: [import.meta.env.VITE_ARC_RPC_URL || "https://rpc.testnet.arc.network"],
  blockExplorerUrls: [import.meta.env.VITE_BLOCK_EXPLORER_URL || "https://testnet.arcscan.app"],
};

// ─── Contract Addresses ───────────────────────────────────────────────────────
export const FACTORY_ADDRESS =
  import.meta.env.VITE_FACTORY_ADDRESS || "0x5e7a4Df8e8Eb875398a0E230d2E3B4d43Cd67ad5";

export const USDC_ADDRESS =
  import.meta.env.VITE_USDC_ADDRESS || "0x3600000000000000000000000000000000000000";

export const BLOCK_EXPLORER_URL =
  import.meta.env.VITE_BLOCK_EXPLORER_URL || "https://testnet.arcscan.app";

// ─── ABIs ─────────────────────────────────────────────────────────────────────
export const FACTORY_ABI = [
  "function createAuction(string title, string description, string category, string imageUrl, uint256 reservePrice, bool reserveVisible, uint256 commitDuration, uint256 revealDuration) returns (address)",
  "function getAuctions() view returns (address[])",
  "function getAuctionsByCreator(address creator) view returns (address[])",
  "function auctionCount() view returns (uint256)",
  "event AuctionCreated(address indexed auctionAddress, address indexed creator, string title, uint256 timestamp)",
];

export const AUCTION_ABI = [
  "function commit(bytes32 commitHash, uint256 depositAmount) external",
  "function reveal(uint256 bidAmount, bytes32 salt) external",
  "function settle() external",
  "function claimRefund() external",
  "function cancelAuction() external",
  "function getAuctionInfo() view returns (tuple(address creator, string title, string description, string category, string imageUrl, uint256 reservePrice, bool reserveVisible, uint256 commitDeadline, uint256 revealDeadline, uint8 state, address winner, uint256 winningBid, uint256 commitCount, uint256 revealCount, uint256 createdAt))",
  "function getCommitment(address bidder) view returns (tuple(bytes32 commitHash, uint256 deposit, bool revealed, bool refunded, uint256 revealedAmount, uint256 timestamp))",
  "function getAllRevealedBids() view returns (address[] bidders, uint256[] amounts)",
  "function hasCommitted(address bidder) view returns (bool)",
  "function hasRevealed(address bidder) view returns (bool)",
  "function getCurrentHighestBid() view returns (uint256)",
  "function getTimeRemaining() view returns (uint256 commitTimeLeft, uint256 revealTimeLeft)",
  "function getBidders() view returns (address[])",
  "event BidCommitted(address indexed bidder, uint256 deposit, uint256 timestamp)",
  "event BidRevealed(address indexed bidder, uint256 amount, bool isHighest)",
  "event AuctionSettled(address indexed winner, uint256 winningBid, bool reserveMet)",
  "event RefundClaimed(address indexed bidder, uint256 amount)",
];

export const ERC20_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
];

// ─── Auction State Enum ───────────────────────────────────────────────────────
export const AUCTION_STATE = {
  COMMIT: 0,
  REVEAL: 1,
  SETTLED: 2,
  CANCELLED: 3,
};

export const AUCTION_STATE_LABELS = {
  0: "Bidding Open",
  1: "Reveal Phase",
  2: "Settled",
  3: "Cancelled",
};

export const CATEGORIES = ["Services", "Digital Assets", "Domains", "Other"];

// ─── USDC Decimals ────────────────────────────────────────────────────────────
export const USDC_DECIMALS = 6;
