import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/matches", label: "Matches" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/teams", label: "Teams" },
];

export function Nav() {
  return (
    <header className="site-nav">
      <div className="nav-inner">
        <Link href="/" className="nav-brand">
          <span className="nav-mark" aria-hidden />
          Smash League
        </Link>
        <nav className="nav-links" aria-label="Main">
          {links.map((l) => (
            <Link key={l.href} href={l.href}>
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
