# Smash League — Table Tennis Tournament

Doubles table tennis league site with live scoring, match pool, leaderboard, and win/loss tracking.

**Stack:** Next.js + Prisma + SQLite  
**Deploy:** Free Vercel — connect the repo and deploy. No database add-on, no env vars to configure.

## Teams

- Hamza Awan & Ali Rehman
- Sherry & Ahsan *(matches at 3:00 PM)*
- Umair & Hassan
- Zohaib & Husnain

All other matches are at **7:30 PM**. Format: double round-robin (12 matches), best of 5.

## Local

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Vercel (free)

1. Push this repo to GitHub / GitLab / Bitbucket
2. Import the project in Vercel
3. Click Deploy

That is it. The build seeds SQLite automatically. `.env.production` is already in the repo with the SQLite URL (no secrets).

## Scoring

- Open any match → use **+ Point** buttons or edit game scores
- Games to 11, must win by 2 (ITTF)
- Match is best of 5 (first to 3 games)
- Leaderboard ranks by wins → game difference → point difference

Scores are also mirrored in the browser so a free Vercel cold start does not wipe the scorer’s device.
