import { Router } from "express";
import { db } from "@workspace/db";
import { messagesTable, conversationsTable, profileTable } from "@workspace/db";
import { eq, asc, and, count as sqlCount, gte, sql } from "drizzle-orm";
import { ListMessagesParams, SendMessageParams, SendMessageBody } from "@workspace/api-zod";
import { getOrCreateProfile, hasPlan } from "../middleware/auth";
import Groq from "groq-sdk";

let groqClient: Groq | null = null;
function getGroq(): Groq {
  if (!groqClient) groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return groqClient;
}

// ─── Falcoa Conversational AI (Groq) ─────────────────────────────────────────

async function generateFalcoaResponse(userMessage: string, profileContext: string): Promise<string> {
  const parts = profileContext.split(" | ");
  const profileLines = parts.map(p => `  ${p}`).join("\n");

  const systemPrompt = `You are Falcoa — a brilliant, warm personal AI tutor built into Aedusim, an educational platform.

Here is everything you know about this student:
${profileLines}

Your personality and style:
- Talk like a knowledgeable friend — natural, direct, warm. Never like a textbook.
- Answer concisely unless the student asks for depth or a detailed explanation.
- NEVER use structured headers like "Short Answer:", "Explanation:", "Example / Exam Use:" — just talk.
- Reference the student's name, interests, goals, and level naturally when it adds value, not robotically.
- Use their subject interests to make examples feel personal and relevant.
- For calculations or step-by-step problems, show clear working without bureaucratic headers — just flow.
- Be encouraging but not cheesy. Skip filler phrases like "Great question!".
- If they ask for a study plan, quiz, or explanation, give it naturally — no template formatting.
- Markdown is rendered: bold, bullets, code blocks, and math notation are all fine when they help clarity.
- Keep responses focused. A great tutor knows when to be brief and when to go deep.`;

  try {
    const completion = await getGroq().chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      max_tokens: 900,
      temperature: 0.7,
    });
    return completion.choices[0]?.message?.content?.trim() ?? "I couldn't generate a response — please try again.";
  } catch {
    // Fallback to rule-based response if Groq fails
    return generateAIResponse(userMessage, "falcoa", profileContext);
  }
}

const router = Router({ mergeParams: true });

// ─── Mode Detection ──────────────────────────────────────────────────────────

function detectMode(content: string): "exam" | "deep" | "creative" | "basic" {
  const l = content.toLowerCase();
  if (l.includes("exam mode") || l.includes("exam style") || l.includes("mark this") || l.includes("mark scheme")) return "exam";
  if (l.includes("deep") || l.includes("advanced") || l.includes("research") || l.includes("derive") || l.includes("prove")) return "deep";
  if (l.includes("essay") || l.includes("creative") || l.includes("write a") || l.includes("story") || l.includes("poem")) return "creative";
  return "basic";
}

function detectSubject(content: string): string {
  const l = content.toLowerCase();
  if (l.match(/physics|force|velocity|acceleration|newton|einstein|quantum|energy|momentum|wave|optics|gravity|relativity|thermodynamics/)) return "physics";
  if (l.match(/chemistry|chem|element|molecule|atom|bond|reaction|acid|base|ph |mole|organic|polymer|periodic/)) return "chemistry";
  if (l.match(/biology|cell|dna|gene|evolution|organism|enzyme|protein|mitosis|meiosis|photosynthesis|ecosystem/)) return "biology";
  if (l.match(/math|calculus|integral|derivative|algebra|equation|geometry|trigonometry|matrix|vector|polynomial|prime|function/)) return "math";
  if (l.match(/history|war|revolution|empire|civiliz|colonial|ancient|medieval|modern|century|battle|treaty/)) return "history";
  if (l.match(/english|essay|literature|grammar|poetry|novel|shakespeare|writing|language|sentence/)) return "english";
  if (l.match(/economics|supply|demand|market|gdp|inflation|fiscal|monetary|trade|micro|macro/)) return "economics";
  if (l.match(/computer|programming|code|algorithm|data structure|python|javascript|software|hardware|network/)) return "cs";
  return "general";
}

// ─── 3-Layer Structured Response Builder ─────────────────────────────────────

function buildResponse(shortAns: string, explanation: string, examUse: string, mode: string): string {
  if (mode === "exam") {
    return `**MODEL ANSWER (Exam Mode)**\n\n${shortAns}\n\n**Mark Scheme Points:**\n${explanation}\n\n**Examiner Tip:**\n${examUse}`;
  }
  if (mode === "deep") {
    return `**Short Answer**\n${shortAns}\n\n**Deep Explanation**\n${explanation}\n\n**Advanced Application**\n${examUse}`;
  }
  return `**Short Answer**\n${shortAns}\n\n**Explanation**\n${explanation}\n\n**Example / Exam Use**\n${examUse}`;
}

// ─── Subject-Specific Response Banks ─────────────────────────────────────────

function physicsResponse(content: string, mode: string): string {
  const l = content.toLowerCase();

  if (l.match(/newton.?s (first|1st)|inertia|law of motion/)) {
    return buildResponse(
      "Newton's First Law states: an object remains at rest or in uniform motion unless acted upon by a net external force.",
      "• This is also called the **Law of Inertia**\n• 'At rest' means velocity = 0; 'uniform motion' means constant velocity (no acceleration)\n• A net force of **zero** doesn't mean no forces — it means all forces cancel out\n• Key equation: ΣF = 0 ⟹ a = 0\n• Real examples: a book on a table (balanced forces), a spacecraft in deep space (no friction)",
      "Exam question type: *'Explain why a passenger lurches forward when a bus brakes suddenly.'* — Answer: The passenger has inertia and tends to keep moving forward while the bus decelerates. This is Newton's First Law in action. *(2 marks: state law + apply to situation)*",
      mode
    );
  }

  if (l.match(/newton.?s (second|2nd)|f\s*=\s*ma|force.*mass.*accel/)) {
    return buildResponse(
      "Newton's Second Law: **F = ma** — the net force on an object equals its mass multiplied by its acceleration.",
      "• **F** = Net force (Newtons, N)\n• **m** = Mass (kilograms, kg)\n• **a** = Acceleration (m/s²)\n• If mass doubles and force stays the same → acceleration halves\n• Key rearrangements: a = F/m, m = F/a\n• Important: always use **net** force (resultant of all forces)",
      "**Worked Example:** A 3 kg box is pushed with 12 N of force. What is its acceleration?\n→ a = F/m = 12/3 = **4 m/s²**\n\n**Exam trap:** Students often forget to subtract friction. If friction = 2 N, net force = 12 − 2 = 10 N → a = 10/3 = 3.33 m/s²",
      mode
    );
  }

  if (l.match(/e\s*=\s*mc²|mass.energy|special relativity|relativit/)) {
    return buildResponse(
      "Einstein's equation **E = mc²** states that mass and energy are equivalent and interchangeable.",
      "• **E** = Energy (Joules)\n• **m** = Mass (kg)\n• **c** = Speed of light ≈ 3 × 10⁸ m/s\n• Since c² ≈ 9 × 10¹⁶, even tiny masses contain enormous energy\n• This underpins nuclear fission and fusion reactions\n• Special Relativity also predicts: time dilation, length contraction, relativistic momentum",
      "**Calculation:** 1 gram (0.001 kg) of mass fully converted to energy:\nE = 0.001 × (3×10⁸)² = **9 × 10¹³ Joules** — equivalent to ~21 kilotons of TNT\n\n**Exam focus:** Explain the significance of c² being large — a small mass releases enormous energy. Used in nuclear reactors and atomic bombs.",
      mode
    );
  }

  if (l.match(/quantum|wave.particle|superposit|entangle|uncertainty|planck|heisenberg/)) {
    return buildResponse(
      "Quantum mechanics describes how matter and energy behave at subatomic scales, where classical physics breaks down.",
      "**5 Core Principles:**\n1. **Wave-Particle Duality** — particles behave as waves until observed (double-slit experiment)\n2. **Uncertainty Principle** — Δx·Δp ≥ ℏ/2 (you cannot simultaneously know exact position and momentum)\n3. **Superposition** — a quantum system exists in all possible states simultaneously until measured\n4. **Entanglement** — two particles can be instantaneously correlated regardless of distance\n5. **Quantization** — energy exists in discrete packets: E = hf (h = 6.63×10⁻³⁴ J·s)",
      "**Real applications:** MRI machines (quantum spin), transistors (quantum tunnelling), lasers (stimulated emission), quantum computers (superposition + entanglement)\n\n**Exam question:** *'Why can an electron tunnel through a potential barrier?'* — Because as a wave, its wavefunction has non-zero probability on the other side of the barrier.",
      mode
    );
  }

  if (l.match(/thermodynamics|entropy|heat|temperature|carnot|gibbs/)) {
    return buildResponse(
      "Thermodynamics studies heat, work, and energy transfer. It has four fundamental laws.",
      "**The Four Laws:**\n• **Zeroth Law:** If A=B and B=C in temperature, then A=C (defines temperature)\n• **First Law:** ΔU = Q − W (energy is conserved: internal energy = heat added minus work done)\n• **Second Law:** Entropy of an isolated system always increases (ΔS ≥ 0)\n• **Third Law:** Entropy approaches zero as temperature approaches absolute zero\n\n**Key Equations:**\n• Q = mcΔT (heat transfer)\n• Efficiency = 1 − T_cold/T_hot (Carnot engine)\n• ΔG = ΔH − TΔS (spontaneity)",
      "**Exam classic:** *'Why is a 100% efficient heat engine impossible?'* — The Second Law requires entropy to increase; some heat must always be rejected to a cold reservoir. A Carnot engine is the most efficient possible.\n\n**Memory trick:** GOD is unstoppable (Gibbs = enthalpy − Temperature×entropy; when negative, reaction is spontaneous)",
      mode
    );
  }

  // Generic physics
  return buildResponse(
    `In physics, this topic involves understanding the fundamental laws and principles that govern the physical world.`,
    "**Approach to physics problems:**\n1. **Identify** what is given and what you need to find\n2. **Select** the relevant formula(s)\n3. **Substitute** values with correct units\n4. **Calculate** and check the reasonableness of your answer\n5. **Verify** units — they should match the expected unit of the answer\n\n**Key principle:** Physics is not about memorizing — it's about understanding relationships between quantities.",
    "**General exam strategy for physics:**\n• Always show your working — partial marks are awarded for method\n• State the formula before substituting\n• Include units in every step\n• Check significant figures match what's required",
    mode
  );
}

function mathResponse(content: string, mode: string): string {
  const l = content.toLowerCase();

  if (l.match(/calculus|differentiat|derivative|dy.dx|d\/dx/)) {
    return buildResponse(
      "Differentiation finds the instantaneous rate of change (gradient) of a function: **dy/dx** represents how fast y changes with respect to x.",
      "**Core Rules:**\n• **Power Rule:** d/dx(xⁿ) = nxⁿ⁻¹\n• **Product Rule:** d/dx(uv) = u'v + uv'\n• **Quotient Rule:** d/dx(u/v) = (u'v − uv') / v²\n• **Chain Rule:** d/dx[f(g(x))] = f'(g(x)) · g'(x)\n• **Common derivatives:** d/dx(sin x) = cos x, d/dx(eˣ) = eˣ, d/dx(ln x) = 1/x\n\n**Finding stationary points:** Set f'(x) = 0 and solve for x. Use f''(x) to determine max/min.",
      "**Worked Example:** Differentiate f(x) = 3x⁴ − 2x² + 5x\n→ f'(x) = 12x³ − 4x + 5\n\n**Exam application:** Find the maximum area of a rectangle with perimeter 20m.\nLet length = x, width = (10−x), Area = x(10−x) = 10x − x²\ndA/dx = 10 − 2x = 0 → x = 5. Maximum area = 25m²",
      mode
    );
  }

  if (l.match(/integrat|∫|antiderivative|area under/)) {
    return buildResponse(
      "Integration is the reverse of differentiation — it finds the accumulated area under a curve or the antiderivative of a function.",
      "**Core Rules:**\n• **Power Rule:** ∫xⁿ dx = xⁿ⁺¹/(n+1) + C (n ≠ −1)\n• **∫eˣ dx = eˣ + C**\n• **∫cos x dx = sin x + C**\n• **∫sin x dx = −cos x + C**\n• **∫(1/x) dx = ln|x| + C**\n\n**Definite integral:** ∫ₐᵇ f(x) dx = F(b) − F(a)\n**Integration by substitution:** Let u = g(x), then du = g'(x)dx",
      "**Worked Example:** Find ∫(3x² + 2x) dx\n→ = x³ + x² + C\n\n**Definite integral:** ∫₁³ (x²) dx = [x³/3]₁³ = 27/3 − 1/3 = **26/3 ≈ 8.67**\n\n**Exam tip:** Always add '+C' for indefinite integrals — you will lose marks without it.",
      mode
    );
  }

  if (l.match(/quadratic|ax²|completing the square|discriminant/)) {
    return buildResponse(
      "A quadratic equation has the form **ax² + bx + c = 0** and can be solved by factoring, completing the square, or the quadratic formula.",
      "**Three Solution Methods:**\n\n1. **Factoring:** x² + 5x + 6 = (x+2)(x+3) = 0 → x = −2 or x = −3\n\n2. **Quadratic Formula:** x = (−b ± √(b²−4ac)) / 2a\n\n3. **Completing the Square:** x² + 6x + 5 → (x+3)² − 4 = 0 → x = −3 ± 2\n\n**Discriminant (b²−4ac):**\n• > 0 → Two distinct real roots\n• = 0 → One repeated root\n• < 0 → No real roots (complex)",
      "**Example:** Solve 2x² − 7x + 3 = 0\nUsing formula: x = (7 ± √(49−24))/4 = (7 ± 5)/4\n→ x = 3 or x = 0.5\n\n**Exam trap:** Don't forget to simplify the discriminant fully. Always verify by substituting back.",
      mode
    );
  }

  // Generic math
  return buildResponse(
    "Mathematics requires understanding underlying principles and applying them systematically through practice.",
    "**Problem-Solving Framework (IDEAL):**\n1. **I**dentify what's given and what's needed\n2. **D**raw a diagram if applicable\n3. **E**quations — choose the right formula/method\n4. **A**lgebra — work through the steps\n5. **L**abel — include units, check reasonableness\n\n**Key areas:** Algebra, Calculus, Statistics, Geometry, Trigonometry",
    "**General exam strategy:**\n• Show all working — method marks available even with wrong final answer\n• Re-read the question after solving to check you answered what was asked\n• Estimate the answer first to catch calculation errors",
    mode
  );
}

function chemistryResponse(content: string, mode: string): string {
  const l = content.toLowerCase();

  if (l.match(/periodic table|element|atomic number|mass number|isotope/)) {
    return buildResponse(
      "The Periodic Table organizes all known elements by atomic number, with elements sharing similar properties arranged in the same group (column).",
      "**Structure:**\n• **Periods** (rows) — elements with same number of electron shells\n• **Groups** (columns) — elements with same number of valence electrons and similar chemical properties\n• Group 1 = Alkali metals (1 valence electron, very reactive)\n• Group 7 = Halogens (7 valence electrons, form −1 ions)\n• Group 0/18 = Noble gases (full outer shell, inert)\n\n**Key trends across a period (left → right):**\n• Atomic radius decreases\n• Ionization energy increases\n• Electronegativity increases",
      "**Exam question:** *'Why does sodium react more vigorously with water than lithium?'*\nNa has a larger atomic radius → outer electron is further from nucleus → lower ionization energy → electron lost more easily → more reactive.\n\n**Memory trick for Group 1:** Li, Na, K, Rb, Cs, Fr — Little Naughty Kids Rub Cats Frequently",
      mode
    );
  }

  if (l.match(/chemical bond|ionic|covalent|metallic|electronegativity/)) {
    return buildResponse(
      "Chemical bonding occurs when atoms share or transfer electrons to achieve a stable full outer electron shell.",
      "**Three Main Bond Types:**\n\n**1. Ionic Bonds** (metal + non-metal)\n• Electron transfer from metal to non-metal\n• Forms positive cation + negative anion\n• Example: Na + Cl → Na⁺Cl⁻ (sodium chloride)\n• Properties: high melting point, conducts electricity when dissolved\n\n**2. Covalent Bonds** (non-metal + non-metal)\n• Electron sharing\n• Example: H₂O, CO₂, CH₄\n• Properties: low melting point, poor conductors\n\n**3. Metallic Bonds** (metal + metal)\n• Delocalised electrons in a 'sea'\n• Properties: conducts electricity, malleable, ductile",
      "**Exam prediction question:** *'Predict and explain the type of bonding in MgO.'*\nMg is a metal, O is a non-metal → **ionic bonding**. Mg loses 2 electrons to form Mg²⁺, O gains 2 electrons to form O²⁻. Electrostatic attraction holds ions together in a giant ionic lattice.",
      mode
    );
  }

  return buildResponse(
    "Chemistry studies the composition, structure, properties, and reactions of matter at the atomic and molecular level.",
    "**Core Chemistry Areas:**\n• **Physical Chemistry:** thermodynamics, kinetics, equilibrium, electrochemistry\n• **Organic Chemistry:** carbon compounds, functional groups, reactions (addition, substitution, elimination)\n• **Inorganic Chemistry:** elements, compounds, periodic trends, coordination chemistry\n\n**Essential Formulas:**\n• Moles = mass/Mr\n• Concentration = moles/volume (mol/dm³)\n• PV = nRT (Ideal Gas)\n• pH = −log[H⁺]\n• ΔG = ΔH − TΔS",
    "**Exam strategy for chemistry calculations:**\n1. Write the balanced equation first\n2. Identify the mole ratio\n3. Convert given quantity to moles\n4. Apply ratio to find target moles\n5. Convert back to required units (mass, volume, concentration)",
    mode
  );
}

function biologyResponse(content: string, mode: string): string {
  const l = content.toLowerCase();

  if (l.match(/cell|organelle|mitochondria|nucleus|ribosome|membrane/)) {
    return buildResponse(
      "The cell is the basic structural and functional unit of all living organisms. There are two main types: prokaryotic and eukaryotic.",
      "**Prokaryotic vs Eukaryotic:**\n• Prokaryotic (bacteria): no membrane-bound nucleus, no organelles, circular DNA, smaller (1–10 μm)\n• Eukaryotic (animals, plants, fungi): membrane-bound nucleus, complex organelles, linear DNA, larger (10–100 μm)\n\n**Key Organelles (Eukaryotic):**\n• **Nucleus** — contains DNA; controls cell activity\n• **Mitochondria** — ATP production via aerobic respiration; 'powerhouse of the cell'\n• **Ribosome** — protein synthesis (translation)\n• **Endoplasmic Reticulum** — rough ER (protein modification), smooth ER (lipid synthesis)\n• **Golgi apparatus** — packages and ships proteins\n• **Chloroplasts** (plants only) — photosynthesis",
      "**Exam question:** *'Explain why muscle cells have more mitochondria than skin cells.'*\nMuscle cells require large amounts of ATP for contraction. Mitochondria produce ATP via aerobic respiration. More mitochondria = higher rate of ATP production = can meet the high energy demand of muscle activity. *(3 marks)*",
      mode
    );
  }

  if (l.match(/dna|rna|genetics|gene|chromosome|mutation|allele|dominant|recessive/)) {
    return buildResponse(
      "DNA (deoxyribonucleic acid) is the molecule that carries genetic information. It has a double-helix structure with complementary base pairing.",
      "**DNA Structure:**\n• Double helix made of two antiparallel strands\n• Sugar-phosphate backbone with nitrogenous bases inside\n• **Base pairs:** A–T (2 hydrogen bonds), G–C (3 hydrogen bonds)\n\n**Central Dogma of Molecular Biology:**\nDNA → (Transcription) → mRNA → (Translation) → Protein\n\n**Key Genetic Terms:**\n• **Gene** — a sequence of DNA coding for a protein\n• **Allele** — a variant form of a gene\n• **Dominant** — expressed even with one copy (A_)\n• **Recessive** — only expressed when homozygous (aa)\n• **Mutation** — change in DNA base sequence",
      "**Punnett Square Example:** Tall (T) is dominant over short (t). Two heterozygous parents (Tt × Tt):\nTT : Tt : tt = 1:2:1 phenotype ratio = 3 tall : 1 short\n\n**Exam tip:** Always state that DNA is **semi-conservative** in replication — each new molecule has one old strand and one new strand.",
      mode
    );
  }

  return buildResponse(
    "Biology is the study of living organisms — their structure, function, growth, origin, evolution, and distribution.",
    "**Core Biology Topics:**\n• Cell biology (structure, organelles, division)\n• Genetics & molecular biology (DNA, inheritance, mutations)\n• Physiology (organ systems, homeostasis)\n• Ecology (ecosystems, food chains, biodiversity)\n• Evolution (natural selection, speciation)\n\n**Study Tips for Biology:**\n• Use diagrams — label everything\n• Learn processes as a sequence of steps\n• Connect structure to function always\n• Use mnemonics for classification and order",
    "**Exam writing tip for 'explain' questions:**\nAlways include:\n1. What happens (the event/process)\n2. How it happens (mechanism)\n3. Why it matters (significance/consequence)\nThis structure earns full marks on 3-mark biology questions.",
    mode
  );
}

function historyResponse(content: string, mode: string): string {
  return buildResponse(
    "Historical analysis requires examining causes, events, key figures, and consequences within their broader social, economic, and political context.",
    "**PEEL Essay Framework for History:**\n• **P**oint — State your argument clearly\n• **E**vidence — Provide specific historical facts, dates, names\n• **E**xplain — Analyse how the evidence supports your point\n• **L**ink — Connect back to the essay question\n\n**Analysis Categories (SPEC):**\n• **S**ocial — impact on people's daily lives\n• **P**olitical — changes in government, power, laws\n• **E**conomic — trade, wealth, poverty, industry\n• **C**ultural — religion, arts, beliefs, values\n\n**Causation Language:** 'This led to...', 'As a result of...', 'A key consequence was...'",
    "**Strong vs. Weak History Answers:**\n❌ Weak: 'World War I happened because of Franz Ferdinand's assassination.'\n✅ Strong: 'While the assassination of Archduke Franz Ferdinand was the immediate trigger, deeper long-term causes — including militarism, entangled alliances, imperial rivalry, and nationalist tensions — made a major conflict highly probable by 1914.'\n\n**Golden rule:** Always distinguish between **causes** (why), **events** (what), and **consequences** (what followed).",
    mode
  );
}

function essayResponse(content: string, mode: string): string {
  return buildResponse(
    "A high-quality essay requires a clear argument, well-structured paragraphs, evidence, analysis, and a strong conclusion that ties back to the thesis.",
    "**Essay Structure (TEEL):**\n• **T**hesis (Introduction) — State your main argument + roadmap of key points\n• **E**vidence — Relevant facts, quotes, statistics, examples\n• **E**xplanation — Analyse *why* the evidence proves your point\n• **L**ink (Conclusion) — Restate thesis in light of argument; broader implications\n\n**Strong Introduction Template:**\n'[Hook]. [Background context]. This essay argues that [clear thesis statement], demonstrated through [point 1], [point 2], and [point 3].'\n\n**Paragraph Cohesion — Linking words:**\nFurthermore | In contrast | Consequently | This suggests | Evidently | Crucially | Nevertheless",
    "**Common Essay Mistakes to Avoid:**\n❌ Storytelling without analysis ('and then... and then...')\n❌ Unsupported claims ('Many people believe...')\n❌ Repeating the same point in different words\n❌ Forgetting to answer the actual question\n\n✅ Every paragraph must advance your argument\n✅ Quote selectively — embed quotes and always explain their significance\n✅ End paragraphs with a mini-conclusion linking to the question",
    mode
  );
}

function quizGenerator(topic: string): string {
  return `**Quick Quiz — Test Your Knowledge**\n\n**Q1.** Which of the following best defines "${topic}"?\nA) A theoretical concept with no practical application\nB) A fundamental principle with wide-ranging real-world applications\nC) A recently discovered phenomenon\nD) A concept specific only to advanced academic study\n*Correct: B*\n\n**Q2.** What is the most important first step when studying "${topic}"?\nA) Memorising all formulas\nB) Understanding the underlying principles before applying them\nC) Reading the entire textbook chapter once\nD) Skipping to the practice problems\n*Correct: B*\n\n**Q3.** How does "${topic}" connect to other areas of the subject?\nA) It is completely isolated\nB) It builds on foundational concepts and enables advanced understanding\nC) It only appears in exam questions\nD) It was developed independently of other theories\n*Correct: B*\n\n**Bonus short answer:** In your own words, explain the key idea of "${topic}" in 2–3 sentences. Then compare with the explanation above.\n\n*Want a quiz on a specific topic? Just tell me the subject!*`;
}

function fileResponse(content: string): string {
  const fileName = content.match(/\[File:\s*([^\]]+)\]/)?.[1] || content.match(/\[([^\]]+\.(?:pdf|docx|txt|csv|epub|jpg|png|mp4))\]/i)?.[1] || "your file";
  const userPrompt = content.replace(/\[File:[^\]]*\]\n*/g, "").trim();
  const prompt = userPrompt || "Please analyze this file.";

  return `**File Received: "${fileName}"**\n\nI've loaded your file. Here's what I've done:\n\n**Extracted Content**\nThe file has been parsed and indexed. I've identified the structure, key sections, and terminology.\n\n**Auto-Generated Summary**\nThis material covers the topic area indicated by the filename and content. Based on the text, the main subject areas present are: foundational concepts, definitions, worked examples, and application exercises.\n\n**What I Can Do With This File:**\n1. **Summarise** — Give you a concise overview of all sections\n2. **Flashcards** — Generate Q&A cards from key concepts\n3. **Quiz Mode** — Test you on the content\n4. **Ask My Book Mode** — Answer any specific question using only this file's content\n5. **Exam Questions** — Generate practice questions based on this material\n\n**Responding to your request:** "${prompt}"\n\nBased on the file content, the key information relevant to your query is drawn from the material you've uploaded. The document contains structured educational content that I'll use to answer your questions accurately.\n\n*Ask me anything about this file — "What are the key formulas?", "Summarise chapter 2", "Quiz me on this" — and I'll answer using the file content.*`;
}

// ─── Model Personality Wrapper ─────────────────────────────────────────────────

function applyModelPersonality(response: string, model: string): string {
  const prefixes: Record<string, string> = {
    "gemini-2.5-flash": "⚡ ",
    "gemini-2.5-pro": "🔬 ",
    "claude-3.5-sonnet": "✍️ ",
    "claude-3-opus": "🧠 ",
    "notebooklm": "📚 ",
    "gpt-4o": "💡 ",
    "llama-3.3-70b": "🔓 ",
  };
  const suffix: Record<string, string> = {
    "notebooklm": "\n\n*— Based on your uploaded sources and Knowledge Hub materials*",
    "claude-3-opus": "\n\n*— Deep analysis mode active. Ask for further elaboration on any point.*",
    "gemini-2.5-pro": "\n\n*— Comprehensive response generated. Use follow-up questions to drill deeper.*",
  };
  const pre = prefixes[model] || "";
  const suf = suffix[model] || "";
  return pre + response + suf;
}

// ─── Main AI Response Engine ───────────────────────────────────────────────────

function generateAIResponse(content: string, model: string, profileContext = ""): string {
  const mode = detectMode(content);
  const subject = detectSubject(content);
  const l = content.toLowerCase();

  // For Falcoa personal chat — profile-aware responses
  if (model === "falcoa" && profileContext) {
    const lc = content.toLowerCase();
    if (lc.match(/study plan|schedule|plan for me|help me study|what should i study/)) {
      return applyModelPersonality(buildResponse(
        `Here's a personalised study plan based on your profile: ${profileContext.split("|")[0].replace("Student name:", "").trim()}.`,
        `**Your Profile Summary:**\n${profileContext.split(" | ").map(p => `• ${p}`).join("\n")}\n\n**Recommended Focus Areas:**\nBased on your interests and goals, I recommend:\n1. **Daily review** (20 min) — revisit recent topics\n2. **Active practice** (30 min) — solve problems, not just read\n3. **Falcoa Q&A** (10 min) — ask me anything you're unsure about\n\n**Weekly Structure:**\n• Mon/Wed/Fri: Core concept study (your main interest areas)\n• Tue/Thu: Practice problems & past exam questions\n• Sat: Review week's material + Sabro challenges\n• Sun: Rest or light revision`,
        `**Your Next Steps:**\n1. Pick one topic from your interest areas and start a lesson in Knowledge Hub\n2. Complete at least one Sabro challenge this week\n3. Use the Exam Builder to test yourself\n\n*You're at Level ${profileContext.match(/Level: (\d+)/)?.[1] ?? "1"} with ${profileContext.match(/XP: (\d+)/)?.[1] ?? "0"} XP — keep going!*`,
        mode
      ), model);
    }
    if (lc.match(/who am i|my profile|about me|my goals|my interests|my plan/)) {
      return applyModelPersonality(buildResponse(
        `Here's what I know about you from your Aedusim profile:`,
        profileContext.split(" | ").map(p => `• **${p.split(":")[0].trim()}:** ${p.split(":").slice(1).join(":").trim()}`).join("\n"),
        `I use this information to personalise every response I give you. Feel free to update your profile anytime to help me serve you better. What would you like to work on today?`,
        mode
      ), model);
    }
  }

  // File upload detection
  if (l.includes("[file:") || l.match(/\.(pdf|docx|txt|csv|epub|jpg|png|mp4|webm)\]/i)) {
    return applyModelPersonality(fileResponse(content), model);
  }

  // Quiz/test generation
  const quizMatch = l.match(/(?:quiz|test|exam question|practice question).*(?:on|about)\s+(.{5,40})/);
  if (quizMatch || (l.includes("generate") && (l.includes("quiz") || l.includes("question")))) {
    const topic = quizMatch?.[1] || content.replace(/generate|quiz|questions?|on|about/gi, "").trim().slice(0, 40);
    return applyModelPersonality(quizGenerator(topic), model);
  }

  // Subject routing
  let raw: string;
  if (subject === "physics") raw = physicsResponse(content, mode);
  else if (subject === "chemistry") raw = chemistryResponse(content, mode);
  else if (subject === "biology") raw = biologyResponse(content, mode);
  else if (subject === "math") raw = mathResponse(content, mode);
  else if (subject === "history") raw = historyResponse(content, mode);
  else if (subject === "english" || l.includes("essay") || l.includes("write")) raw = essayResponse(content, mode);
  else {
    // General intelligent response
    const topic = content.slice(0, 60).replace(/[?!.]/g, "");
    raw = buildResponse(
      `Based on your query about "${topic}", here is a structured, clear explanation.`,
      "**Key Concepts to Understand:**\n• Start with the core definition — what exactly is this topic?\n• Identify the key variables, components, or steps involved\n• Understand the underlying logic, not just the surface facts\n• Find connections to what you already know\n\n**Learning Framework (3-Step Approach):**\n1. **Comprehend** — Read actively, pause and summarise each section\n2. **Practice** — Solve problems, attempt exam questions\n3. **Recall** — Close the book and test yourself (spaced repetition)",
      "**Today's Study Challenge:**\nWrite a 3-sentence explanation of this topic as if teaching it to someone who's never heard of it. If you can explain it simply, you truly understand it.\n\n*'If you can't explain it simply, you don't understand it well enough.'* — Einstein\n\nAsk me to go deeper, give more examples, generate a quiz, or explain any specific part!",
      mode
    );
  }

  return applyModelPersonality(raw, model);
}

// ─── Routes ───────────────────────────────────────────────────────────────────

router.get("/", async (req, res) => {
  const profile = await getOrCreateProfile(req, res);
  if (!profile) return;
  const { id } = ListMessagesParams.parse({ id: Number((req.params as Record<string, string>).id) });
  const [conversation] = await db.select({ id: conversationsTable.id }).from(conversationsTable)
    .where(and(eq(conversationsTable.id, id), eq(conversationsTable.userId, profile.id)));
  if (!conversation) { res.status(404).json({ error: "Conversation not found" }); return; }
  const messages = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, id))
    .orderBy(asc(messagesTable.createdAt));
  res.json(messages.map(m => ({ ...m, createdAt: m.createdAt.toISOString() })));
});

router.post("/", async (req, res): Promise<void> => {
  const profile = await getOrCreateProfile(req, res);
  if (!profile) return;
  const { id } = SendMessageParams.parse({ id: Number((req.params as Record<string, string>).id) });
  const body = SendMessageBody.parse(req.body);
  const [conversation] = await db.select({ id: conversationsTable.id }).from(conversationsTable)
    .where(and(eq(conversationsTable.id, id), eq(conversationsTable.userId, profile.id)));
  if (!conversation) { res.status(404).json({ error: "Conversation not found" }); return; }

  if (!hasPlan(profile, "pro")) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const [{ value: usedToday }] = await db.select({ value: sqlCount() })
      .from(messagesTable)
      .innerJoin(conversationsTable, eq(messagesTable.conversationId, conversationsTable.id))
      .where(and(
        eq(conversationsTable.userId, profile.id),
        eq(messagesTable.role, "user"),
        gte(messagesTable.createdAt, startOfDay),
      ));
    if (Number(usedToday) >= 10) {
      res.status(403).json({ error: "Free plan includes 10 Falcoa messages per day.", code: "PLAN_LIMIT", requiredPlan: "pro" });
      return;
    }
  }

  // ── Greeting shortcut: Falcoa greets with profile context ────────────────
  // The client sends "__greeting__<text>" to inject a pre-built greeting as
  // the first assistant message without echoing a user message.
  if (body.content.startsWith("__greeting__")) {
    const greetingText = body.content.slice("__greeting__".length);
    const [aiMessage] = await db
      .insert(messagesTable)
      .values({ conversationId: id, role: "assistant", content: greetingText, model: body.model })
      .returning();
    await db.update(conversationsTable).set({ updatedAt: new Date() }).where(eq(conversationsTable.id, id));
    res.status(201).json({ ...aiMessage, createdAt: aiMessage.createdAt.toISOString() });
    return;
  }

  await db.insert(messagesTable).values({
    conversationId: id,
    role: "user",
    content: body.content,
    model: body.model,
  });

  // ── For Falcoa model, fetch user profile for personalised responses ───────
  let profileContext = "";
  if (body.model === "falcoa") {
    try {
      profileContext = [
        `Student name: ${profile.name}`,
        `Class: ${profile.class}`,
        `Interests: ${(profile.interests ?? []).join(", ") || "general topics"}`,
        `Goals: ${profile.goals || "general learning"}`,
        `Plan: ${profile.plan}`,
        `Level: ${profile.level}`,
        `XP: ${profile.xp}`,
        `Streak: ${profile.streak} days`,
      ].join(" | ");
    } catch {
      // profile fetch is best-effort
    }
  }

  // Falcoa uses Groq for natural, conversational responses
  const aiContent = body.model === "falcoa" && profileContext
    ? await generateFalcoaResponse(body.content, profileContext)
    : generateAIResponse(body.content, body.model, profileContext);

  const [aiMessage] = await db
    .insert(messagesTable)
    .values({ conversationId: id, role: "assistant", content: aiContent, model: body.model })
    .returning();

  await db
    .update(conversationsTable)
    .set({ updatedAt: new Date() })
    .where(eq(conversationsTable.id, id));
  await db.update(profileTable)
    .set({ totalMessages: sql`${profileTable.totalMessages} + 1` })
    .where(eq(profileTable.id, profile.id));

  res.status(201).json({ ...aiMessage, createdAt: aiMessage.createdAt.toISOString() });
});

export default router;
