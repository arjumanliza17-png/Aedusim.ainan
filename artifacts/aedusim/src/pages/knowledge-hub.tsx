import { motion } from "framer-motion";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Zap, Target, ArrowRight, CheckCircle2, Clock, Trophy } from "lucide-react";
import { SUBJECTS, getTopicCount, type Subject } from "@/data/subjects";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Profile { name: string; xp: number; level: number; streak: number; }
interface ProgressSummary {
  completed: number;
  inProgress: number;
  totalTime: number;
  bySubject: Record<string, { completed: number; total: number }>;
}

// ─── API ──────────────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`/api${path}`);
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
}

// ─── Subject Card ─────────────────────────────────────────────────────────────

function SubjectCard({ subject, subjectProgress, index }: {
  subject: Subject;
  subjectProgress?: { completed: number; total: number };
  index: number;
}) {
  const totalTopics = getTopicCount(subject);
  const completed = subjectProgress?.completed ?? 0;
  const pct = totalTopics > 0 ? Math.round((completed / totalTopics) * 100) : 0;
  const started = completed > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
    >
      <Link href={`/knowledge/${subject.slug}`}>
        <div
          className="group relative rounded-2xl border border-border/50 bg-card/80 overflow-hidden cursor-pointer transition-all duration-300 hover:border-border hover:shadow-xl hover:shadow-black/20 hover:-translate-y-0.5"
          style={{ borderColor: started ? subject.color + "30" : undefined }}
        >
          {/* Color accent top bar */}
          <div
            className="h-1 w-full"
            style={{ background: `linear-gradient(90deg, ${subject.color}, transparent)` }}
          />

           {subject.coverImage && (
             <div className="relative aspect-[16/8] overflow-hidden border-b border-border/40">
               <img
                 src={subject.coverImage}
                 alt={`${subject.name} concepts`}
                 className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
               />
               <div
                 className="absolute inset-0"
                 style={{ background: `linear-gradient(180deg, transparent 55%, ${subject.color}22)` }}
               />
             </div>
           )}

          <div className="p-5">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                style={{ background: subject.color + "15", border: `1px solid ${subject.color}25` }}
              >
                {subject.emoji}
              </div>
              {started && (
                <div
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: subject.color + "15", color: subject.color }}
                >
                  {pct}%
                </div>
              )}
            </div>

            {/* Name & description */}
            <h3 className="font-bold text-foreground mb-1 text-base">{subject.name}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-4">
              {subject.description}
            </p>

            {/* Progress bar */}
            {started && (
              <div className="mb-4">
                <div className="h-1 bg-border/50 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: subject.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, delay: index * 0.05 + 0.3 }}
                  />
                </div>
              </div>
            )}

            {/* Footer stats */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  {totalTopics} topics
                </span>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  {subject.chapters.length} chapters
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs font-medium group-hover:gap-2 transition-all"
                style={{ color: subject.color }}>
                {started ? (completed === totalTopics ? "Review" : "Continue") : "Start"}
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </div>

          {/* Completed overlay badge */}
          {completed === totalTopics && totalTopics > 0 && (
            <div className="absolute top-3 right-3">
              <CheckCircle2 className="w-5 h-5" style={{ color: subject.color }} />
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Continue Learning Banner ─────────────────────────────────────────────────

function ContinueLearningBanner({ summary }: { summary: ProgressSummary }) {
  const inProgressSubject = SUBJECTS.find(
    (s) => summary.bySubject[s.slug]?.completed > 0
  );
  if (!inProgressSubject || summary.inProgress === 0) return null;

  const { completed, total } = summary.bySubject[inProgressSubject.slug] ?? { completed: 0, total: 0 };
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const hours = Math.floor(summary.totalTime / 3600);
  const mins = Math.floor((summary.totalTime % 3600) / 60);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <Link href={`/knowledge/${inProgressSubject.slug}`}>
        <div
          className="relative rounded-2xl overflow-hidden border cursor-pointer hover:shadow-xl hover:shadow-black/20 transition-all duration-300 hover:-translate-y-0.5"
          style={{ borderColor: inProgressSubject.color + "30", background: `linear-gradient(135deg, ${inProgressSubject.color}08, ${inProgressSubject.color}02)` }}
        >
          <div className="p-6 flex items-center gap-6">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl shrink-0"
              style={{ background: inProgressSubject.color + "20" }}
            >
              {inProgressSubject.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold mb-1" style={{ color: inProgressSubject.color }}>
                CONTINUE LEARNING
              </div>
              <div className="font-bold text-foreground text-lg mb-2">{inProgressSubject.name}</div>
              <div className="h-1.5 bg-border/30 rounded-full overflow-hidden w-full max-w-xs">
                <div className="h-full rounded-full" style={{ background: inProgressSubject.color, width: `${pct}%` }} />
              </div>
              <div className="text-xs text-muted-foreground mt-1.5">{completed} of {total} topics complete</div>
            </div>
            <div className="shrink-0 flex flex-col items-end gap-2">
              {(hours > 0 || mins > 0) && (
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {hours > 0 ? `${hours}h ${mins}m` : `${mins}m`} studied
                </div>
              )}
              <div
                className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl"
                style={{ background: inProgressSubject.color, color: "white" }}
              >
                Continue <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────

function StatsBar({ profile, summary }: { profile: Profile; summary: ProgressSummary }) {
  const stats = [
    { icon: CheckCircle2, label: "Topics Done", value: summary.completed, color: "#22c55e" },
    { icon: Zap, label: "XP Earned", value: profile.xp.toLocaleString(), color: "#f59e0b" },
    { icon: Trophy, label: "Level", value: profile.level, color: "#6366f1" },
    { icon: Clock, label: "Study Time", value: summary.totalTime >= 3600
        ? `${Math.floor(summary.totalTime / 3600)}h`
        : `${Math.floor(summary.totalTime / 60)}m`,
      color: "#06b6d4" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1 }}
      className="grid grid-cols-4 gap-3 mb-8"
    >
      {stats.map(({ icon: Icon, label, value, color }) => (
        <div key={label} className="rounded-xl border border-border/50 bg-card/60 px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: color + "15", border: `1px solid ${color}20` }}>
            <Icon className="w-4 h-4" style={{ color }} />
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground">{label}</div>
            <div className="font-bold text-sm text-foreground">{value}</div>
          </div>
        </div>
      ))}
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function KnowledgeHubPage() {
  const { data: profile } = useQuery<Profile>({
    queryKey: ["profile"],
    queryFn: () => apiFetch("/profile"),
  });

  const { data: summary } = useQuery<ProgressSummary>({
    queryKey: ["learning-summary"],
    queryFn: () => apiFetch("/learning/summary"),
  });

  const defaultProfile: Profile = { name: "Learner", xp: 0, level: 1, streak: 0 };
  const defaultSummary: ProgressSummary = { completed: 0, inProgress: 0, totalTime: 0, bySubject: {} };

  const p = profile ?? defaultProfile;
  const s = summary ?? defaultSummary;

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Your Learning Journey
          </h1>
          <p className="text-muted-foreground">
            Structured knowledge trees · Adaptive progression · Real mastery
          </p>
        </motion.div>

        {/* Stats */}
        <StatsBar profile={p} summary={s} />

        {/* Continue learning */}
        <ContinueLearningBanner summary={s} />

        {/* Section title */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-5"
        >
          <h2 className="text-lg font-bold text-foreground">Choose a Subject</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Each subject is a complete learning journey from foundations to expert level
          </p>
        </motion.div>

        {/* Subject grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {SUBJECTS.map((subject, i) => (
            <SubjectCard
              key={subject.slug}
              subject={subject}
              subjectProgress={s.bySubject[subject.slug]}
              index={i}
            />
          ))}
        </div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-xs text-muted-foreground/50 mt-12 mb-4"
        >
          More subjects coming soon · Content expands regularly
        </motion.p>
      </div>
    </div>
  );
}
