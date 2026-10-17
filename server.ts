import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '25mb' }));

// Server-side Gemini initialization
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper: Check if string is non-substantive gibberish or placeholder
function isNonSubstantive(str: string | undefined): boolean {
  if (!str) return true;
  const trimmed = str.trim();
  if (trimmed.length < 3) return true;
  // Common placeholders or single digits
  const lower = trimmed.toLowerCase();
  const placeholders = ['12', '1', '2', '3', 'asdf', 'test', 'idk', 'none', 'n/a', 'na', 'no', 'abc', 'xyz', 'qwe', 'qwerty', 'filler', 'placeholder', '(no answer provided)', 'null', 'undefined'];
  if (placeholders.includes(lower)) return true;
  // Single repeated character like "aaaa" or "111"
  if (/^(.)\1+$/.test(lower)) return true;
  return false;
}

// Route 1: Resume / CV Parser Endpoint
app.post('/api/interview/parse-resume', async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileBase64, mimeType, fileName, textContent } = req.body;

    if (!fileBase64 && !textContent) {
      res.status(400).json({ error: 'File data or text content is required' });
      return;
    }

    const promptText = `You are an expert technical talent recruiter and CV analyst.
Analyze this candidate resume/CV document and extract structured profile information:
1. Core Technical & Professional Skills (languages, frameworks, cloud, databases, methodologies).
2. Key Projects, Achievements & Architectural Claims (systems built, performance improvements, key responsibilities).
3. Estimated Experience Level (e.g. Junior 0-2 yrs, Mid-Level 3-5 yrs, Senior 6-9 yrs, Staff/Lead 10+ yrs).
4. Executive candidate summary (2-3 sentences).
5. Clean, structured plain-text representation of the CV content.`;

    let contents: any[] = [];
    if (fileBase64 && mimeType === 'application/pdf') {
      contents = [
        {
          inlineData: {
            data: fileBase64,
            mimeType: 'application/pdf',
          },
        },
        promptText,
      ];
    } else {
      contents = [
        `${promptText}\n\nResume Document Content:\n${textContent || ''}`
      ];
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            skills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of key technical skills, languages, tools, and platforms'
            },
            projects: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Key projects, architectures, systems built, or measurable achievements'
            },
            experienceSummary: {
              type: Type.STRING,
              description: 'Concise summary of candidate background and detected seniority'
            },
            rawText: {
              type: Type.STRING,
              description: 'Clean readable extracted text of the CV'
            }
          },
          required: ['skills', 'projects', 'experienceSummary', 'rawText']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      fileName: fileName || 'Uploaded Resume',
      ...parsed,
    });
  } catch (error: any) {
    console.error('Error parsing resume:', error);
    res.status(500).json({
      error: error.message || 'Failed to parse resume document'
    });
  }
});

// Route 2: Dynamic Multi-Format Interview Question Generator
app.post('/api/interview/generate-questions', async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobTitle, jobDescription, yearsOfExperience, resumeText, resumeProfile } = req.body;

    if (!jobTitle) {
      res.status(400).json({ error: 'Job title is required' });
      return;
    }

    const hasResume = Boolean(resumeText || (resumeProfile && resumeProfile.skills?.length > 0));

    const prompt = `You are a world-class principal engineering manager and executive technical interviewer.
You are designing a rigorous, highly-personalized, structured mock interview for:
- Target Job Title: ${jobTitle}
- Candidate Experience Level: ${yearsOfExperience || 'Mid-Senior'}
- Target Job Description (JD): ${jobDescription || 'Standard industry requirements for this role'}
${hasResume ? `\n--- CANDIDATE RESUME / CV PROFILE ---\n${JSON.stringify(resumeProfile || {}, null, 2)}\nFull CV Text Snippet: ${(resumeText || '').substring(0, 3000)}\n-----------------------------------` : ''}

CRITICAL INSTRUCTION ON QUESTION COUNTS:
You MUST output ALL questions across the three sections sequentially:
- Section 1 (MCQs): Exactly 5 questions (IDs 1, 2, 3, 4, 5) with section = "mcq". Each MCQ MUST have 4 options, a correctAnswer, and an explanation.
- Section 2 (Short-Answer): Exactly 3 questions (IDs 6, 7, 8) with section = "short_answer".
- Section 3 (Elaborate / Deep-Dive): Exactly 3 to 4 questions (IDs 9, 10, 11, and optionally 12) with section = "elaborate".
The total number of questions in the array MUST BE AT LEAST 11 QUESTIONS. Do NOT truncate or output only 1 question. Output the full array with all 11-12 questions.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              description: 'Ordered list of interview questions across the 3 sections',
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  question: { type: Type.STRING },
                  category: {
                    type: Type.STRING,
                    description: 'technical | behavioral | situational | system_design'
                  },
                  section: {
                    type: Type.STRING,
                    description: 'mcq | short_answer | elaborate'
                  },
                  sectionTitle: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Exactly 4 choices for Section 1 MCQs ("A) ...", "B) ...", "C) ...", "D) ...")'
                  },
                  correctAnswer: {
                    type: Type.STRING,
                    description: 'The correct answer for MCQs (matching one of options)'
                  },
                  explanation: {
                    type: Type.STRING,
                    description: 'Technical explanation of the correct MCQ answer'
                  },
                  cvReference: {
                    type: Type.STRING,
                    description: 'Specific CV project, technology, or claim referenced for Section 3 questions'
                  },
                  context: { type: Type.STRING },
                  idealAnswerFocus: { type: Type.STRING }
                },
                required: ['id', 'question', 'category', 'section', 'sectionTitle', 'idealAnswerFocus']
              }
            }
          },
          required: ['questions']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error generating questions:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate interview questions'
    });
  }
});

// Route 3: Strict AI Evaluation & Zero-Tolerance Scoring Logic
app.post('/api/interview/evaluate', async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobTitle, jobDescription, yearsOfExperience, questions, answers, resumeProfile } = req.body;

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      res.status(400).json({ error: 'Answers are required for evaluation' });
      return;
    }

    // Pre-evaluate responses for zero-tolerance check
    const answeredCount = answers.filter((a) => !isNonSubstantive(a.userAnswer)).length;
    const allAnswersInvalid = answeredCount === 0;

    // Strict evaluation prompt
    const prompt = `You are a strict, objective, zero-tolerance technical interviewer and hiring committee chair.
Job Title: ${jobTitle}
Candidate Seniority Level: ${yearsOfExperience || 'Mid-Senior'}
Job Context: ${jobDescription || 'Standard requirements'}
${resumeProfile ? `Candidate CV Context: ${JSON.stringify(resumeProfile, null, 2)}` : ''}

Candidate Answers to evaluate:
${JSON.stringify(answers, null, 2)}

Original Questions with Answer Keys:
${JSON.stringify(questions || [], null, 2)}

STRICT GRADING RULES (ZERO TOLERANCE):
1. GIBBERISH / PLACEHOLDER / BLANK ANSWERS:
   - If a candidate answer is blank, a placeholder, a single number (e.g. "12", "1"), random characters (e.g. "asdf", "test", "idk"), or fewer than 5 meaningful letters, YOU MUST ASSIGN 0 POINTS (score = 0) FOR THAT QUESTION.
2. ZERO-TOLERANCE OVERALL SCORE:
   - If ALL submitted answers are invalid, non-substantive, or placeholders, the OVERALL SCORE MUST BE EXACTLY 0 / 100.
3. NO PITY POINTS UNDER CORE STRENGTHS:
   - Do NOT reward administrative actions like "submitting all prompts", "completing the queue", or "reading questions".
   - If answers are invalid or empty, "strengths" MUST be exactly: ["No strengths demonstrated due to missing or non-substantive responses."].
4. SECTION 1 (MCQ) GRADING:
   - For MCQs: If the candidate selected choice matches the question's correctAnswer, award 100 points for that question. If it does not match, or was left blank/invalid, award 0 points.
5. SHORT-ANSWER & ELABORATE GRADING:
   - Grade rigorously against technical depth, concrete examples, and architectural precision. Grade 0-100 based strictly on technical substance.
6. Provide calculated Section Scores for each section present (mcq, short_answer, elaborate).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: {
              type: Type.INTEGER,
              description: 'Overall interview readiness score from 0 to 100'
            },
            summary: {
              type: Type.STRING,
              description: 'Executive overview of candidate performance'
            },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Candidate core strengths (or single statement of no strengths if answers were non-substantive)'
            },
            areasForImprovement: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Actionable areas for candidate improvement'
            },
            sectionScores: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  section: { type: Type.STRING },
                  sectionTitle: { type: Type.STRING },
                  score: { type: Type.INTEGER },
                  totalQuestions: { type: Type.INTEGER },
                  correctCount: { type: Type.INTEGER }
                },
                required: ['section', 'sectionTitle', 'score', 'totalQuestions']
              }
            },
            questionFeedbacks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  questionId: { type: Type.INTEGER },
                  score: { type: Type.INTEGER },
                  isCorrect: { type: Type.BOOLEAN },
                  feedback: { type: Type.STRING },
                  sampleAnswer: { type: Type.STRING },
                  keyTakeaway: { type: Type.STRING }
                },
                required: ['questionId', 'score', 'feedback', 'sampleAnswer', 'keyTakeaway']
              }
            }
          },
          required: ['overallScore', 'summary', 'strengths', 'areasForImprovement', 'questionFeedbacks']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');

    // Programmatic Zero-Tolerance Enforcement (Guarantees zero pity points and exact 0 score)
    if (allAnswersInvalid) {
      parsed.overallScore = 0;
      parsed.strengths = ['No strengths demonstrated due to missing or non-substantive responses.'];
      parsed.summary = 'The interview session contained no substantive or valid responses. All answers submitted were blank, placeholders, or single-character strings. A complete retry with substantive technical answers is required.';
      if (parsed.questionFeedbacks) {
        parsed.questionFeedbacks = parsed.questionFeedbacks.map((qf: any) => ({
          ...qf,
          score: 0,
          isCorrect: false,
          feedback: 'No substantive response provided. Received 0 points.',
        }));
      }
      if (parsed.sectionScores) {
        parsed.sectionScores = parsed.sectionScores.map((ss: any) => ({
          ...ss,
          score: 0,
          correctCount: 0,
        }));
      }
    } else {
      // Ensure individual non-substantive questions are strictly 0
      answers.forEach((ans: any) => {
        if (isNonSubstantive(ans.userAnswer)) {
          const match = parsed.questionFeedbacks?.find((qf: any) => qf.questionId === ans.questionId);
          if (match) {
            match.score = 0;
            match.isCorrect = false;
            match.feedback = 'Response was invalid, placeholder, or non-substantive (0 points).';
          }
        }
      });
    }

    res.json(parsed);
  } catch (error: any) {
    console.error('Error evaluating interview:', error);
    res.status(500).json({
      error: error.message || 'Failed to evaluate interview answers'
    });
  }
});

// Route 4: Studio TTS Voice Output
app.post('/api/interview/speak', async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, voiceName = 'Kore' } = req.body;
    if (!text) {
      res.status(400).json({ error: 'Text is required for TTS' });
      return;
    }

    const ttsResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text,
              speechMetadata: {
                style: 'Clear, articulate, polite, professional interviewer tone',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      res.json({
        audioBase64: base64Audio,
        mimeType: 'audio/wav',
      });
    } else {
      res.status(204).end();
    }
  } catch (err: any) {
    console.warn('Gemini TTS fallback will be handled by browser speech synthesis:', err?.message);
    res.status(500).json({ error: err?.message || 'TTS generation unavailable' });
  }
});

// Vite Middleware for dev & static serve for production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mock Interview Server listening on port ${PORT}`);
  });
}

startServer();
