/**
 * Three.js Floating Geometric Model with CSS fallback.
 * Falls back to an animated CSS orb when WebGL is unavailable.
 */
import { useRef, Suspense, useEffect, useState, lazy } from "react";
import { motion } from "framer-motion";

function isWebGLSupported(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

// ─── CSS Fallback Orb ─────────────────────────────────────────────────────────

function CssOrb({ size, color }: { size: number; color: string }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Pulsing glow */}
      <motion.div
        className="absolute rounded-full"
        style={{ width: size * 0.9, height: size * 0.9, background: `radial-gradient(circle, ${color}30 0%, transparent 70%)` }}
        animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Rotating ring */}
      <motion.div
        className="absolute rounded-full border"
        style={{ width: size * 0.85, height: size * 0.85, borderColor: `${color}40` }}
        animate={{ rotate: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute rounded-full border"
        style={{ width: size * 0.65, height: size * 0.65, borderColor: `${color}30` }}
        animate={{ rotate: -360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />
      {/* Falcoa logo */}
      <motion.img
        src="/falcoa-logo.png"
        alt="Falcoa"
        className="relative z-10 object-contain"
        style={{ width: size * 0.42, height: size * 0.42 }}
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

// ─── Three.js version (lazy) ──────────────────────────────────────────────────

const ThreeGem = lazy(() => import("./floating-gem-three").then(m => ({ default: m.ThreeGem })));

interface FloatingGemProps {
  size?: number;
  color?: string;
  className?: string;
}

export function FloatingGem({ size = 140, color = "#3b82f6", className = "" }: FloatingGemProps) {
  const [webgl, setWebgl] = useState<boolean | null>(null);

  useEffect(() => {
    setWebgl(isWebGLSupported());
  }, []);

  if (webgl === null) return <div style={{ width: size, height: size }} className={className} />;

  if (!webgl) return <CssOrb size={size} color={color} />;

  return (
    <div className={className} style={{ width: size, height: size }}>
      <Suspense fallback={<CssOrb size={size} color={color} />}>
        <ThreeGem size={size} color={color} />
      </Suspense>
    </div>
  );
}
