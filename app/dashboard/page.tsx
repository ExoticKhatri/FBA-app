"use client";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import {
  DEFAULT_FEE_RATES,
  computeScenarios,
  computeMetrics,
  findBreakEven,
  computeRemovalPlan,
  computeSkuSummaries,
  type FeeRates,
  type SimulationParams,
  type SkuSummary,
} from "@/lib/feeEngine";
import { useFeeRates } from "@/hooks/useFeeRates";
import { useRegion } from "@/hooks/useRegion";
import {
  applyMapping,
  aggregateBySku,
  type ColumnMapping,
  type ParsedCSV,
} from "@/lib/csvParser";
import type { ChatContext } from "@/app/api/ai/chat/route";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ManualInputForm from "@/components/dashboard/ManualInputForm";
import FeeConfigPanel from "@/components/dashboard/FeeConfigPanel";
import FileUploadZone from "@/components/dashboard/FileUploadZone";
import ColumnMapper from "@/components/dashboard/ColumnMapper";
import MetricRibbon from "@/components/dashboard/MetricRibbon";
import VerdictBanner from "@/components/dashboard/VerdictBanner";
import InsightChart from "@/components/dashboard/InsightChart";
import ExportBanner from "@/components/dashboard/ExportBanner";
import BreakEvenPanel from "@/components/dashboard/BreakEvenPanel";
import RemovalPlanner from "@/components/dashboard/RemovalPlanner";
import MultiSkuTable from "@/components/dashboard/MultiSkuTable";
import AIChat from "@/components/dashboard/AIChat";

declare global {
  interface Window {
    Razorpay: new (opts: Record<string, unknown>) => { open(): void };
  }
}

// ─── DEV OVERRIDE ────────────────────────────────────────────────────────────
// Set false (or delete these two lines) before pushing to production.
const DEV_UNLOCK_ALL = false;
// ─────────────────────────────────────────────────────────────────────────────

const NOW = new Date();

function defaultParams(rates: FeeRates): SimulationParams {
  return {
    quantity: 500,
    cubicFeetPerUnit: 0.5,
    isOversize: false,
    ageInDays: 60,
    monthlySalesVelocity: 30,
    currentPrice: 29.99,
    landedCost: 8,
    aggressiveDiscountPct: 0.5,
    velocityMultiplier: 2,
    startMonth: NOW.getMonth() + 1,
    startYear: NOW.getFullYear(),
    rates,
  };
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

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [user, setUser] = useState<User | null>(null);
  const [_isPremium, setIsPremium] = useState(false);
  // DEV OVERRIDE: always true when DEV_UNLOCK_ALL is set — revert to `_isPremium` before push
  const isPremium = DEV_UNLOCK_ALL || _isPremium;
  const isLoggedIn = DEV_UNLOCK_ALL || !!user;

  const [authLoading, setAuthLoading] = useState(true);
  const [fullName, setFullName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const { region } = useRegion();
  const {
    rates: feeRates,
    setRates: setFeeRates,
    saveRates,
    regionDefaults,
    regionName,
    hasSaved,
    clearSaved,
  } = useFeeRates();
  // Merge feeRates reactively via useMemo instead of a setState-in-effect
  const [baseParams, setParams] = useState<SimulationParams>(() => defaultParams(DEFAULT_FEE_RATES));
  const params = useMemo(() => ({ ...baseParams, rates: feeRates }), [baseParams, feeRates]);

  const [showFeeConfig, setShowFeeConfig] = useState(false);
  const [csv, setCsv] = useState<ParsedCSV | null>(null);
  const [mapping, setMapping] = useState<Partial<ColumnMapping>>({});
  const [skuLabel, setSkuLabel] = useState("Manual Entry");
  const [skuSummaries, setSkuSummaries] = useState<SkuSummary[]>([]);
  const aiModel = "gpt-4o";

  // Keep a stable ref so the upgrade-on-mount effect can call the latest version
  // without being listed as a dependency (avoids the "used before declared" issue).
  const handleUpgradeRef = useRef<() => Promise<void>>(async () => {});

  useEffect(() => {
    const supabase = createClient();

    async function loadPremium(userId: string) {
      const { data } = await supabase
        .from("profiles")
        .select("is_premium, premium_expires_at, full_name, avatar_url")
        .eq("id", userId)
        .single();
      if (data?.is_premium && data.premium_expires_at) {
        const expires = new Date(data.premium_expires_at);
        if (expires > new Date()) setIsPremium(true);
      }
      if (data?.full_name) setFullName(data.full_name);
      if (data?.avatar_url) setAvatarUrl(data.avatar_url);
    }

    supabase.auth.getUser().then(({ data: { user: u } }) => {
      setUser(u);
      if (u) loadPremium(u.id).finally(() => setAuthLoading(false));
      else setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) { setIsPremium(false); setAuthLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Auto-trigger upgrade when redirected back with ?upgrade=1
  useEffect(() => {
    if (searchParams.get("upgrade") === "1" && user && !authLoading) {
      handleUpgradeRef.current();
    }
  }, [user, authLoading, searchParams]);

  // Save detected region to Supabase profile whenever it resolves
  useEffect(() => {
    if (!user || !region.code || region.code === "US") return; // US is the default — skip unless truly resolved
    const supabase = createClient();
    supabase
      .from("profiles")
      .update({ region_code: region.code })
      .eq("id", user.id)
      .then(() => {});
  }, [user, region.code]);

  const handleLogin = useCallback(() => {
    router.push(`/auth/login?next=/dashboard`);
  }, [router]);

  const scenarios = useMemo(() => computeScenarios(params), [params]);
  const metrics = useMemo(() => computeMetrics(params, scenarios), [params, scenarios]);
  const breakEven = useMemo(() => findBreakEven(params), [params]);
  const removalPlan = useMemo(() => computeRemovalPlan(params), [params]);

  const chatContext = useMemo<ChatContext>(() => ({
    skuLabel,
    quantity: params.quantity,
    isOversize: params.isOversize,
    ageInDays: params.ageInDays,
    monthlySalesVelocity: params.monthlySalesVelocity,
    currentPrice: params.currentPrice,
    landedCost: params.landedCost,
    aggressiveDiscountPct: params.aggressiveDiscountPct,
    projected12MFees: metrics.projected12MFees,
    optimalLiquidationDate: metrics.optimalLiquidationDate,
    capitalRecoverable: metrics.capitalRecoverable,
    totalVolumeCubicFeet: metrics.totalVolumeCubicFeet,
    doNothingNet12M: scenarios[11]?.doNothing ?? 0,
    discountNet12M: scenarios[11]?.aggressiveDiscount ?? 0,
    outletNet12M: scenarios[11]?.amazonOutlet ?? 0,
    removalNet12M: scenarios[11]?.removalOrder ?? 0,
    skuSummaries: skuSummaries.map((s) => ({
      sku: s.sku,
      quantity: s.quantity,
      ageInDays: s.ageInDays,
      monthlyFee: s.monthlyFee,
      projected12MFees: s.projected12MFees,
      urgencyScore: s.urgencyScore,
      recommendedAction: s.recommendedAction,
    })),
  }), [params, metrics, scenarios, skuLabel, skuSummaries]);

  const handleApplyCSV = useCallback(() => {
    if (!csv) return;
    const rows = applyMapping(csv.rows, mapping as ColumnMapping);
    const agg = aggregateBySku(rows);
    if (agg.length === 0) return;
    const first = agg[0];
    setSkuLabel(first.sku);
    setParams((p) => ({
      ...p,
      quantity: first.quantity,
      cubicFeetPerUnit: first.cubicFeetPerUnit > 0 ? first.cubicFeetPerUnit : 0.5,
      ageInDays: first.ageInDays,
      currentPrice: first.currentPrice > 0 ? first.currentPrice : p.currentPrice,
      landedCost: first.landedCost > 0 ? first.landedCost : p.landedCost,
    }));
    const summaries = computeSkuSummaries(agg, feeRates, NOW.getMonth() + 1, NOW.getFullYear());
    setSkuSummaries(summaries);
  }, [csv, mapping, feeRates]);

  const handleSelectSku = useCallback((sku: SkuSummary) => {
    setSkuLabel(sku.sku);
    setParams((p) => ({ ...p, quantity: sku.quantity, ageInDays: sku.ageInDays }));
  }, []);

  const handleUpgrade = useCallback(async () => {
    if (!user) {
      router.push(`/auth/login?next=/dashboard&upgrade=1`);
      return;
    }
    try {
      const res = await fetch("/api/razorpay/create-order", { method: "POST" });
      const { orderId, amount, currency, keyId, error } = await res.json() as {
        orderId?: string; amount?: number; currency?: string; keyId?: string; error?: string;
      };
      if (error || !orderId) { alert(error ?? "Could not start checkout."); return; }
      await loadRazorpay();
      const rzp = new window.Razorpay({
        key: keyId,
        amount,
        currency,
        order_id: orderId,
        name: "FBA Liquidation Simulator",
        description: "Premium Monthly",
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
          if (ve || !success) { alert("Payment verification failed."); return; }
          const supabase = createClient();
          const { data } = await supabase
            .from("profiles")
            .select("is_premium, premium_expires_at")
            .eq("id", user.id)
            .single();
          if (data?.is_premium) setIsPremium(true);
        },
      });
      rzp.open();
    } catch (e) {
      alert((e as Error).message);
    }
  }, [user, router]);

  // Keep ref in sync so the mount effect always calls the latest version
  useEffect(() => { handleUpgradeRef.current = handleUpgrade; }, [handleUpgrade]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setIsPremium(false);
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-50">
      {/* ── HEADER ── */}
      <DashboardHeader
        isPremium={isPremium}
        user={user}
        fullName={fullName}
        avatarUrl={avatarUrl}
        authLoading={authLoading}
        onUpgrade={handleUpgrade}
        onSignOut={handleSignOut}
      />

      {/* ── BODY: sidebar + visualiser ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── SIDE PANEL (25%) ── */}
        <aside className="w-[25%] shrink-0 flex flex-col bg-white border-r border-slate-100 overflow-hidden">

          {/* Parameters — pinned, never scrolls */}
          <div className="shrink-0 p-3 flex flex-col gap-2.5 border-b border-slate-100">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Parameters
            </p>
            <ManualInputForm params={params} onChange={setParams} currencySymbol={region.symbol} />
            <button
              type="button"
              onClick={() => setShowFeeConfig(true)}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-xs text-slate-600"
            >
              <span>Configure Fee Rates</span>
              <span className="text-slate-400">⚙</span>
            </button>
          </div>

          {/* CSV section — takes remaining height, scrolls only when ColumnMapper is open */}
          <div className="flex-1 min-h-0 overflow-y-auto p-3 flex flex-col gap-2.5">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              CSV Import
            </p>
            <FileUploadZone
              isPremium={isPremium}
              onParsed={setCsv}
              onUpgradeClick={handleUpgrade}
            />
            {csv && (
              <ColumnMapper
                csv={csv}
                mapping={mapping}
                onMappingChange={setMapping}
                onApply={handleApplyCSV}
              />
            )}
          </div>

          {/* Beta offer — pinned at sidebar bottom */}
          <div className="shrink-0 border-t border-slate-100 p-3">
            <div className="rounded-xl bg-linear-to-br from-indigo-50 to-violet-50 border border-indigo-100 p-2.5 flex flex-col gap-1.5">
              <p className="text-[10px] font-bold text-indigo-700 uppercase tracking-wide leading-tight">
                🎁 Get 1 Month Premium Free
              </p>
              <p className="text-[10px] text-indigo-500 leading-snug">
                Share your Amazon sales data with us and get premium free for a month.
              </p>
              <div className="flex flex-col gap-1 pt-0.5">
                <a
                  href="mailto:prakashgour453@gmail.com"
                  className="flex items-center gap-1.5 text-[10px] text-indigo-600 font-semibold hover:text-indigo-800 transition-colors"
                >
                  ✉ prakashgour453@gmail.com
                </a>
                <a
                  href="https://wa.me/917388910781"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-semibold hover:text-emerald-800 transition-colors"
                >
                  💬 WhatsApp +91&nbsp;73889&nbsp;10781
                </a>
              </div>
            </div>
          </div>
        </aside>

        {/* ── VISUALISER (75%) ── */}
        <main className="flex-1 overflow-y-auto p-6 pb-28 flex flex-col gap-5">
          {/* 1. Metric badges */}
          <MetricRibbon metrics={metrics} currency={region.currency} />

          {/* 2. P&L verdict — clear bottom line for the seller */}
          <VerdictBanner
            scenarios={scenarios}
            isLoggedIn={isLoggedIn}
            isPremium={isPremium}
            currency={region.currency}
            onLoginClick={handleLogin}
            onUpgradeClick={handleUpgrade}
          />

          {/* 3. Charts */}
          <InsightChart
            points={scenarios}
            params={params}
            isPremium={isPremium}
            isLoggedIn={isLoggedIn}
            skuLabel={skuLabel}
            currencySymbol={region.symbol}
            onUpgradeClick={handleUpgrade}
            onLoginClick={handleLogin}
          />

          {/* 4. Insight cards — both premium-gated */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <BreakEvenPanel
              result={breakEven}
              currentDiscountPct={params.aggressiveDiscountPct}
              isPremium={isPremium}
              onUpgradeClick={handleUpgrade}
            />
            <RemovalPlanner
              plan={removalPlan}
              quantity={params.quantity}
              isPremium={isPremium}
              currency={region.currency}
              onUpgradeClick={handleUpgrade}
            />
          </div>

          {skuSummaries.length > 1 && (
            <MultiSkuTable
              skus={skuSummaries}
              isPremium={isPremium}
              currency={region.currency}
              onSelectSku={handleSelectSku}
              model={aiModel}
            />
          )}

          <ExportBanner
            isPremium={isPremium}
            params={params}
            metrics={metrics}
            points={scenarios}
            skuLabel={skuLabel}
            onUpgradeClick={handleUpgrade}
          />
        </main>
      </div>

      {showFeeConfig && (
        <FeeConfigPanel
          rates={feeRates}
          onChange={setFeeRates}
          onClose={() => setShowFeeConfig(false)}
          onSave={saveRates}
          onClearSaved={clearSaved}
          regionDefaults={regionDefaults}
          regionName={regionName}
          currencySymbol={region.symbol}
          hasSaved={hasSaved}
        />
      )}

      <AIChat context={chatContext} isPremium={isPremium} onUpgradeClick={handleUpgrade} />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardContent />
    </Suspense>
  );
}
