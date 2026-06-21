"use client";
import { useState, useEffect } from "react";
import type { SkuSummary } from "@/lib/feeEngine";
import type { AiSkuInsight } from "@/app/api/ai/prioritize/route";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface Props {
  skus: SkuSummary[];
  isPremium: boolean;
  currency: string;
  onSelectSku: (sku: SkuSummary) => void;
  model: string;
}

type SortKey = keyof Pick<SkuSummary, "sku" | "quantity" | "ageInDays" | "monthlyFee" | "projected12MFees" | "urgencyScore">;

const ACTION_COLORS: Record<SkuSummary["recommendedAction"], string> = {
  Remove: "bg-rose-100 text-rose-700",
  Outlet: "bg-amber-100 text-amber-700",
  Discount: "bg-indigo-100 text-indigo-700",
  Hold: "bg-slate-100 text-slate-600",
};

function fmt(n: number, currency: string) {
  return n.toLocaleString(undefined, { style: "currency", currency, maximumFractionDigits: 0 });
}

export default function MultiSkuTable({ skus, isPremium, currency, onSelectSku, model }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("urgencyScore");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [aiInsights, setAiInsights] = useState<AiSkuInsight[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  function sort(key: SortKey) {
    if (key === sortKey) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  }

  const sorted = [...skus].sort((a, b) => {
    const av = a[sortKey], bv = b[sortKey];
    const cmp = typeof av === "string" ? av.localeCompare(bv as string) : (av as number) - (bv as number);
    return sortDir === "asc" ? cmp : -cmp;
  });

  async function runAiPrioritize() {
    if (!isPremium) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch("/api/ai/prioritize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skus, model }),
      });
      const data = await res.json() as { rankings?: AiSkuInsight[]; error?: string };
      if (data.error) { setAiError(data.error); return; }
      setAiInsights(data.rankings ?? []);
    } catch {
      setAiError("Failed to reach AI service.");
    } finally {
      setAiLoading(false);
    }
  }

  const insightMap = new Map(aiInsights.map(i => [i.sku, i]));

  function Th({ label, k }: { label: string; k: SortKey }) {
    const active = sortKey === k;
    return (
      <th
        className="px-3 py-2 text-left text-[11px] font-semibold text-slate-500 cursor-pointer hover:text-slate-800 whitespace-nowrap select-none"
        onClick={() => sort(k)}
      >
        {label} {active ? (sortDir === "desc" ? "↓" : "↑") : ""}
      </th>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">Portfolio SKU Table</h3>
          <p className="text-xs text-slate-400 mt-0.5">{skus.length} SKUs detected · Click a row to simulate</p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          disabled={!isPremium || aiLoading}
          onClick={runAiPrioritize}
        >
          {aiLoading ? "Analyzing…" : "🤖 AI Prioritize"}
        </Button>
      </div>

      {aiError && (
        <p className="text-xs text-rose-500 px-5 py-2">{aiError}</p>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <Th label="SKU" k="sku" />
              <Th label="Qty" k="quantity" />
              <Th label="Age (days)" k="ageInDays" />
              <Th label="Monthly Fee" k="monthlyFee" />
              <Th label="12M Fees" k="projected12MFees" />
              <Th label="Urgency" k="urgencyScore" />
              <th className="px-3 py-2 text-left text-[11px] font-semibold text-slate-500 whitespace-nowrap">Action</th>
              {aiInsights.length > 0 && (
                <th className="px-3 py-2 text-left text-[11px] font-semibold text-indigo-500 whitespace-nowrap">🤖 AI</th>
              )}
            </tr>
          </thead>
          <tbody>
            {sorted.map((sku, i) => {
              const insight = insightMap.get(sku.sku);
              return (
                <tr
                  key={sku.sku}
                  onClick={() => onSelectSku(sku)}
                  className={`cursor-pointer border-b border-slate-50 hover:bg-indigo-50/50 transition-colors ${i % 2 === 0 ? "bg-white" : "bg-slate-50/30"}`}
                >
                  <td className="px-3 py-2.5 font-mono text-xs text-slate-700 max-w-[120px] truncate">{sku.sku}</td>
                  <td className="px-3 py-2.5 text-slate-600">{sku.quantity.toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-slate-600">
                    <span className={sku.ageInDays > 270 ? "text-rose-500 font-semibold" : sku.ageInDays > 180 ? "text-amber-500" : ""}>
                      {sku.ageInDays}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-rose-500 font-medium">{fmt(sku.monthlyFee, currency)}</td>
                  <td className="px-3 py-2.5 text-rose-600 font-semibold">{fmt(sku.projected12MFees, currency)}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${sku.urgencyScore >= 8 ? "bg-rose-500" : sku.urgencyScore >= 5 ? "bg-amber-400" : "bg-emerald-400"}`}
                          style={{ width: `${sku.urgencyScore * 10}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-600">{sku.urgencyScore}/10</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ACTION_COLORS[sku.recommendedAction]}`}>
                      {sku.recommendedAction}
                    </span>
                  </td>
                  {aiInsights.length > 0 && (
                    <td className="px-3 py-2.5 max-w-[160px]">
                      {insight ? (
                        <div>
                          <p className="text-xs font-semibold text-indigo-700">{insight.aiAction}</p>
                          <p className="text-[10px] text-slate-400 leading-tight">{insight.reasoning}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
