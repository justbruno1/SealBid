import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { Upload, FileCheck, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "../ui/Button";
import { useWeb3 } from "../../context/Web3Context";
import { verifyReceipt } from "../../utils/hash";
import { parseReceiptFile } from "../../utils/bidReceipt";
import { formatUSDC, parseUSDC, friendlyError } from "../../utils/formatters";
import { BLOCK_EXPLORER_URL } from "../../utils/constants";

export function RevealForm({ auctionAddress, commitment, onRevealSuccess }) {
  const { address } = useWeb3();
  const [tab, setTab] = useState("upload"); // upload | manual
  const [dragging, setDragging] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [manualAmount, setManualAmount] = useState("");
  const [manualSalt, setManualSalt] = useState("");
  const [hashValid, setHashValid] = useState(null); // null | true | false
  const [pending, setPending] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const fileRef = useRef(null);

  const verifyAndSet = (r) => {
    if (!commitment || !address) return;
    const { valid } = verifyReceipt(r, commitment.commitHash, address, auctionAddress);
    setHashValid(valid);
  };

  const handleFile = async (file) => {
    try {
      const parsed = await parseReceiptFile(file);
      setReceipt(parsed);
      verifyAndSet(parsed);
      toast.success("Receipt loaded successfully.");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleManualVerify = () => {
    if (!manualAmount || !manualSalt) return;
    const r = {
      bidAmount: parseUSDC(manualAmount).toString(),
      salt: manualSalt.startsWith("0x") ? manualSalt : "0x" + manualSalt,
    };
    setReceipt(r);
    verifyAndSet(r);
  };

  const handleReveal = async () => {
    if (!receipt) return;
    if (hashValid === false) {
      toast.error("Hash mismatch. Check your receipt or manual entry.");
      return;
    }
    setPending(true);
    try {
      const bidAmount = BigInt(receipt.bidAmount);
      const salt = receipt.salt.startsWith("0x") ? receipt.salt : "0x" + receipt.salt;
      const hash = await onRevealSuccess(bidAmount, salt);
      setTxHash(hash);
      toast.success("Bid revealed! 🔓");
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setPending(false);
    }
  };

  if (txHash) {
    return (
      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5 text-center">
        <CheckCircle2 size={36} className="text-emerald-400 mx-auto mb-3" />
        <p className="text-emerald-400 font-semibold mb-1">Bid Revealed!</p>
        <p className="text-[#94a3b8] text-sm mb-3">
          Your bid of{" "}
          <span className="text-[#f1f5f9] font-medium">{formatUSDC(BigInt(receipt.bidAmount))} USDC</span>{" "}
          is now visible on-chain.
        </p>
        <a
          href={`${BLOCK_EXPLORER_URL}/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-400 hover:text-indigo-300 text-sm underline"
        >
          View transaction →
        </a>
      </div>
    );
  }

  if (commitment?.revealed) {
    return (
      <div className="bg-[#1a1a28] border border-[#2a2a3d] rounded-xl p-5">
        <div className="flex items-center gap-3 mb-2">
          <CheckCircle2 size={20} className="text-emerald-400" />
          <p className="text-emerald-400 font-medium">Bid Already Revealed</p>
        </div>
        <p className="text-[#94a3b8] text-sm">
          Your revealed bid: <span className="text-[#f1f5f9] font-semibold">{formatUSDC(commitment.revealedAmount)} USDC</span>
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1a28] border border-[#2a2a3d] rounded-xl p-5">
      <h3 className="text-[#f1f5f9] font-semibold mb-1">Reveal Your Bid</h3>
      <p className="text-[#475569] text-xs mb-4">
        Upload your bid receipt or enter your bid details manually to reveal.
      </p>

      {/* Tab Switch */}
      <div className="flex bg-[#12121a] rounded-lg p-1 mb-4">
        {["upload", "manual"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
              tab === t
                ? "bg-[#2a2a3d] text-[#f1f5f9]"
                : "text-[#475569] hover:text-[#94a3b8]"
            }`}
          >
            {t === "upload" ? "Upload Receipt" : "Manual Entry"}
          </button>
        ))}
      </div>

      {tab === "upload" ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            dragging
              ? "border-indigo-500 bg-indigo-500/5"
              : receipt && hashValid
              ? "border-emerald-500/40 bg-emerald-500/5"
              : receipt && hashValid === false
              ? "border-red-500/40 bg-red-500/5"
              : "border-[#2a2a3d] hover:border-[#3a3a55]"
          }`}
          role="button"
          tabIndex={0}
          aria-label="Upload bid receipt file"
          onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
          />
          {receipt && hashValid !== null ? (
            <div className="flex flex-col items-center gap-2">
              {hashValid ? (
                <FileCheck size={28} className="text-emerald-400" />
              ) : (
                <AlertCircle size={28} className="text-red-400" />
              )}
              <p className={`font-medium text-sm ${hashValid ? "text-emerald-400" : "text-red-400"}`}>
                {hashValid ? "Receipt Valid ✓" : "Hash Mismatch ✗"}
              </p>
              {hashValid && (
                <p className="text-[#94a3b8] text-xs">
                  Bid: <span className="text-[#f1f5f9]">{formatUSDC(BigInt(receipt.bidAmount))} USDC</span>
                </p>
              )}
              {!hashValid && (
                <p className="text-[#94a3b8] text-xs">This receipt doesn't match your commitment on-chain.</p>
              )}
            </div>
          ) : (
            <>
              <Upload size={28} className="text-[#475569] mx-auto mb-2" />
              <p className="text-[#94a3b8] text-sm">Drag & drop or click to upload</p>
              <p className="text-[#475569] text-xs mt-1">sealbid-receipt-*.json</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-[#94a3b8] mb-1.5">Bid Amount (USDC)</label>
            <input
              type="number"
              value={manualAmount}
              onChange={(e) => setManualAmount(e.target.value)}
              placeholder="100.00"
              className="w-full bg-[#12121a] border border-[#2a2a3d] rounded-lg px-3 py-2.5 text-[#f1f5f9] text-sm placeholder:text-[#475569] focus:outline-none focus:border-indigo-500/50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#94a3b8] mb-1.5">Salt (hex)</label>
            <input
              type="text"
              value={manualSalt}
              onChange={(e) => setManualSalt(e.target.value)}
              placeholder="0x..."
              className="w-full bg-[#12121a] border border-[#2a2a3d] rounded-lg px-3 py-2.5 text-[#f1f5f9] text-sm placeholder:text-[#475569] font-mono focus:outline-none focus:border-indigo-500/50"
            />
          </div>
          <Button variant="secondary" size="sm" onClick={handleManualVerify} disabled={!manualAmount || !manualSalt}>
            Verify Hash
          </Button>
          {hashValid !== null && (
            <p className={`text-sm flex items-center gap-1.5 ${hashValid ? "text-emerald-400" : "text-red-400"}`}>
              {hashValid ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
              {hashValid ? "Hash matches your on-chain commitment ✓" : "Hash does not match your commitment ✗"}
            </p>
          )}
        </div>
      )}

      <Button
        variant="gradient"
        className="w-full mt-4"
        onClick={handleReveal}
        loading={pending}
        disabled={!receipt || hashValid === false || hashValid === null}
      >
        Reveal Bid
      </Button>
    </div>
  );
}
