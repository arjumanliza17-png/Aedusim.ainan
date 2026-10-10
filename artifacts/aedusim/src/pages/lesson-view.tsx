import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, ArrowRight, CheckCircle2, ChevronDown, Clock, Zap,
  BookOpen, FlaskConical, Target, Trophy, BarChart2, ChevronRight,
  XCircle, Lightbulb, AlertTriangle, Info,
} from "lucide-react";
import {
  getTopic, isTopicUnlocked,
  type Block, type Topic, type Chapter, type Subject, type Example, type Problem,
} from "@/data/subjects";
import { ThermodynamicsSim, ProjectileSim, WaveSim, CircuitSim } from "@/components/lesson/simulation-canvas";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TopicProgress {
  status: string;
  mastery: number;
  quizScore: number | null;
  problemsCorrect: number;
  problemsTotal: number;
  timeSpentSeconds: number;
  lastSection: string | null;
  completedAt: string | null;
}

// ─── API ──────────────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(res.statusText);
  if (res.status === 204) return undefined as unknown as T;
  return res.json();
}

// ─── Theory Block Renderer ────────────────────────────────────────────────────

function TheoryBlock({ block }: { block: Block }) {
  switch (block.type) {
    case "heading":
      return block.level === 2
        ? <h2 className="text-lg font-bold text-foreground mt-6 mb-3 first:mt-0">{block.text}</h2>
        : <h3 className="text-base font-semibold text-foreground mt-4 mb-2">{block.text}</h3>;

    case "paragraph":
      return (
        <p className="text-sm text-foreground/85 leading-relaxed mb-3"
          dangerouslySetInnerHTML={{
            __html: block.text
              .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
              .replace(/\*(.+?)\*/g, "<em>$1</em>"),
          }}
        />
      );

    case "formula":
      return (
        <div className="my-4 rounded-xl border border-primary/20 bg-primary/5 px-5 py-3 flex items-center gap-4">
          {block.label && (
            <span className="text-[10px] font-bold text-primary uppercase tracking-wide shrink-0">{block.label}</span>
          )}
          <code className="text-base font-mono font-semibold text-foreground">{block.text}</code>
        </div>
      );

    case "callout": {
      const configs = {
        key: { icon: Target, color: "#6366f1", bg: "#6366f108" },
        info: { icon: Info, color: "#06b6d4", bg: "#06b6d408" },
        tip: { icon: Lightbulb, color: "#f59e0b", bg: "#f59e0b08" },
        warning: { icon: AlertTriangle, color: "#ef4444", bg: "#ef444408" },
      };
      const cfg = configs[block.variant] ?? configs.info;
      const Icon = cfg.icon;
      return (
        <div className="my-4 rounded-xl border p-4 flex gap-3"
          style={{ borderColor: cfg.color + "30", background: cfg.bg }}>
          <Icon className="w-4 h-4 shrink-0 mt-0.5" style={{ color: cfg.color }} />
          <p className="text-sm leading-relaxed" style={{ color: cfg.color + "cc" }}
            dangerouslySetInnerHTML={{
              __html: block.text
                .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
                .replace(/\*(.+?)\*/g, "<em>$1</em>"),
            }}
          />
        </div>
      );
    }

    case "list":
      return (
        <ul className="my-3 space-y-1.5 ml-2">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0 mt-1.5" />
              <span dangerouslySetInnerHTML={{
                __html: item
                  .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
                  .replace(/\*(.+?)\*/g, "<em>$1</em>"),
              }} />
            </li>
          ))}
        </ul>
      );

    case "table":
      return (
        <div className="my-4 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border/60">
                {block.headers.map((h) => (
                  <th key={h} className="px-3 py-2 text-left text-xs font-bold text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr key={ri} className="border-b border-border/30 hover:bg-muted/20">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-3 py-2 text-foreground/80">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "divider":
      return <hr className="my-5 border-border/40" />;

    default:
      return null;
  }
}

// ─── Example Card ─────────────────────────────────────────────────────────────

function ExampleCard({ example, index }: { example: Example; index: number }) {
  const [open, setOpen] = useState(index === 0);
  return (
    <div className="rounded-xl border border-border/50 bg-card/60 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 flex items-center justify-between gap-3 hover:bg-muted/20 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/15 text-primary">
            Example {index + 1}
          </span>
          <span className="text-sm font-medium text-foreground text-left">{example.title}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-border/30">
              <div className="pt-3">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Problem</div>
                <p className="text-sm text-foreground/85 leading-relaxed bg-muted/30 rounded-lg px-3 py-2">{example.given}</p>
              </div>
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Solution</div>
                <div className="space-y-1.5">
                  {example.solution.map((step, i) => (
                    <div key={i} className="flex gap-2 text-sm">
                      <span className="text-muted-foreground/50 shrink-0 mt-0.5">→</span>
                      <span className="font-mono text-foreground/80">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-lg bg-primary/8 border border-primary/20 px-3 py-2">
                <span className="text-xs font-bold text-primary mr-2">Answer:</span>
                <span className="text-sm font-mono font-semibold text-foreground">{example.answer}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Problem Card ─────────────────────────────────────────────────────────────

const DIFF_COLOR: Record<string, string> = {
  easy: "#22c55e", medium: "#f59e0b", hard: "#ef4444", challenge: "#8b5cf6", olympiad: "#ec4899",
};

function isProblemAnswerCorrect(problem: Problem, selected: number | null, typedAnswer: string): boolean {
  if (problem.options) return selected !== null && problem.options[selected] === problem.answer;

  const submitted = typedAnswer.trim().toLowerCase().replace(/,/g, "");
  const expected = problem.answer.trim().toLowerCase().replace(/,/g, "");
  if (!submitted) return false;
  if (submitted === expected || expected.includes(submitted)) return true;

  const typedNumber = Number(submitted.replace(/[^0-9.+-]/g, ""));
  const expectedNumbers = expected.match(/-?\d+(?:\.\d+)?/g);
  const expectedNumber = expectedNumbers ? Number(expectedNumbers[expectedNumbers.length - 1]) : NaN;
  return Number.isFinite(typedNumber) && Number.isFinite(expectedNumber)
    && Math.abs(typedNumber - expectedNumber) <= Math.max(0.05, Math.abs(expectedNumber) * 0.02);
}

function ProblemCard({ problem, index, onAnswer, onContinue, isLast }: {
  problem: Problem;
  index: number;
  onAnswer: (correct: boolean) => void;
  onContinue: () => void;
  isLast: boolean;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const color = DIFF_COLOR[problem.difficulty] ?? "#64748b";

  const handleSubmit = () => {
    if (problem.options ? selected === null : !typedAnswer.trim()) return;
    const correct = isProblemAnswerCorrect(problem, selected, typedAnswer);
    setSubmitted(true);
    setIsCorrect(correct);
    onAnswer(correct);
  };

  return (
    <div className="rounded-xl border border-border/50 bg-card/60 overflow-hidden">
      <div className="px-4 py-3 border-b border-border/30 flex items-center gap-2">
        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full capitalize"
          style={{ background: color + "20", color }}>
          {problem.difficulty}
        </span>
        <span className="text-[10px] text-muted-foreground">Problem {index + 1}</span>
      </div>
      <div className="p-4 space-y-3">
        <p className="text-sm font-medium text-foreground leading-relaxed">{problem.question}</p>
        {problem.options ? (
          <div className="grid grid-cols-2 gap-2">
          {problem.options.map((opt, oi) => {
            const isSelected = selected === oi;
            const isCorrect = opt === problem.answer;
            let cls = "border-border/40 bg-background/50 hover:bg-accent/40 cursor-pointer";
            if (submitted) {
              if (isCorrect) cls = "border-green-500/60 bg-green-500/10 text-green-300";
              else if (isSelected) cls = "border-red-500/60 bg-red-500/10 text-red-300";
              else cls = "border-border/20 opacity-40";
            } else if (isSelected) {
              cls = "border-primary/60 bg-primary/10";
            }
            return (
              <button
                key={oi}
                disabled={submitted}
                onClick={() => !submitted && setSelected(oi)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-left text-sm transition-all ${cls}`}
              >
                <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold shrink-0 ${
                  submitted && isCorrect ? "bg-green-500 border-green-500 text-white"
                  : submitted && isSelected ? "bg-red-500 border-red-500 text-white"
                  : isSelected ? "bg-primary/20 border-primary text-primary"
                  : "border-border/60 text-muted-foreground"
                }`}>
                  {String.fromCharCode(65 + oi)}
                </span>
                <span className="flex-1 text-xs leading-snug">{opt}</span>
                {submitted && isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />}
                {submitted && isSelected && !isCorrect && <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />}
              </button>
            );
          })}
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground" htmlFor={`answer-${problem.id}`}>
              Your answer
            </label>
            <input
              id={`answer-${problem.id}`}
              value={typedAnswer}
              onChange={(event) => setTypedAnswer(event.target.value)}
              disabled={submitted}
              placeholder="Type a number or short answer"
              className="w-full rounded-lg border border-border/50 bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-primary disabled:opacity-60"
            />
          </div>
        )}
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-lg px-3 py-2 text-xs ${isCorrect ? "bg-green-500/8 text-green-400 border border-green-500/20" : "bg-red-500/8 text-red-400 border border-red-500/20"}`}
          >
            <span className="font-semibold mr-1">{isCorrect ? "Correct!" : "Incorrect."}</span>
            {problem.explanation}
          </motion.div>
        )}
        {!submitted && (
          <button
            onClick={handleSubmit}
            disabled={problem.options ? selected === null : !typedAnswer.trim()}
            className="w-full py-2 rounded-lg bg-primary text-white text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            Check Answer
          </button>
        )}
        {submitted && (
          <button
            onClick={onContinue}
            className="w-full py-2 rounded-lg border border-primary/30 bg-primary/10 text-primary text-xs font-semibold transition-colors hover:bg-primary/20"
          >
            {isLast ? "Finish Quiz" : "Next Question"}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Simulation Renderer ──────────────────────────────────────────────────────

function SimulationSection({ simulationType }: { simulationType: string }) {
  const sims: Record<string, React.ComponentType> = {
    projectile: ProjectileSim,
    wave: WaveSim,
    circuit: CircuitSim,
    thermodynamics: ThermodynamicsSim,
  };
  const Sim = sims[simulationType];
  if (!Sim) return null;
  return (
    <div className="rounded-xl border border-border/50 bg-card/60 overflow-hidden">
      <div className="px-4 py-3 border-b border-border/30 flex items-center gap-2">
        <FlaskConical className="w-4 h-4 text-primary" />
        <span className="font-semibold text-sm">Interactive Simulation</span>
      </div>
      <div className="p-4">
        <Sim />
      </div>
    </div>
  );
}

// ─── Section Nav ──────────────────────────────────────────────────────────────

type Section = "theory" | "simulation" | "examples" | "problems" | "complete";

function SectionNav({ sections, current, onSelect, completedSections }: {
  sections: { id: Section; label: string; icon: React.ElementType }[];
  current: Section;
  onSelect: (s: Section) => void;
  completedSections: Set<Section>;
}) {
  const firstIncomplete = sections.findIndex(({ id }) => !completedSections.has(id));

  return (
    <div className="flex gap-1 bg-card/60 rounded-xl border border-border/40 p-1 mb-6 overflow-x-auto">
      {sections.map(({ id, label, icon: Icon }, index) => {
        const isActive = id === current;
        const isDone = completedSections.has(id);
        const isAvailable = index <= firstIncomplete || firstIncomplete === -1;
        return (
          <button
            key={id}
            disabled={!isAvailable}
            onClick={() => isAvailable && onSelect(id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              isActive
                ? "bg-primary text-white shadow-sm"
                : isAvailable
                ? "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                : "text-muted-foreground/30 cursor-not-allowed"
            }`}
          >
            {!isAvailable
              ? <span className="text-[10px]">🔒</span>
              : isDone && !isActive
              ? <CheckCircle2 className="w-3 h-3 text-green-400" />
              : <Icon className="w-3 h-3" />}
            {label}
          </button>
        );
      })}
    </div>
  );
}

// ─── XP Popup ────────────────────────────────────────────────────────────────

function XPPopup({ xp, onDone }: { xp: number; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -20 }}
      className="fixed bottom-8 right-8 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl bg-card border border-yellow-500/30 shadow-2xl shadow-black/40"
    >
      <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
        <Zap className="w-5 h-5 text-yellow-400" />
      </div>
      <div>
        <div className="text-xs text-muted-foreground">Topic Complete!</div>
        <div className="font-bold text-lg text-yellow-400">+{xp} XP</div>
      </div>
    </motion.div>
  );
}

// ─── Main Lesson View ─────────────────────────────────────────────────────────

export default function LessonViewPage({ params }: { params: { subject: string; topic: string } }) {
  const { subject: subjectSlug, topic: topicSlug } = params;
  const found = getTopic(subjectSlug, topicSlug);
  const qc = useQueryClient();

  const [currentSection, setCurrentSection] = useState<Section>("theory");
  const [completedSections, setCompletedSections] = useState<Set<Section>>(new Set());
  const [problemsState, setProblemsState] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 });
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [completionRequested, setCompletionRequested] = useState(false);
  const [showXP, setShowXP] = useState(false);
  const [startTime] = useState<number>(Date.now());
  const answeredProblems = useRef<Set<string>>(new Set());

  const { data: progressMap = {} } = useQuery<Record<string, TopicProgress>>({
    queryKey: ["learning-progress"],
    queryFn: () => apiFetch("/learning/progress"),
  });

  const existingProgress = progressMap[topicSlug] as TopicProgress | undefined;
  const isUnlocked = found
    ? isTopicUnlocked(
      found.subject,
      found.subject.chapters.indexOf(found.chapter),
      found.chapter.topics.indexOf(found.topic),
      progressMap,
    )
    : false;

  const updateProgress = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiFetch(`/learning/progress/${topicSlug}`, {
        method: "PATCH",
        body: JSON.stringify({ subjectSlug, chapterSlug: found?.chapter.slug, ...data }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["learning-progress"] }),
    onError: () => setCompletionRequested(false),
  });

  // Mark current section started
  useEffect(() => {
    if (!found || !isUnlocked) return;
    if (!existingProgress || existingProgress.status === "not_started") {
      updateProgress.mutate({ status: "in_progress", lastSection: "theory" });
    }
  }, [found?.topic.slug, isUnlocked]);

  // Timer — auto-save time every 30s
  useEffect(() => {
    if (!found || !isUnlocked) return;
    const interval = setInterval(() => {
      const seconds = Math.floor((Date.now() - startTime) / 1000);
      updateProgress.mutate({ timeSpentSeconds: (existingProgress?.timeSpentSeconds ?? 0) + seconds });
    }, 30_000);
    return () => clearInterval(interval);
  }, [existingProgress?.timeSpentSeconds]);

  if (!found) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-muted-foreground">Topic not found</p>
        <Link href={`/knowledge/${subjectSlug}`}><button className="text-sm text-primary">← Back to {subjectSlug}</button></Link>
      </div>
    );
  }

  const { subject, chapter, topic } = found;

  if (!isUnlocked) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="max-w-xl mx-auto px-6 py-16 text-center">
          <div className="mx-auto mb-5 w-16 h-16 rounded-2xl border border-border/40 bg-muted/30 flex items-center justify-center">
            <span className="text-2xl">🔒</span>
          </div>
          <h1 className="text-xl font-bold text-foreground mb-2">Lesson locked</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Complete the previous physics lesson before starting <strong>{topic.name}</strong>.
            Your learning path unlocks one lesson at a time.
          </p>
          <Link href={`/knowledge/${subjectSlug}`}>
            <button className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold">
              Back to {subject.name}
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // Build section list dynamically
  const allSections: { id: Section; label: string; icon: React.ElementType }[] = [
    { id: "theory", label: "Theory", icon: BookOpen },
    ...(topic.hasSimulation ? [{ id: "simulation" as Section, label: "Simulation", icon: FlaskConical }] : []),
    ...(topic.examples.length > 0 ? [{ id: "examples" as Section, label: "Examples", icon: Lightbulb }] : []),
    ...(topic.problems.length > 0 ? [{ id: "problems" as Section, label: "Practice", icon: Target }] : []),
    { id: "complete", label: "Complete", icon: Trophy },
  ];

  const currentIdx = allSections.findIndex((s) => s.id === currentSection);
  const hasNext = currentIdx < allSections.length - 1;
  const hasPrev = currentIdx > 0;
  const requiredSectionsComplete = allSections
    .filter(({ id }) => id !== "complete")
    .every(({ id }) => completedSections.has(id));

  const markSectionDone = () => {
    if (currentSection === "problems" && !quizFinished) return;
    const newDone = new Set(completedSections);
    newDone.add(currentSection);
    setCompletedSections(newDone);
    updateProgress.mutate({ lastSection: currentSection });
    if (hasNext) {
      setCurrentSection(allSections[currentIdx + 1].id);
    }
  };

  const handleProblemAnswer = (problemId: string, correct: boolean) => {
    if (answeredProblems.current.has(problemId)) return;
    answeredProblems.current.add(problemId);
    setProblemsState((p) => ({
      correct: p.correct + (correct ? 1 : 0),
      total: p.total + 1,
    }));
  };

  const handleQuizContinue = () => {
    if (quizIndex >= topic.problems.length - 1) {
      setQuizFinished(true);
      return;
    }
    setQuizIndex((index) => index + 1);
  };

  const handleComplete = () => {
    if (!requiredSectionsComplete || isAlreadyCompleted || completionRequested) return;
    setCompletionRequested(true);
    const timeSeconds = Math.floor((Date.now() - startTime) / 1000);
    const quizScore = problemsState.total > 0
      ? Math.round((problemsState.correct / problemsState.total) * 100)
      : null;
    updateProgress.mutate({
      status: "completed",
      mastery: quizScore ?? 100,
      quizScore,
      problemsCorrect: problemsState.correct,
      problemsTotal: problemsState.total,
      timeSpentSeconds: (existingProgress?.timeSpentSeconds ?? 0) + timeSeconds,
      xpReward: topic.xpReward,
    });
    setShowXP(true);
    qc.invalidateQueries({ queryKey: ["learning-summary"] });
  };

  // Already completed?
  const isAlreadyCompleted = existingProgress?.status === "completed";

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Back nav */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 mb-6">
          <Link href={`/knowledge/${subjectSlug}`}>
            <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              {subject.name}
            </button>
          </Link>
          <ChevronRight className="w-3 h-3 text-muted-foreground/40" />
          <span className="text-sm text-muted-foreground">{chapter.name}</span>
          <ChevronRight className="w-3 h-3 text-muted-foreground/40" />
          <span className="text-sm text-foreground font-medium">{topic.name}</span>
        </motion.div>

        {/* Topic header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border overflow-hidden mb-6"
          style={{ borderColor: subject.color + "25" }}
        >
          <div className="px-5 py-4 flex items-center gap-4"
            style={{ background: `linear-gradient(90deg, ${subject.color}10, transparent)` }}>
            <div className="text-2xl">{subject.emoji}</div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">{topic.name}</h1>
              <p className="text-xs text-muted-foreground mt-0.5">{topic.description}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" /> {topic.estimatedMinutes} min
              </span>
              <span className="text-xs font-semibold flex items-center gap-1"
                style={{ color: subject.color }}>
                <Zap className="w-3 h-3" /> +{topic.xpReward} XP
              </span>
              {isAlreadyCompleted && (
                <span className="text-xs text-green-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Done
                </span>
              )}
            </div>
          </div>

          {/* Section progress */}
          <div className="px-5 py-2 border-t border-border/30 bg-muted/10">
            <div className="flex items-center gap-1">
              {allSections.map((s, i) => (
                <div key={s.id} className="flex items-center gap-1">
                  <div className={`h-1 rounded-full transition-all duration-500 ${i === 0 ? "w-8" : "w-6"} ${
                    completedSections.has(s.id) ? "" : s.id === currentSection ? "opacity-60" : "opacity-20"
                  }`} style={{ background: completedSections.has(s.id) ? subject.color : "#94a3b8" }} />
                </div>
              ))}
              <span className="ml-2 text-[10px] text-muted-foreground">
                {completedSections.size}/{allSections.length - 1} sections
              </span>
            </div>
          </div>
        </motion.div>

        {/* Section navigation */}
        <SectionNav
          sections={allSections}
          current={currentSection}
          onSelect={setCurrentSection}
          completedSections={completedSections}
        />

        {/* Section content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSection}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
          >
            {/* THEORY */}
            {currentSection === "theory" && (
              <div className="rounded-2xl border border-border/50 bg-card/60 px-6 py-6 mb-6">
                {topic.keyFormulas && topic.keyFormulas.length > 0 && (
                  <div className="mb-6 p-4 rounded-xl border border-primary/20 bg-primary/5">
                    <div className="text-[10px] font-bold text-primary uppercase tracking-wide mb-2">Key Formulas</div>
                    <div className="flex flex-wrap gap-2">
                      {topic.keyFormulas.map((f) => (
                        <code key={f} className="text-sm font-mono font-semibold text-foreground bg-primary/10 px-2 py-1 rounded-lg">{f}</code>
                      ))}
                    </div>
                  </div>
                )}
                {topic.theory.map((block, i) => <TheoryBlock key={i} block={block} />)}
              </div>
            )}

            {/* SIMULATION */}
            {currentSection === "simulation" && topic.hasSimulation && topic.simulationType && (
              <div className="mb-6">
                <SimulationSection simulationType={topic.simulationType} />
              </div>
            )}

            {/* EXAMPLES */}
            {currentSection === "examples" && topic.examples.length > 0 && (
              <div className="space-y-3 mb-6">
                {topic.examples.map((ex, i) => <ExampleCard key={i} example={ex} index={i} />)}
              </div>
            )}

            {/* PROBLEMS */}
            {currentSection === "problems" && topic.problems.length > 0 && (
              <div className="space-y-4 mb-6">
                {problemsState.total > 0 && (
                  <div className="rounded-xl border border-border/40 bg-card/40 px-4 py-3 flex items-center gap-3">
                    <BarChart2 className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Score: <span className="font-bold text-foreground">{problemsState.correct}/{problemsState.total}</span>
                      {" "}· {problemsState.total > 0 ? Math.round((problemsState.correct / problemsState.total) * 100) : 0}%
                    </span>
                  </div>
                )}
                {!quizFinished && topic.problems[quizIndex] && (
                  <ProblemCard
                    key={topic.problems[quizIndex].id}
                    problem={topic.problems[quizIndex]}
                    index={quizIndex}
                    isLast={quizIndex === topic.problems.length - 1}
                    onAnswer={(correct) => handleProblemAnswer(topic.problems[quizIndex].id, correct)}
                    onContinue={handleQuizContinue}
                  />
                )}
                {quizFinished && (
                  <div className="rounded-xl border border-green-500/25 bg-green-500/5 p-6 text-center">
                    <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <h3 className="font-bold text-foreground">Quiz complete</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      You scored {problemsState.correct}/{problemsState.total}. Continue to finish this lesson.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* COMPLETE */}
            {currentSection === "complete" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl border overflow-hidden mb-6"
                style={{ borderColor: subject.color + "30" }}
              >
                <div className="px-6 py-8 text-center"
                  style={{ background: `linear-gradient(135deg, ${subject.color}10, transparent)` }}>
                  <div className="text-5xl mb-4">{isAlreadyCompleted ? "✅" : "🎯"}</div>
                  <h2 className="text-xl font-bold text-foreground mb-2">
                    {isAlreadyCompleted ? "Already Completed!" : "Lesson ready to complete"}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    {isAlreadyCompleted
                      ? `You completed this topic and earned ${topic.xpReward} XP!`
                      : `Your lesson sections and end-of-lesson quiz are complete. Earn ${topic.xpReward} XP and unlock the next lesson.`}
                  </p>

                  {/* Stats summary */}
                  {(problemsState.total > 0 || isAlreadyCompleted) && (
                    <div className="flex items-center justify-center gap-6 mb-6">
                      {problemsState.total > 0 && (
                        <div>
                          <div className="text-2xl font-bold" style={{ color: subject.color }}>
                            {Math.round((problemsState.correct / problemsState.total) * 100)}%
                          </div>
                          <div className="text-xs text-muted-foreground">Problem Score</div>
                        </div>
                      )}
                      {isAlreadyCompleted && existingProgress?.quizScore != null && (
                        <div>
                          <div className="text-2xl font-bold text-green-400">{existingProgress.quizScore}%</div>
                          <div className="text-xs text-muted-foreground">Previous Score</div>
                        </div>
                      )}
                      <div>
                        <div className="text-2xl font-bold text-yellow-400">+{topic.xpReward}</div>
                        <div className="text-xs text-muted-foreground">XP Reward</div>
                      </div>
                    </div>
                  )}

                  {!isAlreadyCompleted ? (
                    <button
                      onClick={handleComplete}
                      disabled={!requiredSectionsComplete || updateProgress.isPending || completionRequested}
                      className="px-8 py-3 rounded-xl font-bold text-white text-sm transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50"
                      style={{ background: subject.color, boxShadow: `0 4px 20px ${subject.color}40` }}
                    >
                      {updateProgress.isPending || completionRequested ? "Saving..." : `Complete & Earn ${topic.xpReward} XP`}
                    </button>
                  ) : (
                    <Link href={`/knowledge/${subjectSlug}`}>
                      <button className="px-6 py-3 rounded-xl font-semibold text-sm border transition-all hover:bg-muted/40"
                        style={{ borderColor: subject.color + "40", color: subject.color }}>
                        Back to {subject.name} →
                      </button>
                    </Link>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Bottom nav */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => hasPrev && setCurrentSection(allSections[currentIdx - 1].id)}
            disabled={!hasPrev}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border/40 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" /> Previous
          </button>

          {currentSection !== "complete" && (
            <button
              onClick={markSectionDone}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
              style={{ background: subject.color, boxShadow: `0 4px 12px ${subject.color}30` }}
            >
              {completedSections.has(currentSection) ? "Next" : "Mark Done & Continue"}
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* XP popup */}
      <AnimatePresence>
        {showXP && <XPPopup xp={topic.xpReward} onDone={() => setShowXP(false)} />}
      </AnimatePresence>
    </div>
  );
}
