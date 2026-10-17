import React, { useState, useEffect } from 'react';
import { Search, Loader2, Trash2, ChevronRight, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { InterviewSession } from '../types/interview';
import {
  getFirestoreInterviewsByUser,
  deleteFirestoreInterview,
} from '../services/interviewService';

interface HistoryViewProps {
  onSelectSession: (session: InterviewSession) => void;
  onResumeSession: (session: InterviewSession) => void;
  onStartNewInterview: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  onSelectSession,
  onResumeSession,
  onStartNewInterview,
}) => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'in_progress'>('all');
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

  const filtered = sessions.filter((s) => {
    const matchesSearch = s.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-[#09090b] text-zinc-100 pb-16">
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none opacity-40 z-0" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 pt-8 space-y-6 text-left">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-100">Interview History</h2>
          <p className="mt-1 text-xs text-zinc-400">
            Recorded simulations, questions, and performance evaluations
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 backdrop-blur-xl shadow-xl overflow-hidden">
          {/* Controls Bar */}
          <div className="p-4 sm:p-5 border-b border-zinc-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-zinc-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by role..."
                  className="pl-8 pr-3 py-1.5 text-xs bg-zinc-950/70 border border-zinc-800 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 w-52 transition"
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

            <div className="flex items-center gap-1 bg-zinc-950/60 border border-zinc-800/80 rounded-lg p-1">
              {(['all', 'completed', 'in_progress'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-3 py-1 text-xs rounded-md font-medium transition cursor-pointer ${
                    statusFilter === filter
                      ? 'bg-zinc-800 text-zinc-100 shadow-2xs'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {filter === 'all' ? 'All' : filter === 'completed' ? 'Completed' : 'In Progress'}
                </button>
              ))}
            </div>
          </div>

          {/* Data Table */}
          {loading ? (
            <div className="p-16 text-center text-zinc-400">
              <Loader2 className="h-5 w-5 animate-spin mx-auto text-zinc-400" />
              <p className="mt-2.5 text-xs">Loading sessions...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <p className="text-xs text-zinc-400">No matching interview sessions found.</p>
              <button
                onClick={onStartNewInterview}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-zinc-100 text-zinc-950 text-xs font-semibold hover:bg-white transition cursor-pointer shadow-xs"
              >
                Start New Interview
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-800/80 bg-zinc-950/40 text-zinc-400 font-medium">
                    <th className="py-3 px-5">Role Title</th>
                    <th className="py-3 px-5">Experience Level</th>
                    <th className="py-3 px-5">Date</th>
                    <th className="py-3 px-5">Score</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {filtered.map((session) => {
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
