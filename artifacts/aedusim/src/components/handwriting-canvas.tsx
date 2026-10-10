import { useRef, useState, useEffect, useCallback } from "react";
import { Pen, Eraser, Trash2, Undo2, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface HandwritingCanvasProps {
  onExport: (base64: string) => void;
  className?: string;
}

const COLORS = ["#ffffff", "#60a5fa", "#34d399", "#f87171", "#fbbf24", "#000000"];

interface Stroke {
  points: { x: number; y: number }[];
  color: string;
  width: number;
  erase: boolean;
}

export function HandwritingCanvas({ onExport, className }: HandwritingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [color, setColor] = useState("#ffffff");
  const [strokeWidth, setStrokeWidth] = useState([4]);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const isDrawing = useRef(false);

  const getPos = (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      const t = e.touches[0];
      return { x: (t.clientX - rect.left) * scaleX, y: (t.clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const redraw = useCallback((strokeList: Stroke[], inProgress?: Stroke) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const drawStroke = (s: Stroke) => {
      if (s.points.length < 2) return;
      ctx.beginPath();
      ctx.globalCompositeOperation = s.erase ? "destination-out" : "source-over";
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.moveTo(s.points[0].x, s.points[0].y);
      for (let i = 1; i < s.points.length; i++) ctx.lineTo(s.points[i].x, s.points[i].y);
      ctx.stroke();
    };

    strokeList.forEach(drawStroke);
    if (inProgress) drawStroke(inProgress);
    ctx.globalCompositeOperation = "source-over";
  }, []);

  useEffect(() => { redraw(strokes); }, [strokes, redraw]);

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    isDrawing.current = true;
    const pos = getPos(e);
    const stroke: Stroke = { points: [pos], color, width: strokeWidth[0] * (tool === "eraser" ? 4 : 1), erase: tool === "eraser" };
    setCurrentStroke(stroke);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing.current || !currentStroke) return;
    const pos = getPos(e);
    const updated = { ...currentStroke, points: [...currentStroke.points, pos] };
    setCurrentStroke(updated);
    redraw(strokes, updated);
  };

  const endDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing.current || !currentStroke) return;
    isDrawing.current = false;
    setStrokes(prev => [...prev, currentStroke]);
    setCurrentStroke(null);
  };

  const undo = () => setStrokes(prev => prev.slice(0, -1));
  const clear = () => { setStrokes([]); redraw([]); };

  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onExport(canvas.toDataURL("image/jpeg", 0.85).split(",")[1]);
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-card/50 rounded-xl border border-border/50">
        {/* Tools */}
        <div className="flex gap-1">
          <Button size="sm" variant={tool === "pen" ? "default" : "outline"} onClick={() => setTool("pen")} className="h-8 w-8 p-0">
            <Pen className="w-4 h-4" />
          </Button>
          <Button size="sm" variant={tool === "eraser" ? "default" : "outline"} onClick={() => setTool("eraser")} className="h-8 w-8 p-0">
            <Eraser className="w-4 h-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-border/50" />

        {/* Colors */}
        <div className="flex items-center gap-1">
          <Palette className="w-3 h-3 text-muted-foreground" />
          {COLORS.map(c => (
            <button
              key={c}
              onClick={() => { setColor(c); setTool("pen"); }}
              className={cn("w-5 h-5 rounded-full border-2 transition-transform", color === c && tool === "pen" ? "border-white scale-125" : "border-transparent")}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        <div className="w-px h-6 bg-border/50" />

        {/* Stroke width */}
        <div className="flex items-center gap-2 min-w-[80px]">
          <span className="text-xs text-muted-foreground">Size</span>
          <Slider value={strokeWidth} onValueChange={setStrokeWidth} min={1} max={12} step={1} className="w-20" />
        </div>

        <div className="ml-auto flex gap-1">
          <Button size="sm" variant="ghost" onClick={undo} disabled={strokes.length === 0} className="h-8 w-8 p-0 text-muted-foreground">
            <Undo2 className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={clear} disabled={strokes.length === 0} className="h-8 w-8 p-0 text-red-400 hover:text-red-300">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative rounded-xl overflow-hidden border border-border/50 bg-[#1a1a2e] cursor-crosshair touch-none"
        style={{ aspectRatio: "16/7" }}>
        <canvas
          ref={canvasRef}
          width={1200}
          height={525}
          className="w-full h-full"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
        {strokes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-muted-foreground/40 text-sm select-none">Write your answer here…</p>
          </div>
        )}
      </div>

      <Button onClick={handleExport} disabled={strokes.length === 0} className="bg-rose-600 hover:bg-rose-700 text-white w-full">
        Scan &amp; Use This Answer
      </Button>
    </div>
  );
}
