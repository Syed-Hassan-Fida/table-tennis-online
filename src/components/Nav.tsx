"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, CircleDot } from "lucide-react";

const links = [
  { href: "/", label: "Home" },
  { href: "/matches", label: "Matches" },
  { href: "/leaderboard", label: "Standings" },
  { href: "/teams", label: "Teams" },
];

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="site-nav">
      <div className="nav-inner">
        <Link href="/" className="nav-brand" onClick={() => setOpen(false)}>
          <CircleDot className="nav-mark" size={22} strokeWidth={2.25} aria-hidden />
          <span>
            Smash <em>League</em>
          </span>
        </Link>

        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="primary-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>

        <nav
          id="primary-nav"
          className={`nav-links ${open ? "is-open" : ""}`}
          aria-label="Main"
        >
          {links.map((l) => {
            const active =
              l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`nav-chip ${active ? "is-active" : ""}`}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
