import { useEffect } from "react";
import { X } from "lucide-react";

export function Modal({ open, onClose, title, children, maxWidth = "max-w-lg" }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    if (open) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={`relative w-full ${maxWidth} bg-[#12121a] border border-[#2a2a3d] rounded-t-2xl sm:rounded-2xl shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#2a2a3d] sticky top-0 bg-[#12121a] z-10">
          <h2 id="modal-title" className="text-lg font-semibold text-[#f1f5f9]">
            {title}
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#475569] hover:text-[#f1f5f9] hover:bg-white/5 transition-colors"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
