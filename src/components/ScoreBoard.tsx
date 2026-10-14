"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Minus, RotateCcw, Play, Trophy } from "lucide-react";
import { adjustPoint, resetMatch, setGameScore, startMatch } from "@/lib/actions";
import {
  isMatchComplete,
  matchGamesNeeded,
  normalizePointsToWin,
  servesPerTurn,
  type PointsToWin,
} from "@/lib/scoring";
import {
  applyAbsoluteScore,
  applyPointDelta,
  deriveFromGames,
  fingerprintMatch,
  resolveTargetGame,
} from "@/lib/match-state";
import { StatusBadge } from "@/components/StatusBadge";

type Game = {
  id: string;
  gameNumber: number;
  homePoints: number;
  awayPoints: number;
  isComplete: boolean;
  winnerSide: string | null;
};

type Team = { id: string; name: string; player1: string; player2: string };

export type MatchView = {
  id: string;
  status: string;
  homeScore: number;
  awayScore: number;
  homeTeam: Team;
  awayTeam: Team;
  games: Game[];
};

type Props = { match: MatchView; pointsToWin: PointsToWin };

export function ScoreBoard({ match, pointsToWin }: Props) {
  const pointsTarget = normalizePointsToWin(pointsToWin);
  const serves = servesPerTurn(pointsTarget);
  const [state, setState] = useState<MatchView>(match);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<"HOME" | "AWAY" | null>(null);
  const [homeDraft, setHomeDraft] = useState("0");
  const [awayDraft, setAwayDraft] = useState("0");

  const busy = useRef(false);
  const stateRef = useRef(state);
  const syncedKey = useRef(fingerprintMatch(match));
  const flashTimer = useRef<number | null>(null);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Sync from server only when data actually changed and we are not mid-mutation
  useEffect(() => {
    const key = fingerprintMatch(match);
    if (busy.current) return;
    if (key === syncedKey.current) return;
    syncedKey.current = key;
    setState(match);
    stateRef.current = match;
  }, [match]);

  useEffect(() => {
    return () => {
      if (flashTimer.current) window.clearTimeout(flashTimer.current);
    };
  }, []);

  const need = matchGamesNeeded();
  const openGame = useMemo(() => {
    return state.games.find((g) => !g.isComplete) ?? state.games[state.games.length - 1];
  }, [state.games]);

  useEffect(() => {
    setHomeDraft(String(openGame.homePoints));
    setAwayDraft(String(openGame.awayPoints));
  }, [openGame.gameNumber, openGame.homePoints, openGame.awayPoints]);

  const decided = isMatchComplete(state.homeScore, state.awayScore);
  const winnerName =
    state.homeScore > state.awayScore ? state.homeTeam.name : state.awayTeam.name;

  const canUndoHome = state.games.some((g) => g.homePoints > 0);
  const canUndoAway = state.games.some((g) => g.awayPoints > 0);

  function syncFromServer(updated: MatchView | null | undefined) {
    if (!updated) return;
    const next: MatchView = {
      id: updated.id,
      status: updated.status,
      homeScore: updated.homeScore,
      awayScore: updated.awayScore,
      homeTeam: updated.homeTeam,
      awayTeam: updated.awayTeam,
      games: updated.games,
    };
    syncedKey.current = fingerprintMatch(next);
    setState(next);
    stateRef.current = next;
  }

  async function score(side: "HOME" | "AWAY", delta: number) {
    if (busy.current) return;

    const current = stateRef.current;
    const gameTarget = resolveTargetGame(current.games, side, delta);
    const currentDecided = isMatchComplete(current.homeScore, current.awayScore);

    if (delta > 0 && currentDecided) return;
    if (delta < 0) {
      const pts = side === "HOME" ? gameTarget.homePoints : gameTarget.awayPoints;
      if (pts <= 0) return;
    }

    busy.current = true;
    setPending(true);
    setError(null);

    if (delta > 0) {
      setFlash(side);
      if (flashTimer.current) window.clearTimeout(flashTimer.current);
      flashTimer.current = window.setTimeout(() => setFlash(null), 160);
    }

    const snapshot = current;
    const nextGames = applyPointDelta(
      current.games,
      gameTarget.gameNumber,
      side,
      delta,
      pointsTarget
    );
    const derived = deriveFromGames(nextGames, pointsTarget);
    const optimistic: MatchView = {
      ...current,
      games: nextGames,
      homeScore: derived.homeScore,
      awayScore: derived.awayScore,
      status: derived.status,
    };
    setState(optimistic);
    stateRef.current = optimistic;
    syncedKey.current = fingerprintMatch(optimistic);

    try {
      const updated = await adjustPoint(current.id, gameTarget.gameNumber, side, delta);
      syncFromServer(updated as MatchView);
    } catch (e) {
      syncedKey.current = fingerprintMatch(snapshot);
      setState(snapshot);
      stateRef.current = snapshot;
      setError(e instanceof Error ? e.message : "Could not update score");
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  async function applyManualScore() {
    if (busy.current || decided) return;

    const home = Math.max(0, Math.min(60, Math.floor(Number(homeDraft))));
    const away = Math.max(0, Math.min(60, Math.floor(Number(awayDraft))));
    if (!Number.isFinite(home) || !Number.isFinite(away)) {
      setError("Enter valid point totals");
      return;
    }

    const current = stateRef.current;
    const gameTarget = resolveTargetGame(current.games, "HOME", 1);

    busy.current = true;
    setPending(true);
    setError(null);

    const snapshot = current;
    const nextGames = applyAbsoluteScore(
      current.games,
      gameTarget.gameNumber,
      home,
      away,
      pointsTarget
    );
    const derived = deriveFromGames(nextGames, pointsTarget);
    const optimistic: MatchView = {
      ...current,
      games: nextGames,
      homeScore: derived.homeScore,
      awayScore: derived.awayScore,
      status: derived.status,
    };
    setState(optimistic);
    stateRef.current = optimistic;
    syncedKey.current = fingerprintMatch(optimistic);
    setHomeDraft(String(home));
    setAwayDraft(String(away));

    try {
      const updated = await setGameScore(current.id, gameTarget.gameNumber, home, away);
      syncFromServer(updated as MatchView);
    } catch (e) {
      syncedKey.current = fingerprintMatch(snapshot);
      setState(snapshot);
      stateRef.current = snapshot;
      setError(e instanceof Error ? e.message : "Could not set score");
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  async function runReset() {
    if (!confirm("Reset all scores for this match?")) return;
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    setError(null);
    try {
      const updated = await resetMatch(stateRef.current.id);
      syncFromServer(updated as MatchView);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not reset match");
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  async function runStart() {
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    setError(null);
    const snapshot = stateRef.current;
    const optimistic = { ...snapshot, status: "LIVE" };
    setState(optimistic);
    stateRef.current = optimistic;
    syncedKey.current = fingerprintMatch(optimistic);
    try {
      const updated = await startMatch(snapshot.id);
      syncFromServer(updated as MatchView);
    } catch (e) {
      syncedKey.current = fingerprintMatch(snapshot);
      setState(snapshot);
      stateRef.current = snapshot;
      setError(e instanceof Error ? e.message : "Could not start match");
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  return (
    <div
      className={`scoreboard ${pending ? "is-pending" : ""}`}
      data-testid="scoreboard"
      data-pending={pending ? "true" : "false"}
      data-status={state.status}
    >
      <div className="sb-top">
        <div className="sb-status-row">
          <StatusBadge status={state.status} />
          {!decided && (
            <p className="sb-meta">
              Best of 5 · to {pointsTarget} (win by 2) · {serves} serves · Game{" "}
              {openGame.gameNumber}
            </p>
          )}
        </div>

        <div className="sb-names">
          <div>
            <p className="sb-label">Home</p>
            <h2>{state.homeTeam.name}</h2>
            <p className="sb-players">
              {state.homeTeam.player1} · {state.homeTeam.player2}
            </p>
          </div>
          <div className="sb-names-right">
            <p className="sb-label">Away</p>
            <h2>{state.awayTeam.name}</h2>
            <p className="sb-players">
              {state.awayTeam.player1} · {state.awayTeam.player2}
            </p>
          </div>
        </div>

        {decided && (
          <div className="sb-winner" data-testid="match-winner">
            <Trophy size={18} aria-hidden />
            <span>Winner — {winnerName}</span>
          </div>
        )}
      </div>

      <div className="click-board" role="group" aria-label="Click to score">
        <button
          type="button"
          className={`score-pad home ${flash === "HOME" ? "flash" : ""}`}
          data-testid="score-home"
          disabled={pending || decided}
          onClick={() => score("HOME", 1)}
          aria-label={`Add point to ${state.homeTeam.name}`}
        >
          <span className="score-pad-value">{openGame.homePoints}</span>
          <span className="score-pad-hint">Tap for point</span>
        </button>

        <div className="games-won" aria-label="Games won">
          <div className="games-won-card">
            <span className="games-won-num" data-testid="games-home">
              {state.homeScore}
            </span>
            <span className="games-won-dots" aria-hidden>
              {Array.from({ length: need }).map((_, i) => (
                <i key={i} className={i < state.homeScore ? "on" : undefined} />
              ))}
            </span>
          </div>
          <span className="games-won-sep" aria-hidden>
            ↔
          </span>
          <div className="games-won-card">
            <span className="games-won-num" data-testid="games-away">
              {state.awayScore}
            </span>
            <span className="games-won-dots" aria-hidden>
              {Array.from({ length: need }).map((_, i) => (
                <i key={i} className={i < state.awayScore ? "on" : undefined} />
              ))}
            </span>
          </div>
        </div>

        <button
          type="button"
          className={`score-pad away ${flash === "AWAY" ? "flash" : ""}`}
          data-testid="score-away"
          disabled={pending || decided}
          onClick={() => score("AWAY", 1)}
          aria-label={`Add point to ${state.awayTeam.name}`}
        >
          <span className="score-pad-value">{openGame.awayPoints}</span>
          <span className="score-pad-hint">Tap for point</span>
        </button>
      </div>

      <div className="undo-row">
        <button
          type="button"
          className="btn btn-ghost btn-icon"
          data-testid="undo-home"
          disabled={pending || !canUndoHome}
          onClick={() => score("HOME", -1)}
          aria-label="Undo home point"
        >
          <Minus size={16} aria-hidden />
          Undo home
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-icon"
          data-testid="undo-away"
          disabled={pending || !canUndoAway}
          onClick={() => score("AWAY", -1)}
          aria-label="Undo away point"
        >
          <Minus size={16} aria-hidden />
          Undo away
        </button>
      </div>

      <form
        className="umpire-set"
        data-testid="umpire-set"
        onSubmit={(e) => {
          e.preventDefault();
          void applyManualScore();
        }}
      >
        <p className="umpire-set-label">Umpire — set points (Game {openGame.gameNumber})</p>
        <div className="umpire-set-row">
          <label className="umpire-field">
            <span>Home</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={60}
              step={1}
              data-testid="umpire-home"
              value={homeDraft}
              disabled={pending || decided}
              onChange={(e) => setHomeDraft(e.target.value)}
              aria-label={`Set home points for ${state.homeTeam.name}`}
            />
          </label>
          <span className="umpire-sep" aria-hidden>
            –
          </span>
          <label className="umpire-field">
            <span>Away</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={60}
              step={1}
              data-testid="umpire-away"
              value={awayDraft}
              disabled={pending || decided}
              onChange={(e) => setAwayDraft(e.target.value)}
              aria-label={`Set away points for ${state.awayTeam.name}`}
            />
          </label>
          <button
            type="submit"
            className="btn btn-ghost btn-icon"
            data-testid="umpire-apply"
            disabled={pending || decided}
          >
            <Check size={16} aria-hidden />
            Apply
          </button>
        </div>
      </form>

      <div className="game-rail" aria-label="Game history">
        {state.games.map((g) => {
          const active = !decided && g.gameNumber === openGame.gameNumber;
          const unused =
            decided && g.gameNumber > state.homeScore + state.awayScore && !g.isComplete;
          return (
            <div
              key={g.id}
              className={`game-chip ${g.isComplete ? "done" : ""} ${active ? "active" : ""} ${
                unused ? "locked" : ""
              }`}
              data-testid={`game-chip-${g.gameNumber}`}
            >
              <span className="game-chip-label">G{g.gameNumber}</span>
              <span className="game-chip-score">
                {g.homePoints}–{g.awayPoints}
              </span>
              <span className="game-chip-state">
                {g.isComplete
                  ? g.winnerSide === "HOME"
                    ? "Home"
                    : "Away"
                  : active
                    ? "Live"
                    : unused
                      ? "—"
                      : "Queued"}
              </span>
            </div>
          );
        })}
      </div>

      <div className="sb-actions">
        {state.status === "SCHEDULED" && (
          <button
            type="button"
            className="btn btn-primary btn-icon"
            data-testid="start-match"
            disabled={pending}
            onClick={runStart}
          >
            <Play size={16} aria-hidden />
            Start Match
          </button>
        )}
        <button
          type="button"
          className="btn btn-ghost btn-icon"
          data-testid="reset-match"
          disabled={pending}
          onClick={runReset}
        >
          <RotateCcw size={16} aria-hidden />
          Reset Match
        </button>
      </div>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
