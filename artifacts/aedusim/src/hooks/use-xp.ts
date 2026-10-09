import { useState, useEffect, useCallback } from "react";

export interface TopicProgress {
  completed: boolean;
  xp: number;
  completedAt: string;
  modulesDone: number;
}

export interface XPState {
  totalXp: number;
  level: number;
  topics: Record<string, TopicProgress>;
  lastTopic: { subject: string; topic: string } | null;
  streak: number;
  lastActiveDate: string;
}

const XP_PER_MODULE = 25;
const XP_PER_QUIZ_CORRECT = 15;
const XP_PER_COMPLETION = 50;

const LEVEL_THRESHOLDS = [0, 100, 250, 500, 900, 1400, 2000, 2800, 3800, 5000];

function getLevel(xp: number): number {
  let lv = 1;
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) lv = i + 1;
    else break;
  }
  return lv;
}

function getXpToNext(xp: number): { current: number; needed: number; pct: number } {
  const lv = getLevel(xp);
  const from = LEVEL_THRESHOLDS[lv - 1] || 0;
  const to = LEVEL_THRESHOLDS[lv] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  const current = xp - from;
  const needed = to - from;
  return { current, needed, pct: Math.min(100, Math.round((current / needed) * 100)) };
}

const DEFAULT_STATE: XPState = {
  totalXp: 0,
  level: 1,
  topics: {},
  lastTopic: null,
  streak: 0,
  lastActiveDate: "",
};

function loadState(): XPState {
  try {
    const raw = localStorage.getItem("aedusim_xp");
    if (raw) return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {}
  return { ...DEFAULT_STATE };
}

function saveState(s: XPState) {
  localStorage.setItem("aedusim_xp", JSON.stringify(s));
}

export function useXP() {
  const [state, setState] = useState<XPState>(loadState);

  const persist = useCallback((next: XPState) => {
    setState(next);
    saveState(next);
  }, []);

  // Update streak on mount
  useEffect(() => {
    const today = new Date().toDateString();
    if (state.lastActiveDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const newStreak = state.lastActiveDate === yesterday ? state.streak + 1 : 1;
      persist({ ...state, streak: newStreak, lastActiveDate: today });
    }
  }, []);

  const awardModuleXP = useCallback((subject: string, topic: string) => {
    const key = `${subject}::${topic}`;
    const existing = state.topics[key] || { completed: false, xp: 0, completedAt: "", modulesDone: 0 };
    const newModulesDone = existing.modulesDone + 1;
    const gain = XP_PER_MODULE;
    const newTotal = state.totalXp + gain;
    const next: XPState = {
      ...state,
      totalXp: newTotal,
      level: getLevel(newTotal),
      lastTopic: { subject, topic },
      topics: {
        ...state.topics,
        [key]: { ...existing, xp: existing.xp + gain, modulesDone: newModulesDone },
      },
    };
    persist(next);
    return gain;
  }, [state, persist]);

  const awardQuizXP = useCallback((correct: number) => {
    const gain = correct * XP_PER_QUIZ_CORRECT;
    const newTotal = state.totalXp + gain;
    const next: XPState = { ...state, totalXp: newTotal, level: getLevel(newTotal) };
    persist(next);
    return gain;
  }, [state, persist]);

  const completeTopic = useCallback((subject: string, topic: string) => {
    const key = `${subject}::${topic}`;
    const existing = state.topics[key] || { completed: false, xp: 0, completedAt: "", modulesDone: 0 };
    const gain = XP_PER_COMPLETION;
    const newTotal = state.totalXp + gain;
    const next: XPState = {
      ...state,
      totalXp: newTotal,
      level: getLevel(newTotal),
      topics: {
        ...state.topics,
        [key]: { ...existing, completed: true, xp: existing.xp + gain, completedAt: new Date().toISOString() },
      },
    };
    persist(next);
    return gain;
  }, [state, persist]);

  const isTopicDone = useCallback((subject: string, topic: string) => {
    return !!state.topics[`${subject}::${topic}`]?.completed;
  }, [state]);

  const getTopicProgress = useCallback((subject: string, topic: string) => {
    return state.topics[`${subject}::${topic}`] || null;
  }, [state]);

  return {
    state,
    getXpToNext: () => getXpToNext(state.totalXp),
    awardModuleXP,
    awardQuizXP,
    completeTopic,
    isTopicDone,
    getTopicProgress,
  };
}
