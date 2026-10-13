import { prisma } from "@/lib/prisma";
import {
  DEFAULT_POINTS_TO_WIN,
  normalizePointsToWin,
  type PointsToWin,
} from "@/lib/scoring";

export async function getLeagueConfig(): Promise<{ pointsToWin: PointsToWin }> {
  const existing = await prisma.leagueConfig.findUnique({ where: { id: "default" } });
  if (existing) {
    return { pointsToWin: normalizePointsToWin(existing.pointsToWin) };
  }

  const created = await prisma.leagueConfig.create({
    data: { id: "default", pointsToWin: DEFAULT_POINTS_TO_WIN },
  });
  return { pointsToWin: normalizePointsToWin(created.pointsToWin) };
}

export async function isTournamentStarted(): Promise<boolean> {
  const active = await prisma.match.count({
    where: {
      OR: [
        { status: { in: ["LIVE", "COMPLETED"] } },
        { homeScore: { gt: 0 } },
        { awayScore: { gt: 0 } },
        { games: { some: { OR: [{ homePoints: { gt: 0 } }, { awayPoints: { gt: 0 } }] } } },
      ],
    },
  });
  return active > 0;
}
