export interface Vec2 {
  x: number;
  y: number;
}

export interface MathChallengeTemplate {
  a: number;
  b: number;
  answer: number;
}

export interface ShotOutcome {
  isGoal: boolean;
  reason: "goal" | "offGoal" | "saved";
  gkReach: number;
}

export const GOAL_W = 10;
export const GOAL_H = 5;

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function createMathChallenge(tableMin: number, tableMax: number): MathChallengeTemplate {
  const a = randInt(tableMin, tableMax);
  const b = randInt(2, 9);
  return { a, b, answer: a * b };
}

export function isPointInsideGoal(target: Vec2, useCenter: boolean): boolean {
  if (useCenter) {
    return target.x >= -GOAL_W / 2 && target.x <= GOAL_W / 2 && target.y > 0 && target.y <= GOAL_H;
  }
  return target.x >= 0 && target.x <= GOAL_W && target.y > 0 && target.y <= GOAL_H;
}

export function evaluateShotOutcome(
  target: Vec2,
  gkX: number,
  hasGK: boolean,
  useCenter: boolean,
  mathCorrect: boolean,
): ShotOutcome {
  const inGoal = isPointInsideGoal(target, useCenter);
  const normTargetX = useCenter
    ? ((target.x + GOAL_W / 2) / GOAL_W) * 100
    : (target.x / GOAL_W) * 100;
  const gkReach = mathCorrect ? 13 : 42;
  const gkSaves = hasGK && Math.abs(gkX - normTargetX) < gkReach;

  if (!inGoal) {
    return { isGoal: false, reason: "offGoal", gkReach };
  }
  if (gkSaves) {
    return { isGoal: false, reason: "saved", gkReach };
  }
  return { isGoal: true, reason: "goal", gkReach };
}
