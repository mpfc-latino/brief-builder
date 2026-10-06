import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";

// Latinovation type system (as on latinovation.com): Playfair Display for headlines,
// titles and numbers (italic for accents); DM Sans for body copy and UI.
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

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
      <body className={`${dmSans.variable} ${playfair.variable} antialiased`} suppressHydrationWarning>{children}</body>
    </html>
  );
}
