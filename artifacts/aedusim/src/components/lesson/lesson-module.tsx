import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Zap, ChevronRight, Trophy, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThermodynamicsSim, ProjectileSim, WaveSim, CircuitSim, DNASim } from "./simulation-canvas";
import { AtomViewer, MoleculeViewer } from "./atom-model";
import type { LessonModule, SimType, Model3DType } from "./lesson-data";

// ─── Quiz Component ────────────────────────────────────────────────────────────

function QuizCard({ questions, onComplete }: { questions: NonNullable<LessonModule["questions"]>; onComplete: (correct: number) => void }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const answered = Object.keys(answers).length;
  const correctCount = submitted ? questions.filter((q, i) => answers[i] === q.correct).length : 0;

  return (
    <div className="space-y-4">
      {questions.map((q, qi) => (
        <div key={qi} className="rounded-2xl border border-border/50 bg-card/60 overflow-hidden">
          <div className="px-4 py-3 bg-primary/5 border-b border-border/40">
            <div className="flex items-start gap-2">
              <span className="text-[10px] font-bold text-primary bg-primary/15 px-2 py-0.5 rounded-full shrink-0 mt-0.5">Q{qi + 1}</span>
              <p className="text-sm font-medium leading-snug">{q.q}</p>
            </div>
          </div>
          <div className="p-3 space-y-2">
            {q.opts.map((opt, oi) => {
              const isSelected = answers[qi] === oi;
              const isCorrect = oi === q.correct;
              let cls = "border-border/40 bg-background/50 hover:bg-accent/50 cursor-pointer";
              if (submitted) {
                if (isCorrect) cls = "border-green-500/60 bg-green-500/10 text-green-300";
                else if (isSelected) cls = "border-red-500/60 bg-red-500/10 text-red-300";
                else cls = "border-border/20 opacity-40";
              } else if (isSelected) cls = "border-primary/60 bg-primary/10";
              return (
                <button key={oi} disabled={submitted}
                  onClick={() => !submitted && setAnswers(a => ({ ...a, [qi]: oi }))}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left text-sm transition-all ${cls}`}
                >
                  <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-[11px] font-bold shrink-0 ${
                    submitted && isCorrect ? "bg-green-500 border-green-500 text-white"
                    : submitted && isSelected ? "bg-red-500 border-red-500 text-white"
                    : isSelected ? "bg-primary/20 border-primary text-primary"
                    : "border-border/60 text-muted-foreground"
                  }`}>{String.fromCharCode(65 + oi)}</span>
                  <span className="flex-1">{opt}</span>
                  {submitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />}
                  {submitted && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
                </button>
              );
            })}
          </div>
          {submitted && (
            <div className={`px-4 py-2.5 border-t border-border/30 text-xs ${answers[qi] === q.correct ? "bg-green-500/5 text-green-400" : "bg-red-500/5 text-red-400"}`}>
              <div className="flex items-start gap-1.5">
                {answers[qi] === q.correct ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" /> : <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />}
                <span className="text-foreground/70">{q.explain}</span>
              </div>
            </div>
          )}
        </div>
      ))}
      {!submitted ? (
        <Button onClick={() => { setSubmitted(true); onComplete(correctCount); }} disabled={answered < questions.length} className="w-full gap-2">
          <CheckCircle2 className="w-4 h-4" /> Submit Answers ({answered}/{questions.length})
        </Button>
      ) : (
        <div className={`p-4 rounded-2xl border text-center ${
          correctCount === questions.length ? "bg-green-500/10 border-green-500/30 text-green-400"
          : correctCount >= questions.length / 2 ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
          : "bg-red-500/10 border-red-500/30 text-red-400"
        }`}>
          <div className="text-2xl font-bold mb-1">{correctCount}/{questions.length}</div>
          <div className="text-sm font-medium">
            {correctCount === questions.length ? "Perfect! 🎯" : correctCount >= questions.length / 2 ? "Good effort! Review explanations." : "Keep going — revisit the concepts!"}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-renderers ─────────────────────────────────────────────────────────────

function SimulationRenderer({ simType }: { simType: SimType }) {
  switch (simType) {
    case "thermodynamics": return <ThermodynamicsSim />;
    case "projectile": return <ProjectileSim />;
    case "wave": return <WaveSim />;
    case "circuit": return <CircuitSim />;
    case "dna": return <DNASim />;
  }
}

function Model3DRenderer({ modelType, label }: { modelType: Model3DType; label?: string }) {
  const ATOMS: Record<string, { element: string; protons: number; shells: number[] }> = {
    "atom-carbon": { element: "Carbon (C)", protons: 6, shells: [2, 4] },
    "atom-hydrogen": { element: "Hydrogen (H)", protons: 1, shells: [1] },
    "atom-oxygen": { element: "Oxygen (O)", protons: 8, shells: [2, 6] },
    "atom-sodium": { element: "Sodium (Na)", protons: 11, shells: [2, 8, 1] },
  };
  const MOLS: Record<string, string> = { "molecule-h2o": "H₂O", "molecule-co2": "CO₂", "molecule-ch4": "CH₄" };
  if (ATOMS[modelType]) { const a = ATOMS[modelType]; return <AtomViewer element={a.element} protons={a.protons} shells={a.shells} />; }
  if (MOLS[modelType]) return <MoleculeViewer molecule={MOLS[modelType]} />;
  return null;
}

function ConceptCard({ module: m }: { module: LessonModule }) {
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
        <p className="text-foreground font-medium leading-relaxed text-sm">{m.definition}</p>
      </div>
      {m.keyPoints && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Key Points</p>
          {m.keyPoints.map((pt, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
              className="flex items-start gap-3 p-3 rounded-xl bg-card/50 border border-border/40">
              <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{i + 1}</div>
              <p className="text-sm text-foreground/80 leading-snug">{pt}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function NotesCard({ module: m }: { module: LessonModule }) {
  return (
    <div className="space-y-4">
      {m.sections?.map((s, i) => (
        <div key={i} className="border border-border/50 rounded-xl overflow-hidden">
          <div className="px-4 py-2.5 bg-primary/5 border-b border-border/40">
            <h4 className="text-sm font-bold text-primary">{s.heading}</h4>
          </div>
          <div className="px-4 py-3 text-sm text-foreground/80 leading-relaxed whitespace-pre-line">{s.content}</div>
        </div>
      ))}
      {m.formulas && m.formulas.length > 0 && (
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Key Formulas</p>
          <div className="flex flex-wrap gap-2">
            {m.formulas.map((f, i) => (
              <div key={i} className="font-mono text-sm text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg">{f}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ImageCard({ module: m }: { module: LessonModule }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="space-y-3">
      <div
        className={`overflow-hidden rounded-xl border border-border/50 cursor-pointer transition-all ${expanded ? "max-h-[600px]" : "max-h-64"}`}
        onClick={() => setExpanded(e => !e)}
      >
        <img
          src={m.imageUrl}
          alt={m.imageAlt || m.title}
          className="w-full object-contain bg-black/20"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://placehold.co/600x300/1a1f36/4a90e2?text=${encodeURIComponent(m.title)}`;
          }}
        />
      </div>
      {m.imageCaption && (
        <p className="text-xs text-muted-foreground leading-relaxed border-l-2 border-primary/30 pl-3 italic">{m.imageCaption}</p>
      )}
      <button onClick={() => setExpanded(e => !e)} className="text-[10px] text-primary/60 hover:text-primary">
        {expanded ? "↑ Collapse" : "↕ Expand image"}
      </button>
    </div>
  );
}

function VideoCard({ module: m }: { module: LessonModule }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="space-y-3">
      <div className="rounded-xl overflow-hidden border border-border/50 bg-black aspect-video relative">
        {!loaded && (
          <div
            className="absolute inset-0 flex items-center justify-center cursor-pointer group"
            style={{
              background: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(https://img.youtube.com/vi/${m.videoId}/hqdefault.jpg) center/cover`
            }}
            onClick={() => setLoaded(true)}
          >
            <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center group-hover:bg-red-500 transition-colors shadow-xl">
              <div className="w-0 h-0 border-t-[10px] border-b-[10px] border-l-[18px] border-transparent border-l-white ml-1" />
            </div>
          </div>
        )}
        {loaded && (
          <iframe
            width="100%" height="100%"
            src={`https://www.youtube.com/embed/${m.videoId}?autoplay=1&rel=0&modestbranding=1`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen className="w-full h-full"
          />
        )}
      </div>
      {m.videoCaption && <p className="text-xs text-muted-foreground leading-relaxed">{m.videoCaption}</p>}
    </div>
  );
}

function RealLifeCard({ module: m }: { module: LessonModule }) {
  const [showSolution, setShowSolution] = useState(false);
  return (
    <div className="space-y-4">
      {/* Scenario */}
      <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
        <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-2">📍 Real-World Scenario</p>
        <p className="text-sm text-foreground/80 leading-relaxed">{m.scenario}</p>
      </div>

      {/* Image */}
      {m.scenarioImage && (
        <div className="rounded-xl overflow-hidden border border-border/50">
          <img
            src={m.scenarioImage}
            alt={m.scenarioImageAlt || "Scenario image"}
            className="w-full max-h-48 object-contain bg-black/20"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        </div>
      )}

      {/* Problem */}
      <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20">
        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-2">❓ Problem Statement</p>
        <p className="text-sm font-medium">{m.problemStatement}</p>
      </div>

      {/* Solution toggle */}
      {!showSolution ? (
        <Button variant="outline" className="w-full gap-2" onClick={() => setShowSolution(true)}>
          <span>Reveal Solution</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      ) : (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-green-500/5 border border-green-500/20">
          <p className="text-[10px] font-bold text-green-400 uppercase tracking-wider mb-2">✅ Solution</p>
          <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line font-mono">{m.solution}</p>
        </motion.div>
      )}
    </div>
  );
}

function XPCard({ totalXpGained, topic, level }: { totalXpGained: number; topic: string; level: string }) {
  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-500/30 text-center space-y-4">
      <Trophy className="w-12 h-12 text-amber-400 mx-auto" />
      <div>
        <h3 className="text-xl font-bold text-amber-400">Topic Complete!</h3>
        <p className="text-sm text-muted-foreground mt-1">{topic} — {level}</p>
      </div>
      <div className="flex items-center justify-center gap-2">
        <Zap className="w-5 h-5 text-yellow-400" />
        <span className="text-3xl font-black text-yellow-400">+{totalXpGained} XP</span>
      </div>
      <p className="text-xs text-muted-foreground">Excellent work! Choose another topic to keep learning.</p>
    </div>
  );
}

// ─── Locked Module (Pro gate) ──────────────────────────────────────────────────

function LockedModule({ module: m }: { module: LessonModule }) {
  const META: Record<string, string> = {
    video: "🎬 Video Overview",
    model3d: "🔬 3D Interactive Model",
    real_life: "🌍 Real-Life Problem",
    image: "🖼️ Diagram",
    simulation: "⚡ Simulation",
  };
  return (
    <div className="p-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 text-center space-y-3">
      <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto">
        <Lock className="w-6 h-6 text-amber-400" />
      </div>
      <div>
        <p className="font-bold text-amber-400">{META[m.type] || m.title}</p>
        <p className="text-sm text-muted-foreground mt-1">{m.title}</p>
      </div>
      <div className="inline-block px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 font-bold">
        ⭐ Pro Plan Feature
      </div>
      <p className="text-xs text-muted-foreground">Upgrade to Pro to unlock videos, 3D models, real-life problems, and more.</p>
    </div>
  );
}

// ─── Module Header Meta ────────────────────────────────────────────────────────

const MODULE_META: Record<string, { icon: string; label: string; accent: string }> = {
  concept:    { icon: "💡", label: "Core Concept",           accent: "text-primary border-primary/20 bg-primary/5" },
  simulation: { icon: "⚡", label: "Interactive Simulation", accent: "text-cyan-400 border-cyan-500/20 bg-cyan-500/5" },
  model3d:    { icon: "🔬", label: "3D Model",               accent: "text-purple-400 border-purple-500/20 bg-purple-500/5" },
  image:      { icon: "🖼️", label: "Diagram & Visual",       accent: "text-amber-400 border-amber-500/20 bg-amber-500/5" },
  video:      { icon: "🎬", label: "Video Overview",         accent: "text-rose-400 border-rose-500/20 bg-rose-500/5" },
  real_life:  { icon: "🌍", label: "Real-Life Application",  accent: "text-green-400 border-green-500/20 bg-green-500/5" },
  notes:      { icon: "📘", label: "Study Notes",            accent: "text-blue-400 border-blue-500/20 bg-blue-500/5" },
  quiz:       { icon: "🎯", label: "Practice Quiz",          accent: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5" },
  xp:         { icon: "🏆", label: "Lesson Complete!",       accent: "text-amber-400 border-amber-500/20 bg-amber-500/5" },
};

// ─── Main Module Card ──────────────────────────────────────────────────────────

interface Props {
  module: LessonModule;
  index: number;
  isActive: boolean;
  isDone: boolean;
  isLocked: boolean;
  onContinue: (xpEarned: number) => void;
  topic: string;
  level: string;
  totalXpGained: number;
}

export function LessonModuleCard({ module: m, index, isActive, isDone, isLocked, onContinue, topic, level, totalXpGained }: Props) {
  const [quizComplete, setQuizComplete] = useState(false);
  const [quizCorrect, setQuizCorrect] = useState(0);
  const meta = MODULE_META[m.type] || MODULE_META.concept;
  const xpReward = m.xpReward ?? 25;

  const canContinue = m.type !== "quiz" || quizComplete;

  const handleQuizDone = (correct: number) => { setQuizCorrect(correct); setQuizComplete(true); };

  // If locked, show lock screen (but only when active)
  if (isLocked && isActive) {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-amber-500/20 overflow-hidden">
        <div className={`flex items-center gap-3 px-4 py-3 border-b border-amber-500/20 ${meta.accent}`}>
          <span className="text-lg">{meta.icon}</span>
          <div className="flex-1"><div className="text-[10px] font-bold uppercase tracking-wider opacity-70">Step {index + 1} · {meta.label}</div>
          <h3 className="text-sm font-bold">{m.title}</h3></div>
          <Lock className="w-4 h-4 text-amber-400 shrink-0" />
        </div>
        <div className="p-4"><LockedModule module={m} /></div>
        <div className="px-4 pb-4">
          <Button onClick={() => onContinue(0)} variant="outline" className="w-full text-xs gap-2">
            Skip this module <ChevronRight className="w-3 h-3" />
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: isActive || isDone ? 1 : 0.35, y: 0 }} transition={{ duration: 0.35 }}
      className={`rounded-2xl border overflow-hidden transition-all ${isActive ? "border-border/60 shadow-lg shadow-black/20" : isDone ? "border-border/30" : "border-border/20"}`}
    >
      {/* Header */}
      <div className={`flex items-center gap-3 px-4 py-3 border-b border-border/40 ${meta.accent}`}>
        <span className="text-lg">{meta.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">Step {index + 1} · {meta.label}</div>
          <h3 className="text-sm font-bold leading-tight mt-0.5">{m.title}</h3>
        </div>
        <div className="shrink-0">
          {isDone ? (
            <div className="flex items-center gap-1 text-green-400 text-xs font-bold"><CheckCircle2 className="w-4 h-4" /> Done</div>
          ) : isActive ? (
            <div className="flex items-center gap-1 text-amber-400 text-xs"><Zap className="w-3 h-3" /> +{xpReward} XP</div>
          ) : null}
        </div>
      </div>

      {/* Content */}
      {(isActive || isDone) && (
        <div className="p-4 bg-card/40">
          {m.type === "concept"    && <ConceptCard module={m} />}
          {m.type === "simulation" && m.simType && <SimulationRenderer simType={m.simType} />}
          {m.type === "model3d"    && m.modelType && <Model3DRenderer modelType={m.modelType} label={m.modelLabel} />}
          {m.type === "image"      && <ImageCard module={m} />}
          {m.type === "video"      && m.videoId && <VideoCard module={m} />}
          {m.type === "real_life"  && <RealLifeCard module={m} />}
          {m.type === "notes"      && <NotesCard module={m} />}
          {m.type === "quiz"       && m.questions && <QuizCard questions={m.questions} onComplete={handleQuizDone} />}
          {m.type === "xp"         && <XPCard totalXpGained={totalXpGained} topic={topic} level={level} />}

          {/* Continue */}
          {isActive && m.type !== "xp" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              className="mt-4 pt-4 border-t border-border/30">
              <Button onClick={() => onContinue(m.type === "quiz" ? quizCorrect * 15 + (quizComplete ? xpReward : 0) : xpReward)}
                disabled={!canContinue} className="w-full gap-2 font-semibold">
                Continue <ChevronRight className="w-4 h-4" />
                <span className="text-xs opacity-70">+{xpReward} XP</span>
              </Button>
              {m.type === "quiz" && !quizComplete && (
                <p className="text-center text-xs text-muted-foreground mt-2">Answer all questions to continue</p>
              )}
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
}
