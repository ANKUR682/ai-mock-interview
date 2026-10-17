import React from 'react';
import { X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartInterview: () => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  onStartInterview,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          className="relative w-full max-w-xl rounded-2xl border border-zinc-800 bg-zinc-900/95 p-6 sm:p-8 shadow-2xl z-10 text-left overflow-hidden"
        >
          {/* Subtle top glare edge */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-zinc-400/20 to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="mb-6">
            <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-400">
              Pricing & Access
            </span>
            <h2 className="text-xl font-bold text-zinc-100 tracking-tight mt-1">
              Transparent, Developer-Friendly Plans
            </h2>
            <p className="mt-1 text-xs text-zinc-400">
              Practice for your dream engineering role without paywalls.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Free Tier */}
            <div className="p-5 rounded-xl border border-zinc-700 bg-zinc-950/60 relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-zinc-200">Developer Starter</span>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                  Current Tier
                </span>
              </div>
              <div className="mt-2 mb-4">
                <span className="text-2xl font-bold font-mono text-zinc-100">$0</span>
                <span className="text-xs text-zinc-500"> / forever</span>
              </div>
              <ul className="space-y-2 text-xs text-zinc-400">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-zinc-300 shrink-0" />
                  <span>Unlimited mock rounds</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-zinc-300 shrink-0" />
                  <span>Gemini calibrated questions</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-zinc-300 shrink-0" />
                  <span>Web Speech API transcription</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-zinc-300 shrink-0" />
                  <span>Firestore session reports</span>
                </li>
              </ul>
              <button
                onClick={() => {
                  onClose();
                  onStartInterview();
                }}
                className="mt-5 w-full py-2 rounded-lg bg-zinc-100 text-zinc-950 font-medium text-xs hover:bg-white transition cursor-pointer"
              >
                Practice Now
              </button>
            </div>

            {/* Pro Candidate */}
            <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-950/30 relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-zinc-300">Staff Pro</span>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Coming Soon
                </span>
              </div>
              <div className="mt-2 mb-4">
                <span className="text-2xl font-bold font-mono text-zinc-300">$19</span>
                <span className="text-xs text-zinc-500"> / month</span>
              </div>
              <ul className="space-y-2 text-xs text-zinc-400">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                  <span>Everything in Starter</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                  <span>Company-specific rubrics (FAANG)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                  <span>Resume PDF auto-alignment</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                  <span>Priority latency queue</span>
                </li>
              </ul>
              <button
                disabled
                className="mt-5 w-full py-2 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-500 font-medium text-xs cursor-not-allowed"
              >
                Included in Preview
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
