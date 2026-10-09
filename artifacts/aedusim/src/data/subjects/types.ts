// ─── Shared Types for All Subject Files ───────────────────────────────────────

export type Level =
  | "foundations"
  | "core"
  | "applications"
  | "advanced"
  | "expert"
  | "research"
  | "olympiad";

export interface Problem {
  id: string;
  difficulty: "easy" | "medium" | "hard" | "challenge" | "olympiad";
  type: "mcq" | "short" | "numerical";
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
}

export interface Example {
  title: string;
  given: string;
  solution: string[];
  answer: string;
}

export type Block =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "formula"; label?: string; text: string }
  | { type: "list"; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "callout"; variant: "info" | "tip" | "warning" | "key"; text: string }
  | { type: "image"; url: string; caption?: string; alt: string }
  | { type: "divider" };

export interface Topic {
  slug: string;
  name: string;
  description: string;
  estimatedMinutes: number;
  xpReward: number;
  hasSimulation?: boolean;
  simulationType?: string;
  theory: Block[];
  keyFormulas?: string[];
  examples: Example[];
  problems: Problem[];
}

export interface Chapter {
  slug: string;
  name: string;
  description: string;
  level: Level;
  topics: Topic[];
}

export interface Subject {
  slug: string;
  name: string;
  emoji: string;
  color: string;
  gradient: string;
  description: string;
  chapters: Chapter[];
}

export const LEVEL_CONFIG: Record<Level, { label: string; color: string; bg: string }> = {
  foundations:  { label: "Foundations",   color: "#6366f1", bg: "#6366f115" },
  core:         { label: "Core Concepts", color: "#8b5cf6", bg: "#8b5cf615" },
  applications: { label: "Applications",  color: "#06b6d4", bg: "#06b6d415" },
  advanced:     { label: "Advanced",      color: "#f59e0b", bg: "#f59e0b15" },
  expert:       { label: "Expert",        color: "#ef4444", bg: "#ef444415" },
  research:     { label: "Research",      color: "#ec4899", bg: "#ec489915" },
  olympiad:     { label: "Olympiad",      color: "#10b981", bg: "#10b98115" },
};
