import { motion } from "framer-motion";
import { Mail, Globe, Zap, BookOpen, Target, Star, GraduationCap, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const features = [
  { icon: <Zap className="w-5 h-5 text-yellow-400" />, title: "Falcoa AI", desc: "Multi-model AI assistant with Gemini, Claude, GPT-4o, and more — your personal tutor for any subject." },
  { icon: <Target className="w-5 h-5 text-orange-400" />, title: "Sabro Challenges", desc: "Gamified quiz challenges guided by Einstein and Newton avatars. Earn XP and level up your rank." },
  { icon: <BookOpen className="w-5 h-5 text-blue-400" />, title: "Knowledge Hub", desc: "Upload notes, ebooks, images, and videos. Get instant summaries, flashcards, and key points powered by AI." },
  { icon: <Sparkles className="w-5 h-5 text-purple-400" />, title: "Guided Practice", desc: "Work through structured problems, instant explanations, and daily challenges that reinforce real understanding." },
  { icon: <GraduationCap className="w-5 h-5 text-green-400" />, title: "Progress Tracking", desc: "Track XP, level, grade, and completed challenges across all subjects in one dashboard." },
  { icon: <Sparkles className="w-5 h-5 text-cyan-400" />, title: "AI Avatar Quizzes", desc: "Einstein and Newton appear periodically with surprise quiz questions to keep your mind sharp." },
];

const timeline = [
  { year: "2024", event: "Aedusim concept and vision created by Ahmed Muksit Ainan" },
  { year: "2025", event: "Falcoa AI multi-model engine developed and integrated" },
  { year: "2025", event: "Sabro Challenges and gamification system launched" },
  { year: "2026", event: "Knowledge Hub, guided practice, and adaptive progress released" },
];

export default function AboutPage() {
  return (
    <div className="h-full overflow-y-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-16">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 bg-primary/30 blur-[60px] rounded-full" />
            <img src="/aedusim-brand-logo.png" alt="Aedusim" className="w-36 h-36 object-contain rounded-2xl relative z-10 shadow-[0_0_30px_rgba(236,72,153,0.35)] border border-primary/30" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            About <span className="text-primary">Aedusim</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Aedusim is an AI-powered education platform designed to make learning smarter, faster, and more engaging — combining multi-model AI tutoring, gamified challenges, and intelligent study tools in one unified experience.
          </p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <Badge className="bg-primary/20 text-primary border-primary/30">AI Education</Badge>
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Gamified Learning</Badge>
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Multi-Model AI</Badge>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Guided Practice</Badge>
          </div>
        </motion.div>

        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card/40 border border-border/50 rounded-3xl p-8 text-center"
        >
          <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed text-lg">
            To democratize world-class education by giving every student access to AI tutors as capable as the best teachers in the world — available 24/7, infinitely patient, and personalized to your pace and learning style.
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h2 className="text-2xl font-bold mb-6">Platform Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((f, i) => (
              <Card key={i} className="bg-card/40 border-border/50 hover:border-primary/30 transition-colors">
                <CardContent className="p-5 flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-background/50 border border-border/50 flex items-center justify-center shrink-0">
                    {f.icon}
                  </div>
                  <div>
                    <div className="font-semibold mb-1">{f.title}</div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Founder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold mb-6">Founder</h2>
          <Card className="bg-gradient-to-br from-primary/10 to-purple-500/10 border-primary/30">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/30 to-purple-500/30 border border-primary/30 flex items-center justify-center shrink-0 text-4xl font-bold text-primary shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                  A
                </div>
                <div className="text-center md:text-left">
                  <h3 className="text-2xl font-bold mb-1">Ahmed Muksit Ainan</h3>
                  <div className="text-primary font-medium mb-3 flex items-center gap-2 justify-center md:justify-start">
                    <Star className="w-4 h-4 text-yellow-400" />
                    Founder of Aedusim
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Ahmed Muksit Ainan founded Aedusim with a vision to transform how students learn — by combining the power of multiple AI models with engaging, gamified education tools. His mission is to give every student the tools they need to excel academically, regardless of their resources or location.
                  </p>
                  <div className="flex gap-3 flex-wrap justify-center md:justify-start">
                    <a
                      href="mailto:ahmedmuksit2011@gmail.com"
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30 transition-colors text-sm font-medium"
                    >
                      <Mail className="w-4 h-4" />
                      ahmedmuksit2011@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <h2 className="text-2xl font-bold mb-6">Journey</h2>
          <div className="space-y-4 relative">
            <div className="absolute left-[27px] top-6 bottom-6 w-px bg-border/50" />
            {timeline.map((item, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="w-14 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary shrink-0 z-10">
                  {item.year}
                </div>
                <div className="flex-1 pt-1 pb-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.event}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card/40 border border-border/50 rounded-3xl p-8 text-center"
        >
          <Globe className="w-10 h-10 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Get in Touch</h2>
          <p className="text-muted-foreground mb-4">Have questions, feedback, or partnership inquiries?</p>
          <a
            href="mailto:ahmedmuksit2011@gmail.com"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-[0_0_20px_rgba(59,130,246,0.3)]"
          >
            <Mail className="w-4 h-4" />
            ahmedmuksit2011@gmail.com
          </a>
        </motion.div>

      </div>
    </div>
  );
}
