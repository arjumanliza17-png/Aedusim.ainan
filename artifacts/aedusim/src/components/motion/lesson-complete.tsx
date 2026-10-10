/**
 * Lesson Completion Celebration
 * Score reveal + star burst + confetti — Duolingo/Brilliant inspired
 */
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Zap, RotateCcw, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScoreRing } from "./answer-feedback";
import { spring, ease } from "@/lib/motion";

function ConfettiPiece({ i }: { i: number }) {
  const angle = (i / 16) * 360;
  const dist  = 60 + Math.random() * 50;
  const x = Math.cos((angle * Math.PI) / 180) * dist;
  const y = Math.sin((angle * Math.PI) / 180) * dist;
  const colors = [
    "#3b82f6","#8b5cf6","#06b6d4","#10b981","#f59e0b","#ec4899","#f97316",
  ];

  return (
    <motion.div
      className="absolute w-2 h-2 rounded-sm"
      style={{
        background: colors[i % colors.length],
        top: "50%", left: "50%",
        rotate: Math.random() * 360,
      }}
      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
      animate={{ x, y, opacity: 0, scale: 0, rotate: Math.random() * 720 }}
      transition={{ duration: 0.9, ease: [0.0, 0.0, 0.2, 1], delay: 0.1 + i * 0.02 }}
    />
  );
}

interface LessonCompleteProps {
  show: boolean;
  xpEarned: number;
  totalModules: number;
  correctAnswers?: number;
  totalQuestions?: number;
  onContinue: () => void;
  onRetry?: () => void;
}

export function LessonComplete({
  show,
  xpEarned,
  totalModules,
  correctAnswers,
  totalQuestions,
  onContinue,
  onRetry,
}: LessonCompleteProps) {
  const score = totalQuestions
    ? Math.round((correctAnswers! / totalQuestions) * 100)
    : 100;

  const grade =
    score === 100 ? { label: "Perfect! 🎯", color: "#10b981" } :
    score >= 70   ? { label: "Great work! 🌟", color: "#3b82f6" } :
    score >= 50   ? { label: "Good effort 📘", color: "#f59e0b" } :
                    { label: "Keep going 💪", color: "#f97316" };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="lesson-complete"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />

          {/* Card */}
          <motion.div
            className="relative z-10 w-full max-w-sm bg-card border border-border/60 rounded-3xl p-6 text-center shadow-2xl overflow-hidden"
            initial={{ scale: 0.85, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 12 }}
            transition={spring.bouncy}
          >
            {/* Confetti burst */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {Array.from({ length: 16 }).map((_, i) => <ConfettiPiece key={i} i={i} />)}
            </div>

            {/* Trophy icon */}
            <motion.div
              className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center"
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ ...spring.bouncy, delay: 0.15 }}
            >
              <Trophy className="w-9 h-9 text-primary" />
            </motion.div>

            {/* Title */}
            <motion.h2
              className="text-2xl font-bold mb-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.3 }}
            >
              Lesson Complete!
            </motion.h2>
            <motion.p
              className="text-sm text-muted-foreground mb-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.32 }}
            >
              {grade.label}
            </motion.p>

            {/* Score ring + stats */}
            <motion.div
              className="flex items-center justify-center gap-8 mb-6"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38 }}
            >
              {/* Ring */}
              <div className="relative flex items-center justify-center">
                <ScoreRing score={score} size={88} color={grade.color} />
                <div className="absolute text-center">
                  <div className="text-xl font-bold">{score}%</div>
                  <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Score</div>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-3 text-left">
                <div>
                  <div className="flex items-center gap-1.5 text-primary font-bold text-lg">
                    <Zap className="w-4 h-4" fill="currentColor" />
                    +{xpEarned} XP
                  </div>
                  <div className="text-[10px] text-muted-foreground">Earned this lesson</div>
                </div>
                <div>
                  <div className="font-semibold text-sm">{totalModules} modules</div>
                  <div className="text-[10px] text-muted-foreground">Completed</div>
                </div>
                {totalQuestions && (
                  <div>
                    <div className="font-semibold text-sm">{correctAnswers}/{totalQuestions}</div>
                    <div className="text-[10px] text-muted-foreground">Correct answers</div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* CTA buttons */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.48 }}
            >
              <Button
                onClick={onContinue}
                className="w-full gap-2 bg-primary hover:bg-primary/90 font-semibold"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </Button>
              {onRetry && (
                <Button variant="ghost" onClick={onRetry} className="w-full gap-2 text-muted-foreground text-sm">
                  <RotateCcw className="w-3.5 h-3.5" /> Retry lesson
                </Button>
              )}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
