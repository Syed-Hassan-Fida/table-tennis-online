import Link from "next/link";
import { ArrowRight, Clock3 } from "lucide-react";
import { formatMatchDate, formatMatchTime } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";

type Team = { id: string; name: string; player1?: string; player2?: string };
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

function initials(team: Team) {
  if (team.player1 && team.player2) {
    return `${team.player1[0]}${team.player2[0]}`.toUpperCase();
  }
  return team.name
    .split(/\s|&/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function TeamLane({
  team,
  score,
  align = "left",
}: {
  team: Team;
  score: number;
  align?: "left" | "right";
}) {
  return (
    <div className={`fixture-team fixture-team-${align}`}>
      <div className="fixture-avatar" aria-hidden>
        {initials(team)}
      </div>
      <div className="fixture-team-copy">
        <strong>{team.name}</strong>
        {(team.player1 || team.player2) && (
          <span>
            {[team.player1, team.player2].filter(Boolean).join(" · ")}
          </span>
        )}
      </div>
      <div className="fixture-score-box" aria-label={`${team.name} games ${score}`}>
        {score}
      </div>
    </div>
  );
}

export function MatchCard(m: MatchCardProps) {
  const cta =
    m.status === "LIVE"
      ? "Continue scoring"
      : m.status === "COMPLETED"
        ? "View result"
        : "Enter match center";

  return (
    <Link
      href={`/matches/${m.id}`}
      className={`fixture-card status-${m.status.toLowerCase()}`}
      data-testid={`match-card-${m.matchNumber}`}
    >
      <div className="fixture-top">
        <StatusBadge status={m.status} />
        <div className="fixture-meta">
          <span>R{m.round}</span>
          <span className="dot" aria-hidden />
          <span>Match {m.matchNumber}</span>
          <span className="dot" aria-hidden />
          <span className="fixture-time">
            <Clock3 size={13} aria-hidden />
            {formatMatchDate(m.scheduledAt)} · {formatMatchTime(m.scheduledAt)}
          </span>
        </div>
      </div>

      <div className="fixture-body">
        <TeamLane team={m.homeTeam} score={m.homeScore} />
        <div className="fixture-vs" aria-hidden>
          <span>VS</span>
        </div>
        <TeamLane team={m.awayTeam} score={m.awayScore} />
      </div>

      <div className="fixture-bottom">
        <span className="fixture-cta">
          {cta}
          <ArrowRight size={15} aria-hidden />
        </span>
      </div>
    </Link>
  );
}
