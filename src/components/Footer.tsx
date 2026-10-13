import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div>
          <p className="footer-brand">Smash League</p>
          <p className="footer-copy">
            Doubles table tennis · Best of 5 · ITTF scoring to 11 (win by 2)
          </p>
        </div>
        <div className="footer-links">
          <Link href="/matches">Matches</Link>
          <Link href="/leaderboard">Standings</Link>
          <Link href="/teams">Teams</Link>
        </div>
      </div>
    </footer>
  );
}
