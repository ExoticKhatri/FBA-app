"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ProfileAvatar from "@/components/ui/ProfileAvatar";

interface Profile {
  is_premium: boolean;
  premium_expires_at: string | null;
  razorpay_subscription_id: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

export default function BillingPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user: u } }) => {
      if (!u) { setLoading(false); return; }
      setUser(u);
      const { data } = await supabase
        .from("profiles")
        .select("is_premium, premium_expires_at, razorpay_subscription_id, full_name, avatar_url")
        .eq("id", u.id)
        .single();
      setProfile(data as Profile | null);
      setLoading(false);
    });
  }, []);

  const premiumExpires = profile?.premium_expires_at ? new Date(profile.premium_expires_at) : null;
  const daysRemaining = premiumExpires
    ? Math.max(0, Math.ceil((premiumExpires.getTime() - Date.now()) / 86_400_000))
    : 0;
  const isPremiumActive = !!profile?.is_premium && !!premiumExpires && premiumExpires > new Date();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-100 h-14 flex items-center px-6 gap-4">
        <Link href="/" className="font-bold text-slate-800 tracking-tight text-sm">
          FBA <span className="text-indigo-600">Liquidator</span>
        </Link>
        <span className="text-slate-200">|</span>
        <span className="text-sm text-slate-500">Account &amp; Billing</span>
        <div className="ml-auto flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">← Back to Dashboard</Button>
          </Link>
          {user && (
            <button type="button" onClick={handleSignOut} className="text-xs text-slate-400 hover:text-slate-600">
              Sign out
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 flex items-start justify-center px-6 py-12">
        <div className="w-full max-w-md flex flex-col gap-6">

          {/* Account info */}
          {user && (
            <Card elevated className="overflow-hidden">
              <div className="bg-linear-to-br from-indigo-50 via-purple-50 to-pink-50 px-7 pt-7 pb-6 flex flex-col items-center gap-3 border-b border-slate-100">
                <div className="relative">
                  <ProfileAvatar
                    avatarUrl={profile?.avatar_url}
                    name={profile?.full_name}
                    email={user.email}
                    size="lg"
                  />
                  {isPremiumActive && (
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center ring-2 ring-white text-[9px] text-white">
                      ✓
                    </span>
                  )}
                </div>
                <div className="text-center">
                  <h1 className="text-lg font-bold text-slate-800 leading-tight">
                    {profile?.full_name ?? user.email?.split("@")[0]}
                  </h1>
                  <p className="text-sm text-slate-400 mt-0.5">{user.email}</p>
                </div>
                <span className={[
                  "px-3 py-1 rounded-full text-xs font-semibold",
                  isPremiumActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500",
                ].join(" ")}>
                  {isPremiumActive ? "✓ Premium" : "Free Tier"}
                </span>
              </div>
              <div className="px-7 py-5 flex flex-col gap-1">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-xs text-slate-500">Email</span>
                  <span className="text-sm text-slate-800 font-medium">{user.email}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-xs text-slate-500">Member since</span>
                  <span className="text-sm text-slate-600">{new Date(user.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </Card>
          )}

          {/* Subscription status */}
          <Card elevated className="p-7">
            <h2 className="text-lg font-bold text-slate-800 mb-1">Subscription</h2>
            <p className="text-sm text-slate-400 mb-6">Your current plan and renewal details.</p>

            {loading ? (
              <div className="h-16 bg-slate-100 rounded-2xl animate-pulse" />
            ) : !user ? (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-slate-500">Sign in to view your subscription status.</p>
                <Link href="/auth/login?next=/billing">
                  <Button className="w-full">Sign in</Button>
                </Link>
              </div>
            ) : isPremiumActive ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                  <div>
                    <p className="font-semibold text-emerald-700 text-sm">Premium Active</p>
                    <p className="text-emerald-500 text-xs mt-0.5">Full access to all features</p>
                  </div>
                  <span className="text-2xl">✅</span>
                </div>

                <div className="flex flex-col gap-3 text-sm">
                  {profile?.razorpay_subscription_id && (
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-500">Subscription ID</span>
                      <span className="text-slate-800 font-mono text-xs">{profile.razorpay_subscription_id.slice(0, 22)}…</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-500">Access expires</span>
                    <span className="text-slate-800">{premiumExpires?.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-500">Days remaining</span>
                    <span className={daysRemaining <= 5 ? "text-rose-500 font-semibold" : "text-emerald-600 font-semibold"}>
                      {daysRemaining} days
                    </span>
                  </div>
                </div>

                {daysRemaining <= 5 && (
                  <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100 text-xs text-rose-600">
                    Your premium access expires soon. Your subscription auto-renews via Razorpay on the next billing date.
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-100 border border-slate-200">
                  <div>
                    <p className="font-semibold text-slate-700 text-sm">Free Tier</p>
                    <p className="text-slate-400 text-xs mt-0.5">Manual simulator only</p>
                  </div>
                  <span className="text-2xl">🔓</span>
                </div>
                <p className="text-sm text-slate-500">
                  Upgrade to Premium to unlock CSV ingestion, multi-scenario charts, and PDF exports.
                </p>
                <Link href="/dashboard?upgrade=1">
                  <Button className="w-full">Unlock Premium — $19/month</Button>
                </Link>
              </div>
            )}
          </Card>

          {/* Manage via Razorpay */}
          {isPremiumActive && (
            <Card className="p-6">
              <h2 className="font-semibold text-slate-800 text-sm mb-1">Manage Subscription</h2>
              <p className="text-xs text-slate-400 mb-4">
                To cancel, update payment method, or view invoices, visit the Razorpay customer portal.
              </p>
              <a href="https://razorpay.com/subscriptions" target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm">Open Razorpay Portal →</Button>
              </a>
            </Card>
          )}

          {/* What's included */}
          <Card className="p-6">
            <h2 className="font-semibold text-slate-800 text-sm mb-3">Premium Includes</h2>
            <ul className="flex flex-col gap-2">
              {[
                "Bulk Amazon CSV ingestion (any report type)",
                "4-scenario Plotly comparison charts",
                "AI Analyst chat powered by OpenAI",
                "AI SKU prioritization across your portfolio",
                "Break-even discount finder",
                "Removal order planner",
                "Exportable PDF action plans",
                "Configurable fee rates (all regions)",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-500">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </Card>

        </div>
      </main>
    </div>
  );
}
