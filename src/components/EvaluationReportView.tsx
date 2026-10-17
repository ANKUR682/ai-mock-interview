import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  RotateCcw,
  Printer,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BookOpen,
  Calendar,
  Briefcase,
  Star,
  Layers,
  FileCode,
} from 'lucide-react';
import { InterviewSession } from '../types/interview';

interface EvaluationReportViewProps {
  session: InterviewSession;
  onBackToDashboard: () => void;
  onRetake: () => void;
}

export const EvaluationReportView: React.FC<EvaluationReportViewProps> = ({
  session,
  onBackToDashboard,
  onRetake,
}) => {
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  const evaluation = session.evaluation;
  if (!evaluation) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center bg-white">
        <p className="text-slate-500 font-medium">No evaluation report available for this session.</p>
        <button
          onClick={onBackToDashboard}
          className="mt-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 px-5 py-2 text-sm text-white font-bold font-['Outfit'] hover:from-rose-500 hover:to-red-500"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const overallScore = evaluation.overallScore;
  const isZeroScore = overallScore === 0;

  // Tier calculation
  let scoreTier = 'Interview Ready';
  let tierColor = 'text-rose-700 border-rose-200 bg-rose-50';

  if (isZeroScore) {
    scoreTier = 'Zero-Tolerance Audit: Non-Substantive';
    tierColor = 'text-red-700 border-red-300 bg-red-50';
  } else if (overallScore >= 85) {
    scoreTier = 'Elite Candidate';
    tierColor = 'text-rose-800 border-rose-300 bg-rose-50';
  } else if (overallScore >= 70) {
    scoreTier = 'Strong Candidate';
    tierColor = 'text-rose-700 border-rose-200 bg-rose-50';
  } else if (overallScore >= 55) {
    scoreTier = 'Developing Potential';
    tierColor = 'text-amber-700 border-amber-200 bg-amber-50';
  } else {
    scoreTier = 'Needs Targeted Preparation';
    tierColor = 'text-rose-700 border-rose-200 bg-rose-50';
  }

  const toggleExpand = (id: number) => {
    setExpandedQuestion(expandedQuestion === id ? null : id);
  };

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(session.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 bg-white text-slate-900">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <button
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs sm:text-sm font-bold text-slate-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition shadow-2xs"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 shadow-2xs"
          >
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Print / Save PDF</span>
          </button>
          <button
            onClick={onRetake}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 px-5 py-2 text-xs sm:text-sm font-bold text-white shadow-md shadow-rose-600/20 hover:from-rose-500 hover:to-red-500 active:scale-95 font-['Outfit']"
          >
            <RotateCcw className="h-4 w-4 stroke-[2.5]" />
            <span>Retake Interview</span>
          </button>
        </div>
      </div>

      {/* Main Score & Session Banner */}
      <div className="mt-6 rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xl shadow-slate-200/30">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className={`rounded-xl border px-3 py-1 text-xs font-black uppercase font-['Outfit'] ${tierColor}`}>
                {scoreTier}
              </span>
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-rose-600" />
                {formattedDate}
              </span>
              {session.resumeProfile?.fileName && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200/80 px-2.5 py-0.5 rounded-lg">
                  <FileCode className="h-3 w-3" />
                  <span>CV Evaluated</span>
                </span>
              )}
            </div>

            <h1 className="mt-3 text-3xl sm:text-4xl font-black text-slate-900 font-['Outfit']">
              {session.jobTitle}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-rose-600" />
              <span>Target Level: {session.yearsOfExperience || 'Mid-Senior'}</span>
            </p>
          </div>

          {/* Large Radial Score Gauge in Crimson */}
          <div className="flex items-center gap-4 rounded-2xl border border-rose-100 bg-rose-50/40 p-5 shrink-0">
            <div className={`relative flex h-24 w-24 items-center justify-center rounded-full border-4 bg-white shadow-xs ${isZeroScore ? 'border-red-400' : 'border-rose-200'}`}>
              <span className={`text-4xl font-black font-['Outfit'] ${isZeroScore ? 'text-red-600' : 'text-rose-700'}`}>
                {overallScore}
              </span>
              <span className="absolute bottom-2 text-[10px] font-bold text-slate-400 uppercase">
                / 100
              </span>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-rose-700 font-['Outfit']">Overall Score</div>
              <div className="text-base font-black text-slate-900 mt-0.5 font-['Outfit']">{scoreTier}</div>
              <div className="text-[11px] text-slate-500 mt-1">Strict Zero-Tolerance Grading</div>
            </div>
          </div>
        </div>

        {/* Section Scores Breakdown (MCQ, Short-Answer, Deep-Dive) */}
        {evaluation.sectionScores && evaluation.sectionScores.length > 0 && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {evaluation.sectionScores.map((sec, idx) => (
              <div key={idx} className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] font-['Outfit']">{sec.sectionTitle}</span>
                  <Layers className="h-3.5 w-3.5 text-rose-600" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-rose-700 font-['Outfit']">
                    {sec.score}%
                  </span>
                  {sec.correctCount !== undefined && (
                    <span className="text-xs text-slate-600 font-medium">
                      ({sec.correctCount}/{sec.totalQuestions} correct)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Executive Summary */}
        <div className="mt-6 rounded-xl border border-rose-200/80 bg-rose-50/50 p-5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-700 font-['Outfit']">
            <Sparkles className="h-4 w-4 text-rose-600" />
            <span>Executive Performance Summary</span>
          </div>
          <p className="mt-2 text-sm sm:text-base text-slate-800 leading-relaxed font-normal">
            {evaluation.summary}
          </p>
        </div>

        {/* Strengths & Improvement Grid */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Key Strengths */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-700 font-['Outfit']">
              <CheckCircle2 className="h-4 w-4 text-rose-600" />
              <span>Core Strengths Demonstrated</span>
            </div>
            <ul className="mt-3 space-y-2">
              {evaluation.strengths.map((str, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                  <span className="h-2 w-2 rounded-full bg-rose-600 mt-1.5 shrink-0" />
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Areas for Improvement */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-700 font-['Outfit']">
              <AlertTriangle className="h-4 w-4 text-rose-600" />
              <span>Actionable Growth Priorities</span>
            </div>
            <ul className="mt-3 space-y-2">
              {evaluation.areasForImprovement.map((area, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                  <span className="h-2 w-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Per Question Detailed Breakdown */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 font-['Outfit']">
            <BookOpen className="h-5 w-5 text-rose-600" />
            <span>Question-by-Question Evaluation Breakdown</span>
          </h2>
          <span className="text-xs text-slate-500">
            Click any question to view model sample answer & analysis
          </span>
        </div>

        <div className="space-y-4">
          {session.questions.map((q, idx) => {
            const fb = evaluation.questionFeedbacks?.find(
              (item) => item.questionId === q.id
            ) || {
              questionId: q.id,
              score: 0,
              isCorrect: false,
              feedback: 'No substantive response recorded.',
              sampleAnswer: 'Use direct technical definitions and structure.',
              keyTakeaway: 'Prepare core domain fundamentals.',
            };

            const candidateAnswer = session.answers?.find(
              (a) => a.questionId === q.id
            )?.userAnswer || '(No answer provided)';

            const isExpanded = expandedQuestion === q.id || expandedQuestion === null;
            const isMCQ = q.section === 'mcq' || (q.options && q.options.length > 0);
            const isCorrectMCQ = fb.isCorrect ?? (fb.score === 100);

            return (
              <div
                key={q.id}
                className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition-all duration-200 hover:border-rose-200 shadow-xs"
              >
                {/* Header item */}
                <div
                  onClick={() => toggleExpand(q.id)}
                  className="flex cursor-pointer items-start justify-between gap-4 p-5 sm:p-6"
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-rose-50 px-2.5 py-0.5 text-xs font-black text-rose-700 font-['Outfit'] border border-rose-100">
                        Q{idx + 1}
                      </span>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">
                        {q.sectionTitle || q.category}
                      </span>
                      {q.cvReference && (
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                          CV Referenced
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-base sm:text-lg font-bold text-slate-900 font-['Outfit']">
                      {q.question}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 ${
                      fb.score >= 70
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                        : fb.score > 0
                        ? 'border-amber-200 bg-amber-50 text-amber-800'
                        : 'border-red-200 bg-red-50 text-red-700'
                    }`}>
                      {isMCQ ? (
                        isCorrectMCQ ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 text-red-600" />
                        )
                      ) : (
                        <Star className="h-3.5 w-3.5 text-rose-600" />
                      )}
                      <span className="text-xs font-black font-['Outfit']">{fb.score}</span>
                      <span className="text-[10px] opacity-70">/ 100</span>
                    </div>
                    <button className="text-slate-400 hover:text-rose-700 transition">
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-rose-50/20 p-5 sm:p-6 space-y-4">
                    {/* Candidate's submitted response */}
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-500 font-['Outfit']">
                        Your Submitted Response
                      </div>
                      <div className="mt-1.5 rounded-xl border border-slate-200 bg-white p-3.5 text-xs sm:text-sm text-slate-800 leading-relaxed italic shadow-2xs">
                        "{candidateAnswer}"
                      </div>
                    </div>

                    {/* MCQ Specific: Correct Answer & Explanation */}
                    {isMCQ && q.correctAnswer && (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
                        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 font-['Outfit']">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          <span>Correct MCQ Choice: {q.correctAnswer}</span>
                        </div>
                        {q.explanation && (
                          <p className="mt-1 text-xs text-emerald-950 leading-relaxed">
                            {q.explanation}
                          </p>
                        )}
                      </div>
                    )}

                    {/* AI Coach Feedback */}
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-rose-700 font-['Outfit']">
                        AI Coach Feedback & Critique
                      </div>
                      <p className="mt-1.5 text-xs sm:text-sm text-slate-800 leading-relaxed font-normal">
                        {fb.feedback}
                      </p>
                    </div>

                    {/* Exemplary Model Sample Answer */}
                    <div className="rounded-xl border border-rose-200/80 bg-rose-50/70 p-4 shadow-2xs">
                      <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-rose-800 font-['Outfit']">
                        <Award className="h-4 w-4 text-rose-600" />
                        <span>Exemplary Model Answer (Benchmark)</span>
                      </div>
                      <p className="mt-2 text-xs sm:text-sm text-rose-950 leading-relaxed font-sans">
                        {fb.sampleAnswer}
                      </p>
                    </div>

                    {/* Key Takeaway tip */}
                    {fb.keyTakeaway && (
                      <div className="flex items-center gap-2 text-xs text-rose-900 bg-rose-50 border border-rose-200/80 rounded-xl p-3">
                        <span className="font-bold text-rose-700 font-['Outfit']">Pro-Tip:</span>
                        <span>{fb.keyTakeaway}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
