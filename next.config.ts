import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Include the seeded SQLite file inside serverless function bundles on Vercel
  outputFileTracingIncludes: {
    "/**": ["./prisma/tournament.db", "./prisma/schema.prisma"],
  },
  serverExternalPackages: ["@prisma/client", "prisma"],
};

export default nextConfig;
