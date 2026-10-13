import Link from "next/link";
import { notFound } from "next/navigation";
import { ScoreBoard } from "@/components/ScoreBoard";
import { ScoreSync } from "@/components/ScoreSync";
import { prisma } from "@/lib/prisma";
import { formatMatchDate, formatMatchTime, statusLabel } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function MatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const match = await prisma.match.findUnique({
    where: { id },
    include: {
      homeTeam: true,
      awayTeam: true,
      games: { orderBy: { gameNumber: "asc" } },
    },
  });

  if (!match) notFound();

  return (
    <main className="page">
      <p className="lede" style={{ marginBottom: "0.75rem" }}>
        <Link href="/matches">← Match pool</Link>
      </p>
      <h1 className="page-title">
        Match {match.matchNumber}
      </h1>
      <p className="lede">
        Round {match.round} · {statusLabel(match.status)} ·{" "}
        {formatMatchDate(match.scheduledAt)} · {formatMatchTime(match.scheduledAt)}
      </p>

      <div className="section">
        <ScoreSync
          matchId={match.id}
          games={match.games.map((g) => ({
            gameNumber: g.gameNumber,
            homePoints: g.homePoints,
            awayPoints: g.awayPoints,
          }))}
        />
        <ScoreBoard match={match} />
      </div>
    </main>
  );
}
