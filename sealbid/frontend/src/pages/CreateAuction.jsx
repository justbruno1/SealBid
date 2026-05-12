import { useWeb3 } from "../context/Web3Context";
import { CreateAuctionForm } from "../components/auction/CreateAuctionForm";
import { Button } from "../components/ui/Button";
import { AlertTriangle } from "lucide-react";

export function CreateAuction() {
  const { address, connect, connecting, isCorrectNetwork, switchToArc } = useWeb3();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-bold text-[#f1f5f9] mb-2">Create Auction</h1>
      <p className="text-[#94a3b8] text-sm mb-8">
        Launch a sealed-bid auction on Arc Testnet. Bids are hidden until the reveal phase.
      </p>

      {!address ? (
        <div className="bg-[#1a1a28] border border-[#2a2a3d] rounded-xl p-8 text-center">
          <AlertTriangle size={32} className="text-amber-400 mx-auto mb-3" />
          <p className="text-[#f1f5f9] font-medium mb-2">Wallet not connected</p>
          <p className="text-[#94a3b8] text-sm mb-5">Connect MetaMask to create an auction.</p>
          <Button variant="gradient" onClick={connect} loading={connecting}>
            Connect Wallet
          </Button>
        </div>
      ) : !isCorrectNetwork ? (
        <div className="bg-[#1a1a28] border border-amber-500/20 rounded-xl p-8 text-center">
          <AlertTriangle size={32} className="text-amber-400 mx-auto mb-3" />
          <p className="text-[#f1f5f9] font-medium mb-2">Wrong Network</p>
          <p className="text-[#94a3b8] text-sm mb-5">Switch to Arc Testnet to continue.</p>
          <Button variant="secondary" onClick={switchToArc}>
            Switch to Arc Testnet
          </Button>
        </div>
      ) : (
        <div className="bg-[#1a1a28] border border-[#2a2a3d] rounded-xl p-6 sm:p-8">
          <CreateAuctionForm />
        </div>
      )}
    </div>
  );
}
