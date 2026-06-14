"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import ProfileAvatar from "./ProfileAvatar";

interface ProfileDropdownProps {
  user: User;
  fullName?: string | null;
  avatarUrl?: string | null;
  isPremium: boolean;
  onSignOut: () => void;
}

export default function ProfileDropdown({
  user,
  fullName,
  avatarUrl,
  isPremium,
  onSignOut,
}: ProfileDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const displayName = fullName ?? user.email?.split("@")[0] ?? "User";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Open profile menu"
        aria-expanded={open ? "true" : "false"}
        className="flex items-center gap-2 rounded-full p-0.5 hover:ring-2 hover:ring-indigo-200 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-300"
      >
        <ProfileAvatar avatarUrl={avatarUrl} name={fullName} email={user.email} size="sm" />
        <svg
          className={`w-3 h-3 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">

          {/* Profile header */}
          <div className="bg-linear-to-br from-indigo-50 via-purple-50 to-pink-50 px-5 pt-5 pb-4 flex flex-col items-center gap-3 border-b border-slate-100">
            <div className="relative">
              <ProfileAvatar avatarUrl={avatarUrl} name={fullName} email={user.email} size="lg" />
              {isPremium && (
                <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center ring-2 ring-white text-[9px]">
                  ✓
                </span>
              )}
            </div>
            <div className="text-center">
              <p className="font-semibold text-slate-800 text-sm leading-tight">{displayName}</p>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-55">{user.email}</p>
            </div>
            <span
              className={[
                "px-3 py-1 rounded-full text-[11px] font-semibold",
                isPremium
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-100 text-slate-500",
              ].join(" ")}
            >
              {isPremium ? "✓ Premium" : "Free Tier"}
            </span>
          </div>

          {/* Menu items */}
          <div className="py-1.5">
            <Link
              href="/billing"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <span className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center text-sm">💳</span>
              <span>Account &amp; Billing</span>
            </Link>

            {!isPremium && (
              <Link
                href="/dashboard?upgrade=1"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-indigo-600 hover:bg-indigo-50 transition-colors font-medium"
              >
                <span className="w-7 h-7 rounded-xl bg-indigo-100 flex items-center justify-center text-sm">⚡</span>
                <span>Upgrade to Premium</span>
              </Link>
            )}
          </div>

          <div className="border-t border-slate-100 py-1.5">
            <button
              type="button"
              onClick={() => { setOpen(false); onSignOut(); }}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-500 hover:bg-rose-50 hover:text-rose-500 transition-colors"
            >
              <span className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center text-sm">→</span>
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
