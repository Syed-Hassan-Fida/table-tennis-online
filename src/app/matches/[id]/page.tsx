import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ScoreBoard } from "@/components/ScoreBoard";
import { prisma } from "@/lib/prisma";
import { getLeagueConfig } from "@/lib/league-config";
import { formatMatchDate, formatMatchTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function MatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [match, config] = await Promise.all([
    prisma.match.findUnique({
      where: { id },
      include: {
        homeTeam: true,
        awayTeam: true,
        games: { orderBy: { gameNumber: "asc" } },
      },
    }),
    getLeagueConfig(),
  ]);

  if (!match) notFound();

  return (
    <main className="page match-page">
      <Link href="/matches" className="back-link">
        <ArrowLeft size={16} aria-hidden />
        Match pool
      </Link>

      <header className="match-page-head">
        <div>
          <p className="section-kicker">Match center</p>
          <h1 className="page-title">Match {match.matchNumber}</h1>
          <p className="lede">
            Round {match.round} · {formatMatchDate(match.scheduledAt)} ·{" "}
            {formatMatchTime(match.scheduledAt)} · games to {config.pointsToWin}
          </p>
        </div>
      </header>

      <ScoreBoard match={match} pointsToWin={config.pointsToWin} />
    </main>
  );
}
