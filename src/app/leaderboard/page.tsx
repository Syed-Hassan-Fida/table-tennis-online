import { LeaderboardTable } from "@/components/LeaderboardTable";
import { getStandings } from "@/lib/standings";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const rows = await getStandings();

  return (
    <main className="page">
      <p className="section-kicker">Standings</p>
      <h1 className="page-title">Leaderboard</h1>
      <p className="lede">
        Ranked by wins, then game difference, then point difference. Games are
        best of 5 (ITTF scoring to 11, win by 2).
      </p>
      <div className="section">
        <LeaderboardTable rows={rows} />
      </div>
    </main>
  );
}
