import { useState, useCallback } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "../context/Web3Context";
import { FACTORY_ADDRESS, FACTORY_ABI } from "../utils/constants";

export function useFactory() {
  const { signer, provider } = useWeb3();
  const [loading, setLoading] = useState(false);

  function getContract(withSigner = false) {
    const runner = withSigner ? signer : provider;
    if (!runner) throw new Error("No provider");
    return new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, runner);
  }

  const getAuctions = useCallback(async () => {
    const contract = getContract();
    return await contract.getAuctions();
  }, [provider]);

  const getAuctionsByCreator = useCallback(
    async (address) => {
      const contract = getContract();
      return await contract.getAuctionsByCreator(address);
    },
    [provider]
  );

  const getAuctionCount = useCallback(async () => {
    const contract = getContract();
    const count = await contract.auctionCount();
    return Number(count);
  }, [provider]);

  const createAuction = useCallback(
    async (params) => {
      if (!signer) throw new Error("Wallet not connected");
      setLoading(true);
      try {
        const contract = getContract(true);
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
        // Extract new auction address from event
        const event = receipt.logs
          .map((log) => {
            try {
              return contract.interface.parseLog(log);
            } catch {
              return null;
            }
          })
          .find((e) => e && e.name === "AuctionCreated");
        return {
          txHash: tx.hash,
          auctionAddress: event ? event.args.auctionAddress : null,
        };
      } finally {
        setLoading(false);
      }
    },
    [signer]
  );

  return { getAuctions, getAuctionsByCreator, getAuctionCount, createAuction, loading };
}
