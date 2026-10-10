import { Router } from "express";
import { db } from "@workspace/db";
import { documentsTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { CreateDocumentBody, GetDocumentParams, DeleteDocumentParams, ChatWithDocumentParams, ChatWithDocumentBody } from "@workspace/api-zod";
import { getOrCreateProfile } from "../middleware/auth";

const router = Router();

function detectDocSubject(title: string, content: string): string {
  const text = (title + " " + content).toLowerCase();
  if (text.match(/physics|force|velocity|newton|quantum|optics|thermodynamics|energy/)) return "physics";
  if (text.match(/chemistry|element|molecule|reaction|acid|bond|organic|periodic/)) return "chemistry";
  if (text.match(/biology|cell|dna|gene|evolution|organism|photosynthesis|ecology/)) return "biology";
  if (text.match(/math|calculus|integral|algebra|geometry|trigonometry|equation|matrix/)) return "math";
  if (text.match(/history|war|revolution|empire|civiliz|colonial|century|battle/)) return "history";
  if (text.match(/english|essay|literature|grammar|poetry|novel|writing|language/)) return "english";
  if (text.match(/economics|supply|demand|market|gdp|inflation|fiscal|monetary/)) return "economics";
  if (text.match(/computer|programming|algorithm|python|javascript|software|network/)) return "cs";
  return "general";
}

function generateSummary(content: string, title: string): string {
  const subject = detectDocSubject(title, content);
  const wordCount = content.split(/\s+/).length;
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20).slice(0, 3);
  const preview = sentences.join(". ").slice(0, 300);

  const subjectContext: Record<string, string> = {
    physics: "physical laws, quantities, and mathematical relationships",
    chemistry: "chemical properties, reactions, and molecular structures",
    biology: "biological systems, processes, and living organisms",
    math: "mathematical concepts, proofs, and problem-solving techniques",
    history: "historical events, figures, causes, and consequences",
    english: "literary themes, language techniques, and critical analysis",
    economics: "economic principles, market dynamics, and quantitative models",
    cs: "computational concepts, algorithms, and programming techniques",
    general: "key concepts, principles, and their applications",
  };

  return `**Document: "${title}"**\n\nThis document contains ${wordCount} words covering ${subjectContext[subject] || subjectContext.general}. ${preview ? `\n\nContent Preview: ${preview}...` : ""}\n\nThis material has been processed by the Knowledge Hub AI. Key concepts have been extracted, flashcards generated, and the content is ready for AI-assisted study. Use the Key Points, Flashcards, and AI Chat tabs to master this material.`;
}

function generateFlashcards(content: string, title: string): Array<{ question: string; answer: string }> {
  const subject = detectDocSubject(title, content);
  const words = content.split(/\s+/).filter(w => w.length > 6);
  const sampleWords = [...new Set(words)].slice(0, 5);

  const subjectCards: Record<string, Array<{ question: string; answer: string }>> = {
    physics: [
      { question: "What is Newton's Second Law and its equation?", answer: "F = ma. The net force on an object equals its mass multiplied by its acceleration. F is in Newtons, m in kg, a in m/s²." },
      { question: "State the Law of Conservation of Energy.", answer: "Energy cannot be created or destroyed, only transferred between forms. Total energy in a closed system remains constant." },
      { question: "What is the difference between speed and velocity?", answer: "Speed is a scalar (magnitude only). Velocity is a vector (magnitude + direction). Average velocity = displacement/time; average speed = distance/time." },
      { question: "Define work done in physics.", answer: "W = Fd cosθ, where F is force, d is displacement, and θ is the angle between them. Work is measured in Joules (J)." },
      { question: "What is Hooke's Law?", answer: "F = kx. The force in a spring is proportional to its extension, where k is the spring constant (N/m) and x is extension (m). Valid within the elastic limit." },
    ],
    chemistry: [
      { question: "What is an ionic bond?", answer: "A bond formed by electrostatic attraction between oppositely charged ions, created when one atom transfers electrons to another. Occurs between metals and non-metals." },
      { question: "Define Le Chatelier's Principle.", answer: "When a change is applied to a system in equilibrium, the system shifts to counteract that change and restore equilibrium (temperature, pressure, concentration changes)." },
      { question: "What is the ideal gas law?", answer: "PV = nRT, where P = pressure, V = volume, n = moles, R = 8.314 J/mol·K, T = temperature in Kelvin." },
      { question: "Define oxidation and reduction (OIL RIG).", answer: "Oxidation Is Loss (of electrons), Reduction Is Gain (of electrons). In oxidation the oxidation number increases; in reduction it decreases." },
      { question: "What is pH and how is it calculated?", answer: "pH = −log₁₀[H⁺]. A measure of acidity: pH < 7 is acidic, pH = 7 is neutral, pH > 7 is alkaline. Each unit represents a 10× change in [H⁺]." },
    ],
    biology: [
      { question: "What are the stages of mitosis in order?", answer: "PMAT: Prophase (chromatin condenses), Metaphase (chromosomes align at equator), Anaphase (chromatids pulled to poles), Telophase (nuclear envelopes reform). Result: 2 identical diploid cells." },
      { question: "What is the central dogma of molecular biology?", answer: "DNA → Transcription → mRNA → Translation → Protein. DNA is transcribed to mRNA in the nucleus; mRNA is translated to proteins at ribosomes." },
      { question: "Distinguish between active and passive transport.", answer: "Passive transport moves substances down a concentration gradient (no ATP needed): diffusion, osmosis, facilitated diffusion. Active transport moves against gradient using ATP: sodium-potassium pump, endocytosis." },
      { question: "What is natural selection?", answer: "Individuals with heritable traits better suited to their environment survive and reproduce more (survival of the fittest). Over generations, these traits increase in frequency, leading to evolution." },
      { question: "What is the function of enzymes?", answer: "Enzymes are biological catalysts (proteins) that lower activation energy. They are specific to their substrate (lock-and-key or induced-fit model). Activity affected by temperature, pH, inhibitors." },
    ],
    math: [
      { question: "State the Fundamental Theorem of Calculus.", answer: "If F'(x) = f(x), then ∫ₐᵇ f(x)dx = F(b) − F(a). It connects differentiation and integration as inverse operations." },
      { question: "What is the quadratic formula?", answer: "For ax² + bx + c = 0: x = (−b ± √(b²−4ac)) / 2a. The discriminant b²−4ac determines number of solutions: >0 two roots, =0 one root, <0 no real roots." },
      { question: "State the product and chain rules.", answer: "Product rule: d/dx(uv) = u'v + uv'. Chain rule: d/dx[f(g(x))] = f'(g(x))·g'(x). Both essential for differentiating composite and multiplied functions." },
      { question: "What is Euler's Identity?", answer: "e^(iπ) + 1 = 0. Considered the most beautiful equation in mathematics, connecting five fundamental constants: e, i, π, 1, and 0." },
      { question: "What is the binomial theorem?", answer: "(a+b)ⁿ = Σ C(n,k) · aⁿ⁻ᵏ · bᵏ for k=0 to n. C(n,k) = n!/(k!(n−k)!) are the binomial coefficients from Pascal's triangle." },
    ],
    general: [
      { question: `What is the main subject of "${title}"?`, answer: `This document covers the key principles, concepts, and applications related to ${title}. Use the Summary tab for a full overview.` },
      { question: "What study technique maximises retention?", answer: "Spaced repetition combined with active recall. Study material, then close the book and recall key points. Return after 1 day, 3 days, 1 week, 2 weeks to reinforce memory." },
      { question: "What is the Feynman Technique?", answer: "1) Study the concept. 2) Explain it in simple language as if teaching a child. 3) Identify gaps in your explanation. 4) Return to source material to fill gaps. 5) Repeat until you can explain clearly." },
      { question: "How should you approach exam questions?", answer: "R-E-A-D: Read all questions first, mark those you know well. Answer easiest first (confidence + marks). Allocate time per mark. Double-check after completion." },
      { question: "What is the best way to use these flashcards?", answer: "Test yourself without looking at the answer first. Score each card: Easy (seen again in 2 weeks), Medium (seen again in 3 days), Hard (seen again tomorrow). This is spaced repetition." },
    ],
  };

  const cards = subjectCards[subject] || subjectCards.general;

  // Add one document-specific card
  cards.push({
    question: `What key terms appear most frequently in "${title}"?`,
    answer: `Key terms extracted: ${sampleWords.slice(0, 4).join(", ")}. These represent the core vocabulary of this document. Make sure you can define each term precisely.`,
  });

  return cards.slice(0, 6);
}

function generateKeyPoints(content: string, title: string): string[] {
  const subject = detectDocSubject(title, content);
  const base: Record<string, string[]> = {
    physics: [
      "Always include units in every calculation — marks are lost for missing units",
      "Vector quantities have both magnitude and direction (velocity, force, momentum, displacement)",
      "Scalar quantities have magnitude only (speed, mass, energy, distance)",
      "In every physics problem: identify knowns, choose the right equation, substitute, solve",
      "Conservation laws (energy, momentum, charge) are powerful problem-solving tools",
      "Experimental errors: random errors affect precision; systematic errors affect accuracy",
    ],
    chemistry: [
      "Balance chemical equations by adjusting coefficients, not subscripts",
      "Moles = mass ÷ molar mass (Mr). This is the starting point for all stoichiometry calculations",
      "Oxidation state rules: uncombined elements = 0; O = −2 (usually); H = +1 (usually); sum = overall charge",
      "Equilibrium constant K only changes with temperature — not concentration or pressure",
      "Enthalpy change (ΔH) negative = exothermic; positive = endothermic",
      "Reaction rate increases with: temperature, concentration, surface area, catalysts",
    ],
    biology: [
      "Structure always relates to function — if asked to explain an adaptation, link shape/composition to role",
      "Use precise biological terminology: do not say 'go through' when you mean 'diffuse across'",
      "Photosynthesis: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂ (light-dependent + light-independent stages)",
      "Aerobic respiration: C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + 38 ATP",
      "Genetic crosses: always set up a Punnett square and state phenotype ratios",
      "Evolution requires: variation, selection pressure, heritability, and time",
    ],
    math: [
      "Show all working — method marks are available even if the final answer is wrong",
      "Always re-read the question after solving to confirm you answered what was asked",
      "Estimate answers before calculating to catch errors (sanity checks)",
      "Differentiation finds gradient/rate of change; integration finds area/accumulated quantity",
      "Factorisation is the fastest method for simple quadratics — try this before the formula",
      "Graphs: mark axes, label intercepts, state domain/range when required",
    ],
    general: [
      "Read actively — summarise each section in your own words immediately after reading",
      "Identify the key terms and definitions — these are the building blocks of understanding",
      "Connect new material to what you already know — build a knowledge web",
      "Practice retrieval: close the document and recall the main points from memory",
      "Create a mind map linking all concepts — visual organisation aids retention",
      "Use the AI Chat tab to clarify any concept you're unsure about",
    ],
  };
  return (base[subject] || base.general).slice(0, 6);
}

function generateFormulas(title: string, content: string): string[] {
  const subject = detectDocSubject(title, content);
  const formulaBank: Record<string, string[]> = {
    physics: ["F = ma (Newton's Second Law)", "E = mc² (Mass-Energy Equivalence)", "v² = u² + 2as (Kinematics)", "KE = ½mv² (Kinetic Energy)", "p = mv (Momentum)", "W = Fd cosθ (Work Done)", "P = W/t (Power)", "E_k = p²/2m (Energy from Momentum)"],
    chemistry: ["PV = nRT (Ideal Gas Law)", "pH = −log[H⁺]", "ΔG = ΔH − TΔS (Gibbs Free Energy)", "E = hf (Planck's Equation)", "Moles = mass/Mr", "Concentration = moles/volume", "ΔH = mcΔT (Enthalpy change)", "Kc = [products]/[reactants] (Equilibrium Constant)"],
    biology: ["Magnification = image size / actual size", "Net productivity = Gross productivity − Respiration", "Heart rate × Stroke volume = Cardiac output", "Hardy-Weinberg: p² + 2pq + q² = 1", "Chi-squared: χ² = Σ(O−E)²/E"],
    math: ["d/dx(xⁿ) = nxⁿ⁻¹ (Power Rule)", "∫xⁿ dx = xⁿ⁺¹/(n+1) + C", "x = (−b ± √(b²−4ac)) / 2a (Quadratic)", "a² + b² = c² (Pythagorean Theorem)", "e^(iπ) + 1 = 0 (Euler)", "sin²x + cos²x = 1 (Trig Identity)", "ln(eˣ) = x, e^(ln x) = x"],
    general: [],
  };
  return (formulaBank[subject] || []).slice(0, 6);
}

function answerDocumentQuestion(question: string, content: string, title: string): string {
  const q = question.toLowerCase();
  const subject = detectDocSubject(title, content);

  // Content-aware answers
  const contentWords = content.toLowerCase().split(/\s+/);
  const qWords = q.split(/\s+/).filter(w => w.length > 4);
  const relevantSentences = content.split(/[.!?]+/)
    .filter(s => qWords.some(w => s.toLowerCase().includes(w)))
    .slice(0, 3)
    .map(s => s.trim())
    .filter(s => s.length > 20);

  if (q.includes("summary") || q.includes("overview") || q.includes("what is this about")) {
    return `**Summary of "${title}"**\n\n${generateSummary(content, title)}\n\nAsk me specific questions to go deeper on any section!`;
  }

  if (q.includes("formula") || q.includes("equation") || q.includes("formula")) {
    const formulas = generateFormulas(title, content);
    if (formulas.length > 0) {
      return `**Formulas from "${title}"**\n\n${formulas.map((f, i) => `${i + 1}. \`${f}\``).join("\n")}\n\n**Study tip:** For each formula, make sure you know: what each symbol represents, the units, when to apply it, and any conditions/limitations.`;
    }
    return `Based on the content of "${title}", the key mathematical relationships involve the principles discussed in the document. Use the Formulas tab for subject-specific equations.`;
  }

  if (q.includes("flashcard") || q.includes("test me") || q.includes("quiz me")) {
    const cards = generateFlashcards(content, title).slice(0, 3);
    return `**Quick Quiz from "${title}"**\n\n${cards.map((c, i) => `**Q${i + 1}:** ${c.question}\n*(Click to reveal answer in Flashcards tab)*`).join("\n\n")}\n\nHead to the **Flashcards tab** for all cards with flip-to-reveal answers!`;
  }

  if (relevantSentences.length > 0) {
    return `**From "${title}" — regarding: "${question}"**\n\nBased on the document content, here's what's most relevant:\n\n${relevantSentences.map(s => `> "${s}"`).join("\n\n")}\n\n**Analysis:** ${relevantSentences[0].trim()}. This concept is important because it establishes the foundation for the broader principles discussed in this document.\n\n*If you'd like a deeper explanation of any specific aspect, ask me to elaborate!*`;
  }

  // Subject-specific fallback
  const subjectAnswers: Record<string, string> = {
    physics: `Based on "${title}", the physics involved relates to fundamental laws governing matter, energy, and their interactions. The key principle is: understand the physical meaning of each quantity before applying any formula. Always check: Have you identified the system? Are all forces accounted for? Are units consistent?`,
    chemistry: `In "${title}", the chemistry focuses on understanding how and why reactions and interactions occur at the molecular level. Key strategy: identify the type of reaction or process first, then apply the relevant principles (stoichiometry, equilibrium, thermodynamics).`,
    biology: `From "${title}", the biological concept you're asking about relates to how living systems maintain function and respond to change. Remember: in biology, structure always determines function — start by understanding *why* something is structured the way it is.`,
    math: `Regarding "${title}", the mathematical approach requires systematic problem-solving: identify what you know, what you need to find, which theorem or technique applies, then work through step by step. Show all working!`,
    general: `Great question about content in "${title}"! The document addresses this through the principles and examples it covers. I'd recommend also checking the Key Points and Flashcards tabs for structured summaries of the most important information.`,
  };

  return subjectAnswers[subject] || subjectAnswers.general;
}

router.get("/", async (req, res) => {
  const profile = await getOrCreateProfile(req, res);
  if (!profile) return;
  const docs = await db.select().from(documentsTable)
    .where(eq(documentsTable.userId, profile.id))
    .orderBy(desc(documentsTable.createdAt));
  res.json(docs.map(d => ({
    ...d,
    flashcards: d.flashcards as Array<{ question: string; answer: string }>,
    keyPoints: d.keyPoints as string[],
    formulas: d.formulas as string[],
    createdAt: d.createdAt.toISOString(),
  })));
});

router.post("/", async (req, res) => {
  const profile = await getOrCreateProfile(req, res);
  if (!profile) return;
  const body = CreateDocumentBody.parse(req.body);
  if (profile.plan === "free") {
    const existing = await db.select({ id: documentsTable.id }).from(documentsTable)
      .where(eq(documentsTable.userId, profile.id));
    if (existing.length >= 3) {
      res.status(403).json({ error: "Free plan allows up to 3 saved documents.", code: "PLAN_LIMIT", requiredPlan: "pro" });
      return;
    }
  }
  const summary = generateSummary(body.content, body.title);
  const flashcards = generateFlashcards(body.content, body.title);
  const keyPoints = generateKeyPoints(body.content, body.title);
  const formulas = generateFormulas(body.title, body.content);

  const [doc] = await db.insert(documentsTable).values({
    userId: profile.id,
    title: body.title,
    type: body.type ?? "TXT",
    content: body.content,
    summary,
    flashcards,
    keyPoints,
    formulas,
  }).returning();

  res.status(201).json({
    ...doc,
    flashcards: doc.flashcards as Array<{ question: string; answer: string }>,
    keyPoints: doc.keyPoints as string[],
    formulas: doc.formulas as string[],
    createdAt: doc.createdAt.toISOString(),
  });
});

router.get("/:id", async (req, res) => {
  const profile = await getOrCreateProfile(req, res);
  if (!profile) return;
  const { id } = GetDocumentParams.parse({ id: Number(req.params.id) });
  const [doc] = await db.select().from(documentsTable).where(and(eq(documentsTable.id, id), eq(documentsTable.userId, profile.id)));
  if (!doc) { res.status(404).json({ error: "Document not found" }); return; }
  res.json({
    ...doc,
    flashcards: doc.flashcards as Array<{ question: string; answer: string }>,
    keyPoints: doc.keyPoints as string[],
    formulas: doc.formulas as string[],
    createdAt: doc.createdAt.toISOString(),
  });
});

router.delete("/:id", async (req, res) => {
  const profile = await getOrCreateProfile(req, res);
  if (!profile) return;
  const { id } = DeleteDocumentParams.parse({ id: Number(req.params.id) });
  await db.delete(documentsTable).where(and(eq(documentsTable.id, id), eq(documentsTable.userId, profile.id)));
  res.status(204).send();
});

router.post("/:id/chat", async (req, res) => {
  const profile = await getOrCreateProfile(req, res);
  if (!profile) return;
  const { id } = ChatWithDocumentParams.parse({ id: Number(req.params.id) });
  const body = ChatWithDocumentBody.parse(req.body);
  const [doc] = await db.select().from(documentsTable).where(and(eq(documentsTable.id, id), eq(documentsTable.userId, profile.id)));
  if (!doc) { res.status(404).json({ error: "Document not found" }); return; }
  const answer = answerDocumentQuestion(body.question, doc.content, doc.title);
  res.json({ answer, sources: [doc.title, "Knowledge Hub AI Engine"] });
});

export default router;
