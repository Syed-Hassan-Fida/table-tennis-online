import Link from "next/link";
import { MatchCard } from "@/components/MatchCard";
import { prisma } from "@/lib/prisma";
import { getStandings } from "@/lib/standings";
import { formatMatchTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [matches, standings, teams] = await Promise.all([
    prisma.match.findMany({
      include: { homeTeam: true, awayTeam: true },
      orderBy: [{ scheduledAt: "asc" }, { matchNumber: "asc" }],
    }),
    getStandings(),
    prisma.team.count(),
  ]);

  const first = matches[0];
  const upcoming = matches.filter((m) => m.status !== "COMPLETED").slice(0, 4);
  const live = matches.filter((m) => m.status === "LIVE");
  const completed = matches.filter((m) => m.status === "COMPLETED").length;

  return (
    <main className="page">
      <section className="hero">
        <div className="hero-copy">
          <p className="hero-brand">
            Smash
            <span>League</span>
          </p>
          <h1>Doubles table tennis. Full league. Live scoring.</h1>
          <p>
            Four teams. Twelve matches. Sherry & Ahsan tip off at 3:00 PM —
            everyone else plays at 7:30 PM.
          </p>
          <div className="hero-cta">
            <Link
              href={first ? `/matches/${first.id}` : "/matches"}
              className="btn btn-primary"
            >
              Open first match
            </Link>
            <Link href="/leaderboard" className="btn btn-ghost">
              View leaderboard
            </Link>
          </div>
        </div>

        <div className="hero-stage" aria-hidden>
          <div className="hero-court" />
          <div className="hero-streak hero-streak-a" />
          <div className="hero-streak hero-streak-b" />
          <div className="hero-paddle">
            <div className="hero-ball" />
          </div>
          <div className="hero-chip">Best of 5</div>
        </div>
      </section>

      <div className="stats-strip" aria-label="League snapshot">
        <div className="stat">
          <span>Teams</span>
          <strong>{teams}</strong>
        </div>
        <div className="stat">
          <span>Match pool</span>
          <strong>{matches.length}</strong>
        </div>
        <div className="stat">
          <span>Completed</span>
          <strong>{completed}</strong>
        </div>
        <div className="stat">
          <span>Leader</span>
          <strong>
            {completed > 0
              ? (standings[0]?.teamName.split(" & ")[0] ?? "—")
              : "TBD"}
          </strong>
        </div>
      </div>

      {first && (
        <section className="section">
          <div className="section-head">
            <div>
              <p className="section-kicker">Tip-off</p>
              <h2>Playing first</h2>
              <p>
                Match {first.matchNumber} · {formatMatchTime(first.scheduledAt)} ·{" "}
                {first.homeTeam.name} vs {first.awayTeam.name}
              </p>
            </div>
          </div>
          <div className="match-list">
            <MatchCard {...first} />
          </div>
        </section>
      )}

      {live.length > 0 && (
        <section className="section">
          <div className="section-head">
            <div>
              <p className="section-kicker">Right now</p>
              <h2>Live now</h2>
              <p>Matches currently in progress.</p>
            </div>
          </div>
          <div className="match-list">
            {live.map((m) => (
              <MatchCard key={m.id} {...m} />
            ))}
          </div>
        </section>
      )}

      <section className="section">
        <div className="section-head">
          <div>
            <p className="section-kicker">Schedule</p>
            <h2>Up next</h2>
            <p>Upcoming fixtures from the league pool.</p>
          </div>
          <Link href="/matches" className="btn btn-ghost">
            All matches
          </Link>
        </div>
        <div className="match-list">
          {upcoming.map((m) => (
            <MatchCard key={m.id} {...m} />
          ))}
        </div>
      </section>
    </main>
  );
}
