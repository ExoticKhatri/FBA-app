import type { RemovalPlan } from "@/lib/feeEngine";
import Card from "@/components/ui/Card";

interface Props {
  plan: RemovalPlan;
  quantity: number;
  isPremium: boolean;
  currency: string;
  onUpgradeClick: () => void;
}

function fmt(n: number, currency: string) {
  return n.toLocaleString(undefined, { style: "currency", currency, maximumFractionDigits: 0 });
}

export default function RemovalPlanner({ plan, quantity, isPremium, currency, onUpgradeClick }: Props) {
  const urgent = plan.monthsUntilBreakEven <= 2;

  return (
    <div className="relative overflow-hidden rounded-3xl">
      <Card className={`p-5 border-l-4 ${urgent ? "border-rose-400" : "border-indigo-300"}`}>
        <div className="flex items-start gap-3">
          <div className="text-2xl">{urgent ? "🚨" : "📋"}</div>
          <div className="flex-1">
            <h3 className="font-bold text-slate-800 text-sm">Removal Order Planner</h3>
            <p className="text-xs text-slate-400 mt-0.5 mb-3">
              Should you submit a removal order now?
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase tracking-wide">Monthly Storage Cost</span>
                <span className="text-base font-bold text-rose-500">{fmt(plan.monthlyCost, currency)}/mo</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase tracking-wide">Total Removal Cost</span>
                <span className="text-base font-bold text-slate-700">{fmt(plan.totalRemovalCost, currency)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase tracking-wide">Break-Even in</span>
                <span className={`text-base font-bold ${plan.monthsUntilBreakEven <= 2 ? "text-rose-500" : "text-slate-700"}`}>
                  {plan.monthsUntilBreakEven >= 999 ? "Never" : `${plan.monthsUntilBreakEven} months`}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase tracking-wide">12M Savings if Removed</span>
                <span className="text-base font-bold text-emerald-600">{fmt(plan.saveByRemovingNow, currency)}</span>
              </div>
            </div>

            <div className={`mt-4 p-3 rounded-xl text-xs font-medium ${urgent ? "bg-rose-50 text-rose-700" : "bg-indigo-50 text-indigo-700"}`}>
              {urgent
                ? `⚡ Remove all ${quantity.toLocaleString()} units by ${plan.removeByDate} — storage fees exceed removal cost in ${plan.monthsUntilBreakEven} month${plan.monthsUntilBreakEven === 1 ? "" : "s"}.`
                : `ℹ Removal cost is covered in ${plan.monthsUntilBreakEven} months of fees. Re-evaluate if velocity drops.`}
            </div>
          </div>
        </div>
      </Card>

      {!isPremium && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/85 backdrop-blur-sm rounded-3xl">
          <div className="text-2xl mb-1">🔒</div>
          <p className="text-sm font-semibold text-slate-700">Removal Order Planner</p>
          <p className="text-xs text-slate-400 mt-0.5 mb-2.5 text-center px-4">
            Get a month-by-month removal schedule and break-even timing
          </p>
          <button
            type="button"
            onClick={onUpgradeClick}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors"
          >
            Unlock Premium
          </button>
        </div>
      )}
    </div>
  );
}
