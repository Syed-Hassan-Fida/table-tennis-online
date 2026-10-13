"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  gameWinner,
  isGameComplete,
  isMatchComplete,
  matchGamesNeeded,
} from "@/lib/scoring";

async function recalculateMatch(matchId: string) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { games: { orderBy: { gameNumber: "asc" } } },
  });
  if (!match) throw new Error("Match not found");

  let homeGames = 0;
  let awayGames = 0;

  for (const g of match.games) {
    if (g.isComplete && g.winnerSide === "HOME") homeGames += 1;
    if (g.isComplete && g.winnerSide === "AWAY") awayGames += 1;
  }

  const complete = isMatchComplete(homeGames, awayGames);
  const need = matchGamesNeeded();
  const hasPoints =
    homeGames + awayGames > 0 ||
    match.games.some((g) => g.homePoints + g.awayPoints > 0);

  let winnerId: string | null = null;
  let status: string;

  if (complete) {
    winnerId = homeGames >= need ? match.homeTeamId : match.awayTeamId;
    status = "COMPLETED";
  } else if (hasPoints) {
    status = "LIVE";
    winnerId = null;
  } else {
    status = "SCHEDULED";
    winnerId = null;
  }

  return prisma.match.update({
    where: { id: matchId },
    data: {
      homeScore: homeGames,
      awayScore: awayGames,
      winnerId,
      status,
    },
    include: {
      homeTeam: true,
      awayTeam: true,
      games: { orderBy: { gameNumber: "asc" } },
    },
  });
}

function revalidateMatchPaths(matchId: string) {
  revalidatePath("/");
  revalidatePath("/matches");
  revalidatePath(`/matches/${matchId}`);
  revalidatePath("/leaderboard");
}

export async function setGameScore(
  matchId: string,
  gameNumber: number,
  homePoints: number,
  awayPoints: number
) {
  const home = Math.max(0, Math.min(30, Math.floor(homePoints)));
  const away = Math.max(0, Math.min(30, Math.floor(awayPoints)));
  const complete = isGameComplete(home, away);
  const winner = gameWinner(home, away);

  await prisma.matchGame.update({
    where: { matchId_gameNumber: { matchId, gameNumber } },
    data: {
      homePoints: home,
      awayPoints: away,
      isComplete: complete,
      winnerSide: winner,
    },
  });

  if (!complete) {
    await prisma.matchGame.updateMany({
      where: { matchId, gameNumber: { gt: gameNumber } },
      data: {
        homePoints: 0,
        awayPoints: 0,
        isComplete: false,
        winnerSide: null,
      },
    });
  }

  let updated = await recalculateMatch(matchId);

  if (updated.status === "COMPLETED") {
    const played = updated.homeScore + updated.awayScore;
    await prisma.matchGame.updateMany({
      where: {
        matchId,
        gameNumber: { gt: played },
        isComplete: false,
      },
      data: { homePoints: 0, awayPoints: 0, winnerSide: null },
    });
    updated = await recalculateMatch(matchId);
  }

  revalidateMatchPaths(matchId);
  return updated;
}

export async function adjustPoint(
  matchId: string,
  gameNumber: number,
  side: "HOME" | "AWAY",
  delta: number
) {
  if (delta === 0) {
    throw new Error("No score change");
  }

  const games = await prisma.matchGame.findMany({
    where: { matchId },
    orderBy: { gameNumber: "asc" },
  });
  if (games.length === 0) throw new Error("Match games not found");

  const game = games.find((g) => g.gameNumber === gameNumber);
  if (!game) throw new Error("Game not found");

  let homeWins = 0;
  let awayWins = 0;
  for (const g of games) {
    if (g.isComplete && g.winnerSide === "HOME") homeWins++;
    if (g.isComplete && g.winnerSide === "AWAY") awayWins++;
  }

  if (delta > 0) {
    if (isMatchComplete(homeWins, awayWins)) {
      throw new Error("Match already completed");
    }
    const currentOpen = games.find((g) => !g.isComplete) ?? games[games.length - 1];
    if (currentOpen.gameNumber !== gameNumber) {
      throw new Error("Score only the active game");
    }
  } else {
    const pts = side === "HOME" ? game.homePoints : game.awayPoints;
    if (pts <= 0) {
      throw new Error("Nothing to undo");
    }
  }

  const nextHome = side === "HOME" ? Math.max(0, game.homePoints + delta) : game.homePoints;
  const nextAway = side === "AWAY" ? Math.max(0, game.awayPoints + delta) : game.awayPoints;

  return setGameScore(matchId, gameNumber, nextHome, nextAway);
}

export async function resetMatch(matchId: string) {
  await prisma.matchGame.updateMany({
    where: { matchId },
    data: {
      homePoints: 0,
      awayPoints: 0,
      isComplete: false,
      winnerSide: null,
    },
  });

  const updated = await prisma.match.update({
    where: { id: matchId },
    data: {
      homeScore: 0,
      awayScore: 0,
      winnerId: null,
      status: "SCHEDULED",
    },
    include: {
      homeTeam: true,
      awayTeam: true,
      games: { orderBy: { gameNumber: "asc" } },
    },
  });

  revalidateMatchPaths(matchId);
  return updated;
}

export async function startMatch(matchId: string) {
  const updated = await prisma.match.update({
    where: { id: matchId },
    data: { status: "LIVE" },
    include: {
      homeTeam: true,
      awayTeam: true,
      games: { orderBy: { gameNumber: "asc" } },
    },
  });
  revalidateMatchPaths(matchId);
  return updated;
}

/** Wipe every match score/status so the league starts clean. */
export async function resetLeague() {
  await prisma.matchGame.updateMany({
    data: {
      homePoints: 0,
      awayPoints: 0,
      isComplete: false,
      winnerSide: null,
    },
  });

  const result = await prisma.match.updateMany({
    data: {
      homeScore: 0,
      awayScore: 0,
      winnerId: null,
      status: "SCHEDULED",
    },
  });

  revalidatePath("/");
  revalidatePath("/matches");
  revalidatePath("/leaderboard");
  revalidatePath("/teams");

  return { resetMatches: result.count };
}
