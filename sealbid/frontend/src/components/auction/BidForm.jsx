import { useState } from "react";
import toast from "react-hot-toast";
import { Download, Shield, CheckCircle2, AlertTriangle } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { useWeb3 } from "../../context/Web3Context";
import { generateSalt, computeCommitHash } from "../../utils/hash";
import { generateReceipt, downloadReceipt } from "../../utils/bidReceipt";
import { parseUSDC, formatUSDC, friendlyError } from "../../utils/formatters";
import { BLOCK_EXPLORER_URL } from "../../utils/constants";

export function BidForm({ auctionAddress, auctionTitle, onCommitSuccess, existingCommitment }) {
  const { address, isCorrectNetwork } = useWeb3();
  const [bidInput, setBidInput] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [receiptDownloaded, setReceiptDownloaded] = useState(false);
  const [pending, setPending] = useState(false);
  const [step, setStep] = useState("idle"); // idle | approving | committing | done
  const [txHash, setTxHash] = useState(null);

  // We compute these when the modal opens
  const [currentReceipt, setCurrentReceipt] = useState(null);
  const [commitHash, setCommitHash] = useState(null);
  const [rawBidAmount, setRawBidAmount] = useState(0n);

  const handleSealBid = () => {
    const amt = parseFloat(bidInput);
    if (!amt || amt <= 0) {
      toast.error("Enter a valid bid amount.");
      return;
    }
    if (!address) {
      toast.error("Connect your wallet first.");
      return;
    }
    if (!isCorrectNetwork) {
      toast.error("Please switch to Arc Testnet.");
      return;
    }

    const raw = parseUSDC(bidInput);
    const salt = generateSalt();
    const hash = computeCommitHash(raw, salt, address, auctionAddress);
    const receipt = generateReceipt(auctionAddress, auctionTitle, raw.toString(), salt, hash, address);

    setRawBidAmount(raw);
    setCommitHash(hash);
    setCurrentReceipt(receipt);
    setReceiptDownloaded(false);
    setStep("idle");
    setTxHash(null);
    setShowModal(true);
  };

  const handleDownloadReceipt = () => {
    downloadReceipt(currentReceipt);
    setReceiptDownloaded(true);
    toast.success("Bid receipt downloaded. Store it safely!");
  };

  const handleConfirmCommit = async () => {
    if (!receiptDownloaded) {
      toast.error("Please download your bid receipt first.");
      return;
    }
    setPending(true);
    try {
      setStep("approving");
      // Call parent's onCommitSuccess which handles the actual tx
      const result = await onCommitSuccess(commitHash, rawBidAmount);
      setStep("done");
      setTxHash(result?.txHash);
      toast.success("Bid committed on-chain! 🎉");
    } catch (err) {
      toast.error(friendlyError(err));
      setStep("idle");
    } finally {
      setPending(false);
    }
  };

  const handleClose = () => {
    if (pending) return;
    setShowModal(false);
    if (step === "done") {
      setBidInput("");
    }
  };

  if (existingCommitment) {
    return (
      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-2">
          <CheckCircle2 size={20} className="text-emerald-400 flex-shrink-0" />
          <p className="text-emerald-400 font-medium">Bid Sealed</p>
        </div>
        <p className="text-[#94a3b8] text-sm">
          You have a sealed bid in this auction. Your deposit:{" "}
          <span className="text-[#f1f5f9] font-medium">{formatUSDC(existingCommitment.deposit)} USDC</span>
        </p>
        <p className="text-[#475569] text-xs mt-2">
          Wait for the reveal phase, then upload your bid receipt to reveal your bid.
        </p>
        {!existingCommitment.revealed && (
          <div className="mt-3 flex items-start gap-2 bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
            <AlertTriangle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-amber-400 text-xs">
              Keep your bid receipt safe. You cannot reveal without it.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="bg-[#1a1a28] border border-[#2a2a3d] rounded-xl p-5">
        <h3 className="text-[#f1f5f9] font-semibold mb-1">Place a Sealed Bid</h3>
        <p className="text-[#475569] text-xs mb-4">
          Your bid is encrypted on-chain. No one can see the amount until the reveal phase.
        </p>

        <div className="mb-4">
          <label htmlFor="bid-amount" className="block text-xs font-medium text-[#94a3b8] mb-1.5">
            Bid Amount (USDC)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569] text-sm">$</span>
            <input
              id="bid-amount"
              type="number"
              min="0"
              step="0.01"
              value={bidInput}
              onChange={(e) => setBidInput(e.target.value)}
              placeholder="100.00"
              className="w-full bg-[#12121a] border border-[#2a2a3d] rounded-lg pl-8 pr-14 py-2.5 text-[#f1f5f9] text-sm placeholder:text-[#475569] focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
              aria-label="Bid amount in USDC"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#475569] text-xs">USDC</span>
          </div>
          {bidInput && parseFloat(bidInput) > 0 && (
            <p className="text-xs text-[#94a3b8] mt-1.5">
              Your deposit: <span className="text-[#f1f5f9]">{bidInput} USDC</span> — held in escrow until settlement
            </p>
          )}
        </div>

        <div className="flex items-start gap-2 bg-indigo-500/5 border border-indigo-500/20 rounded-lg p-3 mb-4">
          <Shield size={14} className="text-indigo-400 flex-shrink-0 mt-0.5" />
          <p className="text-indigo-300 text-xs">
            USDC is used for both gas and bid deposits on Arc. Make sure you have extra USDC for gas (~$0.01/tx).
          </p>
        </div>

        <Button
          variant="gradient"
          className="w-full"
          onClick={handleSealBid}
          disabled={!bidInput || parseFloat(bidInput) <= 0}
        >
          <Shield size={16} />
          Seal My Bid
        </Button>
      </div>

      {/* Confirmation Modal */}
      <Modal open={showModal} onClose={step === "done" ? handleClose : undefined} title="Confirm Sealed Bid">
        {step === "done" ? (
          <div className="text-center py-4">
            <CheckCircle2 size={48} className="text-emerald-400 mx-auto mb-3" />
            <h3 className="text-[#f1f5f9] font-semibold text-lg mb-2">Bid Committed!</h3>
            <p className="text-[#94a3b8] text-sm mb-4">
              Your sealed bid is now on-chain. Remember to reveal it during the reveal phase.
            </p>
            {txHash && (
              <a
                href={`${BLOCK_EXPLORER_URL}/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300 text-sm underline"
              >
                View transaction →
              </a>
            )}
            <Button variant="primary" className="mt-5 w-full" onClick={handleClose}>
              Done
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#12121a] rounded-lg p-3">
                <p className="text-[#475569] text-xs mb-1">Bid Amount</p>
                <p className="text-[#f1f5f9] font-semibold">{bidInput} USDC</p>
              </div>
              <div className="bg-[#12121a] rounded-lg p-3">
                <p className="text-[#475569] text-xs mb-1">Your Deposit</p>
                <p className="text-[#f1f5f9] font-semibold">{bidInput} USDC</p>
              </div>
            </div>

            {/* Commit Hash */}
            {commitHash && (
              <div className="bg-[#12121a] rounded-lg p-3">
                <p className="text-[#475569] text-xs mb-1">Commitment Hash</p>
                <p className="text-[#94a3b8] text-xs font-mono break-all">{commitHash.slice(0, 30)}…</p>
              </div>
            )}

            {/* Receipt Download — critical */}
            <div className={`rounded-xl p-4 border-2 ${receiptDownloaded ? "border-emerald-500/40 bg-emerald-500/5" : "border-amber-500/40 bg-amber-500/5"}`}>
              <div className="flex items-start gap-3">
                <AlertTriangle size={18} className={receiptDownloaded ? "text-emerald-400" : "text-amber-400"} />
                <div className="flex-1">
                  <p className={`font-semibold text-sm mb-1 ${receiptDownloaded ? "text-emerald-400" : "text-amber-400"}`}>
                    {receiptDownloaded ? "Receipt Downloaded ✓" : "Download Your Bid Receipt"}
                  </p>
                  <p className="text-[#94a3b8] text-xs mb-3">
                    You <strong className="text-[#f1f5f9]">cannot reveal</strong> your bid without this file.
                    Store it in a safe location.
                  </p>
                  <Button
                    variant={receiptDownloaded ? "success" : "secondary"}
                    size="sm"
                    onClick={handleDownloadReceipt}
                  >
                    <Download size={14} />
                    {receiptDownloaded ? "Download Again" : "Download Receipt"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Checkbox */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={receiptDownloaded}
                onChange={(e) => setReceiptDownloaded(e.target.checked)}
                className="w-4 h-4 rounded border-[#2a2a3d] bg-[#12121a] text-indigo-500 focus:ring-indigo-500/30"
              />
              <span className="text-[#94a3b8] text-sm">
                I have downloaded and saved my bid receipt
              </span>
            </label>

            {/* Progress Steps */}
            {pending && (
              <div className="bg-[#12121a] rounded-lg p-3 space-y-2">
                <StepRow label="Approve USDC spending" done={step !== "approving"} active={step === "approving"} />
                <StepRow label="Submit commitment on-chain" done={step === "done"} active={step === "committing"} />
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={handleClose} disabled={pending}>
                Cancel
              </Button>
              <Button
                variant="gradient"
                className="flex-1"
                onClick={handleConfirmCommit}
                loading={pending}
                disabled={!receiptDownloaded}
              >
                Confirm Bid
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

function StepRow({ label, done, active }) {
  return (
    <div className="flex items-center gap-2">
      {done ? (
        <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
      ) : active ? (
        <div className="w-3.5 h-3.5 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin flex-shrink-0" />
      ) : (
        <div className="w-3.5 h-3.5 rounded-full border border-[#475569] flex-shrink-0" />
      )}
      <span className={`text-xs ${done ? "text-emerald-400" : active ? "text-[#f1f5f9]" : "text-[#475569]"}`}>
        {label}
      </span>
    </div>
  );
}
