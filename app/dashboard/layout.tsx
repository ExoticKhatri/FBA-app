import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FBA Fee Calculator & Liquidation Simulator",
  description:
    "Calculate Amazon FBA storage fees, compare liquidation strategies, and find your break-even point. Free simulator — enter any SKU and get instant P&L projections.",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
