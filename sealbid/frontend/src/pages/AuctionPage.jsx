import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AuctionDetail } from "../components/auction/AuctionDetail";

export function AuctionPage() {
  const { address } = useParams();

  if (!address || !address.startsWith("0x")) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 text-center">
        <p className="text-[#94a3b8]">Invalid auction address.</p>
        <Link to="/explore" className="text-indigo-400 hover:text-indigo-300 text-sm mt-4 inline-block">
          ← Back to Explore
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <Link
        to="/explore"
        className="inline-flex items-center gap-1.5 text-[#94a3b8] hover:text-[#f1f5f9] text-sm mb-6 transition-colors"
      >
        <ArrowLeft size={14} />
        Back to Explore
      </Link>
      <AuctionDetail auctionAddress={address} />
    </div>
  );
}
