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

const SITE_URL = "https://fba-flax.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "FBA Liquidator — Free Amazon FBA Fee Calculator & Liquidation Simulator",
    template: "%s | FBA Liquidator",
  },
  description:
    "Free Amazon FBA calculator that shows exactly when liquidating dead stock beats holding it. Calculate storage fees, compare 4 exit strategies, and stop losing money on aged inventory. Trusted by FBA sellers worldwide.",
  keywords: [
    // Core tool searches
    "Amazon FBA calculator",
    "FBA fee calculator",
    "Amazon FBA liquidation calculator",
    "FBA storage fee calculator",
    "Amazon inventory calculator",
    "FBA profit calculator",
    "Amazon FBA cost calculator",
    // Problem-aware searches
    "Amazon FBA dead stock",
    "FBA aged inventory fees",
    "Amazon long-term storage fees",
    "FBA inventory write-off",
    "Amazon FBA storage cost",
    "high FBA storage fees",
    "Amazon stranded inventory",
    // Solution searches
    "FBA liquidation strategy",
    "Amazon seller liquidation",
    "FBA inventory clearance",
    "Amazon removal order calculator",
    "FBA inventory management tool",
    "Amazon wholesale liquidation",
    "FBA bulk inventory analysis",
    // Analysis searches
    "Amazon FBA profit and loss",
    "FBA cost analysis tool",
    "Amazon seller profitability",
    "FBA break even calculator",
    "Amazon inventory aging report",
    "FBA recommended removal report",
    "Amazon inventory health report analysis",
    // How-to searches
    "when to liquidate Amazon FBA inventory",
    "FBA storage fee vs removal order",
    "how to reduce Amazon FBA storage fees",
    "how to clear FBA dead stock",
    "Amazon FBA inventory liquidation tips",
    "FBA seller tools free",
    "Amazon seller central storage fees calculator",
  ],
  authors: [{ name: "FBA Liquidator" }],
  creator: "FBA Liquidator",
  publisher: "FBA Liquidator",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    title: "FBA Liquidator — Free Amazon FBA Fee Calculator & Liquidation Simulator",
    description:
      "Calculate exactly when holding dead FBA stock costs more than liquidating it. Free simulator — no signup needed. Compare 4 exit strategies instantly.",
    url: SITE_URL,
    siteName: "FBA Liquidator",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FBA Liquidator — Amazon FBA Storage Fee & Liquidation Calculator",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FBA Liquidator — Free Amazon FBA Fee Calculator",
    description:
      "Stop bleeding Amazon storage fees. Free FBA calculator shows when to liquidate vs hold. Try it free — no signup needed.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
  alternates: {
    canonical: SITE_URL,
  },
};

const softwareAppSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "FBA Liquidator",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: SITE_URL,
  description:
    "Amazon FBA fee calculator and liquidation simulator. Shows exactly when liquidating dead stock is more profitable than paying ongoing storage fees. Supports all Amazon marketplaces.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Free basic simulator. Premium from $19/month.",
  },
  featureList: [
    "Free FBA storage fee calculator",
    "Amazon liquidation break-even analysis",
    "4-scenario comparison: Hold, Discount, Outlet, Remove",
    "Bulk CSV upload for Amazon Inventory Health reports",
    "AI-powered SKU urgency prioritization",
    "Multi-region support: US, India, UK, EU, Canada, Australia",
    "PDF export of analysis",
    "Break-even finder for removal orders",
    "Monthly cash flow visualization",
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is an Amazon FBA fee calculator?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "An Amazon FBA fee calculator helps sellers estimate the total cost of storing and selling through Fulfillment by Amazon — including monthly storage fees, long-term storage surcharges, referral fees, fulfillment fees, and inbound shipping costs. FBA Liquidator calculates all 10 FBA fee types and shows 12-month projections.",
      },
    },
    {
      "@type": "Question",
      name: "How do I calculate Amazon FBA storage fees?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Amazon charges monthly storage fees based on the cubic feet your inventory occupies in their fulfillment centers. Standard-size items cost $0.78/cu ft (Jan–Sep) and $2.40/cu ft (Oct–Dec peak). To calculate: multiply your unit's cubic feet × quantity × monthly rate. FBA Liquidator does this automatically for your entire inventory.",
      },
    },
    {
      "@type": "Question",
      name: "When should I liquidate Amazon FBA inventory?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You should liquidate FBA inventory when your monthly storage costs exceed the profit potential of keeping it. The exact crossover point depends on your product's sales velocity, price, storage size, and age. FBA Liquidator's break-even finder calculates this automatically and tells you the optimal date to act.",
      },
    },
    {
      "@type": "Question",
      name: "What are Amazon long-term storage fees?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Amazon charges aged inventory surcharges for items stored over 181 days: $3.80/cu ft for 181–270 days, $4.00/cu ft for 271–365 days, and higher rates for 365+ days. These fees are assessed on the 15th of each month and can quickly exceed the product's value. FBA Liquidator tracks these surcharges month by month.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between Amazon liquidation and a removal order?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A removal order has Amazon physically ship your inventory back to you or dispose of it — costing $0.97–$3.12/unit for standard items. Amazon Outlet/Liquidation sells your items at a steep discount (recovering 5–15% of value) with no removal fee. FBA Liquidator compares both options against holding costs so you can pick the most profitable exit.",
      },
    },
    {
      "@type": "Question",
      name: "How do I reduce Amazon FBA storage fees?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "To reduce FBA storage fees: (1) Use Amazon's Inventory Health report to identify slow-moving items, (2) Create removal orders before items hit the 181-day threshold, (3) Use Sponsored Products to boost sell-through velocity, (4) Opt into Amazon Outlet for aged inventory, (5) Run flash discount campaigns. FBA Liquidator's simulator models all these strategies.",
      },
    },
    {
      "@type": "Question",
      name: "Can I use this calculator for Amazon India (Amazon.in)?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. FBA Liquidator supports 11 Amazon marketplaces including Amazon India (INR ₹), Amazon US (USD $), Amazon UK (GBP £), Amazon Europe (EUR €), Amazon Canada, Australia, Japan, Mexico, Brazil, Singapore, and UAE. The calculator automatically detects your region and applies the correct local fee rates.",
      },
    },
    {
      "@type": "Question",
      name: "Is this FBA calculator free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The basic FBA fee calculator and single-SKU simulator are completely free — no signup required. Premium features (bulk CSV upload for multiple SKUs, all 4 liquidation scenario charts, AI SKU prioritization, PDF export, break-even analysis) are available from $19/month.",
      },
    },
  ],
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "FBA Liquidator",
  url: SITE_URL,
  description: "Amazon FBA fee calculator and inventory liquidation simulator for sellers worldwide.",
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "prakashgour453@gmail.com",
      availableLanguage: ["English", "Hindi"],
    },
  ],
};

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Calculate Amazon FBA Liquidation Break-Even Point",
  description: "Step-by-step guide to finding the exact point where liquidating Amazon FBA inventory is more profitable than continuing to store it.",
  step: [
    {
      "@type": "HowToStep",
      name: "Enter your inventory details",
      text: "Input your SKU quantity, item size (standard or oversize), cubic feet per unit, current price, COGS, and monthly sales velocity into the FBA Liquidator simulator.",
    },
    {
      "@type": "HowToStep",
      name: "Review fee projections",
      text: "The simulator calculates all 10 Amazon FBA fees — storage, fulfillment, referral, inbound, placement, fuel surcharge, aged surcharges, and more — projected over 12 months.",
    },
    {
      "@type": "HowToStep",
      name: "Compare liquidation strategies",
      text: "View the P&L trend chart comparing Do Nothing, Aggressive Discount, Amazon Outlet, and Removal Order strategies side by side to see which recovers the most capital.",
    },
    {
      "@type": "HowToStep",
      name: "Find your break-even date",
      text: "The break-even panel shows exactly how many months until removal costs pay for themselves through saved storage fees — so you know whether to act now or wait.",
    },
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
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
        {children}
      </body>
    </html>
  );
}
