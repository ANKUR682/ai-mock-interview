import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sliders,
  Target,
  Mic,
  Volume2,
  VolumeX,
  Award,
  CheckCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { playQuestionSpeech, stopQuestionSpeech } from '../services/interviewService';

interface LandingHeroProps {
  onGetStarted: () => void;
}

interface SampleQuestion {
  id: number;
  question: string;
  category: string;
  difficulty: 'Mid-Level' | 'Senior' | 'Staff / Lead';
  idealAnswer: string;
  sampleAnswerSnippet: string;
}

const TOPICS = [
  'Frontend Development',
  'Backend & APIs',
  'System Architecture',
  'Behavioral & Leadership',
  'Data & Machine Learning',
  'Product Management',
] as const;

type TopicType = typeof TOPICS[number];

const SAMPLE_QUESTIONS_BY_TOPIC: Record<TopicType, SampleQuestion[]> = {
  'Frontend Development': [
    {
      id: 1,
      question: 'How do you optimize Core Web Vitals (LCP, INP, CLS) in a modern large-scale React application?',
      category: 'Performance & Architecture',
      difficulty: 'Senior',
      idealAnswer: 'Discuss route-based code-splitting, modern AVIF/WebP image pipelines, minimizing main thread blocking, and avoiding layout shifts with explicit aspect ratio boxes.',
      sampleAnswerSnippet: '"I prioritize critical path rendering by inlining critical CSS, deferring heavy 3rd-party scripts via web workers (Partytown), and scheduling non-urgent state updates with React 19 useTransition to ensure INP remains well under 200ms."',
    },
    {
      id: 2,
      question: 'Explain the internal reconciliation process in React 19 and how concurrent rendering handles high-priority updates.',
      category: 'Core Engineering',
      difficulty: 'Senior',
      idealAnswer: 'Highlight fiber architecture, cooperative scheduling, useTransition, lane-based priority levels, and how non-blocking state transitions maintain UI responsiveness.',
      sampleAnswerSnippet: '"React 19 segments updates into distinct priority lanes. Urgent interactions like typing get immediate execution, while data fetch transitions yield work to avoid freezing the main browser thread."',
    },
    {
      id: 3,
      question: 'How would you architect an accessible, reusable design system across multi-brand enterprise web applications?',
      category: 'Design Systems',
      difficulty: 'Staff / Lead',
      idealAnswer: 'Cover semantic HTML, WAI-ARIA tokens, headless UI primitives, composability, and automated accessibility testing.',
      sampleAnswerSnippet: '"I decouple design tokens (spacing, typography, color palettes) from headless primitive behaviors using Radix/Ariakit, wrapped in strict TypeScript component contracts validated with axe-core in CI."',
    },
  ],
  'Backend & APIs': [
    {
      id: 1,
      question: 'How do you guarantee idempotency in payment and order processing REST APIs during network timeouts?',
      category: 'Distributed Systems',
      difficulty: 'Senior',
      idealAnswer: 'Utilize idempotency keys, atomic database transactions, distributed locks (e.g. Redis), and consistent status replay responses.',
      sampleAnswerSnippet: '"When a request arrives with an Idempotency-Key header, we acquire a temporary Redis lock. If a matching completed transaction exists in Postgres, we replay the cached result without duplicate charges."',
    },
    {
      id: 2,
      question: 'What strategies do you use to detect and eliminate N+1 query bottlenecks in database ORM queries?',
      category: 'Database Optimization',
      difficulty: 'Mid-Level',
      idealAnswer: 'Explain query profiling, APM tracing, eager loading joins, and batch querying with IN clauses to prevent repetitive round-trips.',
      sampleAnswerSnippet: '"We combine APM tracing to spot repetitive round-trips with ORM eager loading like prefetch_related and enforce query count assertions inside automated integration test suites."',
    },
    {
      id: 3,
      question: 'How do you structure database schema migrations with zero downtime in high-throughput production environments?',
      category: 'Reliability & DevOps',
      difficulty: 'Senior',
      idealAnswer: 'Apply expand-and-contract patterns: add nullable columns, dual-write in application code, backfill data, then deprecate old fields.',
      sampleAnswerSnippet: '"We apply the expand-and-contract pattern across separate deployments: first adding the new column, deploying dual-writing application code, running backfill jobs, and lastly removing old columns."',
    },
  ],
  'System Architecture': [
    {
      id: 1,
      question: 'Design a distributed rate-limiting service capable of handling 500,000 requests per second across global regions.',
      category: 'High Scale Design',
      difficulty: 'Staff / Lead',
      idealAnswer: 'Compare Token Bucket and Sliding Window algorithms, discuss Redis clusters with local in-memory caches, and explain synchronization trade-offs.',
      sampleAnswerSnippet: '"I deploy localized sliding-window counters within edge proxies (Envoy) synchronized with a regional Redis cluster via Redis pipelines, failing open with circuit breakers during network partitions."',
    },
    {
      id: 2,
      question: 'How do you prevent a thundering herd problem when a shared high-traffic cache key expires simultaneously?',
      category: 'Resilience & Caching',
      difficulty: 'Senior',
      idealAnswer: 'Implement probabilistic early expiration (XFetch), mutex locking during cache refills, and pre-warming background refreshes.',
      sampleAnswerSnippet: '"We use early probabilistic cache expiration algorithm (XFetch) so a background worker recalculates the cache before true TTL expiration, alongside single-flight mutex locking at the gateway."',
    },
    {
      id: 3,
      question: 'Walk through your approach to breaking down a monolithic service into asynchronous event-driven microservices.',
      category: 'Microservices',
      difficulty: 'Senior',
      idealAnswer: 'Leverage the Strangler Fig pattern, domain-driven design bounded contexts, transactional outbox pattern, and Kafka event brokers.',
      sampleAnswerSnippet: '"Using domain-driven design, we identify high-value bounded contexts, implement the transactional outbox pattern to guarantee event consistency, and reroute ingress traffic via API Gateway routing."',
    },
  ],
  'Behavioral & Leadership': [
    {
      id: 1,
      question: 'Tell me about a time you strongly disagreed with an architectural decision made by a tech lead. How did you resolve it?',
      category: 'Collaboration & Diplomacy',
      difficulty: 'Senior',
      idealAnswer: 'Use the STAR method: present data-driven trade-offs objectively, listen actively to alternate constraints, and commit fully to the agreed path.',
      sampleAnswerSnippet: '"Situation: Our lead favored a complex custom event bus. Action: I built a rapid benchmark prototype showing memory leak risks and presented Kafka with objective metrics. Result: We adopted the standard tool and saved 3 weeks."',
    },
    {
      id: 2,
      question: 'Describe a major production outage you caused or triaged. How did you handle communication and prevent recurrence?',
      category: 'Ownership & Crisis',
      difficulty: 'Mid-Level',
      idealAnswer: 'Focus on radical ownership, rapid stakeholder status updates, blameless post-mortem analysis, and automated guardrail implementation.',
      sampleAnswerSnippet: '"When a bad migration locked a critical table, I immediately rolled back, posted status updates every 15 minutes, and published a blameless post-mortem adding migration dry-run checks in CI."',
    },
    {
      id: 3,
      question: 'How do you mentor junior or struggling engineers while still delivering on tight roadmap deadlines?',
      category: 'Team Leadership',
      difficulty: 'Senior',
      idealAnswer: 'Pair programming sessions, clear incremental milestones, psychological safety, and regular feedback cadence without micromanagement.',
      sampleAnswerSnippet: '"I schedule 30-minute bi-weekly pair programming blocks to unblock architectural questions, break tasks into incremental PRs, and celebrate small shipping milestones to build autonomy."',
    },
  ],
  'Data & Machine Learning': [
    {
      id: 1,
      question: 'How do you mitigate hallucinations and maintain low latency in production Retrieval-Augmented Generation (RAG) systems?',
      category: 'GenAI & Retrieval',
      difficulty: 'Senior',
      idealAnswer: 'Discuss hybrid dense/sparse search, re-ranking models, prompt grounding constraints, citation verification, and caching frequent queries.',
      sampleAnswerSnippet: '"We use hybrid vector and BM25 keyword search filtered with cross-encoder re-ranking, enforce strict system grounding instructions with citation thresholds, and cache common query embeddings via Redis."',
    },
    {
      id: 2,
      question: 'What are the key trade-offs between batch processing (e.g. Spark) and streaming ingestion (e.g. Flink) for analytics pipelines?',
      category: 'Data Engineering',
      difficulty: 'Mid-Level',
      idealAnswer: 'Analyze latency requirements, exactly-once processing guarantees, stateful windowing complexity, and operational compute costs.',
      sampleAnswerSnippet: '"Streaming provides sub-second visibility but introduces stateful checkpointing and out-of-order arrival complexity, whereas batch is drastically more cost-effective and easier to recompute idempotently."',
    },
  ],
  'Product Management': [
    {
      id: 1,
      question: 'How do you prioritize your quarterly feature roadmap when engineering, sales, and executive stakeholders have conflicting demands?',
      category: 'Strategy & Prioritization',
      difficulty: 'Senior',
      idealAnswer: 'Apply frameworks like RICE or Kano, anchor decisions in core North Star metrics and customer research, and clearly communicate trade-offs.',
      sampleAnswerSnippet: '"I anchor roadmap discussions around our quarterly North Star metric (retention vs expansion), score conflicting requests transparently via RICE, and communicate what we are intentionally deprioritizing."',
    },
    {
      id: 2,
      question: 'An A/B experiment shows a 4% increase in user sign-ups but a 2% drop in 30-day retention. How do you decide whether to ship?',
      category: 'Experimentation & Metrics',
      difficulty: 'Senior',
      idealAnswer: 'Evaluate cohort lifetime value, segment analysis to identify churn drivers, user friction signals, and long-term business health over short-term spikes.',
      sampleAnswerSnippet: '"A short-term sign-up bump that erodes retention usually signals misaligned user expectations or dark UX patterns. I would pause rollout, run cohort retention analysis, and prioritize long-term LTV."',
    },
  ],
};

const AUTO_ROTATE_INTERVAL_MS = 6000;

export const LandingHero: React.FC<LandingHeroProps> = ({ onGetStarted }) => {
  const { user, signInWithGoogle } = useAuth();
  const [selectedTopic, setSelectedTopic] = useState<TopicType>('Frontend Development');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showModelSnippet, setShowModelSnippet] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);

  const questionsList = SAMPLE_QUESTIONS_BY_TOPIC[selectedTopic] || [];
  const currentQ = questionsList[currentQuestionIndex] || questionsList[0];

  // Rolling timer with animated progress bar
  useEffect(() => {
    if (isPaused || isPlayingAudio) return;

    setProgressPercent(0);
    const stepTime = 100;
    const totalSteps = AUTO_ROTATE_INTERVAL_MS / stepTime;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      setProgressPercent((currentStep / totalSteps) * 100);

      if (currentStep >= totalSteps) {
        setCurrentQuestionIndex((prev) => (prev + 1) % questionsList.length);
        setShowModelSnippet(false);
        currentStep = 0;
        setProgressPercent(0);
      }
    }, stepTime);

    return () => clearInterval(interval);
  }, [questionsList.length, selectedTopic, isPaused, isPlayingAudio, currentQuestionIndex]);

  const handleTopicChange = (topic: TopicType) => {
    stopQuestionSpeech();
    setIsPlayingAudio(false);
    setSelectedTopic(topic);
    setCurrentQuestionIndex(0);
    setShowModelSnippet(false);
    setProgressPercent(0);
  };

  const handleNextQuestion = () => {
    stopQuestionSpeech();
    setIsPlayingAudio(false);
    setCurrentQuestionIndex((prev) => (prev + 1) % questionsList.length);
    setShowModelSnippet(false);
    setProgressPercent(0);
  };

  const handlePrevQuestion = () => {
    stopQuestionSpeech();
    setIsPlayingAudio(false);
    setCurrentQuestionIndex((prev) =>
      prev === 0 ? questionsList.length - 1 : prev - 1
    );
    setShowModelSnippet(false);
    setProgressPercent(0);
  };

  const handleAudioPlayback = async () => {
    if (isPlayingAudio) {
      stopQuestionSpeech();
      setIsPlayingAudio(false);
      return;
    }

    if (!currentQ) return;
    setIsPlayingAudio(true);
    await playQuestionSpeech(
      currentQ.question,
      () => setIsPlayingAudio(true),
      () => setIsPlayingAudio(false)
    );
  };

  const handleStartClick = () => {
    if (user) {
      onGetStarted();
    } else {
      signInWithGoogle().then(() => {
        onGetStarted();
      }).catch((err) => {
        console.error('Sign in error:', err);
      });
    }
  };

  return (
    <div className="relative bg-white pt-12 pb-24 text-slate-900 overflow-hidden">
      {/* Soft warm rose ambient backdrop glow */}
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.3, 0.45, 0.3],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-[500px] w-full max-w-4xl -translate-x-1/2 rounded-full bg-gradient-to-tr from-rose-500/10 via-red-500/5 to-transparent blur-3xl"
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Editorial Modern Hero Header */}
        <div className="mx-auto max-w-3xl text-center">
          {/* Live Indicator Pill */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-rose-200/80 bg-rose-50/70 px-4 py-1 text-xs font-bold text-rose-700 shadow-2xs backdrop-blur-md"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
            </span>
            <span>AI Interview Practice Engine Online</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl sm:leading-[1.12] font-['Outfit']"
          >
            Are you prepared? <br />
            <span className="bg-gradient-to-r from-rose-700 via-red-600 to-rose-600 bg-clip-text text-transparent">
              Let's take an interview.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-base sm:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed font-normal"
          >
            Practice role-tailored questions with live voice speech-to-text,
            hear questions spoken out loud, and get detailed AI feedback.
          </motion.p>

          {/* Simple Clean CTA Button with Micro-Interaction */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex justify-center"
          >
            <button
              onClick={handleStartClick}
              className="group relative inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 px-8 py-3.5 text-base font-bold text-white shadow-xl shadow-rose-600/20 transition-all duration-200 hover:from-rose-500 hover:to-red-500 hover:shadow-rose-600/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 font-['Outfit']"
            >
              <span>Start Interview</span>
              <ArrowRight className="h-4 w-4 stroke-[3] transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </motion.div>
        </div>

        {/* SECTION 1: Rolling Sample Questions with Topics on Top */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="mt-20"
        >
          <div className="text-center mb-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-rose-600 font-['Outfit']">
              Sample Questions
            </h2>
            <p className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl font-['Outfit']">
              Explore questions asked in actual interviews
            </p>
          </div>

          {/* Topic Selector Tabs on Top with Smooth Transition */}
          <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {TOPICS.map((topic) => (
              <button
                key={topic}
                onClick={() => handleTopicChange(topic)}
                className={`relative whitespace-nowrap rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all duration-200 font-['Outfit'] ${
                  selectedTopic === topic
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                    : 'border border-slate-200/90 bg-white text-slate-700 hover:border-rose-300 hover:text-rose-700 shadow-2xs'
                }`}
              >
                {topic}
              </button>
            ))}
          </div>

          {/* Interactive Rolling Question Display Card */}
          {currentQ && (
            <div
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              className="mt-6 mx-auto max-w-3xl rounded-2xl border border-slate-200/90 bg-white shadow-xl shadow-slate-200/30 transition-all duration-200 hover:border-rose-200/80 overflow-hidden"
            >
              {/* Rolling Progress Bar indicator on top */}
              <div className="h-1.5 w-full bg-slate-100">
                <div
                  className="h-full bg-gradient-to-r from-rose-600 to-red-500 transition-all duration-100 ease-linear"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="p-6 sm:p-8">
                {/* Header row with badges and audio listener */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 border border-rose-200/70">
                      {currentQ.category}
                    </span>
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                      {currentQ.difficulty}
                    </span>
                    <span className="hidden sm:inline text-xs text-slate-400">
                      &bull; Question {currentQuestionIndex + 1} of {questionsList.length}
                    </span>
                  </div>

                  {/* Actions: Audio Listen & Next/Prev Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleAudioPlayback}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition active:scale-95 ${
                        isPlayingAudio
                          ? 'bg-rose-600 text-white shadow-sm animate-pulse'
                          : 'border border-rose-200 bg-rose-50/70 text-rose-700 hover:bg-rose-100'
                      }`}
                      title="Listen question aloud"
                    >
                      {isPlayingAudio ? (
                        <>
                          <VolumeX className="h-3.5 w-3.5" />
                          <span className="text-[11px]">Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="h-3.5 w-3.5 text-rose-600" />
                          <span className="text-[11px]">Listen</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
                      <button
                        onClick={handlePrevQuestion}
                        className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 transition active:scale-90"
                        title="Previous question"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={handleNextQuestion}
                        className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 transition active:scale-90"
                        title="Next question"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Animated Question Content Swapping */}
                <div className="py-6 min-h-[110px] flex items-center">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={`${selectedTopic}-${currentQ.id}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.3 }}
                      className="text-lg sm:text-xl font-bold text-slate-900 leading-relaxed font-['Outfit']"
                    >
                      "{currentQ.question}"
                    </motion.p>
                  </AnimatePresence>
                </div>

                {/* Evaluation Rubric / Key points */}
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 text-xs sm:text-sm text-slate-700">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 font-bold text-rose-700 font-['Outfit']">
                      <CheckCircle className="h-4 w-4 shrink-0 text-rose-600" />
                      <span>Key Competencies Tested:</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowModelSnippet(!showModelSnippet)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 hover:text-rose-800 transition"
                    >
                      {showModelSnippet ? (
                        <>
                          <EyeOff className="h-3 w-3" />
                          <span>Hide Sample Answer</span>
                        </>
                      ) : (
                        <>
                          <Eye className="h-3 w-3" />
                          <span>Peek Sample Answer</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="mt-1.5 text-slate-600 leading-relaxed font-normal">
                    {currentQ.idealAnswer}
                  </p>

                  {/* Peek Sample Snippet */}
                  <AnimatePresence>
                    {showModelSnippet && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="mt-3 border-t border-rose-200/80 pt-3 text-xs text-rose-950 font-mono italic bg-rose-50/60 p-3 rounded-lg border border-rose-200/80 shadow-2xs"
                      >
                        {currentQ.sampleAnswerSnippet}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Rolling Navigation Dots with Pause Notice */}
                <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{isPaused ? 'Paused on hover' : 'Auto-rolling questions'}</span>
                  <div className="flex items-center gap-1.5">
                    {questionsList.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setCurrentQuestionIndex(idx);
                          setProgressPercent(0);
                        }}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          idx === currentQuestionIndex
                            ? 'w-6 bg-rose-600'
                            : 'w-1.5 bg-slate-200 hover:bg-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* SECTION 2: Website Features with Smooth Hover & Micro-Animations */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="mt-24"
        >
          <div className="text-center mb-10">
            <h2 className="text-xs font-bold uppercase tracking-widest text-rose-600 font-['Outfit']">
              Platform Features
            </h2>
            <p className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl font-['Outfit']">
              Built for <span className="bg-gradient-to-r from-rose-700 via-red-600 to-rose-600 bg-clip-text text-transparent">thorough, practical</span> interview preparation
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="group rounded-2xl border border-slate-200/80 bg-white p-6 transition-all duration-200 hover:border-rose-300 hover:shadow-xl hover:shadow-rose-500/5 shadow-xs"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-100 mb-4 transition-transform group-hover:scale-110">
                <Sliders className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-rose-700 transition-colors font-['Outfit']">Topic-Specified Questions</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Provide your target role, job description, and years of experience to generate questions customized to your background.
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                <span className="rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-100">Frontend</span>
                <span className="rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-100">Backend</span>
                <span className="rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-100">DevOps</span>
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="group rounded-2xl border border-slate-200/80 bg-white p-6 transition-all duration-200 hover:border-rose-300 hover:shadow-xl hover:shadow-rose-500/5 shadow-xs"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-100 mb-4 transition-transform group-hover:scale-110">
                <Target className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-rose-700 transition-colors font-['Outfit']">Best Curated Questions</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Experience a balanced combination of in-depth technical problems, system design scenarios, and STAR behavioral cases.
              </p>
              <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-rose-700">
                <span>Technical</span> &bull; <span>Behavioral</span> &bull; <span>Situational</span>
              </div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="group rounded-2xl border border-slate-200/80 bg-white p-6 transition-all duration-200 hover:border-rose-300 hover:shadow-xl hover:shadow-rose-500/5 shadow-xs"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-100 mb-4 transition-transform group-hover:scale-110">
                <Mic className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-rose-700 transition-colors font-['Outfit']">Voice Speech-to-Text</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Practice speaking your answers aloud. The built-in speech recognition transcribes your spoken words in real time.
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
                <span className="flex h-1.5 w-1.5 rounded-full bg-rose-600 animate-pulse" />
                <span>Web Speech API integration</span>
              </div>
            </motion.div>

            {/* Feature 4 */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="group rounded-2xl border border-slate-200/80 bg-white p-6 transition-all duration-200 hover:border-rose-300 hover:shadow-xl hover:shadow-rose-500/5 shadow-xs"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-100 mb-4 transition-transform group-hover:scale-110">
                <Volume2 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-rose-700 transition-colors font-['Outfit']">Spoken AI Questions</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Listen to the interviewer read questions aloud to simulate a real conversation and test your listening comprehension.
              </p>
              <div className="mt-4 flex items-center gap-1 text-[10px] font-bold text-rose-700">
                <span>Studio Audio Voice Readout</span>
              </div>
            </motion.div>

            {/* Feature 5 */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="group rounded-2xl border border-slate-200/80 bg-white p-6 transition-all duration-200 hover:border-rose-300 hover:shadow-xl hover:shadow-rose-500/5 shadow-xs"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-100 mb-4 transition-transform group-hover:scale-110">
                <Award className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-rose-700 transition-colors font-['Outfit']">Detailed Scoring & Feedback</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Receive an overall score from 1 to 100, identified strengths, and specific suggestions to improve clarity and structure.
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold text-rose-700">
                <span>Rubric Score (1-100)</span> &bull; <span>STAR Framework</span>
              </div>
            </motion.div>

            {/* Feature 6 */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="group rounded-2xl border border-slate-200/80 bg-white p-6 transition-all duration-200 hover:border-rose-300 hover:shadow-xl hover:shadow-rose-500/5 shadow-xs"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-100 mb-4 transition-transform group-hover:scale-110">
                <CheckCircle className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-rose-700 transition-colors font-['Outfit']">Model Sample Answers</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Compare your responses against benchmark model answers that follow industry standards and the STAR methodology.
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                <span>Production Benchmark Responses</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
