"use client";
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
}

export default function DashboardHeader({
  isPremium,
  user,
  fullName,
  avatarUrl,
  authLoading,
  onUpgrade,
  onSignOut,
}: Props) {
  const { region, loading: regionLoading } = useRegion();

  const upgradeLabel = regionLoading || authLoading
    ? "Loading…"
    : `Upgrade — ${region.displayPrice}/mo`;

  return (
    <header className="bg-white border-b border-slate-100 h-14 flex items-center px-6 gap-4 shrink-0 z-10">
      <Link href="/" className="font-bold text-slate-800 tracking-tight text-sm">
        FBA <span className="text-indigo-600">Liquidator</span>
      </Link>
      <span className="text-slate-200">|</span>
      <span className="text-sm text-slate-500">Dashboard</span>

      <div className="ml-auto flex items-center gap-3">
        {isPremium ? (
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
            ✓ Premium
          </span>
        ) : (
          <Button size="sm" onClick={onUpgrade} disabled={authLoading || regionLoading}>
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
