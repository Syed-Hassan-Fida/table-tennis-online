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
    <Link
      href={`/matches/${m.id}`}
      className={`match-row status-${m.status.toLowerCase()}`}
    >
      <div className="match-meta">
        <span className={`pill status-${m.status.toLowerCase()}`}>
          {m.status === "LIVE" && <span className="live-dot" aria-hidden />}
          {statusLabel(m.status)}
        </span>
        <span className="meta-text">R{m.round} · M{m.matchNumber}</span>
        <span className="meta-text meta-time">
          {formatMatchDate(m.scheduledAt)} · {formatMatchTime(m.scheduledAt)}
        </span>
      </div>
      <div className="match-sides">
        <div className="side">
          <span className="team-name">{m.homeTeam.name}</span>
          <span className="score">{m.homeScore}</span>
        </div>
        <div className="vs-line" aria-hidden>
          vs
        </div>
        <div className="side">
          <span className="team-name">{m.awayTeam.name}</span>
          <span className="score">{m.awayScore}</span>
        </div>
      </div>
      <span className="match-go" aria-hidden>
        Score →
      </span>
    </Link>
  );
}
