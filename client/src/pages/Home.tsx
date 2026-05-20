/**
 * Home — Tiro Libre Matemático (v2)
 * Mobile-first, botones funcionales, sonidos, tabla de puntuación
 * Diseño: Cancha de Barrio Colorida — Fredoka One + Nunito
 */

import { useEffect, useRef, useState, useCallback, type PointerEvent } from "react";
import { useGameEngine, LEVELS, Vec2, GOAL_W, GOAL_H, BALL_START } from "@/hooks/useGameEngine";

// ── Imágenes ──────────────────────────────────────────────────────────────────
const STADIUM_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663638628604/cBUxYx2ADDYXb4EQaYAYG6/estadio_fondo-PZA7RdCJc5ybS2XK5SNcHi.webp";
const GK_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663638628604/cBUxYx2ADDYXb4EQaYAYG6/portero_idle-kyNfJ8RntMsyUWPE4NKF75.png";

// ── Tabla de puntuación (localStorage) ───────────────────────────────────────
interface ScoreEntry { name: string; score: number; level: number; date: string; }
const LS_KEY = "tlm_scores_v1";

function loadScores(): ScoreEntry[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; }
}
function saveScore(entry: ScoreEntry) {
  const scores = loadScores();
  scores.push(entry);
  scores.sort((a, b) => b.score - a.score);
  localStorage.setItem(LS_KEY, JSON.stringify(scores.slice(0, 10)));
}

// ── Sonidos (Web Audio API) ───────────────────────────────────────────────────
function useAudio() {
  const ctx = useRef<AudioContext | null>(null);

  const getCtx = () => {
    if (!ctx.current) ctx.current = new AudioContext();
    if (ctx.current.state === "suspended") ctx.current.resume();
    return ctx.current;
  };

  const playTone = useCallback((freq: number, type: OscillatorType, duration: number, gain = 0.3) => {
    try {
      const ac = getCtx();
      const osc = ac.createOscillator();
      const gainNode = ac.createGain();
      osc.connect(gainNode);
      gainNode.connect(ac.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ac.currentTime);
      gainNode.gain.setValueAtTime(gain, ac.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
      osc.start(ac.currentTime);
      osc.stop(ac.currentTime + duration);
    } catch (_) { /* silenciar errores de audio */ }
  }, []);

  const playSequence = useCallback((notes: [number, number][], type: OscillatorType = "sine") => {
    try {
      const ac = getCtx();
      let t = ac.currentTime;
      notes.forEach(([freq, dur]) => {
        const osc = ac.createOscillator();
        const g = ac.createGain();
        osc.connect(g); g.connect(ac.destination);
        osc.type = type;
        osc.frequency.setValueAtTime(freq, t);
        g.gain.setValueAtTime(0.25, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        osc.start(t); osc.stop(t + dur);
        t += dur + 0.02;
      });
    } catch (_) { /* silenciar */ }
  }, []);

  return {
    playClick: () => playTone(440, "square", 0.08, 0.15),
    playGoal: () => playSequence([[523, 0.12], [659, 0.12], [784, 0.12], [1047, 0.3]], "triangle"),
    playMiss: () => playSequence([[300, 0.15], [200, 0.25]], "sawtooth"),
    playCorrect: () => playSequence([[659, 0.1], [784, 0.15]], "sine"),
    playWrong: () => playTone(200, "sawtooth", 0.2, 0.2),
    playLevelUp: () => playSequence([[523, 0.1], [659, 0.1], [784, 0.1], [1047, 0.1], [1319, 0.3]], "triangle"),
    playKick: () => playTone(120, "square", 0.15, 0.35),
  };
}

// ── Componente Canvas ─────────────────────────────────────────────────────────
interface CanvasProps {
  gkX: number;
  gkDir: 1 | -1;
  ballProgress: number;
  ballActive: boolean;
  targetCoord: Vec2 | null;
  level: number;
  phase: string;
  stadiumImg: HTMLImageElement | null;
  gkImg: HTMLImageElement | null;
  onGoalClick: (coord: Vec2) => void;
}

function GameCanvas({ gkX, gkDir, ballProgress, ballActive, targetCoord, level, phase, stadiumImg, gkImg, onGoalClick }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cfg = LEVELS[level];
  const [previewCoord, setPreviewCoord] = useState<Vec2 | null>(null);
  const [isPointerActive, setIsPointerActive] = useState(false);

  const getGoalCoord = useCallback((px: number, py: number) => {
    const gL = 10;
    const gT = 6;
    const gW = 80;
    const gH = 55;
    const touchMargin = 8;
    if (px < gL - touchMargin || px > gL + gW + touchMargin || py < gT - touchMargin || py > gT + gH + touchMargin) {
      return null;
    }
    const clampedX = Math.min(Math.max(px, gL), gL + gW);
    const clampedY = Math.min(Math.max(py, gT), gT + gH);
    const normX = (clampedX - gL) / gW;
    const normY = (clampedY - gT) / gH;
    const x = cfg.useCenter
      ? Math.round((normX * GOAL_W - GOAL_W / 2) * 2) / 2
      : Math.round(normX * GOAL_W * 2) / 2;
    const y = Math.round((1 - normY) * GOAL_H * 2) / 2;
    return {
      x: Math.max(cfg.useCenter ? -GOAL_W / 2 : 0, Math.min(cfg.useCenter ? GOAL_W / 2 : GOAL_W, x)),
      y: Math.max(0, Math.min(GOAL_H, y)),
    };
  }, [cfg.useCenter]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;

    // Dimensiones de portería en px
    const gL = W * 0.10, gT = H * 0.06;
    const gW = W * 0.80, gH = H * 0.55;
    const postW = Math.max(6, W * 0.012);

    // ── Fondo ──
    if (stadiumImg?.complete) {
      ctx.drawImage(stadiumImg, 0, 0, W, H);
    } else {
      ctx.fillStyle = "#87CEEB"; ctx.fillRect(0, 0, W, H * 0.6);
      ctx.fillStyle = "#2ECC40"; ctx.fillRect(0, H * 0.6, W, H * 0.4);
    }

    // ── Portería ──
    ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = 12; ctx.shadowOffsetY = 4;
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath(); ctx.roundRect(gL - postW / 2, gT, postW, gH + postW / 2, 3); ctx.fill();
    ctx.beginPath(); ctx.roundRect(gL + gW - postW / 2, gT, postW, gH + postW / 2, 3); ctx.fill();
    ctx.beginPath(); ctx.roundRect(gL - postW / 2, gT, gW + postW, postW, 3); ctx.fill();
    ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;

    if (phase === "aiming") {
      ctx.save();
      ctx.fillStyle = "rgba(255,107,53,0.1)";
      ctx.fillRect(gL, gT, gW, gH);
      ctx.strokeStyle = "rgba(255,107,53,0.9)";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.strokeRect(gL, gT, gW, gH);
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.font = `bold ${Math.max(12, W * 0.02)}px Fredoka One, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText("Área de tiro", gL + gW / 2, gT - 8);
      ctx.restore();
    }

    // ── Red ──
    ctx.save();
    ctx.beginPath(); ctx.rect(gL, gT + postW, gW, gH - postW); ctx.clip();
    ctx.fillStyle = "rgba(255,255,255,0.10)"; ctx.fillRect(gL, gT, gW, gH);
    ctx.strokeStyle = "rgba(255,255,255,0.3)"; ctx.lineWidth = 0.8;
    for (let i = 0; i <= 12; i++) { const x = gL + (i / 12) * gW; ctx.beginPath(); ctx.moveTo(x, gT); ctx.lineTo(x, gT + gH); ctx.stroke(); }
    for (let i = 0; i <= 7; i++) { const y = gT + (i / 7) * gH; ctx.beginPath(); ctx.moveTo(gL, y); ctx.lineTo(gL + gW, y); ctx.stroke(); }
    ctx.restore();

    // ── Plano Cartesiano ──
    const cols = GOAL_W, rows = GOAL_H;
    const cellW = gW / cols, cellH = gH / rows;
    ctx.fillStyle = "rgba(78,205,196,0.06)"; ctx.fillRect(gL, gT, gW, gH);
    ctx.strokeStyle = "rgba(78,205,196,0.45)"; ctx.lineWidth = 0.7; ctx.setLineDash([3, 3]);
    for (let c = 0; c <= cols; c++) { const x = gL + c * cellW; ctx.beginPath(); ctx.moveTo(x, gT); ctx.lineTo(x, gT + gH); ctx.stroke(); }
    for (let r = 0; r <= rows; r++) { const y = gT + r * cellH; ctx.beginPath(); ctx.moveTo(gL, y); ctx.lineTo(gL + gW, y); ctx.stroke(); }
    ctx.setLineDash([]);

    // Ejes principales
    ctx.strokeStyle = "rgba(78,205,196,0.9)"; ctx.lineWidth = 2;
    if (cfg.useCenter) { const cx = gL + gW / 2; ctx.beginPath(); ctx.moveTo(cx, gT); ctx.lineTo(cx, gT + gH); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(gL, gT + gH); ctx.lineTo(gL + gW, gT + gH); ctx.stroke();

    // Etiquetas X
    const fontSize = Math.max(9, W * 0.022);
    ctx.fillStyle = "#4ECDC4"; ctx.font = `bold ${fontSize}px Fredoka One, sans-serif`;
    ctx.textAlign = "center"; ctx.textBaseline = "top";
    for (let c = 0; c <= cols; c++) {
      const lx = cfg.useCenter ? c - cols / 2 : c;
      ctx.fillText(String(lx), gL + c * cellW, gT + gH + 3);
    }
    // Etiquetas Y
    ctx.textAlign = "right"; ctx.textBaseline = "middle";
    for (let r = 0; r <= rows; r++) {
      ctx.fillText(String(rows - r), gL - 4, gT + r * cellH);
    }

    // ── Punto de mira ──
    if (targetCoord) {
      const normX = cfg.useCenter ? (targetCoord.x + GOAL_W / 2) / GOAL_W : targetCoord.x / GOAL_W;
      const normY = 1 - targetCoord.y / GOAL_H;
      const tx = gL + normX * gW, ty = gT + normY * gH;
      ctx.strokeStyle = "#FF6B35"; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(tx, ty, 11, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(tx - 16, ty); ctx.lineTo(tx + 16, ty); ctx.moveTo(tx, ty - 16); ctx.lineTo(tx, ty + 16); ctx.stroke();
      ctx.fillStyle = "#FF6B35"; ctx.font = `bold ${Math.max(10, W * 0.024)}px Fredoka One, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "bottom";
      ctx.fillText(`(${targetCoord.x}, ${targetCoord.y})`, tx, ty - 14);
    }

    if (previewCoord && !targetCoord && phase === "aiming") {
      const normX = cfg.useCenter ? (previewCoord.x + GOAL_W / 2) / GOAL_W : previewCoord.x / GOAL_W;
      const normY = 1 - previewCoord.y / GOAL_H;
      const tx = gL + normX * gW, ty = gT + normY * gH;
      ctx.save();
      ctx.strokeStyle = "rgba(255,255,255,0.95)";
      ctx.fillStyle = "rgba(255,107,53,0.16)";
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 6]);
      ctx.beginPath(); ctx.arc(tx, ty, 18, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.restore();
    }

    // ── Portero ──
    if (cfg.hasGK) {
      const pkX = gL + (gkX / 100) * gW;
      const pkH = gH * 0.82, pkW = pkH * 0.52;
      const pkY = gT + gH - pkH;
      if (gkImg?.complete) {
        ctx.save();
        if (gkDir === -1) { ctx.scale(-1, 1); ctx.drawImage(gkImg, -(pkX + pkW / 2), pkY, pkW, pkH); }
        else { ctx.drawImage(gkImg, pkX - pkW / 2, pkY, pkW, pkH); }
        ctx.restore();
      } else {
        ctx.fillStyle = "#FF6B35";
        ctx.beginPath(); ctx.roundRect(pkX - pkW / 2, pkY, pkW, pkH, 6); ctx.fill();
      }
    }

    // ── Balón ──
    const bSize = Math.max(12, W * 0.042);
    let bx: number, by: number, bScale: number;

    if (ballActive && targetCoord) {
      const normX2 = cfg.useCenter ? (targetCoord.x + GOAL_W / 2) / GOAL_W : targetCoord.x / GOAL_W;
      const normY2 = 1 - targetCoord.y / GOAL_H;
      const destX = gL + normX2 * gW;
      const destY = gT + normY2 * gH;
      const startX = (BALL_START.x / 100) * W;
      const startY = (BALL_START.y / 100) * H;
      const t = ballProgress;
      const ease = 1 - (1 - t) * (1 - t);
      bx = startX + (destX - startX) * ease;
      const arc = 22 * 4 * t * (1 - t);
      by = startY + (destY - startY) * ease - (H * 0.22) * arc / 22;
      bScale = 1 - ease * 0.52;
    } else {
      bx = (BALL_START.x / 100) * W;
      by = (BALL_START.y / 100) * H;
      bScale = 1;
    }

    const r = bSize * bScale;
    ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = 8 * bScale; ctx.shadowOffsetY = 4 * bScale;
    ctx.fillStyle = "#FFFFFF"; ctx.beginPath(); ctx.arc(bx, by, r, 0, Math.PI * 2); ctx.fill();
    ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    ctx.fillStyle = "#222";
    ctx.beginPath(); ctx.arc(bx, by, r * 0.36, 0, Math.PI * 2); ctx.fill();
    [[0.6, -0.6], [0.6, 0.6], [-0.6, 0.6], [-0.6, -0.6]].forEach(([dx, dy]) => {
      ctx.beginPath(); ctx.arc(bx + dx * r * 0.55, by + dy * r * 0.55, r * 0.2, 0, Math.PI * 2); ctx.fill();
    });
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.beginPath(); ctx.arc(bx - r * 0.28, by - r * 0.28, r * 0.2, 0, Math.PI * 2); ctx.fill();

  }, [gkX, gkDir, ballProgress, ballActive, targetCoord, level, phase, stadiumImg, gkImg, cfg, previewCoord]);

  // Resize + redraw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const p = canvas.parentElement;
      if (!p) return;
      canvas.width = p.clientWidth;
      canvas.height = p.clientHeight;
      draw();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement!);
    return () => ro.disconnect();
  }, [draw]);

  useEffect(() => { draw(); }, [draw]);

  const getPointerGoalCoord = useCallback((e: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    if (e.pointerType === "touch") e.preventDefault();

    const rect = canvas.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * 100;
    const py = ((e.clientY - rect.top) / rect.height) * 100;

    const gL = 10, gT = 6, gW = 80, gH = 55;
    const margin = 8;
    if (px < gL - margin || px > gL + gW + margin || py < gT - margin || py > gT + gH + margin) {
      return null;
    }

    const clampedX = Math.max(gL, Math.min(gL + gW, px));
    const clampedY = Math.max(gT, Math.min(gT + gH, py));
    const normX = (clampedX - gL) / gW;
    const normY = (clampedY - gT) / gH;
    const useCenter = LEVELS[level].useCenter;

    const cx = useCenter
      ? Math.round((normX * GOAL_W - GOAL_W / 2) * 2) / 2
      : Math.round(normX * GOAL_W * 2) / 2;
    const cy = Math.round((1 - normY) * GOAL_H * 2) / 2;

    return {
      x: Math.max(useCenter ? -GOAL_W / 2 : 0, Math.min(useCenter ? GOAL_W / 2 : GOAL_W, cx)),
      y: Math.max(0, Math.min(GOAL_H, cy)),
    };
  }, [level]);

  const updatePreview = useCallback((e: PointerEvent<HTMLCanvasElement>) => {
    if (phase !== "aiming") return setPreviewCoord(null);
    const coord = getPointerGoalCoord(e);
    setPreviewCoord(coord);
  }, [phase, getPointerGoalCoord]);

  const handlePointerDown = useCallback((e: PointerEvent<HTMLCanvasElement>) => {
    if (phase !== "aiming") return;
    setIsPointerActive(true);
    updatePreview(e);
  }, [phase, updatePreview]);

  const handlePointerMove = useCallback((e: PointerEvent<HTMLCanvasElement>) => {
    if (phase !== "aiming" || !isPointerActive) return;
    updatePreview(e);
  }, [phase, isPointerActive, updatePreview]);

  const handlePointerUp = useCallback((e: PointerEvent<HTMLCanvasElement>) => {
    if (phase !== "aiming") return;
    const coord = getPointerGoalCoord(e);
    setIsPointerActive(false);
    setPreviewCoord(null);
    if (coord) onGoalClick(coord);
  }, [phase, getPointerGoalCoord, onGoalClick]);

  const clearPreview = useCallback(() => {
    setIsPointerActive(false);
    setPreviewCoord(null);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={clearPreview}
      onPointerCancel={clearPreview}
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        borderRadius: "1rem",
        cursor: phase === "aiming" ? "crosshair" : "default",
        touchAction: "none",
        zIndex: 0,
        position: "relative",
      }}
    />
  );
}

// ── Pantalla Menú ─────────────────────────────────────────────────────────────
function MenuScreen({ onStart, onScores }: { onStart: () => void; onScores: () => void }) {
  const scores = loadScores();
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", borderRadius: "1rem" }}>
      <div className="game-card p-5 text-center w-full mx-3" style={{ maxWidth: 360 }}>
        <div style={{ fontSize: "3.5rem", lineHeight: 1 }}>⚽</div>
        <h1 className="font-game" style={{ fontSize: "clamp(1.6rem,6vw,2.2rem)", color: "#FF6B35", lineHeight: 1.1 }}>Tiro Libre</h1>
        <h1 className="font-game" style={{ fontSize: "clamp(1.6rem,6vw,2.2rem)", color: "#4ECDC4", lineHeight: 1.1 }}>Matemático</h1>
        <p style={{ color: "#888", fontWeight: 600, fontSize: "0.8rem", marginTop: "0.3rem" }}>Para Martín Roldán 🏆</p>

        <div style={{ background: "#FFF8F0", borderRadius: "0.75rem", padding: "0.75rem", margin: "0.75rem 0", textAlign: "left" }}>
          <p className="font-game" style={{ color: "#FF6B35", fontSize: "0.85rem", marginBottom: "0.4rem" }}>¿Cómo se juega?</p>
          <p style={{ fontSize: "0.78rem", color: "#555", marginBottom: "0.25rem" }}>📐 <strong>Toca</strong> la portería para apuntar a una coordenada.</p>
          <p style={{ fontSize: "0.78rem", color: "#555", marginBottom: "0.25rem" }}>✖️ <strong>Resuelve</strong> la multiplicación para dar potencia.</p>
          <p style={{ fontSize: "0.78rem", color: "#555" }}>⚽ <strong>¡Gol</strong> si el portero no llega a tiempo!</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem", marginBottom: "0.75rem" }}>
          {LEVELS.map((lv, i) => (
            <div key={i} style={{ background: "#F5F5F5", borderRadius: "0.6rem", padding: "0.4rem", textAlign: "center" }}>
              <p className="font-game" style={{ fontSize: "0.7rem", color: "#888" }}>{lv.label}</p>
              <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#444" }}>{lv.sublabel}</p>
            </div>
          ))}
        </div>

        {scores.length > 0 && (
          <p className="font-game" style={{ fontSize: "0.85rem", color: "#4ECDC4", marginBottom: "0.5rem" }}>
            🏅 Récord: {scores[0].score} pts
          </p>
        )}

        <button onClick={onStart} className="game-btn game-btn-orange" style={{ width: "100%", padding: "0.85rem", fontSize: "1.3rem", marginBottom: "0.5rem" }}>
          ¡Jugar! ⚽
        </button>
        <button onClick={onScores} className="game-btn game-btn-blue" style={{ width: "100%", padding: "0.6rem", fontSize: "1rem" }}>
          🏆 Tabla de Puntuación
        </button>
      </div>
    </div>
  );
}

// ── Panel Matemáticas ─────────────────────────────────────────────────────────
interface MathProps {
  a: number; b: number; timeLeft: number; maxTime: number;
  userInput: string; onInput: (v: string) => void; onSubmit: () => void;
}
function MathPanel({ a, b, timeLeft, maxTime, userInput, onInput, onSubmit }: MathProps) {
  const pct = maxTime > 0 ? (timeLeft / maxTime) * 100 : 100;
  const urgent = pct < 30;
  return (
    <div className="game-card" style={{ padding: "0.85rem", width: "100%", marginTop: "0.5rem" }}>
      {maxTime > 0 && (
        <div style={{ marginBottom: "0.5rem" }}>
          <div style={{ height: 10, background: "#EEE", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, borderRadius: 99, transition: "width 0.1s", background: urgent ? "linear-gradient(90deg,#FF4136,#FF6B35)" : "linear-gradient(90deg,#2ECC40,#4ECDC4)" }} />
          </div>
          <p className="font-game" style={{ textAlign: "center", fontSize: "0.75rem", color: urgent ? "#FF4136" : "#888", marginTop: 2 }}>
            {urgent ? "⚡ ¡Rápido!" : `${Math.ceil(timeLeft)}s`}
          </p>
        </div>
      )}
      <div style={{ textAlign: "center", marginBottom: "0.6rem" }}>
        <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#888", marginBottom: "0.2rem" }}>¿Cuánto es?</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
          <span className="font-game" style={{ fontSize: "clamp(2rem,8vw,2.8rem)", color: "#FF6B35" }}>{a}</span>
          <span className="font-game" style={{ fontSize: "clamp(1.5rem,6vw,2rem)", color: "#AAA" }}>×</span>
          <span className="font-game" style={{ fontSize: "clamp(2rem,8vw,2.8rem)", color: "#FF6B35" }}>{b}</span>
          <span className="font-game" style={{ fontSize: "clamp(1.5rem,6vw,2rem)", color: "#AAA" }}>=</span>
          <span className="font-game" style={{ fontSize: "clamp(2rem,8vw,2.8rem)", color: "#4ECDC4", minWidth: "2.5rem" }}>{userInput || "?"}</span>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.35rem" }}>
        {[1,2,3,4,5,6,7,8,9].map(n => (
          <button key={n} onClick={() => onInput(userInput + n)} className="game-btn game-btn-blue"
            style={{ padding: "0.65rem 0", fontSize: "1.1rem", fontFamily: "'Fredoka One', cursive", color: "white" }}>
            {n}
          </button>
        ))}
        <button onClick={() => onInput(userInput.slice(0, -1))} className="game-btn"
          style={{ padding: "0.65rem 0", fontSize: "1.1rem", background: "#EEE", color: "#555", fontFamily: "'Fredoka One', cursive" }}>
          ⌫
        </button>
        <button onClick={() => onInput(userInput + "0")} className="game-btn game-btn-blue"
          style={{ padding: "0.65rem 0", fontSize: "1.1rem", fontFamily: "'Fredoka One', cursive", color: "white" }}>
          0
        </button>
        <button onClick={onSubmit} disabled={!userInput} className="game-btn game-btn-orange"
          style={{ padding: "0.65rem 0", fontSize: "1.1rem", fontFamily: "'Fredoka One', cursive", color: "white", opacity: userInput ? 1 : 0.4 }}>
          ✓
        </button>
      </div>
    </div>
  );
}

// ── Overlay de Resultado ──────────────────────────────────────────────────────
function ResultOverlay({ isGoal, feedback, onContinue, score, lives }: { isGoal: boolean; feedback: string; onContinue: () => void; score: number; lives: number }) {
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(3px)", borderRadius: "1rem" }}>
      <div className="game-card" style={{ padding: "1.5rem", textAlign: "center", maxWidth: 320, width: "90%", margin: "0 auto" }}>
        <div style={{ fontSize: "3.5rem", lineHeight: 1, marginBottom: "0.4rem" }}>{isGoal ? "⚽" : "🧤"}</div>
        <h2 className="font-game" style={{ fontSize: "clamp(1.4rem,6vw,2rem)", color: isGoal ? "#2ECC40" : "#FF4136", marginBottom: "0.3rem" }}>
          {isGoal ? "¡GOOOOL!" : "¡Atajada!"}
        </h2>
        <p style={{ fontSize: "0.82rem", color: "#666", fontWeight: 600, marginBottom: "0.5rem" }}>{feedback}</p>
        <p className="font-game" style={{ fontSize: "1.5rem", color: "#FF6B35", marginBottom: "0.5rem" }}>
          {score} <span style={{ fontSize: "0.9rem", color: "#AAA" }}>pts</span>
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "0.25rem", marginBottom: "1rem" }}>
          {[1,2,3].map(i => <span key={i} style={{ fontSize: "1.6rem", filter: i <= lives ? "none" : "grayscale(1) opacity(0.3)" }}>❤️</span>)}
        </div>
        <button onClick={onContinue} className="game-btn game-btn-orange"
          style={{ width: "100%", padding: "0.85rem", fontSize: "1.1rem", fontFamily: "'Fredoka One', cursive", color: "white" }}>
          {isGoal ? "¡Otro tiro! →" : "Intentar de nuevo →"}
        </button>
      </div>
    </div>
  );
}

// ── Overlay Nivel Up ──────────────────────────────────────────────────────────
function LevelUpOverlay({ newLevel, onContinue }: { newLevel: number; onContinue: () => void }) {
  const lv = LEVELS[newLevel];
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", borderRadius: "1rem" }}>
      <div className="game-card" style={{ padding: "1.5rem", textAlign: "center", maxWidth: 320, width: "90%", margin: "0 auto" }}>
        <div style={{ fontSize: "3.5rem", lineHeight: 1, marginBottom: "0.4rem" }}>🏆</div>
        <h2 className="font-game" style={{ fontSize: "clamp(1.4rem,6vw,2rem)", color: "#FFD700", marginBottom: "0.3rem" }}>¡Nivel Superado!</h2>
        <p style={{ fontWeight: 700, color: "#555", marginBottom: "0.5rem", fontSize: "0.9rem" }}>{lv?.label} — {lv?.sublabel}</p>
        <div style={{ background: "#E8FFF5", borderRadius: "0.75rem", padding: "0.6rem", marginBottom: "1rem", textAlign: "left" }}>
          <p className="font-game" style={{ color: "#2ECC40", fontSize: "0.8rem" }}>📐 Nuevo reto:</p>
          <p style={{ fontSize: "0.78rem", color: "#555", marginTop: "0.25rem" }}>
            {newLevel >= 2
              ? "El origen (0,0) ahora está en el centro. ¡Usa coordenadas negativas para apuntar a la izquierda!"
              : "Ahora debes resolver multiplicaciones para dar potencia al tiro."}
          </p>
        </div>
        <button onClick={onContinue} className="game-btn game-btn-green"
          style={{ width: "100%", padding: "0.85rem", fontSize: "1.1rem", fontFamily: "'Fredoka One', cursive", color: "white" }}>
          ¡Vamos! 🚀
        </button>
      </div>
    </div>
  );
}

// ── Overlay Game Over ─────────────────────────────────────────────────────────
function GameOverOverlay({ score, level, onRestart, onScores }: { score: number; level: number; onRestart: () => void; onScores: () => void }) {
  const [name, setName] = useState("Martín");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    saveScore({ name, score, level, date: new Date().toLocaleDateString("es") });
    setSaved(true);
  };

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)", borderRadius: "1rem" }}>
      <div className="game-card" style={{ padding: "1.5rem", textAlign: "center", maxWidth: 320, width: "90%", margin: "0 auto" }}>
        <div style={{ fontSize: "3.5rem", lineHeight: 1, marginBottom: "0.4rem" }}>😢</div>
        <h2 className="font-game" style={{ fontSize: "clamp(1.4rem,6vw,2rem)", color: "#FF4136", marginBottom: "0.2rem" }}>¡Fin del partido!</h2>
        <p className="font-game" style={{ fontSize: "2rem", color: "#FF6B35", marginBottom: "0.75rem" }}>
          {score} <span style={{ fontSize: "1rem", color: "#AAA" }}>pts</span>
        </p>
        {!saved ? (
          <>
            <p style={{ fontSize: "0.8rem", color: "#888", marginBottom: "0.4rem" }}>¿Guardar tu puntaje?</p>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={12}
              style={{ width: "100%", padding: "0.5rem", borderRadius: "0.5rem", border: "2px solid #EEE", fontFamily: "'Nunito', sans-serif", fontSize: "1rem", textAlign: "center", marginBottom: "0.5rem", boxSizing: "border-box" }}
            />
            <button onClick={handleSave} className="game-btn game-btn-green"
              style={{ width: "100%", padding: "0.65rem", fontSize: "1rem", fontFamily: "'Fredoka One', cursive", color: "white", marginBottom: "0.4rem" }}>
              💾 Guardar puntaje
            </button>
          </>
        ) : (
          <p style={{ fontSize: "0.85rem", color: "#2ECC40", fontWeight: 700, marginBottom: "0.75rem" }}>✅ ¡Puntaje guardado!</p>
        )}
        <button onClick={onRestart} className="game-btn game-btn-orange"
          style={{ width: "100%", padding: "0.75rem", fontSize: "1.1rem", fontFamily: "'Fredoka One', cursive", color: "white", marginBottom: "0.4rem" }}>
          Jugar de nuevo 🔄
        </button>
        <button onClick={onScores} className="game-btn game-btn-blue"
          style={{ width: "100%", padding: "0.6rem", fontSize: "0.95rem", fontFamily: "'Fredoka One', cursive", color: "white" }}>
          🏆 Ver tabla
        </button>
      </div>
    </div>
  );
}

// ── Tabla de Puntuación ───────────────────────────────────────────────────────
function ScoresScreen({ onBack }: { onBack: () => void }) {
  const scores = loadScores();
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)", borderRadius: "1rem" }}>
      <div className="game-card" style={{ padding: "1.25rem", maxWidth: 340, width: "92%", margin: "0 auto" }}>
        <h2 className="font-game" style={{ fontSize: "1.6rem", color: "#FFD700", textAlign: "center", marginBottom: "0.75rem" }}>🏆 Tabla de Puntuación</h2>
        {scores.length === 0 ? (
          <p style={{ textAlign: "center", color: "#AAA", fontSize: "0.9rem", padding: "1rem 0" }}>Aún no hay puntajes guardados.<br />¡Juega y guarda el tuyo!</p>
        ) : (
          <div style={{ overflowY: "auto", maxHeight: "50vh" }}>
            {scores.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 0.6rem", borderRadius: "0.6rem", background: i === 0 ? "#FFF8E1" : i % 2 === 0 ? "#F9F9F9" : "white", marginBottom: "0.3rem" }}>
                <span className="font-game" style={{ fontSize: "1.1rem", color: i === 0 ? "#FFD700" : i === 1 ? "#AAA" : i === 2 ? "#CD7F32" : "#888", minWidth: "1.5rem" }}>
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}
                </span>
                <span style={{ flex: 1, fontWeight: 700, fontSize: "0.9rem", color: "#333", marginLeft: "0.4rem" }}>{s.name}</span>
                <span className="font-game" style={{ fontSize: "1rem", color: "#FF6B35" }}>{s.score}</span>
                <span style={{ fontSize: "0.7rem", color: "#AAA", marginLeft: "0.5rem" }}>Nv.{s.level + 1}</span>
              </div>
            ))}
          </div>
        )}
        <button onClick={onBack} className="game-btn game-btn-orange"
          style={{ width: "100%", padding: "0.75rem", fontSize: "1.1rem", fontFamily: "'Fredoka One', cursive", color: "white", marginTop: "0.75rem" }}>
          ← Volver
        </button>
      </div>
    </div>
  );
}

// ── Página Principal ──────────────────────────────────────────────────────────
export default function Home() {
  const { state, startGame, selectTarget, updateMathInput, submitMath, continueGame } = useGameEngine();
  const audio = useAudio();
  const [stadiumImg, setStadiumImg] = useState<HTMLImageElement | null>(null);
  const [gkImg, setGkImg] = useState<HTMLImageElement | null>(null);
  const prevPhase = useRef(state.phase);

  // Precargar imágenes
  useEffect(() => {
    const s = new Image(); s.src = STADIUM_URL; s.onload = () => setStadiumImg(s);
    const g = new Image(); g.src = GK_URL; g.onload = () => setGkImg(g);
  }, []);

  // Efectos de sonido por fase
  useEffect(() => {
    if (prevPhase.current === state.phase) return;
    prevPhase.current = state.phase;
    if (state.phase === "shooting") audio.playKick();
    else if (state.phase === "result_goal") audio.playGoal();
    else if (state.phase === "result_miss") audio.playMiss();
    else if (state.phase === "level_up") audio.playLevelUp();
  }, [state.phase, audio]);

  // Sonido al confirmar respuesta matemática
  const handleSubmitMath = useCallback(() => {
    if (state.math?.userInput) {
      const correct = parseInt(state.math.userInput) === state.math.answer;
      if (correct) audio.playCorrect(); else audio.playWrong();
    }
    submitMath();
  }, [state.math, submitMath, audio]);

  const [showScores, setShowScores] = useState(false);

  const handleStart = useCallback(() => {
    setShowScores(false);
    audio.playClick();
    startGame();
  }, [startGame, audio]);

  const handleContinue = useCallback(() => {
    setShowScores(false);
    audio.playClick();
    continueGame();
  }, [continueGame, audio]);

  const handleGoalClick = useCallback((coord: Vec2) => { audio.playClick(); selectTarget(coord); }, [selectTarget, audio]);
  const goToScores = useCallback(() => {
    setShowScores(true);
  }, []);
  const cfg = LEVELS[state.level];
  const progressPct = Math.min((state.shotsScored / cfg.goalsToWin) * 100, 100);

  const phaseLabel = state.phase === "menu"
    ? "Bienvenido"
    : state.phase === "aiming"
      ? "Apunta"
      : state.phase === "math"
        ? "Resuelve"
        : state.phase === "shooting"
          ? "¡Disparo!"
          : state.phase === "result_goal"
            ? "¡Gol!"
            : state.phase === "result_miss"
              ? "¡Intenta de nuevo!"
              : state.phase === "level_up"
                ? "Nivel completado"
                : "Fin del partido";

  const phaseHint = state.phase === "menu"
    ? "Pulsa Jugar para empezar el partido y aprender matemáticas jugando."
    : state.phase === "aiming"
      ? "Toca y desliza dentro de la portería para elegir mejor el tiro."
      : state.phase === "math"
        ? "Resuelve rápido la multiplicación para que el tiro sea potente."
        : state.phase === "shooting"
          ? "Observa la trayectoria del balón y prepárate para el resultado."
          : state.phase === "result_goal"
            ? "¡Excelente! Sigue apuntando y mantén la racha."
            : state.phase === "result_miss"
              ? "No te rindas, ajusta la puntería o responde más rápido."
              : state.phase === "level_up"
                ? "Nuevo nivel desbloqueado. Prepárate para más desafío."
                : "Has terminado el partido. Guarda tu puntaje o juega otra vez.";

  return (
    <div style={{
      minHeight: "100dvh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start",
      padding: "0.5rem",
      background: "linear-gradient(160deg, #1a6b2e 0%, #2ECC40 50%, #1a8a3a 100%)",
      fontFamily: "'Nunito', sans-serif",
      overflowX: "hidden",
    }}>

      {/* ── HUD ── */}
      {state.phase !== "menu" && (
        <div style={{ width: "100%", maxWidth: 600, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", marginBottom: "0.4rem", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: "0.15rem" }}>
            {[1,2,3].map(i => <span key={i} style={{ fontSize: "1.5rem", filter: i <= state.lives ? "none" : "grayscale(1) opacity(0.3)" }}>❤️</span>)}
          </div>
          <div style={{ flex: 1, minWidth: 120 }}>
            <p className="font-game" style={{ color: "white", fontSize: "0.72rem", textAlign: "center", marginBottom: 2 }}>{cfg.label} — {cfg.sublabel}</p>
            <div style={{ height: 8, background: "rgba(255,255,255,0.3)", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progressPct}%`, background: "linear-gradient(90deg,#FFE500,#FF6B35)", borderRadius: 99, transition: "width 0.4s" }} />
            </div>
            <p className="font-game" style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.65rem", textAlign: "center", marginTop: 1 }}>
              {state.shotsScored}/{cfg.goalsToWin} goles
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p className="font-game" style={{ color: "white", fontSize: "1.5rem", lineHeight: 1 }}>{state.score}</p>
            <p className="font-game" style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.65rem" }}>puntos</p>
            {state.streak >= 2 && (
              <span style={{ background: "#FFD700", color: "#7A4F00", borderRadius: 99, padding: "0.1rem 0.4rem", fontSize: "0.7rem", fontWeight: 800 }}>🔥 ×{state.streak}</span>
            )}
          </div>
        </div>
      )}

      {/* ── Área de juego ── */}
      <div style={{ width: "100%", maxWidth: 600, position: "relative" }}>
        {/* Canvas */}
        <div style={{ width: "100%", aspectRatio: "4/3", position: "relative", borderRadius: "1rem", overflow: "hidden", boxShadow: "0 10px 40px rgba(0,0,0,0.45)" }}>
          <GameCanvas
            gkX={state.gkX}
            gkDir={state.gkDir}
            ballProgress={state.ballProgress}
            ballActive={state.ballActive}
            targetCoord={state.targetCoord}
            level={state.level}
            phase={state.phase}
            stadiumImg={stadiumImg}
            gkImg={gkImg}
            onGoalClick={handleGoalClick}
          />

          {/* Overlays — z-index 20, encima del canvas */}
          {showScores ? (
            <ScoresScreen onBack={() => { audio.playClick(); setShowScores(false); }} />
          ) : (
            <>
              {state.phase === "menu" && <MenuScreen onStart={handleStart} onScores={() => { audio.playClick(); setShowScores(true); }} />}
              {(state.phase === "result_goal" || state.phase === "result_miss") && (
                <ResultOverlay isGoal={state.phase === "result_goal"} feedback={state.feedback} onContinue={handleContinue} score={state.score} lives={state.lives} />
              )}
              {state.phase === "level_up" && (
                <LevelUpOverlay newLevel={Math.min(state.level + 1, LEVELS.length - 1)} onContinue={handleContinue} />
              )}
              {state.phase === "game_over" && (
                <GameOverOverlay score={state.score} level={state.level} onRestart={handleStart} onScores={() => { audio.playClick(); goToScores(); }} />
              )}
            </>
          )}
        </div>

        {/* Panel matemáticas (fuera del canvas, debajo) */}
        {state.phase === "math" && state.math && (
          <MathPanel
            a={state.math.a} b={state.math.b}
            timeLeft={state.math.timeLeft} maxTime={state.math.maxTime}
            userInput={state.math.userInput}
            onInput={updateMathInput}
            onSubmit={handleSubmitMath}
          />
        )}

        {/* Mensaje de fase */}
        <div style={{ marginTop: "0.5rem", textAlign: "center", display: "flex", justifyContent: "center" }}>
          <div className="game-card" style={{ padding: "0.6rem 0.9rem", maxWidth: 500, background: "rgba(255,255,255,0.16)", borderRadius: "1.2rem" }}>
            <p className="font-game" style={{ color: "#FFF", fontSize: "1rem", marginBottom: "0.25rem" }}>{phaseLabel}</p>
            <p style={{ color: "rgba(255,255,255,0.78)", fontSize: "0.82rem", lineHeight: 1.4, margin: 0 }}>{phaseHint}</p>
            {state.phase === "aiming" && cfg.useCenter && (
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.72rem", marginTop: "0.35rem" }}>
                Origen (0,0) en el centro · Izquierda = negativo.
              </p>
            )}
          </div>
        </div>

        {/* Feedback de disparo */}
        {state.phase === "shooting" && state.feedback && (
          <div style={{ marginTop: "0.5rem", textAlign: "center" }}>
            <div style={{ display: "inline-block", background: "rgba(255,255,255,0.18)", backdropFilter: "blur(4px)", borderRadius: "1rem", padding: "0.4rem 1rem" }}>
              <p className="font-game" style={{ color: "white", fontSize: "clamp(0.8rem,3.5vw,1rem)" }}>{state.feedback}</p>
            </div>
          </div>
        )}

        {/* Coordenada seleccionada */}
        {state.targetCoord && !["menu", "result_goal", "result_miss", "level_up", "game_over"].includes(state.phase) && (
          <div style={{ marginTop: "0.4rem", display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.12)", borderRadius: "0.75rem", padding: "0.3rem 0.75rem", flexWrap: "wrap" }}>
            <span className="font-game" style={{ color: "white", fontSize: "0.8rem" }}>🎯 Objetivo:</span>
            <span className="font-game" style={{ color: "#FFE500", fontSize: "1rem" }}>({state.targetCoord.x}, {state.targetCoord.y})</span>
            <span style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.7rem" }}>
              {cfg.useCenter
                ? `${state.targetCoord.x > 0 ? "Derecha" : state.targetCoord.x < 0 ? "Izquierda" : "Centro"}, ${state.targetCoord.y > 2.5 ? "Alto" : "Bajo"}`
                : `${state.targetCoord.x < 3 ? "Palo izq." : state.targetCoord.x > 7 ? "Palo der." : "Centro"}, ${state.targetCoord.y > 3 ? "Arriba" : "Abajo"}`}
            </span>
          </div>
        )}
      </div>

      <p style={{ marginTop: "0.75rem", color: "rgba(255,255,255,0.35)", fontSize: "0.65rem", fontWeight: 700 }}>
        Tiro Libre Matemático · Para Martín Roldán 🏆
      </p>
    </div>
  );
}


