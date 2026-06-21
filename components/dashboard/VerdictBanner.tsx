import type { ScenarioPoint } from "@/lib/feeEngine";
import Card from "@/components/ui/Card";

function fmt(n: number, currency: string): string {
  const abs = Math.abs(Math.round(n));
  const s = abs.toLocaleString(undefined, { style: "currency", currency, maximumFractionDigits: 0 });
  return n >= 0 ? `+${s}` : `-${s}`;
}

interface Props {
  scenarios: ScenarioPoint[];
  isLoggedIn: boolean;
  isPremium: boolean;
  currency: string;
  onLoginClick: () => void;
  onUpgradeClick: () => void;
}

export default function VerdictBanner({ scenarios, isLoggedIn, isPremium, currency, onLoginClick, onUpgradeClick }: Props) {
  const last = scenarios[scenarios.length - 1];
  if (!last) return null;

  const dn = last.doNothing;

  const strategies = [
    { label: "Aggressive Discount", value: last.aggressiveDiscount },
    { label: "Amazon Outlet", value: last.amazonOutlet },
    { label: "Removal Order", value: last.removalOrder },
  ];
  const best = strategies.reduce((a, b) => (a.value > b.value ? a : b));
  const savings = best.value - dn;

  return (
    <Card className="px-5 py-3.5">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">

        {/* Do Nothing net — always visible */}
        <div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Do Nothing — 12M Net</p>
          <p className={`text-2xl font-bold tracking-tight ${dn >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
            {fmt(dn, currency)}
          </p>
        </div>

        {isLoggedIn ? (
          <>
            <span className="text-slate-300 text-xl hidden sm:block">→</span>

            {/* Best strategy — visible to all logged-in users */}
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                {best.label} — 12M Net
              </p>
              <p className={`text-2xl font-bold tracking-tight ${best.value >= 0 ? "text-emerald-600" : "text-amber-500"}`}>
                {fmt(best.value, currency)}
              </p>
            </div>

            {/* Savings callout */}
            {savings > 0 && (
              <div className="ml-auto flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-100 shrink-0">
                <span className="text-lg">🏆</span>
                <div>
                  <p className="text-sm font-bold text-emerald-700">
                    Save {Math.abs(Math.round(savings)).toLocaleString(undefined, { style: "currency", currency, maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-[10px] text-emerald-500">{best.label} beats holding</p>
                  {!isPremium && (
                    <button type="button" onClick={onUpgradeClick} className="text-[10px] text-indigo-500 underline mt-0.5">
                      Upgrade for full analysis →
                    </button>
                  )}
                </div>
              </div>
            )}

            {savings <= 0 && (
              <div className="ml-auto flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 shrink-0">
                <span className="text-lg">📊</span>
                <div>
                  <p className="text-sm font-bold text-slate-600">Holding is optimal</p>
                  <p className="text-[10px] text-slate-400">at current velocity</p>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Anonymous — prompt to sign in */
          <button
            type="button"
            onClick={onLoginClick}
            className="ml-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-50 border border-sky-100 hover:bg-sky-100 transition-colors shrink-0"
          >
            <div>
              <p className="text-sm font-semibold text-sky-700">See Your Best Strategy</p>
              <p className="text-[10px] text-sky-400">Free — sign in to unlock</p>
            </div>
            <span className="text-sky-400">🔐</span>
          </button>
        )}
      </div>
    </Card>
  );
}
