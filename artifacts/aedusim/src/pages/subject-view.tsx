import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, CheckCircle2, Circle, Lock, Clock, Zap, ChevronRight,
  FlaskConical, BookOpen, Target, Award, PlayCircle, ChevronDown,
} from "lucide-react";
import {
  SUBJECTS, PLACEMENT_TESTS, LEVEL_CONFIG, getSubject, getTopicCount, isTopicUnlocked,
  type Chapter, type Topic, type Subject,
} from "@/data/subjects";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TopicProgress {
  status: string; // not_started | in_progress | completed
  mastery: number;
  quizScore: number | null;
  timeSpentSeconds: number;
  lastSection: string | null;
  completedAt: string | null;
  subjectSlug: string;
  chapterSlug: string;
}

interface PlacementResult {
  score: number;
  total: number;
  passed: boolean;
  recommendedChapterSlug: string | null;
  takenAt: string;
}

// ─── API helpers ──────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(res.statusText);
  if (res.status === 204) return undefined as unknown as T;
  return res.json();
}

// ─── Placement Test ───────────────────────────────────────────────────────────

function PlacementTest({ subjectSlug, onComplete }: {
  subjectSlug: string;
  onComplete: (passed: boolean, chapterSlug: string | null) => void;
}) {
  const questions = PLACEMENT_TESTS[subjectSlug] ?? [];
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const qc = useQueryClient();

  const submitMutation = useMutation({
    mutationFn: (data: { score: number; total: number; passed: boolean; recommendedChapterSlug: string | null }) =>
      apiFetch(`/learning/placement/${subjectSlug}`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["placement", subjectSlug] });
    },
  });

  if (!questions.length) return null;

  const subject = getSubject(subjectSlug);
  const correctCount = submitted
    ? questions.filter((q, i) => q.options && q.options[answers[i]] === q.answer).length
    : 0;

  const handleSubmit = () => {
    const answered = Object.keys(answers).length;
    if (answered < questions.length) return;
    setSubmitted(true);
    const total = questions.length;
    const passed = correctCount >= Math.ceil(total * 0.6);
    const recommendedChapterSlug = passed ? null : (subject?.chapters[0]?.slug ?? null);
    submitMutation.mutate({ score: correctCount, total, passed, recommendedChapterSlug });
    setTimeout(() => onComplete(passed, recommendedChapterSlug), 2500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl border border-border/60 bg-card/80 overflow-hidden mb-8"
    >
      <div className="px-6 py-4 border-b border-border/40 flex items-center gap-3"
        style={{ background: `linear-gradient(90deg, ${subject?.color}08, transparent)` }}>
        <Target className="w-5 h-5" style={{ color: subject?.color }} />
        <div>
          <div className="font-bold text-foreground">Placement Test</div>
          <div className="text-xs text-muted-foreground">Determine your starting level · {questions.length} questions</div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {questions.map((q, qi) => (
          <div key={q.id} className="rounded-xl border border-border/40 bg-background/40 overflow-hidden">
            <div className="px-4 py-3 border-b border-border/30 bg-muted/20">
              <div className="flex items-start gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 mt-0.5"
                  style={{ background: subject?.color + "20", color: subject?.color }}>
                  Q{qi + 1}
                </span>
                <p className="text-sm font-medium">{q.question}</p>
              </div>
            </div>
            <div className="p-3 grid grid-cols-2 gap-2">
              {(q.options ?? []).map((opt, oi) => {
                const isSelected = answers[qi] === oi;
                const isCorrect = opt === q.answer;
                let cls = "border-border/40 bg-background/50 hover:bg-accent/50 cursor-pointer";
                if (submitted) {
                  if (isCorrect) cls = "border-green-500/60 bg-green-500/10 text-green-300";
                  else if (isSelected && !isCorrect) cls = "border-red-500/60 bg-red-500/10 text-red-300";
                  else cls = "border-border/20 opacity-40";
                } else if (isSelected) {
                  cls = "border-primary/60 bg-primary/10";
                }
                return (
                  <button
                    key={oi}
                    disabled={submitted}
                    onClick={() => !submitted && setAnswers((a) => ({ ...a, [qi]: oi }))}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-left text-sm transition-all ${cls}`}
                  >
                    <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      submitted && isCorrect ? "bg-green-500 border-green-500 text-white"
                      : submitted && isSelected ? "bg-red-500 border-red-500 text-white"
                      : isSelected ? "bg-primary/20 border-primary text-primary"
                      : "border-border/60 text-muted-foreground"
                    }`}>
                      {String.fromCharCode(65 + oi)}
                    </span>
                    <span className="flex-1 text-xs">{opt}</span>
                  </button>
                );
              })}
            </div>
            {submitted && (
              <div className={`px-4 py-2 text-xs border-t border-border/20 ${answers[qi] !== undefined && (q.options ?? [])[answers[qi]] === q.answer ? "text-green-400 bg-green-500/5" : "text-red-400 bg-red-500/5"}`}>
                {q.explanation}
              </div>
            )}
          </div>
        ))}
      </div>

      {!submitted && (
        <div className="px-6 pb-5">
          <button
            onClick={handleSubmit}
            disabled={Object.keys(answers).length < questions.length}
            className="w-full py-3 rounded-xl font-semibold text-white text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            style={{ background: subject?.color }}
          >
            Submit ({Object.keys(answers).length}/{questions.length} answered)
          </button>
        </div>
      )}

      {submitted && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-6 mb-6 p-4 rounded-xl border"
          style={{ borderColor: correctCount >= Math.ceil(questions.length * 0.6) ? "#22c55e30" : "#f59e0b30",
            background: correctCount >= Math.ceil(questions.length * 0.6) ? "#22c55e08" : "#f59e0b08" }}
        >
          <div className="font-bold text-lg mb-1">
            {correctCount >= Math.ceil(questions.length * 0.6) ? "🎉 Great score!" : "📚 Starting from foundations"}
          </div>
          <div className="text-sm text-muted-foreground">
            {correctCount}/{questions.length} correct ·{" "}
            {correctCount >= Math.ceil(questions.length * 0.6)
              ? "Advanced chapters unlocked!"
              : "We'll start from the beginning to build a solid foundation."}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// ─── Topic Node ───────────────────────────────────────────────────────────────

function TopicNode({ topic, chapter, subjectSlug, subjectColor, progress, locked, isFirst, isLast }: {
  topic: Topic;
  chapter: Chapter;
  subjectSlug: string;
  subjectColor: string;
  progress?: TopicProgress;
  locked: boolean;
  isFirst: boolean;
  isLast: boolean;
}) {
  const status = progress?.status ?? "not_started";
  const isCompleted = status === "completed";
  const isInProgress = status === "in_progress";

  return (
    <div className="flex gap-4">
      {/* Timeline */}
      <div className="flex flex-col items-center" style={{ width: 32 }}>
        {!isFirst && <div className="w-0.5 h-4 bg-border/40" />}
        <div className="relative z-10">
          {locked ? (
            <div className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-border/30 bg-muted/30">
              <Lock className="w-3.5 h-3.5 text-muted-foreground/50" />
            </div>
          ) : isCompleted ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: subjectColor, boxShadow: `0 0 12px ${subjectColor}60` }}
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
            </motion.div>
          ) : isInProgress ? (
            <div className="w-8 h-8 rounded-full flex items-center justify-center border-2 relative"
              style={{ borderColor: subjectColor, background: subjectColor + "15" }}>
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: subjectColor }} />
              <div className="absolute inset-0 rounded-full border-2 animate-ping" style={{ borderColor: subjectColor + "40" }} />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-border/40 bg-background/60">
              <Circle className="w-3 h-3 text-muted-foreground/40" />
            </div>
          )}
        </div>
        {!isLast && <div className="flex-1 w-0.5 bg-border/40 mt-0" style={{ minHeight: 20 }} />}
      </div>

      {/* Content */}
      <div className="flex-1 pb-4">
        {locked ? (
          <div className="rounded-xl border border-border/25 bg-card/20 p-4 opacity-65">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-sm text-foreground/60">{topic.name}</h4>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                    LOCKED
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">{topic.description}</p>
                <div className="flex items-center gap-1.5 mt-2 text-[10px] text-muted-foreground">
                  <Lock className="w-2.5 h-2.5" />
                  Complete the previous lesson to unlock
                </div>
              </div>
              <Lock className="w-4 h-4 text-muted-foreground/35 shrink-0 mt-0.5" />
            </div>
          </div>
        ) : (
          <Link href={`/knowledge/${subjectSlug}/${topic.slug}`}>
            <div className={`group rounded-xl border p-4 cursor-pointer transition-all duration-200 ${
            isCompleted
              ? "border-border/40 bg-card/40 hover:border-border hover:bg-card/70"
              : isInProgress
              ? "bg-card/70 hover:bg-card"
              : "border-border/30 bg-card/30 hover:border-border/60 hover:bg-card/50"
          }`} style={isInProgress ? { borderColor: subjectColor + "40" } : undefined}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h4 className={`font-semibold text-sm ${isCompleted ? "text-foreground" : isInProgress ? "text-foreground" : "text-foreground/70"}`}>
                      {topic.name}
                    </h4>
                    {isInProgress && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: subjectColor + "20", color: subjectColor }}>
                        IN PROGRESS
                      </span>
                    )}
                    {isCompleted && progress?.quizScore != null && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-green-500/15 text-green-400">
                        {progress.quizScore}%
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">{topic.description}</p>

                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" /> {topic.estimatedMinutes} min
                    </span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Zap className="w-2.5 h-2.5" /> {topic.xpReward} XP
                    </span>
                    {topic.hasSimulation && (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <FlaskConical className="w-2.5 h-2.5" /> Simulation
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <BookOpen className="w-2.5 h-2.5" /> {topic.problems.length} problems
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground shrink-0 mt-0.5 transition-colors" />
              </div>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}

// ─── Chapter Section ──────────────────────────────────────────────────────────

function ChapterSection({ chapter, subjectSlug, subjectColor, progressMap, chapterIndex, subject }: {
  chapter: Chapter;
  subjectSlug: string;
  subjectColor: string;
  progressMap: Record<string, TopicProgress>;
  chapterIndex: number;
  subject: Subject;
}) {
  const [open, setOpen] = useState(true);
  const lvl = LEVEL_CONFIG[chapter.level];
  const completedTopics = chapter.topics.filter((t) => progressMap[t.slug]?.status === "completed").length;
  const chapterUnlocked = isTopicUnlocked(subject, chapterIndex, 0, progressMap);

  return (
    <div className="mb-6">
      {/* Chapter header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 mb-4 group"
      >
        <div className="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
          style={{ background: lvl.bg, color: lvl.color }}>
          {lvl.label.toUpperCase()}
        </div>
        <h3 className="font-bold text-foreground text-base">{chapter.name}</h3>
        <div className="text-xs text-muted-foreground">{chapter.description}</div>
        <div className="ml-auto flex items-center gap-2">
          {!chapterUnlocked && <Lock className="w-3.5 h-3.5 text-muted-foreground/50" />}
          <span className="text-xs text-muted-foreground">{completedTopics}/{chapter.topics.length}</span>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      </button>

      {/* Chapter progress bar */}
      <div className="h-0.5 bg-border/30 rounded-full mb-5 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: subjectColor }}
          initial={{ width: 0 }}
          animate={{ width: chapter.topics.length > 0 ? `${(completedTopics / chapter.topics.length) * 100}%` : 0 }}
          transition={{ duration: 0.8 }}
        />
      </div>

      {/* Topics */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            {chapter.topics.map((topic, i) => (
              <TopicNode
                key={topic.slug}
                topic={topic}
                chapter={chapter}
                subjectSlug={subjectSlug}
                subjectColor={subjectColor}
                progress={progressMap[topic.slug]}
                locked={!isTopicUnlocked(subject, chapterIndex, i, progressMap)}
                isFirst={i === 0}
                isLast={i === chapter.topics.length - 1}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SubjectViewPage({ params }: { params: { subject: string } }) {
  const subjectSlug = params.subject;
  const subject = getSubject(subjectSlug);
  const [, navigate] = useLocation();
  const [showPlacement, setShowPlacement] = useState(false);

  const { data: progressMap = {} } = useQuery<Record<string, TopicProgress>>({
    queryKey: ["learning-progress"],
    queryFn: () => apiFetch("/learning/progress"),
  });

  const { data: placement } = useQuery<PlacementResult>({
    queryKey: ["placement", subjectSlug],
    queryFn: () => apiFetch(`/learning/placement/${subjectSlug}`),
    retry: false,
  });

  if (!subject) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-muted-foreground">Subject not found</p>
        <Link href="/knowledge"><button className="text-sm text-primary">← Back to Knowledge Hub</button></Link>
      </div>
    );
  }

  const totalTopics = getTopicCount(subject);
  const completedTopics = subject.chapters
    .flatMap((c) => c.topics)
    .filter((t) => progressMap[t.slug]?.status === "completed").length;
  const pct = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Back */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
          <Link href="/knowledge">
            <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" /> Knowledge Hub
            </button>
          </Link>
        </motion.div>

        {/* Subject Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border overflow-hidden mb-8"
          style={{ borderColor: subject.color + "25" }}
        >
          {subject.chapterImage && (
            <div className="relative h-44 sm:h-56 overflow-hidden">
              <img
                src={subject.chapterImage}
                alt={`${subject.name} chapter opening`}
                className="h-full w-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{ background: `linear-gradient(180deg, transparent 20%, ${subject.color}55 100%)` }}
              />
              <div className="absolute bottom-4 left-6 rounded-full border border-white/20 bg-black/45 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                Physics · Explore · Experiment · Understand
              </div>
            </div>
          )}
          <div
            className="px-6 py-6"
            style={{ background: `linear-gradient(135deg, ${subject.color}12, ${subject.color}04)` }}
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl">{subject.emoji}</div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-foreground mb-1">{subject.name}</h1>
                <p className="text-sm text-muted-foreground mb-4">{subject.description}</p>

                {/* Stats row */}
                <div className="flex items-center gap-4 flex-wrap">
                  {[
                    { icon: Target, label: `${subject.chapters.length} chapters` },
                    { icon: BookOpen, label: `${totalTopics} topics` },
                    { icon: CheckCircle2, label: `${completedTopics} completed` },
                  ].map(({ icon: Icon, label }) => (
                    <span key={label} className="text-xs text-muted-foreground flex items-center gap-1">
                      <Icon className="w-3 h-3" />{label}
                    </span>
                  ))}
                </div>

                {/* Progress bar */}
                {completedTopics > 0 && (
                  <div className="mt-4">
                    <div className="h-1.5 bg-border/30 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: subject.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1 }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{pct}% complete</div>
                  </div>
                )}
              </div>

              {/* Placement test CTA */}
              {!placement && !showPlacement && (
                <button
                  onClick={() => setShowPlacement(true)}
                  className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all hover:-translate-y-0.5"
                  style={{ borderColor: subject.color + "40", color: subject.color, background: subject.color + "08" }}
                >
                  <Award className="w-4 h-4" />
                  Placement Test
                </button>
              )}
              {placement && (
                <div className="shrink-0 text-xs text-muted-foreground text-right">
                  <div className="font-medium">{placement.passed ? "✅ Passed" : "📘 Started from basics"}</div>
                  <div>{placement.score}/{placement.total} correct</div>
                  <button
                    onClick={() => setShowPlacement(true)}
                    className="text-primary mt-1 hover:underline"
                  >
                    Retake
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Placement Test */}
        {showPlacement && (
          <PlacementTest
            subjectSlug={subjectSlug}
            onComplete={() => setShowPlacement(false)}
          />
        )}

        {/* Knowledge Tree */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          {subject.chapters.map((chapter, chapterIndex) => (
            <ChapterSection
              key={chapter.slug}
              chapter={chapter}
              chapterIndex={chapterIndex}
              subject={subject}
              subjectSlug={subjectSlug}
              subjectColor={subject.color}
              progressMap={progressMap}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
