"use client";
import dynamic from "next/dynamic";
import type { PlotParams } from "react-plotly.js";
import Card from "@/components/ui/Card";

const Plot = dynamic(
  async () => {
    const [{ default: createPlotlyComponent }, Plotly] = await Promise.all([
      import("react-plotly.js/factory"),
      import("plotly.js-dist-min"),
    ]);
    return createPlotlyComponent(Plotly as Parameters<typeof createPlotlyComponent>[0]);
  },
  { ssr: false, loading: () => <div className="h-64 bg-slate-50 rounded-2xl animate-pulse" /> }
);

const MONTHS = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"];

// Illustrative fee curve — not real data
const FEES = [120, 280, 490, 1100, 2400, 3900, 4800, 5500, 6000, 6350, 6580, 6700];
const LIQUIDATION = Array(12).fill(1400); // flat recovery line

export default function PreviewChart() {
  return (
    <section className="py-16 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <p className="text-center text-xs font-semibold text-indigo-500 tracking-widest uppercase mb-2">
          Live Insight Preview
        </p>
        <h2 className="text-center text-3xl font-bold text-slate-800 mb-2">
          See the fee curve before it spikes.
        </h2>
        <p className="text-center text-slate-400 text-sm mb-10">
          Real-time projections show you exactly when holding stock becomes a losing bet.
        </p>

        <Card elevated className="p-6">
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="w-5 h-0.5 rounded-full bg-rose-500 inline-block" />
              <span className="text-xs text-slate-500">Compounding Storage Fees</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-0.5 rounded-full bg-emerald-500 inline-block border-dashed" />
              <span className="text-xs text-slate-500">Liquidation Recovery</span>
            </div>
          </div>

          <Plot
            data={[
              {
                type: "scatter",
                mode: "lines",
                name: "Compounding Fees",
                x: MONTHS,
                y: FEES,
                fill: "tozeroy",
                fillcolor: "rgba(244,63,94,0.08)",
                line: { color: "#f43f5e", width: 2.5, shape: "spline" },
                hovertemplate: "<b>$%{y:,.0f}</b><extra>Fees</extra>",
              },
              {
                type: "scatter",
                mode: "lines",
                name: "Liquidation Recovery",
                x: MONTHS,
                y: LIQUIDATION,
                line: { color: "#059669", width: 2, dash: "dash" },
                hovertemplate: "<b>$%{y:,.0f}</b><extra>Recovery</extra>",
              },
            ]}
            layout={{
              paper_bgcolor: "rgba(0,0,0,0)",
              plot_bgcolor: "rgba(0,0,0,0)",
              margin: { l: 50, r: 10, t: 10, b: 50 },
              legend: { orientation: "h", y: -0.25, font: { size: 11, color: "#94a3b8" } },
              xaxis: { tickfont: { size: 11, color: "#94a3b8" }, gridcolor: "#f1f5f9" },
              yaxis: {
                tickprefix: "$",
                tickfont: { size: 11, color: "#94a3b8" },
                gridcolor: "#f1f5f9",
              },
              hoverlabel: { bgcolor: "#fff", bordercolor: "#e2e8f0", font: { size: 12 } },
            } as PlotParams["layout"]}
            config={{ displayModeBar: false, responsive: true }}
            style={{ width: "100%", height: "280px" }}
            useResizeHandler
          />
        </Card>
      </div>
    </section>
  );
}
