import type { StandingRow } from "@/lib/scoring";

export function LeaderboardTable({ rows }: { rows: StandingRow[] }) {
  return (
    <div className="table-wrap">
      <table className="standings">
        <thead>
          <tr>
            <th>#</th>
            <th>Team</th>
            <th>P</th>
            <th>W</th>
            <th>L</th>
            <th>GF</th>
            <th>GA</th>
            <th>GD</th>
            <th>PF</th>
            <th>PA</th>
            <th>PD</th>
            <th>Win%</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.teamId} className={i === 0 ? "leader" : undefined}>
              <td>{i + 1}</td>
              <td className="team-cell">{r.teamName}</td>
              <td>{r.played}</td>
              <td>{r.won}</td>
              <td>{r.lost}</td>
              <td>{r.gamesFor}</td>
              <td>{r.gamesAgainst}</td>
              <td>{r.gameDiff > 0 ? `+${r.gameDiff}` : r.gameDiff}</td>
              <td>{r.pointsFor}</td>
              <td>{r.pointsAgainst}</td>
              <td>{r.pointDiff > 0 ? `+${r.pointDiff}` : r.pointDiff}</td>
              <td>{(r.winPct * 100).toFixed(0)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
