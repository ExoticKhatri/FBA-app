"use client";
import type { SimulationParams, ScenarioPoint, SimulationMetrics } from "@/lib/feeEngine";

interface Props {
  isPremium: boolean;
  params: SimulationParams;
  metrics: SimulationMetrics;
  points: ScenarioPoint[];
  skuLabel?: string;
  onUpgradeClick: () => void;
}

export default function ExportBanner({
  isPremium, params, metrics, points, skuLabel = "Manual Entry", onUpgradeClick,
}: Props) {
  async function handleExport() {
    const { exportActionPlanPDF } = await import("@/lib/pdfExport");
    exportActionPlanPDF(params, metrics, points, skuLabel);
  }

  if (!isPremium) {
    return (
      <button
        onClick={onUpgradeClick}
        className="w-full flex items-center justify-between px-5 py-3 rounded-2xl bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 transition-all group"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">📄</span>
          <div className="text-left">
            <p className="text-sm font-semibold text-emerald-700">Export Action Plan as PDF</p>
            <p className="text-xs text-emerald-500">Premium feature — unlock to download</p>
          </div>
        </div>
        <span className="px-4 py-1.5 rounded-full bg-indigo-600 text-white text-xs font-semibold group-hover:bg-indigo-700 transition-colors">
          🔒 Upgrade
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={handleExport}
      className="w-full flex items-center justify-between px-5 py-3 rounded-2xl bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 transition-all"
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">📄</span>
        <div className="text-left">
          <p className="text-sm font-semibold text-emerald-700">Export Action Plan as PDF</p>
          <p className="text-xs text-emerald-500">Download a formatted summary of this simulation</p>
        </div>
      </div>
      <span className="px-4 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors">
        Download →
      </span>
    </button>
  );
}
