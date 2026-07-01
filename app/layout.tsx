import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

// Latinovation runs on a single typeface — DM Sans — for everything.
// Hierarchy comes from size + weight, not a separate display face.
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Brief Builder — Latinovation",
  description: "Guided creative-brief generator for the Latinovation team.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* suppressHydrationWarning: browser extensions (Grammarly, etc.) inject
          attributes on <body> before React hydrates — harmless mismatch. */}
      <body className={`${dmSans.variable} antialiased`} suppressHydrationWarning>{children}</body>
    </html>
  );
}
