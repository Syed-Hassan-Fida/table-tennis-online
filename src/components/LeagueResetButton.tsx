"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { RotateCcw } from "lucide-react";
import { resetLeague } from "@/lib/actions";

export function LeagueResetButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  function onReset() {
    const ok = confirm(
      "Reset the entire league?\n\nThis clears every match score, status, and standings. This cannot be undone."
    );
    if (!ok) return;

    setError(null);
    setDone(null);
    startTransition(async () => {
      try {
        const result = await resetLeague();
        setDone(`Reset ${result.resetMatches} matches`);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not reset league");
      }
    });
  }

  return (
    <div className="league-reset">
      <button
        type="button"
        className="btn btn-ghost btn-icon"
        data-testid="reset-league"
        disabled={pending}
        onClick={onReset}
      >
        <RotateCcw size={16} aria-hidden />
        {pending ? "Resetting…" : "Reset all scores"}
      </button>
      {done && (
        <p className="league-reset-msg ok" role="status">
          {done}
        </p>
      )}
      {error && (
        <p className="league-reset-msg err" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
