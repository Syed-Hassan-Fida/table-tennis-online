import Link from "next/link";
import { ArrowRight, CalendarDays, Trophy, Users, Zap } from "lucide-react";
import { MatchCard } from "@/components/MatchCard";
import { prisma } from "@/lib/prisma";
import { getStandings } from "@/lib/standings";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [matches, standings, teams] = await Promise.all([
    prisma.match.findMany({
      include: { homeTeam: true, awayTeam: true },
      orderBy: [{ scheduledAt: "asc" }, { matchNumber: "asc" }],
    }),
    getStandings(),
    prisma.team.findMany({ orderBy: { name: "asc" } }),
  ]);

  const live = matches.filter((m) => m.status === "LIVE");
  const featured =
    live[0] ?? matches.find((m) => m.status !== "COMPLETED") ?? matches[0];
  const upcoming = matches.filter((m) => m.status !== "COMPLETED").slice(0, 4);
  const completed = matches.filter((m) => m.status === "COMPLETED").length;
  const leader = completed > 0 ? standings[0] : null;

  return (
    <main className="page">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Doubles table tennis league</p>
          <h1 className="hero-title">
            Smash
            <span>League</span>
          </h1>
          <p className="hero-lede">
            Four teams. Twelve fixtures. Click-to-score match center with live
            standings — Sherry & Ahsan at 3:00 PM, everyone else at 7:30 PM.
          </p>
          <div className="hero-cta">
            <Link
              href={featured ? `/matches/${featured.id}` : "/matches"}
              className="btn btn-primary"
            >
              {live.length > 0 ? "Enter live match" : "Open next match"}
              <ArrowRight size={16} aria-hidden />
            </Link>
            <Link href="/leaderboard" className="btn btn-ghost">
              View standings
            </Link>
          </div>
        </div>

        {featured && (
          <div className="hero-feature-wrap">
            <MatchCard {...featured} />
          </div>
        )}
      </section>

      <section className="stats-strip" aria-label="League snapshot">
        <div className="stat">
          <Users size={16} aria-hidden />
          <span>Teams</span>
          <strong>{teams.length}</strong>
        </div>
        <div className="stat">
          <CalendarDays size={16} aria-hidden />
          <span>Matches</span>
          <strong>{matches.length}</strong>
        </div>
        <div className="stat">
          <Zap size={16} aria-hidden />
          <span>Completed</span>
          <strong>{completed}</strong>
        </div>
        <div className="stat">
          <Trophy size={16} aria-hidden />
          <span>Leader</span>
          <strong>{leader ? leader.teamName.split(" & ")[0] : "TBD"}</strong>
        </div>
      </section>

      {live.length > 0 && (
        <section className="section">
          <div className="section-head">
            <div>
              <p className="section-kicker">In progress</p>
              <h2>Live now</h2>
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
            <p className="section-kicker">Fixtures</p>
            <h2>Up next</h2>
            <p>Upcoming matches from the league pool.</p>
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

      <section className="section">
        <div className="section-head">
          <div>
            <p className="section-kicker">Table</p>
            <h2>Standings preview</h2>
            <p>Ranked by wins, then game difference, then point difference.</p>
          </div>
          <Link href="/leaderboard" className="btn btn-ghost">
            Full table
          </Link>
        </div>
        <div className="preview-standings">
          {standings.slice(0, 4).map((row, i) => (
            <div key={row.teamId} className={`preview-row ${i === 0 && completed > 0 ? "leader" : ""}`}>
              <span className="preview-rank">{i + 1}</span>
              <span className="preview-team">{row.teamName}</span>
              <span className="preview-record">
                {row.won}W–{row.lost}L
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <p className="section-kicker">Roster</p>
            <h2>Teams</h2>
          </div>
          <Link href="/teams" className="btn btn-ghost">
            All teams
          </Link>
        </div>
        <div className="teams-grid">
          {teams.map((t, i) => (
            <article key={t.id} className={`team-panel accent-${(i % 4) + 1}`}>
              <h3>{t.name}</h3>
              <p>
                {t.player1} · {t.player2}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
