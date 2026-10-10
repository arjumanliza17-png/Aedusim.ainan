/**
 * Answer Feedback Animations
 * Correct: green ring pulse + scale
 * Wrong: horizontal shake + red flash
 */
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";

interface AnswerFeedbackProps {
  state: "idle" | "correct" | "wrong";
  children: React.ReactNode;
  className?: string;
}

export function AnswerFeedback({ state, children, className = "" }: AnswerFeedbackProps) {
  return (
    <motion.div
      className={`relative ${className}`}
      animate={
        state === "correct"
          ? {
              scale: [1, 1.025, 0.995, 1],
              boxShadow: [
                "0 0 0px 0px rgba(34,197,94,0)",
                "0 0 0px 12px rgba(34,197,94,0.22)",
                "0 0 0px 6px rgba(34,197,94,0.1)",
                "0 0 0px 0px rgba(34,197,94,0)",
              ],
              transition: { duration: 0.55 },
            }
          : state === "wrong"
          ? {
              x: [0, -8, 7, -6, 5, -3, 1, 0],
              boxShadow: [
                "0 0 0px 0px rgba(239,68,68,0)",
                "0 0 0px 10px rgba(239,68,68,0.2)",
                "0 0 0px 0px rgba(239,68,68,0)",
              ],
              transition: { duration: 0.5 },
            }
          : { scale: 1, x: 0 }
      }
    >
      {children}
    </motion.div>
  );
}

// ─── Fullscreen overlay flash ─────────────────────────────────────────────────

interface ResultFlashProps {
  show: boolean;
  correct: boolean;
  onDone?: () => void;
}

export function ResultFlash({ show, correct, onDone }: ResultFlashProps) {
  return (
    <AnimatePresence onExitComplete={onDone}>
      {show && (
        <motion.div
          key="flash"
          className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.18, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          style={{ background: correct ? "rgba(34,197,94,1)" : "rgba(239,68,68,1)" }}
        />
      )}
    </AnimatePresence>
  );
}

// ─── Inline answer state icon ─────────────────────────────────────────────────

export function AnswerIcon({ correct }: { correct: boolean }) {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -20 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 22, delay: 0.05 }}
    >
      {correct
        ? <CheckCircle2 className="w-5 h-5 text-green-400" />
        : <XCircle className="w-5 h-5 text-red-400" />
      }
    </motion.div>
  );
}

// ─── Progress ring for quiz score ─────────────────────────────────────────────

interface ScoreRingProps {
  score: number;      // 0–100
  size?: number;
  strokeWidth?: number;
  color?: string;
}

export function ScoreRing({ score, size = 80, strokeWidth = 6, color = "#3b82f6" }: ScoreRingProps) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={strokeWidth}
      />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.1, ease: [0.0, 0.0, 0.2, 1], delay: 0.3 }}
      />
    </svg>
  );
}
