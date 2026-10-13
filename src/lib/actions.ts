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

  let winnerId: string | null = null;
  let status = match.status;

  if (complete) {
    winnerId = homeGames >= need ? match.homeTeamId : match.awayTeamId;
    status = "COMPLETED";
  } else if (homeGames > 0 || awayGames > 0 || match.games.some((g) => g.homePoints + g.awayPoints > 0)) {
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

  // If this game isn't complete, clear later games that shouldn't count yet
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

  // Lock games beyond the deciding game once match is decided
  const updated = await recalculateMatch(matchId);

  if (updated.status === "COMPLETED") {
    const need = matchGamesNeeded();
    const played = updated.homeScore + updated.awayScore;
    // Keep only games that were needed; zero out unused trailing games visually already seeded
    if (updated.homeScore >= need || updated.awayScore >= need) {
      await prisma.matchGame.updateMany({
        where: {
          matchId,
          gameNumber: { gt: played },
          isComplete: false,
        },
        data: { homePoints: 0, awayPoints: 0, winnerSide: null },
      });
    }
  }

  revalidatePath("/");
  revalidatePath("/matches");
  revalidatePath(`/matches/${matchId}`);
  revalidatePath("/leaderboard");

  return recalculateMatch(matchId);
}

export async function adjustPoint(
  matchId: string,
  gameNumber: number,
  side: "HOME" | "AWAY",
  delta: number
) {
  const game = await prisma.matchGame.findUnique({
    where: { matchId_gameNumber: { matchId, gameNumber } },
  });
  if (!game) throw new Error("Game not found");

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) throw new Error("Match not found");
  if (match.status === "COMPLETED") {
    // Allow edits — recalculate after
  }

  // Only allow scoring on the current open game
  const games = await prisma.matchGame.findMany({
    where: { matchId },
    orderBy: { gameNumber: "asc" },
  });

  let homeWins = 0;
  let awayWins = 0;
  for (const g of games) {
    if (g.isComplete && g.winnerSide === "HOME") homeWins++;
    if (g.isComplete && g.winnerSide === "AWAY") awayWins++;
  }
  if (isMatchComplete(homeWins, awayWins) && delta > 0) {
    // Match already decided — still allow adjust via setGameScore path for corrections
  }

  const currentOpen = games.find((g) => !g.isComplete) ?? games[games.length - 1];
  if (currentOpen.gameNumber !== gameNumber && delta !== 0) {
    // Allow editing completed games for corrections
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

  await prisma.match.update({
    where: { id: matchId },
    data: {
      homeScore: 0,
      awayScore: 0,
      winnerId: null,
      status: "SCHEDULED",
    },
  });

  revalidatePath("/");
  revalidatePath("/matches");
  revalidatePath(`/matches/${matchId}`);
  revalidatePath("/leaderboard");

  return prisma.match.findUnique({
    where: { id: matchId },
    include: {
      homeTeam: true,
      awayTeam: true,
      games: { orderBy: { gameNumber: "asc" } },
    },
  });
}

export async function startMatch(matchId: string) {
  await prisma.match.update({
    where: { id: matchId },
    data: { status: "LIVE" },
  });
  revalidatePath("/");
  revalidatePath("/matches");
  revalidatePath(`/matches/${matchId}`);
}
