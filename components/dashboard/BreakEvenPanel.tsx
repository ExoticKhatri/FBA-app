import type { BreakEvenResult } from "@/lib/feeEngine";
import Card from "@/components/ui/Card";

interface Props {
  result: BreakEvenResult;
  currentDiscountPct: number;
}

export default function BreakEvenPanel({ result, currentDiscountPct }: Props) {
  const alreadyBeating = currentDiscountPct * 100 >= (result.discountPct ?? 100);

  return (
    <Card className="p-4 flex items-start gap-3 bg-gradient-to-r from-indigo-50/60 to-white">
      <div className="text-2xl mt-0.5">⚖️</div>
      <div className="flex-1">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Break-Even Discount</p>
        {result.discountPct === null ? (
          <p className="text-sm text-slate-600 mt-1">
            No discount level makes the discount strategy beat &ldquo;Do Nothing&rdquo; within 12 months at current velocity.
          </p>
        ) : (
          <>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-indigo-600">{result.discountPct}% off</span>
              <span className="text-xs text-slate-400">minimum to beat holding</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              First profitable month: <span className="font-semibold text-slate-700">{result.monthLabel}</span>
            </p>
            {alreadyBeating ? (
              <p className="text-xs text-emerald-600 font-medium mt-1.5">
                ✓ Your current {(currentDiscountPct * 100).toFixed(0)}% discount is above break-even.
              </p>
            ) : (
              <p className="text-xs text-amber-600 font-medium mt-1.5">
                ↑ Raise your discount from {(currentDiscountPct * 100).toFixed(0)}% to at least {result.discountPct}% to break even.
              </p>
            )}
          </>
        )}
      </div>
    </Card>
  );
}
