export type QuestionSection = 'mcq' | 'short_answer' | 'elaborate';

export interface Question {
  id: number;
  question: string;
  category: 'technical' | 'behavioral' | 'situational' | 'system_design';
  section: QuestionSection;
  sectionTitle: string;
  options?: string[]; // 4 choices for Section 1 MCQs (e.g. ["A) ...", "B) ...", "C) ...", "D) ..."])
  correctAnswer?: string; // Correct choice identifier or text for MCQs
  explanation?: string; // Detailed technical explanation for MCQs
  cvReference?: string; // Specific project, claim, or tech from the candidate's CV for Section 3
  context?: string; // Context or rationale for why this question matters
  idealAnswerFocus: string; // What assessors look for
}

export interface Answer {
  questionId: number;
  questionText: string;
  userAnswer: string;
  selectedOption?: string; // If MCQ was answered
  section?: QuestionSection;
  category?: string;
  timeSpentSeconds?: number;
}

export interface QuestionFeedback {
  questionId: number;
  score: number;
  isCorrect?: boolean; // For MCQs
  feedback: string;
  sampleAnswer: string;
  keyTakeaway: string;
}

export interface SectionScore {
  section: QuestionSection;
  sectionTitle: string;
  score: number;
  totalQuestions: number;
  correctCount?: number; // for MCQs
}

export interface EvaluationReport {
  overallScore: number;
  summary: string;
  strengths: string[];
  areasForImprovement: string[];
  sectionScores?: SectionScore[];
  questionFeedbacks: QuestionFeedback[];
}

export interface ResumeProfile {
  fileName?: string;
  rawText?: string;
  skills?: string[];
  projects?: string[];
  experienceSummary?: string;
}

export interface InterviewSession {
  id: string;
  userId: string;
  userEmail: string;
  jobTitle: string;
  jobDescription?: string;
  yearsOfExperience?: string;
  resumeProfile?: ResumeProfile;
  resumeText?: string;
  status: 'in_progress' | 'completed';
  questions: Question[];
  answers: Answer[];
  evaluation?: EvaluationReport;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: string;
}
