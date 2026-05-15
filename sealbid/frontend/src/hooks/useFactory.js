import { useState, useCallback } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "../context/Web3Context";
import { FACTORY_ADDRESS, FACTORY_ABI } from "../utils/constants";

// Always returns a working provider — wallet if connected, public RPC otherwise
function getFallbackProvider() {
  const rpc = import.meta.env.VITE_ARC_RPC_URL || "https://rpc.testnet.arc.network";
  return new ethers.JsonRpcProvider(rpc);
}

export function useFactory() {
  const { signer, provider } = useWeb3();
  const [loading, setLoading] = useState(false);

  function getReadContract() {
    const runner = provider || getFallbackProvider();
    if (!FACTORY_ADDRESS) throw new Error("VITE_FACTORY_ADDRESS not set in .env");
    return new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, runner);
  }

  function getWriteContract() {
    if (!signer) throw new Error("Wallet not connected");
    return new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);
  }

  const getAuctions = useCallback(async () => {
    const contract = getReadContract();
    return await contract.getAuctions();
  }, [provider]);

  const getAuctionsByCreator = useCallback(async (address) => {
    const contract = getReadContract();
    return await contract.getAuctionsByCreator(address);
  }, [provider]);

  const getAuctionCount = useCallback(async () => {
    const contract = getReadContract();
    const count = await contract.auctionCount();
    return Number(count);
  }, [provider]);

  const createAuction = useCallback(async (params) => {
    if (!signer) throw new Error("Wallet not connected");
    setLoading(true);
    try {
      const contract = getWriteContract();
      const tx = await contract.createAuction(
        params.title,
        params.description,
        params.category,
        params.imageUrl || "",
        params.reservePrice,
        params.reserveVisible,
        params.commitDuration,
        params.revealDuration
      );
      const receipt = await tx.wait();
      const event = receipt.logs
        .map((log) => {
          try { return contract.interface.parseLog(log); }
          catch { return null; }
        })
        .find((e) => e && e.name === "AuctionCreated");
      return {
        txHash: tx.hash,
        auctionAddress: event ? event.args.auctionAddress : null,
      };
    } finally {
      setLoading(false);
    }
  }, [signer]);

  return { getAuctions, getAuctionsByCreator, getAuctionCount, createAuction, loading };
}
