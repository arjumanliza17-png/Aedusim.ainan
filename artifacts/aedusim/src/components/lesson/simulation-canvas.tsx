import { useRef, useEffect, useState, useCallback } from "react";

// ─── Thermodynamics Particle Simulation ──────────────────────────────────────

export function ThermodynamicsSim() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [temperature, setTemperature] = useState(40);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; r: number; hue: number }>>([]);
  const tempRef = useRef(temperature);
  tempRef.current = temperature;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = 260;
    const WALL = 10;

    // Init particles
    if (particlesRef.current.length === 0) {
      for (let i = 0; i < 40; i++) {
        const r = 5 + Math.random() * 3;
        particlesRef.current.push({
          x: WALL + r + Math.random() * (W - 2 * WALL - 2 * r),
          y: WALL + r + Math.random() * (H - 2 * WALL - 2 * r),
          vx: (Math.random() - 0.5) * 3,
          vy: (Math.random() - 0.5) * 3,
          r,
          hue: Math.random() * 60,
        });
      }
    }

    function draw() {
      const t = tempRef.current / 100;
      const speedMult = 0.2 + t * 4.5;

      ctx.fillStyle = "rgba(10,15,30,0.35)";
      ctx.fillRect(0, 0, W, H);

      // Draw walls
      ctx.strokeStyle = "rgba(100,150,255,0.3)";
      ctx.lineWidth = 2;
      ctx.strokeRect(WALL, WALL, W - 2 * WALL, H - 2 * WALL);

      // Draw temperature label
      ctx.fillStyle = `hsl(${200 + t * 30}, 90%, 65%)`;
      ctx.font = "bold 11px sans-serif";
      ctx.fillText(`T = ${Math.round(tempRef.current * 3.73 + 20)} K`, 14, H - 14);

      // Update + draw particles
      for (const p of particlesRef.current) {
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        const targetSpeed = speedMult * (0.8 + p.r / 8);
        const scale = targetSpeed / (speed || 1);
        p.vx = p.vx * 0.95 + (p.vx * scale) * 0.05;
        p.vy = p.vy * 0.95 + (p.vy * scale) * 0.05;

        p.x += p.vx;
        p.y += p.vy;

        // Bounce off walls
        if (p.x - p.r < WALL) { p.x = WALL + p.r; p.vx = Math.abs(p.vx); }
        if (p.x + p.r > W - WALL) { p.x = W - WALL - p.r; p.vx = -Math.abs(p.vx); }
        if (p.y - p.r < WALL) { p.y = WALL + p.r; p.vy = Math.abs(p.vy); }
        if (p.y + p.r > H - WALL) { p.y = H - WALL - p.r; p.vy = -Math.abs(p.vy); }

        const currentSpeed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        const hot = Math.min(1, currentSpeed / 6);
        const hue = 200 - hot * 200;
        const grd = ctx.createRadialGradient(p.x - p.r * 0.3, p.y - p.r * 0.3, 0, p.x, p.y, p.r);
        grd.addColorStop(0, `hsla(${hue}, 90%, 85%, 0.95)`);
        grd.addColorStop(1, `hsla(${hue}, 80%, 45%, 0.5)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <div className="space-y-4">
      <canvas ref={canvasRef} className="w-full rounded-xl border border-border/40" style={{ height: 260 }} />
      <div className="flex items-center gap-4">
        <span className="text-xs text-muted-foreground w-24">Temperature</span>
        <input
          type="range" min={5} max={100} value={temperature}
          onChange={e => setTemperature(+e.target.value)}
          className="flex-1 accent-orange-400"
        />
        <span className="text-xs font-bold text-orange-400 w-16 text-right">
          {Math.round(temperature * 3.73 + 20)} K
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        Each particle represents a gas molecule. Higher temperature → faster average speed → higher kinetic energy → more pressure.
      </p>
    </div>
  );
}

// ─── Projectile Motion Simulation ────────────────────────────────────────────

export function ProjectileSim() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [angle, setAngle] = useState(45);
  const [speed, setSpeed] = useState(50);
  const animRef = useRef<number>(0);
  const stateRef = useRef({ angle: 45, speed: 50, t: 0, trail: [] as Array<{x:number;y:number}> });

  useEffect(() => {
    stateRef.current.angle = angle;
    stateRef.current.speed = speed;
    stateRef.current.t = 0;
    stateRef.current.trail = [];
  }, [angle, speed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = 240;
    const g = 9.8;
    const SCALE = 3.5;
    const originX = 40, originY = H - 30;

    function draw() {
      ctx.fillStyle = "rgba(10,15,30,0.4)";
      ctx.fillRect(0, 0, W, H);

      // Ground
      ctx.strokeStyle = "rgba(100,200,100,0.4)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, originY);
      ctx.lineTo(W, originY);
      ctx.stroke();

      const { angle: a, speed: v0, t: currentT } = stateRef.current;
      const rad = (a * Math.PI) / 180;
      const v0x = v0 * Math.cos(rad);
      const v0y = v0 * Math.sin(rad);
      const tFlight = (2 * v0y) / g;

      // Draw complete trajectory arc (ghost)
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = "rgba(100,150,255,0.25)";
      ctx.lineWidth = 1;
      for (let ti = 0; ti <= tFlight; ti += 0.05) {
        const px = originX + v0x * ti * SCALE;
        const py = originY - (v0y * ti - 0.5 * g * ti * ti) * SCALE;
        if (ti === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Current position
      const t = stateRef.current.t;
      const cx = originX + v0x * t * SCALE;
      const cy = originY - (v0y * t - 0.5 * g * t * t) * SCALE;

      // Trail
      stateRef.current.trail.push({ x: cx, y: cy });
      if (stateRef.current.trail.length > 80) stateRef.current.trail.shift();
      for (let i = 0; i < stateRef.current.trail.length; i++) {
        const p = stateRef.current.trail[i];
        const alpha = i / stateRef.current.trail.length;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,140,0,${alpha * 0.6})`;
        ctx.fill();
      }

      // Ball
      if (cy <= originY && cx <= W - 20) {
        const grd = ctx.createRadialGradient(cx - 4, cy - 4, 0, cx, cy, 10);
        grd.addColorStop(0, "#ffcc44");
        grd.addColorStop(1, "#ff6600");
        ctx.beginPath();
        ctx.arc(cx, cy, 10, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        stateRef.current.t += 0.04;
        if (stateRef.current.t > tFlight) {
          setTimeout(() => { stateRef.current.t = 0; stateRef.current.trail = []; }, 800);
        }
      }

      // Labels
      ctx.fillStyle = "rgba(200,220,255,0.7)";
      ctx.font = "11px monospace";
      ctx.fillText(`θ = ${a}°`, 8, 18);
      ctx.fillText(`v₀ = ${v0} m/s`, 8, 34);
      ctx.fillText(`Range = ${(v0 * v0 * Math.sin(2 * rad) / g).toFixed(1)} m`, 8, 50);
      ctx.fillText(`H_max = ${((v0 * Math.sin(rad)) ** 2 / (2 * g)).toFixed(1)} m`, 8, 66);

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <div className="space-y-4">
      <canvas ref={canvasRef} className="w-full rounded-xl border border-border/40" style={{ height: 240 }} />
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground w-14">Angle θ</span>
          <input type="range" min={5} max={85} value={angle} onChange={e => setAngle(+e.target.value)} className="flex-1 accent-yellow-400" />
          <span className="text-xs font-bold text-yellow-400 w-8">{angle}°</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground w-14">Speed</span>
          <input type="range" min={10} max={80} value={speed} onChange={e => setSpeed(+e.target.value)} className="flex-1 accent-orange-400" />
          <span className="text-xs font-bold text-orange-400 w-12">{speed} m/s</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">Max range at 45°. Horizontal: constant velocity. Vertical: g = 9.8 m/s² downward.</p>
    </div>
  );
}

// ─── Wave Simulation ──────────────────────────────────────────────────────────

export function WaveSim() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [amplitude, setAmplitude] = useState(40);
  const [frequency, setFrequency] = useState(2);
  const animRef = useRef<number>(0);
  const paramsRef = useRef({ amplitude: 40, frequency: 2, t: 0 });
  paramsRef.current.amplitude = amplitude;
  paramsRef.current.frequency = frequency;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = 220;
    const midY = H / 2;

    function draw() {
      ctx.fillStyle = "rgba(10,15,30,0.4)";
      ctx.fillRect(0, 0, W, H);

      const { amplitude: A, frequency: f, t } = paramsRef.current;
      const lambda = W / f;
      const omega = 2 * Math.PI * 0.8;

      // Draw wave
      ctx.beginPath();
      for (let x = 0; x <= W; x++) {
        const y = midY - A * Math.sin((2 * Math.PI * x) / lambda - omega * t);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = "rgba(80,200,255,0.9)";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Draw particles on wave
      for (let i = 0; i < W; i += 30) {
        const y = midY - A * Math.sin((2 * Math.PI * i) / lambda - omega * t);
        ctx.beginPath();
        ctx.arc(i, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(150,230,255,0.9)";
        ctx.fill();
        // Vertical line to midline
        ctx.beginPath();
        ctx.moveTo(i, midY);
        ctx.lineTo(i, y);
        ctx.strokeStyle = "rgba(100,180,255,0.2)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Midline
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.moveTo(0, midY);
      ctx.lineTo(W, midY);
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.setLineDash([]);

      // Labels
      ctx.fillStyle = "rgba(200,230,255,0.8)";
      ctx.font = "11px monospace";
      ctx.fillText(`A = ${A} units`, 8, 18);
      ctx.fillText(`f = ${f} Hz  λ = ${(W / f).toFixed(0)}px`, 8, 34);

      paramsRef.current.t += 0.016;
      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <div className="space-y-4">
      <canvas ref={canvasRef} className="w-full rounded-xl border border-border/40" style={{ height: 220 }} />
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground w-20">Amplitude</span>
          <input type="range" min={5} max={80} value={amplitude} onChange={e => setAmplitude(+e.target.value)} className="flex-1 accent-cyan-400" />
          <span className="text-xs font-bold text-cyan-400 w-8">{amplitude}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground w-20">Frequency</span>
          <input type="range" min={1} max={5} value={frequency} onChange={e => setFrequency(+e.target.value)} className="flex-1 accent-blue-400" />
          <span className="text-xs font-bold text-blue-400 w-8">{frequency} Hz</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">Transverse wave. Particles oscillate vertically; energy travels horizontally. v = fλ</p>
    </div>
  );
}

// ─── Electric Circuit Simulation ──────────────────────────────────────────────

export function CircuitSim() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [voltage, setVoltage] = useState(12);
  const [resistance, setResistance] = useState(4);
  const animRef = useRef<number>(0);
  const electronRef = useRef<Array<{ pos: number; speed: number }>>([]);
  const paramsRef = useRef({ voltage: 12, resistance: 4, t: 0 });
  paramsRef.current.voltage = voltage;
  paramsRef.current.resistance = resistance;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = canvas.offsetWidth;
    canvas.height = 260;
    const W = canvas.width, H = canvas.height;

    const path = [
      { x: 80, y: 60 }, { x: W - 80, y: 60 }, { x: W - 80, y: H - 60 }, { x: 80, y: H - 60 }, { x: 80, y: 60 }
    ];
    const totalLength = (W - 160) + (H - 120) + (W - 160) + (H - 120);

    if (electronRef.current.length === 0) {
      for (let i = 0; i < 12; i++) {
        electronRef.current.push({ pos: (i / 12) * totalLength, speed: 0 });
      }
    }

    function getPoint(t: number): { x: number; y: number } {
      const segments = [W - 160, H - 120, W - 160, H - 120];
      const starts = [{ x: 80, y: 60 }, { x: W - 80, y: 60 }, { x: W - 80, y: H - 60 }, { x: 80, y: H - 60 }];
      const ends = [{ x: W - 80, y: 60 }, { x: W - 80, y: H - 60 }, { x: 80, y: H - 60 }, { x: 80, y: 60 }];
      let cum = 0;
      for (let i = 0; i < 4; i++) {
        if (t <= cum + segments[i]) {
          const frac = (t - cum) / segments[i];
          return { x: starts[i].x + frac * (ends[i].x - starts[i].x), y: starts[i].y + frac * (ends[i].y - starts[i].y) };
        }
        cum += segments[i];
      }
      return starts[0];
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "rgba(10,15,30,1)";
      ctx.fillRect(0, 0, W, H);

      const { voltage: V, resistance: R } = paramsRef.current;
      const I = V / R;
      const electronSpeed = I * 1.2;

      // Draw circuit path
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (const p of path.slice(1)) ctx.lineTo(p.x, p.y);
      ctx.strokeStyle = "rgba(100,150,255,0.5)";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Battery (left side)
      ctx.fillStyle = "#22c55e";
      ctx.fillRect(65, H / 2 - 30, 18, 60);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`${V}V`, 74, H / 2 + 4);

      // Resistor (top side)
      const rx = W / 2, ry = 60;
      ctx.fillStyle = "#f59e0b";
      ctx.fillRect(rx - 30, ry - 10, 60, 20);
      ctx.fillStyle = "#fff";
      ctx.fillText(`${R}Ω`, rx, ry + 4);

      // Light bulb (right side)
      ctx.beginPath();
      ctx.arc(W - 80, H / 2, 18, 0, Math.PI * 2);
      const glow = Math.min(1, I / 4);
      ctx.fillStyle = `rgba(255, ${200 + glow * 55}, 50, ${0.3 + glow * 0.7})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(255, 220, 100, ${0.5 + glow * 0.5})`;
      ctx.lineWidth = 2;
      ctx.stroke();
      if (glow > 0.3) {
        ctx.beginPath();
        ctx.arc(W - 80, H / 2, 28 + glow * 10, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 200, 50, ${glow * 0.15})`;
        ctx.fill();
      }
      ctx.fillStyle = "#fff";
      ctx.fillText("💡", W - 80, H / 2 + 4);

      // Move and draw electrons
      for (const e of electronRef.current) {
        e.pos = (e.pos + electronSpeed * 0.5) % totalLength;
        const pt = getPoint(e.pos);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(150,200,255,0.9)";
        ctx.fill();
      }

      ctx.textAlign = "left";
      ctx.fillStyle = "rgba(200,230,255,0.8)";
      ctx.font = "11px monospace";
      ctx.fillText(`I = V/R = ${V}/${R} = ${(V/R).toFixed(2)} A`, 10, 20);
      ctx.fillText(`P = VI = ${(V * I).toFixed(1)} W`, 10, 36);

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <div className="space-y-4">
      <canvas ref={canvasRef} className="w-full rounded-xl border border-border/40" style={{ height: 260 }} />
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground w-20">Voltage</span>
          <input type="range" min={1} max={24} value={voltage} onChange={e => setVoltage(+e.target.value)} className="flex-1 accent-green-400" />
          <span className="text-xs font-bold text-green-400 w-10">{voltage} V</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground w-20">Resistance</span>
          <input type="range" min={1} max={12} value={resistance} onChange={e => setResistance(+e.target.value)} className="flex-1 accent-amber-400" />
          <span className="text-xs font-bold text-amber-400 w-10">{resistance} Ω</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">Ohm's Law: I = V/R. Blue dots = electrons. Bulb brightness = power (P = VI).</p>
    </div>
  );
}

// ─── DNA Replication Simulation ───────────────────────────────────────────────

export function DNASim() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const tRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = 280;

    const BASES = ["A", "T", "G", "C"];
    const PAIRS: Record<string, string> = { A: "T", T: "A", G: "C", C: "G" };
    const COLORS: Record<string, string> = {
      A: "#60a5fa", T: "#f87171", G: "#4ade80", C: "#facc15"
    };

    const seqLength = 12;
    const seq = Array.from({ length: seqLength }, (_, i) => BASES[i % 4]);

    function draw() {
      ctx.fillStyle = "rgba(10,15,30,0.4)";
      ctx.fillRect(0, 0, W, H);

      const t = tRef.current;
      const stepW = W / (seqLength + 1);
      const midY = H / 2;
      const amplitude = 50;
      const splitProgress = (Math.sin(t * 0.4) * 0.5 + 0.5); // 0 to 1 oscillating

      for (let i = 0; i < seqLength; i++) {
        const x = stepW * (i + 1);
        const base = seq[i];
        const pair = PAIRS[base];

        // DNA spiral offset
        const spiralY = Math.sin((i / seqLength) * Math.PI * 2 - t * 0.5) * 15;
        const splitY = splitProgress * amplitude;

        // Top strand
        const y1 = midY - 20 - splitY + spiralY;
        ctx.beginPath();
        ctx.arc(x, y1, 14, 0, Math.PI * 2);
        ctx.fillStyle = COLORS[base] + "cc";
        ctx.fill();
        ctx.strokeStyle = COLORS[base];
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = "#fff";
        ctx.font = "bold 10px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(base, x, y1 + 3.5);

        // Bottom strand
        const y2 = midY + 20 + splitY + spiralY;
        ctx.beginPath();
        ctx.arc(x, y2, 14, 0, Math.PI * 2);
        ctx.fillStyle = COLORS[pair] + "cc";
        ctx.fill();
        ctx.strokeStyle = COLORS[pair];
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = "#fff";
        ctx.fillText(pair, x, y2 + 3.5);

        // H-bond between pairs (fades as split opens)
        if (splitProgress < 0.8) {
          const opacity = Math.max(0, 1 - splitProgress * 1.4);
          ctx.beginPath();
          ctx.moveTo(x, y1 + 14);
          ctx.lineTo(x, y2 - 14);
          ctx.strokeStyle = `rgba(255,255,255,${opacity * 0.4})`;
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 3]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Connect same-strand bases
        if (i < seqLength - 1) {
          const nx = stepW * (i + 2);
          const nspiralY = Math.sin(((i + 1) / seqLength) * Math.PI * 2 - t * 0.5) * 15;
          const ny1 = midY - 20 - splitY + nspiralY;
          const ny2 = midY + 20 + splitY + nspiralY;
          ctx.beginPath();
          ctx.moveTo(x + 14, y1);
          ctx.lineTo(nx - 14, ny1);
          ctx.strokeStyle = "rgba(200,220,255,0.4)";
          ctx.lineWidth = 2.5;
          ctx.setLineDash([]);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(x + 14, y2);
          ctx.lineTo(nx - 14, ny2);
          ctx.stroke();
        }
      }

      ctx.textAlign = "left";
      ctx.fillStyle = "rgba(200,220,255,0.7)";
      ctx.font = "11px sans-serif";
      ctx.fillText(splitProgress > 0.5 ? "Strands separating (helicase)" : "Double helix (base pairs)", 10, H - 12);

      tRef.current += 0.03;
      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <div className="space-y-3">
      <canvas ref={canvasRef} className="w-full rounded-xl border border-border/40" style={{ height: 280 }} />
      <div className="flex gap-4 justify-center flex-wrap text-xs">
        {[["A","Adenine","#60a5fa"],["T","Thymine","#f87171"],["G","Guanine","#4ade80"],["C","Cytosine","#facc15"]].map(([k,n,c]) => (
          <div key={k} className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full" style={{ background: c as string }} />
            <span style={{ color: c as string }}>{k}</span>
            <span className="text-muted-foreground">= {n}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">A always pairs with T (2 H-bonds); G always pairs with C (3 H-bonds). Animation shows helicase unwinding the double helix.</p>
    </div>
  );
}
