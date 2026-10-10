/**
 * Loading Screen & Skeleton States
 * App launch, lesson loading, AI thinking
 */
import { motion, AnimatePresence } from "framer-motion";
import { spring, shimmer } from "@/lib/motion";

// ─── App Launch Screen ────────────────────────────────────────────────────────

interface AppLoadingProps {
  show: boolean;
}

export function AppLoadingScreen({ show }: AppLoadingProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="app-loading"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
          exit={{ opacity: 0, scale: 1.04, filter: "blur(8px)" }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Logo */}
          <motion.div
            className="relative mb-8"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={spring.bouncy}
          >
            <motion.div
              className="absolute inset-0 rounded-full bg-primary/20 blur-xl"
              animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <img
              src="/aedusim-brand-logo.png"
              alt="Aedusim"
              className="w-36 h-36 object-contain rounded-2xl relative z-10 shadow-[0_0_40px_rgba(236,72,153,0.35)]"
            />
          </motion.div>

          {/* Brand name */}
          <motion.h1
            className="text-2xl font-bold tracking-tight mb-2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            Aedusim
          </motion.h1>
          <motion.p
            className="text-sm text-muted-foreground mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            Your intelligent learning universe
          </motion.p>

          {/* Progress dots */}
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-primary"
                animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Lesson Loading Skeleton ──────────────────────────────────────────────────

export function LessonSkeleton() {
  return (
    <div className="space-y-4 p-5">
      {[1, 2].map((i) => (
        <motion.div
          key={i}
          className="rounded-2xl border border-border/40 bg-card/50 p-5 space-y-3"
          variants={shimmer}
          initial="initial"
          animate="animate"
          style={{ animationDelay: `${i * 200}ms` }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-border/40" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-border/40 rounded w-2/3" />
              <div className="h-2.5 bg-border/30 rounded w-1/3" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-border/30 rounded w-full" />
            <div className="h-3 bg-border/30 rounded w-5/6" />
            <div className="h-3 bg-border/30 rounded w-4/6" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── AI Thinking Indicator ────────────────────────────────────────────────────

export function AiThinkingDots() {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-primary"
          animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.16, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// ─── Animated Progress Bar ────────────────────────────────────────────────────

interface AnimatedProgressProps {
  value: number;
  max?: number;
  color?: string;
  height?: string;
  showLabel?: boolean;
  delay?: number;
}

export function AnimatedProgress({
  value, max = 100,
  color = "bg-primary",
  height = "h-2",
  showLabel = false,
  delay = 0.3,
}: AnimatedProgressProps) {
  const pct = Math.min(100, (value / max) * 100);

  return (
    <div className="w-full space-y-1">
      {showLabel && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{value}</span>
          <span>{max}</span>
        </div>
      )}
      <div className={`w-full ${height} bg-border/40 rounded-full overflow-hidden`}>
        <motion.div
          className={`h-full ${color} rounded-full origin-left`}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: pct / 100 }}
          transition={{ duration: 0.9, ease: [0.0, 0.0, 0.2, 1], delay }}
        />
      </div>
    </div>
  );
}

// ─── Section Load Reveal ──────────────────────────────────────────────────────

interface SectionRevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function SectionReveal({ children, delay = 0, className = "" }: SectionRevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.0, 0.0, 0.2, 1], delay }}
    >
      {children}
    </motion.div>
  );
}
