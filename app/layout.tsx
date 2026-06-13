import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FBA Liquidator — Stop Bleeding Amazon Storage Fees",
  description:
    "Identify the exact crossover point where holding Amazon FBA dead stock costs more than liquidating it. Free simulator + premium bulk CSV analysis.",
  keywords: [
    "Amazon FBA",
    "liquidation simulator",
    "FBA storage fees",
    "dead stock",
    "inventory management",
    "Amazon seller tools",
  ],
  openGraph: {
    title: "FBA Liquidator — Stop Bleeding Amazon Storage Fees",
    description:
      "Interactive simulator that shows exactly when holding dead stock costs more than liquidating it.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
