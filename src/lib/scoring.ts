/** ITTF-style game: first to 11, win by 2 */
export function isGameComplete(home: number, away: number): boolean {
  const max = Math.max(home, away);
  const min = Math.min(home, away);
  return max >= 11 && max - min >= 2;
}

export function gameWinner(home: number, away: number): "HOME" | "AWAY" | null {
  if (!isGameComplete(home, away)) return null;
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
