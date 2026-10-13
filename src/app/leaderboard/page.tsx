import { LeaderboardTable } from "@/components/LeaderboardTable";
import { LeagueResetButton } from "@/components/LeagueResetButton";
import { getStandings } from "@/lib/standings";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const rows = await getStandings();

  return (
    <main className="page">
      <div className="page-head-row">
        <div>
          <p className="section-kicker">Competition table</p>
          <h1 className="page-title">Standings</h1>
          <p className="lede">
            Ranked by wins, then game difference, then point difference. Matches are
            best of 5 with the league scoring system (11 or 21, must win by 2).
          </p>
        </div>
        <LeagueResetButton />
      </div>
      <div className="section">
        <LeaderboardTable rows={rows} />
      </div>
    </main>
  );
}
