import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Sphere, Torus, MeshDistortMaterial, Line } from "@react-three/drei";
import * as THREE from "three";

// ─── Animal Cell Viewer ────────────────────────────────────────────────────────

function CellMembrane() {
  const meshRef = useRef<THREE.Mesh>(null!);
  useFrame((_, d) => { meshRef.current.rotation.y += d * 0.05; });
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[2.8, 64, 64]} />
      <meshStandardMaterial color="#1a3a5c" transparent opacity={0.15} side={THREE.DoubleSide} roughness={0.8} />
    </mesh>
  );
}

function Nucleus() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const glowRef = useRef<THREE.Mesh>(null!);
  useFrame((t) => {
    const s = 1 + Math.sin(t.clock.elapsedTime * 0.8) * 0.02;
    meshRef.current.scale.setScalar(s);
    if (glowRef.current) glowRef.current.scale.setScalar(s * 1.08);
  });
  return (
    <group position={[-0.3, 0.1, 0]}>
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.85, 32, 32]} />
        <meshStandardMaterial color="#3b6fd4" transparent opacity={0.12} />
      </mesh>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.78, 32, 32]} />
        <MeshDistortMaterial color="#2563eb" distort={0.15} speed={1.5} roughness={0.4} transparent opacity={0.92} />
      </mesh>
      <mesh position={[0.15, 0.1, 0.2]}>
        <sphereGeometry args={[0.28, 16, 16]} />
        <meshStandardMaterial color="#1e40af" roughness={0.3} />
      </mesh>
    </group>
  );
}

function Mitochondrion({ position, rotation }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  useFrame((t) => {
    meshRef.current.rotation.z += 0.003;
  });
  return (
    <group position={position} rotation={rotation}>
      <mesh ref={meshRef} scale={[1, 0.42, 0.42]}>
        <sphereGeometry args={[0.38, 16, 16]} />
        <meshStandardMaterial color="#f97316" roughness={0.5} emissive="#7c2d00" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

function Ribosome({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.065, 8, 8]} />
      <meshStandardMaterial color="#fbbf24" emissive="#92400e" emissiveIntensity={0.5} />
    </mesh>
  );
}

function GolgiApparatus() {
  const groupRef = useRef<THREE.Group>(null!);
  useFrame((t) => { groupRef.current.rotation.z += 0.004; });
  return (
    <group ref={groupRef} position={[1.2, -0.5, 0.3]}>
      {[0, 0.13, 0.26, 0.38].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} scale={[1 - i * 0.08, 1, 0.12]}>
          <torusGeometry args={[0.28 + i * 0.04, 0.06, 8, 24]} />
          <meshStandardMaterial color="#a855f7" emissive="#4c1d95" emissiveIntensity={0.3} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

function LysosomeVacuole({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.22, 16, 16]} />
      <meshStandardMaterial color={color} transparent opacity={0.65} roughness={0.6} />
    </mesh>
  );
}

function CellLabel({ position, text, color }: { position: [number, number, number]; text: string; color: string }) {
  return (
    <Text position={position} fontSize={0.13} color={color} anchorX="center" anchorY="middle" depthOffset={-1}>
      {text}
    </Text>
  );
}

export function CellViewer({ interactive = true }: { interactive?: boolean }) {
  const [hovered, setHovered] = useState<string | null>(null);

  const ribosomes: [number, number, number][] = [
    [0.8, -0.8, 0.5], [-0.5, 1.2, 0.3], [1.4, 0.6, -0.2], [-1.1, -0.4, 0.7],
    [0.3, 0.9, -0.8], [1.6, -0.2, 0.4], [-1.3, 0.7, -0.3], [0.6, -1.3, -0.6],
    [-0.8, -1.1, 0.5], [1.0, 1.0, 0.6], [-1.5, 0.2, 0.2], [0.2, 1.5, -0.5],
  ];

  return (
    <div style={{ height: 360 }} className="rounded-2xl overflow-hidden border border-border/40 bg-[radial-gradient(ellipse_at_center,_#050d1a_0%,_#020508_100%)]">
      <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1 pointer-events-none">
        {[
          { color: "#2563eb", label: "Nucleus" },
          { color: "#f97316", label: "Mitochondria" },
          { color: "#a855f7", label: "Golgi" },
          { color: "#fbbf24", label: "Ribosomes" },
          { color: "#22d3ee", label: "Lysosome" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1 bg-black/40 border border-white/10 px-1.5 py-0.5 rounded-full text-[9px]">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
            <span className="text-white/70">{label}</span>
          </div>
        ))}
      </div>
      <Canvas camera={{ position: [0, 0, 5.5], fov: 52 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[4, 4, 4]} intensity={2} color="#4488ff" />
        <pointLight position={[-4, -4, 4]} intensity={1} color="#ff8844" />
        <pointLight position={[0, 0, -5]} intensity={0.5} color="#88aaff" />

        <CellMembrane />
        <Nucleus />
        <GolgiApparatus />

        <Mitochondrion position={[1.5, 0.8, 0.4]} rotation={[0.2, 0, 0.8]} />
        <Mitochondrion position={[-1.6, 0.5, 0.2]} rotation={[0, 0.3, -0.4]} />
        <Mitochondrion position={[0.6, -1.4, 0.5]} rotation={[0.5, 0, 0.3]} />
        <Mitochondrion position={[-0.8, -1.2, -0.3]} rotation={[-0.2, 0.5, 0.2]} />
        <Mitochondrion position={[1.8, -0.4, -0.5]} rotation={[0.1, 0, 1.2]} />

        {ribosomes.map((pos, i) => <Ribosome key={i} position={pos} />)}

        <LysosomeVacuole position={[-1.4, 1.2, 0.4]} color="#22d3ee" />
        <LysosomeVacuole position={[1.0, -0.9, -0.6]} color="#22d3ee" />
        <LysosomeVacuole position={[-0.5, -1.6, 0.2]} color="#7dd3fc" />

        <CellLabel position={[-0.3, 1.0, 0.8]} text="Nucleus" color="#93c5fd" />
        <CellLabel position={[1.5, 1.2, 0.4]} text="Mitochondria" color="#fb923c" />
        <CellLabel position={[1.7, -0.9, 0.3]} text="Golgi" color="#c084fc" />

        <OrbitControls autoRotate autoRotateSpeed={0.5} enablePan={false} minDistance={3} maxDistance={9} />
      </Canvas>
    </div>
  );
}

// ─── DNA Double Helix ──────────────────────────────────────────────────────────

const BASE_PAIRS_COUNT = 18;
const HELIX_RADIUS = 0.7;
const HELIX_PITCH = 0.42;

function DNABackbone({ strand }: { strand: 0 | 1 }) {
  const groupRef = useRef<THREE.Group>(null!);
  const sign = strand === 0 ? 1 : -1;

  const points = Array.from({ length: BASE_PAIRS_COUNT }, (_, i) => {
    const t = i / (BASE_PAIRS_COUNT - 1);
    const angle = t * Math.PI * 4 + (strand === 1 ? Math.PI : 0);
    const y = (i - BASE_PAIRS_COUNT / 2) * HELIX_PITCH;
    return new THREE.Vector3(Math.cos(angle) * HELIX_RADIUS, y, Math.sin(angle) * HELIX_RADIUS);
  });

  const color = strand === 0 ? "#3b82f6" : "#ef4444";

  return (
    <group ref={groupRef}>
      {points.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, p.z]}>
          <sphereGeometry args={[0.1, 10, 10]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} roughness={0.3} />
        </mesh>
      ))}
      {points.slice(0, -1).map((p, i) => {
        const next = points[i + 1];
        const mid = p.clone().add(next).multiplyScalar(0.5);
        const dir = next.clone().sub(p);
        const len = dir.length();
        const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
        return (
          <mesh key={`rod-${i}`} position={[mid.x, mid.y, mid.z]} quaternion={quat}>
            <cylinderGeometry args={[0.04, 0.04, len * 0.8, 6]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.25} transparent opacity={0.8} />
          </mesh>
        );
      })}
    </group>
  );
}

function BasePairs() {
  const BASE_COLORS: [string, string][] = [
    ["#22c55e", "#facc15"], // G-C
    ["#f97316", "#a855f7"], // A-T
  ];

  return (
    <>
      {Array.from({ length: BASE_PAIRS_COUNT }, (_, i) => {
        const t = i / (BASE_PAIRS_COUNT - 1);
        const angle0 = t * Math.PI * 4;
        const angle1 = angle0 + Math.PI;
        const y = (i - BASE_PAIRS_COUNT / 2) * HELIX_PITCH;
        const p0 = new THREE.Vector3(Math.cos(angle0) * HELIX_RADIUS, y, Math.sin(angle0) * HELIX_RADIUS);
        const p1 = new THREE.Vector3(Math.cos(angle1) * HELIX_RADIUS, y, Math.sin(angle1) * HELIX_RADIUS);
        const mid = p0.clone().add(p1).multiplyScalar(0.5);
        const dir = p1.clone().sub(p0);
        const len = dir.length();
        const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
        const [c0, c1] = BASE_COLORS[i % 2];

        return (
          <group key={i}>
            <mesh position={[mid.x, mid.y, mid.z]} quaternion={quat}>
              <cylinderGeometry args={[0.025, 0.025, len * 0.75, 6]} />
              <meshStandardMaterial color="#888" transparent opacity={0.4} />
            </mesh>
            <mesh position={[p0.x, p0.y, p0.z]}>
              <boxGeometry args={[0.12, 0.08, 0.12]} />
              <meshStandardMaterial color={c0} emissive={c0} emissiveIntensity={0.5} roughness={0.3} />
            </mesh>
            <mesh position={[p1.x, p1.y, p1.z]}>
              <boxGeometry args={[0.12, 0.08, 0.12]} />
              <meshStandardMaterial color={c1} emissive={c1} emissiveIntensity={0.5} roughness={0.3} />
            </mesh>
          </group>
        );
      })}
    </>
  );
}

function HelixGroup() {
  const groupRef = useRef<THREE.Group>(null!);
  useFrame((_, d) => { groupRef.current.rotation.y += d * 0.4; });
  return (
    <group ref={groupRef}>
      <DNABackbone strand={0} />
      <DNABackbone strand={1} />
      <BasePairs />
    </group>
  );
}

export function DNAHelixViewer() {
  return (
    <div style={{ height: 360 }} className="rounded-2xl overflow-hidden border border-border/40 bg-[radial-gradient(ellipse_at_center,_#04071a_0%,_#02030d_100%)]">
      <div className="absolute top-3 left-3 z-10 flex gap-2 pointer-events-none">
        {[{ c: "#3b82f6", l: "Sugar-phosphate backbone (5'→3')" }, { c: "#ef4444", l: "Complementary strand (3'→5')" }]
          .map(({ c, l }) => (
            <div key={l} className="flex items-center gap-1 bg-black/50 border border-white/10 px-2 py-0.5 rounded-full text-[9px]">
              <div className="w-2 h-2 rounded-full" style={{ background: c }} />
              <span className="text-white/70">{l}</span>
            </div>
          ))}
      </div>
      <div className="absolute bottom-3 left-3 z-10 flex gap-2 pointer-events-none">
        {[{ c: "#22c55e", l: "G-C (3 H-bonds)" }, { c: "#f97316", l: "A-T (2 H-bonds)" }]
          .map(({ c, l }) => (
            <div key={l} className="flex items-center gap-1 bg-black/50 border border-white/10 px-2 py-0.5 rounded-full text-[9px]">
              <div className="w-2 h-2 rounded" style={{ background: c }} />
              <span className="text-white/70">{l}</span>
            </div>
          ))}
      </div>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[3, 3, 3]} intensity={1.5} color="#4488ff" />
        <pointLight position={[-3, -3, 3]} intensity={1} color="#ff4488" />
        <HelixGroup />
        <OrbitControls autoRotate={false} enablePan={false} minDistance={3} maxDistance={8} />
      </Canvas>
    </div>
  );
}

// ─── Neuron Viewer ─────────────────────────────────────────────────────────────

function NeuronBody() {
  const meshRef = useRef<THREE.Mesh>(null!);
  useFrame((t) => {
    const pulse = 1 + Math.sin(t.clock.elapsedTime * 1.5) * 0.03;
    meshRef.current.scale.setScalar(pulse);
  });
  return (
    <mesh ref={meshRef} position={[-2.2, 0, 0]}>
      <sphereGeometry args={[0.55, 32, 32]} />
      <MeshDistortMaterial color="#7c3aed" distort={0.25} speed={2} roughness={0.3} emissive="#4c1d95" emissiveIntensity={0.4} />
    </mesh>
  );
}

function Dendrite({ start, end }: { start: [number, number, number]; end: [number, number, number] }) {
  const s = new THREE.Vector3(...start);
  const e = new THREE.Vector3(...end);
  const mid = s.clone().add(e).multiplyScalar(0.5);
  const dir = e.clone().sub(s);
  const len = dir.length();
  const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  return (
    <mesh position={[mid.x, mid.y, mid.z]} quaternion={quat}>
      <cylinderGeometry args={[0.055, 0.025, len, 8]} />
      <meshStandardMaterial color="#a78bfa" roughness={0.5} emissive="#4c1d95" emissiveIntensity={0.2} />
    </mesh>
  );
}

function MyelinSheath() {
  const segments = 8;
  return (
    <group>
      {Array.from({ length: segments }, (_, i) => {
        const x = -1.0 + i * 0.6;
        const isNode = i === 3;
        if (isNode) return null;
        return (
          <mesh key={i} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.16, 0.16, 0.5, 12]} />
            <meshStandardMaterial color="#fef08a" roughness={0.6} transparent opacity={0.75} emissive="#713f12" emissiveIntensity={0.2} />
          </mesh>
        );
      })}
    </group>
  );
}

function SignalPulse() {
  const meshRef = useRef<THREE.Mesh>(null!);
  useFrame((t) => {
    const x = ((t.clock.elapsedTime * 1.2) % 4.5) - 1.0;
    if (meshRef.current) meshRef.current.position.x = x;
  });
  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <sphereGeometry args={[0.14, 12, 12]} />
      <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={2} transparent opacity={0.9} />
    </mesh>
  );
}

function SynapticTerminals() {
  const positions: [number, number, number][] = [
    [3.4, 0.35, 0], [3.4, -0.35, 0], [3.4, 0, 0.3], [3.4, 0, -0.3],
  ];
  return (
    <>
      {positions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.12, 10, 10]} />
          <meshStandardMaterial color="#f472b6" emissive="#831843" emissiveIntensity={0.4} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[3.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.18, 0.35, 8]} />
        <meshStandardMaterial color="#ec4899" roughness={0.5} emissive="#831843" emissiveIntensity={0.3} />
      </mesh>
    </>
  );
}

export function NeuronViewer() {
  return (
    <div style={{ height: 360 }} className="rounded-2xl overflow-hidden border border-border/40 bg-[radial-gradient(ellipse_at_center,_#0a0416_0%,_#030108_100%)]">
      <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1 pointer-events-none">
        {[
          { color: "#7c3aed", label: "Cell Body (Soma)" },
          { color: "#a78bfa", label: "Dendrites" },
          { color: "#fef08a", label: "Myelin Sheath" },
          { color: "#22d3ee", label: "Action Potential" },
          { color: "#f472b6", label: "Synaptic Terminals" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1 bg-black/50 border border-white/10 px-1.5 py-0.5 rounded-full text-[9px]">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
            <span className="text-white/70">{label}</span>
          </div>
        ))}
      </div>
      <Canvas camera={{ position: [0, 1.5, 5.5], fov: 50 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[-4, 3, 3]} intensity={1.5} color="#7c3aed" />
        <pointLight position={[4, -2, 3]} intensity={1} color="#22d3ee" />

        <NeuronBody />

        {/* Dendrites from soma */}
        <Dendrite start={[-2.2, 0.55, 0]} end={[-2.8, 1.1, 0]} />
        <Dendrite start={[-2.8, 1.1, 0]} end={[-3.2, 1.5, 0.2]} />
        <Dendrite start={[-2.8, 1.1, 0]} end={[-3.3, 1.0, -0.2]} />
        <Dendrite start={[-2.2, 0.55, 0]} end={[-2.6, 1.2, 0.4]} />
        <Dendrite start={[-2.2, -0.55, 0]} end={[-2.9, -1.1, 0.1]} />
        <Dendrite start={[-2.9, -1.1, 0.1]} end={[-3.3, -1.6, 0]} />
        <Dendrite start={[-2.2, 0, -0.55]} end={[-2.8, 0, -1.1]} />
        <Dendrite start={[-2.8, 0, -1.1]} end={[-3.2, 0.3, -1.4]} />
        <Dendrite start={[-2.8, 0, -1.1]} end={[-3.2, -0.3, -1.3]} />

        {/* Axon hillock → axon */}
        <mesh position={[-1.6, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.13, 0.13, 0.5, 10]} />
          <meshStandardMaterial color="#8b5cf6" roughness={0.4} />
        </mesh>
        <mesh position={[1.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.1, 0.1, 4.8, 10]} />
          <meshStandardMaterial color="#6d28d9" roughness={0.4} />
        </mesh>

        <MyelinSheath />
        <SignalPulse />
        <SynapticTerminals />

        <OrbitControls autoRotate autoRotateSpeed={0.4} enablePan={false} minDistance={3} maxDistance={10} />
      </Canvas>
    </div>
  );
}

// ─── Mitochondria Viewer ───────────────────────────────────────────────────────

function CristaeRibbon({ y, radius, tilt }: { y: number; radius: number; tilt: number }) {
  return (
    <mesh position={[0, y, 0]} rotation={[tilt, 0, 0]}>
      <torusGeometry args={[radius, 0.04, 6, 20, Math.PI * 1.5]} />
      <meshStandardMaterial color="#fde68a" roughness={0.5} emissive="#92400e" emissiveIntensity={0.3} transparent opacity={0.8} />
    </mesh>
  );
}

function MitoRotatingGroup() {
  const groupRef = useRef<THREE.Group>(null!);
  useFrame((_, d) => { groupRef.current.rotation.y += d * 0.3; });
  return (
    <group ref={groupRef}>
      {/* Outer membrane */}
      <mesh scale={[1, 0.5, 0.5]}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshStandardMaterial color="#f97316" transparent opacity={0.2} side={THREE.DoubleSide} roughness={0.8} />
      </mesh>
      {/* Inner membrane */}
      <mesh scale={[1, 0.5, 0.5]}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshStandardMaterial color="#fb923c" transparent opacity={0.15} side={THREE.DoubleSide} roughness={0.8} />
      </mesh>
      {/* Matrix */}
      <mesh scale={[0.85, 0.4, 0.4]}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshStandardMaterial color="#fef3c7" transparent opacity={0.06} />
      </mesh>
      {/* Cristae */}
      <CristaeRibbon y={0.3} radius={0.5} tilt={0.4} />
      <CristaeRibbon y={0} radius={0.65} tilt={-0.3} />
      <CristaeRibbon y={-0.3} radius={0.5} tilt={0.5} />
      {/* ATP synthase dots */}
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.7, 0, Math.sin(a) * 0.35]}>
            <sphereGeometry args={[0.07, 6, 6]} />
            <meshStandardMaterial color="#4ade80" emissive="#166534" emissiveIntensity={0.6} />
          </mesh>
        );
      })}
    </group>
  );
}

export function MitochondriaViewer() {
  return (
    <div style={{ height: 320 }} className="rounded-2xl overflow-hidden border border-border/40 bg-[radial-gradient(ellipse_at_center,_#0d0800_0%,_#030201_100%)]">
      <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1 pointer-events-none">
        {[
          { color: "#f97316", label: "Outer Membrane" },
          { color: "#fbbf24", label: "Inner Membrane (Cristae)" },
          { color: "#4ade80", label: "ATP Synthase" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1 bg-black/50 border border-white/10 px-1.5 py-0.5 rounded-full text-[9px]">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
            <span className="text-white/70">{label}</span>
          </div>
        ))}
      </div>
      <Canvas camera={{ position: [0, 0.8, 3.5], fov: 48 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[3, 3, 3]} intensity={2} color="#f97316" />
        <pointLight position={[-3, -2, 3]} intensity={1} color="#fbbf24" />
        <MitoRotatingGroup />
        <OrbitControls autoRotate autoRotateSpeed={0.6} enablePan={false} minDistance={2} maxDistance={7} />
      </Canvas>
    </div>
  );
}

// ─── Heart Viewer ──────────────────────────────────────────────────────────────

function HeartBeat() {
  const groupRef = useRef<THREE.Group>(null!);
  useFrame((t) => {
    const beat = Math.max(0, Math.sin(t.clock.elapsedTime * 3) * 0.5 + 0.5);
    const s = 1 + beat * 0.08;
    groupRef.current.scale.setScalar(s);
  });
  return (
    <group ref={groupRef} rotation={[0, 0, Math.PI]}>
      {/* Left ventricle */}
      <mesh position={[-0.35, 0, 0]}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial color="#dc2626" roughness={0.5} emissive="#7f1d1d" emissiveIntensity={0.4} />
      </mesh>
      {/* Right ventricle */}
      <mesh position={[0.35, 0, 0]}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial color="#dc2626" roughness={0.5} emissive="#7f1d1d" emissiveIntensity={0.4} />
      </mesh>
      {/* Merge bottom */}
      <mesh position={[0, -0.5, 0]}>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshStandardMaterial color="#b91c1c" roughness={0.5} emissive="#7f1d1d" emissiveIntensity={0.4} />
      </mesh>
      {/* Aorta */}
      <mesh position={[-0.25, 0.7, 0]} rotation={[0, 0, 0.3]}>
        <cylinderGeometry args={[0.18, 0.22, 0.7, 16]} />
        <meshStandardMaterial color="#ef4444" roughness={0.4} emissive="#7f1d1d" emissiveIntensity={0.3} />
      </mesh>
      {/* Pulmonary artery */}
      <mesh position={[0.3, 0.65, 0]} rotation={[0, 0, -0.3]}>
        <cylinderGeometry args={[0.15, 0.18, 0.6, 16]} />
        <meshStandardMaterial color="#60a5fa" roughness={0.4} emissive="#1e3a8a" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

export function HeartViewer() {
  return (
    <div style={{ height: 320 }} className="rounded-2xl overflow-hidden border border-border/40 bg-[radial-gradient(ellipse_at_center,_#1a0505_0%,_#050101_100%)]">
      <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1 pointer-events-none">
        {[{ color: "#dc2626", label: "Ventricles" }, { color: "#ef4444", label: "Aorta (oxygenated)" }, { color: "#60a5fa", label: "Pulmonary (deoxygenated)" }]
          .map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1 bg-black/50 border border-white/10 px-1.5 py-0.5 rounded-full text-[9px]">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
              <span className="text-white/70">{label}</span>
            </div>
          ))}
      </div>
      <Canvas camera={{ position: [0, 0, 3.5], fov: 52 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[3, 3, 3]} intensity={2} color="#ff3333" />
        <pointLight position={[-3, -2, 3]} intensity={1} color="#ff8888" />
        <HeartBeat />
        <OrbitControls autoRotate autoRotateSpeed={0.6} enablePan={false} minDistance={2} maxDistance={7} />
      </Canvas>
    </div>
  );
}
