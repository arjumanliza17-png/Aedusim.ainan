import { motion } from "framer-motion";
import { Zap, Target, BookOpen, TrendingUp, MessageSquare, Star, CheckCircle2, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

const sections = [
  {
    id: "falcoa",
    icon: <Zap className="w-6 h-6 text-yellow-400" />,
    color: "from-yellow-500/10 to-amber-500/10",
    border: "border-yellow-500/20",
    badge: "AI Chat",
    title: "Falcoa AI — Your AI Tutor",
    href: "/falcoa",
    steps: [
      { step: 1, title: "Choose a Model", desc: "Select from Gemini 2.5 Flash, Claude 3.5 Sonnet, GPT-4o, NotebookLM, or Llama 3.3 based on your task." },
      { step: 2, title: "Start a Conversation", desc: "Type your question or topic in the chat box. Ask anything — concepts, problem-solving, essay help, or code." },
      { step: 3, title: "Attach Files", desc: "Click the paperclip icon to attach PDFs, images, or documents. Falcoa will read and explain the content." },
      { step: 4, title: "Continue Chatting", desc: "All your conversations are saved in the sidebar. Switch between topics or start a new chat anytime." },
    ],
    tips: ["Use Gemini Flash for quick explanations", "Use Claude for essays and creative writing", "Use NotebookLM for summarizing your uploaded documents"],
  },
  {
    id: "sabro",
    icon: <Target className="w-6 h-6 text-orange-400" />,
    color: "from-orange-500/10 to-red-500/10",
    border: "border-orange-500/20",
    badge: "Challenges",
    title: "Sabro Challenges — Earn XP",
    href: "/sabro",
    steps: [
      { step: 1, title: "Browse Challenges", desc: "Scroll through challenges across Physics, Math, Chemistry, Biology, and more." },
      { step: 2, title: "Read the Question", desc: "Each challenge is presented by an AI avatar — Einstein or Newton — with a real exam-style question." },
      { step: 3, title: "Select Your Answer", desc: "Pick the option you think is correct from the multiple choice list." },
      { step: 4, title: "Submit & Learn", desc: "Submit your answer to see if you're right. Read the explanation to understand the concept, whether you got it right or wrong." },
    ],
    tips: ["Earn XP by getting answers correct", "Your rank increases as you level up", "Failed challenges can be retried later"],
  },
  {
    id: "notebook",
    icon: <BookOpen className="w-6 h-6 text-blue-400" />,
    color: "from-blue-500/10 to-cyan-500/10",
    border: "border-blue-500/20",
    badge: "Knowledge",
    title: "Knowledge Hub — Study Smarter",
    href: "/notebook",
    steps: [
      { step: 1, title: "Upload Your Material", desc: "Click the + button to upload notes, ebooks (PDF/DOCX/TXT), images, or paste a web URL to import content from the internet." },
      { step: 2, title: "AI Processes It", desc: "Aedusim automatically generates a summary, key points, flashcards, and relevant formulas from your content." },
      { step: 3, title: "Study the Tabs", desc: "Switch between Summary, Key Points, Flashcards, and Formulas tabs to study the material from different angles." },
      { step: 4, title: "Chat with Your Document", desc: "Go to the Chat tab and ask specific questions about your document. The AI answers based only on your uploaded content." },
    ],
    tips: ["Upload past papers and get instant analysis", "Use flashcards for last-minute revision", "Import YouTube video URLs or Wikipedia pages for quick study content"],
  },
  {
    id: "ai-quiz",
    icon: <Star className="w-6 h-6 text-yellow-400" />,
    color: "from-yellow-500/10 to-orange-500/10",
    border: "border-yellow-500/20",
    badge: "Feature",
    title: "AI Avatar Quizzes — Surprise Challenges",
    href: "#",
    steps: [
      { step: 1, title: "Automatic Appearance", desc: "After you've been using the platform for a while, an AI avatar (Einstein or Newton) will pop up with a quiz question." },
      { step: 2, title: "Answer the Question", desc: "Select one of the four options shown. Think carefully — these are real exam-style questions!" },
      { step: 3, title: "Get Explained", desc: "After submitting, you'll see whether you were correct and read a detailed explanation of the answer." },
      { step: 4, title: "Dismiss or Wait", desc: "Close the popup anytime. They appear regularly to keep your knowledge sharp throughout your study session." },
    ],
    tips: ["These questions come from real subjects: Physics, Math, Chemistry, Biology", "Correct answers earn XP", "Don't skip them — they test concepts that often appear in exams"],
  },
];

export default function HowToUsePage() {
  return (
    <div className="h-full overflow-y-auto bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <h1 className="text-4xl font-bold tracking-tight">How to Use <span className="text-primary">Aedusim</span></h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A complete guide to all features on the platform. Follow these steps to get the most out of your AI-powered learning experience.
          </p>
        </motion.div>

        {/* Quick Nav */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-2 justify-center"
        >
          {sections.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border/50 hover:border-primary/50 text-sm text-muted-foreground hover:text-foreground transition-all">
              {s.icon}
              {s.title.split("—")[0].trim()}
            </a>
          ))}
        </motion.div>

        {/* Sections */}
        {sections.map((section, si) => (
          <motion.div
            key={section.id}
            id={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + si * 0.07 }}
          >
            <Card className={`bg-gradient-to-br ${section.color} border ${section.border}`}>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-background/40 border border-border/30 flex items-center justify-center">
                    {section.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">{section.badge}</Badge>
                    </div>
                    <CardTitle className="text-xl">{section.title}</CardTitle>
                  </div>
                  {section.href !== "#" && (
                    <Link href={section.href} className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-lg bg-background/50 border border-border/30 text-xs hover:bg-background transition-colors text-muted-foreground hover:text-foreground">
                      Open <ChevronRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Steps */}
                <div className="space-y-3">
                  {section.steps.map((step) => (
                    <div key={step.step} className="flex gap-3 items-start">
                      <div className="w-7 h-7 rounded-full bg-background/60 border border-border/30 flex items-center justify-center text-xs font-bold text-primary shrink-0 mt-0.5">
                        {step.step}
                      </div>
                      <div>
                        <div className="font-medium text-sm mb-0.5">{step.title}</div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tips */}
                <div className="bg-background/30 rounded-xl border border-border/20 p-4">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Pro Tips</div>
                  <ul className="space-y-1.5">
                    {section.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {/* Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card/40 border border-border/50 rounded-2xl p-6 text-center"
        >
          <MessageSquare className="w-8 h-8 text-primary mx-auto mb-3" />
          <h3 className="font-bold text-lg mb-1">Need Help?</h3>
          <p className="text-muted-foreground text-sm mb-3">Contact our founder directly for support or feedback.</p>
          <a href="mailto:ahmedmuksit2011@gmail.com" className="text-primary hover:underline text-sm font-medium">
            ahmedmuksit2011@gmail.com
          </a>
        </motion.div>
      </div>
    </div>
  );
}
