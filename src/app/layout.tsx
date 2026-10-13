import type { Metadata } from "next";
import { Outfit, Syne } from "next/font/google";
import { Nav } from "@/components/Nav";
import "./globals.css";

const display = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["700", "800"],
});

const body = Outfit({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Smash League | Table Tennis Tournament",
  description:
    "Doubles table tennis league — live scoring, match pool, leaderboard, and win/loss tracking.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full`}>
      <body className="min-h-full antialiased">
        <div className="site-shell">
          <Nav />
          {children}
        </div>
      </body>
    </html>
  );
}
