import { prisma } from "@/lib/prisma";
import { rankStandings, type StandingRow } from "@/lib/scoring";

export async function getStandings(): Promise<StandingRow[]> {
  const teams = await prisma.team.findMany({ orderBy: { name: "asc" } });
  const matches = await prisma.match.findMany({
    where: { status: "COMPLETED" },
    include: { games: true },
  });

  const map = new Map<string, StandingRow>();
  for (const t of teams) {
    map.set(t.id, {
      teamId: t.id,
      teamName: t.name,
      played: 0,
      won: 0,
      lost: 0,
      gamesFor: 0,
      gamesAgainst: 0,
      gameDiff: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      pointDiff: 0,
      winPct: 0,
    });
  }

  for (const m of matches) {
    const home = map.get(m.homeTeamId);
    const away = map.get(m.awayTeamId);
    if (!home || !away) continue;

    home.played += 1;
    away.played += 1;
    home.gamesFor += m.homeScore;
    home.gamesAgainst += m.awayScore;
    away.gamesFor += m.awayScore;
    away.gamesAgainst += m.homeScore;

    for (const g of m.games) {
      if (!g.isComplete) continue;
      home.pointsFor += g.homePoints;
      home.pointsAgainst += g.awayPoints;
      away.pointsFor += g.awayPoints;
      away.pointsAgainst += g.homePoints;
    }

    if (m.winnerId === m.homeTeamId) {
      home.won += 1;
      away.lost += 1;
    } else if (m.winnerId === m.awayTeamId) {
      away.won += 1;
      home.lost += 1;
    }
  }

  for (const row of map.values()) {
    row.gameDiff = row.gamesFor - row.gamesAgainst;
    row.pointDiff = row.pointsFor - row.pointsAgainst;
    row.winPct = row.played === 0 ? 0 : row.won / row.played;
  }

  return rankStandings([...map.values()]);
}
