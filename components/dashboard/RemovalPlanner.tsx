import type { RemovalPlan } from "@/lib/feeEngine";
import Card from "@/components/ui/Card";

interface Props {
  plan: RemovalPlan;
  quantity: number;
}

function fmt(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export default function RemovalPlanner({ plan, quantity }: Props) {
  const urgent = plan.monthsUntilBreakEven <= 2;

  return (
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
              <span className="text-base font-bold text-rose-500">{fmt(plan.monthlyCost)}/mo</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase tracking-wide">Total Removal Cost</span>
              <span className="text-base font-bold text-slate-700">{fmt(plan.totalRemovalCost)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase tracking-wide">Break-Even in</span>
              <span className={`text-base font-bold ${plan.monthsUntilBreakEven <= 2 ? "text-rose-500" : "text-slate-700"}`}>
                {plan.monthsUntilBreakEven >= 999 ? "Never" : `${plan.monthsUntilBreakEven} months`}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase tracking-wide">12M Savings if Removed</span>
              <span className="text-base font-bold text-emerald-600">{fmt(plan.saveByRemovingNow)}</span>
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
  );
}
