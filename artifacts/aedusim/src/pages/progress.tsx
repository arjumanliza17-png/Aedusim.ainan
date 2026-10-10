import { useState } from "react";
import { useGetProgress } from "@workspace/api-client-react";
import { Link } from "wouter";
import {
  Trophy, Flame, Star, Target, MessageSquare, BrainCircuit,
  TrendingUp, AlertTriangle, CheckCircle2, BookOpen, Zap,
  FileText, BarChart3, Brain, Calendar, ChevronRight, Lightbulb
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { motion } from "framer-motion";

// Derived subject tracking from usage (simulated from profile data)
const SUBJECT_DATA = [
  { subject: "Physics", studied: 87, score: 74, trend: "+8%", color: "bg-blue-500", textColor: "text-blue-400", weakTopic: "Quantum Mechanics" },
  { subject: "Mathematics", studied: 72, score: 81, trend: "+5%", color: "bg-purple-500", textColor: "text-purple-400", weakTopic: "Integration by Parts" },
  { subject: "Chemistry", studied: 54, score: 63, trend: "-3%", color: "bg-green-500", textColor: "text-green-400", weakTopic: "Equilibrium Constants" },
  { subject: "Biology", studied: 41, score: 78, trend: "+12%", color: "bg-emerald-500", textColor: "text-emerald-400", weakTopic: "Genetics Punnett Squares" },
  { subject: "History", studied: 23, score: 55, trend: "0%", color: "bg-amber-500", textColor: "text-amber-400", weakTopic: "Primary Sources Analysis" },
];

const MISTAKE_DNA = [
  { topic: "Quantum Mechanics — Uncertainty Principle", attempts: 4, solved: 1, subject: "Physics", severity: "high" },
  { topic: "Integration by Substitution", attempts: 3, solved: 2, subject: "Mathematics", severity: "medium" },
  { topic: "Le Chatelier's Principle (Pressure)", attempts: 2, solved: 0, subject: "Chemistry", severity: "high" },
  { topic: "Meiosis vs Mitosis", attempts: 3, solved: 2, subject: "Biology", severity: "medium" },
  { topic: "Essay Structure — Analytical Paragraphs", attempts: 2, solved: 1, subject: "English", severity: "low" },
];

const DAILY_RECOMMENDATIONS = [
  { title: "Review Newton's Laws", detail: "You haven't studied mechanics this week", subject: "Physics", type: "review", link: "/falcoa" },
  { title: "Practice Equilibrium MCQs", detail: "Weak area detected — 3 wrong in Sabro", subject: "Chemistry", type: "practice", link: "/sabro" },
  { title: "Upload today's class notes", detail: "Knowledge Hub keeps you organized", subject: "General", type: "upload", link: "/notebook" },
];

const BADGE_DATA = [
  { name: "First Steps", icon: "🎯", desc: "Completed first challenge", earned: true },
  { name: "Knowledge Seeker", icon: "📚", desc: "Uploaded 5 documents", earned: true },
  { name: "Challenger", icon: "⚔️", desc: "10 Sabro challenges completed", earned: false },
  { name: "Streak Master", icon: "🔥", desc: "7-day learning streak", earned: false },
  { name: "Exam Pro", icon: "🏆", desc: "Score 90%+ on an exam", earned: false },
  { name: "AI Scholar", icon: "🤖", desc: "100 Falcoa AI conversations", earned: false },
];

function getRank(level: number) {
  if (level >= 20) return { name: "Grand Master", color: "text-amber-400", next: null };
  if (level >= 15) return { name: "Expert", color: "text-purple-400", next: "Grand Master" };
  if (level >= 10) return { name: "Advanced", color: "text-blue-400", next: "Expert" };
  if (level >= 5) return { name: "Intermediate", color: "text-green-400", next: "Advanced" };
  return { name: "Beginner", color: "text-muted-foreground", next: "Intermediate" };
}

export default function ProgressPage() {
  const { data: progress, isLoading } = useGetProgress();
  const [activeTab, setActiveTab] = useState<"overview" | "subjects" | "mistakes" | "badges">("overview");

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!progress) return null;

  const nextLevelXp = progress.level * 1000;
  const xpProgress = Math.min((progress.xp / nextLevelXp) * 100, 100);
  const rankInfo = getRank(progress.level);

  const chartData = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => ({
    name: day,
    xp: progress.weeklyXp[i] || 0,
  }));

  return (
    <div className="h-full overflow-y-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-card border border-border/50 p-6 md:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />
          <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
            <div className="w-28 h-28 rounded-full bg-background border-[3px] border-primary/40 flex items-center justify-center relative shadow-[0_0_40px_rgba(59,130,246,0.25)] shrink-0">
              <div className="text-5xl font-bold font-mono text-primary">{progress.level}</div>
              <div className="absolute -bottom-3 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Level
              </div>
            </div>
            <div className="flex-1 w-full space-y-3">
              <div className="flex flex-wrap justify-between items-end gap-2">
                <div>
                  <div className={`text-2xl font-bold ${rankInfo.color}`}>{rankInfo.name}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2 mt-0.5">
                    <Star className="w-4 h-4 text-amber-400" /> {progress.xp.toLocaleString()} XP total
                  </div>
                </div>
                {rankInfo.next && (
                  <div className="text-xs text-muted-foreground font-mono bg-background/60 px-3 py-1.5 rounded-lg border border-border/50">
                    {(nextLevelXp - progress.xp).toLocaleString()} XP to {rankInfo.next}
                  </div>
                )}
              </div>
              <div>
                <ProgressBar value={xpProgress} className="h-3 bg-background border border-border/30" />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>{progress.xp.toLocaleString()} XP</span>
                  <span>{nextLevelXp.toLocaleString()} XP</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: <Flame className="w-5 h-5 text-orange-400" />, value: progress.streak, label: "Day Streak", color: "bg-orange-500/20" },
            { icon: <MessageSquare className="w-5 h-5 text-blue-400" />, value: progress.totalMessages, label: "AI Chats", color: "bg-blue-500/20" },
            { icon: <Target className="w-5 h-5 text-green-400" />, value: progress.completedChallenges, label: "Challenges", color: "bg-green-500/20" },
            { icon: <Trophy className="w-5 h-5 text-purple-400" />, value: progress.badges.length, label: "Badges", color: "bg-purple-500/20" },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="bg-card/50 border-border/50 hover:border-border transition-all">
                <CardContent className="p-5 flex flex-col items-center gap-2 text-center">
                  <div className={`w-11 h-11 rounded-full ${stat.color} flex items-center justify-center`}>{stat.icon}</div>
                  <div className="text-3xl font-bold font-mono">{stat.value}</div>
                  <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{stat.label}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Daily Recommendations */}
        <div className="bg-card/40 border border-primary/20 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            <h2 className="font-semibold">Today's AI Recommendations</h2>
            <Badge variant="outline" className="text-[10px] text-yellow-400 border-yellow-400/30 ml-auto">Personalised</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {DAILY_RECOMMENDATIONS.map((rec, i) => (
              <Link key={i} href={rec.link}>
                <div className="p-3 bg-background/60 border border-border/50 rounded-xl hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer group">
                  <div className="flex items-start gap-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      rec.type === "review" ? "bg-blue-500/20 text-blue-400"
                      : rec.type === "practice" ? "bg-orange-500/20 text-orange-400"
                      : "bg-green-500/20 text-green-400"
                    }`}>
                      {rec.type === "review" ? <Brain className="w-3.5 h-3.5" />
                       : rec.type === "practice" ? <Target className="w-3.5 h-3.5" />
                       : <BookOpen className="w-3.5 h-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm group-hover:text-primary transition-colors truncate">{rec.title}</div>
                      <div className="text-xs text-muted-foreground">{rec.detail}</div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-card/50 border border-border/50 p-1 rounded-xl">
          {(["overview", "subjects", "mistakes", "badges"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium capitalize transition-all ${
                activeTab === tab ? "bg-background text-foreground shadow-sm border border-border/50" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "mistakes" ? "Mistake DNA" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <Card className="lg:col-span-2 border-border/50 bg-card/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" /> Weekly XP Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip
                        cursor={{ fill: "hsl(var(--accent))" }}
                        contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                      />
                      <Bar dataKey="xp" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-400" /> Subject Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {SUBJECT_DATA.slice(0, 4).map(s => (
                  <div key={s.subject} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className={s.textColor + " font-medium"}>{s.subject}</span>
                      <span className="text-muted-foreground">{s.score}% avg</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${s.score}%` }}
                        className={`h-full rounded-full ${s.color}`}
                      />
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full mt-2 text-xs" onClick={() => setActiveTab("subjects")}>
                  View Full Analysis <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Subjects Tab */}
        {activeTab === "subjects" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <h2 className="font-semibold flex items-center gap-2"><BookOpen className="w-5 h-5 text-blue-400" /> Subject Interest & Performance Tracking</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {SUBJECT_DATA.map((s, i) => (
                <motion.div key={s.subject} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="bg-card/50 border-border/50 hover:border-border transition-all">
                    <CardContent className="p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className={`font-bold ${s.textColor}`}>{s.subject}</h3>
                        <Badge variant="outline" className={`text-[10px] ${s.trend.startsWith("+") ? "text-green-400 border-green-500/30" : s.trend.startsWith("-") ? "text-red-400 border-red-500/30" : "text-muted-foreground"}`}>
                          {s.trend}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Study sessions</span>
                          <span className="font-medium text-foreground">{s.studied}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted/40 overflow-hidden">
                          <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.studied}%` }} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Average score</span>
                          <span className={`font-medium ${s.score >= 70 ? "text-green-400" : s.score >= 50 ? "text-amber-400" : "text-red-400"}`}>{s.score}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted/40 overflow-hidden">
                          <div className={`h-full rounded-full ${s.score >= 70 ? "bg-green-500" : s.score >= 50 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${s.score}%` }} />
                        </div>
                      </div>
                      <div className="flex items-start gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-amber-300 font-medium">Weak topic</div>
                          <div className="text-muted-foreground">{s.weakTopic}</div>
                        </div>
                      </div>
                      <Link href="/falcoa">
                        <Button variant="outline" size="sm" className="w-full text-xs">
                          Study with AI <ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Mistake DNA */}
        {activeTab === "mistakes" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div>
              <h2 className="font-semibold flex items-center gap-2 mb-1">
                <Brain className="w-5 h-5 text-rose-400" /> Mistake DNA System
              </h2>
              <p className="text-sm text-muted-foreground">Topics where you've made repeated mistakes. Focus here to close your knowledge gaps.</p>
            </div>
            <div className="space-y-3">
              {MISTAKE_DNA.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="bg-card/50 border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-3 h-3 rounded-full shrink-0 mt-1.5 ${
                          m.severity === "high" ? "bg-red-500" : m.severity === "medium" ? "bg-amber-500" : "bg-blue-500"
                        }`} />
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium text-sm">{m.topic}</span>
                            <Badge variant="outline" className="text-[9px] h-4 px-1.5">{m.subject}</Badge>
                            <Badge variant="outline" className={`text-[9px] h-4 px-1.5 ${
                              m.severity === "high" ? "text-red-400 border-red-500/30"
                              : m.severity === "medium" ? "text-amber-400 border-amber-500/30"
                              : "text-blue-400 border-blue-500/30"
                            }`}>
                              {m.severity} priority
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-red-400" /> {m.attempts} attempts
                            </span>
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-green-400" /> {m.solved} solved
                            </span>
                            <span className="flex items-center gap-1">
                              <Target className="w-3 h-3" /> {Math.round((m.solved / m.attempts) * 100)}% success rate
                            </span>
                          </div>
                          <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden max-w-[200px]">
                            <div
                              className={`h-full rounded-full ${m.solved / m.attempts >= 0.7 ? "bg-green-500" : m.solved / m.attempts >= 0.4 ? "bg-amber-500" : "bg-red-500"}`}
                              style={{ width: `${(m.solved / m.attempts) * 100}%` }}
                            />
                          </div>
                        </div>
                        <Link href="/falcoa">
                          <Button variant="outline" size="sm" className="text-xs shrink-0">
                            <Zap className="w-3 h-3 mr-1" /> Fix This
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Badges Tab */}
        {activeTab === "badges" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <h2 className="font-semibold flex items-center gap-2"><Trophy className="w-5 h-5 text-amber-400" /> Achievement Badges</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {BADGE_DATA.map((badge, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                  <div className={`p-4 rounded-2xl border text-center transition-all ${
                    badge.earned
                      ? "bg-amber-500/10 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                      : "bg-muted/20 border-border/30 opacity-50 grayscale"
                  }`}>
                    <div className="text-3xl mb-2">{badge.icon}</div>
                    <div className={`text-xs font-bold ${badge.earned ? "text-amber-400" : "text-muted-foreground"}`}>{badge.name}</div>
                    <div className="text-[10px] text-muted-foreground mt-1 leading-tight">{badge.desc}</div>
                    {badge.earned && <div className="mt-2 text-[10px] text-green-400 flex items-center justify-center gap-1"><CheckCircle2 className="w-3 h-3" /> Earned</div>}
                  </div>
                </motion.div>
              ))}
            </div>

            {progress.badges.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2 text-muted-foreground">Your Earned Badges</h3>
                <div className="flex flex-wrap gap-2">
                  {progress.badges.map((badge, i) => (
                    <div key={i} className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-lg text-sm">
                      <Trophy className="w-4 h-4 text-amber-400" />
                      <span>{badge}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

      </div>
    </div>
  );
}
