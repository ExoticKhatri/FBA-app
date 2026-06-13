"use client";
import dynamic from "next/dynamic";
import type { PlotParams } from "react-plotly.js";
import type { ScenarioPoint } from "@/lib/feeEngine";

// Factory pattern: use dist-min bundle (smaller) with react-plotly wrapper
const Plot = dynamic(
  async () => {
    const [{ default: createPlotlyComponent }, Plotly] = await Promise.all([
      import("react-plotly.js/factory"),
      import("plotly.js-dist-min"),
    ]);
    return createPlotlyComponent(Plotly as Parameters<typeof createPlotlyComponent>[0]);
  },
  { ssr: false, loading: () => <ChartSkeleton /> }
);

function ChartSkeleton() {
  return (
    <div className="w-full h-80 flex items-center justify-center">
      <div className="text-slate-400 text-sm animate-pulse">Rendering chart…</div>
    </div>
  );
}

interface Props {
  points: ScenarioPoint[];
  isPremium: boolean;
}

const COLORS = {
  doNothing: "#f43f5e",        // rose-500
  aggressiveDiscount: "#4f46e5", // indigo-600
  amazonOutlet: "#059669",      // emerald-600
  removalOrder: "#94a3b8",      // slate-400
};

const LAYOUT_BASE = {
  paper_bgcolor: "rgba(0,0,0,0)",
  plot_bgcolor: "rgba(0,0,0,0)",
  margin: { l: 60, r: 20, t: 20, b: 60 },
  legend: {
    orientation: "h" as const,
    y: -0.2,
    font: { size: 11, color: "#64748b" },
  },
  xaxis: {
    tickfont: { size: 11, color: "#94a3b8" },
    gridcolor: "#f1f5f9",
    linecolor: "#e2e8f0",
  },
  yaxis: {
    tickprefix: "$",
    tickfont: { size: 11, color: "#94a3b8" },
    gridcolor: "#f1f5f9",
    linecolor: "#e2e8f0",
  },
  hoverlabel: {
    bgcolor: "#fff",
    bordercolor: "#e2e8f0",
    font: { size: 12, color: "#1e293b" },
  },
};

type PlotDash = "solid" | "dot" | "dash" | "longdash" | "dashdot" | "longdashdot";

function makeTrace(
  name: string,
  color: string,
  x: string[],
  y: number[],
  dash: PlotDash = "solid"
) {
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

export default function SimulatorChart({ points, isPremium }: Props) {
  const x = points.map((p) => p.monthLabel);

  const traces = [
    makeTrace("Do Nothing", COLORS.doNothing, x, points.map((p) => p.doNothing)),
    ...(isPremium
      ? [
          makeTrace(
            "Aggressive Discount",
            COLORS.aggressiveDiscount,
            x,
            points.map((p) => p.aggressiveDiscount)
          ),
          makeTrace(
            "Amazon Outlet",
            COLORS.amazonOutlet,
            x,
            points.map((p) => p.amazonOutlet),
            "dash"
          ),
          makeTrace(
            "Removal Order",
            COLORS.removalOrder,
            x,
            points.map((p) => p.removalOrder),
            "dot"
          ),
        ]
      : []),
  ];

  return (
    <div className="w-full relative">
      {!isPremium && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm rounded-2xl">
          <div className="text-4xl mb-3">🔒</div>
          <p className="text-slate-700 font-semibold text-sm text-center px-6">
            Multi-scenario analysis is a premium feature.
          </p>
          <p className="text-slate-400 text-xs mt-1">Unlock to compare all 4 strategies.</p>
        </div>
      )}
      <Plot
        data={traces}
        layout={{ ...LAYOUT_BASE } as PlotParams["layout"]}
        config={{ displayModeBar: false, responsive: true }}
        style={{ width: "100%", height: "340px" }}
        useResizeHandler
      />
    </div>
  );
}
