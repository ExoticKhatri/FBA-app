"use client";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
import {
  applyMapping,
  aggregateBySku,
  type ColumnMapping,
  type ParsedCSV,
} from "@/lib/csvParser";
import type { ChatContext } from "@/app/api/ai/chat/route";
import ManualInputForm from "@/components/dashboard/ManualInputForm";
import FeeConfigPanel from "@/components/dashboard/FeeConfigPanel";
import FileUploadZone from "@/components/dashboard/FileUploadZone";
import ColumnMapper from "@/components/dashboard/ColumnMapper";
import MetricRibbon from "@/components/dashboard/MetricRibbon";
import SimulatorChart from "@/components/dashboard/SimulatorChart";
import ExportBanner from "@/components/dashboard/ExportBanner";
import BreakEvenPanel from "@/components/dashboard/BreakEvenPanel";
import RemovalPlanner from "@/components/dashboard/RemovalPlanner";
import MultiSkuTable from "@/components/dashboard/MultiSkuTable";
import AIChat from "@/components/dashboard/AIChat";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ProfileDropdown from "@/components/ui/ProfileDropdown";

declare global {
  interface Window {
    Razorpay: new (opts: Record<string, unknown>) => { open(): void };
  }
}

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

type Tab = "manual" | "csv";

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [user, setUser] = useState<User | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [fullName, setFullName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [feeRates, setFeeRates] = useState<FeeRates>(DEFAULT_FEE_RATES);
  const [params, setParams] = useState<SimulationParams>(() => defaultParams(DEFAULT_FEE_RATES));
  const [showFeeConfig, setShowFeeConfig] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("manual");
  const [csv, setCsv] = useState<ParsedCSV | null>(null);
  const [mapping, setMapping] = useState<Partial<ColumnMapping>>({});
  const [skuLabel, setSkuLabel] = useState("Manual Entry");
  const [skuSummaries, setSkuSummaries] = useState<SkuSummary[]>([]);
  const [aiModel, setAiModel] = useState("gpt-4o");

  useEffect(() => {
    setParams((p) => ({ ...p, rates: feeRates }));
  }, [feeRates]);

  // Load auth state and premium status from Supabase
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

  // Auto-trigger upgrade flow when redirected back from login with ?upgrade=1
  useEffect(() => {
    if (searchParams.get("upgrade") === "1" && user && !authLoading) {
      handleUpgrade();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  useEffect(() => {
    if (searchParams.get("tab") === "csv") setActiveTab("csv");
  }, [searchParams]);

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
  }), [params, metrics, scenarios, skuLabel]);

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

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setIsPremium(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top nav */}
      <header className="bg-white border-b border-slate-100 h-14 flex items-center px-6 gap-4 shrink-0">
        <Link href="/" className="font-bold text-slate-800 tracking-tight text-sm">
          FBA <span className="text-indigo-600">Liquidator</span>
        </Link>
        <span className="text-slate-200">|</span>
        <span className="text-sm text-slate-500">Dashboard</span>
        <div className="ml-auto flex items-center gap-3">
          {isPremium ? (
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">✓ Premium</span>
          ) : (
            <Button size="sm" onClick={handleUpgrade} disabled={authLoading}>
              {authLoading ? "Loading…" : "Upgrade — $19/mo"}
            </Button>
          )}
          {user ? (
            <ProfileDropdown
              user={user}
              fullName={fullName}
              avatarUrl={avatarUrl}
              isPremium={isPremium}
              onSignOut={handleSignOut}
            />
          ) : (
            <Link href="/auth/login?next=/dashboard" className="text-xs text-slate-400 hover:text-slate-600">Sign in</Link>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ── LEFT SIDEBAR ── */}
        <aside className="w-80 shrink-0 bg-white border-r border-slate-100 overflow-y-auto flex flex-col">
          <div className="p-5 flex flex-col gap-6 flex-1">
            <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl">
              {(["manual", "csv"] as Tab[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setActiveTab(t)}
                  className={[
                    "flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all",
                    activeTab === t ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700",
                  ].join(" ")}
                >
                  {t === "manual" ? "Manual Entry" : "Upload CSV"}
                </button>
              ))}
            </div>

            {activeTab === "manual" && (
              <ManualInputForm params={params} onChange={setParams} />
            )}

            {activeTab === "csv" && (
              <div className="flex flex-col gap-4">
                <FileUploadZone isPremium={isPremium} onParsed={setCsv} onUpgradeClick={handleUpgrade} />
                {csv && (
                  <ColumnMapper csv={csv} mapping={mapping} onMappingChange={setMapping} onApply={handleApplyCSV} />
                )}
              </div>
            )}
          </div>

          {/* Fee config + AI model selector */}
          <div className="p-5 border-t border-slate-100 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setShowFeeConfig(true)}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl border border-slate-200 hover:bg-slate-50 transition-colors text-sm text-slate-600"
            >
              <span>Configure Fee Rates</span>
              <span className="text-slate-400 text-xs">⚙</span>
            </button>
            {isPremium && (
              <div className="flex items-center justify-between px-1">
                <span className="text-xs text-slate-400">AI Model</span>
                <select
                  value={aiModel}
                  onChange={e => setAiModel(e.target.value)}
                  aria-label="AI model selection"
                  className="text-xs text-slate-700 border border-slate-200 rounded-xl px-2 py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <option value="gpt-4o">GPT-4o (Latest)</option>
                  <option value="gpt-4o-mini">GPT-4o Mini (Fast)</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Budget)</option>
                </select>
              </div>
            )}
          </div>
        </aside>

        {/* ── RIGHT WORKSPACE ── */}
        <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          <MetricRibbon metrics={metrics} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <BreakEvenPanel result={breakEven} currentDiscountPct={params.aggressiveDiscountPct} />
            <RemovalPlanner plan={removalPlan} quantity={params.quantity} />
          </div>

          <Card elevated className="p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-800">
                  {isPremium ? "Multi-Scenario Analysis" : "Holding Fee Projection"}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Net cash position over 12 months · {skuLabel}</p>
              </div>
              {!isPremium && (
                <Button size="sm" onClick={handleUpgrade}>Unlock All 4 Scenarios</Button>
              )}
            </div>
            <SimulatorChart points={scenarios} isPremium={isPremium} />
          </Card>

          {skuSummaries.length > 1 && (
            <MultiSkuTable
              skus={skuSummaries}
              isPremium={isPremium}
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
        <FeeConfigPanel rates={feeRates} onChange={setFeeRates} onClose={() => setShowFeeConfig(false)} />
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
