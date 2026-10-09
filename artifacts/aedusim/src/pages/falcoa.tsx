import { useState, useRef, useEffect } from "react";
import {
  useListConversations,
  useCreateConversation,
  useListMessages,
  useSendMessage,
  useDeleteConversation,
  useGetProfile,
  getListConversationsQueryKey,
  getListMessagesQueryKey,
} from "@workspace/api-client-react";
import type { Conversation, Message } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  Plus, Trash2, Send, Upload, Copy, Check,
  User, Trophy, Zap, Star, BookOpen, Target, Menu, X,
  CalendarRange, ChevronRight, ChevronLeft,
} from "lucide-react";
import { FloatingGem } from "@/components/motion/floating-gem";
import { messageVariants } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { MessageRenderer } from "@/components/message-renderer";

const MODEL_ID = "falcoa";

// ─── Conversation Item ────────────────────────────────────────────────────────

function ConvItem({
  id, title, active, onSelect, onDelete,
}: {
  id: number; title: string; active: boolean;
  onSelect: () => void; onDelete: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
        active ? "bg-primary/15 border border-primary/30" : "hover:bg-accent/40 border border-transparent"
      }`}
    >
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">{title}</p>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-muted-foreground hover:text-red-400 transition-all shrink-0"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  );
}

// ─── Profile Card ─────────────────────────────────────────────────────────────

function ProfileCard({ profile }: { profile: any }) {
  if (!profile) return null;
  const PLAN_COLORS: Record<string, string> = {
    elite: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    pro: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    free: "text-muted-foreground bg-card border-border/50",
  };
  const PLAN_LABELS: Record<string, string> = { elite: "⭐ Elite", pro: "💎 Pro", free: "Free" };

  return (
    <div className="mx-2 mb-2 p-3 rounded-xl border border-border/40 bg-card/30 space-y-2">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
          <User className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{profile.name}</p>
          <p className="text-[10px] text-muted-foreground">{profile.class}</p>
        </div>
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${PLAN_COLORS[profile.plan] || PLAN_COLORS.free}`}>
          {PLAN_LABELS[profile.plan] || "Free"}
        </span>
      </div>
      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1"><Trophy className="w-3 h-3 text-amber-400" /> Lv {profile.level}</span>
        <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-primary" /> {profile.xp} XP</span>
        <span className="flex items-center gap-1"><Star className="w-3 h-3 text-orange-400" /> {profile.streak}d streak</span>
      </div>
      {profile.interests?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {profile.interests.slice(0, 3).map((i: string) => (
            <span key={i} className="text-[9px] bg-primary/10 text-primary/80 px-1.5 py-0.5 rounded-full">{i}</span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Study Plan Wizard ────────────────────────────────────────────────────────

const LEVELS = ["GCSE", "IGCSE", "A-Level", "AS-Level", "IB", "AP", "University", "Other"];

function StudyPlanWizard({ onClose, onGenerate }: {
  onClose: () => void;
  onGenerate: (prompt: string) => void;
}) {
  const [step, setStep] = useState(0);
  const [subject, setSubject] = useState("");
  const [level, setLevel] = useState("A-Level");
  const [duration, setDuration] = useState<"monthly" | "yearly">("monthly");
  const [hoursPerWeek, setHoursPerWeek] = useState("10");
  const [goal, setGoal] = useState("");

  const steps = [
    {
      title: "Subject & Level",
      valid: subject.trim().length > 0,
    },
    {
      title: "Time & Duration",
      valid: Number(hoursPerWeek) > 0,
    },
    {
      title: "Your Goal",
      valid: true,
    },
  ];

  const handleGenerate = () => {
    const planType = duration === "yearly" ? "12-month" : "4-week";
    const prompt = `Please create a detailed ${planType} study plan for me.

📚 **Subject:** ${subject}
🎓 **Level / Syllabus:** ${level}
⏱️ **Study time available:** ${hoursPerWeek} hours per week
🎯 **Goal:** ${goal || "Master the subject and achieve excellent exam results"}

${duration === "yearly" ? `Structure the plan as a **12-month roadmap**:
- **Month 1–3 (Foundation):** Core concepts, key vocabulary, basic skills
- **Month 4–6 (Development):** Deeper understanding, problem-solving practice
- **Month 7–9 (Advanced):** Past paper practice, difficult topics, exam technique
- **Month 10–11 (Revision):** Full topic revision, mock exams, weak area focus
- **Month 12 (Final Prep):** Targeted revision, confidence building, exam strategy

For EACH month include:
1. 2–4 specific topics to master (with subtopics)
2. Recommended resources (textbooks chapters, YouTube channels, websites)
3. Practice activities (past paper questions, problem sets, essays)
4. A self-test checkpoint to assess understanding
5. Rough daily schedule (${Math.round(Number(hoursPerWeek) / 7 * 10) / 10} hours/day)` :
`Structure the plan as a **4-week monthly plan**:
- **Week 1:** Foundation topics — build core understanding
- **Week 2:** Key concepts in depth — worked examples and practice
- **Week 3:** Problem-solving and past paper questions
- **Week 4:** Consolidation, mini revision test, and weak area fix

For EACH week include:
1. Specific topics and subtopics to cover
2. Daily study schedule (${Math.round(Number(hoursPerWeek) / 7 * 10) / 10} hours/day target)
3. Recommended resources and practice exercises
4. End-of-week self-assessment questions`}

Format with clear headers, bullet points, and ✅ checkboxes so I can track progress. Make it motivating, realistic, and actionable!`;
    onGenerate(prompt);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute inset-0 z-50 bg-background/95 backdrop-blur flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-border/50 flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
          <CalendarRange className="w-3.5 h-3.5 text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-blue-400">Study Plan Builder</p>
          <p className="text-[10px] text-muted-foreground">Step {step + 1} of 3 — {steps[step].title}</p>
        </div>
        <button onClick={onClose} className="p-1 rounded text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Step indicators */}
      <div className="flex gap-1 px-4 pt-3">
        {steps.map((s, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all ${
              i <= step ? "bg-blue-500" : "bg-border/50"
            }`}
          />
        ))}
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Subject</p>
                <input
                  className="w-full bg-card border border-border/50 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500/50 placeholder:text-muted-foreground/50"
                  placeholder="e.g. Mathematics, Physics, Biology…"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  autoFocus
                />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Level / Syllabus</p>
                <div className="flex flex-wrap gap-1.5">
                  {LEVELS.map((l) => (
                    <button
                      key={l}
                      onClick={() => setLevel(l)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                        level === l
                          ? "bg-blue-500/20 border-blue-500/40 text-blue-400"
                          : "border-border/50 text-muted-foreground hover:text-foreground hover:border-border"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Plan Duration</p>
                <div className="grid grid-cols-2 gap-2">
                  {(["monthly", "yearly"] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${
                        duration === d
                          ? "bg-blue-500/15 border-blue-500/40 text-blue-400"
                          : "border-border/50 text-muted-foreground hover:border-border"
                      }`}
                    >
                      <span className="text-lg">{d === "monthly" ? "📅" : "🗓️"}</span>
                      <span className="text-xs font-semibold capitalize">{d}</span>
                      <span className="text-[10px] opacity-70">{d === "monthly" ? "4-week plan" : "12-month roadmap"}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Study Hours Per Week
                </p>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="3"
                    max="40"
                    value={hoursPerWeek}
                    onChange={(e) => setHoursPerWeek(e.target.value)}
                    className="flex-1 accent-blue-500"
                  />
                  <span className="text-sm font-bold text-blue-400 w-16 text-right">{hoursPerWeek}h/wk</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  ≈ {Math.round(Number(hoursPerWeek) / 7 * 10) / 10}h/day · {duration === "yearly" ? Math.round(Number(hoursPerWeek) * 52) : Math.round(Number(hoursPerWeek) * 4)} hours total
                </p>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Your Goal (optional)</p>
                <textarea
                  className="w-full bg-card border border-border/50 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500/50 placeholder:text-muted-foreground/50 resize-none"
                  placeholder="e.g. Get an A* in A-Level Chemistry, pass my university entrance exam…"
                  rows={3}
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                />
              </div>
              <div className="p-3 bg-blue-500/5 border border-blue-500/15 rounded-xl space-y-1.5">
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Plan Summary</p>
                <div className="flex flex-col gap-1">
                  {[
                    { emoji: "📚", label: "Subject", value: `${subject} (${level})` },
                    { emoji: "⏱️", label: "Duration", value: duration === "yearly" ? "12-month roadmap" : "4-week monthly plan" },
                    { emoji: "🕐", label: "Study time", value: `${hoursPerWeek}h/week` },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2 text-xs">
                      <span>{item.emoji}</span>
                      <span className="text-muted-foreground">{item.label}:</span>
                      <span className="text-foreground font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav buttons */}
      <div className="p-4 border-t border-border/50 flex gap-2">
        {step > 0 && (
          <button
            onClick={() => setStep(s => s - 1)}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground border border-border/50 hover:border-border transition-all"
          >
            <ChevronLeft className="w-3 h-3" /> Back
          </button>
        )}
        <button
          onClick={() => {
            if (step < 2) setStep(s => s + 1);
            else handleGenerate();
          }}
          disabled={!steps[step].valid}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {step < 2 ? (
            <>Next <ChevronRight className="w-3 h-3" /></>
          ) : (
            <><CalendarRange className="w-3.5 h-3.5" /> Generate My Plan</>
          )}
        </button>
      </div>
    </motion.div>
  );
}

// ─── Welcome Screen ───────────────────────────────────────────────────────────

function WelcomeScreen({ profile, onCreate }: { profile: any; onCreate: () => void }) {
  const name = profile?.name ?? "Learner";
  const interests = profile?.interests?.join(", ") || "your studies";
  const goals = profile?.goals || "mastering your subjects";

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.0, 0.0, 0.2, 1] }}
        className="max-w-md"
      >
        {/* 3D Floating Gem */}
        <motion.div
          className="mx-auto mb-5"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
        >
          <FloatingGem size={130} className="mx-auto" />
        </motion.div>

        <motion.h2
          className="text-2xl font-bold mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.35 }}
        >
          Hello, <span className="text-primary">{name}</span>! 👋
        </motion.h2>
        <motion.p
          className="text-sm text-muted-foreground mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          I'm <span className="text-primary font-semibold">Falcoa</span>, your personal AI tutor.
          I know you're into <span className="text-foreground">{interests}</span> and your goal is <span className="text-foreground">{goals}</span>.
        </motion.p>
        <motion.p
          className="text-xs text-muted-foreground mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.38 }}
        >
          Ask me anything — concepts, exam prep, study plans, or just to explain something in a new way.
        </motion.p>

        <motion.div
          className="flex flex-wrap gap-2 justify-center mb-6"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.44 }}
        >
          {[
            "Create a study plan for me",
            "Quiz me on my interests",
            "Explain something I'm stuck on",
            "Help me prepare for exams",
          ].map((prompt) => (
            <motion.button
              key={prompt}
              onClick={() => onCreate()}
              className="text-xs bg-card border border-border/50 hover:border-primary/40 hover:bg-primary/5 px-3 py-1.5 rounded-full transition-colors text-muted-foreground hover:text-foreground"
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.97 }}
            >
              {prompt}
            </motion.button>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.52 }}
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.02 }}
        >
          <Button onClick={onCreate} className="gap-2">
            <Plus className="w-4 h-4" /> Start a Conversation
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}

// ─── Chat View ────────────────────────────────────────────────────────────────

function ChatView({ convId, profile }: { convId: number; profile: any }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autoGreetRef = useRef(false);

  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);

  const { data: messages, isLoading } = useListMessages(convId, {
    query: { enabled: !!convId, queryKey: getListMessagesQueryKey(convId) },
  });
  const sendMessage = useSendMessage();

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sendMessage.isPending]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 140) + "px";
  }, [input]);

  // Auto greeting on first message
  useEffect(() => {
    if (autoGreetRef.current) return;
    if (!messages || messages.length > 0 || isLoading) return;
    if (!profile) return;
    autoGreetRef.current = true;
    const greeting = `Hello ${profile.name}! I'm Falcoa, your personal AI tutor. I can see you're a ${profile.class} student interested in ${(profile.interests || []).join(" and ")}. Your goal is: ${profile.goals || "to learn and grow"}. How can I help you today?`;
    sendMessage.mutate(
      { id: convId, data: { content: `__greeting__${greeting}`, model: MODEL_ID } },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListMessagesQueryKey(convId) }) }
    );
  }, [messages, isLoading, profile]);

  const handleSend = () => {
    if ((!input.trim() && !attachedFile)) return;
    const content = attachedFile
      ? `[File: ${attachedFile.name}]\n\n${input.trim() || "Please analyse this file."}`
      : input.trim();
    setInput("");
    setAttachedFile(null);
    sendMessage.mutate(
      { id: convId, data: { content, model: MODEL_ID } },
      {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getListMessagesQueryKey(convId) }),
        onError: () => toast({ title: "Failed to send message", variant: "destructive" }),
      }
    );
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAttachedFile(file);
    e.target.value = "";
  };

  const handleCopy = (id: number, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {(messages ?? []).filter((m: Message) => !m.content.startsWith("__greeting__")).map((msg: Message) => (
              <motion.div
                key={msg.id}
                variants={messageVariants}
                initial="initial"
                animate="animate"
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  msg.role === "user" ? "bg-primary" : "bg-card border border-border/60"
                }`}>
                  {msg.role === "user"
                    ? <span className="text-[10px] text-white font-bold">{profile?.name?.[0] ?? "U"}</span>
                    : <img src="/falcoa-logo.png" alt="" className="w-5 h-5 object-contain" />}
                </div>
                <div className={`flex-1 max-w-[78%] ${msg.role === "user" ? "flex justify-end" : ""}`}>
                  {msg.role === "user" ? (
                    <div className="bg-primary/15 border border-primary/25 rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm">
                      {msg.content}
                    </div>
                  ) : (
                    <div className="bg-card border border-border/50 rounded-2xl rounded-tl-sm px-4 py-3 text-sm group relative">
                      <MessageRenderer content={msg.content} />
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded text-muted-foreground hover:text-foreground transition-all"
                      >
                        {copiedId === msg.id ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        {sendMessage.isPending && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-card border border-border/60 flex items-center justify-center shrink-0">
              <img src="/falcoa-logo.png" alt="" className="w-5 h-5 object-contain animate-pulse" />
            </div>
            <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-tl-sm bg-card border border-border/40">
              {[0, 150, 300].map(d => (
                <div key={d} className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${d}ms` }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border/50 bg-card/30 px-4 py-3">
        {attachedFile && (
          <div className="flex items-center gap-2 mb-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg text-xs">
            <Upload className="w-3 h-3" />
            <span className="truncate flex-1">{attachedFile.name}</span>
            <button onClick={() => setAttachedFile(null)} className="text-muted-foreground hover:text-foreground">✕</button>
          </div>
        )}
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex items-end gap-2"
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
            }}
            placeholder="Ask Falcoa anything… (Enter to send)"
            rows={1}
            className="flex-1 bg-transparent resize-none outline-none text-sm placeholder:text-muted-foreground/60 min-h-[36px] max-h-[140px] leading-relaxed py-1.5"
            disabled={sendMessage.isPending}
          />
          <div className="flex items-center gap-1.5 shrink-0">
            <input ref={fileRef} type="file" className="hidden" accept=".pdf,.docx,.txt,.jpg,.jpeg,.png,.csv" onChange={handleFile} />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
            >
              <Upload className="w-4 h-4" />
            </button>
            <Button type="submit" size="sm" disabled={(!input.trim() && !attachedFile) || sendMessage.isPending} className="rounded-xl px-4">
              {sendMessage.isPending
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FalcoaPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: profile } = useGetProfile();
  const { data: conversations } = useListConversations();
  const createConv = useCreateConversation();
  const deleteConv = useDeleteConversation();
  const pageSendMessage = useSendMessage();

  const [activeId, setActiveId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showStudyPlan, setShowStudyPlan] = useState(false);

  // Auto-select first conversation
  useEffect(() => {
    if (!activeId && conversations && conversations.length > 0) {
      setActiveId(conversations[0].id);
    }
  }, [conversations]);

  const handleNew = () => {
    createConv.mutate(
      { data: { title: `Chat — ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`, model: MODEL_ID } },
      {
        onSuccess: (conv: Conversation) => {
          queryClient.invalidateQueries({ queryKey: getListConversationsQueryKey() });
          setActiveId(conv.id);
          setSidebarOpen(false);
        },
        onError: () => toast({ title: "Failed to create conversation", variant: "destructive" }),
      }
    );
  };

  const handleDelete = (id: number) => {
    deleteConv.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListConversationsQueryKey() });
          if (activeId === id) {
            const remaining = (conversations ?? []).filter((c: Conversation) => c.id !== id);
            setActiveId(remaining[0]?.id ?? null);
          }
        },
      }
    );
  };

  const handleSelectConv = (id: number) => {
    setActiveId(id);
    setSidebarOpen(false);
  };

  const handleStudyPlan = (prompt: string) => {
    const title = `Study Plan — ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`;
    createConv.mutate(
      { data: { title, model: MODEL_ID } },
      {
        onSuccess: (conv: Conversation) => {
          queryClient.invalidateQueries({ queryKey: getListConversationsQueryKey() });
          setActiveId(conv.id);
          setSidebarOpen(false);
          pageSendMessage.mutate(
            { id: conv.id, data: { content: prompt, model: MODEL_ID } },
            { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListMessagesQueryKey(conv.id) }) }
          );
        },
        onError: () => toast({ title: "Failed to start study plan", variant: "destructive" }),
      }
    );
  };

  const SidebarPanel = () => (
    <div className="flex flex-col h-full">
      {/* Falcoa header */}
      <div className="p-3 border-b border-border/50 flex items-center gap-2">
        <div className="w-8 h-8 rounded-full border border-primary/40 shadow-[0_0_10px_rgba(59,130,246,0.3)] overflow-hidden shrink-0">
          <img src="/falcoa-logo.png" alt="Falcoa" className="w-full h-full object-contain" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-primary">Falcoa AI</p>
          <p className="text-[10px] text-muted-foreground">Your personal tutor</p>
        </div>
        <Button size="icon" variant="ghost" onClick={handleNew} className="w-7 h-7 shrink-0" title="New chat">
          <Plus className="w-3.5 h-3.5" />
        </Button>
        {/* Close button — mobile only */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="md:hidden w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Profile card */}
      <div className="pt-2">
        <ProfileCard profile={profile} />
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto py-1 px-1 space-y-0.5">
        {conversations && conversations.length > 0 ? (
          <>
            <div className="px-3 py-1">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Conversations</span>
            </div>
            {conversations.map((conv: Conversation) => (
              <ConvItem
                key={conv.id}
                id={conv.id}
                title={conv.title}
                active={activeId === conv.id}
                onSelect={() => handleSelectConv(conv.id)}
                onDelete={() => handleDelete(conv.id)}
              />
            ))}
          </>
        ) : (
          <div className="px-3 py-4 text-center">
            <BookOpen className="w-5 h-5 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-[10px] text-muted-foreground">No conversations yet</p>
          </div>
        )}
      </div>

      {/* Study Plan button */}
      <div className="px-2 pb-2">
        <button
          onClick={() => setShowStudyPlan(true)}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-500/40 text-blue-400 transition-all"
        >
          <CalendarRange className="w-3.5 h-3.5 shrink-0" />
          Create Study Plan
          <ChevronRight className="w-3 h-3 ml-auto opacity-60" />
        </button>
      </div>

      {/* Study tip */}
      <div className="p-3 border-t border-border/50">
        <div className="flex items-start gap-2 bg-primary/5 border border-primary/15 rounded-xl p-2">
          <Target className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
          <p className="text-[9px] text-muted-foreground leading-relaxed">
            Falcoa knows your profile and adapts to your learning style and goals.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-full overflow-hidden relative">
      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — always visible on desktop, slide-in drawer on mobile */}
      <div className={`
        fixed md:relative inset-y-0 left-0 z-30
        w-64 border-r border-border/50 bg-background md:bg-sidebar/20 shrink-0
        flex flex-col
        transition-transform duration-250 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <div className="relative h-full">
          <SidebarPanel />
          <AnimatePresence>
            {showStudyPlan && (
              <StudyPlanWizard
                onClose={() => setShowStudyPlan(false)}
                onGenerate={handleStudyPlan}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Chat header */}
        <div className="h-14 border-b border-border/50 flex items-center px-4 gap-3 shrink-0">
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50"
          >
            <Menu className="w-5 h-5" />
          </button>
          <p className="font-semibold text-sm truncate flex-1">
            {activeId && conversations
              ? (conversations.find((c: Conversation) => c.id === activeId)?.title ?? "Chat")
              : "Falcoa AI"}
          </p>
          {/* New chat shortcut — mobile */}
          <button
            onClick={handleNew}
            className="md:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {activeId ? (
          <ChatView convId={activeId} profile={profile} />
        ) : (
          <WelcomeScreen profile={profile} onCreate={handleNew} />
        )}
      </div>
    </div>
  );
}
