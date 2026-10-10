import { useState } from "react";
import { CheckCircle2, XCircle, Lightbulb, BookOpen, FlaskConical, ChevronRight } from "lucide-react";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  // Match **bold**, *italic*, `code`, and plain text
  const re = /\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[1] !== undefined) parts.push(<strong key={key++} className="font-bold text-foreground">{m[1]}</strong>);
    else if (m[2] !== undefined) parts.push(<em key={key++} className="italic text-foreground/80">{m[2]}</em>);
    else if (m[3] !== undefined) parts.push(
      <code key={key++} className="font-mono text-[0.82em] bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20">{m[3]}</code>
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

// ─── Section Icons & Colors ───────────────────────────────────────────────────

const SECTION_STYLES: Record<string, { icon: React.ReactNode; color: string; bg: string; border: string }> = {
  "short answer":    { icon: <Lightbulb className="w-3.5 h-3.5" />, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/25" },
  "model answer":    { icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/25" },
  "explanation":     { icon: <BookOpen className="w-3.5 h-3.5" />, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/25" },
  "deep explanation":{ icon: <BookOpen className="w-3.5 h-3.5" />, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/25" },
  "example / exam use":{ icon: <FlaskConical className="w-3.5 h-3.5" />, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/25" },
  "example":         { icon: <FlaskConical className="w-3.5 h-3.5" />, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/25" },
  "advanced application":{ icon: <ChevronRight className="w-3.5 h-3.5" />, color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/25" },
  "mark scheme points":  { icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/25" },
  "examiner tip":    { icon: <Lightbulb className="w-3.5 h-3.5" />, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/25" },
  "worked example":  { icon: <FlaskConical className="w-3.5 h-3.5" />, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/25" },
  "key concepts":    { icon: <BookOpen className="w-3.5 h-3.5" />, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/25" },
};

// ─── MCQ Quiz Renderer ────────────────────────────────────────────────────────

function QuizBlock({ block }: { block: string }) {
  const lines = block.split("\n").map(l => l.trim()).filter(Boolean);
  const questions: Array<{
    q: string; opts: Array<{ letter: string; text: string }>; correct: string;
  }> = [];
  let current: typeof questions[0] | null = null;

  for (const line of lines) {
    const qMatch = line.match(/^\*{0,2}Q(\d+)[.:]\*{0,2}\s*(.*)/);
    const optMatch = line.match(/^([A-D])[).:]\s*(.*)/);
    const ansMatch = line.match(/\*(?:Correct|Answer)[*:]+\s*([A-D])/i) || line.match(/^\*Correct:\s*([A-D])/i);
    if (qMatch) {
      if (current) questions.push(current);
      current = { q: qMatch[2].replace(/\*\*/g, ""), opts: [], correct: "" };
    } else if (optMatch && current) {
      current.opts.push({ letter: optMatch[1], text: optMatch[2] });
    } else if (ansMatch && current) {
      current.correct = ansMatch[1];
    }
  }
  if (current) questions.push(current);

  if (!questions.length) return null;

  return (
    <div className="space-y-5 my-2">
      {questions.map((q, qi) => <MCQCard key={qi} index={qi + 1} question={q} />)}
    </div>
  );
}

function MCQCard({ index, question }: { index: number; question: { q: string; opts: Array<{ letter: string; text: string }>; correct: string } }) {
  const [selected, setSelected] = useState<string | null>(null);
  const answered = selected !== null;
  return (
    <div className="rounded-2xl border border-border/50 bg-card/60 overflow-hidden">
      <div className="px-4 py-3 border-b border-border/40 bg-primary/5">
        <div className="flex items-start gap-2">
          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full mt-0.5 shrink-0">Q{index}</span>
          <p className="text-sm font-medium leading-snug">{question.q}</p>
        </div>
      </div>
      <div className="p-3 space-y-2">
        {question.opts.map((opt) => {
          const isCorrect = opt.letter === question.correct;
          const isSelected = selected === opt.letter;
          let cls = "border-border/40 bg-background/50 hover:bg-accent/50 hover:border-border";
          if (answered) {
            if (isCorrect) cls = "border-green-500/50 bg-green-500/10 text-green-300";
            else if (isSelected && !isCorrect) cls = "border-red-500/50 bg-red-500/10 text-red-300";
            else cls = "border-border/20 opacity-40";
          }
          return (
            <button
              key={opt.letter}
              disabled={answered}
              onClick={() => setSelected(opt.letter)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left text-sm transition-all ${cls}`}
            >
              <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 ${
                answered && isCorrect ? "bg-green-500 border-green-500 text-white"
                : answered && isSelected ? "bg-red-500 border-red-500 text-white"
                : "border-border/60"
              }`}>{opt.letter}</span>
              <span className="flex-1">{opt.text}</span>
              {answered && isCorrect && <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />}
              {answered && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
            </button>
          );
        })}
      </div>
      {answered && (
        <div className={`px-4 py-2.5 border-t border-border/30 text-xs flex items-center gap-2 ${
          selected === question.correct ? "text-green-400 bg-green-500/5" : "text-red-400 bg-red-500/5"
        }`}>
          {selected === question.correct
            ? <><CheckCircle2 className="w-3.5 h-3.5" /> Correct! Well done.</>
            : <><XCircle className="w-3.5 h-3.5" /> Incorrect — correct answer is <strong className="text-green-400 ml-1">{question.correct}</strong></>}
        </div>
      )}
    </div>
  );
}

// ─── Code Block ───────────────────────────────────────────────────────────────

function CodeBlock({ code, lang }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-xl border border-border/50 overflow-hidden my-2">
      <div className="flex items-center justify-between px-3 py-1.5 bg-muted/40 border-b border-border/30">
        <span className="text-[10px] font-mono text-muted-foreground uppercase">{lang || "code"}</span>
        <button
          onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-xs font-mono text-foreground/90 bg-background/50 leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ─── Formula ─────────────────────────────────────────────────────────────────

function FormulaLine({ text }: { text: string }) {
  return (
    <div className="my-1.5 flex">
      <div className="font-mono text-sm text-primary bg-primary/5 border border-primary/20 px-3 py-1.5 rounded-lg inline-block">
        {text}
      </div>
    </div>
  );
}

function isFormulaLine(line: string): boolean {
  // A "formula" line has = and looks like an equation, or contains ² / → / ⟹ / ± / ∫ / Σ
  const trimmed = line.trim();
  if (!trimmed) return false;
  const hasFormula = /[=±→⟹∫Σ∂√²³⁴⁻⁺×÷∑∏∞∆∇∈∉∩∪]/.test(trimmed);
  const looksLikeCode = /^[A-Za-z_].*=/.test(trimmed);
  return hasFormula || (looksLikeCode && trimmed.length < 60);
}

// ─── Main Renderer ────────────────────────────────────────────────────────────

interface Block {
  type: "section" | "bullet-list" | "numbered-list" | "code" | "quiz" | "formula" | "paragraph" | "divider";
  heading?: string;
  items?: string[];
  text?: string;
  code?: string;
  lang?: string;
  children?: Block[];
}

function parseMessage(content: string): Block[] {
  const blocks: Block[] = [];
  const lines = content.split("\n");
  let i = 0;

  // Check if this is a quiz block
  const isQuiz = /\*{0,2}Q\d+[.:]/i.test(content) && /\*Correct:/i.test(content);
  if (isQuiz) {
    return [{ type: "quiz", text: content }];
  }

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Code block
    if (trimmed.startsWith("```")) {
      const lang = trimmed.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      blocks.push({ type: "code", code: codeLines.join("\n"), lang });
      i++;
      continue;
    }

    // Section header: **Heading** on its own line
    const sectionMatch = trimmed.match(/^\*\*([^*]+)\*\*$/) || trimmed.match(/^\*\*([^*]+)\*\*:?\s*$/);
    if (sectionMatch) {
      const heading = sectionMatch[1].trim();
      const styleKey = heading.toLowerCase().replace(/[()]/g, "");
      const style = Object.entries(SECTION_STYLES).find(([k]) => styleKey.includes(k));
      if (style) {
        const bodyLines: string[] = [];
        i++;
        while (i < lines.length) {
          const next = lines[i].trim();
          if (!next) { i++; if (i < lines.length && lines[i].trim().startsWith("**") && lines[i].trim().endsWith("**")) break; continue; }
          if (next.startsWith("**") && next.endsWith("**") && Object.entries(SECTION_STYLES).some(([k]) => next.toLowerCase().includes(k))) break;
          bodyLines.push(lines[i]);
          i++;
        }
        blocks.push({ type: "section", heading, text: bodyLines.join("\n") });
        continue;
      }
    }

    // Divider
    if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
      blocks.push({ type: "divider" });
      i++;
      continue;
    }

    // Bullet list
    if (trimmed.match(/^[•\-]\s+/) || trimmed.match(/^\*\s+[^*]/)) {
      const items: string[] = [];
      while (i < lines.length) {
        const l = lines[i].trim();
        if (l.match(/^[•\-]\s+/) || l.match(/^\*\s+[^*]/)) {
          items.push(l.replace(/^[•\-\*]\s+/, ""));
          i++;
        } else if (!l) {
          i++;
          if (i < lines.length && !lines[i].trim().match(/^[•\-\*]\s+/)) break;
        } else break;
      }
      if (items.length) { blocks.push({ type: "bullet-list", items }); continue; }
    }

    // Numbered list
    if (trimmed.match(/^\d+[.)]\s+/)) {
      const items: string[] = [];
      while (i < lines.length) {
        const l = lines[i].trim();
        if (l.match(/^\d+[.)]\s+/)) {
          items.push(l.replace(/^\d+[.)]\s+/, ""));
          i++;
        } else if (!l) {
          i++;
          if (i < lines.length && !lines[i].trim().match(/^\d+[.)]/)) break;
        } else break;
      }
      if (items.length) { blocks.push({ type: "numbered-list", items }); continue; }
    }

    // Formula line (single)
    if (isFormulaLine(trimmed) && trimmed.length < 80 && !trimmed.includes(" ") === false) {
      blocks.push({ type: "formula", text: trimmed });
      i++;
      continue;
    }

    // Paragraph
    if (trimmed) {
      const paraLines: string[] = [];
      while (i < lines.length && lines[i].trim()) {
        const l = lines[i].trim();
        if (l.startsWith("```") || l.match(/^[•\-\*]\s+/) || l.match(/^\d+[.)]\s+/) ||
            (l.startsWith("**") && l.endsWith("**") && Object.entries(SECTION_STYLES).some(([k]) => l.toLowerCase().includes(k)))) break;
        paraLines.push(lines[i]);
        i++;
      }
      if (paraLines.length) blocks.push({ type: "paragraph", text: paraLines.join("\n") });
      continue;
    }

    i++;
  }

  return blocks;
}

function RenderBlock({ block }: { block: Block }) {
  if (block.type === "divider") {
    return <hr className="border-border/30 my-3" />;
  }

  if (block.type === "quiz") {
    return <QuizBlock block={block.text!} />;
  }

  if (block.type === "code") {
    return <CodeBlock code={block.code!} lang={block.lang} />;
  }

  if (block.type === "formula") {
    return <FormulaLine text={block.text!} />;
  }

  if (block.type === "paragraph") {
    // Render inline
    return (
      <p className="text-sm leading-relaxed text-foreground/90 my-1">
        {parseInline(block.text!)}
      </p>
    );
  }

  if (block.type === "bullet-list") {
    return (
      <ul className="my-2 space-y-1.5 ml-1">
        {block.items!.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-foreground/90">
            <span className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-2 shrink-0" />
            <span>{parseInline(item)}</span>
          </li>
        ))}
      </ul>
    );
  }

  if (block.type === "numbered-list") {
    return (
      <ol className="my-2 space-y-1.5 ml-1">
        {block.items!.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-foreground/90">
            <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
              {i + 1}
            </span>
            <span>{parseInline(item)}</span>
          </li>
        ))}
      </ol>
    );
  }

  if (block.type === "section") {
    const key = (block.heading || "").toLowerCase().replace(/[()]/g, "");
    const style = Object.entries(SECTION_STYLES).find(([k]) => key.includes(k));
    const s = style?.[1];
    const innerBlocks = parseMessage(block.text || "");
    return (
      <div className={`my-3 rounded-2xl border overflow-hidden ${s?.border || "border-border/40"}`}>
        <div className={`flex items-center gap-2 px-4 py-2.5 border-b ${s?.border || "border-border/30"} ${s?.bg || "bg-muted/30"}`}>
          <span className={s?.color || "text-foreground"}>{s?.icon}</span>
          <span className={`text-xs font-bold uppercase tracking-wider ${s?.color || "text-foreground"}`}>
            {block.heading}
          </span>
        </div>
        <div className="px-4 py-3 space-y-1">
          {innerBlocks.map((b, i) => <RenderBlock key={i} block={b} />)}
        </div>
      </div>
    );
  }

  return null;
}

export function MessageRenderer({ content }: { content: string }) {
  const blocks = parseMessage(content);
  return (
    <div className="space-y-0.5">
      {blocks.map((block, i) => <RenderBlock key={i} block={block} />)}
    </div>
  );
}
