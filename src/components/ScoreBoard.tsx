"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { adjustPoint, resetMatch, setGameScore, startMatch } from "@/lib/actions";
import { isGameComplete, isMatchComplete, matchGamesNeeded } from "@/lib/scoring";

type Game = {
  id: string;
  gameNumber: number;
  homePoints: number;
  awayPoints: number;
  isComplete: boolean;
  winnerSide: string | null;
};

type Team = { id: string; name: string; player1: string; player2: string };

type Props = {
  match: {
    id: string;
    status: string;
    homeScore: number;
    awayScore: number;
    homeTeam: Team;
    awayTeam: Team;
    games: Game[];
  };
};

export function ScoreBoard({ match }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const need = matchGamesNeeded();
  const decided = isMatchComplete(match.homeScore, match.awayScore);
  const openGame =
    match.games.find((g) => !g.isComplete) ?? match.games[match.games.length - 1];

  function run(action: () => Promise<unknown>) {
    setError(null);
    startTransition(async () => {
      try {
        await action();
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      }
    });
  }

  return (
    <div className={`scoreboard ${pending ? "is-pending" : ""}`}>
      <div className="scoreboard-header">
        <div className="sb-team">
          <p className="sb-label">Home</p>
          <h2>{match.homeTeam.name}</h2>
          <p className="sb-players">
            {match.homeTeam.player1} · {match.homeTeam.player2}
          </p>
        </div>
        <div className="sb-center">
          <p className="sb-games">
            {match.homeScore} – {match.awayScore}
          </p>
          <p className="sb-sub">Best of 5 · first to {need}</p>
          {decided ? (
            <p className="sb-final">
              Winner:{" "}
              {match.homeScore > match.awayScore
                ? match.homeTeam.name
                : match.awayTeam.name}
            </p>
          ) : (
            <p className="sb-sub">Game {openGame.gameNumber}</p>
          )}
        </div>
        <div className="sb-team right">
          <p className="sb-label">Away</p>
          <h2>{match.awayTeam.name}</h2>
          <p className="sb-players">
            {match.awayTeam.player1} · {match.awayTeam.player2}
          </p>
        </div>
      </div>

      <div className="live-controls">
        <button
          type="button"
          className="btn btn-ghost"
          disabled={pending}
          onClick={() => run(() => adjustPoint(match.id, openGame.gameNumber, "HOME", -1))}
        >
          −
        </button>
        <button
          type="button"
          className="btn btn-score home"
          disabled={pending || decided}
          onClick={() => run(() => adjustPoint(match.id, openGame.gameNumber, "HOME", 1))}
        >
          + Point Home
        </button>
        <div className="live-points">
          <span>{openGame.homePoints}</span>
          <span className="sep">:</span>
          <span>{openGame.awayPoints}</span>
        </div>
        <button
          type="button"
          className="btn btn-score away"
          disabled={pending || decided}
          onClick={() => run(() => adjustPoint(match.id, openGame.gameNumber, "AWAY", 1))}
        >
          + Point Away
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          disabled={pending}
          onClick={() => run(() => adjustPoint(match.id, openGame.gameNumber, "AWAY", -1))}
        >
          −
        </button>
      </div>

      <div className="games-grid">
        {match.games.map((g) => {
          const locked =
            decided &&
            g.gameNumber > match.homeScore + match.awayScore &&
            !g.isComplete;
          return (
            <div
              key={g.id}
              className={`game-card ${g.isComplete ? "done" : ""} ${
                g.gameNumber === openGame.gameNumber && !decided ? "active" : ""
              } ${locked ? "locked" : ""}`}
            >
              <div className="game-title">Game {g.gameNumber}</div>
              <div className="game-inputs">
                <label>
                  <span>Home</span>
                  <input
                    type="number"
                    min={0}
                    max={30}
                    value={g.homePoints}
                    disabled={pending || locked}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      run(() => setGameScore(match.id, g.gameNumber, v, g.awayPoints));
                    }}
                  />
                </label>
                <label>
                  <span>Away</span>
                  <input
                    type="number"
                    min={0}
                    max={30}
                    value={g.awayPoints}
                    disabled={pending || locked}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      run(() => setGameScore(match.id, g.gameNumber, g.homePoints, v));
                    }}
                  />
                </label>
              </div>
              <p className="game-state">
                {g.isComplete
                  ? `Won by ${g.winnerSide === "HOME" ? "Home" : "Away"}`
                  : isGameComplete(g.homePoints, g.awayPoints)
                    ? "Complete"
                    : "In play"}
              </p>
            </div>
          );
        })}
      </div>

      <div className="sb-actions">
        {match.status === "SCHEDULED" && (
          <button
            type="button"
            className="btn btn-primary"
            disabled={pending}
            onClick={() => run(() => startMatch(match.id))}
          >
            Start Match
          </button>
        )}
        <button
          type="button"
          className="btn btn-ghost"
          disabled={pending}
          onClick={() => {
            if (confirm("Reset all scores for this match?")) {
              run(() => resetMatch(match.id));
            }
          }}
        >
          Reset Match
        </button>
      </div>

      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
