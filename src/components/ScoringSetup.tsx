"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setScoringSystem } from "@/lib/actions";
import {
  scoringSystemLabel,
  servesPerTurn,
  type PointsToWin,
} from "@/lib/scoring";

type Props = {
  pointsToWin: PointsToWin;
  locked: boolean;
};

export function ScoringSetup({ pointsToWin, locked }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<PointsToWin>(pointsToWin);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  function save(next: PointsToWin) {
    setSelected(next);
    setError(null);
    setSaved(null);
    if (locked) {
      setError("Locked — reset all scores before changing the scoring system.");
      return;
    }
    startTransition(async () => {
      try {
        await setScoringSystem(next);
        setSaved(`Saved ${scoringSystemLabel(next)}`);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not save scoring system");
      }
    });
  }

  return (
    <section className="scoring-setup" data-testid="scoring-setup" aria-label="Scoring system">
      <div className="scoring-setup-copy">
        <p className="section-kicker">Before tip-off</p>
        <h2>Choose scoring system</h2>
        <p>
          Default is the <strong>classic 21-point</strong> system. Switch to modern 11-point ITTF
          rules if the league agrees — only before any scoring starts.
        </p>
      </div>

      <div className="scoring-options" role="radiogroup" aria-label="Points to win a game">
        <button
          type="button"
          role="radio"
          aria-checked={selected === 21}
          className={`scoring-option ${selected === 21 ? "is-active" : ""}`}
          disabled={pending}
          data-testid="scoring-21"
          onClick={() => save(21)}
        >
          <strong>Classic · 21</strong>
          <span>Pre-2001 standard · {servesPerTurn(21)} serves each · win by 2</span>
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={selected === 11}
          className={`scoring-option ${selected === 11 ? "is-active" : ""}`}
          disabled={pending}
          data-testid="scoring-11"
          onClick={() => save(11)}
        >
          <strong>Modern · 11</strong>
          <span>ITTF since 2001 · {servesPerTurn(11)} serves each · win by 2</span>
        </button>
      </div>

      <p className="scoring-setup-note">
        Active: <strong>{scoringSystemLabel(pointsToWin)}</strong>
        {locked ? " · locked after tournament start" : " · can change until first point is scored"}
      </p>
      {saved && (
        <p className="league-reset-msg ok" role="status">
          {saved}
        </p>
      )}
      {error && (
        <p className="league-reset-msg err" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
