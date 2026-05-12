import { Check } from "lucide-react";

export function StepIndicator({ steps, currentStep }) {
  return (
    <div className="flex items-center gap-0" role="progressbar" aria-valuenow={currentStep + 1} aria-valuemin={1} aria-valuemax={steps.length}>
      {steps.map((step, index) => {
        const done = index < currentStep;
        const active = index === currentStep;
        return (
          <div key={index} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                  done
                    ? "bg-emerald-500 text-white"
                    : active
                    ? "bg-indigo-500 text-white ring-2 ring-indigo-500/30 ring-offset-2 ring-offset-[#0a0a0f]"
                    : "bg-[#2a2a3d] text-[#475569]"
                }`}
                aria-label={`Step ${index + 1}: ${step}${done ? " (completed)" : active ? " (current)" : ""}`}
              >
                {done ? <Check size={14} /> : <span>{index + 1}</span>}
              </div>
              <span
                className={`text-xs mt-1.5 whitespace-nowrap ${
                  active ? "text-[#f1f5f9]" : done ? "text-emerald-400" : "text-[#475569]"
                }`}
              >
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`h-px w-12 sm:w-20 mb-4 mx-1 transition-all ${
                  done ? "bg-emerald-500/50" : "bg-[#2a2a3d]"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
