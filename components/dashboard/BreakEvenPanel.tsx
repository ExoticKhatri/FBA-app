import type { BreakEvenResult, SimulationParams } from "@/lib/feeEngine";
import Card from "@/components/ui/Card";

interface Props {
  result: BreakEvenResult;
  params: SimulationParams;
  currentDiscountPct: number;
  isPremium: boolean;
  onUpgradeClick: () => void;
}

function startMonthLabel(params: SimulationParams): string {
  const d = new Date(params.startYear, params.startMonth - 1, 1);
  return d.toLocaleString("default", { month: "short", year: "2-digit" });
}

export default function BreakEvenPanel({ result, params, currentDiscountPct, isPremium, onUpgradeClick }: Props) {
  const alreadyBeating = currentDiscountPct * 100 >= (result.discountPct ?? 100);
  const startLabel = startMonthLabel(params);
  // If the crossover month label matches the simulation start month it means "immediately"
  const isImmediate = result.monthLabel?.includes(startLabel.split(" ")[0]);

  return (
    <div className="relative overflow-hidden rounded-3xl">
      <Card className="p-4 flex items-start gap-3 bg-linear-to-r from-indigo-50/60 to-white">
        <div className="text-2xl mt-0.5">⚖️</div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Discount Break-Even
          </p>

          {result.discountPct === null ? (
            <p className="text-sm text-slate-600 mt-1">
              No discount level makes liquidating beat holding within 12 months at current velocity.
              Consider raising sales speed or using Removal Order instead.
            </p>
          ) : (
            <>
              <div className="flex items-baseline gap-2 mt-1 flex-wrap">
                <span className="text-2xl font-bold text-indigo-600">
                  {result.discountPct}% off
                </span>
                <span className="text-xs text-slate-400">minimum to beat &quot;Do Nothing&quot;</span>
              </div>

              <p className="text-xs text-slate-500 mt-1">
                Crossover:&nbsp;
                <span className="font-semibold text-slate-700">
                  {isImmediate ? "Immediately (Month 1)" : result.monthLabel}
                </span>
                {isImmediate && (
                  <span className="ml-1 text-emerald-600">— discounting pays off right away</span>
                )}
              </p>

              {alreadyBeating ? (
                <p className="text-xs text-emerald-600 font-medium mt-1.5">
                  ✓ Your {(currentDiscountPct * 100).toFixed(0)}% discount already beats break-even — you&apos;re in the winning zone.
                </p>
              ) : (
                <p className="text-xs text-amber-600 font-medium mt-1.5">
                  Raise from {(currentDiscountPct * 100).toFixed(0)}% → at least {result.discountPct}% to start winning vs. holding.
                </p>
              )}
            </>
          )}
        </div>
      </Card>

      {!isPremium && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/85 backdrop-blur-sm rounded-3xl">
          <div className="text-2xl mb-1">🔒</div>
          <p className="text-sm font-semibold text-slate-700">Break-Even Finder</p>
          <p className="text-xs text-slate-400 mt-0.5 mb-2.5 text-center px-4">
            Find the exact discount % where liquidating beats holding
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
