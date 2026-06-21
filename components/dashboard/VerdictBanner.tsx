import type { ScenarioPoint } from "@/lib/feeEngine";
import Card from "@/components/ui/Card";

interface Props {
  scenarios: ScenarioPoint[];
  isLoggedIn: boolean;
  isPremium: boolean;
  currency: string;
  monthlyFeeBurn: number;
  onLoginClick: () => void;
  onUpgradeClick: () => void;
}

function fmtAbs(n: number, currency: string): string {
  return Math.abs(Math.round(n)).toLocaleString(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });
}

export default function VerdictBanner({
  scenarios,
  isLoggedIn,
  currency,
  monthlyFeeBurn,
  onLoginClick,
  onUpgradeClick,
}: Props) {
  const last = scenarios[scenarios.length - 1];
  if (!last) return null;

  const dn = last.doNothing;
  const dnIsLoss = dn < 0;

  const strategies = [
    { label: "Aggressive Discount", short: "Discount", value: last.aggressiveDiscount },
    { label: "Amazon Outlet", short: "Outlet", value: last.amazonOutlet },
    { label: "Removal Order", short: "Remove Now", value: last.removalOrder },
  ];
  const best = strategies.reduce((a, b) => (a.value > b.value ? a : b));
  const savings = best.value - dn;

  return (
    <Card className="px-4 py-3.5 sm:px-5">
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">

        {/* ── Left: Do Nothing verdict ── */}
        <div className={`flex-1 rounded-xl px-4 py-3 ${dnIsLoss ? "bg-rose-50 border border-rose-100" : "bg-emerald-50 border border-emerald-100"}`}>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
            If You Do Nothing — 12 Months
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-bold ${dnIsLoss ? "text-rose-600" : "text-emerald-600"}`}>
              {dnIsLoss ? "▼" : "▲"} {fmtAbs(dn, currency)}
            </span>
            <span className={`text-xs font-semibold ${dnIsLoss ? "text-rose-400" : "text-emerald-500"}`}>
              {dnIsLoss ? "total loss" : "net profit"}
            </span>
          </div>
          {dnIsLoss && monthlyFeeBurn > 0 && (
            <p className="text-[10px] text-rose-400 mt-1">
              Fees burning ~{fmtAbs(monthlyFeeBurn, currency)}/month
            </p>
          )}
        </div>

        {/* ── Right: Best strategy or CTA ── */}
        {isLoggedIn ? (
          <div className={`flex-1 rounded-xl px-4 py-3 ${savings > 0 ? "bg-indigo-50 border border-indigo-100" : "bg-slate-50 border border-slate-100"}`}>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Best Action: {best.short}
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-2xl font-bold ${best.value >= 0 ? "text-indigo-600" : "text-amber-500"}`}>
                {best.value >= 0 ? "▲" : "▼"} {fmtAbs(best.value, currency)}
              </span>
              <span className={`text-xs font-semibold ${best.value >= 0 ? "text-indigo-400" : "text-amber-400"}`}>
                {best.value >= 0 ? "net outcome" : "reduced loss"}
              </span>
            </div>
            {savings > 0 ? (
              <p className="text-[10px] text-indigo-500 font-semibold mt-1">
                🏆 {fmtAbs(savings, currency)} better than doing nothing
              </p>
            ) : (
              <p className="text-[10px] text-slate-400 mt-1">
                Holding is currently your best option at this velocity
              </p>
            )}
          </div>
        ) : (
          /* Anonymous — soft CTA */
          <button
            type="button"
            onClick={onLoginClick}
            className="flex-1 flex flex-col items-center justify-center rounded-xl px-4 py-3 bg-sky-50 border border-sky-100 hover:bg-sky-100 transition-colors text-center"
          >
            <p className="text-sm font-bold text-sky-700">See Your Best Exit Strategy</p>
            <p className="text-[10px] text-sky-400 mt-0.5">
              Free — sign in to compare Discount, Outlet &amp; Removal
            </p>
            <span className="mt-2 px-3 py-1 rounded-lg bg-sky-600 text-white text-[11px] font-semibold">
              Sign In Free →
            </span>
          </button>
        )}

        {/* ── Upgrade nudge for logged-in free users ── */}
        {isLoggedIn && savings > 0 && (
          <button
            type="button"
            onClick={onUpgradeClick}
            className="self-center shrink-0 flex flex-col items-center px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors text-center"
          >
            <span className="text-base">🏆</span>
            <span className="text-[10px] font-bold mt-0.5 whitespace-nowrap">Full Analysis</span>
            <span className="text-[9px] opacity-80">Upgrade</span>
          </button>
        )}

      </div>
    </Card>
  );
}
