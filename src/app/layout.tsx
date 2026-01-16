import type { Metadata } from "next";
import Link from "next/link";
import { Noto_Sans_JP, Space_Grotesk } from "next/font/google";
import ThemeToggle from "@/components/theme-toggle";
import "./globals.css";

const bodyFont = Noto_Sans_JP({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const displayFont = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const navLinks = [
  { href: "/", label: "ホーム" },
  { href: "/teams", label: "チーム" },
  { href: "/leagues", label: "リーグ" },
  { href: "/tournaments", label: "トーナメント" },
];

export const metadata: Metadata = {
  title: "FOLD | サッカーリーグ運用",
  description:
    "チーム登録、リーグ順位表、トーナメント管理のMVPを作るための基盤アプリ。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${bodyFont.variable} ${displayFont.variable}`}
    >
      <body className="min-h-screen antialiased">
        <div className="ambient" aria-hidden="true">
          <span className="orb orb-1" />
          <span className="orb orb-2" />
          <span className="orb orb-3" />
          <span className="ambient-grid" />
        </div>
        <div className="layout-shell">
          <header className="flex flex-col gap-5 pb-10 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <Link href="/" className="brand-mark">
                FOLD
              </Link>
              <p className="text-xs text-[var(--muted)]">
                League & Tournament Ops
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <nav className="flex flex-wrap gap-3 text-sm">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="nav-pill">
                    {link.label}
                  </Link>
                ))}
              </nav>
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
