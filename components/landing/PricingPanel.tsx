"use client";

import { useRegion } from '@/hooks/useRegion';

interface Props {
  onUpgradeClick: () => void;
}

const included = [
  "Bulk Amazon CSV ingestion (all report types)",
  "Multi-scenario Plotly comparison charts",
  "Automated aged inventory surcharge modeling",
  "Exportable PDF action plan",
  "Configurable fee rates (all Amazon regions)",
  "Cancel anytime",
];

export default function PricingPanel({ onUpgradeClick }: Props) {
  const { region, loading } = useRegion();

  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-md mx-auto">
        <p className="text-center text-xs font-semibold text-indigo-500 tracking-widest uppercase mb-2">
          Premium Plan
        </p>
        <h2 className="text-center text-3xl font-bold text-slate-800 mb-8">
          One flat rate. Full access.
        </h2>

        <div className="rounded-3xl border border-indigo-100 shadow-xl overflow-hidden">
          <div className="bg-linear-to-br from-indigo-600 to-indigo-700 px-8 py-8 text-center">
            {loading ? (
              <div className="h-16 w-32 mx-auto rounded-xl bg-indigo-500/40 animate-pulse" />
            ) : (
              <div className="text-6xl font-bold text-white">{region.displayPrice}</div>
            )}
            <p className="text-indigo-200 text-sm mt-1">{region.displayUnit}</p>
          </div>

          <div className="bg-white px-8 py-6 flex flex-col gap-4">
            <ul className="flex flex-col gap-3">
              {included.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-slate-600">
                  <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>

            <button
              onClick={onUpgradeClick}
              className="mt-2 w-full py-3 rounded-2xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 active:scale-[.98] transition-all shadow-md shadow-indigo-200"
            >
              {loading
                ? 'Unlock Premium Access →'
                : `Unlock Premium — ${region.displayPrice}/mo →`}
            </button>

            <p className="text-center text-xs text-slate-400">
              Powered by Razorpay · Secure · Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
