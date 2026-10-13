import { PrismaClient } from "@prisma/client";
import { copyFileSync, existsSync, mkdirSync } from "fs";
import path from "path";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * On Vercel the deployment FS is read-only except /tmp.
 * Copy the seeded SQLite DB to /tmp once per instance so Prisma can write scores.
 * Locally we use prisma/tournament.db directly — zero cloud DB setup required.
 */
function resolveDatabaseUrl(): string {
  if (process.env.VERCEL || process.env.USE_TMP_DB === "1") {
    const tmpDir = "/tmp";
    const tmpDb = path.join(tmpDir, "tournament.db");
    const bundled = path.join(process.cwd(), "prisma", "tournament.db");

    if (!existsSync(tmpDb) && existsSync(bundled)) {
      try {
        mkdirSync(tmpDir, { recursive: true });
        copyFileSync(bundled, tmpDb);
      } catch (err) {
        console.error("Failed to copy SQLite DB to /tmp:", err);
      }
    }

    return `file:${tmpDb}`;
  }

  return process.env.DATABASE_URL ?? "file:./tournament.db";
}

function createPrismaClient() {
  process.env.DATABASE_URL = resolveDatabaseUrl();
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
