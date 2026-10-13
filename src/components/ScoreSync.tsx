"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { setGameScore } from "@/lib/actions";

type GameSnap = {
  gameNumber: number;
  homePoints: number;
  awayPoints: number;
};

type MatchSnap = {
  matchId: string;
  games: GameSnap[];
  updatedAt: number;
};

const KEY = "smash-league-scores-v1";

function loadAll(): Record<string, MatchSnap> {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Record<string, MatchSnap>) : {};
  } catch {
    return {};
  }
}

function saveOne(snap: MatchSnap) {
  const all = loadAll();
  all[snap.matchId] = snap;
  localStorage.setItem(KEY, JSON.stringify(all));
}

type Props = {
  matchId: string;
  games: GameSnap[];
  serverUpdatedAt?: string | number | Date;
};

/**
 * Mirrors scores to localStorage and restores them after Vercel cold starts
 * when the serverless /tmp SQLite copy is reset.
 */
export function ScoreSync({ matchId, games }: Props) {
  const router = useRouter();
  const restored = useRef(false);

  useEffect(() => {
    const hasPoints = games.some((g) => g.homePoints > 0 || g.awayPoints > 0);
    if (hasPoints) {
      saveOne({ matchId, games, updatedAt: Date.now() });
      return;
    }

    if (restored.current) return;
    const cached = loadAll()[matchId];
    if (!cached?.games?.some((g) => g.homePoints > 0 || g.awayPoints > 0)) return;

    restored.current = true;
    (async () => {
      for (const g of cached.games) {
        if (g.homePoints === 0 && g.awayPoints === 0) continue;
        await setGameScore(matchId, g.gameNumber, g.homePoints, g.awayPoints);
      }
      router.refresh();
    })();
  }, [matchId, games, router]);

  return null;
}
