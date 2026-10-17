import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Clock,
  HelpCircle,
  AlertCircle,
  Loader2,
  XCircle,
  Lightbulb,
  CheckCircle2,
  Bookmark,
  Layers,
} from 'lucide-react';
import { InterviewSession, Answer, EvaluationReport, QuestionSection } from '../types/interview';
import {
  playQuestionSpeech,
  stopQuestionSpeech,
  apiEvaluateInterview,
  updateFirestoreInterview,
} from '../services/interviewService';

interface InterviewRoomProps {
  session: InterviewSession;
  onFinish: (completedSession: InterviewSession) => void;
  onExit: () => void;
}

export const InterviewRoom: React.FC<InterviewRoomProps> = ({
  session,
  onFinish,
  onExit,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [selectedOptions, setSelectedOptions] = useState<Record<number, string>>({});
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [evaluatingStep, setEvaluatingStep] = useState('');
  const [questionTimeElapsed, setQuestionTimeElapsed] = useState(0);
  const [totalTimeElapsed, setTotalTimeElapsed] = useState(0);
  const [showSTARGuide, setShowSTARGuide] = useState(false);

  const recognitionRef = useRef<any>(null);
  const currentQuestion = session.questions[currentIndex] || session.questions[0];
  const currentAnswer = answers[currentQuestion?.id] || '';

  // Timer tracking
  useEffect(() => {
    const timer = setInterval(() => {
      setQuestionTimeElapsed((prev) => prev + 1);
      setTotalTimeElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  // Reset question timer on step change
  useEffect(() => {
    setQuestionTimeElapsed(0);
    stopAudio();
    stopListening();
  }, [currentIndex]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopQuestionSpeech();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Audio Question Readout
  const handleTogglePlayAudio = async () => {
    if (isPlayingAudio) {
      stopAudio();
      return;
    }

    if (!currentQuestion) return;
    setIsPlayingAudio(true);
    await playQuestionSpeech(
      currentQuestion.question,
      () => setIsPlayingAudio(true),
      () => setIsPlayingAudio(false)
    );
  };

  const stopAudio = () => {
    stopQuestionSpeech();
    setIsPlayingAudio(false);
  };

  // Web Speech API - Speech-to-Text Recognition
  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
      return;
    }
    startListening();
  };

  const startListening = () => {
    setSpeechError(null);
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError(
        'Speech recognition is not supported in this browser. Please use Google Chrome or type your answer directly.'
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          setAnswers((prev) => {
            const existing = prev[currentQuestion.id] || '';
            const separator = existing.trim().length > 0 ? ' ' : '';
            return {
              ...prev,
              [currentQuestion.id]: existing + separator + finalTranscript.trim(),
            };
          });
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setSpeechError('Microphone permission was denied. Please allow microphone access in your browser settings.');
        } else if (event.error !== 'no-speech') {
          setSpeechError(`Speech recognition notice: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      setSpeechError('Failed to access microphone. Please type your response.');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const handleAnswerChange = (val: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: val,
    }));
  };

  const handleSelectOption = (option: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [currentQuestion.id]: option,
    }));
    // Also save option to answer text
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: option,
    }));
  };

  const handleNext = () => {
    stopAudio();
    stopListening();
    if (currentIndex < session.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    stopAudio();
    stopListening();
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Submit and evaluate completed interview with Zero Tolerance logic
  const handleFinalSubmit = async () => {
    stopAudio();
    stopListening();

    const formattedAnswers: Answer[] = session.questions.map((q) => {
      const ansVal = answers[q.id]?.trim() || selectedOptions[q.id] || '';
      return {
        questionId: q.id,
        questionText: q.question,
        category: q.category,
        section: q.section,
        selectedOption: selectedOptions[q.id],
        userAnswer: ansVal || '(No answer provided)',
      };
    });

    setIsSubmittingReport(true);
    setEvaluatingStep('Auditing answers with Zero-Tolerance scoring engine...');

    try {
      setEvaluatingStep('Scoring MCQs, technical precision, and CV project depth...');
      const evaluation: EvaluationReport = await apiEvaluateInterview({
        jobTitle: session.jobTitle,
        jobDescription: session.jobDescription,
        yearsOfExperience: session.yearsOfExperience,
        questions: session.questions,
        answers: formattedAnswers,
        resumeProfile: session.resumeProfile,
      });

      setEvaluatingStep('Persisting complete evaluation report to Firestore...');
      const updatedSession: InterviewSession = {
        ...session,
        status: 'completed',
        answers: formattedAnswers,
        evaluation,
        updatedAt: new Date().toISOString(),
      };

      await updateFirestoreInterview(session.id, {
        status: 'completed',
        answers: formattedAnswers,
        evaluation,
      });

      onFinish(updatedSession);
    } catch (err: any) {
      console.error('Evaluation failure:', err);
      alert('Could not complete evaluation: ' + (err.message || 'Server error'));
      setIsSubmittingReport(false);
    }
  };

  const progressPercent = Math.round(
    ((currentIndex + 1) / session.questions.length) * 100
  );

  const isLastQuestion = currentIndex === session.questions.length - 1;
  const answeredCount = session.questions.filter(
    (q) => (answers[q.id]?.trim() || selectedOptions[q.id])
  ).length;

  // Group sections info
  const isMCQ = currentQuestion.section === 'mcq' || (currentQuestion.options && currentQuestion.options.length > 0);
  const isShort = currentQuestion.section === 'short_answer';
  const isElaborate = currentQuestion.section === 'elaborate';

  const currentSectionNumber = isMCQ ? 1 : isShort ? 2 : 3;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 bg-white text-slate-900">
      {/* 3-Section Sequential Progress Bar Badges */}
      <div className="grid grid-cols-3 gap-2 pb-4 border-b border-slate-100">
        <div
          className={`rounded-xl p-2.5 text-center border transition-all ${
            currentSectionNumber === 1
              ? 'border-rose-600 bg-rose-50/80 text-rose-800 font-bold shadow-xs'
              : currentSectionNumber > 1
              ? 'border-emerald-200 bg-emerald-50/60 text-emerald-700'
              : 'border-slate-200 bg-slate-50 text-slate-400'
          }`}
        >
          <div className="flex items-center justify-center gap-1 text-[11px] font-black uppercase tracking-wider font-['Outfit']">
            <span>Part 1: MCQs</span>
            {currentSectionNumber > 1 && <CheckCircle2 className="h-3 w-3 text-emerald-600" />}
          </div>
          <div className="text-[10px] hidden sm:block">Core Fundamentals (5 Qs)</div>
        </div>

        <div
          className={`rounded-xl p-2.5 text-center border transition-all ${
            currentSectionNumber === 2
              ? 'border-rose-600 bg-rose-50/80 text-rose-800 font-bold shadow-xs'
              : currentSectionNumber > 2
              ? 'border-emerald-200 bg-emerald-50/60 text-emerald-700'
              : 'border-slate-200 bg-slate-50 text-slate-400'
          }`}
        >
          <div className="flex items-center justify-center gap-1 text-[11px] font-black uppercase tracking-wider font-['Outfit']">
            <span>Part 2: Short Answer</span>
            {currentSectionNumber > 2 && <CheckCircle2 className="h-3 w-3 text-emerald-600" />}
          </div>
          <div className="text-[10px] hidden sm:block">Technical & Situational</div>
        </div>

        <div
          className={`rounded-xl p-2.5 text-center border transition-all ${
            currentSectionNumber === 3
              ? 'border-rose-600 bg-rose-50/80 text-rose-800 font-bold shadow-xs'
              : 'border-slate-200 bg-slate-50 text-slate-400'
          }`}
        >
          <div className="flex items-center justify-center gap-1 text-[11px] font-black uppercase tracking-wider font-['Outfit']">
            <span>Part 3: Deep-Dive</span>
          </div>
          <div className="text-[10px] hidden sm:block">CV Projects & Architecture</div>
        </div>
      </div>

      {/* Top Header & Progress */}
      <div className="mt-4 flex flex-col gap-4 pb-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700 font-['Outfit']">
              {currentQuestion.sectionTitle || `Section ${currentSectionNumber}`}
            </span>
            <span className="text-slate-300">&bull;</span>
            <span className="text-xs text-slate-700 font-bold">{session.jobTitle}</span>
          </div>
          <div className="mt-1 flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-['Outfit']">
              Question {currentIndex + 1} of {session.questions.length}
            </h1>
            <span className="rounded-lg bg-rose-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-rose-700 border border-rose-200/80">
              {currentQuestion.category}
            </span>
          </div>
        </div>

        {/* Timers & Exit */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs">
            <Clock className="h-3.5 w-3.5 text-rose-600" />
            <span>Q: {formatTimer(questionTimeElapsed)}</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500">Total: {formatTimer(totalTimeElapsed)}</span>
          </div>

          <button
            onClick={onExit}
            title="Exit Interview Room"
            className="rounded-xl border border-slate-200 p-2 text-slate-400 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 transition"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-slate-500 mb-1.5 font-medium">
          <span className="font-bold text-rose-700 font-['Outfit']">Overall Interview Progress ({progressPercent}%)</span>
          <span>{answeredCount} of {session.questions.length} answered</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full bg-gradient-to-r from-rose-600 to-red-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      <div className="mt-6 rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xl shadow-slate-200/30">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 font-['Outfit']">
                Interviewer Prompt
              </span>
              {isMCQ && (
                <span className="rounded-md bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5">
                  Single Choice MCQ
                </span>
              )}
            </div>

            <p className="mt-2 text-xl sm:text-2xl font-bold text-slate-900 leading-relaxed font-['Outfit']">
              "{currentQuestion.question}"
            </p>
          </div>

          {/* Speech Audio Button */}
          <button
            onClick={handleTogglePlayAudio}
            className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition active:scale-95 font-['Outfit'] ${
              isPlayingAudio
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 animate-pulse'
                : 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            {isPlayingAudio ? (
              <>
                <VolumeX className="h-4 w-4" />
                <span>Stop Voice</span>
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4 text-rose-600" />
                <span>Listen AI</span>
              </>
            )}
          </button>
        </div>

        {/* Section 3 Specific: CV Project Defense Context Callout */}
        {currentQuestion.cvReference && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50/70 p-3.5 text-xs text-rose-900 flex items-start gap-2.5">
            <Bookmark className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold font-['Outfit']">CV Project Context: </span>
              <span className="font-medium text-slate-700">{currentQuestion.cvReference}</span>
            </div>
          </div>
        )}

        {/* Ideal Focus & Context Hint */}
        {currentQuestion.idealAnswerFocus && (
          <div className="mt-4 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 text-xs text-slate-700">
            <div className="flex items-center gap-1.5 font-bold text-rose-700 font-['Outfit']">
              <Lightbulb className="h-3.5 w-3.5 text-rose-600" />
              <span>Interviewer Focus / Assessment Criteria:</span>
            </div>
            <p className="mt-1 text-slate-600 leading-relaxed font-normal">
              {currentQuestion.idealAnswerFocus}
            </p>
          </div>
        )}
      </div>

      {/* Answer Area - Interactive Multi-Format */}
      <div className="mt-6 rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
        {/* MCQ Mode */}
        {isMCQ && currentQuestion.options && currentQuestion.options.length > 0 ? (
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 font-['Outfit']">
                Select the Best Option (4 choices)
              </span>
              <span className="text-xs text-rose-600 font-bold">
                {selectedOptions[currentQuestion.id] ? 'Option Selected' : 'Selection Required'}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = selectedOptions[currentQuestion.id] === option;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(option)}
                    className={`flex items-start gap-3.5 rounded-xl border p-4 text-left transition-all ${
                      isSelected
                        ? 'border-rose-600 bg-rose-50/80 shadow-xs ring-2 ring-rose-500/20'
                        : 'border-slate-200 bg-white hover:border-rose-200 hover:bg-slate-50/60'
                    }`}
                  >
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-all ${
                        isSelected
                          ? 'border-rose-600 bg-rose-600 text-white'
                          : 'border-slate-300 text-slate-500 bg-white'
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${isSelected ? 'text-rose-950 font-bold' : 'text-slate-800'}`}>
                        {option}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Free Response Mode (Short-Answer & Deep-Dive) */
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900 font-['Outfit']">
                  Your Response {isShort ? '(Target: 2-4 sentences)' : '(Deep Technical Defense)'}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  ({currentAnswer.trim().split(/\s+/).filter(Boolean).length} words)
                </span>
              </div>

              {/* Voice Mic Controls & STAR Help */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSTARGuide(!showSTARGuide)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-rose-700"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  <span>STAR Guide</span>
                </button>

                <button
                  onClick={handleToggleListening}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition active:scale-95 font-['Outfit'] ${
                    isListening
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 animate-pulse'
                      : 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="h-3.5 w-3.5" />
                      <span>Stop Recording</span>
                    </>
                  ) : (
                    <>
                      <Mic className="h-3.5 w-3.5 text-rose-600" />
                      <span>Voice Input (Speech-to-Text)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* STAR Method Helper Accordion */}
            {showSTARGuide && (
              <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-slate-700">
                <div className="font-bold text-rose-800 mb-1 font-['Outfit']">Framework for Strong Answers (STAR):</div>
                <ul className="list-disc pl-4 space-y-1 text-slate-600 font-normal">
                  <li><strong className="text-slate-900">Situation:</strong> Set the context and background briefly.</li>
                  <li><strong className="text-slate-900">Task:</strong> What was your exact goal or technical problem?</li>
                  <li><strong className="text-slate-900">Action:</strong> Specific tools, architectural choices, and steps you took.</li>
                  <li><strong className="text-slate-900">Result:</strong> Quantifiable outcome, metrics, or lessons learned.</li>
                </ul>
              </div>
            )}

            {/* Speech Error Banner */}
            {speechError && (
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 font-medium">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{speechError}</span>
              </div>
            )}

            {/* Mic Active Live Status */}
            {isListening && (
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
                </span>
                <span>Microphone listening... Speak naturally, your answer will transcribe in real time.</span>
              </div>
            )}

            {/* Answer Textarea */}
            <textarea
              rows={isShort ? 4 : 7}
              value={currentAnswer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder={
                isShort
                  ? 'Provide a concise, direct technical answer (e.g., 2-4 sentences)...'
                  : 'Explain your architecture, project trade-offs, and technical solutions in detail...'
              }
              className="mt-3 w-full rounded-xl border border-slate-200 bg-white p-4 text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 resize-none leading-relaxed shadow-2xs"
            />

            {currentAnswer && (
              <div className="mt-2 flex justify-end">
                <button
                  onClick={() => handleAnswerChange('')}
                  className="text-xs font-bold text-slate-400 hover:text-rose-700"
                >
                  Clear Answer
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Evaluating Modal Overlay */}
      {isSubmittingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
            <h3 className="mt-4 text-2xl font-black text-slate-900 font-['Outfit']">Generating Evaluation Report</h3>
            <p className="mt-2 text-xs text-rose-700 font-bold">{evaluatingStep}</p>
            <p className="mt-3 text-xs text-slate-600 leading-relaxed font-normal">
              Zero-tolerance evaluation engine is strictly grading MCQs (100% or 0%), short answers, and deep-dive technical substance.
            </p>
          </div>
        </div>
      )}

      {/* Navigation Controls */}
      <div className="mt-8 flex items-center justify-between gap-4">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none shadow-2xs"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Previous Question</span>
        </button>

        {isLastQuestion ? (
          <button
            onClick={handleFinalSubmit}
            disabled={isSubmittingReport}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-rose-600/20 transition hover:from-rose-500 hover:to-red-500 active:scale-95 font-['Outfit']"
          >
            <CheckCircle className="h-4 w-4 stroke-[2.5]" />
            <span>Finish Interview & Generate AI Report</span>
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-rose-600/20 transition hover:from-rose-500 hover:to-red-500 active:scale-95 font-['Outfit']"
          >
            <span>Next Question</span>
            <ArrowRight className="h-4 w-4 stroke-[2.5]" />
          </button>
        )}
      </div>
    </div>
  );
};
