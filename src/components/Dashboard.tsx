import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Calendar,
  Award,
  TrendingUp,
  Trash2,
  ChevronRight,
  Sparkles,
  BarChart3,
  CheckCircle2,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { InterviewSession } from '../types/interview';
import {
  getFirestoreInterviewsByUser,
  deleteFirestoreInterview,
} from '../services/interviewService';

interface DashboardProps {
  onStartNewInterview: () => void;
  onSelectSession: (session: InterviewSession) => void;
  onResumeSession: (session: InterviewSession) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onStartNewInterview,
  onSelectSession,
  onResumeSession,
}) => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'completed' | 'in_progress'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchSessions = async () => {
    if (!user) return;
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
      alert('Could not delete session. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  // Metrics
  const completedSessions = sessions.filter((s) => s.status === 'completed' && s.evaluation);
  const totalCompleted = completedSessions.length;
  const avgScore = totalCompleted > 0
    ? Math.round(
        completedSessions.reduce(
          (acc, cur) => acc + (cur.evaluation?.overallScore || 0),
          0
        ) / totalCompleted
      )
    : 0;
  const highestScore = totalCompleted > 0
    ? Math.max(...completedSessions.map((s) => s.evaluation?.overallScore || 0))
    : 0;

  // Filtered Sessions
  const filteredSessions = sessions.filter((s) => {
    const matchesSearch =
      s.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.yearsOfExperience && s.yearsOfExperience.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter =
      filterCategory === 'all' || s.status === filterCategory;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 bg-white text-slate-900">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-['Outfit']">
            Welcome back, <span className="bg-gradient-to-r from-rose-700 to-red-600 bg-clip-text text-transparent">{user?.displayName || 'Candidate'}</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 font-normal">
            Track past interview sessions, review scoring, and continue practicing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchSessions}
            title="Refresh"
            disabled={loading}
            className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 shadow-2xs"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-rose-600' : ''}`} />
          </button>
          <button
            onClick={onStartNewInterview}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-rose-600/20 transition hover:from-rose-500 hover:to-red-500 active:scale-95 font-['Outfit']"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Start New Interview</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {/* Total Sessions */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:border-rose-300 transition">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700 font-['Outfit']">Interviews Taken</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
              <BarChart3 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-slate-900 font-['Outfit']">{sessions.length}</div>
          <div className="mt-1 text-[11px] text-slate-500">{totalCompleted} completed</div>
        </div>

        {/* Average Score */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:border-rose-300 transition">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700 font-['Outfit']">Avg Readiness</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-rose-600 font-['Outfit']">
            {avgScore > 0 ? `${avgScore}%` : '—'}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Across completed rubrics</div>
        </div>

        {/* Highest Score */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:border-rose-300 transition">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700 font-['Outfit']">Best Score</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-rose-700 font-['Outfit']">
            {highestScore > 0 ? `${highestScore}/100` : '—'}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Personal peak score</div>
        </div>

        {/* Storage */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:border-rose-300 transition">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700 font-['Outfit']">Cloud Storage</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-base font-black text-slate-900 font-['Outfit']">Firestore Live</div>
          <div className="mt-1 text-[11px] text-rose-700 font-bold">Synced to your account</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by role title or seniority level..."
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2">
          {(['all', 'completed', 'in_progress'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition font-['Outfit'] ${
                filterCategory === cat
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'border border-slate-200 bg-white text-slate-700 hover:border-rose-300 hover:text-rose-700 shadow-2xs'
              }`}
            >
              {cat === 'all'
                ? 'All Sessions'
                : cat === 'completed'
                ? 'Completed'
                : 'In Progress'}
            </button>
          ))}
        </div>
      </div>

      {/* Sessions Grid */}
      <div className="mt-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
            <p className="mt-3 text-xs font-bold text-rose-700 font-['Outfit']">Loading sessions from Firestore...</p>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-rose-200 bg-rose-50/20 p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-black text-slate-900 font-['Outfit']">No interview sessions found</h3>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-sm mx-auto font-normal">
              {searchQuery
                ? 'Try adjusting your search criteria.'
                : 'Ready to practice? Create your first AI mock interview.'}
            </p>
            <button
              onClick={onStartNewInterview}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:from-rose-500 hover:to-red-500 font-['Outfit']"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>Start First Interview</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSessions.map((session) => {
              const isCompleted = session.status === 'completed' && session.evaluation;
              const score = session.evaluation?.overallScore;
              const dateStr = new Date(session.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div
                  key={session.id}
                  onClick={() => {
                    if (isCompleted) {
                      onSelectSession(session);
                    } else {
                      onResumeSession(session);
                    }
                  }}
                  className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-rose-300 hover:shadow-lg hover:shadow-rose-500/5 cursor-pointer"
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                        <Calendar className="h-3.5 w-3.5 text-rose-600" />
                        <span>{dateStr}</span>
                      </div>

                      {isCompleted ? (
                        <div
                          className={`rounded-lg px-2.5 py-0.5 text-xs font-black font-['Outfit'] ${
                            score! >= 80
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : score! >= 60
                              ? 'bg-orange-50 text-orange-700 border border-orange-200'
                              : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                          }`}
                        >
                          Score: {score}/100
                        </div>
                      ) : (
                        <span className="rounded-lg bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600 border border-slate-200">
                          In Progress
                        </span>
                      )}
                    </div>

                    {/* Job Title */}
                    <h3 className="mt-3 text-lg font-black text-slate-900 group-hover:text-rose-700 transition-colors line-clamp-1 font-['Outfit']">
                      {session.jobTitle}
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-500 font-medium">
                      Level: {session.yearsOfExperience || 'Mid-Level'}
                    </p>

                    {/* Summary snippet */}
                    {session.evaluation?.summary ? (
                      <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal">
                        {session.evaluation.summary}
                      </p>
                    ) : (
                      <p className="mt-3 text-xs text-slate-400 italic">
                        {session.questions?.length || 5} questions prepared. Click to resume or complete.
                      </p>
                    )}
                  </div>

                  {/* Card Footer Actions */}
                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                    <span className="font-bold text-rose-700 group-hover:text-rose-800 inline-flex items-center gap-1 font-['Outfit']">
                      {isCompleted ? 'View Full Report' : 'Resume Interview'}
                      <ChevronRight className="h-3.5 w-3.5" />
                    </span>

                    <button
                      onClick={(e) => handleDelete(e, session.id)}
                      disabled={deletingId === session.id}
                      title="Delete interview record"
                      className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-700 transition"
                    >
                      {deletingId === session.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-rose-600" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
