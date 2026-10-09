import { physics as physicsCurriculum } from "./subjects/physics.ts";

// ─── Type Definitions ─────────────────────────────────────────────────────────

export type Level =
  | "foundations"
  | "core"
  | "applications"
  | "advanced"
  | "expert"
  | "research"
  | "olympiad";

export interface Problem {
  id: string;
  difficulty: "easy" | "medium" | "hard" | "challenge" | "olympiad";
  type: "mcq" | "short" | "numerical";
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
}

export interface Example {
  title: string;
  given: string;
  solution: string[];
  answer: string;
}

export type Block =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "formula"; label?: string; text: string }
  | { type: "list"; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "callout"; variant: "info" | "tip" | "warning" | "key"; text: string }
  | { type: "image"; url: string; caption?: string; alt: string }
  | { type: "divider" };

export interface Topic {
  slug: string;
  name: string;
  description: string;
  estimatedMinutes: number;
  xpReward: number;
  hasSimulation?: boolean;
  simulationType?: string;
  theory: Block[];
  keyFormulas?: string[];
  examples: Example[];
  problems: Problem[];
}

export interface Chapter {
  slug: string;
  name: string;
  description: string;
  level: Level;
  topics: Topic[];
}

export interface Subject {
  slug: string;
  name: string;
  emoji: string;
  color: string;
  gradient: string;
  description: string;
  coverImage?: string;
  chapterImage?: string;
  chapters: Chapter[];
}

// ─── Level Config ─────────────────────────────────────────────────────────────

export const LEVEL_CONFIG: Record<Level, { label: string; color: string; bg: string }> = {
  foundations:  { label: "Foundations",   color: "#6366f1", bg: "#6366f115" },
  core:         { label: "Core Concepts", color: "#8b5cf6", bg: "#8b5cf615" },
  applications: { label: "Applications",  color: "#06b6d4", bg: "#06b6d415" },
  advanced:     { label: "Advanced",      color: "#f59e0b", bg: "#f59e0b15" },
  expert:       { label: "Expert",        color: "#ef4444", bg: "#ef444415" },
  research:     { label: "Research",      color: "#ec4899", bg: "#ec489915" },
  olympiad:     { label: "Olympiad",      color: "#10b981", bg: "#10b98115" },
};

// ─── Placement Test Questions ─────────────────────────────────────────────────

export const PLACEMENT_TESTS: Record<string, Problem[]> = {
  physics: [
    {
      id: "pt-phy-1", difficulty: "easy", type: "mcq",
      question: "A car travels 100 m in 10 s. What is its average speed?",
      options: ["5 m/s", "10 m/s", "100 m/s", "1000 m/s"],
      answer: "10 m/s",
      explanation: "Speed = distance / time = 100 / 10 = 10 m/s"
    },
    {
      id: "pt-phy-2", difficulty: "easy", type: "mcq",
      question: "Which of Newton's laws states that F = ma?",
      options: ["First law", "Second law", "Third law", "Law of Gravitation"],
      answer: "Second law",
      explanation: "Newton's Second Law: Net force = mass × acceleration"
    },
    {
      id: "pt-phy-3", difficulty: "medium", type: "mcq",
      question: "A 5 kg object accelerates at 3 m/s². What net force acts on it?",
      options: ["8 N", "15 N", "1.67 N", "25 N"],
      answer: "15 N",
      explanation: "F = ma = 5 × 3 = 15 N"
    },
    {
      id: "pt-phy-4", difficulty: "medium", type: "mcq",
      question: "An object is thrown upward at 20 m/s. How high does it reach? (g = 10 m/s²)",
      options: ["10 m", "20 m", "40 m", "200 m"],
      answer: "20 m",
      explanation: "v² = u² - 2gh → 0 = 400 - 20h → h = 20 m"
    },
    {
      id: "pt-phy-5", difficulty: "hard", type: "mcq",
      question: "Two objects of mass 2 kg and 3 kg collide perfectly inelastically at 4 m/s and 0 m/s respectively. What is the final velocity?",
      options: ["1.6 m/s", "2.4 m/s", "4.0 m/s", "0.8 m/s"],
      answer: "1.6 m/s",
      explanation: "Conservation of momentum: 2×4 + 3×0 = 5×v → v = 8/5 = 1.6 m/s"
    },
  ],
  chemistry: [
    {
      id: "pt-chem-1", difficulty: "easy", type: "mcq",
      question: "How many protons does a Carbon atom have?",
      options: ["4", "6", "8", "12"],
      answer: "6",
      explanation: "Carbon has atomic number 6, meaning 6 protons in its nucleus."
    },
    {
      id: "pt-chem-2", difficulty: "easy", type: "mcq",
      question: "What is the chemical formula for water?",
      options: ["HO", "H₂O", "H₂O₂", "OH"],
      answer: "H₂O",
      explanation: "Water consists of 2 hydrogen atoms covalently bonded to 1 oxygen atom."
    },
    {
      id: "pt-chem-3", difficulty: "medium", type: "mcq",
      question: "How many moles are in 44 g of CO₂? (M = 44 g/mol)",
      options: ["0.5", "1.0", "2.0", "44"],
      answer: "1.0",
      explanation: "n = mass / molar mass = 44 / 44 = 1 mol"
    },
    {
      id: "pt-chem-4", difficulty: "medium", type: "mcq",
      question: "What type of bond forms between Na and Cl in NaCl?",
      options: ["Covalent", "Metallic", "Ionic", "Hydrogen"],
      answer: "Ionic",
      explanation: "Na loses an electron to Cl, forming Na⁺ and Cl⁻ ions held by ionic bonds."
    },
  ],
  mathematics: [
    {
      id: "pt-math-1", difficulty: "easy", type: "mcq",
      question: "Solve: 2x + 6 = 14",
      options: ["x = 3", "x = 4", "x = 7", "x = 10"],
      answer: "x = 4",
      explanation: "2x = 14 - 6 = 8, so x = 4"
    },
    {
      id: "pt-math-2", difficulty: "medium", type: "mcq",
      question: "What is the derivative of f(x) = x³?",
      options: ["x²", "3x²", "3x", "x⁴/4"],
      answer: "3x²",
      explanation: "Using the power rule: d/dx(xⁿ) = nxⁿ⁻¹, so d/dx(x³) = 3x²"
    },
    {
      id: "pt-math-3", difficulty: "medium", type: "mcq",
      question: "What is sin(90°)?",
      options: ["0", "0.5", "1", "√2/2"],
      answer: "1",
      explanation: "sin(90°) = 1. At 90°, the opposite side equals the hypotenuse."
    },
  ],
  "computer-science": [
    {
      id: "pt-cs-1", difficulty: "easy", type: "mcq",
      question: "Which data structure uses LIFO (Last In, First Out)?",
      options: ["Queue", "Stack", "Array", "Linked List"],
      answer: "Stack",
      explanation: "A stack follows LIFO — the last element pushed is the first popped."
    },
    {
      id: "pt-cs-2", difficulty: "medium", type: "mcq",
      question: "What is the time complexity of binary search?",
      options: ["O(n)", "O(n²)", "O(log n)", "O(1)"],
      answer: "O(log n)",
      explanation: "Binary search halves the search space each step, giving O(log n) complexity."
    },
  ],
};

// ─── Subjects Data ─────────────────────────────────────────────────────────────

export const SUBJECTS: Subject[] = [
  physicsCurriculum,
  // ══════════════════════════════════════════════════════════════════════════════
  // PHYSICS
  // ══════════════════════════════════════════════════════════════════════════════
  {
    slug: "physics-legacy",
    name: "Physics",
    emoji: "⚡",
    color: "#6366f1",
    gradient: "from-indigo-500 to-violet-600",
    description: "Explore the fundamental laws that govern the universe — from quantum particles to cosmic scales.",
    coverImage: "/physics-concepts.png",
    chapterImage: "/physics-chapter-opening.png",
    chapters: [
      {
        slug: "mechanics",
        name: "Mechanics",
        description: "The foundation of classical physics — motion, forces, and energy.",
        level: "foundations",
        topics: [
          {
            slug: "kinematics",
            name: "Kinematics",
            description: "Describing motion without forces — velocity, acceleration, and displacement.",
            estimatedMinutes: 30,
            xpReward: 150,
            hasSimulation: true,
            simulationType: "projectile",
            keyFormulas: ["v = u + at", "s = ut + ½at²", "v² = u² + 2as"],
            theory: [
              { type: "heading", level: 2, text: "What is Kinematics?" },
              { type: "paragraph", text: "Kinematics is the branch of mechanics that describes the **motion** of objects without considering the forces that cause them. It answers: *How fast? How far? In which direction?*" },
              { type: "callout", variant: "key", text: "Key quantities: Position (x), Displacement (Δx), Velocity (v), Acceleration (a), Time (t)." },
              { type: "heading", level: 2, text: "Scalars vs Vectors" },
              { type: "paragraph", text: "Speed and distance are **scalar** quantities (magnitude only). Velocity and displacement are **vector** quantities (magnitude AND direction). This distinction is crucial in physics." },
              { type: "table", headers: ["Scalar", "Vector"], rows: [["Speed", "Velocity"], ["Distance", "Displacement"], ["Time", "Acceleration"]] },
              { type: "heading", level: 2, text: "Equations of Motion (SUVAT)" },
              { type: "paragraph", text: "For constant acceleration, five equations relate the five kinematic variables: **s** (displacement), **u** (initial velocity), **v** (final velocity), **a** (acceleration), **t** (time)." },
              { type: "formula", label: "Velocity", text: "v = u + at" },
              { type: "formula", label: "Displacement", text: "s = ut + ½at²" },
              { type: "formula", label: "Velocity-displacement", text: "v² = u² + 2as" },
              { type: "formula", label: "Average velocity", text: "s = ½(u + v)t" },
              { type: "callout", variant: "tip", text: "Choose the equation that contains 3 known variables and 1 unknown. You don't need to know all 5 — just 3." },
              { type: "heading", level: 2, text: "Free Fall" },
              { type: "paragraph", text: "Near Earth's surface, all objects fall with the same acceleration g = 9.8 m/s² (≈ 10 m/s²) downward, regardless of mass. This is a special case of kinematics with a = −g." },
              { type: "callout", variant: "info", text: "The negative sign for g depends on sign convention. If upward is positive, then a = −9.8 m/s²." },
            ],
            examples: [
              {
                title: "Car Accelerating from Rest",
                given: "A car starts from rest and accelerates at 4 m/s². How fast is it going after 6 seconds? How far has it traveled?",
                solution: [
                  "Given: u = 0 m/s, a = 4 m/s², t = 6 s",
                  "For velocity: v = u + at = 0 + 4 × 6 = 24 m/s",
                  "For distance: s = ut + ½at² = 0 + ½ × 4 × 36 = 72 m",
                ],
                answer: "v = 24 m/s, s = 72 m",
              },
              {
                title: "Ball Thrown Upward",
                given: "A ball is thrown vertically upward at 15 m/s. (g = 10 m/s²) Find: (a) maximum height, (b) time to reach it.",
                solution: [
                  "At max height, v = 0. Sign convention: upward +, so a = −10 m/s²",
                  "(a) v² = u² + 2as → 0 = 225 + 2(−10)s → 20s = 225 → s = 11.25 m",
                  "(b) v = u + at → 0 = 15 − 10t → t = 1.5 s",
                ],
                answer: "Max height = 11.25 m, Time = 1.5 s",
              },
            ],
            problems: [
              {
                id: "kin-1", difficulty: "easy", type: "mcq",
                question: "A cyclist moves at 12 m/s and decelerates at 3 m/s². How long does it take to stop?",
                options: ["2 s", "4 s", "3 s", "6 s"],
                answer: "4 s",
                explanation: "v = u + at → 0 = 12 − 3t → t = 4 s",
              },
              {
                id: "kin-2", difficulty: "easy", type: "mcq",
                question: "An object starts at rest and reaches 20 m/s in 5 s. What is its acceleration?",
                options: ["2 m/s²", "4 m/s²", "100 m/s²", "25 m/s²"],
                answer: "4 m/s²",
                explanation: "a = (v − u) / t = (20 − 0) / 5 = 4 m/s²",
              },
              {
                id: "kin-3", difficulty: "medium", type: "mcq",
                question: "A stone dropped from a cliff hits the ground after 4 s. How tall is the cliff? (g = 10 m/s²)",
                options: ["20 m", "40 m", "80 m", "160 m"],
                answer: "80 m",
                explanation: "s = ut + ½gt² = 0 + ½ × 10 × 16 = 80 m",
              },
              {
                id: "kin-4", difficulty: "medium", type: "mcq",
                question: "Two trains approach each other at 60 km/h and 90 km/h. If they are 300 km apart, when do they meet?",
                options: ["1 h", "2 h", "3 h", "4 h"],
                answer: "2 h",
                explanation: "Combined speed = 150 km/h. Time = 300 / 150 = 2 h",
              },
              {
                id: "kin-5", difficulty: "hard", type: "mcq",
                question: "A ball is thrown horizontally at 10 m/s from a height of 20 m. What is the horizontal distance when it lands? (g = 10 m/s²)",
                options: ["10 m", "20 m", "40 m", "200 m"],
                answer: "20 m",
                explanation: "Time to fall: 20 = ½(10)t² → t = 2 s. Horizontal: x = 10 × 2 = 20 m",
              },
            ],
          },
          {
            slug: "newtons-laws",
            name: "Newton's Laws",
            description: "The three fundamental laws that govern how forces affect motion.",
            estimatedMinutes: 35,
            xpReward: 180,
            keyFormulas: ["F = ma", "F_AB = −F_BA", "w = mg"],
            theory: [
              { type: "heading", level: 2, text: "Newton's Three Laws" },
              { type: "paragraph", text: "Isaac Newton's three laws of motion (published in *Principia Mathematica*, 1687) form the backbone of classical mechanics. They describe the relationship between a body and the forces acting on it." },
              { type: "heading", level: 3, text: "First Law — The Law of Inertia" },
              { type: "callout", variant: "key", text: "An object at rest stays at rest, and an object in motion stays in motion at constant velocity, unless acted upon by a net external force." },
              { type: "paragraph", text: "This means every object resists changes to its state of motion. The measure of this resistance is **inertia**, quantified by **mass**." },
              { type: "heading", level: 3, text: "Second Law — F = ma" },
              { type: "formula", label: "Newton's 2nd Law", text: "F_net = ma" },
              { type: "paragraph", text: "The net force on an object equals its mass times its acceleration. This is the most used equation in mechanics — it connects the *cause* (force) with the *effect* (acceleration)." },
              { type: "callout", variant: "tip", text: "Net force means the vector sum of ALL forces. Always draw a free-body diagram first." },
              { type: "heading", level: 3, text: "Third Law — Action–Reaction" },
              { type: "callout", variant: "key", text: "For every action force, there is an equal and opposite reaction force." },
              { type: "paragraph", text: "When you push a wall, the wall pushes you back with exactly the same force. These forces act on *different* objects, so they don't cancel each other." },
              { type: "heading", level: 2, text: "Weight vs Mass" },
              { type: "formula", label: "Weight", text: "W = mg" },
              { type: "paragraph", text: "Mass is the amount of matter (kg). Weight is the gravitational force on an object (N). On Earth, g ≈ 9.8 m/s². On the Moon, g ≈ 1.6 m/s² — your mass stays the same, but your weight changes." },
              { type: "heading", level: 2, text: "Free Body Diagrams" },
              { type: "paragraph", text: "A free body diagram (FBD) shows all forces on a single object as arrows. Steps: (1) Isolate the object, (2) Draw all forces (gravity, normal, friction, tension), (3) Sum forces in each direction." },
            ],
            examples: [
              {
                title: "Block on a surface",
                given: "A 10 kg block is pushed with a 50 N force across a frictionless floor. What is its acceleration?",
                solution: ["F_net = ma", "50 = 10 × a", "a = 5 m/s²"],
                answer: "a = 5 m/s²",
              },
              {
                title: "Atwood Machine",
                given: "Two masses (3 kg and 5 kg) are connected by a string over a frictionless pulley. Find the acceleration. (g = 10 m/s²)",
                solution: [
                  "Net force = (5 − 3) × 10 = 20 N downward on 5 kg side",
                  "Total mass = 8 kg",
                  "a = F/m = 20/8 = 2.5 m/s²",
                ],
                answer: "a = 2.5 m/s²",
              },
            ],
            problems: [
              {
                id: "nl-1", difficulty: "easy", type: "mcq",
                question: "A 4 kg object accelerates at 5 m/s². What net force acts on it?",
                options: ["0.8 N", "9 N", "20 N", "1 N"],
                answer: "20 N",
                explanation: "F = ma = 4 × 5 = 20 N",
              },
              {
                id: "nl-2", difficulty: "easy", type: "mcq",
                question: "A 70 kg person stands on a scale. What does the scale read? (g = 10 m/s²)",
                options: ["7 N", "70 N", "700 N", "7000 N"],
                answer: "700 N",
                explanation: "W = mg = 70 × 10 = 700 N",
              },
              {
                id: "nl-3", difficulty: "medium", type: "mcq",
                question: "A 2 kg block experiences a 10 N force to the right and 4 N friction to the left. What is the acceleration?",
                options: ["2 m/s²", "3 m/s²", "5 m/s²", "7 m/s²"],
                answer: "3 m/s²",
                explanation: "F_net = 10 − 4 = 6 N. a = 6/2 = 3 m/s²",
              },
              {
                id: "nl-4", difficulty: "hard", type: "mcq",
                question: "A rocket of mass 1000 kg experiences thrust of 15000 N. If g = 10 m/s², what is the rocket's net upward acceleration?",
                options: ["5 m/s²", "10 m/s²", "15 m/s²", "25 m/s²"],
                answer: "5 m/s²",
                explanation: "Weight = 1000 × 10 = 10000 N down. Net force = 15000 − 10000 = 5000 N up. a = 5000/1000 = 5 m/s²",
              },
            ],
          },
          {
            slug: "work-energy",
            name: "Work & Energy",
            description: "Work, kinetic energy, potential energy, and the law of conservation of energy.",
            estimatedMinutes: 35,
            xpReward: 180,
            keyFormulas: ["W = Fd cosθ", "KE = ½mv²", "PE = mgh", "W_net = ΔKE"],
            theory: [
              { type: "heading", level: 2, text: "Work" },
              { type: "paragraph", text: "In physics, **work** is done when a force causes displacement. It is a scalar quantity measured in Joules (J)." },
              { type: "formula", label: "Work", text: "W = F · d · cos θ" },
              { type: "paragraph", text: "θ is the angle between the force and displacement. If force and displacement are parallel (θ = 0°), W = Fd. If perpendicular (θ = 90°), W = 0 — no work done." },
              { type: "callout", variant: "info", text: "A force perpendicular to motion (like centripetal force) does zero work." },
              { type: "heading", level: 2, text: "Kinetic Energy" },
              { type: "formula", label: "Kinetic Energy", text: "KE = ½mv²" },
              { type: "paragraph", text: "Kinetic energy is energy due to motion. It depends on **mass** and the **square** of velocity — doubling speed quadruples KE." },
              { type: "heading", level: 2, text: "Gravitational Potential Energy" },
              { type: "formula", label: "Gravitational PE", text: "PE = mgh" },
              { type: "paragraph", text: "Objects elevated above a reference point store gravitational potential energy. h is height above the reference, g ≈ 9.8 m/s²." },
              { type: "heading", level: 2, text: "Work-Energy Theorem" },
              { type: "formula", label: "Work-Energy Theorem", text: "W_net = ΔKE = KE_f − KE_i" },
              { type: "callout", variant: "key", text: "The net work done on an object equals the change in its kinetic energy." },
              { type: "heading", level: 2, text: "Conservation of Energy" },
              { type: "callout", variant: "key", text: "Energy cannot be created or destroyed — only converted between forms. Total mechanical energy E = KE + PE is constant in a closed system with no friction." },
              { type: "formula", label: "Conservation", text: "KE₁ + PE₁ = KE₂ + PE₂" },
              { type: "heading", level: 2, text: "Power" },
              { type: "formula", label: "Power", text: "P = W/t = Fv" },
              { type: "paragraph", text: "Power is the rate of doing work, measured in Watts (W = J/s). A 100 W light bulb uses 100 J of energy every second." },
            ],
            examples: [
              {
                title: "Box Pushed Across Floor",
                given: "A 20 N force pushes a box 5 m horizontally at 30° to horizontal. How much work is done?",
                solution: [
                  "W = F·d·cos θ = 20 × 5 × cos(30°)",
                  "cos(30°) = √3/2 ≈ 0.866",
                  "W = 100 × 0.866 ≈ 86.6 J",
                ],
                answer: "W ≈ 86.6 J",
              },
              {
                title: "Ball Falling from Height",
                given: "A 2 kg ball falls from 10 m height. What is its speed just before hitting the ground? (g = 10 m/s²)",
                solution: [
                  "Using conservation of energy: PE₁ = KE₂",
                  "mgh = ½mv²",
                  "2 × 10 × 10 = ½ × 2 × v²",
                  "v² = 200 → v = √200 ≈ 14.1 m/s",
                ],
                answer: "v ≈ 14.1 m/s",
              },
            ],
            problems: [
              {
                id: "we-1", difficulty: "easy", type: "mcq",
                question: "A 5 kg object moves at 4 m/s. What is its kinetic energy?",
                options: ["10 J", "20 J", "40 J", "80 J"],
                answer: "40 J",
                explanation: "KE = ½mv² = ½ × 5 × 16 = 40 J",
              },
              {
                id: "we-2", difficulty: "easy", type: "mcq",
                question: "A 10 kg object is lifted 3 m. How much gravitational PE is gained? (g = 10 m/s²)",
                options: ["30 J", "100 J", "300 J", "3000 J"],
                answer: "300 J",
                explanation: "PE = mgh = 10 × 10 × 3 = 300 J",
              },
              {
                id: "we-3", difficulty: "medium", type: "mcq",
                question: "A 1000 W motor lifts a 100 kg object. How high can it lift it in 10 s? (g = 10 m/s²)",
                options: ["1 m", "10 m", "100 m", "1000 m"],
                answer: "10 m",
                explanation: "W = Pt = 1000 × 10 = 10000 J. PE = mgh → h = W/(mg) = 10000/1000 = 10 m",
              },
              {
                id: "we-4", difficulty: "hard", type: "mcq",
                question: "A ball of mass 0.5 kg is released from 20 m. At what height does it have half its maximum KE? (ignore friction)",
                options: ["5 m", "10 m", "15 m", "20 m"],
                answer: "10 m",
                explanation: "At max speed (ground): KE_max = mgh = 0.5×10×20=100 J. Half KE = 50 J → PE remaining = 50 J → h = 50/(mg) = 10 m",
              },
            ],
          },
          {
            slug: "momentum",
            name: "Momentum & Collisions",
            description: "Linear momentum, impulse, and conservation laws in collisions.",
            estimatedMinutes: 30,
            xpReward: 160,
            keyFormulas: ["p = mv", "J = FΔt = Δp", "p_total = constant"],
            theory: [
              { type: "heading", level: 2, text: "Linear Momentum" },
              { type: "formula", label: "Momentum", text: "p = mv" },
              { type: "paragraph", text: "Momentum is a vector quantity (direction matters) measured in kg·m/s. A heavy, slow truck and a light, fast bullet can have the same magnitude of momentum." },
              { type: "heading", level: 2, text: "Impulse" },
              { type: "formula", label: "Impulse", text: "J = F · Δt = Δp" },
              { type: "paragraph", text: "Impulse is the change in momentum. A larger force or longer contact time produces a greater change in momentum. This is why airbags and crumple zones save lives — they increase Δt, reducing peak force." },
              { type: "heading", level: 2, text: "Conservation of Momentum" },
              { type: "callout", variant: "key", text: "In a closed system (no external forces), the total momentum is conserved: Σp_before = Σp_after" },
              { type: "heading", level: 2, text: "Types of Collisions" },
              { type: "list", items: [
                "Elastic: KE is conserved (e.g., billiard balls)",
                "Inelastic: KE is NOT conserved (most real collisions)",
                "Perfectly inelastic: objects stick together after collision",
              ] },
            ],
            examples: [
              {
                title: "Perfectly Inelastic Collision",
                given: "A 3 kg ball moving at 6 m/s hits a stationary 5 kg block and they stick together. Find the final velocity.",
                solution: ["p_initial = 3 × 6 = 18 kg·m/s", "p_final = (3 + 5) × v = 8v", "18 = 8v → v = 2.25 m/s"],
                answer: "v = 2.25 m/s",
              },
            ],
            problems: [
              {
                id: "mom-1", difficulty: "easy", type: "mcq",
                question: "A 5 kg object moves at 8 m/s. What is its momentum?",
                options: ["1.6 kg·m/s", "13 kg·m/s", "40 kg·m/s", "320 kg·m/s"],
                answer: "40 kg·m/s",
                explanation: "p = mv = 5 × 8 = 40 kg·m/s",
              },
              {
                id: "mom-2", difficulty: "medium", type: "mcq",
                question: "A 10 N force acts on a 2 kg object for 3 s. By how much does its velocity change?",
                options: ["1.5 m/s", "5 m/s", "15 m/s", "60 m/s"],
                answer: "15 m/s",
                explanation: "Impulse = FΔt = 30 N·s = Δp = m·Δv → Δv = 30/2 = 15 m/s",
              },
            ],
          },
          {
            slug: "circular-motion",
            name: "Circular Motion",
            description: "Uniform circular motion, centripetal force, and angular velocity.",
            estimatedMinutes: 28,
            xpReward: 160,
            keyFormulas: ["a_c = v²/r", "F_c = mv²/r", "v = 2πr/T"],
            theory: [
              { type: "heading", level: 2, text: "Uniform Circular Motion" },
              { type: "paragraph", text: "When an object moves in a circle at constant speed, its velocity direction constantly changes — so it IS accelerating, even at constant speed." },
              { type: "formula", label: "Centripetal acceleration", text: "a_c = v²/r" },
              { type: "formula", label: "Centripetal force", text: "F_c = mv²/r" },
              { type: "callout", variant: "info", text: "Centripetal force always points toward the center of the circle. It can be provided by gravity, tension, friction, or normal force." },
              { type: "formula", label: "Angular velocity", text: "ω = 2π/T = 2πf" },
              { type: "formula", label: "Linear-angular relation", text: "v = ωr" },
            ],
            examples: [
              {
                title: "Car on a Circular Track",
                given: "A 1000 kg car moves at 20 m/s around a circular track of radius 100 m. What is the centripetal force?",
                solution: ["F_c = mv²/r = 1000 × 400 / 100 = 4000 N"],
                answer: "F_c = 4000 N",
              },
            ],
            problems: [
              {
                id: "cm-1", difficulty: "easy", type: "mcq",
                question: "A 2 kg ball on a 0.5 m string moves at 3 m/s in a circle. What is the centripetal force?",
                options: ["6 N", "9 N", "18 N", "36 N"],
                answer: "36 N",
                explanation: "F = mv²/r = 2 × 9 / 0.5 = 36 N",
              },
            ],
          },
          {
            slug: "gravitation",
            name: "Gravitation",
            description: "Newton's law of universal gravitation, orbital motion, and gravitational fields.",
            estimatedMinutes: 30,
            xpReward: 170,
            keyFormulas: ["F = Gm₁m₂/r²", "g = GM/r²", "v_orbital = √(GM/r)"],
            theory: [
              { type: "heading", level: 2, text: "Newton's Law of Universal Gravitation" },
              { type: "formula", label: "Gravitational force", text: "F = G · m₁m₂ / r²" },
              { type: "paragraph", text: "Every mass attracts every other mass. G = 6.674 × 10⁻¹¹ N·m²/kg² is the gravitational constant. The force decreases with the square of distance (inverse-square law)." },
              { type: "heading", level: 2, text: "Gravitational Field" },
              { type: "formula", label: "Gravitational field strength", text: "g = GM/r²" },
              { type: "paragraph", text: "Near Earth's surface: g ≈ 9.8 m/s². As you go further from Earth, g decreases." },
              { type: "heading", level: 2, text: "Orbital Motion" },
              { type: "formula", label: "Orbital velocity", text: "v = √(GM/r)" },
              { type: "callout", variant: "info", text: "Satellites orbit because they're always 'falling' toward Earth but moving fast enough sideways that they miss it." },
            ],
            examples: [
              {
                title: "Gravitational Force Between Two Masses",
                given: "Two 1000 kg spheres are 1 m apart. Find the gravitational force between them. (G = 6.67 × 10⁻¹¹)",
                solution: ["F = Gm₁m₂/r² = 6.67 × 10⁻¹¹ × 10⁶ / 1 = 6.67 × 10⁻⁵ N"],
                answer: "F = 6.67 × 10⁻⁵ N",
              },
            ],
            problems: [
              {
                id: "grav-1", difficulty: "easy", type: "mcq",
                question: "If the distance between two objects triples, how does the gravitational force change?",
                options: ["Decreases by 3×", "Decreases by 9×", "Increases by 3×", "Stays the same"],
                answer: "Decreases by 9×",
                explanation: "F ∝ 1/r². If r triples, F decreases by 3² = 9 times.",
              },
            ],
          },
        ],
      },
      {
        slug: "waves",
        name: "Waves & Oscillations",
        description: "Simple harmonic motion, wave properties, sound, and light.",
        level: "core",
        topics: [
          {
            slug: "shm",
            name: "Simple Harmonic Motion",
            description: "Periodic motion with restoring force proportional to displacement.",
            estimatedMinutes: 28,
            xpReward: 160,
            keyFormulas: ["F = −kx", "T = 2π√(m/k)", "x = A cos(ωt)"],
            theory: [
              { type: "heading", level: 2, text: "Simple Harmonic Motion" },
              { type: "paragraph", text: "SHM occurs when a restoring force is proportional to displacement. Examples: pendulums, springs, vibrating strings." },
              { type: "formula", label: "Restoring force", text: "F = −kx" },
              { type: "formula", label: "Period (spring)", text: "T = 2π √(m/k)" },
              { type: "formula", label: "Period (pendulum)", text: "T = 2π √(L/g)" },
              { type: "callout", variant: "key", text: "Period of a pendulum is independent of amplitude (for small angles) and mass." },
            ],
            examples: [
              {
                title: "Spring Mass System",
                given: "A 0.5 kg mass on a spring with k = 200 N/m. Find the period.",
                solution: ["T = 2π √(m/k) = 2π √(0.5/200) = 2π × 0.05 ≈ 0.314 s"],
                answer: "T ≈ 0.31 s",
              },
            ],
            problems: [
              {
                id: "shm-1", difficulty: "easy", type: "mcq",
                question: "A spring with k = 400 N/m has a 4 kg mass. What is the angular frequency?",
                options: ["5 rad/s", "10 rad/s", "20 rad/s", "100 rad/s"],
                answer: "10 rad/s",
                explanation: "ω = √(k/m) = √(400/4) = √100 = 10 rad/s",
              },
            ],
          },
          {
            slug: "wave-properties",
            name: "Wave Properties",
            description: "Wave speed, frequency, wavelength, reflection, refraction, and superposition.",
            estimatedMinutes: 25,
            xpReward: 150,
            hasSimulation: true,
            simulationType: "wave",
            keyFormulas: ["v = fλ", "I ∝ 1/r²"],
            theory: [
              { type: "heading", level: 2, text: "Waves" },
              { type: "paragraph", text: "A wave is a disturbance that transfers energy without transferring matter. Transverse waves (like light) vibrate perpendicular to propagation; longitudinal waves (like sound) vibrate parallel." },
              { type: "formula", label: "Wave equation", text: "v = f × λ" },
              { type: "list", items: ["f = frequency (Hz = cycles/s)", "λ = wavelength (m)", "v = wave speed (m/s)", "T = period (s) = 1/f"] },
              { type: "callout", variant: "key", text: "The speed of a wave depends on the medium, not the frequency or amplitude." },
            ],
            examples: [
              {
                title: "Wave Speed Calculation",
                given: "A wave has frequency 50 Hz and wavelength 4 m. Find the wave speed.",
                solution: ["v = fλ = 50 × 4 = 200 m/s"],
                answer: "v = 200 m/s",
              },
            ],
            problems: [
              {
                id: "wp-1", difficulty: "easy", type: "mcq",
                question: "Sound travels at 340 m/s. What is the wavelength of a 170 Hz sound?",
                options: ["0.5 m", "1 m", "2 m", "4 m"],
                answer: "2 m",
                explanation: "λ = v/f = 340/170 = 2 m",
              },
            ],
          },
          {
            slug: "sound",
            name: "Sound",
            description: "Nature of sound, speed, intensity, the Doppler effect, and resonance.",
            estimatedMinutes: 25,
            xpReward: 140,
            theory: [
              { type: "heading", level: 2, text: "Nature of Sound" },
              { type: "paragraph", text: "Sound is a longitudinal pressure wave that requires a medium. Speed of sound in air ≈ 340 m/s at room temperature." },
              { type: "heading", level: 2, text: "Doppler Effect" },
              { type: "paragraph", text: "When a source moves toward you, you hear a higher frequency; moving away gives lower frequency. This explains the pitch change of a passing siren." },
              { type: "callout", variant: "info", text: "The Doppler effect is used in radar guns, medical ultrasound, and astronomical redshift." },
            ],
            examples: [
              { title: "Echo Timing", given: "You shout near a cliff and hear the echo after 2 s. How far is the cliff? (v_sound = 340 m/s)", solution: ["Distance = v × t/2 = 340 × 1 = 340 m"], answer: "340 m" },
            ],
            problems: [
              {
                id: "snd-1", difficulty: "easy", type: "mcq",
                question: "An echo returns 0.5 s after shouting. If sound travels 340 m/s, how far is the reflector?",
                options: ["85 m", "170 m", "340 m", "680 m"],
                answer: "85 m",
                explanation: "d = v × t/2 = 340 × 0.25 = 85 m (divide by 2 because sound travels there and back)",
              },
            ],
          },
        ],
      },
      {
        slug: "electricity",
        name: "Electricity & Circuits",
        description: "Electric charge, fields, current, voltage, resistance, and circuit analysis.",
        level: "core",
        topics: [
          {
            slug: "electric-fields",
            name: "Electric Fields & Coulomb's Law",
            description: "Electric force, fields, and potential between charged particles.",
            estimatedMinutes: 30,
            xpReward: 170,
            keyFormulas: ["F = kq₁q₂/r²", "E = F/q", "V = kq/r"],
            theory: [
              { type: "heading", level: 2, text: "Electric Charge" },
              { type: "paragraph", text: "Electric charge is a fundamental property of matter. Like charges repel; opposite charges attract. The unit is the Coulomb (C). Elementary charge e = 1.6 × 10⁻¹⁹ C." },
              { type: "formula", label: "Coulomb's Law", text: "F = k · q₁q₂ / r²" },
              { type: "paragraph", text: "k = 8.99 × 10⁹ N·m²/C² is Coulomb's constant. This is an inverse-square law, just like gravity — but electric forces can be attractive OR repulsive." },
              { type: "formula", label: "Electric field", text: "E = F/q = kQ/r²" },
            ],
            examples: [
              { title: "Force Between Charges", given: "Two 1 μC charges are 1 m apart. Find the force. (k = 9 × 10⁹)", solution: ["F = kq₁q₂/r² = 9×10⁹ × 10⁻⁶ × 10⁻⁶ / 1 = 9 × 10⁻³ N = 9 mN"], answer: "9 mN" },
            ],
            problems: [
              {
                id: "ef-1", difficulty: "easy", type: "mcq",
                question: "What happens to the electric force when the distance between two charges doubles?",
                options: ["Doubles", "Halves", "Decreases by 4×", "Increases by 4×"],
                answer: "Decreases by 4×",
                explanation: "F ∝ 1/r². If r doubles, F decreases by 2² = 4 times.",
              },
            ],
          },
          {
            slug: "circuits",
            name: "Electric Circuits",
            description: "Current, voltage, resistance, Ohm's law, and circuit analysis.",
            estimatedMinutes: 35,
            xpReward: 180,
            hasSimulation: true,
            simulationType: "circuit",
            keyFormulas: ["V = IR", "P = IV = I²R", "R_series = R₁+R₂", "1/R_parallel = 1/R₁+1/R₂"],
            theory: [
              { type: "heading", level: 2, text: "Current, Voltage, Resistance" },
              { type: "table", headers: ["Quantity", "Symbol", "Unit"], rows: [["Current", "I", "Ampere (A)"], ["Voltage", "V", "Volt (V)"], ["Resistance", "R", "Ohm (Ω)"]] },
              { type: "formula", label: "Ohm's Law", text: "V = I × R" },
              { type: "callout", variant: "key", text: "Ohm's Law: Voltage = Current × Resistance. This only applies to ohmic conductors (constant R)." },
              { type: "heading", level: 2, text: "Series & Parallel Circuits" },
              { type: "formula", label: "Series resistance", text: "R_total = R₁ + R₂ + R₃ + ..." },
              { type: "formula", label: "Parallel resistance", text: "1/R_total = 1/R₁ + 1/R₂ + ..." },
              { type: "callout", variant: "tip", text: "In series: same current, voltages add. In parallel: same voltage, currents add." },
              { type: "formula", label: "Power", text: "P = VI = I²R = V²/R" },
            ],
            examples: [
              { title: "Series Circuit", given: "Two resistors (R₁=4Ω, R₂=6Ω) are in series with a 20V battery. Find current and power.", solution: ["R_total = 10Ω", "I = V/R = 20/10 = 2 A", "P = I²R = 4 × 10 = 40 W"], answer: "I = 2 A, P = 40 W" },
            ],
            problems: [
              {
                id: "circ-1", difficulty: "easy", type: "mcq",
                question: "A 12Ω resistor has 6V across it. What current flows through it?",
                options: ["0.5 A", "2 A", "18 A", "72 A"],
                answer: "0.5 A",
                explanation: "I = V/R = 6/12 = 0.5 A",
              },
              {
                id: "circ-2", difficulty: "medium", type: "mcq",
                question: "Two 6Ω resistors are in parallel. What is the total resistance?",
                options: ["12 Ω", "6 Ω", "3 Ω", "1 Ω"],
                answer: "3 Ω",
                explanation: "1/R = 1/6 + 1/6 = 2/6 → R = 3 Ω",
              },
            ],
          },
        ],
      },
      {
        slug: "thermodynamics",
        name: "Thermodynamics",
        description: "Heat, temperature, the laws of thermodynamics, and thermal processes.",
        level: "applications",
        topics: [
          {
            slug: "heat-temperature",
            name: "Heat & Temperature",
            description: "Temperature scales, heat transfer, specific heat capacity, and calorimetry.",
            estimatedMinutes: 25,
            xpReward: 150,
            keyFormulas: ["Q = mcΔT", "TK = T°C + 273"],
            theory: [
              { type: "heading", level: 2, text: "Temperature" },
              { type: "paragraph", text: "Temperature is a measure of the average kinetic energy of particles. It's measured in Celsius (°C), Fahrenheit (°F), or Kelvin (K)." },
              { type: "formula", label: "Kelvin conversion", text: "T(K) = T(°C) + 273.15" },
              { type: "heading", level: 2, text: "Heat and Specific Heat Capacity" },
              { type: "formula", label: "Heat equation", text: "Q = m · c · ΔT" },
              { type: "paragraph", text: "Q = heat added (J), m = mass (kg), c = specific heat capacity (J/kg°C), ΔT = temperature change." },
              { type: "callout", variant: "info", text: "Water has an unusually high specific heat (4200 J/kg°C), which is why oceans regulate climate." },
            ],
            examples: [
              { title: "Heating Water", given: "How much heat is needed to raise 2 kg of water by 50°C? (c_water = 4200 J/kg°C)", solution: ["Q = mcΔT = 2 × 4200 × 50 = 420,000 J = 420 kJ"], answer: "Q = 420 kJ" },
            ],
            problems: [
              {
                id: "therm-1", difficulty: "easy", type: "mcq",
                question: "How much heat is needed to heat 1 kg of aluminum (c = 900 J/kg°C) by 20°C?",
                options: ["45 J", "900 J", "18,000 J", "180,000 J"],
                answer: "18,000 J",
                explanation: "Q = mcΔT = 1 × 900 × 20 = 18,000 J",
              },
            ],
          },
        ],
      },
      {
        slug: "modern-physics",
        name: "Modern Physics",
        description: "Quantum mechanics, special relativity, and nuclear physics.",
        level: "advanced",
        topics: [
          {
            slug: "quantum-intro",
            name: "Introduction to Quantum Mechanics",
            description: "Wave-particle duality, the photoelectric effect, and Bohr's model.",
            estimatedMinutes: 35,
            xpReward: 220,
            keyFormulas: ["E = hf", "λ = h/mv", "ΔxΔp ≥ ℏ/2"],
            theory: [
              { type: "heading", level: 2, text: "The Quantum Revolution" },
              { type: "paragraph", text: "At the beginning of the 20th century, physics faced phenomena that classical mechanics couldn't explain: blackbody radiation, the photoelectric effect, atomic spectra. This led to quantum mechanics." },
              { type: "heading", level: 2, text: "Photoelectric Effect" },
              { type: "paragraph", text: "Einstein (1905) showed that light comes in quantized packets called **photons**. Each photon carries energy E = hf, where h is Planck's constant (6.626 × 10⁻³⁴ J·s)." },
              { type: "formula", label: "Photon energy", text: "E = hf = hc/λ" },
              { type: "heading", level: 2, text: "Wave-Particle Duality" },
              { type: "paragraph", text: "Light behaves as both waves AND particles. De Broglie (1924) proposed that matter also has wave properties. The de Broglie wavelength of a particle is:" },
              { type: "formula", label: "de Broglie wavelength", text: "λ = h / (mv)" },
              { type: "callout", variant: "info", text: "At macroscopic scales, de Broglie wavelengths are too small to observe. Quantum effects dominate at atomic/subatomic scales." },
              { type: "heading", level: 2, text: "Heisenberg Uncertainty Principle" },
              { type: "formula", label: "Uncertainty Principle", text: "Δx · Δp ≥ ℏ/2" },
              { type: "callout", variant: "key", text: "You cannot simultaneously know both the exact position and exact momentum of a particle. This is fundamental — not a measurement limitation." },
            ],
            examples: [
              { title: "Photon Energy", given: "Find the energy of a photon with frequency 6 × 10¹⁴ Hz. (h = 6.626 × 10⁻³⁴ J·s)", solution: ["E = hf = 6.626 × 10⁻³⁴ × 6 × 10¹⁴ = 3.98 × 10⁻¹⁹ J ≈ 2.5 eV"], answer: "E ≈ 3.98 × 10⁻¹⁹ J" },
            ],
            problems: [
              {
                id: "qm-1", difficulty: "medium", type: "mcq",
                question: "Which phenomenon proved that light has particle properties?",
                options: ["Diffraction", "Interference", "Photoelectric effect", "Polarization"],
                answer: "Photoelectric effect",
                explanation: "The photoelectric effect showed that light energy comes in discrete packets (photons), proving particle behavior.",
              },
            ],
          },
          {
            slug: "special-relativity",
            name: "Special Relativity",
            description: "Einstein's theory — time dilation, length contraction, and E = mc².",
            estimatedMinutes: 35,
            xpReward: 250,
            keyFormulas: ["E = mc²", "γ = 1/√(1−v²/c²)", "t' = γt"],
            theory: [
              { type: "heading", level: 2, text: "Einstein's Postulates" },
              { type: "list", items: ["The laws of physics are the same in all inertial reference frames.", "The speed of light in a vacuum is the same for all observers, regardless of motion."] },
              { type: "heading", level: 2, text: "Time Dilation" },
              { type: "formula", label: "Time dilation", text: "t' = γ · t₀ = t₀ / √(1 − v²/c²)" },
              { type: "paragraph", text: "Moving clocks tick slower. A clock on a fast-moving spacecraft ticks slower than one on Earth. This has been confirmed experimentally using atomic clocks on aircraft." },
              { type: "heading", level: 2, text: "Mass-Energy Equivalence" },
              { type: "formula", label: "E = mc²", text: "E = mc²" },
              { type: "callout", variant: "key", text: "Mass and energy are equivalent. A tiny mass converts to enormous energy (c² ≈ 9 × 10¹⁶ m²/s²). This is the principle behind nuclear reactions." },
            ],
            examples: [
              { title: "Time Dilation", given: "A spaceship travels at 0.8c. How long does the pilot experience on a 10-year Earth journey?", solution: ["γ = 1/√(1−0.64) = 1/√0.36 = 1/0.6 = 1.667", "t' = t₀/γ = 10/1.667 ≈ 6 years"], answer: "≈ 6 years" },
            ],
            problems: [
              {
                id: "sr-1", difficulty: "hard", type: "mcq",
                question: "1 gram of matter is fully converted to energy (E = mc²). Approximately how much energy is released? (c = 3×10⁸ m/s)",
                options: ["3 × 10⁵ J", "9 × 10⁹ J", "9 × 10¹³ J", "9 × 10¹⁶ J"],
                answer: "9 × 10¹³ J",
                explanation: "E = mc² = 0.001 × (3×10⁸)² = 0.001 × 9×10¹⁶ = 9×10¹³ J",
              },
            ],
          },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════════
  // CHEMISTRY
  // ══════════════════════════════════════════════════════════════════════════════
  {
    slug: "chemistry",
    name: "Chemistry",
    emoji: "🧪",
    color: "#10b981",
    gradient: "from-emerald-500 to-teal-600",
    description: "From atoms to reactions — understand the composition, structure, and transformation of matter.",
    chapters: [
      {
        slug: "atomic-structure",
        name: "Atomic Structure & Periodic Table",
        description: "The structure of atoms, electron configuration, and periodic trends.",
        level: "foundations",
        topics: [
          {
            slug: "atomic-model",
            name: "The Atom",
            description: "Protons, neutrons, electrons, atomic number, and mass number.",
            estimatedMinutes: 25,
            xpReward: 140,
            keyFormulas: ["Z = proton number", "A = Z + N", "Isotopes: same Z, different A"],
            theory: [
              { type: "heading", level: 2, text: "Atomic Structure" },
              { type: "paragraph", text: "Atoms are the smallest units of elements. They consist of a nucleus (protons + neutrons) surrounded by electrons in shells." },
              { type: "table", headers: ["Particle", "Charge", "Mass", "Location"], rows: [["Proton", "+1", "1 amu", "Nucleus"], ["Neutron", "0", "1 amu", "Nucleus"], ["Electron", "−1", "~0", "Shells"]] },
              { type: "formula", label: "Mass number", text: "A = Z (protons) + N (neutrons)" },
              { type: "callout", variant: "key", text: "Atomic number (Z) defines the element. Carbon always has Z=6. Isotopes have the same Z but different numbers of neutrons." },
            ],
            examples: [
              { title: "Identifying Isotopes", given: "Carbon-12 (¹²C) and Carbon-14 (¹⁴C) — what are they, and how do they differ?", solution: ["Both: Z=6, so 6 protons and 6 electrons", "¹²C: N = 12−6 = 6 neutrons", "¹⁴C: N = 14−6 = 8 neutrons", "Same element, different mass — isotopes"], answer: "Same element, differ in neutron count" },
            ],
            problems: [
              {
                id: "atom-1", difficulty: "easy", type: "mcq",
                question: "An atom has atomic number 8 and mass number 16. How many neutrons does it have?",
                options: ["6", "8", "16", "24"],
                answer: "8",
                explanation: "N = A − Z = 16 − 8 = 8 neutrons",
              },
            ],
          },
          {
            slug: "periodic-table",
            name: "Periodic Table",
            description: "Periods, groups, periodic trends, and the organization of elements.",
            estimatedMinutes: 30,
            xpReward: 150,
            theory: [
              { type: "heading", level: 2, text: "Organization of the Periodic Table" },
              { type: "paragraph", text: "The 118 known elements are arranged by increasing atomic number. Elements in the same group (column) share valence electron configurations and therefore similar chemical properties." },
              { type: "list", items: ["Periods (rows): elements with the same number of electron shells", "Groups (columns): elements with the same number of valence electrons", "Metals (left), metalloids (diagonal), nonmetals (right)"] },
              { type: "heading", level: 2, text: "Periodic Trends" },
              { type: "list", items: ["Atomic radius: decreases left→right, increases top→bottom", "Ionization energy: increases left→right, decreases top→bottom", "Electronegativity: increases left→right, decreases top→bottom"] },
              { type: "callout", variant: "tip", text: "Fluorine (F) has the highest electronegativity. Cesium (Cs) and Francium (Fr) have the lowest." },
            ],
            examples: [
              { title: "Periodic Trend", given: "Compare atomic radius of Na and Cl (same period). Which is larger?", solution: ["Na is in Group 1, Cl is in Group 17. Atomic radius decreases across a period.", "Na (Group 1) has a larger radius than Cl (Group 17)."], answer: "Na has larger radius" },
            ],
            problems: [
              {
                id: "pt-1", difficulty: "easy", type: "mcq",
                question: "Which element has the highest ionization energy?",
                options: ["Na", "K", "He", "Li"],
                answer: "He",
                explanation: "Noble gases have completely filled shells and very high ionization energies. He is the smallest noble gas with the highest IE.",
              },
            ],
          },
          {
            slug: "chemical-bonding",
            name: "Chemical Bonding",
            description: "Ionic, covalent, and metallic bonds; molecular geometry; intermolecular forces.",
            estimatedMinutes: 35,
            xpReward: 180,
            theory: [
              { type: "heading", level: 2, text: "Types of Chemical Bonds" },
              { type: "list", items: ["Ionic: electron transfer between metal and nonmetal (e.g., NaCl)", "Covalent: electron sharing between nonmetals (e.g., H₂O)", "Metallic: sea of delocalized electrons (e.g., Cu)"] },
              { type: "callout", variant: "key", text: "Electronegativity difference determines bond type: <0.4 = covalent, 0.4-1.7 = polar covalent, >1.7 = ionic" },
              { type: "heading", level: 2, text: "Molecular Geometry (VSEPR)" },
              { type: "paragraph", text: "VSEPR (Valence Shell Electron Pair Repulsion) theory: electron pairs around a central atom arrange to minimize repulsion." },
              { type: "table", headers: ["Electron Pairs", "Shape", "Bond Angle", "Example"], rows: [["2", "Linear", "180°", "CO₂"], ["3", "Trigonal planar", "120°", "BF₃"], ["4", "Tetrahedral", "109.5°", "CH₄"], ["4 (1 lone pair)", "Pyramidal", "107°", "NH₃"], ["4 (2 lone pairs)", "Bent", "104.5°", "H₂O"]] },
            ],
            examples: [
              { title: "NaCl Formation", given: "Explain why Na and Cl form an ionic bond.", solution: ["Na (Group 1): 1 valence electron, easily lost → Na⁺", "Cl (Group 17): 7 valence electrons, wants 1 more → Cl⁻", "Opposite charges attract → ionic bond with high lattice energy"], answer: "Ionic bond via electron transfer" },
            ],
            problems: [
              {
                id: "bond-1", difficulty: "easy", type: "mcq",
                question: "What type of bond forms between two oxygen atoms in O₂?",
                options: ["Ionic", "Polar covalent", "Nonpolar covalent", "Metallic"],
                answer: "Nonpolar covalent",
                explanation: "O₂ consists of identical atoms — no electronegativity difference, so electrons are shared equally (nonpolar covalent double bond).",
              },
            ],
          },
        ],
      },
      {
        slug: "stoichiometry",
        name: "Stoichiometry & Reactions",
        description: "Moles, molar mass, balancing equations, limiting reagents, and yield.",
        level: "core",
        topics: [
          {
            slug: "moles-molar-mass",
            name: "The Mole & Molar Mass",
            description: "Avogadro's number, moles, molar mass, and gram-mole conversions.",
            estimatedMinutes: 25,
            xpReward: 150,
            keyFormulas: ["n = m/M", "N = n × Nₐ"],
            theory: [
              { type: "heading", level: 2, text: "The Mole Concept" },
              { type: "paragraph", text: "The mole is a counting unit: 1 mole = 6.022 × 10²³ particles (Avogadro's number). It connects atomic-scale masses to lab-scale masses." },
              { type: "formula", label: "Amount in moles", text: "n = m / M" },
              { type: "paragraph", text: "m = mass in grams, M = molar mass in g/mol. Molar mass = sum of atomic masses from periodic table." },
              { type: "callout", variant: "tip", text: "Molar mass of H₂O = 2(1) + 16 = 18 g/mol. So 18 g of water = 1 mole = 6.02 × 10²³ molecules." },
            ],
            examples: [
              { title: "Moles of CO₂", given: "How many moles are in 132 g of CO₂? (C=12, O=16)", solution: ["M(CO₂) = 12 + 2×16 = 44 g/mol", "n = m/M = 132/44 = 3 mol"], answer: "3 mol" },
            ],
            problems: [
              {
                id: "mol-1", difficulty: "easy", type: "mcq",
                question: "What is the molar mass of H₂SO₄? (H=1, S=32, O=16)",
                options: ["48 g/mol", "80 g/mol", "96 g/mol", "98 g/mol"],
                answer: "98 g/mol",
                explanation: "H₂SO₄: 2(1) + 32 + 4(16) = 2 + 32 + 64 = 98 g/mol",
              },
            ],
          },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════════
  // COMPUTER SCIENCE
  // ══════════════════════════════════════════════════════════════════════════════
  {
    slug: "computer-science",
    name: "Computer Science",
    emoji: "💻",
    color: "#f59e0b",
    gradient: "from-amber-500 to-orange-600",
    description: "From logic gates to algorithms — master the art of computational thinking and software design.",
    chapters: [
      {
        slug: "programming-fundamentals",
        name: "Programming Fundamentals",
        description: "Variables, data types, control flow, and functions.",
        level: "foundations",
        topics: [
          {
            slug: "variables-types",
            name: "Variables & Data Types",
            description: "How computers store data — integers, strings, booleans, and type systems.",
            estimatedMinutes: 20,
            xpReward: 130,
            theory: [
              { type: "heading", level: 2, text: "Variables" },
              { type: "paragraph", text: "A variable is a named location in memory that stores a value. Variables have a type that determines what values they can hold and what operations can be performed." },
              { type: "list", items: ["int / integer: whole numbers (e.g., 42, -7)", "float / decimal: fractional numbers (e.g., 3.14)", "string: text (e.g., \"Hello\")", "boolean: true or false"] },
              { type: "callout", variant: "tip", text: "Strongly typed languages (Java, C++) enforce types strictly. Dynamically typed languages (Python, JS) determine types at runtime." },
              { type: "heading", level: 2, text: "Number Systems" },
              { type: "paragraph", text: "Computers store everything in binary (base 2). Understanding hex (base 16) and binary is essential for low-level programming." },
              { type: "formula", label: "Binary to Decimal", text: "1011₂ = 1×8 + 0×4 + 1×2 + 1×1 = 11₁₀" },
            ],
            examples: [
              { title: "Variable Assignment", given: "Write pseudocode to calculate the area of a rectangle 5×8.", solution: ["length = 5", "width = 8", "area = length × width", "print(area)  → 40"], answer: "area = 40" },
            ],
            problems: [
              {
                id: "var-1", difficulty: "easy", type: "mcq",
                question: "What is the binary representation of decimal 13?",
                options: ["1011", "1101", "1110", "0111"],
                answer: "1101",
                explanation: "13 = 8+4+1 = 1×8 + 1×4 + 0×2 + 1×1 = 1101₂",
              },
            ],
          },
          {
            slug: "control-flow",
            name: "Control Flow",
            description: "Conditionals (if/else) and loops (for, while) — directing program execution.",
            estimatedMinutes: 25,
            xpReward: 140,
            theory: [
              { type: "heading", level: 2, text: "Conditionals" },
              { type: "paragraph", text: "Conditionals let programs make decisions based on conditions. They evaluate a boolean expression and execute different code branches." },
              { type: "callout", variant: "info", text: "Nested conditionals (if inside if) are common but deep nesting (>3 levels) often signals code that needs refactoring." },
              { type: "heading", level: 2, text: "Loops" },
              { type: "list", items: ["for loop: known number of iterations", "while loop: repeat while condition is true", "do-while: execute at least once, then check condition", "Infinite loop: happens when condition never becomes false — a common bug"] },
              { type: "callout", variant: "warning", text: "Off-by-one errors are among the most common bugs. Always check: does your loop start at 0 or 1? Does it use < or <=?" },
            ],
            examples: [
              { title: "FizzBuzz", given: "Print 1-20. For multiples of 3 print 'Fizz', multiples of 5 print 'Buzz', multiples of both print 'FizzBuzz'.", solution: ["for i in range(1, 21):", "  if i % 15 == 0: print('FizzBuzz')", "  elif i % 3 == 0: print('Fizz')", "  elif i % 5 == 0: print('Buzz')", "  else: print(i)"], answer: "Check 15 first (both), then 3, then 5" },
            ],
            problems: [
              {
                id: "cf-1", difficulty: "easy", type: "mcq",
                question: "How many times does this loop execute? for i in range(3, 10, 2)",
                options: ["3", "4", "7", "5"],
                answer: "4",
                explanation: "range(3,10,2) gives: 3, 5, 7, 9 — four values",
              },
            ],
          },
          {
            slug: "functions",
            name: "Functions & Scope",
            description: "Defining and calling functions, parameters, return values, and variable scope.",
            estimatedMinutes: 25,
            xpReward: 150,
            theory: [
              { type: "heading", level: 2, text: "Why Functions?" },
              { type: "paragraph", text: "Functions enable code reuse, modularity, and abstraction. A function is a named block of code that performs a specific task. Good functions do ONE thing well." },
              { type: "list", items: ["Parameters: inputs to the function", "Return value: output from the function", "Local variables: exist only inside the function", "Global variables: accessible everywhere (use sparingly)"] },
              { type: "callout", variant: "key", text: "The DRY principle: Don't Repeat Yourself. If you copy-paste code, consider making it a function." },
              { type: "heading", level: 2, text: "Recursion" },
              { type: "paragraph", text: "A recursive function calls itself. It needs a base case (to stop) and a recursive case (to reduce the problem). Classic example: factorial(n) = n × factorial(n-1)." },
            ],
            examples: [
              { title: "Factorial Function", given: "Write a recursive function to compute n!.", solution: ["def factorial(n):", "  if n == 0: return 1  # base case", "  return n * factorial(n-1)  # recursive case", "factorial(5) = 5×4×3×2×1 = 120"], answer: "factorial(5) = 120" },
            ],
            problems: [
              {
                id: "func-1", difficulty: "easy", type: "mcq",
                question: "What does factorial(4) return? def factorial(n): return 1 if n==0 else n * factorial(n-1)",
                options: ["4", "8", "12", "24"],
                answer: "24",
                explanation: "4! = 4×3×2×1 = 24",
              },
            ],
          },
        ],
      },
      {
        slug: "data-structures",
        name: "Data Structures",
        description: "Arrays, linked lists, stacks, queues, trees, and hash tables.",
        level: "core",
        topics: [
          {
            slug: "arrays-lists",
            name: "Arrays & Lists",
            description: "Sequential data structures — indexing, slicing, and time complexity.",
            estimatedMinutes: 25,
            xpReward: 150,
            theory: [
              { type: "heading", level: 2, text: "Arrays" },
              { type: "paragraph", text: "An array stores elements of the same type in contiguous memory. Access any element by index in O(1) time." },
              { type: "table", headers: ["Operation", "Array", "Linked List"], rows: [["Access by index", "O(1)", "O(n)"], ["Search", "O(n)", "O(n)"], ["Insert at end", "O(1)*", "O(1)"], ["Insert at start", "O(n)", "O(1)"]] },
              { type: "callout", variant: "info", text: "Python lists are dynamic arrays (auto-resizing). Java arrays have fixed size." },
            ],
            examples: [
              { title: "Binary Search", given: "Find 7 in sorted array [1, 3, 5, 7, 9, 11]. How many comparisons (binary search)?", solution: ["Mid = index 2, value 5. 7 > 5, search right half [7, 9, 11]", "Mid = index 1, value 9. 7 < 9, search left [7]", "Found at index 0. Total: 3 comparisons"], answer: "3 comparisons" },
            ],
            problems: [
              {
                id: "arr-1", difficulty: "easy", type: "mcq",
                question: "What is the time complexity of accessing element at index i in an array?",
                options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
                answer: "O(1)",
                explanation: "Arrays store elements in contiguous memory. Element at index i is at address base + i×size — direct calculation, O(1).",
              },
            ],
          },
          {
            slug: "oop",
            name: "Object-Oriented Programming",
            description: "Classes, objects, encapsulation, inheritance, and polymorphism.",
            estimatedMinutes: 35,
            xpReward: 200,
            theory: [
              { type: "heading", level: 2, text: "The OOP Paradigm" },
              { type: "paragraph", text: "OOP models programs as collections of objects — data (attributes) + behavior (methods). The four pillars:" },
              { type: "list", items: [
                "Encapsulation: hiding internal details; exposing only what's needed",
                "Inheritance: child classes extend parent classes (code reuse)",
                "Polymorphism: same interface, different implementations",
                "Abstraction: working with high-level concepts without worrying about details",
              ] },
              { type: "callout", variant: "key", text: "Prefer composition over inheritance when in doubt. 'Is-a' relationships → inheritance. 'Has-a' relationships → composition." },
            ],
            examples: [
              { title: "Animal Class Hierarchy", given: "Design a class hierarchy for Dog, Cat, Animal.", solution: ["class Animal: def speak(self): ...", "class Dog(Animal): def speak(self): return 'Woof'", "class Cat(Animal): def speak(self): return 'Meow'", "Polymorphism: for a in [Dog(), Cat()]: print(a.speak())"], answer: "Dog says Woof, Cat says Meow" },
            ],
            problems: [
              {
                id: "oop-1", difficulty: "medium", type: "mcq",
                question: "Which OOP concept allows a child class to provide its own version of a parent method?",
                options: ["Encapsulation", "Abstraction", "Overriding", "Overloading"],
                answer: "Overriding",
                explanation: "Method overriding allows a subclass to provide a specific implementation of a method already defined in its parent class.",
              },
            ],
          },
        ],
      },
      {
        slug: "algorithms",
        name: "Algorithms",
        description: "Searching, sorting, recursion, dynamic programming, and complexity analysis.",
        level: "applications",
        topics: [
          {
            slug: "sorting-algorithms",
            name: "Sorting Algorithms",
            description: "Bubble sort, merge sort, quicksort — when and why to use each.",
            estimatedMinutes: 40,
            xpReward: 220,
            theory: [
              { type: "heading", level: 2, text: "Why Sorting Matters" },
              { type: "paragraph", text: "Sorting is fundamental. Many algorithms require sorted data (binary search). Understanding sort algorithms teaches divide-and-conquer, recursion, and complexity analysis." },
              { type: "table", headers: ["Algorithm", "Best", "Average", "Worst", "Space"], rows: [["Bubble Sort", "O(n)", "O(n²)", "O(n²)", "O(1)"], ["Merge Sort", "O(n log n)", "O(n log n)", "O(n log n)", "O(n)"], ["Quick Sort", "O(n log n)", "O(n log n)", "O(n²)", "O(log n)"], ["Heap Sort", "O(n log n)", "O(n log n)", "O(n log n)", "O(1)"]] },
              { type: "callout", variant: "key", text: "Merge sort is stable and guaranteed O(n log n). Quicksort is faster in practice but O(n²) worst case. Use TimSort (Python's default) for real code." },
            ],
            examples: [
              { title: "Merge Sort Trace", given: "Sort [38, 27, 43, 3] using merge sort.", solution: ["Split: [38,27] and [43,3]", "Sort each: [27,38] and [3,43]", "Merge: compare 27 vs 3 → [3], 27 vs 43 → [3,27], 38 vs 43 → [3,27,38,43]"], answer: "[3, 27, 38, 43]" },
            ],
            problems: [
              {
                id: "sort-1", difficulty: "medium", type: "mcq",
                question: "Which sorting algorithm has the best worst-case time complexity guarantee?",
                options: ["Quick Sort", "Bubble Sort", "Merge Sort", "Selection Sort"],
                answer: "Merge Sort",
                explanation: "Merge sort always runs in O(n log n) — best, average, and worst case. Quicksort degrades to O(n²) on bad pivots.",
              },
            ],
          },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════════
  // MATHEMATICS
  // ══════════════════════════════════════════════════════════════════════════════
  {
    slug: "mathematics",
    name: "Mathematics",
    emoji: "📐",
    color: "#ec4899",
    gradient: "from-pink-500 to-rose-600",
    description: "The language of the universe — from pure algebra to calculus and beyond.",
    chapters: [
      {
        slug: "algebra",
        name: "Algebra",
        description: "Equations, inequalities, polynomials, and algebraic structures.",
        level: "foundations",
        topics: [
          {
            slug: "linear-equations",
            name: "Linear Equations & Inequalities",
            description: "Solving single and simultaneous linear equations, graphing.",
            estimatedMinutes: 20,
            xpReward: 120,
            keyFormulas: ["ax + b = c", "y = mx + c"],
            theory: [
              { type: "heading", level: 2, text: "Linear Equations" },
              { type: "paragraph", text: "A linear equation has the form ax + b = c. The goal: isolate the variable. Key rule: whatever you do to one side, do to the other." },
              { type: "callout", variant: "tip", text: "Systems of two equations: use substitution (solve one, sub into other) or elimination (add/subtract equations to eliminate a variable)." },
              { type: "formula", label: "Slope-intercept form", text: "y = mx + c" },
              { type: "paragraph", text: "m = slope (gradient), c = y-intercept. Two lines are parallel if m₁ = m₂, perpendicular if m₁ × m₂ = −1." },
            ],
            examples: [
              { title: "Simultaneous Equations", given: "Solve: 2x + y = 8 and x − y = 1", solution: ["Add equations: 3x = 9 → x = 3", "Sub into x − y = 1: 3 − y = 1 → y = 2"], answer: "x = 3, y = 2" },
            ],
            problems: [
              {
                id: "lin-1", difficulty: "easy", type: "mcq",
                question: "Solve: 3x − 9 = 0",
                options: ["x = 0", "x = 3", "x = 9", "x = 27"],
                answer: "x = 3",
                explanation: "3x = 9 → x = 3",
              },
            ],
          },
          {
            slug: "quadratics",
            name: "Quadratic Equations",
            description: "Factoring, completing the square, quadratic formula, and discriminant.",
            estimatedMinutes: 30,
            xpReward: 160,
            keyFormulas: ["x = (−b ± √(b²−4ac)) / 2a", "Δ = b²−4ac"],
            theory: [
              { type: "heading", level: 2, text: "Quadratic Equations" },
              { type: "paragraph", text: "A quadratic has the form ax² + bx + c = 0. It represents a parabola and has 0, 1, or 2 real solutions." },
              { type: "formula", label: "Quadratic formula", text: "x = (−b ± √(b²−4ac)) / 2a" },
              { type: "formula", label: "Discriminant", text: "Δ = b² − 4ac" },
              { type: "list", items: ["Δ > 0: two distinct real roots", "Δ = 0: one repeated real root", "Δ < 0: no real roots (complex roots)"] },
            ],
            examples: [
              { title: "Solve Quadratic", given: "Solve x² − 5x + 6 = 0", solution: ["Method: factoring", "(x − 2)(x − 3) = 0", "x = 2 or x = 3"], answer: "x = 2 or x = 3" },
            ],
            problems: [
              {
                id: "quad-1", difficulty: "easy", type: "mcq",
                question: "How many real roots does x² + 1 = 0 have?",
                options: ["0", "1", "2", "infinite"],
                answer: "0",
                explanation: "Δ = 0 − 4(1)(1) = −4 < 0. Negative discriminant means no real roots.",
              },
            ],
          },
        ],
      },
      {
        slug: "calculus",
        name: "Calculus",
        description: "Limits, differentiation, integration, and their applications.",
        level: "core",
        topics: [
          {
            slug: "limits",
            name: "Limits & Continuity",
            description: "The concept of a limit, continuity, and the foundations of calculus.",
            estimatedMinutes: 30,
            xpReward: 180,
            keyFormulas: ["lim(x→a) f(x) = L", "lim(x→0) sin(x)/x = 1"],
            theory: [
              { type: "heading", level: 2, text: "The Concept of a Limit" },
              { type: "paragraph", text: "A limit describes the value a function approaches as the input approaches some value. It's the foundation of calculus." },
              { type: "formula", label: "Limit notation", text: "lim(x→a) f(x) = L" },
              { type: "paragraph", text: "This means: as x gets arbitrarily close to a, f(x) gets arbitrarily close to L. The function doesn't need to be defined AT a." },
              { type: "callout", variant: "key", text: "Limits from the left and right must be equal for the limit to exist: lim(x→a⁻) f(x) = lim(x→a⁺) f(x)" },
            ],
            examples: [
              { title: "Computing a Limit", given: "Find lim(x→2) of (x²−4)/(x−2)", solution: ["Factor: (x²−4) = (x+2)(x−2)", "Simplify: (x+2)(x−2)/(x−2) = x+2", "lim(x→2) x+2 = 4"], answer: "Limit = 4" },
            ],
            problems: [
              {
                id: "lim-1", difficulty: "easy", type: "mcq",
                question: "What is lim(x→3) of (x² − 9) / (x − 3)?",
                options: ["0", "3", "6", "9"],
                answer: "6",
                explanation: "(x²−9)/(x−3) = (x+3)(x−3)/(x−3) = x+3. As x→3: 3+3=6",
              },
            ],
          },
          {
            slug: "differentiation",
            name: "Differentiation",
            description: "Derivatives, rules of differentiation, and applications to optimization.",
            estimatedMinutes: 40,
            xpReward: 220,
            keyFormulas: ["d/dx(xⁿ) = nxⁿ⁻¹", "d/dx(sin x) = cos x", "Chain rule: dy/dx = (dy/du)(du/dx)"],
            theory: [
              { type: "heading", level: 2, text: "The Derivative" },
              { type: "paragraph", text: "The derivative of f at x is the instantaneous rate of change. Geometrically, it's the slope of the tangent line." },
              { type: "formula", label: "Definition", text: "f'(x) = lim(h→0) [f(x+h) − f(x)] / h" },
              { type: "heading", level: 2, text: "Differentiation Rules" },
              { type: "formula", label: "Power rule", text: "d/dx(xⁿ) = nxⁿ⁻¹" },
              { type: "formula", label: "Product rule", text: "d/dx(uv) = u'v + uv'" },
              { type: "formula", label: "Chain rule", text: "d/dx[f(g(x))] = f'(g(x)) · g'(x)" },
              { type: "table", headers: ["Function", "Derivative"], rows: [["xⁿ", "nxⁿ⁻¹"], ["sin x", "cos x"], ["cos x", "−sin x"], ["eˣ", "eˣ"], ["ln x", "1/x"]] },
            ],
            examples: [
              { title: "Chain Rule", given: "Find d/dx of sin(x²)", solution: ["Let u = x², f = sin(u)", "f'(u) = cos(u), u' = 2x", "d/dx sin(x²) = cos(x²) · 2x = 2x cos(x²)"], answer: "2x cos(x²)" },
            ],
            problems: [
              {
                id: "diff-1", difficulty: "easy", type: "mcq",
                question: "What is d/dx of x⁴ − 3x² + 7?",
                options: ["4x³ − 6x", "x³ − 3x", "4x³ − 3x", "4x⁴ − 6x"],
                answer: "4x³ − 6x",
                explanation: "d/dx(x⁴) = 4x³, d/dx(3x²) = 6x, d/dx(7) = 0. Total: 4x³ − 6x",
              },
            ],
          },
          {
            slug: "integration",
            name: "Integration",
            description: "Antiderivatives, definite integrals, the Fundamental Theorem of Calculus, and area.",
            estimatedMinutes: 40,
            xpReward: 230,
            keyFormulas: ["∫xⁿ dx = xⁿ⁺¹/(n+1) + C", "∫_a^b f(x)dx = F(b)−F(a)"],
            theory: [
              { type: "heading", level: 2, text: "Antiderivatives" },
              { type: "paragraph", text: "Integration is the reverse of differentiation. The antiderivative of f is a function F where F' = f. Always add the constant C for indefinite integrals." },
              { type: "formula", label: "Power rule (integration)", text: "∫xⁿ dx = xⁿ⁺¹/(n+1) + C  (n ≠ −1)" },
              { type: "heading", level: 2, text: "Fundamental Theorem of Calculus" },
              { type: "formula", label: "Definite integral", text: "∫_a^b f(x) dx = F(b) − F(a)" },
              { type: "callout", variant: "key", text: "Geometrically, the definite integral gives the net area between the curve and x-axis from a to b." },
            ],
            examples: [
              { title: "Definite Integral", given: "Evaluate ∫_0^3 x² dx", solution: ["∫x² dx = x³/3 + C", "Apply bounds: [x³/3]_0^3 = 3³/3 − 0 = 9"], answer: "9" },
            ],
            problems: [
              {
                id: "int-1", difficulty: "easy", type: "mcq",
                question: "What is ∫ 2x dx?",
                options: ["x + C", "x² + C", "2 + C", "x²/2 + C"],
                answer: "x² + C",
                explanation: "∫2x dx = 2 × x²/2 + C = x² + C",
              },
            ],
          },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════════
  // BIOLOGY
  // ══════════════════════════════════════════════════════════════════════════════
  {
    slug: "biology",
    name: "Biology",
    emoji: "🧬",
    color: "#22c55e",
    gradient: "from-green-500 to-emerald-600",
    description: "Life at every scale — from DNA to ecosystems.",
    chapters: [
      { slug: "cell-biology", name: "Cell Biology", description: "Cell structure, organelles, and cellular processes.", level: "foundations",
        topics: [
          { slug: "cell-structure", name: "Cell Structure", description: "Prokaryotic vs eukaryotic cells, organelles and their functions.", estimatedMinutes: 30, xpReward: 150,
            theory: [
              { type: "heading", level: 2, text: "Cell Theory" },
              { type: "list", items: ["All living organisms are made of cells", "The cell is the basic unit of life", "All cells come from pre-existing cells"] },
              { type: "table", headers: ["Organelle", "Function"], rows: [["Nucleus", "Contains DNA; controls cell activity"], ["Mitochondria", "ATP production (respiration)"], ["Ribosomes", "Protein synthesis"], ["Cell Membrane", "Controls what enters/exits"], ["Chloroplast (plant)", "Photosynthesis"]] },
            ],
            examples: [{ title: "Comparing Cell Types", given: "How does a plant cell differ from an animal cell?", solution: ["Plant cells have: cell wall, chloroplasts, large central vacuole", "Animal cells have: no cell wall, centrioles, smaller vacuoles"], answer: "Cell wall, chloroplasts, large vacuole" }],
            problems: [{ id: "cell-1", difficulty: "easy", type: "mcq", question: "Which organelle is called the 'powerhouse of the cell'?", options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi body"], answer: "Mitochondria", explanation: "Mitochondria produce ATP through cellular respiration — the cell's energy currency." }] },
        ]
      },
      { slug: "genetics", name: "Genetics & DNA", description: "DNA structure, inheritance, Mendelian genetics, and biotechnology.", level: "core",
        topics: [
          { slug: "dna-structure", name: "DNA & RNA", description: "The double helix, base pairing, replication, transcription, and translation.", estimatedMinutes: 35, xpReward: 180,
            theory: [
              { type: "heading", level: 2, text: "DNA Structure" },
              { type: "paragraph", text: "DNA (deoxyribonucleic acid) is a double helix made of nucleotides. Each nucleotide: phosphate + deoxyribose sugar + nitrogenous base." },
              { type: "callout", variant: "key", text: "Base pairing rules: A-T (2 hydrogen bonds), G-C (3 hydrogen bonds). This complementarity is the key to replication and transcription." },
            ],
            examples: [{ title: "Complementary Strand", given: "If DNA strand is 5'-ATGCTA-3', what is the complementary strand?", solution: ["A→T, T→A, G→C, C→G, T→A, A→T", "Complementary: 3'-TACGAT-5'"], answer: "3'-TACGAT-5'" }],
            problems: [{ id: "dna-1", difficulty: "easy", type: "mcq", question: "Which base pairs with Adenine in DNA?", options: ["Adenine", "Guanine", "Thymine", "Cytosine"], answer: "Thymine", explanation: "In DNA: Adenine (A) pairs with Thymine (T), and Guanine (G) pairs with Cytosine (C)." }] },
        ]
      },
    ],
  },

  // ENGLISH, ASTRONOMY, AI — structure only
  {
    slug: "english",
    name: "English",
    emoji: "📚",
    color: "#8b5cf6",
    gradient: "from-violet-500 to-purple-600",
    description: "Master language — reading, writing, grammar, and literature.",
    chapters: [
      { slug: "grammar", name: "Grammar & Writing", description: "Parts of speech, sentence structure, punctuation, and style.", level: "foundations",
        topics: [
          { slug: "sentence-structure", name: "Sentence Structure", description: "Subject, predicate, clauses, and sentence types.", estimatedMinutes: 25, xpReward: 130,
            theory: [{ type: "paragraph", text: "A sentence must have a subject and predicate. Simple sentences have one clause; compound sentences join two with a conjunction; complex sentences have a main and subordinate clause." }],
            examples: [{ title: "Identifying Sentence Types", given: "Classify: 'I went to school, and I learned a lot.'", solution: ["Two independent clauses joined by 'and' → Compound sentence"], answer: "Compound sentence" }],
            problems: [{ id: "eng-1", difficulty: "easy", type: "mcq", question: "Which is a compound sentence?", options: ["She ran.", "She ran because it rained.", "She ran and she fell.", "Running fast, she won."], answer: "She ran and she fell.", explanation: "Two independent clauses joined by 'and' — compound sentence." }] },
        ]
      },
    ],
  },
  {
    slug: "astronomy",
    name: "Astronomy",
    emoji: "🔭",
    color: "#06b6d4",
    gradient: "from-cyan-500 to-sky-600",
    description: "Explore the cosmos — planets, stars, galaxies, and the fate of the universe.",
    chapters: [
      { slug: "solar-system", name: "The Solar System", description: "Planets, moons, the Sun, and orbital mechanics.", level: "foundations",
        topics: [
          { slug: "planets", name: "The Planets", description: "Structure, properties, and characteristics of the eight planets.", estimatedMinutes: 25, xpReward: 130,
            theory: [
              { type: "paragraph", text: "Our solar system has 8 planets orbiting the Sun. Inner rocky planets: Mercury, Venus, Earth, Mars. Outer gas giants: Jupiter, Saturn. Ice giants: Uranus, Neptune." },
              { type: "callout", variant: "info", text: "Pluto was reclassified as a 'dwarf planet' in 2006 by the IAU." },
            ],
            examples: [{ title: "Planet Ordering", given: "List planets in order from the Sun.", solution: ["Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune", "Mnemonic: My Very Educated Mother Just Served Us Nachos"], answer: "8 planets, increasing distance" }],
            problems: [{ id: "ast-1", difficulty: "easy", type: "mcq", question: "Which planet has the most moons?", options: ["Jupiter", "Saturn", "Uranus", "Neptune"], answer: "Saturn", explanation: "Saturn currently holds the record with 146 confirmed moons (as of 2023)." }] },
        ]
      },
    ],
  },
  {
    slug: "ai",
    name: "Artificial Intelligence",
    emoji: "🤖",
    color: "#f97316",
    gradient: "from-orange-500 to-red-600",
    description: "Machine learning, neural networks, and the future of intelligent systems.",
    chapters: [
      { slug: "ml-foundations", name: "Machine Learning Foundations", description: "Supervised, unsupervised learning, and key ML concepts.", level: "foundations",
        topics: [
          { slug: "intro-ml", name: "Introduction to ML", description: "What machine learning is, types, and real-world applications.", estimatedMinutes: 25, xpReward: 140,
            theory: [
              { type: "heading", level: 2, text: "What is Machine Learning?" },
              { type: "paragraph", text: "Machine learning is a field of AI where systems learn from data to make decisions without being explicitly programmed. Types: Supervised (labeled data), Unsupervised (patterns), Reinforcement (rewards)." },
              { type: "list", items: ["Supervised: spam detection, image classification", "Unsupervised: customer clustering, anomaly detection", "Reinforcement: game playing (AlphaGo), robotics"] },
            ],
            examples: [{ title: "ML vs Traditional Programming", given: "How does spam detection work with ML vs rules-based?", solution: ["Rules-based: manually write rules (contains 'free money' → spam)", "ML: train on thousands of spam/ham examples, model learns patterns automatically"], answer: "ML learns patterns from data" }],
            problems: [{ id: "ai-1", difficulty: "easy", type: "mcq", question: "A model is trained with labeled cat/dog images. This is:", options: ["Unsupervised", "Reinforcement", "Supervised", "Transfer learning"], answer: "Supervised", explanation: "Labeled training data (cat=1, dog=0) means supervised learning." }] },
        ]
      },
    ],
  },
].filter((subject) => subject.slug !== "physics-legacy");

// ─── Helper functions ─────────────────────────────────────────────────────────

export function getSubject(slug: string): Subject | undefined {
  return SUBJECTS.find((s) => s.slug === slug);
}

export function getTopic(subjectSlug: string, topicSlug: string): { subject: Subject; chapter: Chapter; topic: Topic } | undefined {
  const subject = getSubject(subjectSlug);
  if (!subject) return undefined;
  for (const chapter of subject.chapters) {
    const topic = chapter.topics.find((t) => t.slug === topicSlug);
    if (topic) return { subject, chapter, topic };
  }
  return undefined;
}

export function getTopicCount(subject: Subject): number {
  return subject.chapters.reduce((sum, ch) => sum + ch.topics.length, 0);
}

export type TopicProgressLookup = Record<string, { status?: string } | undefined>;

/**
 * A lesson becomes available only after the lesson immediately before it is
 * complete. The final lesson in a chapter therefore unlocks the next chapter.
 */
export function getPreviousTopic(subject: Subject, chapterIndex: number, topicIndex: number): Topic | undefined {
  if (topicIndex > 0) return subject.chapters[chapterIndex]?.topics[topicIndex - 1];
  if (chapterIndex > 0) {
    const previousChapter = subject.chapters[chapterIndex - 1];
    return previousChapter.topics[previousChapter.topics.length - 1];
  }
  return undefined;
}

export function isTopicUnlocked(
  subject: Subject,
  chapterIndex: number,
  topicIndex: number,
  progressMap: TopicProgressLookup,
): boolean {
  const previous = getPreviousTopic(subject, chapterIndex, topicIndex);
  return !previous || progressMap[previous.slug]?.status === "completed";
}
