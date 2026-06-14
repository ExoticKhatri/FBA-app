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
      const res = await fetch("/api/razorpay/create-order", { method: "POST" });
      if (res.status === 401) {
        window.location.href = "/auth/login?next=/dashboard&upgrade=1";
        return;
      }
      const { orderId, amount, currency, keyId, error } = await res.json() as {
        orderId?: string; amount?: number; currency?: string; keyId?: string; error?: string;
      };
      if (error || !orderId) {
        alert(error ?? "Could not start checkout. Please try again.");
        return;
      }

      await loadRazorpay();

      const rzp = new window.Razorpay({
        key: keyId,
        amount,
        currency,
        order_id: orderId,
        name: "FBA Liquidation Simulator",
        description: "Premium — $19/month",
        theme: { color: "#4f46e5" },
        modal: {
          ondismiss: () => {},
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          const v = await fetch("/api/razorpay/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          const { success, error: ve } = await v.json() as { success?: boolean; error?: string };
          if (ve || !success) {
            alert("Payment could not be verified. Contact support.");
            return;
          }
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
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <span>© {new Date().getFullYear()} FBA Liquidator</span>
          <span>·</span>
          <span>Built for Amazon FBA sellers</span>
          <span>·</span>
          <Link href="/billing" className="hover:text-slate-600">Account</Link>
          <span>·</span>
          <Link href="/privacy" className="hover:text-slate-600">Privacy Policy</Link>
          <span>·</span>
          <Link href="/terms" className="hover:text-slate-600">Terms of Service</Link>
        </div>
      </footer>
    </main>
  );
}
