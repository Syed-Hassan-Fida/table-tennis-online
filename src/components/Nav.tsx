import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/matches", label: "Matches" },
  { href: "/leaderboard", label: "Board" },
  { href: "/teams", label: "Teams" },
];

export function Nav() {
  return (
    <header className="site-nav">
      <div className="nav-inner">
        <Link href="/" className="nav-brand">
          <span className="nav-mark" aria-hidden />
          <span>
            Smash<span className="nav-brand-accent">League</span>
          </span>
        </Link>
        <nav className="nav-links" aria-label="Main">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="nav-chip">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
