"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import type { PlotParams } from "react-plotly.js";
import type { ScenarioPoint, SimulationParams } from "@/lib/feeEngine";
import Card from "@/components/ui/Card";

const Plot = dynamic(
  async () => {
    const [{ default: createPlotlyComponent }, Plotly] = await Promise.all([
      import("react-plotly.js/factory"),
      import("plotly.js-dist-min"),
    ]);
    return createPlotlyComponent(Plotly as Parameters<typeof createPlotlyComponent>[0]);
  },
  { ssr: false, loading: () => <Skeleton /> }
);

function Skeleton() {
  return (
    <div className="w-full h-80 flex items-center justify-center">
      <div className="text-slate-400 text-sm animate-pulse">Rendering chart…</div>
    </div>
  );
}

// ─── Shared layout ────────────────────────────────────────────────────────────

function makeLayout(sym: string) {
  return {
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    margin: { l: 64, r: 24, t: 12, b: 64 },
    legend: { orientation: "h" as const, y: -0.22, font: { size: 11, color: "#64748b" } },
    xaxis: { tickfont: { size: 11, color: "#94a3b8" }, gridcolor: "#f1f5f9", linecolor: "#e2e8f0" },
    yaxis: { tickprefix: sym, tickfont: { size: 11, color: "#94a3b8" }, gridcolor: "#f1f5f9", linecolor: "#e2e8f0" },
    hoverlabel: { bgcolor: "#fff", bordercolor: "#e2e8f0", font: { size: 12, color: "#1e293b" } },
  };
}

const C = {
  doNothing: "#f43f5e",
  discount: "#4f46e5",
  outlet: "#059669",
  removal: "#94a3b8",
  fees: "#fb923c",
  capital: "#34d399",
  posBar: "#34d399",
  negBar: "#f87171",
  posDisc: "#818cf8",
  negDisc: "#fca5a5",
};

// ─── Chart builders ───────────────────────────────────────────────────────────

function buildPnlTraces(points: ScenarioPoint[], isPremium: boolean) {
  const x = points.map((p) => p.monthLabel);

  function line(name: string, y: number[], color: string, dash = "solid") {
    return {
      type: "scatter" as const,
      mode: "lines+markers" as const,
      name,
      x,
      y,
      line: { color, width: 2.5, dash, shape: "spline" as const },
      marker: { color, size: 5 },
      hovertemplate: `<b>${name}</b><br>%{x}<br><b>$%{y:,.0f}</b><extra></extra>`,
    };
  }

  return [
    line("Do Nothing", points.map((p) => p.doNothing), C.doNothing),
    ...(isPremium ? [
      line("Aggressive Discount", points.map((p) => p.aggressiveDiscount), C.discount),
      line("Amazon Outlet", points.map((p) => p.amazonOutlet), C.outlet, "dash"),
      line("Removal Order", points.map((p) => p.removalOrder), C.removal, "dot"),
    ] : []),
  ];
}

function buildErosionTraces(points: ScenarioPoint[], inventoryValue: number) {
  const x = points.map((p) => p.monthLabel);
  const consumed = points.map((p) => Math.min(p.cumulativeFees, inventoryValue));
  const remaining = points.map((p) => Math.max(0, inventoryValue - p.cumulativeFees));

  return [
    {
      type: "bar" as const,
      name: "Capital Remaining",
      x,
      y: remaining,
      marker: { color: C.capital, opacity: 0.9 },
      hovertemplate: "<b>Capital remaining</b><br>%{x}<br><b>$%{y:,.0f}</b><extra></extra>",
    },
    {
      type: "bar" as const,
      name: "Fees Consumed",
      x,
      y: consumed,
      marker: { color: C.fees, opacity: 0.85 },
      hovertemplate: "<b>Cumulative fees</b><br>%{x}<br><b>$%{y:,.0f}</b><extra></extra>",
    },
  ];
}

function buildCashFlowTraces(points: ScenarioPoint[], isPremium: boolean) {
  const x = points.map((p) => p.monthLabel);

  const dnMonthly = points.map((p, i) =>
    p.doNothing - (i > 0 ? points[i - 1].doNothing : 0)
  );
  const discMonthly = points.map((p, i) =>
    p.aggressiveDiscount - (i > 0 ? points[i - 1].aggressiveDiscount : 0)
  );

  return [
    {
      type: "bar" as const,
      name: "Do Nothing (monthly)",
      x,
      y: dnMonthly,
      marker: { color: dnMonthly.map((v) => (v >= 0 ? C.posBar : C.negBar)), opacity: 0.9 },
      hovertemplate: "<b>Do Nothing</b><br>%{x}<br>Monthly Δ <b>$%{y:,.0f}</b><extra></extra>",
    },
    ...(isPremium ? [{
      type: "bar" as const,
      name: "Aggressive Discount (monthly)",
      x,
      y: discMonthly,
      marker: { color: discMonthly.map((v) => (v >= 0 ? C.posDisc : C.negDisc)), opacity: 0.9 },
      hovertemplate: "<b>Discount</b><br>%{x}<br>Monthly Δ <b>$%{y:,.0f}</b><extra></extra>",
    }] : []),
  ];
}

function buildCompareTraces(points: ScenarioPoint[], isPremium: boolean) {
  const last = points[points.length - 1];
  const strategies = [
    { name: "Do Nothing", value: last.doNothing, color: C.doNothing },
    ...(isPremium ? [
      { name: "Aggressive Discount", value: last.aggressiveDiscount, color: C.discount },
      { name: "Amazon Outlet", value: last.amazonOutlet, color: C.outlet },
      { name: "Removal Order", value: last.removalOrder, color: C.removal },
    ] : []),
  ].sort((a, b) => b.value - a.value);

  return [{
    type: "bar" as const,
    orientation: "h" as const,
    name: "12-Month Net",
    x: strategies.map((s) => s.value),
    y: strategies.map((s) => s.name),
    marker: { color: strategies.map((s) => s.color), opacity: 0.9 },
    text: strategies.map((s) =>
      `$${s.value >= 0 ? "+" : ""}${Math.round(s.value).toLocaleString()}`
    ),
    textposition: "outside" as const,
    textfont: { size: 11, color: "#475569" },
    hovertemplate: "<b>%{y}</b><br>12-month net: <b>$%{x:,.0f}</b><extra></extra>",
    cliponaxis: false,
  }];
}

// ─── Chart types ──────────────────────────────────────────────────────────────

type ChartType = "pnl" | "erosion" | "cashflow" | "compare";

const TABS: {
  id: ChartType;
  icon: string;
  label: string;
  description: string;
  requiresLogin: boolean;
  premiumRequired: boolean;
}[] = [
  {
    id: "pnl",
    icon: "📈",
    label: "P&L Trend",
    description: "Cumulative net cash position for each liquidation strategy over 12 months",
    requiresLogin: false,
    premiumRequired: false,
  },
  {
    id: "erosion",
    icon: "🔥",
    label: "Fee Burn",
    description: "How storage & aged inventory fees erode your capital month by month",
    requiresLogin: true,
    premiumRequired: false,
  },
  {
    id: "cashflow",
    icon: "💸",
    label: "Monthly Flow",
    description: "Net cash generated each month — revenue in vs. fees out",
    requiresLogin: true,
    premiumRequired: false,
  },
  {
    id: "compare",
    icon: "🏆",
    label: "Final Score",
    description: "12-month outcome comparison — which strategy recovers the most capital",
    requiresLogin: false,
    premiumRequired: true,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  points: ScenarioPoint[];
  params: SimulationParams;
  isPremium: boolean;
  isLoggedIn: boolean;
  skuLabel: string;
  currencySymbol: string;
  onUpgradeClick: () => void;
  onLoginClick: () => void;
}

export default function InsightChart({
  points,
  params,
  isPremium,
  isLoggedIn,
  skuLabel,
  currencySymbol,
  onUpgradeClick,
  onLoginClick,
}: Props) {
  const [activeTab, setActiveTab] = useState<ChartType>("pnl");

  const tab = TABS.find((t) => t.id === activeTab)!;
  const isLoginGated = tab.requiresLogin && !isLoggedIn;
  const isPremiumGated = tab.premiumRequired && !isPremium;
  const isLocked = isLoginGated || isPremiumGated;

  const inventoryValue = params.quantity * params.currentPrice;
  const BASE_LAYOUT = makeLayout(currencySymbol);

  // Build traces + layout overrides for active chart
  let traces: object[] = [];
  let layoutOverride: Partial<PlotParams["layout"]> = {};

  if (activeTab === "pnl") {
    traces = buildPnlTraces(points, isPremium);
  } else if (activeTab === "erosion") {
    traces = buildErosionTraces(points, inventoryValue);
    layoutOverride = { barmode: "stack" as const };
  } else if (activeTab === "cashflow") {
    traces = buildCashFlowTraces(points, isPremium);
    layoutOverride = {
      barmode: "group" as const,
      yaxis: { ...BASE_LAYOUT.yaxis, tickprefix: currencySymbol, zeroline: true, zerolinecolor: "#e2e8f0", zerolinewidth: 2 },
    };
  } else if (activeTab === "compare") {
    traces = buildCompareTraces(points, isPremium);
    layoutOverride = {
      xaxis: { ...BASE_LAYOUT.xaxis, tickprefix: currencySymbol },
      yaxis: { ...BASE_LAYOUT.yaxis, tickprefix: "", automargin: true },
      margin: { l: 150, r: 90, t: 12, b: 40 },
      legend: { ...BASE_LAYOUT.legend, orientation: "v", y: 0.5 },
    };
  }

  return (
    <Card elevated className="p-6 flex flex-col gap-4">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-bold text-slate-800">Inventory Analysis</h2>
          <p className="text-xs text-slate-400 mt-0.5 leading-snug">
            {tab.description}
            <span className="mx-1.5 text-slate-300">·</span>
            <span className="text-indigo-500">{skuLabel}</span>
          </p>
        </div>
        {!isLoggedIn ? (
          <button type="button" onClick={onLoginClick} className="shrink-0 px-3 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-semibold hover:bg-sky-700 transition-colors">
            Sign In Free
          </button>
        ) : !isPremium ? (
          <button type="button" onClick={onUpgradeClick} className="shrink-0 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors">
            Unlock Premium
          </button>
        ) : null}
      </div>

      {/* Tab switcher */}
      <div className="flex flex-wrap gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        {TABS.map((t) => {
          const loginGated = t.requiresLogin && !isLoggedIn;
          const premGated = t.premiumRequired && !isPremium;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={[
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                activeTab === t.id
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700",
              ].join(" ")}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
              {loginGated && <span className="text-[9px] text-sky-500">●</span>}
              {!loginGated && premGated && <span className="text-[9px] text-amber-500">●</span>}
            </button>
          );
        })}
      </div>

      {/* Chart area */}
      <div className="relative min-h-85">
        {isLocked && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/85 backdrop-blur-sm rounded-2xl">
            <div className="text-3xl mb-2">{isLoginGated ? "🔐" : "🔒"}</div>
            {isLoginGated ? (
              <>
                <p className="text-slate-700 font-semibold text-sm text-center">
                  Sign in to unlock this chart
                </p>
                <p className="text-slate-400 text-xs mt-1 text-center px-6">
                  Free accounts get access to Fee Burn and Monthly Flow analysis.
                </p>
                <button
                  type="button"
                  onClick={onLoginClick}
                  className="mt-3 px-4 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-semibold hover:bg-sky-700 transition-colors"
                >
                  Sign In Free
                </button>
              </>
            ) : (
              <>
                <p className="text-slate-700 font-semibold text-sm text-center">
                  Multi-scenario analysis is premium
                </p>
                <p className="text-slate-400 text-xs mt-1">Compare all 4 strategies side by side.</p>
                <button
                  type="button"
                  onClick={onUpgradeClick}
                  className="mt-3 px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors"
                >
                  Upgrade Now
                </button>
              </>
            )}
          </div>
        )}

        <Plot
          data={traces as PlotParams["data"]}
          layout={{ ...BASE_LAYOUT, ...layoutOverride } as PlotParams["layout"]}
          config={{ displayModeBar: false, responsive: true }}
          style={{ width: "100%", height: "340px" }}
          useResizeHandler
        />
      </div>

    </Card>
  );
}
