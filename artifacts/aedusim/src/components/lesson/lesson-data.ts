export type SimType =
  | "thermodynamics"
  | "projectile"
  | "wave"
  | "circuit"
  | "dna";

export type Model3DType =
  | "atom-carbon"
  | "atom-hydrogen"
  | "atom-oxygen"
  | "atom-sodium"
  | "molecule-h2o"
  | "molecule-co2"
  | "molecule-ch4";

export type ModuleType =
  | "concept"
  | "simulation"
  | "model3d"
  | "image"
  | "video"
  | "notes"
  | "real_life"
  | "quiz"
  | "xp";

// Plan feature flags
export const PLAN_FEATURES = {
  free: {
    allowedSubjects: ["physics", "math"],
    maxLevel: "Beginner" as string,
    video: false,
    model3d: false,
    simulation: true,
    maxSimulationsPerLesson: 1,
    realLife: false,
  },
  pro: {
    allowedSubjects: ["physics", "chemistry", "biology", "math", "history", "cs"],
    maxLevel: "Advanced" as string,
    video: true,
    model3d: true,
    simulation: true,
    maxSimulationsPerLesson: 99,
    realLife: true,
  },
  elite: {
    allowedSubjects: ["physics", "chemistry", "biology", "math", "history", "cs"],
    maxLevel: "Advanced" as string,
    video: true,
    model3d: true,
    simulation: true,
    maxSimulationsPerLesson: 99,
    realLife: true,
  },
};

export interface QuizQuestion {
  q: string;
  opts: string[];
  correct: number;
  explain: string;
}

export interface LessonModule {
  type: ModuleType;
  title: string;
  xpReward?: number;
  proOnly?: boolean;
  // concept
  definition?: string;
  keyPoints?: string[];
  // simulation
  simType?: SimType;
  // model3d
  modelType?: Model3DType;
  modelLabel?: string;
  // image
  imageUrl?: string;
  imageCaption?: string;
  imageAlt?: string;
  // video
  videoId?: string;
  videoCaption?: string;
  // notes
  sections?: Array<{ heading: string; content: string }>;
  formulas?: string[];
  // real_life
  scenario?: string;
  scenarioImage?: string;
  scenarioImageAlt?: string;
  problemStatement?: string;
  solution?: string;
  // quiz
  questions?: QuizQuestion[];
  // xp card
  summary?: string;
}

// ─── Curated Topic Content ─────────────────────────────────────────────────────

const LESSONS: Record<string, Record<string, Record<string, LessonModule[]>>> = {
  physics: {
    "Thermodynamics": {
      Beginner: [
        {
          type: "concept",
          title: "What is Thermodynamics?",
          definition: "Thermodynamics is the branch of physics that studies how heat, work, and energy interact. It explains everything from steam engines to refrigerators to black holes.",
          keyPoints: [
            "Heat always flows from hot to cold — never the reverse on its own",
            "Energy cannot be created or destroyed — only transformed (First Law)",
            "Systems naturally move toward disorder — entropy always increases (Second Law)",
            "Temperature measures the average kinetic energy of particles",
            "Absolute zero (0 K = −273.15°C) is the lowest possible temperature",
          ],
          xpReward: 25,
        },
        {
          type: "image",
          title: "The Four Laws at a Glance",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Thermodynamics_laws_diagram.svg/800px-Thermodynamics_laws_diagram.svg.png",
          imageAlt: "Diagram summarising the four laws of thermodynamics",
          imageCaption: "The four laws of thermodynamics define the fundamental rules governing all heat and energy transformations in the universe.",
          xpReward: 15,
        },
        {
          type: "simulation",
          title: "Kinetic Theory — Gas Particles & Temperature",
          simType: "thermodynamics",
          xpReward: 30,
        },
        {
          type: "notes",
          title: "The Four Laws of Thermodynamics",
          sections: [
            { heading: "Zeroth Law", content: "If A is in thermal equilibrium with B, and B with C, then A is in equilibrium with C. This defines temperature itself." },
            { heading: "First Law — Energy Conservation", content: "ΔU = Q − W. Internal energy change equals heat added minus work done by the system. Energy is never created or destroyed." },
            { heading: "Second Law — Entropy", content: "The entropy of an isolated system always increases or stays the same. Heat never flows spontaneously from cold to hot. This is why perpetual motion machines are impossible." },
            { heading: "Third Law", content: "As temperature approaches absolute zero (0 K), entropy approaches a minimum. A perfect crystal at 0 K has zero entropy." },
          ],
          formulas: ["ΔU = Q − W", "Q = mcΔT", "Efficiency η = 1 − T_C/T_H", "ΔS ≥ 0"],
          xpReward: 25,
        },
        {
          type: "real_life",
          title: "Real-Life Application: The Refrigerator",
          scenario: "A refrigerator keeps your food cold by pumping heat from inside (cold) to outside (warm room) — seemingly violating the Second Law. How?",
          scenarioImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Refrigerator_diagram.svg/400px-Refrigerator_diagram.svg.png",
          scenarioImageAlt: "Refrigerator thermodynamic cycle diagram",
          problemStatement: "If heat always flows from hot to cold, how can a fridge move heat from cold (inside) to warm (room)?",
          solution: "A refrigerator uses a compressor powered by electricity (work input W) to force the refrigerant to absorb heat from inside (Q_cold) and release it outside (Q_hot). This doesn't violate the Second Law because we're adding work. Net result: Q_hot = Q_cold + W. The COP (Coefficient of Performance) = Q_cold / W.",
          xpReward: 30,
          proOnly: true,
        },
        {
          type: "video",
          title: "Video: Thermodynamics Explained",
          videoId: "8D6CgHIjSbM",
          videoCaption: "Khan Academy — Introduction to Thermodynamics. Covers the laws, heat transfer, and real-world applications.",
          xpReward: 20,
          proOnly: true,
        },
        {
          type: "quiz",
          title: "Practice Quiz — Thermodynamics",
          questions: [
            { q: "Which law states that energy cannot be created or destroyed?", opts: ["Zeroth Law", "First Law", "Second Law", "Third Law"], correct: 1, explain: "The First Law of Thermodynamics is the law of energy conservation: ΔU = Q − W." },
            { q: "What does entropy measure?", opts: ["Temperature", "Disorder/randomness of a system", "Total heat content", "Pressure"], correct: 1, explain: "Entropy (S) measures disorder. The Second Law says it always increases in isolated systems." },
            { q: "Heat flows spontaneously from…", opts: ["Cold to hot", "Hot to cold", "Neither direction", "Depends on material"], correct: 1, explain: "Second Law: heat always flows naturally from high temperature to low temperature." },
            { q: "What is the efficiency of a Carnot engine between 600 K and 300 K?", opts: ["25%", "33%", "50%", "75%"], correct: 2, explain: "η = 1 − T_C/T_H = 1 − 300/600 = 50%" },
          ],
          xpReward: 50,
        },
      ],
      Advanced: [
        {
          type: "concept",
          title: "Advanced Thermodynamics — Statistical & Classical",
          definition: "Advanced thermodynamics unifies classical laws with statistical mechanics. Entropy becomes S = k_B ln(Ω), Gibbs free energy predicts spontaneity, and the Carnot cycle sets absolute efficiency limits.",
          keyPoints: [
            "Entropy: dS = δQ_rev / T (reversible) vs dS > δQ / T (irreversible)",
            "Gibbs Free Energy: ΔG = ΔH − TΔS — negative ΔG means spontaneous",
            "Carnot Efficiency: η = 1 − T_C/T_H — theoretical maximum",
            "Maxwell relations link unmeasurable entropy to P, V, T",
            "Boltzmann: S = k_B ln(Ω) — microscopic origin of entropy",
            "Clausius inequality: ∮ δQ/T ≤ 0",
          ],
          xpReward: 30,
        },
        {
          type: "simulation",
          title: "Kinetic Theory Particle Simulation",
          simType: "thermodynamics",
          xpReward: 30,
        },
        {
          type: "image",
          title: "Carnot Cycle — P-V Diagram",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Carnot_heat_engine_2.svg/600px-Carnot_heat_engine_2.svg.png",
          imageAlt: "Carnot cycle on a P-V diagram showing four reversible steps",
          imageCaption: "The Carnot cycle consists of two isothermal (constant temperature) and two adiabatic (no heat exchange) steps — the most efficient possible cycle.",
          xpReward: 15,
        },
        {
          type: "notes",
          title: "Carnot Engine, Gibbs Energy & Maxwell Relations",
          sections: [
            { heading: "Carnot Cycle (4 Steps)", content: "1. Isothermal expansion at T_H: absorbs Q_H\n2. Adiabatic expansion: T_H → T_C, no heat exchange\n3. Isothermal compression at T_C: releases Q_C\n4. Adiabatic compression: T_C → T_H\nNo real engine surpasses Carnot efficiency." },
            { heading: "Gibbs Free Energy", content: "ΔG = ΔH − TΔS\n• ΔG < 0: spontaneous\n• ΔG = 0: equilibrium\n• ΔG > 0: non-spontaneous (requires energy input)\nAt standard conditions: ΔG° = −RT ln(K)" },
            { heading: "Maxwell Relations", content: "(∂T/∂V)_S = −(∂P/∂S)_V\n(∂T/∂P)_S = (∂V/∂S)_P\nThese link entropy changes to measurable P, V, T quantities." },
            { heading: "Boltzmann Entropy", content: "S = k_B · ln(Ω)\nΩ = number of microstates\nConnects macroscopic thermodynamics to statistical mechanics. A gas has astronomical Ω → enormous S." },
          ],
          formulas: ["η_Carnot = 1 − T_C/T_H", "ΔG = ΔH − TΔS", "S = k_B ln(Ω)", "dU = TdS − PdV"],
          xpReward: 30,
        },
        {
          type: "real_life",
          title: "Real-Life Problem: Power Plant Efficiency",
          scenario: "A coal power plant operates between 600°C (boiler) and 50°C (condenser). Engineers claim 80% efficiency.",
          scenarioImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Power_plant_energy_overview.svg/600px-Power_plant_energy_overview.svg.png",
          scenarioImageAlt: "Power plant energy flow diagram",
          problemStatement: "Is the claimed 80% efficiency physically possible? What is the maximum theoretical efficiency of this plant?",
          solution: "T_H = 600 + 273 = 873 K, T_C = 50 + 273 = 323 K\nη_max (Carnot) = 1 − 323/873 = 1 − 0.370 = 0.630 = 63%\nSince 80% > 63% (Carnot limit), this violates the Second Law of Thermodynamics. It is physically IMPOSSIBLE. Real plants achieve 35–45% efficiency.",
          xpReward: 35,
          proOnly: true,
        },
        {
          type: "video",
          title: "Video: Entropy & the Second Law",
          videoId: "sMb00lz-IfE",
          videoCaption: "Veritasium — What is Entropy? A deep conceptual explanation connecting disorder, probability, and the arrow of time.",
          xpReward: 20,
          proOnly: true,
        },
        {
          type: "quiz",
          title: "Advanced Quiz — Thermodynamics",
          questions: [
            { q: "A Carnot engine operates between 800 K and 400 K. What is its efficiency?", opts: ["25%", "33%", "50%", "66%"], correct: 2, explain: "η = 1 − T_C/T_H = 1 − 400/800 = 50%" },
            { q: "When ΔG < 0, a reaction is...", opts: ["Endothermic", "Spontaneous", "At equilibrium", "Non-spontaneous"], correct: 1, explain: "Negative ΔG means the process is thermodynamically spontaneous at constant T and P." },
            { q: "S = k_B ln(Ω) — what is Ω?", opts: ["Temperature in Kelvin", "Number of macrostates", "Number of microstates", "Angular velocity"], correct: 2, explain: "Ω is the number of microscopic configurations (microstates). More microstates = higher entropy." },
            { q: "Which process is guaranteed to be reversible?", opts: ["Heat flowing through a wall", "A Carnot engine cycle", "Free expansion of a gas", "Mixing of two gases"], correct: 1, explain: "The Carnot cycle consists entirely of reversible processes (quasi-static isothermal and adiabatic steps). All others are irreversible." },
          ],
          xpReward: 60,
        },
      ],
      Intermediate: [
        {
          type: "concept",
          title: "Thermodynamics — Core Principles",
          definition: "Thermodynamics governs heat engines, refrigerators, chemical reactions, and living systems through four fundamental laws.",
          keyPoints: [
            "ΔU = Q − W: internal energy, heat, and work are interconnected",
            "Entropy always increases in isolated systems",
            "Carnot efficiency sets the upper limit for any heat engine",
            "Processes can be isothermal, adiabatic, isochoric, or isobaric",
          ],
          xpReward: 25,
        },
        {
          type: "simulation",
          title: "Gas Particle Kinetic Theory",
          simType: "thermodynamics",
          xpReward: 30,
        },
        {
          type: "image",
          title: "Heat Engine Schematic",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Heat_engine.svg/400px-Heat_engine.svg.png",
          imageAlt: "Heat engine diagram showing heat source, engine, heat sink and work output",
          imageCaption: "A heat engine converts thermal energy (Q_H) into work (W), releasing waste heat (Q_C) to a cold reservoir. Efficiency = W/Q_H.",
          xpReward: 15,
        },
        {
          type: "notes",
          title: "Thermodynamic Processes & Heat Engines",
          sections: [
            { heading: "Four Process Types", content: "• Isothermal (ΔT=0): PV = const\n• Adiabatic (Q=0): PV^γ = const\n• Isochoric (ΔV=0): W=0, ΔU=Q\n• Isobaric (ΔP=0): W=PΔV" },
            { heading: "Heat Engines", content: "Efficiency η = W/Q_H = 1 − Q_C/Q_H\nCarnot (maximum): η_max = 1 − T_C/T_H\nReal engines: ~35–45% (friction, heat losses)" },
            { heading: "Refrigerators & Heat Pumps", content: "COP_fridge = Q_C/W\nCOP_pump = Q_H/W\nBoth move heat against natural direction using work input." },
          ],
          formulas: ["ΔU = Q − W", "η = 1 − T_C/T_H", "Q = mcΔT", "W = PΔV (isobaric)"],
          xpReward: 25,
        },
        {
          type: "real_life",
          title: "Real-Life Problem: Car Engine Efficiency",
          scenario: "A petrol car engine burns fuel at ~2000 K and exhausts at ~600 K. A salesman claims the engine is 85% efficient.",
          scenarioImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/4-Stroke-Engine.gif/200px-4-Stroke-Engine.gif",
          scenarioImageAlt: "4-stroke engine animation",
          problemStatement: "Calculate the maximum theoretical efficiency of this engine and determine if the claim is honest.",
          solution: "T_H = 2000 K, T_C = 600 K\nη_Carnot = 1 − 600/2000 = 1 − 0.3 = 70%\nSince 85% > 70% Carnot limit, the claim is IMPOSSIBLE. Real petrol engines achieve ~25–35% efficiency (rest lost as heat/friction).",
          xpReward: 30,
          proOnly: true,
        },
        {
          type: "video",
          title: "Video: Thermodynamics in Everyday Life",
          videoId: "i-NNWI8Ccas",
          videoCaption: "CrashCourse Physics — Thermodynamics. Covers laws, heat engines, and efficiency with clear animations.",
          xpReward: 20,
          proOnly: true,
        },
        {
          type: "quiz",
          title: "Quiz — Thermodynamics",
          questions: [
            { q: "In an adiabatic process, which quantity is zero?", opts: ["Work done", "ΔU", "Heat transferred", "ΔT"], correct: 2, explain: "Adiabatic = no heat exchange: Q = 0. So ΔU = −W." },
            { q: "A heat engine takes 1000 J and exhausts 600 J. Efficiency?", opts: ["60%", "40%", "16.7%", "150%"], correct: 1, explain: "W = 1000 − 600 = 400 J. η = 400/1000 = 40%." },
            { q: "What is the COP of a refrigerator that removes 500 J using 200 J of work?", opts: ["2.5", "0.4", "1.5", "700"], correct: 0, explain: "COP = Q_cold / W = 500 / 200 = 2.5" },
          ],
          xpReward: 50,
        },
      ],
    },

    "Newton's Laws of Motion": {
      Beginner: [
        {
          type: "concept",
          title: "Newton's Three Laws",
          definition: "Newton's Laws describe how forces affect the motion of objects — the foundation of classical mechanics that explains everything from falling apples to orbiting planets.",
          keyPoints: [
            "First Law (Inertia): Objects stay at rest or move uniformly unless a net force acts",
            "Second Law: F = ma — force equals mass times acceleration",
            "Third Law: Every action has an equal and opposite reaction",
            "A net force of zero means constant velocity (not necessarily zero)",
          ],
          xpReward: 25,
        },
        {
          type: "image",
          title: "Free Body Diagram — Forces on a Box",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Free_body.svg/400px-Free_body.svg.png",
          imageAlt: "Free body diagram showing weight, normal force, and applied force on a box",
          imageCaption: "A free body diagram shows ALL forces acting on an object. Weight acts downward; normal force acts perpendicular to the surface; applied forces may be in any direction.",
          xpReward: 15,
        },
        {
          type: "simulation",
          title: "Projectile Motion — Newton's Second Law in Action",
          simType: "projectile",
          xpReward: 30,
        },
        {
          type: "real_life",
          title: "Real-Life Problem: Car Crash Safety",
          scenario: "In a car crash, a 70 kg passenger travelling at 60 km/h (16.7 m/s) is stopped by an airbag in 0.1 s versus a rigid dashboard in 0.01 s.",
          scenarioImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Airbag_during_crash.jpg/400px-Airbag_during_crash.jpg",
          scenarioImageAlt: "Airbag deploying in a car crash",
          problemStatement: "Calculate the force on the passenger in each case and explain why airbags save lives.",
          solution: "Impulse = Δp = m·Δv = 70 × 16.7 = 1169 N·s\nWith airbag: F = Δp/Δt = 1169/0.1 = 11,690 N ≈ 12 kN\nWith dashboard: F = 1169/0.01 = 116,900 N ≈ 117 kN\nThe airbag extends the stopping time by 10×, reducing force by 10×. F = ma is the key — same impulse, longer time = smaller force = survivable injury.",
          xpReward: 35,
          proOnly: true,
        },
        {
          type: "video",
          title: "Video: Newton's Laws of Motion",
          videoId: "kKKM8Y-u7ds",
          videoCaption: "Khan Academy — Newton's Laws explained with worked examples and animations.",
          xpReward: 20,
          proOnly: true,
        },
        {
          type: "quiz",
          title: "Quiz — Newton's Laws",
          questions: [
            { q: "A 5 kg object accelerates at 3 m/s². What net force acts on it?", opts: ["1.67 N", "8 N", "15 N", "53 N"], correct: 2, explain: "F = ma = 5 × 3 = 15 N" },
            { q: "Which law explains why you feel pushed back when a car accelerates?", opts: ["First Law", "Second Law", "Third Law", "Law of Gravity"], correct: 0, explain: "Your body tends to stay at rest (inertia) while the car accelerates forward — Newton's First Law." },
            { q: "A rocket expels gas backward. What happens to the rocket?", opts: ["Nothing", "It slows down", "It accelerates forward", "It rotates"], correct: 2, explain: "Newton's Third Law: the gas pushes backward on the exhaust (action), the exhaust pushes forward on the rocket (reaction)." },
          ],
          xpReward: 45,
        },
      ],
      Intermediate: [
        {
          type: "concept", title: "Newton's Laws — Vector Analysis",
          definition: "At intermediate level, we analyse forces as vectors, draw free body diagrams, resolve components, and solve multi-body systems.",
          keyPoints: ["F = ma is a vector equation — direction matters", "Net force = vector sum of all forces including friction, normal, tension, gravity", "Impulse-momentum theorem: FΔt = Δp", "Action-reaction pairs act on DIFFERENT objects"],
          xpReward: 25,
        },
        {
          type: "simulation", title: "Projectile Motion Simulator", simType: "projectile", xpReward: 30,
        },
        {
          type: "image",
          title: "Inclined Plane — Force Resolution",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Inclined_plane_force_plan.svg/500px-Inclined_plane_force_plan.svg.png",
          imageAlt: "Force diagram on an inclined plane showing weight components",
          imageCaption: "On a slope at angle θ: component along slope = mg·sinθ (causes sliding), component perpendicular = mg·cosθ (determines normal force and friction).",
          xpReward: 15,
        },
        {
          type: "notes", title: "Force Resolution & Problem Solving",
          sections: [
            { heading: "Free Body Diagram (FBD)", content: "Draw every force as a vector arrow:\n• Weight: mg downward\n• Normal: ⊥ to surface\n• Friction: μN opposing motion\n• Tension: along rope\nThen apply ΣF = ma for each axis." },
            { heading: "Inclined Planes", content: "Along slope: F_net = mg·sinθ − f\nPerpendicular: N = mg·cosθ\nFriction: f = μN = μmg·cosθ\nAcceleration: a = g(sinθ − μcosθ)" },
          ],
          formulas: ["F = ma", "p = mv", "J = FΔt = Δp", "f = μN"],
          xpReward: 25,
        },
        {
          type: "real_life", title: "Real-Life Problem: Elevator Forces",
          scenario: "A 60 kg person stands on a scale in an elevator. The elevator accelerates upward at 2 m/s².",
          scenarioImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Elevator_gravity.svg/300px-Elevator_gravity.svg.png",
          scenarioImageAlt: "Person in elevator showing normal force and weight",
          problemStatement: "What does the scale read? Is the person 'heavier' or 'lighter' during upward acceleration?",
          solution: "During upward acceleration, ΣF = ma (upward positive):\nN − mg = ma\nN = m(g + a) = 60(9.8 + 2) = 60 × 11.8 = 708 N\nScale reading = 708 N ÷ 9.8 = 72.2 kg\nThe person feels 12.2 kg 'heavier' — this is the same effect astronauts feel during rocket launch.",
          xpReward: 30, proOnly: true,
        },
        {
          type: "video", title: "Video: Newton's Laws — Worked Problems",
          videoId: "7v7DVNxTh0w", videoCaption: "Veritasium — Newton's Third Law misconceptions explained with real experiments.",
          xpReward: 20, proOnly: true,
        },
        {
          type: "quiz", title: "Quiz — Intermediate",
          questions: [
            { q: "A 10 kg box: 30 N right, 10 N left, friction = 4 N. What is acceleration?", opts: ["1.6 m/s²", "2 m/s²", "3 m/s²", "1 m/s²"], correct: 0, explain: "Net F = 30 − 10 − 4 = 16 N. a = F/m = 16/10 = 1.6 m/s²" },
            { q: "What is the SI unit of momentum?", opts: ["N·m", "kg·m/s", "J", "W"], correct: 1, explain: "p = mv → kg·m/s" },
          ],
          xpReward: 50,
        },
      ],
      Advanced: [
        { type: "concept", title: "Advanced Mechanics — Lagrangian & Relativistic",
          definition: "At advanced level, Newton's laws extend to Lagrangian/Hamiltonian mechanics and relativistic corrections.",
          keyPoints: ["Newton's laws are a special case of Lagrangian mechanics: L = T − V", "Noether's theorem: conservation of momentum follows from spatial symmetry", "Relativistic force: F = dp/dt = d(γmv)/dt", "Angular momentum: L = r × p, conserved when net torque = 0"],
          xpReward: 30,
        },
        { type: "simulation", title: "Projectile Motion", simType: "projectile", xpReward: 30 },
        { type: "real_life", title: "Relativistic Momentum Problem",
          scenario: "A proton is accelerated to 0.9c (90% speed of light) in the Large Hadron Collider.",
          scenarioImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/CERN_LHC_Tunnel1.jpg/400px-CERN_LHC_Tunnel1.jpg",
          scenarioImageAlt: "LHC tunnel at CERN",
          problemStatement: "A proton has rest mass 1.67×10⁻²⁷ kg. At v = 0.9c, what is its relativistic momentum?",
          solution: "γ = 1/√(1−v²/c²) = 1/√(1−0.81) = 1/√0.19 ≈ 2.294\np = γmv = 2.294 × 1.67×10⁻²⁷ × 0.9 × 3×10⁸ = 1.035×10⁻¹⁸ kg·m/s\nVs classical: p = mv = 4.51×10⁻¹⁹ kg·m/s\nRelativistic momentum is 2.29× larger — classical physics breaks down!",
          xpReward: 35, proOnly: true,
        },
        { type: "video", title: "Video: Special Relativity & F=ma",
          videoId: "NnMIhxWRGNw", videoCaption: "MinutePhysics — Why F=ma breaks down at high speeds and what replaces it.",
          xpReward: 20, proOnly: true,
        },
        { type: "quiz", title: "Advanced Quiz",
          questions: [{ q: "In relativistic mechanics, what replaces F = ma?", opts: ["F = mv²/r", "F = dp/dt = d(γmv)/dt", "F = mγa", "F = E/c"], correct: 1, explain: "F = dp/dt where p = γmv. At low v, γ≈1 and this reduces to F = ma." }],
          xpReward: 60,
        },
      ],
    },

    "Electricity & Circuits": {
      Beginner: [
        {
          type: "concept", title: "Electric Circuits — Fundamentals",
          definition: "An electric circuit is a closed path through which electric current flows. Current is driven by voltage and opposed by resistance.",
          keyPoints: ["Voltage (V): electrical pressure measured in Volts", "Current (I): flow of charge in Amperes (Coulombs/second)", "Resistance (R): opposition to current in Ohms (Ω)", "Ohm's Law: V = IR", "Power: P = VI = I²R = V²/R"],
          xpReward: 25,
        },
        {
          type: "simulation", title: "Live Circuit Simulator — Ohm's Law",
          simType: "circuit", xpReward: 35,
        },
        {
          type: "image",
          title: "Series vs Parallel Circuits",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Series_and_Parallel_Circuits.svg/600px-Series_and_Parallel_Circuits.svg.png",
          imageAlt: "Comparison of series and parallel circuit configurations",
          imageCaption: "Series circuits: same current through all components, voltages add. Parallel circuits: same voltage across all, currents add. Most real electrical systems use parallel wiring.",
          xpReward: 15,
        },
        {
          type: "real_life", title: "Real-Life Problem: Household Electricity",
          scenario: "Your home has a 240 V supply. A kettle (2000 W) and a TV (150 W) are both plugged in.",
          scenarioImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Household_circuit_breaker.jpg/300px-Household_circuit_breaker.jpg",
          scenarioImageAlt: "Household circuit breaker panel",
          problemStatement: "Calculate the current drawn by each appliance and explain why home circuits are wired in parallel.",
          solution: "Kettle: I = P/V = 2000/240 = 8.33 A\nTV: I = 150/240 = 0.625 A\nParallel wiring means each appliance gets the full 240 V regardless of others. In series, turning off one device would break the circuit for all. Also, fuses/circuit breakers protect each branch independently.",
          xpReward: 30, proOnly: true,
        },
        {
          type: "video", title: "Video: Electric Circuits",
          videoId: "F_vLWkkNdRQ", videoCaption: "Khan Academy — Introduction to circuits: current, voltage, resistance and Ohm's Law.",
          xpReward: 20, proOnly: true,
        },
        {
          type: "quiz", title: "Quiz — Circuits",
          questions: [
            { q: "A 6 V battery drives current through a 3 Ω resistor. Current?", opts: ["0.5 A", "2 A", "18 A", "9 A"], correct: 1, explain: "I = V/R = 6/3 = 2 A" },
            { q: "Power in a 4 Ω resistor carrying 3 A?", opts: ["12 W", "36 W", "0.75 W", "144 W"], correct: 1, explain: "P = I²R = 9 × 4 = 36 W" },
            { q: "What happens to total current when more resistors are added in parallel?", opts: ["Decreases", "Stays the same", "Increases", "Becomes zero"], correct: 2, explain: "Each parallel branch provides an additional path for current. Total current increases; total resistance decreases." },
          ],
          xpReward: 45,
        },
      ],
      Intermediate: [
        { type: "concept", title: "Kirchhoff's Laws & Network Analysis",
          definition: "Kirchhoff's laws extend Ohm's Law to complex multi-loop circuits.",
          keyPoints: ["KCL: sum of currents into a node = 0 (charge conservation)", "KVL: sum of EMFs around a loop = sum of voltage drops", "Series: R_T = R₁+R₂+..., same current", "Parallel: 1/R_T = 1/R₁+1/R₂+..., same voltage"],
          xpReward: 30,
        },
        { type: "simulation", title: "Circuit Simulator", simType: "circuit", xpReward: 35 },
        { type: "real_life", title: "Problem: Bridge Circuit",
          scenario: "A Wheatstone bridge circuit is used in precision electronic weighing scales.",
          scenarioImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Wheatstonebridge.svg/400px-Wheatstonebridge.svg.png",
          scenarioImageAlt: "Wheatstone bridge circuit diagram",
          problemStatement: "If R1=10Ω, R2=20Ω, R3=15Ω and the bridge is balanced, what is R4?",
          solution: "Balanced bridge condition: R1/R2 = R3/R4\nR4 = R2·R3/R1 = 20×15/10 = 30 Ω\nWhen balanced, no current flows through the galvanometer — used to detect tiny resistance changes in strain gauges.",
          xpReward: 30, proOnly: true,
        },
        { type: "quiz", title: "Quiz",
          questions: [{ q: "Two 6 Ω resistors in parallel. Total resistance?", opts: ["12 Ω", "6 Ω", "3 Ω", "1 Ω"], correct: 2, explain: "1/R = 1/6 + 1/6 = 2/6. R = 3 Ω. Parallel always reduces resistance." }],
          xpReward: 50,
        },
      ],
      Advanced: [
        { type: "concept", title: "AC Circuits & Impedance",
          definition: "AC circuits use complex impedance Z = R + jX to analyse behaviour at different frequencies.",
          keyPoints: ["Impedance Z = R + j(X_L − X_C)", "X_L = ωL (inductive reactance)", "X_C = 1/ωC (capacitive reactance)", "Resonance: ω₀ = 1/√(LC), impedance = R (minimum)", "RMS: V_rms = V_peak/√2"],
          xpReward: 30,
        },
        { type: "simulation", title: "Circuit Simulator", simType: "circuit", xpReward: 35 },
        { type: "quiz", title: "Advanced Quiz",
          questions: [{ q: "At resonance in a series RLC circuit, what is impedance?", opts: ["Maximum", "Minimum = R", "Zero", "Infinite"], correct: 1, explain: "At resonance X_L = X_C, they cancel. Net impedance = R only (minimum for series circuit)." }],
          xpReward: 60,
        },
      ],
    },

    "Waves & Optics": {
      Beginner: [
        { type: "concept", title: "Waves — Fundamentals",
          definition: "A wave is a periodic disturbance transferring energy through a medium without transferring matter.",
          keyPoints: ["Transverse: displacement ⊥ travel (light, water)", "Longitudinal: displacement ∥ travel (sound)", "v = fλ (wave speed = frequency × wavelength)", "Period T = 1/f"],
          xpReward: 25,
        },
        { type: "simulation", title: "Interactive Wave Simulator", simType: "wave", xpReward: 35 },
        {
          type: "image",
          title: "The Electromagnetic Spectrum",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/EM_spectrum.svg/800px-EM_spectrum.svg.png",
          imageAlt: "Electromagnetic spectrum showing radio waves through gamma rays",
          imageCaption: "The full EM spectrum from radio waves (long λ, low f) to gamma rays (short λ, high f). Visible light is a tiny slice between 400–700 nm.",
          xpReward: 15,
        },
        { type: "real_life", title: "Real-Life Problem: Concert Hall Design",
          scenario: "A concert hall has an echo problem: sound from the stage takes 0.8 s to reflect off the back wall.",
          scenarioImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Sydney_Opera_House_Sails.jpg/400px-Sydney_Opera_House_Sails.jpg",
          scenarioImageAlt: "Sydney Opera House concert hall",
          problemStatement: "If the speed of sound is 340 m/s, how far is the back wall from the stage, and why is this a problem?",
          solution: "d = v × t/2 = 340 × 0.8/2 = 136 m (÷2 because sound travels to wall and back)\nAn echo is noticeable when Δt > 0.05 s (50 ms). At 0.8 s, the echo is severe — musicians would hear their own notes 0.8 s later. Solution: curved walls, angled panels (diffusion), and acoustic panels (absorption).",
          xpReward: 30, proOnly: true,
        },
        { type: "video", title: "Video: Waves Explained",
          videoId: "3iMI_uOM_XY", videoCaption: "Waves, superposition, and the Doppler effect explained with clear animations.",
          xpReward: 20, proOnly: true,
        },
        { type: "quiz", title: "Quiz — Waves",
          questions: [
            { q: "A wave: frequency 5 Hz, wavelength 4 m. Speed?", opts: ["1.25 m/s", "9 m/s", "20 m/s", "0.8 m/s"], correct: 2, explain: "v = fλ = 5 × 4 = 20 m/s" },
            { q: "Sound is what type of wave?", opts: ["Transverse", "Longitudinal", "Electromagnetic", "Both"], correct: 1, explain: "Sound is longitudinal — air particles compress and expand parallel to the direction of travel." },
          ],
          xpReward: 40,
        },
      ],
      Intermediate: [
        { type: "concept", title: "Wave Behaviour: Reflection, Refraction & Interference",
          definition: "Waves exhibit rich behaviour at boundaries and when superimposed.",
          keyPoints: ["Reflection: angle of incidence = angle of reflection", "Refraction: Snell's Law n₁sinθ₁ = n₂sinθ₂", "Diffraction: bending around obstacles (significant when λ ≈ gap size)", "Superposition: waves add algebraically (constructive/destructive interference)"],
          xpReward: 30,
        },
        { type: "simulation", title: "Wave Simulator", simType: "wave", xpReward: 35 },
        { type: "real_life", title: "Problem: Noise-Cancelling Headphones",
          scenario: "Noise-cancelling headphones record ambient sound and play an inverted version.",
          scenarioImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Noise_cancellation_headphone.jpg/400px-Noise_cancellation_headphone.jpg",
          scenarioImageAlt: "Cross-section diagram of noise cancelling headphone",
          problemStatement: "A noise wave has equation y₁ = 3sin(2πt). The headphone plays y₂. What must y₂ be for perfect cancellation?",
          solution: "For destructive interference, y₂ must be exactly out of phase (180° phase shift):\ny₂ = −3sin(2πt) = 3sin(2πt + π)\nWhen y₁ + y₂ = 0 at all points — complete cancellation.\nIn practice: the inverted wave must match frequency, amplitude, AND phase precisely. Works best for low-frequency engine drone, less effective for high-pitched unpredictable sounds.",
          xpReward: 30, proOnly: true,
        },
        { type: "quiz", title: "Quiz",
          questions: [{ q: "Light from water (n=1.33) enters glass (n=1.5) at 30°. Refracted angle?", opts: ["Larger than 30°", "Smaller than 30°", "Exactly 30°", "90°"], correct: 1, explain: "Going to denser medium (higher n), light bends toward normal → angle decreases." }],
          xpReward: 50,
        },
      ],
      Advanced: [
        { type: "concept", title: "Wave-Particle Duality & Quantum Waves",
          definition: "At the quantum level, all matter and energy exhibit wave behaviour described by wavefunctions.",
          keyPoints: ["de Broglie: λ = h/p (all matter has wavelength)", "Double-slit: electrons create interference patterns", "Heisenberg: Δx·Δp ≥ ℏ/2 — position-momentum uncertainty", "Wavefunction |ψ|² gives probability density"],
          xpReward: 30,
        },
        { type: "simulation", title: "Wave Simulator", simType: "wave", xpReward: 35 },
        { type: "quiz", title: "Advanced Quiz",
          questions: [{ q: "An electron momentum 9.1×10⁻²⁴ kg·m/s. de Broglie wavelength? (h=6.63×10⁻³⁴ J·s)", opts: ["7.3×10⁻¹¹ m", "6.0×10⁻¹⁰ m", "1.5×10⁻⁹ m", "3.0×10⁻¹⁰ m"], correct: 0, explain: "λ = h/p = 6.63×10⁻³⁴/9.1×10⁻²⁴ ≈ 7.3×10⁻¹¹ m (0.073 nm)" }],
          xpReward: 60,
        },
      ],
    },
  },

  biology: {
    "DNA, Genetics & Inheritance": {
      Beginner: [
        {
          type: "concept", title: "DNA — The Blueprint of Life",
          definition: "DNA (Deoxyribonucleic Acid) is a double-helix molecule that carries genetic instructions for growth, development, and reproduction in all living organisms.",
          keyPoints: ["Double helix: two antiparallel strands wound around each other", "Base pairing: A–T (2 H-bonds), G–C (3 H-bonds) — always", "One gene = a section of DNA coding for one protein", "Humans have ~3 billion base pairs across 46 chromosomes"],
          xpReward: 25,
        },
        {
          type: "simulation", title: "DNA Double Helix — Live Animation", simType: "dna", xpReward: 35,
        },
        {
          type: "model3d", title: "3D Atom Model — Carbon (Basis of Life)",
          modelType: "atom-carbon", modelLabel: "Carbon — 4 valence electrons, forms the backbone of all organic molecules",
          xpReward: 30, proOnly: true,
        },
        {
          type: "image",
          title: "DNA Structure — Detailed Diagram",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/DNA_Structure%2BKey%2BLabelled.pn_NoBB.png/400px-DNA_Structure%2BKey%2BLabelled.pn_NoBB.png",
          imageAlt: "Labelled diagram of DNA double helix structure",
          imageCaption: "The DNA double helix: sugar-phosphate backbone on the outside, nitrogenous bases on the inside forming rungs. The two strands are antiparallel (5'→3' and 3'→5').",
          xpReward: 15,
        },
        {
          type: "real_life", title: "Real-Life Application: DNA Fingerprinting",
          scenario: "Forensic scientists found blood at a crime scene. They extracted DNA and compared it to a suspect's sample.",
          scenarioImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/RFLP.jpg/400px-RFLP.jpg",
          scenarioImageAlt: "DNA gel electrophoresis fingerprinting bands",
          problemStatement: "How does DNA fingerprinting work and why is it considered reliable evidence?",
          solution: "1. DNA is extracted from the crime scene sample and suspect\n2. DNA is cut with restriction enzymes at specific sequences\n3. Fragments separated by gel electrophoresis (size)\n4. Resulting 'barcode' pattern is compared\nThe probability of two unrelated people having identical DNA fingerprints is ~1 in 10 billion. Used in court since 1986. Also used to confirm paternity, identify disaster victims, and exonerate wrongly convicted people.",
          xpReward: 30, proOnly: true,
        },
        {
          type: "video", title: "Video: DNA Structure & Replication",
          videoId: "7Hk9jct2ozY", videoCaption: "Khan Academy — DNA structure, base pairing, and the mechanism of replication explained clearly.",
          xpReward: 20, proOnly: true,
        },
        {
          type: "quiz", title: "Quiz — DNA",
          questions: [
            { q: "Which base pairs with Adenine in DNA?", opts: ["Guanine", "Cytosine", "Thymine", "Uracil"], correct: 2, explain: "A pairs with T via 2 H-bonds. G pairs with C via 3 H-bonds." },
            { q: "Human body cells normally contain how many chromosomes?", opts: ["23", "46", "44", "92"], correct: 1, explain: "46 chromosomes in 23 pairs. Gametes (sperm/egg) have 23 (haploid)." },
            { q: "What holds the two DNA strands together?", opts: ["Covalent bonds", "Ionic bonds", "Hydrogen bonds", "Peptide bonds"], correct: 2, explain: "Hydrogen bonds between complementary bases (A-T and G-C) hold the two strands together. Weak individually but strong collectively." },
          ],
          xpReward: 45,
        },
      ],
      Intermediate: [
        {
          type: "concept", title: "Mendelian Genetics & Inheritance",
          definition: "Mendel's laws describe how traits are passed between generations through dominant and recessive alleles.",
          keyPoints: ["Alleles: different versions of a gene (e.g. T = tall, t = short)", "Dominant (T): expressed in both TT and Tt", "Recessive (t): expressed only in tt", "Monohybrid cross Tt × Tt → 3:1 ratio (dominant:recessive)", "Law of Independent Assortment: different genes segregate independently"],
          xpReward: 30,
        },
        { type: "simulation", title: "DNA Replication Animation", simType: "dna", xpReward: 35 },
        {
          type: "image",
          title: "Punnett Square — Monohybrid Cross",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Punnett_Square.svg/400px-Punnett_Square.svg.png",
          imageAlt: "Punnett square showing Tt x Tt cross",
          imageCaption: "Punnett square for Tt × Tt cross: 1 TT : 2 Tt : 1 tt genotype ratio = 3 tall : 1 short phenotype ratio.",
          xpReward: 15,
        },
        {
          type: "model3d", title: "3D Molecule — DNA Base",
          modelType: "molecule-h2o", modelLabel: "Hydrogen bonding — the same force that holds DNA base pairs together",
          xpReward: 25, proOnly: true,
        },
        {
          type: "real_life", title: "Problem: Cystic Fibrosis Genetics",
          scenario: "Cystic fibrosis (CF) is caused by a recessive allele (f). Both parents are carriers (Ff) and are expecting a child.",
          scenarioImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Autorecessive.svg/400px-Autorecessive.svg.png",
          scenarioImageAlt: "Autosomal recessive inheritance pedigree",
          problemStatement: "What is the probability the child will: (a) have CF, (b) be a carrier, (c) be completely unaffected?",
          solution: "Punnett square (Ff × Ff): FF, Ff, Ff, ff\n(a) CF (ff): 1/4 = 25%\n(b) Carrier (Ff): 2/4 = 50%\n(c) Normal (FF): 1/4 = 25%\nNote: carriers (Ff) are phenotypically normal but can pass the allele to their children — this is why CF can appear 'out of nowhere' in a family.",
          xpReward: 35, proOnly: true,
        },
        {
          type: "video", title: "Video: Mendelian Genetics",
          videoId: "CBezq1fFUEA", videoCaption: "Bozeman Science — Mendelian genetics, Punnett squares and dihybrid crosses explained.",
          xpReward: 20, proOnly: true,
        },
        {
          type: "quiz", title: "Quiz — Inheritance",
          questions: [
            { q: "Tt × Tt cross. What fraction of offspring are homozygous recessive (tt)?", opts: ["1/4", "1/2", "3/4", "0"], correct: 0, explain: "Punnett square gives TT:Tt:tt = 1:2:1. tt = 1/4 = 25%." },
            { q: "What term describes an organism with two DIFFERENT alleles for a gene?", opts: ["Homozygous", "Heterozygous", "Codominant", "Recessive"], correct: 1, explain: "Heterozygous means two different alleles (e.g. Tt). Homozygous means two identical alleles (TT or tt)." },
          ],
          xpReward: 50,
        },
      ],
      Advanced: [
        { type: "concept", title: "Molecular Genetics & Gene Expression",
          definition: "Gene expression converts DNA information into functional proteins via transcription and translation.",
          keyPoints: ["Central Dogma: DNA → mRNA → Protein", "Transcription: RNA polymerase reads template 3'→5', produces mRNA 5'→3'", "Translation: ribosomes read codons, tRNA delivers amino acids", "Gene regulation: lac operon, repressors, enhancers, epigenetics", "CRISPR-Cas9: precision gene editing tool"],
          xpReward: 30,
        },
        { type: "simulation", title: "DNA Helix Animation", simType: "dna", xpReward: 35 },
        {
          type: "model3d", title: "3D Atom — Nitrogen (Key in DNA bases)",
          modelType: "atom-oxygen", modelLabel: "Nitrogen-like atom — forms the purine and pyrimidine rings of DNA bases",
          xpReward: 25, proOnly: true,
        },
        { type: "real_life", title: "Real-Life: CRISPR Gene Therapy",
          scenario: "Scientists use CRISPR-Cas9 to potentially cure sickle cell anaemia by editing patients' own stem cells.",
          scenarioImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/CRISPR-Cas9-wt-vs-edited.png/500px-CRISPR-Cas9-wt-vs-edited.png",
          scenarioImageAlt: "CRISPR gene editing mechanism diagram",
          problemStatement: "Sickle cell is caused by a single base mutation (A→T) in the haemoglobin gene. How does CRISPR correct this?",
          solution: "1. Guide RNA (gRNA): designed to match the DNA sequence near the mutation\n2. Cas9 protein: cuts both strands of DNA at the target site\n3. HDR template: correct DNA sequence provided to repair the break\n4. Cell's own machinery: repairs the cut using the template → mutation corrected\n\nIn 2023, the first CRISPR therapy (Casgevy) was approved for sickle cell disease — a historic milestone. Challenges: off-target cuts, delivery to the right cells, ethical concerns.",
          xpReward: 35, proOnly: true,
        },
        {
          type: "video", title: "Video: How CRISPR Works",
          videoId: "jAhjPd4uNFY", videoCaption: "Kurzgesagt — CRISPR explained: how gene editing works and what it means for humanity.",
          xpReward: 20, proOnly: true,
        },
        {
          type: "quiz", title: "Advanced Quiz",
          questions: [{ q: "DNA template strand 3'-TACGAC-5'. What is the mRNA?", opts: ["5'-ATGCTG-3'", "5'-AUGCUG-3'", "3'-UACGAC-5'", "5'-TACGAC-3'"], correct: 1, explain: "RNA uses U instead of T. Template T→A, A→U, C→G, G→C. So TACGAC → AUGCUG (5'→3')" }],
          xpReward: 60,
        },
      ],
    },

    "Cell Structure & Organelles": {
      Beginner: [
        { type: "concept", title: "The Cell — Basic Unit of Life",
          definition: "The cell is the smallest structure capable of carrying out all life processes: growth, reproduction, metabolism, and response to environment.",
          keyPoints: ["All living things are made of cells (Cell Theory)", "Prokaryotic (bacteria): no nucleus, simple", "Eukaryotic (animals, plants, fungi): complex with organelles", "Cell membrane: selectively permeable phospholipid bilayer"],
          xpReward: 25,
        },
        {
          type: "image",
          title: "Animal vs Plant Cell — Comparison",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Animal_cell_structure_en.svg/600px-Animal_cell_structure_en.svg.png",
          imageAlt: "Labelled diagram of animal cell with all organelles",
          imageCaption: "Animal cell with labelled organelles. Plant cells additionally have: cell wall (cellulose), chloroplasts, large central vacuole, and plasmodesmata.",
          xpReward: 15,
        },
        {
          type: "model3d", title: "3D Carbon Atom — The Basis of Life",
          modelType: "atom-carbon", modelLabel: "Carbon — 4 bonds make it the perfect building block for complex biomolecules",
          xpReward: 30, proOnly: true,
        },
        {
          type: "real_life", title: "Real-Life: Cancer — When Cells Go Wrong",
          scenario: "Cancer occurs when cells divide uncontrollably due to mutations in genes controlling the cell cycle.",
          scenarioImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Mitosis_cells_sequence.svg/500px-Mitosis_cells_sequence.svg.png",
          scenarioImageAlt: "Cell division mitosis stages",
          problemStatement: "Why do cancer cells divide indefinitely while normal cells have a limited number of divisions?",
          solution: "Normal cells: telomeres (DNA caps) shorten with each division → Hayflick limit (~50 divisions) → apoptosis (programmed death)\nCancer cells: mutations activate telomerase (enzyme that rebuilds telomeres) → bypass Hayflick limit\nAlso: mutations in tumour suppressor genes (p53, BRCA1) disable 'stop' signals → uncontrolled division\nChemotherapy targets rapidly-dividing cells; immunotherapy teaches the immune system to recognise cancer cells.",
          xpReward: 30, proOnly: true,
        },
        {
          type: "video", title: "Video: Cell Structure",
          videoId: "URUJD5NEXC8", videoCaption: "Crash Course Biology — Inside the cell: organelles and their functions explained.",
          xpReward: 20, proOnly: true,
        },
        {
          type: "quiz", title: "Quiz — Cell Biology",
          questions: [
            { q: "Which organelle is the 'powerhouse of the cell'?", opts: ["Ribosome", "Nucleus", "Mitochondria", "Golgi"], correct: 2, explain: "Mitochondria produce ATP via aerobic respiration (Krebs cycle + electron transport chain)." },
            { q: "Which feature is in plant cells but NOT animal cells?", opts: ["Cell membrane", "Nucleus", "Mitochondria", "Cell wall"], correct: 3, explain: "Plants have cell wall (cellulose), chloroplasts, and large central vacuole — absent in animals." },
            { q: "What is the function of ribosomes?", opts: ["DNA replication", "Protein synthesis", "ATP production", "Lipid storage"], correct: 1, explain: "Ribosomes translate mRNA into protein (translation). Found free in cytoplasm or attached to rough ER." },
          ],
          xpReward: 45,
        },
      ],
      Intermediate: [
        { type: "concept", title: "Organelle Functions & Protein Secretion",
          definition: "Eukaryotic cells are highly organised with specialised compartments working in sequence to produce, process, and export proteins.",
          keyPoints: ["Nucleus → DNA → mRNA via transcription", "Rough ER → protein folding and modification (glycosylation)", "Golgi → sorting, packaging into vesicles", "Secretory vesicles → fuse with membrane → exocytosis", "Lysosomes → digest waste/pathogens (pH 5 acidic environment)"],
          xpReward: 30,
        },
        {
          type: "model3d", title: "3D Water Molecule — Hydrogen Bonding in Cells",
          modelType: "molecule-h2o", modelLabel: "Water — the universal solvent in all cellular reactions",
          xpReward: 25, proOnly: true,
        },
        {
          type: "image",
          title: "Protein Secretion Pathway",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Endomembrane_system_diagram_en.svg/600px-Endomembrane_system_diagram_en.svg.png",
          imageAlt: "Endomembrane system showing ER, Golgi and vesicle transport",
          imageCaption: "The endomembrane system: proteins made on rough ER → transported to Golgi (cis face) → modified → packaged into vesicles → secreted (exocytosis) or sent to lysosomes.",
          xpReward: 15,
        },
        { type: "quiz", title: "Quiz",
          questions: [{ q: "Why do muscle cells have more mitochondria than skin cells?", opts: ["Muscle cells are larger", "Muscle cells need more ATP for contraction", "Skin cells don't respire", "Muscle cells have more DNA"], correct: 1, explain: "Muscle contraction requires massive ATP. More mitochondria → faster ATP production to meet demand." }],
          xpReward: 50,
        },
      ],
      Advanced: [
        { type: "concept", title: "Cell Signalling & Membrane Biology",
          definition: "Cells communicate via signal transduction cascades, converting extracellular signals into coordinated intracellular responses.",
          keyPoints: ["GPCRs: ligand binds → G-protein activated → second messengers (cAMP, Ca²⁺)", "RTKs (receptor tyrosine kinases): autophosphorylation → RAS-MAPK cascade", "cAMP → PKA → phosphorylation of target proteins", "Ion channels: gated by ligand, voltage, or mechanical force"],
          xpReward: 30,
        },
        {
          type: "model3d", title: "3D Molecule — CO₂ (Cellular Respiration Product)",
          modelType: "molecule-co2", modelLabel: "CO₂ — waste product of mitochondrial aerobic respiration",
          xpReward: 25, proOnly: true,
        },
        { type: "quiz", title: "Advanced Quiz",
          questions: [{ q: "What is cAMP's role as a second messenger?", opts: ["Directly activates genes", "Activates PKA → phosphorylates targets", "Opens ion channels directly", "Hydrolyses ATP"], correct: 1, explain: "cAMP activates Protein Kinase A (PKA), which phosphorylates serine/threonine residues, altering protein activity." }],
          xpReward: 60,
        },
      ],
    },
  },

  chemistry: {
    "Chemical Bonding": {
      Beginner: [
        { type: "concept", title: "Chemical Bonding",
          definition: "Atoms form bonds to achieve a stable electron configuration — usually a full outer shell (8 electrons for most elements).",
          keyPoints: ["Ionic: electron TRANSFER (metal→non-metal) → ions held by electrostatic force", "Covalent: electron SHARING (non-metal + non-metal)", "Metallic: delocalised electrons in a 'sea' of cations", "Bond polarity arises from electronegativity differences"],
          xpReward: 25,
        },
        {
          type: "model3d", title: "3D: Water Molecule — Polar Covalent Bond",
          modelType: "molecule-h2o", modelLabel: "H₂O — bent shape (104.5°), polar molecule, 2 lone pairs on O",
          xpReward: 30, proOnly: true,
        },
        {
          type: "image",
          title: "Ionic vs Covalent Bonding",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/NaCl_polyhedra.svg/400px-NaCl_polyhedra.svg.png",
          imageAlt: "NaCl ionic crystal lattice structure",
          imageCaption: "NaCl crystal lattice — Na⁺ and Cl⁻ ions arranged in a face-centred cubic structure. Each ion is surrounded by 6 oppositely charged neighbours.",
          xpReward: 15,
        },
        {
          type: "real_life", title: "Real-Life: Why Salt Dissolves in Water",
          scenario: "Sodium chloride (NaCl) dissolves readily in water but not in petrol. Wax dissolves in petrol but not water.",
          scenarioImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Solvation.svg/400px-Solvation.svg.png",
          scenarioImageAlt: "Diagram of NaCl ions surrounded by water molecules",
          problemStatement: "Explain why NaCl dissolves in water but not petrol, using bonding principles.",
          solution: "'Like dissolves like' principle:\n• NaCl is ionic (charged ions)\n• Water is polar (δ+ H and δ- O)\n• Water molecules surround Na⁺ and Cl⁻ ions, stabilising them in solution (hydration energy > lattice energy)\n• Petrol is non-polar (C-H bonds, ΔEN ≈ 0)\n• Non-polar solvent cannot stabilise ions → NaCl doesn't dissolve\n• Wax (non-polar) dissolves in petrol (non-polar) — matching polarity",
          xpReward: 30, proOnly: true,
        },
        {
          type: "video", title: "Video: Chemical Bonding",
          videoId: "QXT4WDWK9tU", videoCaption: "Khan Academy — Ionic and covalent bonding: how and why atoms bond.",
          xpReward: 20, proOnly: true,
        },
        { type: "quiz", title: "Quiz — Bonding",
          questions: [
            { q: "NaCl contains what type of bonding?", opts: ["Covalent", "Ionic", "Metallic", "Hydrogen"], correct: 1, explain: "Na (metal) transfers an electron to Cl (non-metal) forming Na⁺ and Cl⁻ — ionic bonding." },
            { q: "Which type of bond involves electron sharing?", opts: ["Ionic", "Metallic", "Covalent", "Van der Waals"], correct: 2, explain: "Covalent bonds: shared electron pairs between non-metal atoms." },
            { q: "What property do metallic bonds give to metals?", opts: ["Brittleness", "Electrical conductivity", "Insulation", "Transparency"], correct: 1, explain: "Delocalised electrons in metallic bonds can move freely → metals conduct electricity." },
          ],
          xpReward: 45,
        },
      ],
      Intermediate: [
        { type: "concept", title: "VSEPR Theory & Molecular Geometry",
          definition: "Electron pair repulsion determines molecular shape — bonding and lone pairs arrange to minimise repulsion.",
          keyPoints: ["2 bonding pairs: linear (180°) e.g. CO₂", "3 BP: trigonal planar (120°) e.g. BF₃", "4 BP: tetrahedral (109.5°) e.g. CH₄", "4 BP, 1 lone pair: trigonal pyramidal (107°) e.g. NH₃", "4 BP, 2 lone pairs: bent (104.5°) e.g. H₂O"],
          xpReward: 30,
        },
        {
          type: "model3d", title: "3D: CO₂ — Linear Molecule",
          modelType: "molecule-co2", modelLabel: "CO₂ — linear, 180°, non-polar despite polar bonds",
          xpReward: 30, proOnly: true,
        },
        {
          type: "model3d", title: "3D: CH₄ — Tetrahedral Molecule",
          modelType: "molecule-ch4", modelLabel: "Methane — tetrahedral, 109.5°, sp³ hybridised carbon",
          xpReward: 25, proOnly: true,
        },
        { type: "real_life", title: "Problem: Why Is CO₂ Non-Polar?",
          scenario: "CO₂ has polar C=O bonds (ΔEN = 0.89) yet is classified as a non-polar molecule.",
          scenarioImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Carbon-dioxide-2D-dimensions.svg/400px-Carbon-dioxide-2D-dimensions.svg.png",
          scenarioImageAlt: "CO₂ linear molecular structure with bond angles",
          problemStatement: "Explain why CO₂ is non-polar despite having two polar bonds.",
          solution: "Each C=O bond has a dipole moment pointing toward O (more electronegative).\nBut CO₂ is linear (VSEPR: 2 BP, 0 LP → 180°)\nThe two equal and opposite dipoles cancel:\n→ ← cancels ← →\nNet dipole moment = 0 → non-polar molecule\nComparison: H₂O is bent (104.5°) → dipoles DON'T cancel → polar molecule. This is why CO₂ (non-polar) doesn't dissolve well in water, while SO₂ (bent, polar) does.",
          xpReward: 30, proOnly: true,
        },
        { type: "quiz", title: "Quiz",
          questions: [{ q: "Why is CO₂ non-polar despite polar C=O bonds?", opts: ["Bonds aren't really polar", "Linear shape: dipoles cancel", "Oxygen not electronegative", "Molecule is too small"], correct: 1, explain: "Linear CO₂: two C=O dipoles point opposite directions and perfectly cancel → net dipole = 0." }],
          xpReward: 50,
        },
      ],
      Advanced: [
        { type: "concept", title: "Molecular Orbital Theory",
          definition: "MO theory describes bonding using molecular orbitals formed by linear combination of atomic orbitals (LCAO).",
          keyPoints: ["Bonding MO: lower energy than AOs (stable)", "Antibonding MO (σ*, π*): higher energy, weakens bond", "Bond order = (bonding e⁻ − antibonding e⁻) / 2", "O₂: bond order 2, paramagnetic (2 unpaired e⁻ in π*)"],
          xpReward: 30,
        },
        { type: "model3d", title: "3D: Methane — sp³ Hybridisation", modelType: "molecule-ch4", modelLabel: "CH₄ — four sp³ orbitals at 109.5°", xpReward: 25, proOnly: true },
        { type: "quiz", title: "Advanced Quiz",
          questions: [{ q: "Bond order of N₂ (14 electrons)?", opts: ["1", "2", "3", "4"], correct: 2, explain: "N₂ MO: σ1s², σ*1s², σ2s², σ*2s², π2p⁴, σ2p². Bond order = (8-2)/2 = 3 (triple bond)." }],
          xpReward: 60,
        },
      ],
    },
  },

  math: {
    "Differentiation & Calculus": {
      Beginner: [
        { type: "concept", title: "Introduction to Differentiation",
          definition: "Differentiation finds the instantaneous rate of change of a function — geometrically, the slope of the tangent line at any point.",
          keyPoints: ["dy/dx = derivative of y with respect to x", "Geometrically: slope of tangent at a point", "Power Rule: d/dx(xⁿ) = nxⁿ⁻¹", "d/dx(constant) = 0"],
          xpReward: 25,
        },
        {
          type: "image",
          title: "Tangent Line — Geometric Meaning of Derivative",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Tangent_to_a_curve.svg/400px-Tangent_to_a_curve.svg.png",
          imageAlt: "Graph showing tangent line touching a curve at a single point",
          imageCaption: "The derivative f'(x) at a point equals the slope of the tangent line. As Δx→0, the secant line approaches the tangent — this is the limit definition of the derivative.",
          xpReward: 15,
        },
        { type: "notes", title: "Core Differentiation Rules",
          sections: [
            { heading: "Power Rule", content: "d/dx(xⁿ) = nxⁿ⁻¹\nExamples:\nd/dx(x³) = 3x²\nd/dx(x⁻²) = −2x⁻³\nd/dx(√x) = d/dx(x^½) = ½x^(−½)" },
            { heading: "Sum/Difference Rule", content: "d/dx(f ± g) = f' ± g'\nE.g. d/dx(3x² + 5x − 7) = 6x + 5" },
            { heading: "Trig & Exponential", content: "d/dx(sin x) = cos x\nd/dx(cos x) = −sin x\nd/dx(eˣ) = eˣ\nd/dx(ln x) = 1/x\nd/dx(aˣ) = aˣ ln a" },
          ],
          formulas: ["d/dx(xⁿ) = nxⁿ⁻¹", "d/dx(eˣ) = eˣ", "d/dx(sin x) = cos x", "d/dx(ln x) = 1/x"],
          xpReward: 25,
        },
        {
          type: "real_life", title: "Real-Life: Optimising a Box",
          scenario: "A manufacturer wants to make an open-top box from a 12×12 cm sheet by cutting equal squares from each corner.",
          scenarioImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Extreme_points_of_a_function.svg/400px-Extreme_points_of_a_function.svg.png",
          scenarioImageAlt: "Graph showing maximum and minimum points of a function",
          problemStatement: "What size squares should be cut to maximise the volume of the box?",
          solution: "Let x = side of cut square.\nBox dimensions: (12−2x) × (12−2x) × x\nV(x) = x(12−2x)² = x(144 − 48x + 4x²) = 144x − 48x² + 4x³\nV'(x) = 144 − 96x + 12x² = 12(x² − 8x + 12) = 12(x−2)(x−6)\nV'(x) = 0 → x = 2 or x = 6 (reject: 2×6=12, box collapses)\nx = 2 cm: V = 2 × (12−4)² = 2 × 64 = 128 cm³ (maximum)\nConfirm: V''(x) = −96 + 24x; V''(2) = −48 < 0 ✓ (maximum)",
          xpReward: 35, proOnly: true,
        },
        {
          type: "video", title: "Video: Introduction to Derivatives",
          videoId: "WUvTyaaNkzM", videoCaption: "3Blue1Brown — The Essence of Calculus: What is a derivative and why does it matter?",
          xpReward: 20, proOnly: true,
        },
        { type: "quiz", title: "Quiz — Differentiation",
          questions: [
            { q: "Differentiate f(x) = 4x³ − 2x + 7", opts: ["12x² − 2", "4x² − 2x", "12x³ − 2", "4x² + 7"], correct: 0, explain: "d/dx(4x³)=12x², d/dx(−2x)=−2, d/dx(7)=0. f'(x) = 12x² − 2" },
            { q: "What does f'(x) = 0 indicate?", opts: ["A zero", "A stationary point", "Function undefined", "Function constant"], correct: 1, explain: "f'(x) = 0 means zero gradient — a stationary point (max, min, or inflection)." },
            { q: "Differentiate y = sin(x²) using chain rule", opts: ["cos(x²)", "2x·cos(x²)", "2cos(x)", "x·cos(x²)"], correct: 1, explain: "Chain rule: outer = sin(u), u = x². dy/dx = cos(u)·2x = 2x·cos(x²)" },
          ],
          xpReward: 45,
        },
      ],
      Intermediate: [
        { type: "concept", title: "Chain, Product & Quotient Rules",
          definition: "Advanced differentiation rules extend to composite, product, and quotient functions.",
          keyPoints: ["Chain Rule: d/dx[f(g(x))] = f'(g(x))·g'(x)", "Product Rule: (uv)' = u'v + uv'", "Quotient Rule: (u/v)' = (u'v − uv') / v²", "Implicit differentiation: differentiate both sides, collect dy/dx"],
          xpReward: 30,
        },
        {
          type: "image",
          title: "Stationary Points — Maximum, Minimum, Inflection",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Extreme_points_of_a_function.svg/500px-Extreme_points_of_a_function.svg.png",
          imageAlt: "Function curve showing local maximum, minimum and inflection point",
          imageCaption: "Stationary points where f'(x)=0: local maximum (f''<0), local minimum (f''>0), point of inflection (f''=0, check sign change).",
          xpReward: 15,
        },
        { type: "real_life", title: "Problem: Profit Maximisation",
          scenario: "A company's profit function is P(x) = −2x³ + 30x² − 100x + 50 where x is units sold (thousands).",
          scenarioImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Profit_maximization.svg/400px-Profit_maximization.svg.png",
          scenarioImageAlt: "Revenue, cost and profit curves showing maximisation point",
          problemStatement: "Find the number of units that maximises profit.",
          solution: "P'(x) = −6x² + 60x − 100\nSet P'(x) = 0: −6x² + 60x − 100 = 0\nx² − 10x + 50/3 = 0\nUsing quadratic formula: x = (10 ± √(100 − 200/3))/2 = (10 ± √(100/3))/2\nx ≈ 2.11 or x ≈ 7.89\nP''(x) = −12x + 60\nP''(2.11) = 34.7 > 0 → minimum\nP''(7.89) = −34.7 < 0 → maximum ✓\nMaximum profit at x ≈ 7,890 units sold.",
          xpReward: 35, proOnly: true,
        },
        {
          type: "video", title: "Video: Chain Rule & Applications",
          videoId: "HaHsqDjWMLU", videoCaption: "3Blue1Brown — Visualising the chain rule and its geometric meaning.",
          xpReward: 20, proOnly: true,
        },
        { type: "quiz", title: "Quiz",
          questions: [{ q: "Differentiate y = sin(3x²)", opts: ["cos(3x²)", "6x·cos(3x²)", "3cos(3x²)", "6x·cos(x)"], correct: 1, explain: "Chain rule: d/dx[sin(3x²)] = cos(3x²)·6x" }],
          xpReward: 50,
        },
      ],
      Advanced: [
        { type: "concept", title: "Calculus — Taylor Series & Multivariable",
          definition: "Advanced calculus extends to series approximations, L'Hôpital's rule, and functions of multiple variables.",
          keyPoints: ["Taylor Series: f(x) = Σ f⁽ⁿ⁾(a)/n! · (x−a)ⁿ", "L'Hôpital: lim f(x)/g(x) = lim f'(x)/g'(x) for 0/0 or ∞/∞", "Partial derivatives: ∂f/∂x treats other variables as constants", "Gradient: ∇f = (∂f/∂x, ∂f/∂y) points toward steepest ascent"],
          xpReward: 30,
        },
        { type: "quiz", title: "Advanced Quiz",
          questions: [{ q: "Evaluate lim(x→0) sin(x)/x", opts: ["0", "∞", "1", "π"], correct: 2, explain: "L'Hôpital (0/0 form): lim cos(x)/1 = cos(0) = 1. Or use Taylor: sin(x) ≈ x − x³/6 → sin(x)/x ≈ 1." }],
          xpReward: 60,
        },
      ],
    },
  },

  history: {
    "World War I — Causes & Impact": {
      Beginner: [
        { type: "concept", title: "World War I — Key Facts",
          definition: "World War I (1914–1918) was a global conflict triggered by the assassination of Archduke Franz Ferdinand but rooted in deep European tensions.",
          keyPoints: ["Immediate trigger: assassination of Archduke Franz Ferdinand (28 June 1914)", "MAIN causes: Militarism, Alliances, Imperialism, Nationalism", "Allied Powers: UK, France, Russia, USA. Central Powers: Germany, Austria-Hungary, Ottoman Empire", "~20 million deaths; reshaped the map of Europe forever"],
          xpReward: 25,
        },
        {
          type: "image",
          title: "Europe in 1914 — Alliance Map",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Map_Europe_alliances_1914-en.svg/600px-Map_Europe_alliances_1914-en.svg.png",
          imageAlt: "Map of Europe in 1914 showing the Triple Alliance and Triple Entente",
          imageCaption: "Europe in 1914: the Triple Alliance (Germany, Austria-Hungary, Italy) in red/orange vs Triple Entente (France, Russia, Britain) in blue. One assassination triggered the entire alliance system.",
          xpReward: 15,
        },
        { type: "notes", title: "The MAIN Causes",
          sections: [
            { heading: "M — Militarism", content: "European powers massively expanded armies and navies. Anglo-German naval arms race. Schlieffen Plan made German mobilisation automatic and aggressive." },
            { heading: "A — Alliances", content: "Two armed camps: Triple Alliance vs Triple Entente. A local conflict automatically pulled in all major powers — like a chain reaction." },
            { heading: "I — Imperialism", content: "Competition for African/Asian colonies created rivalries. Moroccan crises (1905, 1911) nearly caused war. Economic competition heightened tensions." },
            { heading: "N — Nationalism", content: "Pan-Slavism threatened Austria-Hungary. Serbian nationalism (Gavrilo Princip, Black Hand). Ethnic groups sought self-determination from multi-ethnic empires." },
          ],
          formulas: [],
          xpReward: 25,
        },
        {
          type: "real_life", title: "Real-Life: The July Crisis (Timeline)",
          scenario: "28 June 1914 to 4 August 1914 — 37 days from assassination to world war.",
          scenarioImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Assassination_of_Franz_Ferdinand_illustration.jpg/400px-Assassination_of_Franz_Ferdinand_illustration.jpg",
          scenarioImageAlt: "Illustration of the assassination of Archduke Franz Ferdinand",
          problemStatement: "How did a regional assassination escalate into a world war in just 37 days?",
          solution: "28 June: Franz Ferdinand assassinated in Sarajevo by Gavrilo Princip\n28 July: Austria-Hungary declares war on Serbia (with German 'blank cheque' guarantee)\n30 July: Russia mobilises in support of Serbia (Pan-Slavism)\n1 Aug: Germany declares war on Russia\n3 Aug: Germany declares war on France, invades neutral Belgium (Schlieffen Plan)\n4 Aug: Britain declares war on Germany (violated Belgian neutrality)\n\nKey factor: The alliance system turned a local conflict into a continental war within weeks. Mobilisation schedules were nearly impossible to reverse once started.",
          xpReward: 30, proOnly: true,
        },
        {
          type: "video", title: "Video: WWI in a Nutshell",
          videoId: "dHSQAEam2yc", videoCaption: "Oversimplified — World War I explained: causes, events, and consequences.",
          xpReward: 20, proOnly: true,
        },
        { type: "quiz", title: "Quiz — WWI",
          questions: [
            { q: "What was the immediate trigger of WWI?", opts: ["Germany invading France", "Assassination of Archduke Franz Ferdinand", "Sinking of the Lusitania", "Russia mobilising"], correct: 1, explain: "Franz Ferdinand assassinated in Sarajevo, 28 June 1914, by Gavrilo Princip." },
            { q: "What does 'A' in MAIN stand for?", opts: ["Austria", "Arms race", "Alliances", "Assassination"], correct: 2, explain: "MAIN = Militarism, Alliances, Imperialism, Nationalism." },
          ],
          xpReward: 40,
        },
      ],
      Intermediate: [
        { type: "concept", title: "WWI — War, Society & Legacy",
          definition: "WWI was the first 'total war' — entire national economies and populations mobilised. Its aftermath directly caused WWII.",
          keyPoints: ["Trench warfare: stalemate 1914–1918 on Western Front", "Total war: propaganda, rationing, women in workforce", "Treaty of Versailles (1919): war guilt, reparations £6.6bn, territory loss", "New map: Ottoman, Austro-Hungarian, Russian, German empires dissolved", "League of Nations founded — precursor to UN"],
          xpReward: 30,
        },
        {
          type: "image",
          title: "Western Front Trenches",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Cheshire_Regiment_trench_Somme_1916.jpg/400px-Cheshire_Regiment_trench_Somme_1916.jpg",
          imageAlt: "British soldiers in Western Front trenches, Somme 1916",
          imageCaption: "British soldiers in a trench on the Somme, 1916. The Battle of the Somme cost 57,470 British casualties on its first day alone — the bloodiest day in British military history.",
          xpReward: 15,
        },
        { type: "quiz", title: "Quiz — Analysis",
          questions: [{ q: "Which clause of Versailles blamed Germany for the war?", opts: ["Article 1", "Article 231 (War Guilt)", "Article 14", "Article 99"], correct: 1, explain: "Article 231 forced Germany to accept sole responsibility — used to justify £6.6 billion in reparations." }],
          xpReward: 50,
        },
      ],
      Advanced: [
        { type: "concept", title: "Historiography of WWI",
          definition: "Historians debate whether WWI was inevitable, accidental, or deliberately caused.",
          keyPoints: ["Fischer (1961): Germany's calculated bid for world power — war was planned", "AJP Taylor: mobilisation schedules made war automatic, not intentional", "Revisionism: all powers share responsibility, not just Germany", "Christopher Clark ('Sleepwalkers'): leaders stumbled into war without fully understanding the consequences"],
          xpReward: 30,
        },
        { type: "quiz", title: "Advanced Quiz",
          questions: [{ q: "Which historian argued Germany deliberately planned WWI as a bid for world power?", opts: ["AJP Taylor", "Fritz Fischer", "John Keegan", "Christopher Clark"], correct: 1, explain: "Fischer's 1961 'Germany's Aims in the First World War' argued Germany's leaders deliberately sought a European war for hegemony." }],
          xpReward: 60,
        },
      ],
    },
  },

  cs: {
    "Algorithms & Complexity": {
      Beginner: [
        { type: "concept", title: "Algorithms & Big-O Notation",
          definition: "An algorithm is a step-by-step procedure to solve a problem. Big-O describes how runtime grows as input size n increases.",
          keyPoints: ["O(1): constant time", "O(n): linear — proportional to input", "O(n²): quadratic — nested loops", "O(log n): logarithmic — halving each step (binary search)", "Focus on dominant term: O(n² + n) = O(n²)"],
          xpReward: 25,
        },
        {
          type: "image",
          title: "Big-O Complexity Graph",
          imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Comparison_computational_complexity.svg/600px-Comparison_computational_complexity.svg.png",
          imageAlt: "Graph comparing O(1), O(log n), O(n), O(n log n), O(n²) growth rates",
          imageCaption: "Comparison of algorithm complexity classes. O(n²) algorithms become unusable at large n, while O(log n) algorithms remain fast even for billions of elements.",
          xpReward: 15,
        },
        { type: "notes", title: "Common Algorithm Complexities",
          sections: [
            { heading: "Searching", content: "Linear search: O(n) — checks each element\nBinary search: O(log n) — requires sorted input, halves search space each step\nHash lookup: O(1) average" },
            { heading: "Sorting", content: "Bubble/Insertion sort: O(n²) — too slow for large n\nMerge sort/Quicksort: O(n log n) — much better\nCounting sort: O(n+k) — best for integers in small range" },
            { heading: "Data Structures", content: "Array access: O(1)\nLinked list search: O(n)\nBST search: O(log n) balanced\nHeap insertion: O(log n)" },
          ],
          formulas: ["Binary search: O(log n)", "Merge sort: O(n log n)", "Hash lookup: O(1) average"],
          xpReward: 25,
        },
        {
          type: "real_life", title: "Real-Life: Google Search — Why Speed Matters",
          scenario: "Google processes ~8.5 billion searches per day. The search index has trillions of web pages.",
          scenarioImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Google_logo.svg/400px-Google_logo.svg.png",
          scenarioImageAlt: "Google search interface",
          problemStatement: "If Google used linear search O(n) instead of their inverted index O(log n), what would be the time difference?",
          solution: "Assume index of n = 10 trillion (10¹³) pages.\nLinear search: O(n) → 10¹³ operations\nBinary/inverted index: O(log₂(10¹³)) ≈ 43 operations\n\nAt 10⁹ operations/second:\nLinear: 10¹³/10⁹ = 10,000 seconds ≈ 2.8 hours per search\nInverted index: 43/10⁹ ≈ 0.000000043 seconds = 43 nanoseconds\n\nThis is why algorithm choice is critical — the right data structure makes a trillion-item search instantaneous.",
          xpReward: 35, proOnly: true,
        },
        {
          type: "video", title: "Video: Algorithms and Big O",
          videoId: "47GRtdHOKMg", videoCaption: "CS Dojo — Introduction to Big O Notation: how to measure algorithm efficiency.",
          xpReward: 20, proOnly: true,
        },
        { type: "quiz", title: "Quiz — Algorithms",
          questions: [
            { q: "Time complexity of binary search?", opts: ["O(n)", "O(n²)", "O(log n)", "O(1)"], correct: 2, explain: "Binary search halves remaining elements each step → log₂(n) steps." },
            { q: "Which sorting algorithm achieves O(n log n)?", opts: ["Bubble sort", "Selection sort", "Insertion sort", "Merge sort"], correct: 3, explain: "Merge sort: divide (log n levels) × merge (n operations per level) = O(n log n)." },
          ],
          xpReward: 40,
        },
      ],
      Intermediate: [
        { type: "concept", title: "Algorithm Design Paradigms",
          definition: "Different problem types call for different algorithmic strategies.",
          keyPoints: ["Greedy: locally optimal choice at each step (Dijkstra, Huffman)", "Divide & Conquer: split, solve recursively, combine (merge sort, FFT)", "Dynamic Programming: cache overlapping subproblems (Fibonacci, Bellman-Ford)", "Backtracking: explore all options, prune invalid paths (N-Queens, Sudoku)"],
          xpReward: 30,
        },
        { type: "real_life", title: "Problem: Shortest Path Navigation",
          scenario: "Google Maps needs to find the shortest route between two cities in a road network with millions of intersections.",
          scenarioImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Dijkstra_Animation.gif/240px-Dijkstra_Animation.gif",
          scenarioImageAlt: "Dijkstra's algorithm animation showing shortest path discovery",
          problemStatement: "Why is Dijkstra's greedy algorithm correct for finding shortest paths with non-negative weights?",
          solution: "Greedy property: once a node is marked 'visited' (with minimum distance), that distance is final.\nProof: If a shorter path existed through unvisited nodes, we would have visited those nodes first (since we always pick minimum distance next).\nComplexity: O((V+E) log V) with a priority queue\nReal usage: A* (Dijkstra + heuristic) used in actual navigation — estimates remaining distance to prioritise promising directions, achieving O(b^d) where b=branching factor, d=depth.",
          xpReward: 30, proOnly: true,
        },
        { type: "quiz", title: "Quiz",
          questions: [{ q: "Dynamic programming is best for problems with:", opts: ["One optimal solution", "Overlapping subproblems + optimal substructure", "No recursion", "Linear data only"], correct: 1, explain: "DP stores solutions to overlapping subproblems to avoid recomputation. Optimal substructure: optimal solution contains optimal sub-solutions." }],
          xpReward: 50,
        },
      ],
      Advanced: [
        { type: "concept", title: "P vs NP — Complexity Theory",
          definition: "Complexity theory classifies problems by computational resources required.",
          keyPoints: ["P: solvable in polynomial time deterministically", "NP: solutions verifiable in polynomial time", "NP-Complete: hardest in NP (SAT, TSP, Knapsack)", "P=NP?: $1M Millennium Prize unsolved problem", "Reduction: proving hardness via polynomial transformation"],
          xpReward: 30,
        },
        { type: "quiz", title: "Advanced Quiz",
          questions: [{ q: "Which is NP-Complete?", opts: ["Binary search", "Merge sort", "Travelling Salesman Problem (decision)", "BFS"], correct: 2, explain: "TSP (decision version: 'is there a route < k?') is NP-Complete. Binary search, merge sort, and BFS are in P." }],
          xpReward: 60,
        },
      ],
    },
  },
};

function buildFallback(subject: string, topic: string, level: string): LessonModule[] {
  return [
    {
      type: "concept",
      title: topic,
      definition: `${topic} is a key concept in ${subject} at the ${level} level. Understanding it deeply will build the foundation for advanced study in this subject.`,
      keyPoints: [
        `${topic} is foundational to ${subject}`,
        "Build understanding step-by-step — don't rush",
        "Connect new knowledge to what you already know",
        "Use worked examples and practice problems for best results",
      ],
      xpReward: 25,
    },
    {
      type: "quiz",
      title: `Quick Check — ${topic}`,
      questions: [
        {
          q: `Which best describes the importance of "${topic}" in ${subject}?`,
          opts: [
            "A minor topic with few applications",
            "A foundational concept with wide-ranging real-world applications",
            "Only relevant in advanced academic research",
            "A recently discovered and poorly understood phenomenon",
          ],
          correct: 1,
          explain: `${topic} underpins many other concepts in ${subject} and has real-world applications across science, technology, and everyday life.`,
        },
      ],
      xpReward: 30,
    },
  ];
}

export function getLessonModules(subject: string, topic: string, level: string, plan: string = "free"): LessonModule[] {
  const subjectLessons = LESSONS[subject.toLowerCase()];
  if (!subjectLessons) return buildFallback(subject, topic, level);
  const topicLessons = subjectLessons[topic];
  if (!topicLessons) return buildFallback(subject, topic, level);
  const levelLessons = topicLessons[level]
    || topicLessons["Intermediate"]
    || topicLessons["Beginner"]
    || Object.values(topicLessons)[0];
  if (!levelLessons || levelLessons.length === 0) return buildFallback(subject, topic, level);

  const isPro = plan === "pro" || plan === "elite";
  if (isPro) return levelLessons;
  // Free plan: filter out pro-only modules and limit simulations
  let simCount = 0;
  return levelLessons.filter(mod => {
    if (mod.proOnly) return false;
    if (mod.type === "simulation") { simCount++; return simCount <= 1; }
    if (mod.type === "model3d") return false;
    if (mod.type === "video") return false;
    return true;
  });
}
