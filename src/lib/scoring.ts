export type PointsToWin = 11 | 21;

export const DEFAULT_POINTS_TO_WIN: PointsToWin = 21;

export function normalizePointsToWin(value: number): PointsToWin {
  return value === 11 ? 11 : 21;
}

/** Game ends at pointsToWin, must win by 2. */
export function isGameComplete(
  home: number,
  away: number,
  pointsToWin: number = DEFAULT_POINTS_TO_WIN
): boolean {
  const target = normalizePointsToWin(pointsToWin);
  const max = Math.max(home, away);
  const min = Math.min(home, away);
  return max >= target && max - min >= 2;
}

export function gameWinner(
  home: number,
  away: number,
  pointsToWin: number = DEFAULT_POINTS_TO_WIN
): "HOME" | "AWAY" | null {
  if (!isGameComplete(home, away, pointsToWin)) return null;
  return home > away ? "HOME" : "AWAY";
}

/** Best of 5 — first to 3 games wins the match */
export function matchGamesNeeded(bestOf = 5): number {
  return Math.floor(bestOf / 2) + 1;
}

export function isMatchComplete(homeGames: number, awayGames: number, bestOf = 5): boolean {
  const need = matchGamesNeeded(bestOf);
  return homeGames >= need || awayGames >= need;
}

export function servesPerTurn(pointsToWin: number): number {
  return normalizePointsToWin(pointsToWin) === 11 ? 2 : 5;
}

export function scoringSystemLabel(pointsToWin: number): string {
  return normalizePointsToWin(pointsToWin) === 11
    ? "Modern (11 pts)"
    : "Classic (21 pts)";
}

export type StandingRow = {
  teamId: string;
  teamName: string;
  played: number;
  won: number;
  lost: number;
  gamesFor: number;
  gamesAgainst: number;
  gameDiff: number;
  pointsFor: number;
  pointsAgainst: number;
  pointDiff: number;
  winPct: number;
};

export function rankStandings(rows: StandingRow[]): StandingRow[] {
  return [...rows].sort((a, b) => {
    if (b.won !== a.won) return b.won - a.won;
    if (b.gameDiff !== a.gameDiff) return b.gameDiff - a.gameDiff;
    if (b.pointDiff !== a.pointDiff) return b.pointDiff - a.pointDiff;
    if (b.winPct !== a.winPct) return b.winPct - a.winPct;
    return a.teamName.localeCompare(b.teamName);
  });
}
