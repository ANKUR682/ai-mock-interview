import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  InterviewSession,
  Question,
  Answer,
  EvaluationReport,
  ResumeProfile,
} from '../types/interview';

// CV / Resume Parser Service
export async function apiParseResume(file: File): Promise<ResumeProfile> {
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  const isText = file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.md');

  if (!isPdf && !isText) {
    throw new Error('Unsupported resume format. Please upload a PDF (.pdf) or Text (.txt, .md) file.');
  }

  let fileBase64: string | undefined;
  let textContent: string | undefined;

  if (isText) {
    textContent = await file.text();
  } else {
    // Convert PDF to base64
    fileBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Strip data:application/pdf;base64, prefix
        const base64Clean = result.split(',')[1] || result;
        resolve(base64Clean);
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }

  const res = await fetch('/api/interview/parse-resume', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileName: file.name,
      mimeType: isPdf ? 'application/pdf' : 'text/plain',
      fileBase64,
      textContent,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Resume parsing failed (${res.status})`);
  }

  return await res.json();
}

export async function apiGenerateQuestions(params: {
  jobTitle: string;
  jobDescription?: string;
  yearsOfExperience?: string;
  resumeText?: string;
  resumeProfile?: ResumeProfile;
}): Promise<Question[]> {
  const res = await fetch('/api/interview/generate-questions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to generate questions (${res.status})`);
  }

  const data = await res.json();
  if (!data.questions || !Array.isArray(data.questions)) {
    throw new Error('Invalid question response format from server');
  }

  return data.questions;
}

export async function apiEvaluateInterview(params: {
  jobTitle: string;
  jobDescription?: string;
  yearsOfExperience?: string;
  questions: Question[];
  answers: Answer[];
  resumeProfile?: ResumeProfile;
}): Promise<EvaluationReport> {
  const res = await fetch('/api/interview/evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Evaluation failed (${res.status})`);
  }

  const data = await res.json();
  if (typeof data.overallScore !== 'number') {
    throw new Error('Invalid evaluation format received from server');
  }

  return data;
}

// Audio Speech Player (Server Gemini TTS with browser Web Speech Synthesis fallback)
let currentAudio: HTMLAudioElement | null = null;

export async function playQuestionSpeech(
  text: string,
  onStart?: () => void,
  onEnd?: () => void
): Promise<() => void> {
  stopQuestionSpeech();

  let stopped = false;
  const stopFn = () => {
    stopped = true;
    stopQuestionSpeech();
  };

  try {
    const res = await fetch('/api/interview/speak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (res.ok && !stopped) {
      const data = await res.json();
      if (data.audioBase64) {
        const audio = new Audio(`data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`);
        currentAudio = audio;

        audio.onplay = () => onStart?.();
        audio.onended = () => {
          currentAudio = null;
          onEnd?.();
        };
        audio.onerror = () => {
          fallbackSpeechSynthesis(text, onStart, onEnd);
        };

        await audio.play();
        return stopFn;
      }
    }
  } catch (err) {
    console.warn('Backend TTS failed, using browser speech synthesis fallback');
  }

  if (!stopped) {
    fallbackSpeechSynthesis(text, onStart, onEnd);
  }

  return stopFn;
}

export function stopQuestionSpeech() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

function fallbackSpeechSynthesis(text: string, onStart?: () => void, onEnd?: () => void) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onEnd?.();
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  utterance.pitch = 1.0;

  const voices = window.speechSynthesis.getVoices();
  const naturalVoice = voices.find(
    (v) => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha'))
  );
  if (naturalVoice) utterance.voice = naturalVoice;

  utterance.onstart = () => onStart?.();
  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onEnd?.();

  window.speechSynthesis.speak(utterance);
}

// Firestore Database Operations with strict ABAC and Error Handling
export async function createFirestoreInterview(session: InterviewSession): Promise<void> {
  const path = `interviews/${session.id}`;
  try {
    const docRef = doc(db, 'interviews', session.id);
    await setDoc(docRef, session);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateFirestoreInterview(
  id: string,
  updates: Partial<InterviewSession>
): Promise<void> {
  const path = `interviews/${id}`;
  try {
    const docRef = doc(db, 'interviews', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function getFirestoreInterviewsByUser(userId: string): Promise<InterviewSession[]> {
  const path = 'interviews';
  try {
    const q = query(
      collection(db, 'interviews'),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    const sessions: InterviewSession[] = [];
    snapshot.forEach((doc) => {
      sessions.push(doc.data() as InterviewSession);
    });

    return sessions.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function getFirestoreInterviewById(id: string): Promise<InterviewSession | null> {
  const path = `interviews/${id}`;
  try {
    const docRef = doc(db, 'interviews', id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return snapshot.data() as InterviewSession;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function deleteFirestoreInterview(id: string): Promise<void> {
  const path = `interviews/${id}`;
  try {
    const docRef = doc(db, 'interviews', id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
