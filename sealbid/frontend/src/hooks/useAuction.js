import { useState, useCallback, useEffect, useRef } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "../context/Web3Context";
import { AUCTION_ABI, AUCTION_STATE } from "../utils/constants";
import { useUSDC } from "./useUSDC";

export function useAuction(auctionAddress) {
  const { signer, provider, address } = useWeb3();
  const { ensureAllowance } = useUSDC();
  const [auctionInfo, setAuctionInfo] = useState(null);
  const [commitment, setCommitment] = useState(null);
  const [revealedBids, setRevealedBids] = useState([]);
  const [loading, setLoading] = useState(false);
  const [txPending, setTxPending] = useState(false);
  const pollRef = useRef(null);

  function getContract(withSigner = false) {
    const runner = withSigner ? signer : provider;
    if (!runner || !auctionAddress) throw new Error("No provider or address");
    return new ethers.Contract(auctionAddress, AUCTION_ABI, runner);
  }

  const fetchAuctionInfo = useCallback(async () => {
    if (!provider || !auctionAddress) return;
    try {
      const contract = getContract(false);
      const raw = await contract.getAuctionInfo();
      const info = {
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
      };
      setAuctionInfo(info);
      return info;
    } catch (err) {
      console.error("fetchAuctionInfo error:", err);
    }
  }, [provider, auctionAddress]);

  const fetchCommitment = useCallback(async () => {
    if (!provider || !auctionAddress || !address) return;
    try {
      const contract = getContract(false);
      const raw = await contract.getCommitment(address);
      if (raw.timestamp === 0n) {
        setCommitment(null);
      } else {
        setCommitment({
          commitHash: raw.commitHash,
          deposit: raw.deposit,
          revealed: raw.revealed,
          refunded: raw.refunded,
          revealedAmount: raw.revealedAmount,
          timestamp: Number(raw.timestamp),
        });
      }
    } catch (err) {
      console.error("fetchCommitment error:", err);
    }
  }, [provider, auctionAddress, address]);

  const fetchRevealedBids = useCallback(async () => {
    if (!provider || !auctionAddress) return;
    try {
      const contract = getContract(false);
      const [bidderAddrs, amounts] = await contract.getAllRevealedBids();
      const bids = bidderAddrs.map((addr, i) => ({
        bidder: addr,
        amount: amounts[i],
        revealed: amounts[i] > 0n,
      }));
      // Sort by amount descending
      bids.sort((a, b) => (b.amount > a.amount ? 1 : -1));
      setRevealedBids(bids);
    } catch (err) {
      console.error("fetchRevealedBids error:", err);
    }
  }, [provider, auctionAddress]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([fetchAuctionInfo(), fetchCommitment(), fetchRevealedBids()]);
    } finally {
      setLoading(false);
    }
  }, [fetchAuctionInfo, fetchCommitment, fetchRevealedBids]);

  // Initial fetch + polling every 30s
  useEffect(() => {
    if (!auctionAddress || !provider) return;
    refresh();
    pollRef.current = setInterval(refresh, 30000);
    return () => clearInterval(pollRef.current);
  }, [auctionAddress, provider, address]);

  // ─── Actions ──────────────────────────────────────────────────────────────────

  const commitBid = useCallback(
    async (commitHash, depositAmount) => {
      if (!signer) throw new Error("Wallet not connected");
      setTxPending(true);
      try {
        // Step 1: Approve USDC
        const approvalHash = await ensureAllowance(auctionAddress, depositAmount);

        // Step 2: Commit
        const contract = getContract(true);
        const tx = await contract.commit(commitHash, depositAmount);
        await tx.wait();
        await refresh();
        return { txHash: tx.hash, approvalHash };
      } finally {
        setTxPending(false);
      }
    },
    [signer, auctionAddress, ensureAllowance, refresh]
  );

  const revealBid = useCallback(
    async (bidAmount, salt) => {
      if (!signer) throw new Error("Wallet not connected");
      setTxPending(true);
      try {
        const contract = getContract(true);
        const tx = await contract.reveal(bidAmount, salt);
        await tx.wait();
        await refresh();
        return tx.hash;
      } finally {
        setTxPending(false);
      }
    },
    [signer, auctionAddress, refresh]
  );

  const settleAuction = useCallback(async () => {
    if (!signer) throw new Error("Wallet not connected");
    setTxPending(true);
    try {
      const contract = getContract(true);
      const tx = await contract.settle();
      await tx.wait();
      await refresh();
      return tx.hash;
    } finally {
      setTxPending(false);
    }
  }, [signer, auctionAddress, refresh]);

  const claimRefund = useCallback(async () => {
    if (!signer) throw new Error("Wallet not connected");
    setTxPending(true);
    try {
      const contract = getContract(true);
      const tx = await contract.claimRefund();
      await tx.wait();
      await refresh();
      return tx.hash;
    } finally {
      setTxPending(false);
    }
  }, [signer, auctionAddress, refresh]);

  const cancelAuction = useCallback(async () => {
    if (!signer) throw new Error("Wallet not connected");
    setTxPending(true);
    try {
      const contract = getContract(true);
      const tx = await contract.cancelAuction();
      await tx.wait();
      await refresh();
      return tx.hash;
    } finally {
      setTxPending(false);
    }
  }, [signer, auctionAddress, refresh]);

  return {
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
  };
}
