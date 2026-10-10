import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, XCircle, Star, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";

const QUIZ_QUESTIONS = [
  {
    avatar: "einstein",
    name: "Einstein",
    img: "/einstein-avatar.jpg",
    color: "from-blue-600/20 to-cyan-600/20",
    border: "border-blue-500/40",
    subject: "Physics",
    question: "What does E=mc² mean in simple terms?",
    options: ["Energy equals mass times the speed of light squared", "Electricity equals magnetism times charge squared", "Energy is always zero at rest", "Mass and charge are equivalent"],
    correct: 0,
    explanation: "E=mc² shows that mass and energy are interchangeable — a tiny amount of mass contains an enormous amount of energy because c (speed of light) is so large!"
  },
  {
    avatar: "newton",
    name: "Newton",
    img: "/newton-avatar.jpg",
    color: "from-orange-600/20 to-amber-600/20",
    border: "border-orange-500/40",
    subject: "Physics",
    question: "If a force of 10N acts on a 2kg object, what is its acceleration?",
    options: ["20 m/s²", "5 m/s²", "0.2 m/s²", "12 m/s²"],
    correct: 1,
    explanation: "Using Newton's 2nd Law: F = ma, so a = F/m = 10N ÷ 2kg = 5 m/s². Always apply F=ma when you know force and mass!"
  },
  {
    avatar: "einstein",
    name: "Einstein",
    img: "/einstein-avatar.jpg",
    color: "from-blue-600/20 to-cyan-600/20",
    border: "border-blue-500/40",
    subject: "Space",
    question: "What is a black hole?",
    options: ["A dark star with no light", "A region where gravity is so strong nothing — not even light — can escape", "An empty region of space", "A collapsed neutron star with a moon"],
    correct: 1,
    explanation: "A black hole forms when massive stars collapse. The gravity becomes so extreme that the escape velocity exceeds the speed of light — nothing can escape!"
  },
  {
    avatar: "newton",
    name: "Newton",
    img: "/newton-avatar.jpg",
    color: "from-orange-600/20 to-amber-600/20",
    border: "border-orange-500/40",
    subject: "Mathematics",
    question: "What is the derivative of x³ with respect to x?",
    options: ["3x", "x²", "3x²", "x³/3"],
    correct: 2,
    explanation: "Using the power rule: d/dx(xⁿ) = n·xⁿ⁻¹. So d/dx(x³) = 3·x² = 3x². The power rule is one of the most important tools in calculus!"
  },
  {
    avatar: "einstein",
    name: "Einstein",
    img: "/einstein-avatar.jpg",
    color: "from-blue-600/20 to-cyan-600/20",
    border: "border-blue-500/40",
    subject: "Chemistry",
    question: "What is the pH of pure water at 25°C?",
    options: ["0", "14", "7", "5.6"],
    correct: 2,
    explanation: "Pure water is neutral with pH = 7. pH below 7 is acidic, above 7 is basic. The formula is pH = -log[H⁺]. At 25°C, water has equal H⁺ and OH⁻ concentrations."
  },
  {
    avatar: "newton",
    name: "Newton",
    img: "/newton-avatar.jpg",
    color: "from-orange-600/20 to-amber-600/20",
    border: "border-orange-500/40",
    subject: "Biology",
    question: "What is the powerhouse of the cell?",
    options: ["The nucleus", "The ribosome", "The mitochondria", "The cell membrane"],
    correct: 2,
    explanation: "The mitochondria produces ATP (adenosine triphosphate) through cellular respiration — the energy currency of the cell. Without mitochondria, cells couldn't sustain life!"
  },
  {
    avatar: "einstein",
    name: "Einstein",
    img: "/einstein-avatar.jpg",
    color: "from-blue-600/20 to-cyan-600/20",
    border: "border-blue-500/40",
    subject: "Mathematics",
    question: "What is the value of π (pi) approximately?",
    options: ["2.71828", "3.14159", "1.61803", "1.41421"],
    correct: 1,
    explanation: "π ≈ 3.14159... It's the ratio of a circle's circumference to its diameter. It's irrational — its decimal never repeats or terminates!"
  },
  {
    avatar: "newton",
    name: "Newton",
    img: "/newton-avatar.jpg",
    color: "from-orange-600/20 to-amber-600/20",
    border: "border-orange-500/40",
    subject: "Physics",
    question: "Which law states that every action has an equal and opposite reaction?",
    options: ["Newton's 1st Law", "Newton's 2nd Law", "Newton's 3rd Law", "Law of Gravitation"],
    correct: 2,
    explanation: "Newton's 3rd Law of Motion: For every action, there is an equal and opposite reaction. This is why rockets launch — gas expelled downward pushes the rocket upward!"
  },
];

const POPUP_INTERVAL = 4 * 60 * 1000; // 4 minutes
const INITIAL_DELAY = 90 * 1000; // 90 seconds on first visit

export function AiAvatarPopup() {
  const [visible, setVisible] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const initialTimer = setTimeout(() => {
      if (!dismissed) {
        const idx = Math.floor(Math.random() * QUIZ_QUESTIONS.length);
        setQuestionIndex(idx);
        setSelected(null);
        setSubmitted(false);
        setVisible(true);
      }
    }, INITIAL_DELAY);

    return () => clearTimeout(initialTimer);
  }, []);

  useEffect(() => {
    if (!visible && !dismissed) {
      const interval = setInterval(() => {
        const idx = Math.floor(Math.random() * QUIZ_QUESTIONS.length);
        setQuestionIndex(idx);
        setSelected(null);
        setSubmitted(false);
        setVisible(true);
      }, POPUP_INTERVAL);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [visible, dismissed]);

  const q = QUIZ_QUESTIONS[questionIndex];
  const isCorrect = submitted && selected === q.correct;

  const handleDismiss = () => {
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 80, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 80, scale: 0.92 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)]"
      >
        <div className={`rounded-2xl border ${q.border} bg-gradient-to-br ${q.color} backdrop-blur-xl shadow-2xl shadow-black/50 overflow-hidden`}>
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-white/10">
            <div className="relative">
              <img src={q.img} alt={q.name} className="w-12 h-12 rounded-xl object-cover border border-white/20 shadow-lg" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-background" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-sm">{q.name} Challenge</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Lightbulb className="w-3 h-3 text-yellow-400" />
                Quick quiz • {q.subject}
              </div>
            </div>
            <button onClick={handleDismiss} className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Question */}
          <div className="p-4 space-y-3">
            <p className="text-sm font-medium leading-relaxed">{q.question}</p>

            <div className="space-y-2">
              {q.options.map((opt, i) => {
                let cls = "w-full text-left text-xs p-2.5 rounded-lg border transition-all ";
                if (!submitted) {
                  cls += selected === i
                    ? "border-primary bg-primary/20 text-foreground"
                    : "border-white/10 bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground";
                } else {
                  if (i === q.correct) cls += "border-green-500 bg-green-500/15 text-green-400";
                  else if (selected === i) cls += "border-red-500 bg-red-500/15 text-red-400";
                  else cls += "border-white/5 bg-white/5 text-muted-foreground opacity-50";
                }
                return (
                  <button
                    key={i}
                    onClick={() => !submitted && setSelected(i)}
                    disabled={submitted}
                    className={cls}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span>{opt}</span>
                      {submitted && i === q.correct && <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />}
                      {submitted && i === selected && i !== q.correct && <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className={`text-xs p-3 rounded-lg ${isCorrect ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-blue-500/10 text-blue-300 border border-blue-500/20"}`}
              >
                <div className="font-bold mb-1 flex items-center gap-1">
                  {isCorrect ? <><Star className="w-3 h-3 text-yellow-400" /> +10 XP! Brilliant!</> : "Good try! Here's why:"}
                </div>
                {q.explanation}
              </motion.div>
            ) : (
              <Button
                size="sm"
                className="w-full"
                disabled={selected === null}
                onClick={() => setSubmitted(true)}
              >
                Submit Answer
              </Button>
            )}

            {submitted && (
              <button onClick={handleDismiss} className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1">
                Close
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
