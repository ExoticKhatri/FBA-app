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
    label: "Projected 12-Month Fees",
    value: fmt(m.projected12MFees, currency),
    color: "text-rose-500",
    bg: "bg-rose-50",
    icon: "📉",
  },
  {
    label: "Optimal Liquidation Date",
    value: m.optimalLiquidationDate,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    icon: "📅",
  },
  {
    label: "Capital Recoverable",
    value: fmt(m.capitalRecoverable, currency),
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    icon: "💰",
  },
  {
    label: "FBA Volume Occupied",
    value: `${m.totalVolumeCubicFeet.toFixed(2)} cu ft`,
    color: "text-slate-600",
    bg: "bg-slate-50",
    icon: "📦",
  },
];

export default function MetricRibbon({ metrics, currency }: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {tiles(metrics, currency).map((t) => (
        <Card key={t.label} className={`p-4 ${t.bg}`}>
          <p className="text-xl mb-1">{t.icon}</p>
          <p className={`text-xl font-bold tracking-tight ${t.color}`}>{t.value}</p>
          <p className="text-xs text-slate-500 mt-1 leading-tight">{t.label}</p>
        </Card>
      ))}
    </div>
  );
}
