import React from 'react';
import { X, Mic, Brain, Award, Shield, FileText, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FeaturesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartInterview: () => void;
}

export const FeaturesModal: React.FC<FeaturesModalProps> = ({
  isOpen,
  onClose,
  onStartInterview,
}) => {
  if (!isOpen) return null;

  const features = [
    {
      icon: Brain,
      title: 'Context-Calibrated Questions',
      description:
        'Generate 5 deeply technical and behavioral questions calibrated to your exact target role, experience level, and stack using Gemini API.',
    },
    {
      icon: Mic,
      title: 'Native Speech-to-Text Voice Input',
      description:
        'Practice speaking naturally under pressure with Web Speech API integration that transcribes your spoken answers live.',
    },
    {
      icon: Award,
      title: 'Rubric Scoring (1-100)',
      description:
        'Receive quantitative scores, breakdown of technical accuracy, communication clarity, and situational depth.',
    },
    {
      icon: FileText,
      title: 'STAR Method Architecture',
      description:
        'Master the Situation, Task, Action, Result framework with live guidance and structured benchmark answers.',
    },
    {
      icon: Shield,
      title: 'Persistent Cloud History',
      description:
        'Track your performance growth over time with automatically saved interview sessions and detailed reports in Firestore.',
    },
  ];

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
          className="relative w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-900/95 p-6 sm:p-8 shadow-2xl z-10 text-left overflow-hidden"
        >
          {/* Subtle top glare edge */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-zinc-400/20 to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="mb-6">
            <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-400">
              Platform Architecture
            </span>
            <h2 className="text-xl font-bold text-zinc-100 tracking-tight mt-1">
              Engineering Features Built for High-Stakes Tech Rounds
            </h2>
            <p className="mt-1 text-xs text-zinc-400">
              Designed from first principles to simulate actual engineering hiring loops.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-950/50 space-y-1.5"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-indigo-400 shrink-0" />
                    <h3 className="text-xs font-semibold text-zinc-200">{feat.title}</h3>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-5 border-t border-zinc-800 flex items-center justify-between">
            <span className="text-xs text-zinc-500">
              No installation or credit card required.
            </span>
            <button
              onClick={() => {
                onClose();
                onStartInterview();
              }}
              className="px-4 py-2 rounded-lg bg-zinc-100 text-zinc-950 font-medium text-xs hover:bg-white transition cursor-pointer"
            >
              Start Practice Session
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
