/**
 * Three.js particle network — only loaded when WebGL is confirmed available.
 */
import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const COUNT = 70;
const MAX_DIST = 2.8;
const MAX_LINES = COUNT * (COUNT - 1) / 2;

function Network() {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef  = useRef<THREE.LineSegments>(null);

  const { positions, velocities, linePositions } = useMemo(() => {
    const positions    = new Float32Array(COUNT * 3);
    const velocities   = new Float32Array(COUNT * 3);
    const linePositions = new Float32Array(MAX_LINES * 6);
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 22;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 13;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 3;
      velocities[i * 3]     = (Math.random() - 0.5) * 0.003;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.003;
    }
    return { positions, velocities, linePositions };
  }, []);

  const [pointsGeo, linesGeo] = useMemo(() => {
    const pg = new THREE.BufferGeometry();
    pg.setAttribute("position", new THREE.BufferAttribute(positions.slice(), 3));
    const lg = new THREE.BufferGeometry();
    lg.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
    lg.setDrawRange(0, 0);
    return [pg, lg];
  }, []);

  useFrame(() => {
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3]     += velocities[i * 3];
      positions[i * 3 + 1] += velocities[i * 3 + 1];
      if (Math.abs(positions[i * 3])     > 11) velocities[i * 3]     *= -1;
      if (Math.abs(positions[i * 3 + 1]) > 6.5) velocities[i * 3 + 1] *= -1;
    }
    let seg = 0;
    for (let i = 0; i < COUNT && seg < MAX_LINES; i++) {
      for (let j = i + 1; j < COUNT && seg < MAX_LINES; j++) {
        const dx = positions[i * 3] - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        if (dx * dx + dy * dy < MAX_DIST * MAX_DIST) {
          const b = seg * 6;
          linePositions[b]     = positions[i * 3];     linePositions[b + 1] = positions[i * 3 + 1]; linePositions[b + 2] = positions[i * 3 + 2];
          linePositions[b + 3] = positions[j * 3];     linePositions[b + 4] = positions[j * 3 + 1]; linePositions[b + 5] = positions[j * 3 + 2];
          seg++;
        }
      }
    }
    if (pointsRef.current) {
      const a = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
      (a.array as Float32Array).set(positions); a.needsUpdate = true;
    }
    if (linesRef.current) {
      const a = linesRef.current.geometry.attributes.position as THREE.BufferAttribute;
      (a.array as Float32Array).set(linePositions); a.needsUpdate = true;
      linesRef.current.geometry.setDrawRange(0, seg * 2);
    }
  });

  return (
    <>
      <points ref={pointsRef} geometry={pointsGeo}>
        <pointsMaterial color="#3b82f6" size={0.045} transparent opacity={0.5} sizeAttenuation />
      </points>
      <lineSegments ref={linesRef} geometry={linesGeo}>
        <lineBasicMaterial color="#3b82f6" transparent opacity={0.1} />
      </lineSegments>
    </>
  );
}

export function ThreeParticleField() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }} gl={{ antialias: false, alpha: true, powerPreference: "low-power" }} dpr={[1, 1.5]}>
        <Network />
      </Canvas>
    </div>
  );
}
