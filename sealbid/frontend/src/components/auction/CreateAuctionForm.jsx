import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { StepIndicator } from "../ui/StepIndicator";
import { Button } from "../ui/Button";
import { useFactory } from "../../hooks/useFactory";
import { useWeb3 } from "../../context/Web3Context";
import { parseUSDC, formatUSDC, friendlyError } from "../../utils/formatters";
import { CATEGORIES, BLOCK_EXPLORER_URL } from "../../utils/constants";
import { ChevronRight, ChevronLeft, ExternalLink } from "lucide-react";

const STEPS = ["Details", "Pricing", "Timing"];

const DEFAULT_FORM = {
  title: "",
  description: "",
  category: "Services",
  imageUrl: "",
  reserveEnabled: false,
  reserveAmount: "",
  reserveVisible: false,
  commitHours: 24,
  revealHours: 12,
};

export function CreateAuctionForm() {
  const navigate = useNavigate();
  const { createAuction, loading } = useFactory();
  const { address, isCorrectNetwork } = useWeb3();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [result, setResult] = useState(null);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const canNext = () => {
    if (step === 0) return form.title.trim().length > 0;
    if (step === 1) return !form.reserveEnabled || (form.reserveAmount && parseFloat(form.reserveAmount) > 0);
    return form.commitHours >= 1 && form.revealHours >= 0.5;
  };

  const handleSubmit = async () => {
    if (!address) { toast.error("Connect wallet first."); return; }
    if (!isCorrectNetwork) { toast.error("Switch to Arc Testnet."); return; }
    try {
      const reservePrice = form.reserveEnabled ? parseUSDC(form.reserveAmount) : 0n;
      const commitDuration = BigInt(Math.floor(form.commitHours * 3600));
      const revealDuration = BigInt(Math.floor(form.revealHours * 3600));
      const res = await createAuction({
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        imageUrl: form.imageUrl.trim(),
        reservePrice,
        reserveVisible: form.reserveVisible,
        commitDuration,
        revealDuration,
      });
      setResult(res);
      toast.success("Auction created! 🎉");
    } catch (err) {
      toast.error(friendlyError(err));
    }
  };

  if (result) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🎉</span>
        </div>
        <h2 className="text-[#f1f5f9] text-2xl font-bold mb-2">Auction Created!</h2>
        <p className="text-[#94a3b8] text-sm mb-6">Your auction is live on Arc Testnet.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {result.txHash && (
            <a
              href={`${BLOCK_EXPLORER_URL}/tx/${result.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm border border-indigo-500/30 rounded-lg px-4 py-2 transition-colors"
            >
              <ExternalLink size={14} />
              View Transaction
            </a>
          )}
          {result.auctionAddress && (
            <Button
              variant="gradient"
              onClick={() => navigate(`/auction/${result.auctionAddress}`)}
            >
              Go to Auction →
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Step Indicator */}
      <div className="flex justify-center mb-8">
        <StepIndicator steps={STEPS} currentStep={step} />
      </div>

      {/* Step 0: Details */}
      {step === 0 && (
        <div className="space-y-5 animate-fade-in">
          <div>
            <label className="block text-sm font-medium text-[#94a3b8] mb-1.5">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              maxLength={80}
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="1 hour of consulting"
              className="w-full input-field"
            />
            <p className="text-xs text-[#475569] mt-1">{form.title.length}/80 characters</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#94a3b8] mb-1.5">Description</label>
            <textarea
              maxLength={500}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="What are you auctioning? Include relevant details..."
              rows={3}
              className="w-full input-field resize-none"
            />
            <p className="text-xs text-[#475569] mt-1">{form.description.length}/500 characters</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#94a3b8] mb-1.5">Category</label>
            <select
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              className="w-full input-field"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#94a3b8] mb-1.5">Image URL (optional)</label>
            <input
              type="url"
              value={form.imageUrl}
              onChange={(e) => set("imageUrl", e.target.value)}
              placeholder="https://..."
              className="w-full input-field"
            />
          </div>
        </div>
      )}

      {/* Step 1: Pricing */}
      {step === 1 && (
        <div className="space-y-5 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#f1f5f9] font-medium">Reserve Price</p>
              <p className="text-[#475569] text-xs mt-0.5">Minimum bid required to win</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.reserveEnabled}
                onChange={(e) => set("reserveEnabled", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#2a2a3d] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500" />
            </label>
          </div>

          {form.reserveEnabled && (
            <div className="animate-fade-in">
              <label className="block text-sm font-medium text-[#94a3b8] mb-1.5">Reserve Amount (USDC)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569] text-sm">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.reserveAmount}
                  onChange={(e) => set("reserveAmount", e.target.value)}
                  placeholder="50.00"
                  className="w-full input-field pl-8"
                />
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div>
                  <p className="text-[#f1f5f9] text-sm">Show reserve to bidders</p>
                  <p className="text-[#475569] text-xs mt-0.5">If hidden, bidders won't know the minimum</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.reserveVisible}
                    onChange={(e) => set("reserveVisible", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#2a2a3d] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500" />
                </label>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Timing */}
      {step === 2 && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-[#94a3b8]">Bidding Window</label>
              <span className="text-[#f1f5f9] font-mono text-sm">{form.commitHours}h</span>
            </div>
            <input
              type="range"
              min={1}
              max={168}
              value={form.commitHours}
              onChange={(e) => set("commitHours", Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
            <div className="flex justify-between text-xs text-[#475569] mt-1">
              <span>1h</span>
              <span>1 week</span>
            </div>
            <input
              type="number"
              min={1}
              max={168}
              value={form.commitHours}
              onChange={(e) => set("commitHours", Math.max(1, Math.min(168, Number(e.target.value))))}
              className="input-field mt-2 w-32"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-[#94a3b8]">Reveal Window</label>
              <span className="text-[#f1f5f9] font-mono text-sm">{form.revealHours}h</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={72}
              step={0.5}
              value={form.revealHours}
              onChange={(e) => set("revealHours", Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
            <div className="flex justify-between text-xs text-[#475569] mt-1">
              <span>30m</span>
              <span>3 days</span>
            </div>
            <input
              type="number"
              min={0.5}
              max={72}
              step={0.5}
              value={form.revealHours}
              onChange={(e) => set("revealHours", Math.max(0.5, Math.min(72, Number(e.target.value))))}
              className="input-field mt-2 w-32"
            />
          </div>

          {/* Review */}
          <div className="bg-[#12121a] border border-[#2a2a3d] rounded-xl p-4 space-y-2 text-sm">
            <p className="text-[#94a3b8] font-medium mb-3">Review</p>
            <Row label="Title" value={form.title} />
            <Row label="Category" value={form.category} />
            <Row label="Reserve" value={form.reserveEnabled ? `${form.reserveAmount} USDC ${form.reserveVisible ? "(visible)" : "(hidden)"}` : "None"} />
            <Row label="Bidding window" value={`${form.commitHours} hours`} />
            <Row label="Reveal window" value={`${form.revealHours} hours`} />
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 mt-8">
        {step > 0 && (
          <Button variant="secondary" className="flex-1" onClick={() => setStep((s) => s - 1)}>
            <ChevronLeft size={16} />
            Back
          </Button>
        )}
        {step < 2 ? (
          <Button
            variant="gradient"
            className="flex-1"
            disabled={!canNext()}
            onClick={() => setStep((s) => s + 1)}
          >
            Next
            <ChevronRight size={16} />
          </Button>
        ) : (
          <Button
            variant="gradient"
            className="flex-1"
            loading={loading}
            onClick={handleSubmit}
          >
            Create Auction
          </Button>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-[#475569]">{label}</span>
      <span className="text-[#f1f5f9] font-medium">{value}</span>
    </div>
  );
}
