import { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, Torus, MeshDistortMaterial, Text } from "@react-three/drei";
import * as THREE from "three";

// ─── Atom Model ────────────────────────────────────────────────────────────────

function Nucleus({ color = "#f87171", protons = 6, neutrons = 6 }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  useFrame((_, delta) => {
    meshRef.current.rotation.y += delta * 0.5;
  });
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.6, 32, 32]} />
      <MeshDistortMaterial color={color} distort={0.2} speed={2} roughness={0.3} />
    </mesh>
  );
}

function ElectronOrbit({ radius, speed, color, tilt = 0 }: { radius: number; speed: number; color: string; tilt?: number }) {
  const groupRef = useRef<THREE.Group>(null!);
  const electronRef = useRef<THREE.Mesh>(null!);
  const angle = useRef(Math.random() * Math.PI * 2);

  useFrame((_, delta) => {
    angle.current += delta * speed;
    if (electronRef.current) {
      electronRef.current.position.x = Math.cos(angle.current) * radius;
      electronRef.current.position.z = Math.sin(angle.current) * radius;
    }
  });

  return (
    <group ref={groupRef} rotation={[tilt, 0, 0]}>
      {/* Orbit ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.018, 8, 80]} />
        <meshBasicMaterial color={color} opacity={0.3} transparent />
      </mesh>
      {/* Electron */}
      <mesh ref={electronRef}>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
}

export function AtomViewer({ element = "Carbon", protons = 6, shells = [2, 4] }: { element?: string; protons?: number; shells?: number[] }) {
  const colors = ["#60a5fa", "#4ade80", "#facc15", "#f87171", "#c084fc"];

  return (
    <div className="w-full rounded-xl border border-border/40 overflow-hidden bg-[radial-gradient(ellipse_at_center,_rgba(10,20,60,1)_0%,_rgba(5,8,20,1)_100%)]" style={{ height: 300 }}>
      <Canvas camera={{ position: [0, 2, 5], fov: 45 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-5, -5, -5]} intensity={0.4} />
        <Nucleus color="#ef4444" protons={protons} neutrons={protons} />
        {shells.map((count, shellIdx) => (
          Array.from({ length: count }, (_, i) => (
            <ElectronOrbit
              key={`${shellIdx}-${i}`}
              radius={1.2 + shellIdx * 0.9}
              speed={2 - shellIdx * 0.5}
              color={colors[shellIdx % colors.length]}
              tilt={(i / count) * Math.PI - Math.PI / 2}
            />
          ))
        ))}
        <OrbitControls enablePan={false} minDistance={2} maxDistance={10} />
      </Canvas>
      <div className="px-3 py-2 border-t border-border/30 bg-background/40 backdrop-blur-sm text-xs text-muted-foreground flex gap-3">
        <span className="text-foreground font-medium">{element}</span>
        <span>Protons: {protons}</span>
        <span>Electrons: {shells.reduce((a, b) => a + b, 0)}</span>
        <span>Drag to rotate</span>
      </div>
    </div>
  );
}

// ─── Molecule / Crystal Model ─────────────────────────────────────────────────

function Bond({ from, to, color = "#94a3b8" }: { from: [number,number,number]; to: [number,number,number]; color?: string }) {
  const dir = new THREE.Vector3(...to).sub(new THREE.Vector3(...from));
  const len = dir.length();
  const pos = new THREE.Vector3(...from).add(dir.clone().multiplyScalar(0.5));
  const quaternion = new THREE.Quaternion();
  quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());

  return (
    <mesh position={[pos.x, pos.y, pos.z]} quaternion={quaternion}>
      <cylinderGeometry args={[0.06, 0.06, len, 8]} />
      <meshStandardMaterial color={color} opacity={0.6} transparent />
    </mesh>
  );
}

function RotatingGroup({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null!);
  useFrame((_, delta) => { ref.current.rotation.y += delta * 0.4; });
  return <group ref={ref}>{children}</group>;
}

export function MoleculeViewer({ molecule = "H₂O" }: { molecule?: string }) {
  // Simple predefined molecules
  const molecules: Record<string, { atoms: Array<{ pos: [number,number,number]; color: string; r: number; label: string }>; bonds: Array<[number,number]> }> = {
    "H₂O": {
      atoms: [
        { pos: [0, 0, 0], color: "#ef4444", r: 0.4, label: "O" },
        { pos: [-0.8, -0.6, 0], color: "#e0e0e0", r: 0.25, label: "H" },
        { pos: [0.8, -0.6, 0], color: "#e0e0e0", r: 0.25, label: "H" },
      ],
      bonds: [[0,1],[0,2]],
    },
    "CO₂": {
      atoms: [
        { pos: [-1.2, 0, 0], color: "#ef4444", r: 0.38, label: "O" },
        { pos: [0, 0, 0], color: "#4b5563", r: 0.35, label: "C" },
        { pos: [1.2, 0, 0], color: "#ef4444", r: 0.38, label: "O" },
      ],
      bonds: [[0,1],[1,2]],
    },
    "CH₄": {
      atoms: [
        { pos: [0, 0, 0], color: "#4b5563", r: 0.35, label: "C" },
        { pos: [0.6, 0.6, 0.6], color: "#e0e0e0", r: 0.22, label: "H" },
        { pos: [-0.6, -0.6, 0.6], color: "#e0e0e0", r: 0.22, label: "H" },
        { pos: [-0.6, 0.6, -0.6], color: "#e0e0e0", r: 0.22, label: "H" },
        { pos: [0.6, -0.6, -0.6], color: "#e0e0e0", r: 0.22, label: "H" },
      ],
      bonds: [[0,1],[0,2],[0,3],[0,4]],
    },
  };

  const data = molecules[molecule] || molecules["H₂O"];

  return (
    <div className="w-full rounded-xl border border-border/40 overflow-hidden bg-[radial-gradient(ellipse_at_center,_rgba(10,20,60,1)_0%,_rgba(5,8,20,1)_100%)]" style={{ height: 280 }}>
      <Canvas camera={{ position: [0, 1, 4], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={1.2} />
        <RotatingGroup>
          {data.atoms.map((a, i) => (
            <mesh key={i} position={a.pos}>
              <sphereGeometry args={[a.r, 32, 32]} />
              <meshStandardMaterial color={a.color} roughness={0.3} metalness={0.1} />
            </mesh>
          ))}
          {data.bonds.map(([a, b], i) => (
            <Bond key={i} from={data.atoms[a].pos} to={data.atoms[b].pos} />
          ))}
        </RotatingGroup>
        <OrbitControls enablePan={false} />
      </Canvas>
      <div className="px-3 py-1.5 border-t border-border/30 bg-background/40 text-xs text-muted-foreground flex gap-3">
        <span className="text-foreground font-medium">{molecule}</span>
        <span>{data.atoms.map(a => a.label).join("-")} structure</span>
        <span>Drag to rotate</span>
      </div>
    </div>
  );
}
