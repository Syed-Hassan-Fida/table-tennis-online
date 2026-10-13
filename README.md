# Smash League — Table Tennis Tournament

Premium doubles table tennis league with **click-to-score** match center, fixtures, standings, and team profiles.

**Stack:** Next.js 16 + Prisma + SQLite + Lucide  
**Deploy:** Free Vercel — connect the repo and deploy. No database add-on required.

## Teams

- Hamza Awan & Ali Rehman
- Sherry & Ahsan *(matches at 3:00 PM)*
- Umair & Hassan
- Zohaib & Husnain

All other matches are at **7:30 PM**. Format: double round-robin (12 matches), best of 5.

## Scoring

- Tap the large home/away pads to add points (no typing)
- Games to 11, win by 2 (ITTF)
- First to 3 games wins the match
- Undo / reset available on the match page

## Local

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Reset league data:

```bash
npm run db:reset
```

## Tests

```bash
npm run build && npm run start
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000 npx playwright test
```

## Vercel (free)

1. Push this repo to GitHub  
2. Import in Vercel → Deploy  

Build seeds SQLite automatically when empty. No env vars to configure.
