/**
 * Particle Network Background
 * Three.js when WebGL is available, pure CSS animation fallback otherwise.
 * Elegant floating nodes with connecting lines — Linear/Vercel-inspired.
 */
import { useRef, useMemo, Suspense, useEffect, useState, lazy } from "react";
import { motion } from "framer-motion";

// ─── WebGL capability detection ───────────────────────────────────────────────

function isWebGLSupported(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl")
    );
  } catch {
    return false;
  }
}

// ─── CSS Particle Fallback (no WebGL required) ────────────────────────────────

const CSS_PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  x: 5 + ((i * 73) % 90),
  y: 5 + ((i * 47) % 90),
  dx: ((i % 5) - 2) * 18,
  dy: ((i % 3) - 1) * 22,
  dur: 10 + (i % 7) * 2.5,
  delay: (i % 6) * 0.9,
  size: i % 3 === 0 ? 3 : 2,
  opacity: 0.25 + (i % 4) * 0.08,
}));

function CssParticleField() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {CSS_PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-blue-500"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
          }}
          animate={{
            x: [0, p.dx, -p.dx / 2, p.dx / 3, 0],
            y: [0, p.dy, -p.dy / 2, p.dy / 4, 0],
            opacity: [p.opacity, p.opacity * 1.6, p.opacity * 0.7, p.opacity],
          }}
          transition={{
            duration: p.dur,
            repeat: Infinity,
            ease: "easeInOut",
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
}

// ─── Three.js network (lazy-loaded, only when WebGL works) ───────────────────

const ThreeNetwork = lazy(() => import("./particle-field-three").then(m => ({ default: m.ThreeParticleField })));

// ─── Exported component ───────────────────────────────────────────────────────

export function ParticleField() {
  const [webgl, setWebgl] = useState<boolean | null>(null);

  useEffect(() => {
    setWebgl(isWebGLSupported());
  }, []);

  if (webgl === null) return null; // wait for client-side detection

  if (!webgl) return <CssParticleField />;

  return (
    <Suspense fallback={<CssParticleField />}>
      <ThreeNetwork />
    </Suspense>
  );
}
