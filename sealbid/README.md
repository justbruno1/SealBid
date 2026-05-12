# SealBid — Blind Auction House on Arc Network

SealBid is a fully on-chain blind (sealed-bid) auction platform built on [Arc Network](https://arc.network) — Circle's EVM-compatible Layer-1 blockchain where USDC is the native gas token. Anyone can create an auction, receive sealed bids from participants, run a public reveal phase, and automatically settle USDC to the winner — all without a backend.

The commit-reveal scheme guarantees fairness: bids are hashed on-chain during the bidding phase so nobody can see any amounts. After the commit window closes, bidders reveal their actual amounts. The highest valid revealed bid wins, and settlement is automatic via smart contract.

## How Blind Auctions Work

1. **Commit** — You submit `keccak256(bidAmount + salt + yourAddress + auctionAddress)` along with a USDC deposit. Your actual bid is invisible to everyone, including the contract.
2. **Reveal** — After the commit window closes, you upload your bid receipt (a JSON file generated at commit time) to prove your actual bid. The contract verifies the hash matches.
3. **Settle** — After the reveal window closes, anyone calls `settle()`. The highest valid revealed bid wins; USDC goes to the seller; all losers get full refunds.

## Prerequisites

- Node.js v18+
- MetaMask browser extension
- Testnet USDC from [faucet.circle.com](https://faucet.circle.com) (select Arc Testnet)

## Contract Deployment

```bash
# 1. Clone and install
git clone <repo>
cd sealbid
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env — fill in PRIVATE_KEY and ARC_TESTNET_RPC_URL

# 3. Compile contracts
npx hardhat compile

# 4. Deploy to Arc Testnet
npx hardhat run scripts/deploy.js --network arcTestnet
```

The deploy script prints your factory address and the exact `.env` lines to copy.

## Frontend Setup

```bash
cd frontend
npm install

# Copy the VITE_ values from deploy output into .env
npm run dev
# Opens at http://localhost:5173
```

## Environment Variables

After deploying, your `.env` should look like this:

```
PRIVATE_KEY=<your deployer private key>
ARC_TESTNET_RPC_URL=https://rpc.testnet.arc.network
USDC_ADDRESS=0x3600000000000000000000000000000000000000

VITE_FACTORY_ADDRESS=<output from deploy script>
VITE_USDC_ADDRESS=0x3600000000000000000000000000000000000000
VITE_ARC_RPC_URL=https://rpc.testnet.arc.network
VITE_CHAIN_ID=5042002
VITE_BLOCK_EXPLORER_URL=https://testnet.arcscan.app
```

## Deploy Frontend to Vercel

1. Push the `frontend/` folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → New Project → Import repo
3. Set **Root Directory** to `frontend`
4. Add all `VITE_` environment variables in the Vercel dashboard
5. Click Deploy — done

## Network Details

| Parameter | Value |
|-----------|-------|
| Network | Arc Testnet |
| Chain ID | 5042002 |
| RPC URL | https://rpc.testnet.arc.network |
| Currency | USDC (gas token) |
| Explorer | https://testnet.arcscan.app |
| Faucet | https://faucet.circle.com |

## Contract Addresses

| Contract | Address |
|----------|---------|
| SealBidFactory | _fill after deploy_ |
| USDC (ERC-20) | 0x3600000000000000000000000000000000000000 |

## Architecture

```
User Browser
     │
     │  ethers.js v6
     ▼
MetaMask ──── Arc Testnet RPC
                    │
                    ▼
         ┌──────────────────┐
         │  SealBidFactory  │  ← deploys auctions, registry
         └────────┬─────────┘
                  │ createAuction()
                  ▼
         ┌──────────────────┐
         │  SealBidAuction  │  ← per-auction contract
         │                  │
         │  COMMIT phase    │  commit(hash, deposit)
         │  REVEAL phase    │  reveal(amount, salt)
         │  SETTLED/CANCEL  │  settle() / claimRefund()
         └──────────────────┘
                  │
                  │  USDC ERC-20 transfers
                  ▼
         0x3600000000000000000000000000000000000000
```

## Important Notes on USDC and Gas

Arc uses USDC as the native gas token. Every transaction costs ~$0.01 in USDC. When bidding, you need USDC for both:
- Your bid deposit (held in escrow)
- Gas for the approve + commit transactions (~$0.02 total)

Make sure to get enough testnet USDC from the faucet before testing.
