"use client";

import { useEffect, useId, useRef, useState } from "react";
import { BookOpen, X } from "lucide-react";
import { scoringSystemLabel, servesPerTurn, type PointsToWin } from "@/lib/scoring";

type Props = {
  pointsToWin: PointsToWin;
};

export function RulesModal({ pointsToWin }: Props) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const serves = servesPerTurn(pointsToWin);

  return (
    <>
      <button
        type="button"
        className="btn btn-ghost btn-icon"
        data-testid="open-rules"
        onClick={() => setOpen(true)}
      >
        <BookOpen size={16} aria-hidden />
        Match rules
      </button>

      {open && (
        <div
          className="modal-root"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            className="modal-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
          >
            <div className="modal-head">
              <div>
                <p className="section-kicker">Umpire guide</p>
                <h2 id={titleId}>Match rules & scoring</h2>
              </div>
              <button
                ref={closeRef}
                type="button"
                className="modal-close"
                aria-label="Close rules"
                onClick={() => setOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <section>
                <h3>Format</h3>
                <ul>
                  <li>This league is <strong>doubles only</strong>: 2 vs 2 (4 players on the table).</li>
                  <li>Each fixture is <strong>best of 5 games</strong> (first to 3 games wins the match).</li>
                  <li>Sherry &amp; Ahsan play at <strong>3:00 PM</strong>; all other matches at <strong>7:30 PM</strong>.</li>
                </ul>
              </section>

              <section>
                <h3>Active scoring system</h3>
                <p>
                  Currently selected: <strong>{scoringSystemLabel(pointsToWin)}</strong> — games
                  to <strong>{pointsToWin}</strong>, win by 2. Serve rotation:{" "}
                  <strong>{serves} serves</strong> each before switching (until deuce, then alternate).
                </p>
              </section>

              <section>
                <h3>Classic vs modern points</h3>
                <ul>
                  <li>
                    <strong>Classic (21 points)</strong> — historical international standard before
                    2001. Typically <strong>5 serves</strong> each.
                  </li>
                  <li>
                    <strong>Modern / ITTF (11 points)</strong> — official since September 2001.
                    Typically <strong>2 serves</strong> each.
                  </li>
                  <li>
                    Singles vs doubles does <strong>not</strong> change the points target — only the
                    number of players on the table changes.
                  </li>
                </ul>
              </section>

              <section>
                <h3>How a game ends</h3>
                <ul>
                  <li>First side to reach {pointsToWin} points <strong>and</strong> lead by 2 wins the game.</li>
                  <li>
                    Examples at {pointsToWin}: {pointsToWin}–{pointsToWin - 2} ends;{" "}
                    {pointsToWin}–{pointsToWin - 1} continues until one side leads by 2.
                  </li>
                </ul>
              </section>

              <section>
                <h3>How a match ends</h3>
                <ul>
                  <li>First team to win <strong>3 games</strong> wins the match (3–0, 3–1, or 3–2).</li>
                  <li>Standings use wins, then game difference, then point difference.</li>
                </ul>
              </section>

              <section>
                <h3>Scoring on this site</h3>
                <ul>
                  <li>Use the large home/away pads — tap to add a point (no typing required).</li>
                  <li>Undo home/away corrects the last point on that side, even after a game ends.</li>
                  <li>Umpires can also type exact points for the live game and tap Apply.</li>
                  <li>Reset match clears one fixture; Reset all scores clears the whole league.</li>
                </ul>
              </section>
            </div>

            <div className="modal-foot">
              <button type="button" className="btn btn-primary" onClick={() => setOpen(false)}>
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
