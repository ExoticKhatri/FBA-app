"use client";
import { DEFAULT_FEE_RATES, type FeeRates } from "@/lib/feeEngine";
import Button from "@/components/ui/Button";

interface Props {
  rates: FeeRates;
  onChange: (r: FeeRates) => void;
  onClose: () => void;
}

const fields: { key: keyof FeeRates; label: string; suffix: string }[] = [
  { key: "standardNonPeak", label: "Standard, Jan–Sep ($/cu ft/mo)", suffix: "$" },
  { key: "standardPeak", label: "Standard, Oct–Dec ($/cu ft/mo)", suffix: "$" },
  { key: "oversizeNonPeak", label: "Oversize, Jan–Sep ($/cu ft/mo)", suffix: "$" },
  { key: "oversizePeak", label: "Oversize, Oct–Dec ($/cu ft/mo)", suffix: "$" },
  { key: "aged181to270", label: "Aged 181–270 days surcharge ($/cu ft)", suffix: "$" },
  { key: "aged271to365", label: "Aged 271–365 days surcharge ($/cu ft)", suffix: "$" },
  { key: "aged365Plus", label: "Aged 365+ days surcharge ($/cu ft)", suffix: "$" },
  { key: "removalStandard", label: "Removal fee, Standard ($/unit)", suffix: "$" },
  { key: "removalOversize", label: "Removal fee, Oversize ($/unit)", suffix: "$" },
  { key: "outletRecoveryRate", label: "Amazon Outlet recovery rate", suffix: "%" },
];

const inputCls =
  "w-28 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition text-right";

export default function FeeConfigPanel({ rates, onChange, onClose }: Props) {
  function set(key: keyof FeeRates, raw: string) {
    const n = parseFloat(raw);
    if (isNaN(n)) return;
    onChange({ ...rates, [key]: key === "outletRecoveryRate" ? n / 100 : n });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 p-6 overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-slate-800 font-bold text-lg">Fee Rate Configuration</h2>
            <p className="text-slate-400 text-xs mt-0.5">Adjust to match your Amazon region.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
        </div>

        <div className="flex flex-col gap-4">
          {fields.map(({ key, label, suffix }) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <span className="text-sm text-slate-600 flex-1">{label}</span>
              <div className="flex items-center gap-1">
                <span className="text-slate-400 text-xs">{suffix}</span>
                <input
                  type="number"
                  step={0.01}
                  min={0}
                  className={inputCls}
                  value={
                    key === "outletRecoveryRate"
                      ? (rates[key] * 100).toFixed(0)
                      : rates[key]
                  }
                  onChange={(e) => set(key, e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            variant="ghost"
            className="flex-1"
            onClick={() => onChange({ ...DEFAULT_FEE_RATES })}
          >
            Reset to Defaults
          </Button>
          <Button className="flex-1" onClick={onClose}>
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}
