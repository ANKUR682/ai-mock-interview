import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Volume2, CheckCircle2, Sparkles, Play, Pause, ChevronRight } from 'lucide-react';

interface InteractiveDemoSnippetProps {
  onStartFullInterview: () => void;
}

export const InteractiveDemoSnippet: React.FC<InteractiveDemoSnippetProps> = ({
  onStartFullInterview,
}) => {
  const [activeTab, setActiveTab] = useState<'transcription' | 'evaluation' | 'rubric'>('transcription');
  const [demoText, setDemoText] = useState(
    'We implemented a Token Bucket algorithm backed by Redis with atomic Lua scripts, handling up to 50,000 requests per second with sub-millisecond overhead.'
  );
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const toggleAudio = () => {
    if (isPlayingAudio) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingAudio(false);
      return;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(
        'How would you architect a distributed rate limiter to protect public microservices under high burst traffic?'
      );
      utterance.rate = 1.0;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      setIsPlayingAudio(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="relative rounded-2xl border border-zinc-800/80 bg-zinc-900/50 backdrop-blur-xl p-5 sm:p-6 shadow-2xl overflow-hidden text-left">
      {/* Subtle top glare edge */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-zinc-500/20 to-transparent" />

      {/* Demo Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-zinc-800/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
              Interactive Preview
            </span>
            <span className="text-zinc-600">·</span>
            <span className="text-[11px] text-zinc-400">Live Simulation Sandbox</span>
          </div>
          <p className="mt-1 text-sm font-medium text-zinc-200">
            "How would you architect a distributed rate limiter under high burst traffic?"
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={toggleAudio}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
              isPlayingAudio
                ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-300'
                : 'border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            {isPlayingAudio ? (
              <>
                <Pause className="h-3 w-3 text-indigo-400" />
                <span>Pause Question</span>
              </>
            ) : (
              <>
                <Volume2 className="h-3 w-3 text-zinc-400" />
                <span>Play Voice</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 my-3 bg-zinc-950/60 p-1 rounded-lg border border-zinc-800/60 w-fit">
        <button
          onClick={() => setActiveTab('transcription')}
          className={`px-3 py-1 text-xs font-medium rounded-md transition cursor-pointer ${
            activeTab === 'transcription'
              ? 'bg-zinc-800 text-zinc-100 shadow-xs'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Voice & Response
        </button>
        <button
          onClick={() => setActiveTab('evaluation')}
          className={`px-3 py-1 text-xs font-medium rounded-md transition cursor-pointer ${
            activeTab === 'evaluation'
              ? 'bg-zinc-800 text-zinc-100 shadow-xs'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          AI Rubric Feedback
        </button>
        <button
          onClick={() => setActiveTab('rubric')}
          className={`px-3 py-1 text-xs font-medium rounded-md transition cursor-pointer ${
            activeTab === 'rubric'
              ? 'bg-zinc-800 text-zinc-100 shadow-xs'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Model Benchmark
        </button>
      </div>

      {/* Tab Contents */}
      <div className="min-h-[140px]">
        {activeTab === 'transcription' && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Mic className="h-3.5 w-3.5 text-indigo-400" />
                <span>Live Response Input</span>
              </span>
              <span className="font-mono text-[11px] text-zinc-500">
                {demoText.split(' ').filter(Boolean).length} words
              </span>
            </div>
            <textarea
              value={demoText}
              onChange={(e) => setDemoText(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 text-xs text-zinc-200 placeholder-zinc-500 focus:border-zinc-600 focus:outline-none transition leading-relaxed resize-none"
            />
          </div>
        )}

        {activeTab === 'evaluation' && (
          <div className="space-y-3 rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-zinc-300 font-medium">Evaluation Score</span>
              <span className="font-mono font-bold text-zinc-100 bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-700/60">
                92 / 100
              </span>
            </div>
            <p className="text-zinc-400 leading-relaxed">
              <strong className="text-zinc-200 font-medium">Technical Depth:</strong> Excellent choice of the Token Bucket algorithm with Redis Lua scripts. You correctly addressed race conditions and distributed state.
            </p>
            <p className="text-zinc-400 leading-relaxed">
              <strong className="text-zinc-200 font-medium">Suggestion:</strong> Discuss fallback degradation if the Redis cluster becomes partitioned (e.g. local in-memory leaky bucket fallback).
            </p>
          </div>
        )}

        {activeTab === 'rubric' && (
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3.5 text-xs space-y-2">
            <div className="flex items-center gap-1.5 text-indigo-400 font-medium">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Staff Engineer Benchmark Answer</span>
            </div>
            <p className="text-zinc-300 leading-relaxed">
              "I would deploy an Envoy or Kong API gateway layer implementing sliding window counters in a Redis cluster. For resilience, we add local cache-fallback with circuit breakers so a partition doesn't take down routing."
            </p>
          </div>
        )}
      </div>

      {/* Demo Footer CTA */}
      <div className="mt-4 pt-3.5 border-t border-zinc-800/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-xs text-zinc-400">
          Ready for real questions calibrated to your specific role & stack?
        </p>

        <button
          onClick={onStartFullInterview}
          className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-100 px-3.5 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-white transition cursor-pointer shadow-xs active:scale-95"
        >
          <span>Start Full Interview</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
