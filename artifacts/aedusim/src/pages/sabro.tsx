import { useState } from "react";
import { useListChallenges, useAttemptChallenge, useGetProgress, getListChallengesQueryKey, getGetProgressQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Target, Star, Brain, CheckCircle2, XCircle, Trophy, Flame, Zap, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const OPTION_LETTERS = ["A", "B", "C", "D"];

export default function SabroPage() {
  const { data: challenges, isLoading } = useListChallenges();
  const { data: progress } = useGetProgress();
  const attemptChallenge = useAttemptChallenge();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [selectedIndices, setSelectedIndices] = useState<Record<number, number>>({});
  const [results, setResults] = useState<Record<number, { correct: boolean; explanation: string; xp: number; correctAnswer: string }>>({});

  const handleSelect = (challengeId: number, index: number) => {
    if (results[challengeId]) return;
    setSelectedIndices(prev => ({ ...prev, [challengeId]: index }));
  };

  const handleSubmit = (challengeId: number) => {
    const selectedIndex = selectedIndices[challengeId];
    if (selectedIndex === undefined) return;
    const letter = OPTION_LETTERS[selectedIndex];
    attemptChallenge.mutate({ id: challengeId, data: { answer: letter } }, {
      onSuccess: (res) => {
        setResults(prev => ({
          ...prev,
          [challengeId]: { correct: res.correct, explanation: res.explanation, xp: res.xpEarned, correctAnswer: res.correctAnswer }
        }));
        queryClient.invalidateQueries({ queryKey: getListChallengesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetProgressQueryKey() });
        if (res.correct) {
          toast({ title: `+${res.xpEarned} XP Earned!`, description: "Brilliant! Keep going!" });
        } else {
          toast({ title: "Not quite right", description: "Study the explanation carefully.", variant: "destructive" });
        }
      },
      onError: () => toast({ title: "Failed to submit", variant: "destructive" }),
    });
  };

  const completedCount = Object.values(results).filter(r => r.correct).length;
  const attemptedCount = Object.keys(results).length;

  return (
    <div className="h-full overflow-y-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-500/5 via-background to-background p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card/40 border border-border/50 p-5 rounded-3xl backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center p-2">
              <img src="/sabro-avatar.png" alt="Sabro" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Sabro Challenges</h1>
              <p className="text-muted-foreground text-sm">Train your mind. Earn XP. Level up your rank.</p>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            <div className="bg-card border border-border/50 px-4 py-2.5 rounded-xl flex items-center gap-2.5">
              <Star className="w-5 h-5 text-yellow-400" />
              <div>
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total XP</div>
                <div className="font-mono text-xl font-bold leading-none">{progress?.xp || 0}</div>
              </div>
            </div>
            <div className="bg-card border border-border/50 px-4 py-2.5 rounded-xl flex items-center gap-2.5">
              <Target className="w-5 h-5 text-primary" />
              <div>
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Rank</div>
                <div className="font-mono text-xl font-bold leading-none text-primary">{progress?.rank || "Novice"}</div>
              </div>
            </div>
            <div className="bg-card border border-border/50 px-4 py-2.5 rounded-xl flex items-center gap-2.5">
              <Trophy className="w-5 h-5 text-orange-400" />
              <div>
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Score</div>
                <div className="font-mono text-xl font-bold leading-none text-orange-400">{completedCount}/{attemptedCount || "—"}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Session progress */}
        {attemptedCount > 0 && (
          <div className="bg-card/40 border border-border/50 rounded-2xl p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Session Progress</span>
              <span className="font-medium text-orange-400">{completedCount} correct of {attemptedCount} attempted</span>
            </div>
            <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${attemptedCount > 0 ? (completedCount / attemptedCount) * 100 : 0}%` }}
                className="h-full rounded-full bg-gradient-to-r from-orange-500 to-yellow-400"
              />
            </div>
          </div>
        )}

        {/* Challenges */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {Array(4).fill(0).map((_, i) => <div key={i} className="h-72 rounded-3xl bg-card border border-border/50 animate-pulse" />)}
          </div>
        ) : !challenges?.length ? (
          <div className="text-center py-20 text-muted-foreground">
            <Target className="w-12 h-12 mx-auto opacity-20 mb-3" />
            <p>No challenges available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {challenges.map((challenge) => {
              const result = results[challenge.id];
              const isCompleted = challenge.completed || !!result;
              const selectedIndex = selectedIndices[challenge.id];
              const options = (challenge.options as string[]) || [];

              return (
                <motion.div key={challenge.id} layout>
                  <Card className={`overflow-hidden border-border/50 transition-all h-full flex flex-col ${
                    isCompleted ? "opacity-85" : "hover:border-orange-500/30 hover:shadow-[0_4px_24px_rgba(249,115,22,0.08)]"
                  }`}>
                    <div className="flex border-b border-border/50 bg-card/60 shrink-0">
                      <div className="p-4 shrink-0 border-r border-border/50">
                        <img
                          src={challenge.avatar === "newton" ? "/newton-avatar.jpg" : "/einstein-avatar.jpg"}
                          alt={challenge.avatar}
                          className="w-16 h-16 rounded-xl object-cover border border-border"
                        />
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-center min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          <Badge variant="outline" className="text-[10px] h-5 px-1.5">{challenge.subject}</Badge>
                          <Badge className={`text-[10px] h-5 px-1.5 border ${
                            challenge.difficulty === "hard" ? "bg-red-500/20 text-red-400 border-red-500/30"
                            : challenge.difficulty === "medium" ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                            : "bg-green-500/20 text-green-400 border-green-500/30"
                          }`}>
                            {challenge.difficulty?.toUpperCase()}
                          </Badge>
                          <span className="ml-auto text-xs font-bold text-yellow-400 flex items-center gap-1 shrink-0">
                            <Zap className="w-3 h-3" /> {challenge.xpReward} XP
                          </span>
                        </div>
                        <CardTitle className="text-base leading-tight">{challenge.title}</CardTitle>
                      </div>
                    </div>

                    <CardContent className="p-5 space-y-4 flex-1">
                      <p className="text-sm border-l-2 border-primary/40 pl-3 italic text-muted-foreground leading-relaxed">
                        "{challenge.description}"
                      </p>
                      <p className="font-medium text-sm">{challenge.question}</p>
                      <div className="space-y-2">
                        {options.map((opt, i) => {
                          const letter = OPTION_LETTERS[i];
                          let cls = "w-full text-left p-3 rounded-xl border transition-all text-sm flex items-center gap-3 ";
                          if (!isCompleted) {
                            cls += selectedIndex === i
                              ? "border-primary bg-primary/10 text-foreground"
                              : "border-border/40 bg-background/30 hover:bg-accent/40 hover:border-border text-muted-foreground hover:text-foreground";
                          } else {
                            const correctLetter = result?.correctAnswer || "";
                            if (letter === correctLetter) cls += "border-green-500 bg-green-500/10 text-green-400";
                            else if (selectedIndex === i) cls += "border-red-500 bg-red-500/10 text-red-400";
                            else cls += "border-border/20 bg-background/20 text-muted-foreground opacity-40";
                          }
                          return (
                            <button key={i} onClick={() => handleSelect(challenge.id, i)} disabled={isCompleted} className={cls}>
                              <span className="w-6 h-6 rounded-full border border-current/30 flex items-center justify-center text-[11px] font-bold shrink-0">{letter}</span>
                              <span className="flex-1 text-left leading-snug">{opt}</span>
                              {isCompleted && letter === result?.correctAnswer && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />}
                              {isCompleted && selectedIndex === i && letter !== result?.correctAnswer && <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </CardContent>

                    <CardFooter className="bg-card/30 p-4 border-t border-border/50 flex flex-col gap-3 shrink-0">
                      <AnimatePresence>
                        {result && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className={`w-full text-sm p-3 rounded-xl ${
                              result.correct
                                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                : "bg-orange-500/10 text-orange-300 border border-orange-500/20"
                            }`}
                          >
                            <div className="font-bold mb-1">{result.correct ? "Excellent! Well done!" : "Not quite — here's why:"}</div>
                            <p className="text-xs leading-relaxed opacity-90">{result.explanation}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      {!isCompleted ? (
                        <Button
                          className="w-full"
                          disabled={selectedIndex === undefined || attemptChallenge.isPending}
                          onClick={() => handleSubmit(challenge.id)}
                        >
                          <Brain className="w-4 h-4 mr-2" />
                          Submit Answer
                        </Button>
                      ) : (
                        <div className={`w-full text-center text-sm font-medium flex items-center justify-center gap-2 ${result?.correct ? "text-green-400" : "text-muted-foreground"}`}>
                          {result?.correct
                            ? <><Trophy className="w-4 h-4 text-yellow-400" /> Completed — +{result.xp} XP</>
                            : <><RefreshCw className="w-4 h-4" /> Review the explanation above</>}
                        </div>
                      )}
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
