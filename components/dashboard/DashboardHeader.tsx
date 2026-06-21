"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import Button from "@/components/ui/Button";
import ProfileDropdown from "@/components/ui/ProfileDropdown";
import { useRegion } from "@/hooks/useRegion";

interface Props {
  isPremium: boolean;
  user: User | null;
  fullName: string | null;
  avatarUrl: string | null;
  authLoading: boolean;
  onUpgrade: () => void;
  onSignOut: () => void;
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
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
        className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors px-2 py-1.5 rounded-lg hover:bg-slate-50"
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
            onClick={() => setOpen(false)}
          >
            <span className="text-base">✉️</span>
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
            onClick={() => setOpen(false)}
          >
            <span className="text-base">💬</span>
            <div>
              <p className="text-xs font-semibold text-slate-700 group-hover:text-emerald-600 transition-colors">WhatsApp</p>
              <p className="text-[10px] text-slate-400">+91 73889 10781</p>
            </div>
          </a>
          <div className="mt-1 pt-2 border-t border-slate-100 px-3">
            <p className="text-[10px] text-indigo-500 font-medium">🎁 Early beta — reach out for a free premium month</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardHeader({
  isPremium,
  user,
  fullName,
  avatarUrl,
  authLoading,
  onUpgrade,
  onSignOut,
  onToggleSidebar,
  sidebarOpen,
}: Props) {
  const { region, loading: regionLoading } = useRegion();

  const upgradeLabel = regionLoading || authLoading
    ? "Loading…"
    : `Upgrade — ${region.displayPrice}/mo`;

  return (
    <header className="bg-white border-b border-slate-100 h-14 flex items-center px-3 sm:px-6 gap-2 sm:gap-4 shrink-0 z-10">

      {/* Mobile sidebar toggle */}
      {onToggleSidebar && (
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors shrink-0"
        >
          {sidebarOpen ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      )}

      <Link href="/" className="font-bold text-slate-800 tracking-tight text-sm shrink-0">
        FBA <span className="text-indigo-600">Liquidator</span>
      </Link>
      <span className="text-slate-200 hidden sm:block">|</span>
      <span className="text-sm text-slate-500 hidden sm:block">Dashboard</span>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <ContactDropdown />

        {isPremium ? (
          <span className="hidden sm:inline px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
            ✓ Premium
          </span>
        ) : (
          <Button size="sm" onClick={onUpgrade} disabled={authLoading || regionLoading} className="hidden sm:inline-flex">
            {upgradeLabel}
          </Button>
        )}

        {user ? (
          <ProfileDropdown
            user={user}
            fullName={fullName}
            avatarUrl={avatarUrl}
            isPremium={isPremium}
            onSignOut={onSignOut}
          />
        ) : (
          <Link
            href="/auth/login?next=/dashboard"
            className="text-xs text-slate-400 hover:text-slate-600"
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
