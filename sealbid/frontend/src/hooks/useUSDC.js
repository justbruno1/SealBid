import { useCallback } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "../context/Web3Context";
import { USDC_ADDRESS, ERC20_ABI } from "../utils/constants";

export function useUSDC() {
  const { signer, address, provider } = useWeb3();

  function getContract(withSigner = true) {
    const runner = withSigner ? signer : provider;
    if (!runner) throw new Error("No provider");
    return new ethers.Contract(USDC_ADDRESS, ERC20_ABI, runner);
  }

  const getBalance = useCallback(async () => {
    if (!address || !provider) return 0n;
    const contract = getContract(false);
    return await contract.balanceOf(address);
  }, [address, provider]);

  const getAllowance = useCallback(
    async (spender) => {
      if (!address || !provider) return 0n;
      const contract = getContract(false);
      return await contract.allowance(address, spender);
    },
    [address, provider]
  );

  const approve = useCallback(
    async (spender, amount) => {
      if (!signer) throw new Error("Wallet not connected");
      const contract = getContract(true);
      const tx = await contract.approve(spender, amount);
      await tx.wait();
      return tx.hash;
    },
    [signer]
  );

  const ensureAllowance = useCallback(
    async (spender, amount) => {
      const allowance = await getAllowance(spender);
      if (allowance < amount) {
        return await approve(spender, amount);
      }
      return null;
    },
    [getAllowance, approve]
  );

  return { getBalance, getAllowance, approve, ensureAllowance };
}
