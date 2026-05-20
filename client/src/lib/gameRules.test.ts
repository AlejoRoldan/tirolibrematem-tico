import { describe, it, expect } from "vitest";
import { createMathChallenge, evaluateShotOutcome, GOAL_W, GOAL_H } from "./gameRules";

describe("gameRules", () => {
  it("genera desafíos dentro del rango configurado", () => {
    const challenge = createMathChallenge(2, 5);
    expect(challenge.a).toBeGreaterThanOrEqual(2);
    expect(challenge.a).toBeLessThanOrEqual(5);
    expect(challenge.b).toBeGreaterThanOrEqual(2);
    expect(challenge.b).toBeLessThanOrEqual(9);
    expect(challenge.answer).toBe(challenge.a * challenge.b);
  });

  it("detecta un gol válido cuando el portero no intercepta", () => {
    const target = { x: GOAL_W / 2, y: GOAL_H / 2 };
    const outcome = evaluateShotOutcome(target, 0, true, false, true);
    expect(outcome.isGoal).toBe(true);
    expect(outcome.reason).toBe("goal");
  });

  it("detecta un tiro fuera de la portería", () => {
    const target = { x: GOAL_W + 1, y: GOAL_H / 2 };
    const outcome = evaluateShotOutcome(target, 50, true, false, true);
    expect(outcome.isGoal).toBe(false);
    expect(outcome.reason).toBe("offGoal");
  });

  it("detecta un punto dentro de la portería en coordenadas centradas", () => {
    const target = { x: 0, y: GOAL_H / 2 };
    expect(target.x).toBeGreaterThanOrEqual(-GOAL_W / 2);
    expect(target.x).toBeLessThanOrEqual(GOAL_W / 2);
    const outcome = evaluateShotOutcome(target, 100, false, true, true);
    expect(outcome.isGoal).toBe(true);
    expect(outcome.reason).toBe("goal");
  });

  it("detecta un gol válido en el modo de coordenadas centradas", () => {
    const target = { x: 0, y: GOAL_H / 2 };
    const outcome = evaluateShotOutcome(target, 100, true, true, true);
    expect(outcome.isGoal).toBe(true);
    expect(outcome.reason).toBe("goal");
  });

  it("detecta una atajada del portero cuando la distancia es menor que el alcance", () => {
    const target = { x: GOAL_W / 2, y: GOAL_H / 2 };
    const gkX = 50;
    const outcome = evaluateShotOutcome(target, gkX, true, false, false);
    expect(outcome.isGoal).toBe(false);
    expect(outcome.reason).toBe("saved");
  });
});
