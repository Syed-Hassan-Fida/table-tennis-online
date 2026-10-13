import Link from "next/link";
import { formatMatchDate, formatMatchTime, statusLabel } from "@/lib/format";

type Team = { id: string; name: string };
type MatchCardProps = {
  id: string;
  matchNumber: number;
  round: number;
  scheduledAt: Date | string;
  status: string;
  homeScore: number;
  awayScore: number;
  homeTeam: Team;
  awayTeam: Team;
};

export function MatchCard(m: MatchCardProps) {
  return (
    <Link href={`/matches/${m.id}`} className="match-row">
      <div className="match-meta">
        <span className={`pill status-${m.status.toLowerCase()}`}>
          {statusLabel(m.status)}
        </span>
        <span className="meta-text">
          Round {m.round} · Match {m.matchNumber}
        </span>
        <span className="meta-text">
          {formatMatchDate(m.scheduledAt)} · {formatMatchTime(m.scheduledAt)}
        </span>
      </div>
      <div className="match-sides">
        <div className="side">
          <span className="team-name">{m.homeTeam.name}</span>
          <span className="score">{m.homeScore}</span>
        </div>
        <div className="side">
          <span className="team-name">{m.awayTeam.name}</span>
          <span className="score">{m.awayScore}</span>
        </div>
      </div>
    </Link>
  );
}
