import { z } from "zod";

// ─── Health ───────────────────────────────────────────────────────────────────

export const HealthCheckResponse = z.object({
  status: z.string().default("ok"),
});

// ─── Conversations ────────────────────────────────────────────────────────────

export const CreateConversationBody = z.object({
  title: z.string().min(1).max(255),
  model: z.string().default("falcoa"),
});

export const GetConversationParams = z.object({
  id: z.number().int().positive(),
});

export const DeleteConversationParams = z.object({
  id: z.number().int().positive(),
});

// ─── Messages ─────────────────────────────────────────────────────────────────

export const ListMessagesParams = z.object({
  id: z.number().int().positive(),
});

export const SendMessageParams = z.object({
  id: z.number().int().positive(),
});

export const SendMessageBody = z.object({
  content: z.string().min(1),
  model: z.string().optional(),
  imageBase64: z.string().optional(),
});

// ─── Profile ──────────────────────────────────────────────────────────────────

export const UpdateProfileBody = z.object({
  name: z.string().min(1).max(100).optional(),
  class: z.string().min(1).max(100).optional(),
  interests: z.array(z.string()).optional(),
  goals: z.string().max(500).optional(),
});

// ─── Challenges ───────────────────────────────────────────────────────────────

export const AttemptChallengeParams = z.object({
  id: z.number().int().positive(),
});

export const AttemptChallengeBody = z.object({
  answer: z.string().min(1),
});

// ─── Saved ────────────────────────────────────────────────────────────────────

export const SaveItemBody = z.object({
  content: z.string().min(1),
  source: z.string().default("falcoa"),
});

export const DeleteSavedParams = z.object({
  id: z.number().int().positive(),
});

// ─── Documents ────────────────────────────────────────────────────────────────

export const CreateDocumentBody = z.object({
  title: z.string().min(1).max(255),
  type: z.string().default("TXT"),
  content: z.string().min(1),
});

export const GetDocumentParams = z.object({
  id: z.number().int().positive(),
});

export const DeleteDocumentParams = z.object({
  id: z.number().int().positive(),
});

export const ChatWithDocumentParams = z.object({
  id: z.number().int().positive(),
});

export const ChatWithDocumentBody = z.object({
  question: z.string().min(1),
});

// ─── Exams ────────────────────────────────────────────────────────────────────

export const GenerateExamBody = z.object({
  subject: z.string().min(1),
  topic: z.string().optional(),
  title: z.string().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  mcqCount: z.number().int().min(0).max(20).default(5),
  shortCount: z.number().int().min(0).max(10).default(3),
  longCount: z.number().int().min(0).max(5).default(2),
  totalMarks: z.number().int().min(10).max(300).default(50),
  duration: z.number().int().min(5).max(180).default(30),
  imageBase64: z.string().optional(),
});

export const GetExamParams = z.object({
  id: z.number().int().positive(),
});

export const DeleteExamParams = z.object({
  id: z.number().int().positive(),
});

export const SubmitExamParams = z.object({
  id: z.number().int().positive(),
});

export const SubmitExamBody = z.object({
  answers: z.array(
    z.object({
      questionId: z.number().int().positive(),
      answer: z.string(),
      imageAnswer: z.string().optional(),
    })
  ),
  timeTaken: z.number().int().min(0),
});
