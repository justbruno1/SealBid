import { Link } from "react-router-dom";
import { Gavel, ExternalLink } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export function Footer() {
  const { isDark } = useTheme();
  const border  = isDark ? "border-dark-border"  : "border-light-border";
  const bg      = isDark ? "bg-dark-bg"           : "bg-white";
  const subtext = isDark ? "text-slate-500"        : "text-slate-400";
  const link    = "text-slate-500 hover:text-arc-400 transition-colors";

  return (
    <footer className={`border-t ${border} ${bg} mt-20 transition-colors duration-300`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-gradient-to-br from-arc-400 to-arc-600 rounded-md flex items-center justify-center">
                <Gavel size={11} className="text-white" />
              </div>
              <span className={`font-bold text-sm ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                Seal<span className="text-arc-400">Bid</span>
              </span>
            </div>
            <p className={`text-xs max-w-xs ${subtext}`}>
              Blind auction house on Arc Network. Sealed bids, fair reveals, automatic USDC settlement.
            </p>
          </div>

          <div className="flex flex-col gap-2 text-xs">
            {[
              { href: "https://faucet.circle.com",    label: "Get testnet USDC" },
              { href: "https://testnet.arcscan.app",  label: "Arc Block Explorer" },
              { href: "https://docs.arc.network",     label: "Arc Docs" },
            ].map(({ href, label }) => (
              <a key={href} href={href} target="_blank" rel="noopener noreferrer"
                className={`flex items-center gap-1.5 ${link}`}>
                <ExternalLink size={11} />
                {label}
              </a>
            ))}
          </div>
        </div>

        <div className={`mt-8 pt-6 border-t ${border} flex flex-col sm:flex-row items-center justify-between gap-2 text-xs ${subtext}`}>
          <span>Live on Arc Testnet · Chain ID 5042002</span>
          <span>Built with Solidity + React + ethers.js</span>
        </div>
      </div>
    </footer>
  );
}