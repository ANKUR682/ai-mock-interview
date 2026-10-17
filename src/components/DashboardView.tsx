import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  ChevronRight,
  Loader2,
  RefreshCw,
  Search,
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  Clock,
  Layers,
  Award,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { InterviewSession } from '../types/interview';
import {
  getFirestoreInterviewsByUser,
  deleteFirestoreInterview,
} from '../services/interviewService';
import { InteractiveDemoSnippet } from './InteractiveDemoSnippet';

interface DashboardViewProps {
  onStartNewInterview: () => void;
  onSelectSession: (session: InterviewSession) => void;
  onResumeSession: (session: InterviewSession) => void;
  onOpenFeatures?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onStartNewInterview,
  onSelectSession,
  onResumeSession,
}) => {
  const { user, signInWithGoogle } = useAuth();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchSessions = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getFirestoreInterviewsByUser(user.uid);
      setSessions(data);
    } catch (err) {
      console.error('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [user]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this interview record?')) return;

    setDeletingId(id);
    try {
      await deleteFirestoreInterview(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error('Failed to delete interview:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const completedSessions = sessions.filter(
    (s) => s.status === 'completed' && s.evaluation
  );
  const totalCompleted = completedSessions.length;
  const avgScore =
    totalCompleted > 0
      ? Math.round(
          completedSessions.reduce(
            (acc, cur) => acc + (cur.evaluation?.overallScore || 0),
            0
          ) / totalCompleted
        )
      : 0;

  const filteredSessions = sessions.filter((s) =>
    s.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-[#09090b] text-zinc-100 pb-16">
      {/* Background Grid Pattern & Ambient Light Leak */}
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none opacity-40 z-0" />
      <div className="ambient-light-leak" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 pt-8 sm:pt-12 space-y-10">
        {/* Hero Section: Clear Professional Value Proposition & Interactive Demo */}
        <div className="text-left space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-zinc-800/60 text-zinc-300 border border-zinc-700/80">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
              Role-Calibrated AI Evaluation
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-zinc-800/60 text-zinc-300 border border-zinc-700/80">
              Web Speech API Voice Input
            </span>
          </div>

          <div className="max-w-2xl">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100 text-balance">
              Master your tech interviews with real-time AI feedback
            </h1>
            <p className="mt-2.5 text-sm sm:text-base text-zinc-400 leading-relaxed">
              Practice full-loop technical and behavioral questions tailored to your exact stack, speak answers naturally, and receive quantitative rubric evaluations.
            </p>
          </div>

          {/* Interactive Product Demo Snippet */}
          <div className="pt-2">
            <InteractiveDemoSnippet onStartFullInterview={onStartNewInterview} />
          </div>
        </div>

        {/* User Session Analytics Metrics */}
        {user && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 backdrop-blur-md p-5 text-left">
              <span className="text-xs font-medium text-zinc-400">Total Interviews</span>
              <div className="mt-2 text-2xl font-bold font-mono text-zinc-100">
                {sessions.length}
              </div>
              <p className="mt-1 text-xs text-zinc-500 font-mono">
                {totalCompleted} completed round{totalCompleted !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 backdrop-blur-md p-5 text-left">
              <span className="text-xs font-medium text-zinc-400">Average Performance</span>
              <div className="mt-2 text-2xl font-bold font-mono text-zinc-100">
                {avgScore > 0 ? `${avgScore} / 100` : '—'}
              </div>
              <p className="mt-1 text-xs text-zinc-500 font-mono">
                Across evaluated sessions
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 backdrop-blur-md p-5 flex flex-col justify-between text-left">
              <div>
                <span className="text-xs font-medium text-zinc-400">Direct Action</span>
                <p className="mt-1 text-xs text-zinc-300">
                  Configure custom role & experience level
                </p>
              </div>
              <button
                onClick={onStartNewInterview}
                className="mt-3 w-full py-1.5 rounded-lg bg-zinc-100 text-zinc-950 font-semibold text-xs hover:bg-white transition cursor-pointer shadow-xs"
              >
                + Start Interview Session
              </button>
            </div>
          </div>
        )}

        {/* Interview Sessions Data Table */}
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 backdrop-blur-xl shadow-xl overflow-hidden text-left">
          {/* Table Header Controls */}
          <div className="p-4 sm:p-5 border-b border-zinc-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-zinc-100 tracking-tight">
                Interview Sessions
              </h2>
              <p className="text-xs text-zinc-400">
                Recorded simulation history and evaluated rubric scores
              </p>
            </div>

            {user && (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-zinc-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter by role..."
                    className="pl-8 pr-3 py-1.5 text-xs bg-zinc-950/70 border border-zinc-800 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 w-48 transition"
                  />
                </div>
                <button
                  onClick={fetchSessions}
                  disabled={loading}
                  title="Refresh"
                  className="p-2 text-zinc-400 hover:text-zinc-200 bg-zinc-950/70 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition cursor-pointer"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            )}
          </div>

          {/* Table Content */}
          {!user ? (
            <div className="p-10 text-center space-y-3">
              <p className="text-xs text-zinc-400">
                Sign in with your Google account to persist interview transcripts and performance reports.
              </p>
              <button
                onClick={() => signInWithGoogle()}
                className="px-4 py-2 rounded-lg bg-zinc-100 text-zinc-950 font-semibold text-xs hover:bg-white transition cursor-pointer shadow-xs"
              >
                Sign in with Google
              </button>
            </div>
          ) : loading ? (
            <div className="p-14 text-center text-zinc-400">
              <Loader2 className="h-5 w-5 animate-spin mx-auto text-zinc-400" />
              <p className="mt-2 text-xs">Loading sessions...</p>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="p-14 text-center space-y-3">
              <p className="text-xs text-zinc-400">No interview sessions found yet.</p>
              <button
                onClick={onStartNewInterview}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-zinc-100 text-zinc-950 text-xs font-semibold hover:bg-white transition cursor-pointer shadow-xs"
              >
                <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                <span>Create First Interview</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-800/80 bg-zinc-950/40 text-zinc-400 font-medium">
                    <th className="py-3 px-5">Target Role</th>
                    <th className="py-3 px-5">Experience Level</th>
                    <th className="py-3 px-5">Date</th>
                    <th className="py-3 px-5">Score</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {filteredSessions.map((session) => {
                    const isCompleted = session.status === 'completed' && session.evaluation;
                    const score = session.evaluation?.overallScore;
                    const dateStr = new Date(session.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    });

                    return (
                      <tr
                        key={session.id}
                        onClick={() => {
                          if (isCompleted) {
                            onSelectSession(session);
                          } else {
                            onResumeSession(session);
                          }
                        }}
                        className="hover:bg-zinc-800/30 transition cursor-pointer"
                      >
                        <td className="py-3.5 px-5 font-medium text-zinc-200">
                          {session.jobTitle}
                        </td>
                        <td className="py-3.5 px-5 text-zinc-400">
                          {session.yearsOfExperience || 'Mid-Level'}
                        </td>
                        <td className="py-3.5 px-5 text-zinc-500 font-mono text-[11px]">
                          {dateStr}
                        </td>
                        <td className="py-3.5 px-5 font-mono">
                          {isCompleted ? (
                            <span className="font-semibold text-zinc-100">{score} / 100</span>
                          ) : (
                            <span className="text-zinc-600">—</span>
                          )}
                        </td>
                        <td className="py-3.5 px-5">
                          {isCompleted ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-800/60 text-zinc-300 border border-zinc-700">
                              Completed
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              In Progress
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <div
                            className="flex items-center justify-end gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => {
                                if (isCompleted) {
                                  onSelectSession(session);
                                } else {
                                  onResumeSession(session);
                                }
                              }}
                              className="inline-flex items-center gap-1 text-zinc-300 hover:text-white font-medium px-2 py-1 rounded hover:bg-zinc-800 transition cursor-pointer"
                            >
                              <span>{isCompleted ? 'View Report' : 'Resume'}</span>
                              <ChevronRight className="h-3 w-3" />
                            </button>
                            <button
                              onClick={(e) => handleDelete(e, session.id)}
                              disabled={deletingId === session.id}
                              title="Delete"
                              className="p-1 text-zinc-500 hover:text-rose-400 rounded hover:bg-zinc-800 transition cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
