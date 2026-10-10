/**
 * Three.js floating gem — only loaded when WebGL is confirmed available.
 */
import { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

function Gem({ color = "#3b82f6" }: { color?: string }) {
  const outerRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const ringRef  = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (outerRef.current) {
      outerRef.current.rotation.y = t * 0.28;
      outerRef.current.rotation.x = Math.sin(t * 0.18) * 0.22;
      outerRef.current.position.y = Math.sin(t * 0.6) * 0.08;
    }
    if (innerRef.current) {
      innerRef.current.rotation.y = -t * 0.4;
      innerRef.current.rotation.z = t * 0.15;
    }
    if (ringRef.current) {
      ringRef.current.rotation.x = t * 0.22;
      ringRef.current.rotation.z = -t * 0.12;
    }
  });

  return (
    <>
      <mesh ref={outerRef}>
        <icosahedronGeometry args={[1.1, 1]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.35} />
      </mesh>
      <mesh ref={innerRef} scale={0.6}>
        <icosahedronGeometry args={[1, 2]} />
        <MeshDistortMaterial color={color} distort={0.3} speed={2} transparent opacity={0.18} roughness={0} metalness={0.8} />
      </mesh>
      <mesh ref={ringRef} rotation={[Math.PI / 2.5, 0, 0]}>
        <torusGeometry args={[1.6, 0.008, 8, 80]} />
        <meshBasicMaterial color={color} transparent opacity={0.22} />
      </mesh>
      <pointLight color={color} intensity={1.5} distance={4} />
      <ambientLight intensity={0.4} />
    </>
  );
}

export function ThreeGem({ size, color }: { size: number; color: string }) {
  return (
    <Canvas camera={{ position: [0, 0, 3.5], fov: 45 }} gl={{ antialias: true, alpha: true }} dpr={[1, 2]}>
      <Suspense fallback={null}>
        <Gem color={color} />
      </Suspense>
    </Canvas>
  );
}
