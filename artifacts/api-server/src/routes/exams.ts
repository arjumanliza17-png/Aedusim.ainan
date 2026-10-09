import { Router } from "express";
import Groq from "groq-sdk";
import { db } from "@workspace/db";
import { examsTable, examSessionsTable, profileTable } from "@workspace/db";
import { eq, desc, count as sqlCount, and } from "drizzle-orm";
import { GenerateExamBody, GetExamParams, DeleteExamParams, SubmitExamParams, SubmitExamBody } from "@workspace/api-zod";
import { getOrCreateProfile } from "../middleware/auth";

const router = Router();

// ─── Groq Vision Client ────────────────────────────────────────────────────────
let groqClient: Groq | null = null;
function getGroq(): Groq {
  if (!groqClient) groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return groqClient;
}

async function gradeHandwrittenAnswer(
  imageBase64: string,
  question: string,
  maxMarks: number,
  questionType: string,
  modelAnswer: string
): Promise<{ extractedText: string; marksAwarded: number; feedback: string }> {
  const prompt = `You are an expert exam marker. A student has submitted a handwritten answer.

Question: "${question}"
Type: ${questionType} (${maxMarks} marks available)
Model answer (for reference): "${modelAnswer.slice(0, 400)}"

Instructions:
1. Carefully transcribe every word written in the image
2. Evaluate the answer: accuracy, completeness, use of key terminology
3. Award whole marks from 0 to ${maxMarks}
4. Give specific, constructive, encouraging feedback

Respond ONLY with valid JSON:
{
  "extractedText": "full transcription of the handwriting",
  "marksAwarded": <integer 0 to ${maxMarks}>,
  "feedback": "marking feedback — what was correct, what was missing, how to improve"
}`;

  try {
    const response = await getGroq().chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [{
        role: "user",
        content: [
          { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
          { type: "text", text: prompt },
        ],
      }],
      response_format: { type: "json_object" },
      max_tokens: 1024,
      temperature: 0.1,
    });

    const parsed = JSON.parse(response.choices[0].message.content || "{}");
    return {
      extractedText: String(parsed.extractedText || "[could not read handwriting]"),
      marksAwarded: Math.min(maxMarks, Math.max(0, Math.round(Number(parsed.marksAwarded) || 0))),
      feedback: String(parsed.feedback || "Answer reviewed via AI handwriting analysis."),
    };
  } catch (err) {
    console.error("Groq vision error:", err);
    return { extractedText: "[AI scan failed — answer reviewed manually]", marksAwarded: 0, feedback: "AI could not read the handwriting. Please ensure the image is clear and well-lit." };
  }
}

// ─── Question Banks ────────────────────────────────────────────────────────────
interface ExamQuestion {
  id: number;
  type: "mcq" | "short" | "long";
  question: string;
  options: string[];
  marks: number;
  answer: string;
}

const QUESTION_BANKS: Record<string, {
  mcq: Array<{ q: string; opts: string[]; ans: string }>;
  short: Array<{ q: string; ans: string }>;
  long: Array<{ q: string; ans: string }>;
}> = {
  physics: {
    mcq: [
      { q: "Which of the following is a vector quantity?", opts: ["Speed", "Mass", "Velocity", "Temperature"], ans: "C" },
      { q: "What does Newton's Second Law state?", opts: ["Objects in motion stay in motion", "F = ma", "Every action has an equal and opposite reaction", "Energy cannot be created or destroyed"], ans: "B" },
      { q: "The unit of electric charge is:", opts: ["Ampere", "Volt", "Coulomb", "Ohm"], ans: "C" },
      { q: "Which law states that energy cannot be created or destroyed?", opts: ["Newton's First Law", "Ohm's Law", "Law of Conservation of Energy", "Hooke's Law"], ans: "C" },
      { q: "What is the formula for kinetic energy?", opts: ["E = mgh", "E = mc²", "KE = ½mv²", "W = Fd"], ans: "C" },
      { q: "The speed of light in a vacuum is approximately:", opts: ["3 × 10⁶ m/s", "3 × 10⁸ m/s", "3 × 10¹⁰ m/s", "3 × 10⁴ m/s"], ans: "B" },
      { q: "When a ball is thrown upward, at its highest point:", opts: ["velocity is maximum", "acceleration is zero", "velocity is zero but acceleration is 9.8 m/s² downward", "both velocity and acceleration are zero"], ans: "C" },
      { q: "Ohm's Law states that V = IR. If resistance doubles and voltage stays the same:", opts: ["Current doubles", "Current halves", "Current stays the same", "Power doubles"], ans: "B" },
    ],
    short: [
      { q: "Define Newton's Third Law and give one real-world example.", ans: "For every action there is an equal and opposite reaction. Example: when a gun fires, the bullet moves forward and the gun recoils backward with equal momentum. Or: a rocket expels gases downward and moves upward." },
      { q: "Explain the difference between elastic and inelastic collisions.", ans: "In an elastic collision, both momentum AND kinetic energy are conserved. In an inelastic collision, momentum is conserved but kinetic energy is not (converted to heat, sound, deformation). A perfectly inelastic collision is one where the objects stick together." },
      { q: "State Hooke's Law and the conditions under which it applies.", ans: "F = kx. The force needed to extend or compress a spring by x is proportional to x, where k is the spring constant (N/m). It applies only within the elastic limit — beyond this, the material deforms permanently." },
    ],
    long: [
      { q: "Describe the principles of projectile motion. Include equations of motion for horizontal and vertical components, explain the effect of launch angle on range, and show that the path is parabolic.", ans: "Projectile motion is the curved path of an object launched into the air under the influence of gravity alone. Horizontal: uniform velocity (no horizontal force), x = u_x·t. Vertical: uniform acceleration g downward, y = u_y·t − ½gt². The path is parabolic as eliminating t gives y = x·tan θ − gx²/(2u²cos²θ). Maximum range occurs at 45°. Time of flight: T = 2u·sinθ/g. Maximum height: H = u²sin²θ/2g." },
      { q: "Explain the photoelectric effect and its significance to quantum theory. Include Einstein's explanation, the equation E = hf − φ, and why classical wave theory failed to explain it.", ans: "The photoelectric effect: when light above a threshold frequency hits a metal surface, electrons are emitted. Classical wave theory predicted: higher intensity → more energy → more electrons regardless of frequency. Observations contradicted this. Einstein's explanation (1905): light consists of photons with energy E = hf. A photon must have enough energy to overcome the work function φ. Maximum KE = hf − φ. This proved light is quantised, earning Einstein the Nobel Prize and establishing quantum mechanics." },
    ],
  },
  chemistry: {
    mcq: [
      { q: "What is the pH of a neutral solution at 25°C?", opts: ["0", "7", "14", "Depends on the solvent"], ans: "B" },
      { q: "In the reaction 2H₂ + O₂ → 2H₂O, if 4 moles of H₂ react completely, how many moles of H₂O are produced?", opts: ["2", "4", "6", "8"], ans: "B" },
      { q: "Which type of bonding is present in sodium chloride (NaCl)?", opts: ["Covalent", "Metallic", "Ionic", "Hydrogen"], ans: "C" },
      { q: "Le Chatelier's Principle states that if a system in equilibrium is disturbed, it will:", opts: ["Shift to increase the disturbance", "Remain unchanged", "Shift to oppose and counteract the disturbance", "Always increase temperature"], ans: "C" },
      { q: "What is the molecular formula of glucose?", opts: ["C₆H₁₂O₆", "C₁₂H₂₂O₁₁", "CH₂O", "C₂H₅OH"], ans: "A" },
      { q: "Which of these is an oxidising agent in the reaction Fe + CuSO₄ → FeSO₄ + Cu?", opts: ["Fe", "FeSO₄", "Cu²⁺ ions", "SO₄²⁻"], ans: "C" },
    ],
    short: [
      { q: "Explain what is meant by dynamic equilibrium. Give one industrial example.", ans: "Dynamic equilibrium occurs in a closed system when the forward and reverse reactions proceed at equal rates, so the concentrations of reactants and products remain constant. Example: the Haber process N₂ + 3H₂ ⇌ 2NH₃ is run at equilibrium conditions (450°C, 200 atm, iron catalyst) to maximise ammonia yield." },
      { q: "Define enthalpy change of combustion and explain how a calorimeter measures it.", ans: "Standard enthalpy of combustion (ΔHc°) is the heat released when 1 mole of substance burns completely in excess oxygen under standard conditions (298K, 100kPa). In a calorimeter, the heat released warms a known mass of water: q = mcΔT. ΔHc = −q/moles burned." },
    ],
    long: [
      { q: "Discuss the factors that affect the rate of a chemical reaction. Include collision theory, activation energy, Maxwell-Boltzmann distribution, and the effect of temperature, concentration, surface area, and catalysts.", ans: "Rate is determined by frequency and energy of successful collisions. Collision Theory: particles must collide with sufficient energy (≥ activation energy Ea) and correct orientation. Maxwell-Boltzmann distribution shows the distribution of molecular energies — only molecules beyond the Ea threshold react. Temperature: increasing T shifts the distribution right — exponentially more molecules exceed Ea (Arrhenius equation: k = Ae^(−Ea/RT)). Concentration: more particles per unit volume → more frequent collisions. Surface area: exposes more reactant particles to collision. Catalyst: provides alternative pathway with lower Ea — does not change ΔH or equilibrium position." },
    ],
  },
  biology: {
    mcq: [
      { q: "Which organelle is responsible for ATP synthesis in eukaryotic cells?", opts: ["Ribosome", "Nucleus", "Mitochondria", "Golgi apparatus"], ans: "C" },
      { q: "DNA replication is described as 'semi-conservative'. This means:", opts: ["Only half the DNA is replicated", "Each new molecule has one original and one new strand", "Replication occurs in the nucleus only", "Only sense strands are copied"], ans: "B" },
      { q: "In a dihybrid cross between two heterozygous parents (AaBb × AaBb), the expected phenotypic ratio is:", opts: ["3:1", "1:2:1", "9:3:3:1", "1:1:1:1"], ans: "C" },
      { q: "Osmosis is defined as:", opts: ["Movement of solute from high to low concentration", "Movement of water from high to low water potential across a semi-permeable membrane", "Active transport of ions across a membrane", "Movement of glucose via carrier proteins"], ans: "B" },
      { q: "Which stage of the cell cycle involves chromosome separation to opposite poles?", opts: ["Prophase", "Metaphase", "Anaphase", "Telophase"], ans: "C" },
    ],
    short: [
      { q: "Explain the induced fit model of enzyme action.", ans: "The active site of an enzyme is complementary to but not identical to its substrate. When the substrate binds, the active site changes shape slightly to fit precisely around it (induced fit). This strains the substrate's bonds, lowering activation energy. After the reaction, products are released and the enzyme returns to its original shape, ready for the next reaction." },
      { q: "Describe how the structure of the alveolus is adapted for gas exchange.", ans: "Large surface area (millions of alveoli) for maximum diffusion. Very thin walls (one cell thick) to minimise diffusion distance. Rich capillary network maintains a steep concentration gradient. Moist surface allows gases to dissolve. Constant blood flow removes O₂ and delivers CO₂, maintaining gradient." },
    ],
    long: [
      { q: "Compare and contrast the processes of aerobic and anaerobic respiration. Include overall equations, stages, locations, ATP yield, and conditions under which each occurs.", ans: "Aerobic respiration: C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ~38 ATP. Stages: Glycolysis (cytoplasm, 2 ATP net), Link reaction (mitochondrial matrix), Krebs cycle (matrix), Oxidative phosphorylation (inner membrane, ~34 ATP via chemiosmosis). Requires oxygen as final electron acceptor. Anaerobic respiration: occurs when O₂ is limited. Animals: glucose → lactic acid + 2 ATP. Yeast: glucose → ethanol + CO₂ + 2 ATP. Location: cytoplasm only. Far less efficient. Lactic acid accumulates in muscles during intense exercise — removed by liver (Cori cycle) when oxygen becomes available (oxygen debt)." },
    ],
  },
  math: {
    mcq: [
      { q: "What is the derivative of f(x) = 3x⁴ − 2x + 7?", opts: ["12x³ − 2", "3x³ − 2", "12x⁴ − 2", "12x³ + 7"], ans: "A" },
      { q: "The quadratic equation x² − 5x + 6 = 0 has roots:", opts: ["x = 2 and x = 3", "x = −2 and x = −3", "x = 1 and x = 6", "x = 2 and x = −3"], ans: "A" },
      { q: "∫₀² x² dx equals:", opts: ["4", "8/3", "8", "2"], ans: "B" },
      { q: "If a triangle has sides 3, 4, and 5, what type of triangle is it?", opts: ["Acute", "Obtuse", "Right-angled", "Equilateral"], ans: "C" },
      { q: "What is the sum of the infinite geometric series 1 + ½ + ¼ + ⅛ + ...?", opts: ["2", "1.5", "3", "Diverges"], ans: "A" },
    ],
    short: [
      { q: "Solve the equation 2x² − 8x + 6 = 0 using the quadratic formula. Show all steps.", ans: "a=2, b=−8, c=6. Discriminant = 64 − 48 = 16. x = (8 ± √16)/4 = (8 ± 4)/4. Solutions: x = 3 or x = 1." },
      { q: "Find the stationary points of f(x) = x³ − 3x² and determine their nature.", ans: "f'(x) = 3x² − 6x = 3x(x−2). x = 0 or x = 2. f''(x) = 6x − 6. At x=0: f''(0) = −6 < 0 → local maximum. At x=2: f''(2) = 6 > 0 → local minimum. Points: (0, 0) max and (2, −4) min." },
    ],
    long: [
      { q: "Prove that √2 is irrational using proof by contradiction. Then explain the significance of irrational numbers in mathematics and give three examples.", ans: "Assume √2 = p/q (rational, lowest terms). Then 2 = p²/q² → p² = 2q². So p² is even → p is even (p=2k). Then 4k² = 2q² → q² = 2k² → q is even. But then p and q share factor 2, contradicting 'lowest terms'. Contradiction — √2 is irrational. Examples: √2, π, e." },
    ],
  },
  general: {
    mcq: [
      { q: "Which approach is most effective when studying complex topics?", opts: ["Passive re-reading", "Active recall and practice testing", "Highlighting text extensively", "Studying for very long periods without breaks"], ans: "B" },
      { q: "The Feynman Technique involves:", opts: ["Memorising formulas", "Explaining concepts simply as if teaching them", "Reading textbooks multiple times", "Using flashcards only"], ans: "B" },
      { q: "Spaced repetition is effective because:", opts: ["It makes studying longer", "It reviews material at increasing intervals matching the forgetting curve", "It tests only difficult topics", "It organizes notes alphabetically"], ans: "B" },
      { q: "When answering a 6-mark exam question, you should:", opts: ["Write one sentence", "Provide six separate developed points with evidence", "Use bullet points only", "Repeat the question in your answer"], ans: "B" },
    ],
    short: [
      { q: "Explain what is meant by 'active recall' and why it is more effective than passive revision.", ans: "Active recall means closing your notes and testing yourself on what you know. It strengthens memory retrieval pathways far more than passive re-reading because it replicates exam conditions and forces the brain to construct knowledge." },
    ],
    long: [
      { q: "Discuss strategies for effective exam preparation. Include time management, revision techniques, and how to approach different question types.", ans: "Effective exam preparation involves: Planning — create a revision timetable, allocating more time to harder topics. Active revision — use spaced repetition, practice papers, flashcards. Past papers — time yourself strictly, mark against mark scheme. Question strategy — read all questions first, allocate time per mark, attempt every question." },
    ],
  },
};

function getBank(subject: string) {
  const s = subject.toLowerCase();
  if (s.includes("physics")) return QUESTION_BANKS.physics;
  if (s.includes("chemistry") || s.includes("chem")) return QUESTION_BANKS.chemistry;
  if (s.includes("biology") || s.includes("bio")) return QUESTION_BANKS.biology;
  if (s.includes("math") || s.includes("maths") || s.includes("calculus") || s.includes("algebra")) return QUESTION_BANKS.math;
  return QUESTION_BANKS.general;
}

function generateExamQuestions(topic: string, subject: string, mcqCount: number, shortCount: number, longCount: number, totalMarks: number, difficulty: string): ExamQuestion[] {
  const bank = getBank(subject);
  const questions: ExamQuestion[] = [];
  let id = 1;
  const mcqMarks = mcqCount > 0 ? Math.max(1, Math.floor((totalMarks * 0.3) / mcqCount)) : 0;
  const shortMarks = shortCount > 0 ? Math.max(3, Math.floor((totalMarks * 0.35) / shortCount)) : 0;
  const longMarks = longCount > 0 ? Math.max(8, Math.floor((totalMarks * 0.35) / longCount)) : 0;

  for (let i = 0; i < mcqCount; i++) {
    const src = bank.mcq[i % bank.mcq.length];
    questions.push({ id: id++, type: "mcq", question: i === 0 && topic ? `Regarding ${topic}: ${src.q}` : src.q, options: src.opts, marks: mcqMarks, answer: src.ans });
  }
  for (let i = 0; i < shortCount; i++) {
    const src = bank.short[i % bank.short.length];
    questions.push({ id: id++, type: "short", question: i === 0 && topic ? `With specific reference to ${topic}: ${src.q}` : src.q, options: [], marks: shortMarks, answer: src.ans });
  }
  for (let i = 0; i < longCount; i++) {
    const src = bank.long[i % bank.long.length];
    questions.push({ id: id++, type: "long", question: i === 0 && topic ? `Essay (${longMarks} marks): With reference to ${topic} in ${subject}: ${src.q}` : `Essay (${longMarks} marks): ${src.q}`, options: [], marks: longMarks, answer: src.ans });
  }
  return questions;
}

async function evaluateAnswers(
  questions: ExamQuestion[],
  answers: Array<{ questionId: number; answer: string; imageAnswer?: string }>
) {
  const answerMap = new Map(answers.map(a => [a.questionId, a]));
  let score = 0;
  const questionResults = [];

  for (const q of questions) {
    const submission = answerMap.get(q.id) || { questionId: q.id, answer: "" };
    const userAnswer = submission.answer;
    const imageAnswer = submission.imageAnswer;

    let marksAwarded = 0;
    let feedback = "";
    let displayAnswer = userAnswer;

    // ── AI grading for handwritten image answers ───────────────────────────
    if (imageAnswer && q.type !== "mcq") {
      const aiResult = await gradeHandwrittenAnswer(imageAnswer, q.question, q.marks, q.type, q.answer);
      marksAwarded = aiResult.marksAwarded;
      feedback = `🤖 **AI Handwriting Analysis**\n\n**What you wrote:** "${aiResult.extractedText}"\n\n**Feedback:** ${aiResult.feedback}`;
      displayAnswer = aiResult.extractedText;
      score += marksAwarded;
      questionResults.push({ questionId: q.id, question: q.question, userAnswer: displayAnswer, correctAnswer: q.answer, marksAwarded, maxMarks: q.marks, feedback });
      continue;
    }

    // ── Standard text grading ──────────────────────────────────────────────
    if (q.type === "mcq") {
      const correct = userAnswer.trim().toUpperCase() === q.answer.trim().toUpperCase();
      marksAwarded = correct ? q.marks : 0;
      feedback = correct
        ? `✅ Correct! ${q.marks}/${q.marks} marks.`
        : `❌ Incorrect. The correct answer is **${q.answer}**. ${q.options.length > 0 ? `The right option was: "${q.options[q.answer.charCodeAt(0) - 65]}"` : ""} Review this concept.`;
    } else if (q.type === "short") {
      if (!userAnswer.trim()) {
        marksAwarded = 0; feedback = "⚠️ No answer provided. Study the model answer and attempt all questions.";
      } else {
        const answerWords = q.answer.toLowerCase().split(/\s+/).filter(w => w.length > 5);
        const userWords = userAnswer.toLowerCase();
        const hits = answerWords.filter(w => userWords.includes(w)).length;
        const coverage = hits / Math.max(answerWords.length, 1);
        if (coverage > 0.4 && userAnswer.length > 60) { marksAwarded = Math.floor(q.marks * 0.85); feedback = `Good answer (${marksAwarded}/${q.marks}). You've covered the key points. For full marks: use more precise terminology.`; }
        else if (userAnswer.length > 30) { marksAwarded = Math.floor(q.marks * 0.5); feedback = `Partial credit (${marksAwarded}/${q.marks}). Your answer shows understanding but lacks depth. Compare with the model answer.`; }
        else { marksAwarded = Math.floor(q.marks * 0.15); feedback = `Too brief (${marksAwarded}/${q.marks}). Short-answer questions require 3–5 complete sentences with specific detail.`; }
      }
    } else {
      if (!userAnswer.trim()) {
        marksAwarded = 0; feedback = "⚠️ No answer. Long questions require 150–300 words covering all requirements.";
      } else {
        const wordCount = userAnswer.trim().split(/\s+/).length;
        const answerWords = q.answer.toLowerCase().split(/\s+/).filter(w => w.length > 6);
        const hits = answerWords.filter(w => userAnswer.toLowerCase().includes(w)).length;
        const coverage = hits / Math.max(answerWords.length, 1);
        if (wordCount > 150 && coverage > 0.25) { marksAwarded = Math.floor(q.marks * 0.82); feedback = `Strong response (${marksAwarded}/${q.marks}). Well-developed answer. For more marks: add specific examples and a clear conclusion.`; }
        else if (wordCount > 80) { marksAwarded = Math.floor(q.marks * 0.55); feedback = `Moderate answer (${marksAwarded}/${q.marks}). Expand with more theory and specific examples.`; }
        else { marksAwarded = Math.floor(q.marks * 0.25); feedback = `Too brief for a long-answer question (${marksAwarded}/${q.marks}). Aim for 200+ words.`; }
      }
    }

    score += marksAwarded;
    questionResults.push({ questionId: q.id, question: q.question, userAnswer: displayAnswer, correctAnswer: q.answer, marksAwarded, maxMarks: q.marks, feedback });
  }

  return { score, questionResults };
}

function getGrade(pct: number) {
  if (pct >= 90) return "A+";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B+";
  if (pct >= 60) return "B";
  if (pct >= 50) return "C";
  if (pct >= 40) return "D";
  return "F";
}

// ─── Routes ───────────────────────────────────────────────────────────────────

router.get("/", async (req, res) => {
  const profile = await getOrCreateProfile(req, res);
  if (!profile) return;
  const exams = await db.select().from(examsTable)
    .where(eq(examsTable.userId, profile.id))
    .orderBy(desc(examsTable.createdAt));
  res.json(exams.map(e => ({ ...e, questions: e.questions as ExamQuestion[], createdAt: e.createdAt.toISOString() })));
});

router.post("/generate", async (req, res) => {
  const profile = await getOrCreateProfile(req, res);
  if (!profile) return;
  const body = GenerateExamBody.parse(req.body);
  const questions = generateExamQuestions(body.topic, body.subject, body.mcqCount, body.shortCount, body.longCount, body.totalMarks, body.difficulty);
  const [exam] = await db.insert(examsTable).values({ userId: profile.id, title: body.title, subject: body.subject, totalMarks: body.totalMarks, duration: body.duration, difficulty: body.difficulty, questions }).returning();
  res.status(201).json({ ...exam, questions: exam.questions as ExamQuestion[], createdAt: exam.createdAt.toISOString() });
});

router.get("/:id", async (req, res) => {
  const profile = await getOrCreateProfile(req, res);
  if (!profile) return;
  const { id } = GetExamParams.parse({ id: Number(req.params.id) });
  const [exam] = await db.select().from(examsTable).where(and(eq(examsTable.id, id), eq(examsTable.userId, profile.id)));
  if (!exam) { res.status(404).json({ error: "Exam not found" }); return; }
  const questions = (exam.questions as ExamQuestion[]).map(q => ({ ...q, answer: undefined }));
  res.json({ ...exam, questions, createdAt: exam.createdAt.toISOString() });
});

router.delete("/:id", async (req, res) => {
  const profile = await getOrCreateProfile(req, res);
  if (!profile) return;
  const { id } = DeleteExamParams.parse({ id: Number(req.params.id) });
  await db.delete(examsTable).where(and(eq(examsTable.id, id), eq(examsTable.userId, profile.id)));
  res.status(204).send();
});

router.post("/:id/submit", async (req, res) => {
  const profile = await getOrCreateProfile(req, res);
  if (!profile) return;
  const { id } = SubmitExamParams.parse({ id: Number(req.params.id) });
  const body = SubmitExamBody.parse(req.body);

  // ── Free plan: max 2 exam sessions ─────────────────────────────────────
  if (profile?.plan === "free") {
    const [{ value: sessionCount }] = await db.select({ value: sqlCount() }).from(examSessionsTable)
      .where(eq(examSessionsTable.userId, profile.id));
    if (Number(sessionCount) >= 2) {
      res.status(403).json({ error: "Free plan limit reached. You have used your 2 free exam attempts. Upgrade to Pro to take unlimited exams." });
      return;
    }
  }

  const [exam] = await db.select().from(examsTable).where(and(eq(examsTable.id, id), eq(examsTable.userId, profile.id)));
  if (!exam) { res.status(404).json({ error: "Exam not found" }); return; }

  const questions = exam.questions as ExamQuestion[];
  const { score, questionResults } = await evaluateAnswers(questions, body.answers as Array<{ questionId: number; answer: string; imageAnswer?: string }>);
  const percentage = Math.round((score / exam.totalMarks) * 100);
  const grade = getGrade(percentage);

  const weakAreas = questionResults.filter(qr => qr.marksAwarded / qr.maxMarks < 0.5).map(qr => qr.question.slice(0, 80) + "…");
  const strongAreas = questionResults.filter(qr => qr.marksAwarded / qr.maxMarks >= 0.8).map(qr => `Q${qr.questionId}: Strong — ${qr.marksAwarded}/${qr.maxMarks} marks`);
  const suggestions = percentage < 50
    ? ["Revisit all foundational concepts in the Falcoa AI chat", "Use Knowledge Hub to study relevant materials", "Practice Sabro Challenges daily to reinforce core principles", "Re-attempt this exam after thorough revision"]
    : percentage < 75
    ? ["Focus on improving written answer depth — use PEEL structure", "Review weak areas with specific Falcoa AI queries", "Time yourself on practice papers", "Study model answers to understand examiner expectations"]
    : ["Excellent work! Try a harder difficulty exam", "Use Falcoa AI for advanced topic exploration", "Help consolidate knowledge by writing teaching notes", "Attempt timed full-syllabus mock exams"];

  await db.insert(examSessionsTable).values({ userId: profile.id, examId: id, examTitle: exam.title, subject: exam.subject, score, totalMarks: exam.totalMarks, percentage, grade, timeTaken: body.timeTaken });

  if (profile) {
    const xpGain = Math.floor(percentage / 10) * 15;
    await db.update(profileTable).set({ xp: profile.xp + xpGain, level: Math.floor((profile.xp + xpGain) / 200) + 1 }).where(eq(profileTable.id, profile.id));
  }

  res.json({ examId: id, score, totalMarks: exam.totalMarks, percentage, grade, timeTaken: body.timeTaken, questionResults, weakAreas, strongAreas, suggestions });
});

export default router;
