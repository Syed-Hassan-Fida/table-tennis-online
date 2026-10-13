import {
  gameWinner,
  isGameComplete,
  isMatchComplete,
  matchGamesNeeded,
} from "@/lib/scoring";

export type GameState = {
  id: string;
  gameNumber: number;
  homePoints: number;
  awayPoints: number;
  isComplete: boolean;
  winnerSide: string | null;
};

export type MatchSnapshot = {
  id: string;
  status: string;
  homeScore: number;
  awayScore: number;
  games: GameState[];
};

export function fingerprintMatch(m: {
  id: string;
  status: string;
  homeScore: number;
  awayScore: number;
  games: Array<{
    gameNumber: number;
    homePoints: number;
    awayPoints: number;
    isComplete: boolean;
  }>;
}): string {
  const games = m.games
    .map((g) => `${g.gameNumber}:${g.homePoints}-${g.awayPoints}:${g.isComplete ? 1 : 0}`)
    .join(",");
  return `${m.id}|${m.status}|${m.homeScore}-${m.awayScore}|${games}`;
}

export function deriveFromGames(games: GameState[]) {
  let homeScore = 0;
  let awayScore = 0;
  for (const g of games) {
    if (g.isComplete && g.winnerSide === "HOME") homeScore += 1;
    if (g.isComplete && g.winnerSide === "AWAY") awayScore += 1;
  }
  const decided = isMatchComplete(homeScore, awayScore);
  const hasPoints =
    homeScore + awayScore > 0 || games.some((g) => g.homePoints + g.awayPoints > 0);
  const status = decided ? "COMPLETED" : hasPoints ? "LIVE" : "SCHEDULED";
  return { homeScore, awayScore, decided, status, need: matchGamesNeeded() };
}

export function applyPointDelta(
  games: GameState[],
  gameNumber: number,
  side: "HOME" | "AWAY",
  delta: number
): GameState[] {
  return games.map((g) => {
    if (g.gameNumber !== gameNumber) return g;
    const homePoints =
      side === "HOME" ? Math.max(0, Math.min(30, g.homePoints + delta)) : g.homePoints;
    const awayPoints =
      side === "AWAY" ? Math.max(0, Math.min(30, g.awayPoints + delta)) : g.awayPoints;
    const complete = isGameComplete(homePoints, awayPoints);
    return {
      ...g,
      homePoints,
      awayPoints,
      isComplete: complete,
      winnerSide: gameWinner(homePoints, awayPoints),
    };
  });
}

/** Active game for adding points, or last game with points for undo. */
export function resolveTargetGame(
  games: GameState[],
  side: "HOME" | "AWAY",
  delta: number
): GameState {
  const ordered = [...games].sort((a, b) => a.gameNumber - b.gameNumber);

  if (delta > 0) {
    return ordered.find((g) => !g.isComplete) ?? ordered[ordered.length - 1];
  }

  for (let i = ordered.length - 1; i >= 0; i--) {
    const g = ordered[i];
    const pts = side === "HOME" ? g.homePoints : g.awayPoints;
    if (pts > 0) return g;
  }

  return ordered.find((g) => !g.isComplete) ?? ordered[ordered.length - 1];
}
