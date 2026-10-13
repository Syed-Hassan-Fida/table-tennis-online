import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** Best-of-5 table tennis — first to 3 games */
const GAMES_PER_MATCH = 5;

type TeamSeed = { name: string; player1: string; player2: string };

const TEAMS: TeamSeed[] = [
  { name: "Hamza Awan & Ali Rehman", player1: "Hamza Awan", player2: "Ali Rehman" },
  { name: "Sherry & Ahsan", player1: "Sherry", player2: "Ahsan" },
  { name: "Umair & Hassan", player1: "Umair", player2: "Hassan" },
  { name: "Zohaib & Husnain", player1: "Zohaib", player2: "Husnain" },
];

function atTime(dayOffset: number, hours: number, minutes: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

function involvesSherryAhsan(a: string, b: string): boolean {
  return a === "Sherry & Ahsan" || b === "Sherry & Ahsan";
}

async function main() {
  await prisma.matchGame.deleteMany();
  await prisma.match.deleteMany();
  await prisma.team.deleteMany();

  const created = await Promise.all(
    TEAMS.map((t) =>
      prisma.team.create({
        data: { name: t.name, player1: t.player1, player2: t.player2 },
      })
    )
  );

  const byName = Object.fromEntries(created.map((t) => [t.name, t]));

  // Double round-robin (home & away) = complete league, 12 matches
  const pairings: { home: string; away: string; day: number; round: number }[] = [
    // Round 1 — opening fixtures
    { home: "Sherry & Ahsan", away: "Hamza Awan & Ali Rehman", day: 0, round: 1 },
    { home: "Umair & Hassan", away: "Zohaib & Husnain", day: 0, round: 1 },
    // Round 2
    { home: "Sherry & Ahsan", away: "Umair & Hassan", day: 1, round: 2 },
    { home: "Hamza Awan & Ali Rehman", away: "Zohaib & Husnain", day: 1, round: 2 },
    // Round 3
    { home: "Sherry & Ahsan", away: "Zohaib & Husnain", day: 2, round: 3 },
    { home: "Hamza Awan & Ali Rehman", away: "Umair & Hassan", day: 2, round: 3 },
    // Round 4 — return fixtures
    { home: "Hamza Awan & Ali Rehman", away: "Sherry & Ahsan", day: 3, round: 4 },
    { home: "Zohaib & Husnain", away: "Umair & Hassan", day: 3, round: 4 },
    // Round 5
    { home: "Umair & Hassan", away: "Sherry & Ahsan", day: 4, round: 5 },
    { home: "Zohaib & Husnain", away: "Hamza Awan & Ali Rehman", day: 4, round: 5 },
    // Round 6
    { home: "Zohaib & Husnain", away: "Sherry & Ahsan", day: 5, round: 6 },
    { home: "Umair & Hassan", away: "Hamza Awan & Ali Rehman", day: 5, round: 6 },
  ];

  let matchNumber = 1;
  for (const p of pairings) {
    const sherrySlot = involvesSherryAhsan(p.home, p.away);
    const scheduledAt = sherrySlot
      ? atTime(p.day, 15, 0) // 3:00 PM
      : atTime(p.day, 19, 30); // 7:30 PM

    const match = await prisma.match.create({
      data: {
        round: p.round,
        matchNumber,
        scheduledAt,
        status: "SCHEDULED",
        homeTeamId: byName[p.home].id,
        awayTeamId: byName[p.away].id,
        games: {
          create: Array.from({ length: GAMES_PER_MATCH }, (_, i) => ({
            gameNumber: i + 1,
            homePoints: 0,
            awayPoints: 0,
            isComplete: false,
          })),
        },
      },
    });

    console.log(
      `Match ${match.matchNumber} R${p.round}: ${p.home} vs ${p.away} @ ${
        sherrySlot ? "3:00 PM" : "7:30 PM"
      }`
    );
    matchNumber++;
  }

  console.log("Seed complete: 4 teams, 12 league matches.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
