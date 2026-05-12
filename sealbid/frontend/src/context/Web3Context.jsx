import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { ARC_CHAIN_ID, ARC_CHAIN_ID_HEX, ARC_NETWORK_CONFIG } from "../utils/constants";

const Web3Context = createContext(null);

export function Web3Provider({ children }) {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

  const isOnArc = (id) => Number(id) === ARC_CHAIN_ID;

  const initProvider = useCallback(async (eth) => {
    const prov = new ethers.BrowserProvider(eth);
    const network = await prov.getNetwork();
    const cid = Number(network.chainId);
    setChainId(cid);
    setIsCorrectNetwork(isOnArc(cid));
    setProvider(prov);

    if (isOnArc(cid)) {
      const sign = await prov.getSigner();
      setSigner(sign);
      setAddress(await sign.getAddress());
    }
  }, []);

  // Auto-reconnect if previously connected
  useEffect(() => {
    const eth = window.ethereum;
    if (!eth) return;
    eth.request({ method: "eth_accounts" }).then((accounts) => {
      if (accounts.length > 0) {
        initProvider(eth);
      }
    });
  }, [initProvider]);

  // Listen for account / chain changes
  useEffect(() => {
    const eth = window.ethereum;
    if (!eth) return;

    const onAccounts = (accounts) => {
      if (accounts.length === 0) {
        setAddress(null);
        setSigner(null);
      } else {
        initProvider(eth);
      }
    };

    const onChain = (chainIdHex) => {
      const cid = parseInt(chainIdHex, 16);
      setChainId(cid);
      setIsCorrectNetwork(isOnArc(cid));
      initProvider(eth);
    };

    eth.on("accountsChanged", onAccounts);
    eth.on("chainChanged", onChain);

    return () => {
      eth.removeListener("accountsChanged", onAccounts);
      eth.removeListener("chainChanged", onChain);
    };
  }, [initProvider]);

  const connect = useCallback(async () => {
    const eth = window.ethereum;
    if (!eth) {
      alert("MetaMask not found. Please install MetaMask to use SealBid.");
      return;
    }
    setConnecting(true);
    try {
      await eth.request({ method: "eth_requestAccounts" });
      await initProvider(eth);
    } catch (err) {
      console.error("Connect error:", err);
    } finally {
      setConnecting(false);
    }
  }, [initProvider]);

  const switchToArc = useCallback(async () => {
    const eth = window.ethereum;
    if (!eth) return;
    try {
      await eth.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: ARC_CHAIN_ID_HEX }],
      });
    } catch (switchErr) {
      if (switchErr.code === 4902) {
        try {
          await eth.request({
            method: "wallet_addEthereumChain",
            params: [ARC_NETWORK_CONFIG],
          });
        } catch (addErr) {
          console.error("Add network error:", addErr);
        }
      } else {
        console.error("Switch network error:", switchErr);
      }
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setSigner(null);
    setProvider(null);
  }, []);

  return (
    <Web3Context.Provider
      value={{
        provider,
        signer,
        address,
        chainId,
        isCorrectNetwork,
        connecting,
        connect,
        disconnect,
        switchToArc,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const ctx = useContext(Web3Context);
  if (!ctx) throw new Error("useWeb3 must be used within Web3Provider");
  return ctx;
}
