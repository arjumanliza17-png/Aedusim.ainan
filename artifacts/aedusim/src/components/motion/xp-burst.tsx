/**
 * XP Reward Burst Animation
 * Flying "+XP" badge that rises and fades — Duolingo-inspired
 */
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap } from "lucide-react";

interface XpBurstProps {
  amount: number;
  show: boolean;
  onDone?: () => void;
}

export function XpBurst({ amount, show, onDone }: XpBurstProps) {
  return (
    <AnimatePresence onExitComplete={onDone}>
      {show && (
        <motion.div
          key="xp-burst"
          initial={{ opacity: 0, y: 0, scale: 0.4 }}
          animate={{
            opacity: [0, 1, 1, 0],
            y: [0, -16, -44, -72],
            scale: [0.4, 1.3, 1.1, 0.85],
          }}
          transition={{ duration: 1.4, ease: [0.0, 0.0, 0.2, 1], times: [0, 0.14, 0.7, 1] }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
        >
          <div className="flex items-center gap-1 bg-primary text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg shadow-primary/40">
            <Zap className="w-3.5 h-3.5" fill="currentColor" />
            +{amount} XP
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Inline XP counter that ticks up ─────────────────────────────────────────

interface XpCounterProps {
  from: number;
  to: number;
  duration?: number;
}

export function XpCounter({ from, to, duration = 1.2 }: XpCounterProps) {
  const [value, setValue] = useState(from);

  useEffect(() => {
    const start = performance.now();
    const diff = to - from;

    const tick = (now: number) => {
      const elapsed = (now - start) / (duration * 1000);
      const progress = Math.min(1, elapsed);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(from + diff * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [from, to, duration]);

  return <span>{value}</span>;
}

// ─── Floating confetti particle ───────────────────────────────────────────────

function Confetti({ index }: { index: number }) {
  const angle = (index / 8) * Math.PI * 2;
  const dist = 40 + Math.random() * 30;
  const x = Math.cos(angle) * dist;
  const y = Math.sin(angle) * dist;
  const colors = ["#3b82f6", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b"];
  const color = colors[index % colors.length];

  return (
    <motion.div
      className="absolute w-1.5 h-1.5 rounded-full"
      style={{ background: color, top: "50%", left: "50%" }}
      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
      animate={{
        x, y,
        opacity: 0,
        scale: [1, 1.5, 0],
      }}
      transition={{ duration: 0.7, ease: [0.0, 0.0, 0.2, 1], delay: 0.05 }}
    />
  );
}

interface LessonXpCelebrationProps {
  xp: number;
  show: boolean;
  onDone?: () => void;
}

export function LessonXpCelebration({ xp, show, onDone }: LessonXpCelebrationProps) {
  return (
    <AnimatePresence onExitComplete={onDone}>
      {show && (
        <motion.div
          key="celebration"
          className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none"
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
        >
          {/* Confetti */}
          <div className="relative">
            {Array.from({ length: 8 }).map((_, i) => (
              <Confetti key={i} index={i} />
            ))}
          </div>

          {/* XP badge */}
          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: [0.3, 1.4, 1], opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            className="absolute flex flex-col items-center gap-2"
          >
            <div className="text-5xl">⭐</div>
            <div className="bg-primary text-white font-bold text-lg px-5 py-2.5 rounded-2xl shadow-xl shadow-primary/30">
              +{xp} XP
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
