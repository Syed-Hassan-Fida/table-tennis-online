import { prisma } from "@/lib/prisma";
import { getStandings } from "@/lib/standings";

export const dynamic = "force-dynamic";

export default async function TeamsPage() {
  const [teams, standings] = await Promise.all([
    prisma.team.findMany({ orderBy: { name: "asc" } }),
    getStandings(),
  ]);

  const byId = Object.fromEntries(standings.map((s) => [s.teamId, s]));

  return (
    <main className="page">
      <p className="section-kicker">The roster</p>
      <h1 className="page-title">Teams</h1>
      <p className="lede">Registered doubles pairs for the Smash League season.</p>
      <div className="section teams-grid">
        {teams.map((t) => {
          const s = byId[t.id];
          return (
            <article key={t.id} className="team-panel">
              <h3>{t.name}</h3>
              <p>
                {t.player1} & {t.player2}
              </p>
              <p style={{ marginTop: "0.75rem" }}>
                {s ? `${s.won}W – ${s.lost}L · ${s.played} played` : "0 played"}
              </p>
            </article>
          );
        })}
      </div>
    </main>
  );
}
