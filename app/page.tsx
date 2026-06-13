"use client";
import { useCallback } from "react";
import Link from "next/link";
import HeroBanner from "@/components/landing/HeroBanner";
import PreviewChart from "@/components/landing/PreviewChart";
import FeaturesGrid from "@/components/landing/FeaturesGrid";
import PricingPanel from "@/components/landing/PricingPanel";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: new (opts: Record<string, unknown>) => { open(): void };
  }
}

function loadRazorpay(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window.Razorpay !== "undefined") { resolve(); return; }
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Razorpay script failed to load"));
    document.head.appendChild(s);
  });
}

export default function LandingPage() {
  const handleUpgrade = useCallback(async () => {
    try {
      const res = await fetch("/api/razorpay/create-subscription", { method: "POST" });
      const { subscriptionId, keyId, error } = await res.json() as {
        subscriptionId?: string; keyId?: string; error?: string;
      };
      if (error || !subscriptionId) {
        alert(error ?? "Could not start checkout. Please try again.");
        return;
      }

      await loadRazorpay();

      const rzp = new window.Razorpay({
        key: keyId,
        subscription_id: subscriptionId,
        name: "FBA Liquidation Simulator",
        description: "Premium Monthly Subscription",
        theme: { color: "#4f46e5" },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_subscription_id: string;
          razorpay_signature: string;
        }) => {
          const v = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          const { token, error: ve } = await v.json() as { token?: string; error?: string };
          if (ve || !token) {
            alert("Payment could not be verified. Contact support.");
            return;
          }
          localStorage.setItem("fba_premium_token", token);
          window.location.href = "/dashboard";
        },
      });
      rzp.open();
    } catch (e) {
      alert((e as Error).message ?? "Unexpected error during checkout.");
    }
  }, []);

  return (
    <main className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-bold text-slate-800 tracking-tight">
            FBA <span className="text-indigo-600">Liquidator</span>
          </span>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-800 transition-colors">
              Dashboard
            </Link>
            <button
              type="button"
              onClick={handleUpgrade}
              className="px-4 py-2 rounded-2xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Get Premium
            </button>
          </div>
        </div>
      </nav>

      <div className="pt-16">
        <HeroBanner />
        <PreviewChart />
        <FeaturesGrid />
        <PricingPanel onUpgradeClick={handleUpgrade} />
      </div>

      <footer className="py-8 border-t border-slate-100 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} FBA Liquidator · Built for Amazon FBA sellers ·{" "}
        <Link href="/billing" className="hover:text-slate-600">Account</Link>
      </footer>
    </main>
  );
}
