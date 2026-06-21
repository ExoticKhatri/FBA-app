import Card from "@/components/ui/Card";
import type { SimulationMetrics } from "@/lib/feeEngine";

interface Props {
  metrics: SimulationMetrics;
  currency: string;
}

function fmt(n: number, currency: string) {
  return n.toLocaleString(undefined, { style: "currency", currency, maximumFractionDigits: 0 });
}

const tiles = (m: SimulationMetrics, currency: string) => [
  {
    label: "Total Fees Next 12 Months",
    value: fmt(m.projected12MFees, currency),
    color: "text-rose-600",
    bg: "bg-rose-50 border border-rose-100",
    icon: "🔥",
  },
  {
    label: "Act By (Optimal Date)",
    value: m.optimalLiquidationDate,
    color: "text-indigo-600",
    bg: "bg-indigo-50 border border-indigo-100",
    icon: "📅",
  },
  {
    label: "You Save By Acting Now",
    value: m.capitalRecoverable > 0 ? `+${fmt(m.capitalRecoverable, currency)}` : "Holding is best",
    color: m.capitalRecoverable > 0 ? "text-emerald-600" : "text-slate-500",
    bg: m.capitalRecoverable > 0 ? "bg-emerald-50 border border-emerald-100" : "bg-slate-50 border border-slate-100",
    icon: "💡",
  },
  {
    label: "FBA Space Occupied",
    value: `${m.totalVolumeCubicFeet.toFixed(2)} cu ft`,
    color: "text-slate-600",
    bg: "bg-slate-50 border border-slate-100",
    icon: "📦",
  },
];

export default function MetricRibbon({ metrics, currency }: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {tiles(metrics, currency).map((t) => (
        <Card key={t.label} className={`p-3 sm:p-4 ${t.bg}`}>
          <p className="text-xl mb-1">{t.icon}</p>
          <p className={`text-lg sm:text-xl font-bold tracking-tight ${t.color}`}>{t.value}</p>
          <p className="text-[11px] text-slate-500 mt-1 leading-tight">{t.label}</p>
        </Card>
      ))}
    </div>
  );
}
