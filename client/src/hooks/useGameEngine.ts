/**
 * useGameEngine — Motor del juego Tiro Libre Matemático (v2)
 * Corregido: lógica de gol, tipos, timers y evaluación de portero
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { createMathChallenge, evaluateShotOutcome } from "@/lib/gameRules";

export type GamePhase =
  | "menu"
  | "aiming"
  | "math"
  | "shooting"
  | "result_goal"
  | "result_miss"
  | "level_up"
  | "game_over";

export interface Vec2 { x: number; y: number; }

export interface MathChallenge {
  a: number;
  b: number;
  answer: number;
  userInput: string;
  timeLeft: number;
  maxTime: number;
  answered: boolean;
  correct: boolean;
}

export interface GameState {
  phase: GamePhase;
  level: number;
  score: number;
  lives: number;
  streak: number;
  targetCoord: Vec2 | null;
  ballProgress: number;   // 0→1 animación del balón
  ballActive: boolean;
  gkX: number;            // posición portero 0-100
  gkDir: 1 | -1;
  math: MathChallenge | null;
  feedback: string;
  shotsScored: number;    // goles en el nivel actual
}

export interface LevelConfig {
  label: string;
  sublabel: string;
  tableMin: number;
  tableMax: number;
  mathTime: number;
  gkSpeed: number;
  ballDuration: number;
  ballDurationSlow: number;
  hasGK: boolean;
  goalsToWin: number;
  useCenter: boolean;     // true = origen en centro (niveles 3-4)
}

export const LEVELS: LevelConfig[] = [
  {
    label: "Nivel 1", sublabel: "Solo Apuntar",
    tableMin: 0, tableMax: 0, mathTime: 0,
    gkSpeed: 0, ballDuration: 900, ballDurationSlow: 900,
    hasGK: false, goalsToWin: 3, useCenter: false,
  },
  {
    label: "Nivel 2", sublabel: "Tablas del 2 al 5",
    tableMin: 2, tableMax: 5, mathTime: 7,
    gkSpeed: 20, ballDuration: 800, ballDurationSlow: 2200,
    hasGK: true, goalsToWin: 5, useCenter: false,
  },
  {
    label: "Nivel 3", sublabel: "Tablas del 2 al 9",
    tableMin: 2, tableMax: 9, mathTime: 5,
    gkSpeed: 32, ballDuration: 700, ballDurationSlow: 2500,
    hasGK: true, goalsToWin: 5, useCenter: true,
  },
  {
    label: "Nivel 4", sublabel: "Tablas del 6 al 9",
    tableMin: 6, tableMax: 9, mathTime: 4,
    gkSpeed: 46, ballDuration: 600, ballDurationSlow: 2800,
    hasGK: true, goalsToWin: 7, useCenter: true,
  },
];

export const GOAL_W = 10;
export const GOAL_H = 5;
export const BALL_START: Vec2 = { x: 50, y: 90 };

const INIT: GameState = {
  phase: "menu",
  level: 0, score: 0, lives: 3, streak: 0,
  targetCoord: null,
  ballProgress: 0, ballActive: false,
  gkX: 50, gkDir: 1,
  math: null, feedback: "",
  shotsScored: 0,
};

export function useGameEngine() {
  const [state, setState] = useState<GameState>(INIT);
  const rafRef = useRef<number | null>(null);
  const gkRafRef = useRef<number | null>(null);
  const mathIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gkLastTime = useRef<number>(0);
  const gkXRef = useRef<number>(50);
  const gkDirRef = useRef<1 | -1>(1);

  const stopAll = useCallback(() => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    if (gkRafRef.current) { cancelAnimationFrame(gkRafRef.current); gkRafRef.current = null; }
    if (mathIntervalRef.current) { clearInterval(mathIntervalRef.current); mathIntervalRef.current = null; }
  }, []);

  // ── Portero patrulla ──
  const startGK = useCallback((levelIdx: number) => {
    const cfg = LEVELS[levelIdx];
    if (!cfg.hasGK) return;
    gkXRef.current = 50;
    gkDirRef.current = 1;
    gkLastTime.current = performance.now();

    const loop = (now: number) => {
      const dt = (now - gkLastTime.current) / 1000;
      gkLastTime.current = now;
      gkXRef.current += gkDirRef.current * cfg.gkSpeed * dt;
      if (gkXRef.current >= 82) { gkXRef.current = 82; gkDirRef.current = -1; }
      if (gkXRef.current <= 18) { gkXRef.current = 18; gkDirRef.current = 1; }
      setState(prev => {
        if (prev.phase !== "aiming" && prev.phase !== "math") return prev;
        return { ...prev, gkX: gkXRef.current, gkDir: gkDirRef.current };
      });
      gkRafRef.current = requestAnimationFrame(loop);
    };
    gkRafRef.current = requestAnimationFrame(loop);
  }, []);

  // ── Iniciar juego ──
  const startGame = useCallback(() => {
    stopAll();
    gkXRef.current = 50;
    setState({ ...INIT, phase: "aiming", level: 0 });
  }, [stopAll]);

  // ── Seleccionar objetivo ──
  const selectTarget = useCallback((coord: Vec2) => {
    setState(prev => {
      if (prev.phase !== "aiming") return prev;
      const cfg = LEVELS[prev.level];
      if (!cfg.hasGK && cfg.mathTime === 0) {
        // Nivel 1: disparar directo
        return { ...prev, targetCoord: coord, phase: "shooting", ballProgress: 0, ballActive: true };
      }
      const challenge = createMathChallenge(cfg.tableMin, cfg.tableMax);
      return {
        ...prev,
        targetCoord: coord,
        phase: "math",
        math: {
          ...challenge,
          userInput: "",
          timeLeft: cfg.mathTime,
          maxTime: cfg.mathTime,
          answered: false,
          correct: false,
        },
      };
    });
  }, []);

  // ── Timer matemáticas ──
  useEffect(() => {
    if (state.phase !== "math" || !state.math || state.math.answered) return;
    mathIntervalRef.current = setInterval(() => {
      setState(prev => {
        if (prev.phase !== "math" || !prev.math || prev.math.answered) return prev;
        const newTime = Math.max(0, prev.math.timeLeft - 0.1);
        if (newTime <= 0) {
          clearInterval(mathIntervalRef.current!);
          return {
            ...prev,
            phase: "shooting",
            ballProgress: 0,
            ballActive: true,
            math: { ...prev.math, timeLeft: 0, answered: true, correct: false },
            feedback: "⏱ ¡Se acabó el tiempo! Tiro débil...",
          };
        }
        return { ...prev, math: { ...prev.math, timeLeft: newTime } };
      });
    }, 100);
    return () => { if (mathIntervalRef.current) clearInterval(mathIntervalRef.current); };
  }, [state.phase, state.math?.answered]);

  // ── Input matemático ──
  const updateMathInput = useCallback((val: string) => {
    setState(prev => {
      if (prev.phase !== "math" || !prev.math) return prev;
      const clean = val.replace(/\D/g, "").slice(0, 4);
      return { ...prev, math: { ...prev.math, userInput: clean } };
    });
  }, []);

  // ── Confirmar respuesta ──
  const submitMath = useCallback(() => {
    setState(prev => {
      if (prev.phase !== "math" || !prev.math || prev.math.answered) return prev;
      if (mathIntervalRef.current) clearInterval(mathIntervalRef.current);
      const correct = parseInt(prev.math.userInput) === prev.math.answer;
      const fb = correct
        ? `✅ ¡Correcto! ${prev.math.a} × ${prev.math.b} = ${prev.math.answer} — ¡Tiro potente!`
        : `❌ Era ${prev.math.a} × ${prev.math.b} = ${prev.math.answer} — Tiro débil...`;
      return {
        ...prev,
        phase: "shooting",
        ballProgress: 0,
        ballActive: true,
        feedback: fb,
        math: { ...prev.math, answered: true, correct },
      };
    });
  }, []);

  // ── Animación del balón ──
  useEffect(() => {
    if (state.phase !== "shooting" || !state.targetCoord) return;
    if (gkRafRef.current) { cancelAnimationFrame(gkRafRef.current); gkRafRef.current = null; }

    const cfg = LEVELS[state.level];
    const isCorrect = !state.math || state.math.correct;
    const duration = isCorrect ? cfg.ballDuration : cfg.ballDurationSlow;
    const startT = performance.now();
    const snapGkX = state.gkX;
    const snapTarget = state.targetCoord;
    const snapLevel = state.level;
    const snapMathCorrect = isCorrect;

    const animate = (now: number) => {
      const rawT = Math.min((now - startT) / duration, 1);
      const t = 1 - (1 - rawT) * (1 - rawT); // easeOutQuad
      setState(prev => ({ ...prev, ballProgress: t }));
      if (rawT < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        // Evaluar resultado
        const levelCfg = LEVELS[snapLevel];
        const outcome = evaluateShotOutcome(
          snapTarget,
          snapGkX,
          levelCfg.hasGK,
          levelCfg.useCenter,
          snapMathCorrect,
        );
        const isGoal = outcome.isGoal;

        setState(prev => {
          const newScored = prev.shotsScored + (isGoal ? 1 : 0);
          const newStreak = isGoal ? prev.streak + 1 : 0;
          const bonus = newStreak > 1 ? newStreak * 20 : 0;
          const gain = isGoal ? 100 + bonus : 0;
          const newScore = prev.score + gain;
          const newLives = isGoal ? prev.lives : Math.max(0, prev.lives - 1);
          const shouldLevelUp = isGoal && newScored >= levelCfg.goalsToWin && snapLevel < LEVELS.length - 1;
          const gameOver = newLives === 0;

          let phase: GamePhase = isGoal ? "result_goal" : "result_miss";
          if (shouldLevelUp) phase = "level_up";
          if (gameOver) phase = "game_over";

          const fb = isGoal
            ? `⚽ ¡GOOOOL! +${gain} puntos${newStreak > 1 ? ` 🔥 Racha ×${newStreak}` : ""}!`
            : outcome.reason === "offGoal"
              ? `🚫 ¡Fuera! Apunta dentro de la portería.`
              : `🧤 ¡Atajada! El portero llegó. Apunta a una esquina.`;

          return {
            ...prev,
            phase,
            score: newScore,
            lives: newLives,
            streak: newStreak,
            shotsScored: newScored,
            ballActive: false,
            feedback: fb,
          };
        });
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase]);

  // ── Continuar ──
  const continueGame = useCallback(() => {
    setState(prev => {
      const nextLevel = prev.phase === "level_up"
        ? Math.min(prev.level + 1, LEVELS.length - 1)
        : prev.level;
      return {
        ...prev,
        phase: "aiming",
        level: nextLevel,
        targetCoord: null,
        math: null,
        feedback: "",
        ballProgress: 0,
        ballActive: false,
        gkX: 50, gkDir: 1,
        shotsScored: prev.phase === "level_up" ? 0 : prev.shotsScored,
      };
    });
  }, []);

  // ── Iniciar patrulla cuando se apunta ──
  useEffect(() => {
    if (state.phase === "aiming") startGK(state.level);
    return () => {
      if (gkRafRef.current) { cancelAnimationFrame(gkRafRef.current); gkRafRef.current = null; }
    };
  }, [state.phase, state.level, startGK]);

  useEffect(() => () => stopAll(), [stopAll]);

  return { state, startGame, selectTarget, updateMathInput, submitMath, continueGame };
}
