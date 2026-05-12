import { Link } from "react-router-dom";
import { Gavel, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[#2a2a3d] bg-[#0a0a0f] mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-md flex items-center justify-center">
                <Gavel size={12} className="text-white" />
              </div>
              <span className="font-bold text-[#f1f5f9] text-sm">SealBid</span>
            </div>
            <p className="text-[#475569] text-xs max-w-xs">
              Blind auction house on Arc Network. Sealed bids, fair reveals, automatic USDC settlement.
            </p>
          </div>

          <div className="flex flex-col gap-2 text-xs">
            <a
              href="https://faucet.circle.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[#475569] hover:text-indigo-400 transition-colors"
            >
              <ExternalLink size={12} />
              Get testnet USDC
            </a>
            <a
              href="https://testnet.arcscan.app"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[#475569] hover:text-indigo-400 transition-colors"
            >
              <ExternalLink size={12} />
              Arc Block Explorer
            </a>
            <a
              href="https://docs.arc.network"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[#475569] hover:text-indigo-400 transition-colors"
            >
              <ExternalLink size={12} />
              Arc Docs
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#1a1a28] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#475569]">
          <span>Live on Arc Testnet · Chain ID 5042002</span>
          <span>Built with Solidity + React + ethers.js</span>
        </div>
      </div>
    </footer>
  );
}
