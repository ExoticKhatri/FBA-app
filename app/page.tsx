"use client";
import { useCallback, useState, useEffect, useRef } from "react";
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

function ContactDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-sm text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1"
      >
        Contact
        <svg className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 z-50 flex flex-col gap-1">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-1 mb-1">Get in touch</p>
          <a
            href="mailto:prakashgour453@gmail.com"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
          >
            <span className="text-lg">✉️</span>
            <div>
              <p className="text-xs font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">Email Us</p>
              <p className="text-[10px] text-slate-400">prakashgour453@gmail.com</p>
            </div>
          </a>
          <a
            href="https://wa.me/917388910781"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-emerald-50 transition-colors group"
          >
            <span className="text-lg">💬</span>
            <div>
              <p className="text-xs font-semibold text-slate-700 group-hover:text-emerald-600 transition-colors">WhatsApp</p>
              <p className="text-[10px] text-slate-400">+91 73889 10781</p>
            </div>
          </a>
          <div className="mt-1 pt-2 border-t border-slate-100 px-3">
            <p className="text-[10px] text-indigo-500 font-medium">🎁 Early beta access — reach out for a free premium month</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        modal: { ondismiss: () => {} },
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
      {/* ── Navbar ── */}
      <nav className="fixed top-0 inset-x-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="font-bold text-slate-800 tracking-tight shrink-0">
            FBA <span className="text-indigo-600">Liquidator</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-800 transition-colors">
              Free Calculator
            </Link>
            <ContactDropdown />
            <button
              type="button"
              onClick={handleUpgrade}
              className="px-4 py-2 rounded-2xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Get Premium
            </button>
          </div>

          {/* Mobile: hamburger */}
          <button
            type="button"
            className="sm:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Open menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden bg-white border-t border-slate-100 px-4 py-3 flex flex-col gap-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-sm text-slate-700 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              🧮 Free FBA Calculator
            </Link>
            <a
              href="mailto:prakashgour453@gmail.com"
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-sm text-slate-700 font-medium"
            >
              ✉️ Email Us
            </a>
            <a
              href="https://wa.me/917388910781"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-emerald-50 text-sm text-emerald-700 font-medium"
            >
              💬 WhatsApp +91 73889 10781
            </a>
            <div className="px-3 py-1">
              <p className="text-[11px] text-indigo-500">🎁 Early beta — reach out for a free premium month</p>
            </div>
            <button
              type="button"
              onClick={() => { handleUpgrade(); setMobileMenuOpen(false); }}
              className="mt-1 w-full py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold"
            >
              Get Premium
            </button>
          </div>
        )}
      </nav>

      <div className="pt-16">
        <HeroBanner />
        <PreviewChart />
        <FeaturesGrid />
        <PricingPanel onUpgradeClick={handleUpgrade} />
      </div>

      <footer className="py-8 border-t border-slate-100 text-center text-xs text-slate-400">
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap px-4">
          <span>© {new Date().getFullYear()} FBA Liquidator</span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">Built for Amazon FBA sellers</span>
          <span>·</span>
          <a href="mailto:prakashgour453@gmail.com" className="hover:text-slate-600">Contact</a>
          <span>·</span>
          <Link href="/billing" className="hover:text-slate-600">Account</Link>
          <span>·</span>
          <Link href="/privacy" className="hover:text-slate-600">Privacy</Link>
          <span>·</span>
          <Link href="/terms" className="hover:text-slate-600">Terms</Link>
        </div>
      </footer>
    </main>
  );
}
