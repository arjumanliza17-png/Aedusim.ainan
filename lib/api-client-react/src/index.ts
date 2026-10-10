import { useQuery, useMutation, type UseQueryResult, type UseMutationResult } from "@tanstack/react-query";

// ─── Base fetch helper ────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((error as any).error || res.statusText);
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

// ─── Query options helper type ────────────────────────────────────────────────

interface QueryOptions {
  query?: {
    enabled?: boolean;
    queryKey?: readonly unknown[];
  };
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Conversation {
  id: number;
  title: string;
  model: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: number;
  conversationId: number;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface Profile {
  name: string;
  class: string;
  interests: string[];
  goals: string;
  plan: string;
  filesCount: number;
  xp: number;
  level: number;
  streak: number;
  totalMessages: number;
  completedChallenges: number;
}

export interface Progress {
  xp: number;
  level: number;
  rank: string;
  streak: number;
  totalMessages: number;
  completedChallenges: number;
  badges: string[];
  weeklyXp: number[];
}

export interface Challenge {
  id: number;
  title: string;
  description: string;
  subject: string;
  difficulty: string;
  xpReward: number;
  avatar: string;
  question: string;
  options: string[];
  completed: boolean;
}

export interface ChallengeAttemptResult {
  correct: boolean;
  xpEarned: number;
  explanation: string;
  correctAnswer: string;
}

export interface SavedItem {
  id: number;
  content: string;
  source: string;
  createdAt: string;
}

export interface Exam {
  id: number;
  title: string;
  subject: string;
  difficulty: string;
  questions: ExamQuestion[];
  totalMarks: number;
  createdAt: string;
}

export interface ExamQuestion {
  id: number;
  type: "mcq" | "short" | "long";
  question: string;
  options: string[];
  marks: number;
  answer: string;
}

export interface ExamQuestionResult {
  questionId: number;
  question: string;
  type: string;
  maxMarks: number;
  marksAwarded: number;
  studentAnswer: string;
  modelAnswer: string;
  feedback: string;
}

export interface ExamResult {
  examId: number;
  score: number;
  totalMarks: number;
  percentage: number;
  grade: string;
  timeTaken: number;
  questionResults: ExamQuestionResult[];
  weakAreas: string[];
  strongAreas: string[];
  suggestions: string[];
}

export interface ExamSession {
  id: number;
  examId: number;
  examTitle: string;
  subject: string;
  score: number;
  totalMarks: number;
  percentage: number;
  grade: string;
  timeTaken: number;
  completedAt: string;
}

export interface Document {
  id: number;
  title: string;
  content: string;
  type: string;
  subject: string;
  summary: string;
  flashcards: Array<{ question: string; answer: string }>;
  keyPoints: string[];
  formulas: string[];
  createdAt: string;
}

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const getListConversationsQueryKey = () => ["conversations"] as const;
export const getListMessagesQueryKey = (convId?: number) =>
  convId !== undefined ? (["conversations", convId, "messages"] as const) : (["conversations", "messages"] as const);
export const getGetProfileQueryKey = () => ["profile"] as const;
export const getGetProgressQueryKey = () => ["progress"] as const;
export const getListChallengesQueryKey = () => ["challenges"] as const;
export const getListSavedQueryKey = () => ["saved"] as const;
export const getListExamsQueryKey = () => ["exams"] as const;
export const getGetExamQueryKey = (id?: number) =>
  id !== undefined ? (["exams", id] as const) : (["exams"] as const);
export const getListExamSessionsQueryKey = () => ["exam-sessions"] as const;
export const getListDocumentsQueryKey = () => ["documents"] as const;
export const getGetDocumentQueryKey = (id?: number) =>
  id !== undefined ? (["documents", id] as const) : (["documents"] as const);

// ─── Conversations ────────────────────────────────────────────────────────────

export function useListConversations(): UseQueryResult<Conversation[]> {
  return useQuery({
    queryKey: getListConversationsQueryKey(),
    queryFn: () => apiFetch<Conversation[]>("/conversations"),
  });
}

export function useCreateConversation(): UseMutationResult<
  Conversation,
  Error,
  { data: { title: string; model?: string } }
> {
  return useMutation({
    mutationFn: ({ data }) =>
      apiFetch<Conversation>("/conversations", { method: "POST", body: JSON.stringify(data) }),
  });
}

export function useDeleteConversation(): UseMutationResult<void, Error, { id: number }> {
  return useMutation({
    mutationFn: ({ id }) => apiFetch<void>(`/conversations/${id}`, { method: "DELETE" }),
  });
}

export function useGetConversation(id: number | undefined): UseQueryResult<Conversation> {
  return useQuery({
    queryKey: getGetExamQueryKey(id),
    queryFn: () => apiFetch<Conversation>(`/conversations/${id}`),
    enabled: id !== undefined,
  });
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export function useListMessages(
  convId: number | undefined,
  options?: QueryOptions
): UseQueryResult<Message[]> {
  return useQuery({
    queryKey: options?.query?.queryKey ?? getListMessagesQueryKey(convId),
    queryFn: () => apiFetch<Message[]>(`/conversations/${convId}/messages`),
    enabled: options?.query?.enabled ?? convId !== undefined,
  });
}

export function useSendMessage(): UseMutationResult<
  Message,
  Error,
  { id: number; data: { content: string; model?: string; imageBase64?: string } }
> {
  return useMutation({
    mutationFn: ({ id, data }) =>
      apiFetch<Message>(`/conversations/${id}/messages`, { method: "POST", body: JSON.stringify(data) }),
  });
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export function useGetProfile(): UseQueryResult<Profile> {
  return useQuery({
    queryKey: getGetProfileQueryKey(),
    queryFn: () => apiFetch<Profile>("/profile"),
  });
}

export function useUpdateProfile(): UseMutationResult<Profile, Error, Partial<Pick<Profile, "name" | "class" | "interests" | "goals">>> {
  return useMutation({
    mutationFn: (body) => apiFetch<Profile>("/profile", { method: "PATCH", body: JSON.stringify(body) }),
  });
}

// ─── Progress ─────────────────────────────────────────────────────────────────

export function useGetProgress(): UseQueryResult<Progress> {
  return useQuery({
    queryKey: getGetProgressQueryKey(),
    queryFn: () => apiFetch<Progress>("/progress"),
  });
}

// ─── Challenges ───────────────────────────────────────────────────────────────

export function useListChallenges(): UseQueryResult<Challenge[]> {
  return useQuery({
    queryKey: getListChallengesQueryKey(),
    queryFn: () => apiFetch<Challenge[]>("/challenges"),
  });
}

export function useAttemptChallenge(): UseMutationResult<
  ChallengeAttemptResult,
  Error,
  { id: number; data: { answer: string } }
> {
  return useMutation({
    mutationFn: ({ id, data }) =>
      apiFetch<ChallengeAttemptResult>(`/challenges/${id}/attempt`, { method: "POST", body: JSON.stringify(data) }),
  });
}

// ─── Saved ────────────────────────────────────────────────────────────────────

export function useListSaved(): UseQueryResult<SavedItem[]> {
  return useQuery({
    queryKey: getListSavedQueryKey(),
    queryFn: () => apiFetch<SavedItem[]>("/saved"),
  });
}

export function useDeleteSaved(): UseMutationResult<void, Error, { id: number }> {
  return useMutation({
    mutationFn: ({ id }) => apiFetch<void>(`/saved/${id}`, { method: "DELETE" }),
  });
}

// ─── Exams ────────────────────────────────────────────────────────────────────

export function useListExams(): UseQueryResult<Exam[]> {
  return useQuery({
    queryKey: getListExamsQueryKey(),
    queryFn: () => apiFetch<Exam[]>("/exams"),
  });
}

export function useGetExam(id: number | undefined): UseQueryResult<Exam> {
  return useQuery({
    queryKey: getGetExamQueryKey(id),
    queryFn: () => apiFetch<Exam>(`/exams/${id}`),
    enabled: id !== undefined,
  });
}

export function useGenerateExam(): UseMutationResult<
  Exam,
  Error,
  { data: { subject: string; topic?: string; title?: string; difficulty?: string; mcqCount?: number; shortCount?: number; longCount?: number; totalMarks?: number; duration?: number; imageBase64?: string } }
> {
  return useMutation({
    mutationFn: ({ data }) => apiFetch<Exam>("/exams/generate", { method: "POST", body: JSON.stringify(data) }),
  });
}

export function useSubmitExam(): UseMutationResult<
  ExamResult,
  Error,
  { id: number; data: { answers: Array<{ questionId: number; answer: string; imageAnswer?: string }>; timeTaken: number } }
> {
  return useMutation({
    mutationFn: ({ id, data }) =>
      apiFetch<ExamResult>(`/exams/${id}/submit`, { method: "POST", body: JSON.stringify(data) }),
  });
}

// ─── Exam Sessions ────────────────────────────────────────────────────────────

export function useListExamSessions(): UseQueryResult<ExamSession[]> {
  return useQuery({
    queryKey: getListExamSessionsQueryKey(),
    queryFn: () => apiFetch<ExamSession[]>("/exam-sessions"),
  });
}

// ─── Documents ────────────────────────────────────────────────────────────────

export function useListDocuments(): UseQueryResult<Document[]> {
  return useQuery({
    queryKey: getListDocumentsQueryKey(),
    queryFn: () => apiFetch<Document[]>("/documents"),
  });
}

export function useCreateDocument(): UseMutationResult<
  Document,
  Error,
  { data: { title: string; type: string; content: string } }
> {
  return useMutation({
    mutationFn: ({ data }) =>
      apiFetch<Document>("/documents", { method: "POST", body: JSON.stringify(data) }),
  });
}

export function useGetDocument(
  id: number | undefined,
  options?: QueryOptions
): UseQueryResult<Document> {
  return useQuery({
    queryKey: options?.query?.queryKey ?? getGetDocumentQueryKey(id),
    queryFn: () => apiFetch<Document>(`/documents/${id}`),
    enabled: options?.query?.enabled ?? id !== undefined,
  });
}

export function useDeleteDocument(): UseMutationResult<void, Error, { id: number }> {
  return useMutation({
    mutationFn: ({ id }) => apiFetch<void>(`/documents/${id}`, { method: "DELETE" }),
  });
}

export function useChatWithDocument(): UseMutationResult<
  { answer: string },
  Error,
  { id: number; data: { question: string } }
> {
  return useMutation({
    mutationFn: ({ id, data }) =>
      apiFetch<{ answer: string }>(`/documents/${id}/chat`, { method: "POST", body: JSON.stringify(data) }),
  });
}
