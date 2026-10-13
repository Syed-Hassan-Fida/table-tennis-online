import { MatchCard } from "@/components/MatchCard";
import { LeagueResetButton } from "@/components/LeagueResetButton";
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

  const completed = matches.filter((m) => m.status === "COMPLETED").length;
  const live = matches.filter((m) => m.status === "LIVE").length;

  return (
    <main className="page">
      <div className="page-head-row">
        <div>
          <p className="section-kicker">League fixtures</p>
          <h1 className="page-title">Match pool</h1>
          <p className="lede">
            Double round-robin · Sherry & Ahsan at 3:00 PM · all other fixtures at
            7:30 PM · best of 5 (to 11, win by 2).
          </p>
        </div>
        <LeagueResetButton />
      </div>

      <p className="league-pulse" aria-label="League progress">
        <span>{completed} completed</span>
        <span aria-hidden>·</span>
        <span>{live} live</span>
        <span aria-hidden>·</span>
        <span>{matches.length - completed - live} upcoming</span>
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
