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
  metadataBase: new URL("https://fba-flax.vercel.app"),
  title: {
    default: "FBA Liquidator — Stop Bleeding Amazon Storage Fees",
    template: "%s | FBA Liquidator",
  },
  description:
    "Identify the exact crossover point where holding Amazon FBA dead stock costs more than liquidating it. Free simulator + premium bulk CSV analysis.",
  keywords: [
    "Amazon FBA liquidation",
    "FBA storage fee calculator",
    "dead stock Amazon",
    "FBA inventory management",
    "Amazon seller profitability tool",
    "FBA liquidation simulator",
    "long-term storage fees Amazon",
    "Amazon FBA cost analysis",
    "inventory clearance calculator",
    "FBA profit optimizer",
    "Amazon wholesale liquidation",
    "FBA bulk CSV analysis",
  ],
  openGraph: {
    title: "FBA Liquidator — Stop Bleeding Amazon Storage Fees",
    description:
      "Interactive simulator that shows exactly when holding dead stock costs more than liquidating it.",
    url: "https://fba-flax.vercel.app",
    siteName: "FBA Liquidator",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FBA Liquidator — Amazon Inventory Cost Simulator",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FBA Liquidator — Stop Bleeding Amazon Storage Fees",
    description:
      "Interactive simulator for Amazon FBA sellers to find the optimal liquidation crossover point.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "FBA Liquidator",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: "https://fba-flax.vercel.app",
  description:
    "Amazon FBA liquidation simulator that calculates the exact crossover point where liquidating dead stock is more profitable than holding it.",
  offers: {
    "@type": "Offer",
    price: "19",
    priceCurrency: "USD",
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: "19",
      priceCurrency: "USD",
      billingIncrement: 1,
      unitCode: "MON",
    },
  },
  featureList: [
    "FBA storage fee simulation",
    "Liquidation crossover analysis",
    "Bulk CSV upload for multiple SKUs",
    "Multi-scenario Plotly charts",
    "AI-powered SKU prioritization",
    "PDF export",
  ],
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
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
