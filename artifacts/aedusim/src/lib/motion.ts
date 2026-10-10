/**
 * Aedusim Premium Motion System
 * Inspired by Duolingo, Brilliant, Apple, Linear
 * Physics-based, 60fps, mobile-first
 */
import type { Variants, Transition } from "framer-motion";

// ─── Easings ──────────────────────────────────────────────────────────────────

export const ease = {
  out:       [0.0, 0.0, 0.2, 1.0] as const,
  in:        [0.4, 0.0, 1.0, 1.0] as const,
  inOut:     [0.4, 0.0, 0.2, 1.0] as const,
  spring:    [0.43, 0.13, 0.23, 0.96] as const,
  overshoot: [0.34, 1.56, 0.64, 1.0] as const,
  sharp:     [0.4, 0.0, 0.6, 1.0] as const,
};

// ─── Spring Configs ───────────────────────────────────────────────────────────

export const spring = {
  snap:    { type: "spring", stiffness: 700, damping: 36, mass: 0.8 } satisfies Transition,
  snappy:  { type: "spring", stiffness: 500, damping: 30, mass: 1   } satisfies Transition,
  gentle:  { type: "spring", stiffness: 260, damping: 24, mass: 1   } satisfies Transition,
  bouncy:  { type: "spring", stiffness: 380, damping: 18, mass: 0.8 } satisfies Transition,
  slow:    { type: "spring", stiffness: 110, damping: 20, mass: 1   } satisfies Transition,
  micro:   { type: "spring", stiffness: 600, damping: 32, mass: 0.6 } satisfies Transition,
};

// ─── Durations ────────────────────────────────────────────────────────────────

export const dur = {
  instant: 0.08,
  fast:    0.15,
  normal:  0.25,
  slow:    0.40,
  glacial: 0.65,
};

// ─── Page Transitions ─────────────────────────────────────────────────────────

/** Slide-up + blur — primary page entrance (Apple-style) */
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 14, filter: "blur(6px)" },
  animate: {
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { duration: dur.slow, ease: ease.out },
  },
  exit: {
    opacity: 0, y: -8, filter: "blur(3px)",
    transition: { duration: dur.normal, ease: ease.in },
  },
};

/** Slide-right — drill-down transition (topic → lesson) */
export const drillVariants: Variants = {
  initial: { opacity: 0, x: 28 },
  animate: { opacity: 1, x: 0, transition: spring.gentle },
  exit:    { opacity: 0, x: -18, transition: { duration: dur.normal, ease: ease.in } },
};

/** Slide-left — back navigation */
export const backVariants: Variants = {
  initial: { opacity: 0, x: -28 },
  animate: { opacity: 1, x: 0, transition: spring.gentle },
  exit:    { opacity: 0, x: 18, transition: { duration: dur.normal, ease: ease.in } },
};

// ─── Card / List Animations ──────────────────────────────────────────────────

/** Stagger container — wraps a list of stagger children */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.04 },
  },
};

/** Stagger child item — card, list row, etc. */
export const staggerItem: Variants = {
  hidden:   { opacity: 0, y: 20, scale: 0.97 },
  visible:  { opacity: 1, y: 0, scale: 1, transition: spring.gentle },
};

/** Scale-pop — modals, cards expanding (Brilliant-style) */
export const scalePop: Variants = {
  initial: { scale: 0.93, opacity: 0, y: 10 },
  animate: { scale: 1, opacity: 1, y: 0, transition: spring.bouncy },
  exit:    { scale: 0.95, opacity: 0, y: 6, transition: { duration: dur.fast, ease: ease.in } },
};

/** Fade-slide — gentle content reveal */
export const fadeSlide: Variants = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: dur.normal, ease: ease.out } },
};

// ─── Interactive Microinteractions ────────────────────────────────────────────

/** Tap / click press — buttons, cards */
export const tapPress = { scale: 0.965 };

/** Hover lift — cards (Linear-style) */
export const hoverLift = {
  scale: 1.015,
  y: -2,
  transition: spring.micro,
};

/** Hover glow pulse — icon buttons */
export const hoverGlow = {
  scale: 1.08,
  transition: spring.micro,
};

// ─── Quiz / Answer Animations ─────────────────────────────────────────────────

/** Correct answer — green ring pulse + scale */
export const correctAnswer: Variants = {
  idle:    { scale: 1, boxShadow: "0 0 0px 0px rgba(34,197,94,0)" },
  correct: {
    scale: [1, 1.025, 1],
    boxShadow: [
      "0 0 0px 0px rgba(34,197,94,0)",
      "0 0 0px 10px rgba(34,197,94,0.25)",
      "0 0 0px 0px rgba(34,197,94,0)",
    ],
    transition: { duration: 0.55, ease: ease.out },
  },
};

/** Wrong answer — horizontal shake */
export const wrongAnswer: Variants = {
  idle:  { x: 0 },
  wrong: {
    x: [0, -7, 6, -5, 4, -2, 0],
    transition: { duration: 0.45, ease: ease.sharp },
  },
};

// ─── XP / Reward Animations ──────────────────────────────────────────────────

/** XP badge floats up and fades */
export const xpFloat: Variants = {
  initial: { opacity: 0, y: 0, scale: 0.5 },
  animate: {
    opacity: [0, 1, 1, 0],
    y: [0, -18, -42, -64],
    scale: [0.5, 1.25, 1.05, 0.8],
    transition: { duration: 1.3, ease: ease.out, times: [0, 0.15, 0.7, 1] },
  },
};

/** Star burst — lesson completion */
export const starBurst: Variants = {
  initial: { scale: 0, opacity: 0, rotate: -15 },
  animate: {
    scale: 1, opacity: 1, rotate: 0,
    transition: { ...spring.bouncy, delay: 0.15 },
  },
};

/** Lesson complete card reveal */
export const completeReveal: Variants = {
  initial: { scale: 0.88, opacity: 0, y: 20 },
  animate: {
    scale: 1, opacity: 1, y: 0,
    transition: { ...spring.bouncy, delay: 0.1 },
  },
};

// ─── Progress Bar ─────────────────────────────────────────────────────────────

/** Animated fill — call as a function */
export const progressFill = (pct: number, delay = 0.3): Variants => ({
  initial: { width: "0%" },
  animate: {
    width: `${pct}%`,
    transition: { duration: 0.9, ease: ease.out, delay },
  },
});

// ─── Loading States ───────────────────────────────────────────────────────────

/** Skeleton shimmer pulse */
export const shimmer: Variants = {
  initial: { opacity: 0.5 },
  animate: {
    opacity: [0.5, 0.9, 0.5],
    transition: { duration: 1.6, repeat: Infinity, ease: "easeInOut" },
  },
};

// ─── Notification / Toast ─────────────────────────────────────────────────────

export const notifVariants: Variants = {
  initial: { opacity: 0, x: 28, scale: 0.94 },
  animate: { opacity: 1, x: 0, scale: 1, transition: spring.snappy },
  exit:    { opacity: 0, x: 28, scale: 0.94, transition: { duration: dur.fast } },
};

// ─── AI Message ───────────────────────────────────────────────────────────────

export const messageVariants: Variants = {
  initial: { opacity: 0, y: 10, scale: 0.98 },
  animate: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: dur.normal, ease: ease.out },
  },
};

// ─── Bookmark / Toggle ────────────────────────────────────────────────────────

export const bookmarkVariants: Variants = {
  unbookmarked: { scale: 1, rotate: 0 },
  bookmarked: {
    scale: [1, 1.35, 0.9, 1.1, 1],
    rotate: [0, -10, 5, -3, 0],
    transition: { duration: 0.45, ease: ease.spring },
  },
};
