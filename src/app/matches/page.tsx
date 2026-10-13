import { MatchCard } from "@/components/MatchCard";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function MatchesPage() {
  const matches = await prisma.match.findMany({
    include: { homeTeam: true, awayTeam: true },
    orderBy: [{ matchNumber: "asc" }],
  });

  const byRound = matches.reduce<Record<number, typeof matches>>((acc, m) => {
    (acc[m.round] ??= []).push(m);
    return acc;
  }, {});

  return (
    <main className="page">
      <p className="section-kicker">League fixtures</p>
      <h1 className="page-title">Match pool</h1>
      <p className="lede">
        Complete double round-robin league. Matches with Sherry & Ahsan are at 3:00
        PM; all other fixtures tip at 7:30 PM. Best of 5 games (first to 11, win by 2).
      </p>

      {Object.entries(byRound).map(([round, list]) => (
        <section key={round} className="section">
          <div className="section-head">
            <div>
              <p className="section-kicker">{list.length} fixtures</p>
              <h2>Round {round}</h2>
            </div>
          </div>
          <div className="match-list">
            {list.map((m) => (
              <MatchCard key={m.id} {...m} />
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
