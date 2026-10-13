import type { StandingRow } from "@/lib/scoring";

export function LeaderboardTable({ rows }: { rows: StandingRow[] }) {
  return (
    <div className="table-wrap" data-testid="standings-table">
      <table className="standings">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Team</th>
            <th scope="col">P</th>
            <th scope="col">W</th>
            <th scope="col">L</th>
            <th scope="col">GF</th>
            <th scope="col">GA</th>
            <th scope="col">GD</th>
            <th scope="col">PF</th>
            <th scope="col">PA</th>
            <th scope="col">PD</th>
            <th scope="col">Win%</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.teamId} className={i === 0 && r.played > 0 ? "leader" : undefined}>
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

      <div className="standings-mobile" aria-label="Standings compact">
        {rows.map((r, i) => (
          <article
            key={r.teamId}
            className={`standing-card ${i === 0 && r.played > 0 ? "leader" : ""}`}
          >
            <div className="standing-rank">{i + 1}</div>
            <div className="standing-body">
              <h3>{r.teamName}</h3>
              <p>
                {r.won}W – {r.lost}L · {r.played} played · GD{" "}
                {r.gameDiff > 0 ? `+${r.gameDiff}` : r.gameDiff}
              </p>
            </div>
            <div className="standing-pct">{(r.winPct * 100).toFixed(0)}%</div>
          </article>
        ))}
      </div>
    </div>
  );
}
