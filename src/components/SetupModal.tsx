import React, { useState, useRef } from 'react';
import {
  X,
  Sparkles,
  Briefcase,
  FileText,
  Clock,
  Loader2,
  ArrowRight,
  Upload,
  CheckCircle2,
  FileCode,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import {
  apiGenerateQuestions,
  apiParseResume,
  createFirestoreInterview,
} from '../services/interviewService';
import { useAuth } from '../context/AuthContext';
import { InterviewSession, ResumeProfile } from '../types/interview';

interface SetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionReady: (session: InterviewSession) => void;
}

const PRESET_ROLES = [
  'Senior Full-Stack Engineer',
  'Frontend Specialist (React/TS)',
  'Product Manager',
  'DevOps & Cloud Architect',
  'Machine Learning Engineer',
  'Data Analyst / Analytics',
];

const SAMPLE_DESCRIPTIONS: Record<string, string> = {
  'Senior Full-Stack Engineer':
    'Designing scalable distributed web apps, React, TypeScript, Node.js/Go, microservices, PostgreSQL, caching, and CI/CD pipelines. Strong emphasis on system architecture and cross-functional team leadership.',
  'Frontend Specialist (React/TS)':
    'Modern React 19 architecture, complex client state management, performance optimization (Core Web Vitals), accessible design systems, Web APIs, and automated UI testing.',
  'Product Manager':
    'Product strategy, customer discovery interviews, roadmap prioritization, A/B experimentation, agile execution, stakeholder alignment, and data-driven feature rollouts.',
  'DevOps & Cloud Architect':
    'Kubernetes cluster orchestration, Terraform infrastructure as code, zero-downtime deployment pipelines, observability with Prometheus/Grafana, and cloud security governance.',
  'Machine Learning Engineer':
    'Productionizing LLMs and ML pipelines, embeddings, vector indexing, retrieval-augmented generation (RAG), evaluation frameworks, model latency optimization, and PyTorch.',
};

export const SetupModal: React.FC<SetupModalProps> = ({
  isOpen,
  onClose,
  onSessionReady,
}) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('3-5 years (Mid-Level)');

  // Resume state
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeProfile, setResumeProfile] = useState<ResumeProfile | null>(null);
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [resumeParseError, setResumeParseError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectPreset = (role: string) => {
    setJobTitle(role);
    if (SAMPLE_DESCRIPTIONS[role]) {
      setJobDescription(SAMPLE_DESCRIPTIONS[role]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResumeFile(file);
    setResumeParseError(null);
    setIsParsingResume(true);

    try {
      const parsed = await apiParseResume(file);
      setResumeProfile(parsed);
      // If candidate hasn't typed job title yet, suggest detected role or skills
      if (!jobTitle && parsed.experienceSummary) {
        // Leave to user choice or keep clean
      }
    } catch (err: any) {
      console.error('Failed to parse resume:', err);
      setResumeParseError(err.message || 'Failed to parse file. You can still proceed manually.');
      setResumeProfile(null);
    } finally {
      setIsParsingResume(false);
    }
  };

  const handleRemoveResume = () => {
    setResumeFile(null);
    setResumeProfile(null);
    setResumeParseError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle.trim()) {
      setError('Please provide a target job title or role');
      return;
    }
    if (!user) {
      setError('You must be signed in to start an interview');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    setLoadingStep(
      resumeProfile
        ? 'Cross-referencing your CV with Target Job Description...'
        : 'Analyzing role requirements & target competencies...'
    );

    try {
      setLoadingStep('Generating 3 structured sections (MCQs, Short-Answers, Deep-Dive Project Defense)...');
      const questions = await apiGenerateQuestions({
        jobTitle: jobTitle.trim(),
        jobDescription: jobDescription.trim(),
        yearsOfExperience,
        resumeText: resumeProfile?.rawText,
        resumeProfile: resumeProfile || undefined,
      });

      setLoadingStep('Provisioning secure Firestore interview session...');
      const interviewId = `int_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const now = new Date().toISOString();

      const newSession: InterviewSession = {
        id: interviewId,
        userId: user.uid,
        userEmail: user.email || '',
        jobTitle: jobTitle.trim(),
        jobDescription: jobDescription.trim(),
        yearsOfExperience,
        resumeProfile: resumeProfile || undefined,
        resumeText: resumeProfile?.rawText,
        status: 'in_progress',
        questions,
        answers: [],
        createdAt: now,
        updatedAt: now,
      };

      await createFirestoreInterview(newSession);

      onSessionReady(newSession);
      onClose();
    } catch (err: any) {
      console.error('Failed to setup interview:', err);
      setError(err?.message || 'Failed to initialize interview. Please try again.');
    } finally {
      setIsSubmitting(false);
      setLoadingStep('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={() => !isSubmitting && onClose()}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xl z-10 my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-5 right-5 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 font-['Outfit']">Start New Mock Interview</h2>
            <p className="text-xs text-slate-500 font-normal">Upload your CV to generate MCQs, short answers, and project deep-dives.</p>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Preset Suggestions */}
          <div>
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">Quick-Select Popular Roles</label>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {PRESET_ROLES.map((role) => (
                <button
                  type="button"
                  key={role}
                  onClick={() => handleSelectPreset(role)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition font-['Outfit'] ${
                    jobTitle === role
                      ? 'bg-rose-600 font-bold text-white shadow-xs'
                      : 'border border-slate-200 bg-slate-50 text-slate-700 hover:border-rose-300 hover:text-rose-700'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Job Title */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <Briefcase className="h-3.5 w-3.5 text-rose-600" />
              <span>Target Job Title / Role *</span>
            </label>
            <input
              type="text"
              required
              disabled={isSubmitting}
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Senior Full-Stack Engineer, Cloud Architect, Product Manager"
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 disabled:opacity-50 shadow-2xs"
            />
          </div>

          {/* CV / Resume Upload & Extraction */}
          <div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
                <FileCode className="h-3.5 w-3.5 text-rose-600" />
                <span>Upload CV / Resume (PDF or TXT)</span>
              </label>
              <span className="text-[11px] font-semibold text-rose-600">
                Enables Project-Specific Questions
              </span>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf,.txt,.md"
              onChange={handleFileChange}
              className="hidden"
            />

            {!resumeProfile && !isParsingResume && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="mt-1.5 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/60 p-4 text-center cursor-pointer hover:border-rose-300 hover:bg-rose-50/20 transition group"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 group-hover:text-rose-600 group-hover:border-rose-200 transition shadow-2xs">
                  <Upload className="h-4 w-4" />
                </div>
                <p className="mt-2 text-xs font-bold text-slate-700">
                  Click or drag your CV here <span className="text-rose-600 font-bold">(.pdf or .txt)</span>
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400 font-normal">
                  Gemini extracts your skills & past projects for targeted deep-dive questions
                </p>
              </div>
            )}

            {isParsingResume && (
              <div className="mt-1.5 flex items-center justify-center gap-3 rounded-xl border border-rose-200 bg-rose-50/50 p-4 text-center">
                <Loader2 className="h-5 w-5 animate-spin text-rose-600" />
                <div className="text-left">
                  <p className="text-xs font-bold text-rose-800 font-['Outfit']">Parsing Resume with Gemini...</p>
                  <p className="text-[11px] text-slate-500 font-normal">Extracting skills, past projects, and architectural claims</p>
                </div>
              </div>
            )}

            {resumeProfile && (
              <div className="mt-1.5 rounded-xl border border-rose-200/80 bg-rose-50/40 p-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-rose-600" />
                    <span className="text-xs font-bold text-slate-900 truncate max-w-[240px]">
                      {resumeFile?.name || 'Resume Attached'}
                    </span>
                    <span className="rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                      CV Extracted
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleRemoveResume}
                    className="inline-flex items-center gap-1 rounded-lg p-1 text-slate-400 hover:text-rose-700 transition text-[11px]"
                    title="Remove Resume"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Clear</span>
                  </button>
                </div>

                {/* Extracted Skills Preview */}
                {resumeProfile.skills && resumeProfile.skills.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {resumeProfile.skills.slice(0, 7).map((skill, idx) => (
                      <span
                        key={idx}
                        className="rounded-md bg-white border border-rose-200/80 px-2 py-0.5 text-[10px] font-semibold text-rose-800"
                      >
                        {skill}
                      </span>
                    ))}
                    {resumeProfile.skills.length > 7 && (
                      <span className="text-[10px] font-medium text-slate-500 self-center">
                        +{resumeProfile.skills.length - 7} more
                      </span>
                    )}
                  </div>
                )}

                {/* Extracted Projects Highlights */}
                {resumeProfile.projects && resumeProfile.projects.length > 0 && (
                  <p className="mt-2 text-[11px] text-slate-600 italic line-clamp-1">
                    📌 Projects detected: {resumeProfile.projects.slice(0, 2).join(' • ')}
                  </p>
                )}
              </div>
            )}

            {resumeParseError && (
              <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                <span>{resumeParseError}</span>
              </div>
            )}
          </div>

          {/* Years of Experience */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <Clock className="h-3.5 w-3.5 text-rose-600" />
              <span>Experience Level *</span>
            </label>
            <select
              value={yearsOfExperience}
              disabled={isSubmitting}
              onChange={(e) => setYearsOfExperience(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 disabled:opacity-50 shadow-2xs"
            >
              <option value="0-2 years (Entry / Junior)">0-2 years (Entry / Junior) — ~9 Questions (5 MCQs + 2 Short + 2 Deep)</option>
              <option value="3-5 years (Mid-Level)">3-5 years (Mid-Level) — ~11 Questions (5 MCQs + 3 Short + 3 Deep)</option>
              <option value="6-9 years (Senior)">6-9 years (Senior) — ~12 Questions (5 MCQs + 3-4 Short + 4 Deep)</option>
              <option value="10+ years (Staff / Lead / Principal)">10+ years (Staff / Lead / Principal) — ~13 Questions (5 MCQs + 4 Short + 4 Deep)</option>
            </select>
          </div>

          {/* Job Description / Focus Areas */}
          <div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
                <FileText className="h-3.5 w-3.5 text-rose-600" />
                <span>Target Job Description (JD) & Focus (Optional)</span>
              </label>
              <span className="text-[11px] text-slate-400 font-normal">
                Paste posting requirements or specific tech stack
              </span>
            </div>
            <textarea
              rows={3}
              disabled={isSubmitting}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste responsibilities, required tech stack, or specific scenarios you want to be tested on..."
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-3.5 text-sm text-slate-900 placeholder-slate-400 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 disabled:opacity-50 resize-none shadow-2xs"
            />
          </div>

          {/* Loading status or Submit button */}
          {isSubmitting ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-center">
              <div className="flex items-center justify-center gap-3 text-rose-700 font-bold font-['Outfit']">
                <Loader2 className="h-5 w-5 animate-spin text-rose-600" />
                <span className="text-sm">{loadingStep}</span>
              </div>
              <p className="mt-1.5 text-xs text-slate-600">
                Gemini is synthesizing Section 1 (5 MCQs), Section 2 (Short-Answers), and Section 3 (CV Deep-Dives)...
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-rose-600/20 transition hover:from-rose-500 hover:to-red-500 active:scale-95 font-['Outfit']"
              >
                <span>Generate Questions & Enter Room</span>
                <ArrowRight className="h-4 w-4 stroke-[2.5]" />
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
