"use client";
import type { FeeRates } from "@/lib/feeEngine";
import Button from "@/components/ui/Button";

interface Props {
  rates: FeeRates;
  onChange: (r: FeeRates) => void;       // live update (simulation re-runs instantly)
  onClose: () => void;
  onSave: (r: FeeRates) => void;         // persist to localStorage
  onClearSaved: () => void;
  regionDefaults: FeeRates;              // current region's default schedule
  regionName: string;                    // e.g. "India" — shown in reset button
  currencySymbol: string;                // e.g. "₹" — used as field prefix
  hasSaved: boolean;
}

// ── Toggle pill ───────────────────────────────────────────────────────────────

function Toggle({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked ? "true" : "false"}
      aria-label={`Toggle ${label}`}
      onClick={() => onChange(!checked)}
      className={[
        "relative w-9 h-5 rounded-full transition-colors duration-200 shrink-0",
        "focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1",
        checked ? "bg-indigo-600" : "bg-slate-200",
      ].join(" ")}
    >
      <span
        className={[
          "absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200",
          checked ? "translate-x-4" : "translate-x-0",
        ].join(" ")}
      />
    </button>
  );
}

// ── Section header ────────────────────────────────────────────────────────────

function SectionHeader({
  num,
  title,
  timing,
  toggleKey,
  rates,
  onChange,
}: {
  num: number;
  title: string;
  timing: string;
  toggleKey?: keyof FeeRates;
  rates: FeeRates;
  onChange: (r: FeeRates) => void;
}) {
  const enabled = toggleKey ? (rates[toggleKey] as boolean) : true;
  return (
    <div className="flex items-start justify-between gap-3 pt-4 pb-1 border-t border-slate-100 first:pt-0 first:border-t-0">
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 rounded-full w-4 h-4 flex items-center justify-center shrink-0">
            {num}
          </span>
          <span className={["text-sm font-semibold", enabled ? "text-slate-800" : "text-slate-400"].join(" ")}>
            {title}
          </span>
        </div>
        <p className="text-[10px] text-slate-400 mt-0.5 ml-5.5 leading-tight">{timing}</p>
      </div>
      {toggleKey && (
        <Toggle
          checked={enabled}
          label={title}
          onChange={(v) => onChange({ ...rates, [toggleKey]: v })}
        />
      )}
    </div>
  );
}

// ── Numeric field row ─────────────────────────────────────────────────────────

function FieldRow({
  label,
  hint,
  rateKey,
  rates,
  onChange,
  disabled,
  prefix,
  suffix,
  scale,
  step,
  min,
  max,
}: {
  label: string;
  hint?: string;
  rateKey: keyof FeeRates;
  rates: FeeRates;
  onChange: (r: FeeRates) => void;
  disabled?: boolean;
  prefix?: string;
  suffix?: string;
  scale?: number;     // multiply stored value by this to display (e.g. 100 for %)
  step?: number;
  min?: number;
  max?: number;
}) {
  const displayScale = scale ?? 1;
  const displayValue = (rates[rateKey] as number) * displayScale;

  function handleChange(raw: string) {
    const n = parseFloat(raw);
    if (isNaN(n)) return;
    onChange({ ...rates, [rateKey]: n / displayScale });
  }

  return (
    <div className={[
      "flex items-center justify-between gap-3 py-0.5",
      disabled ? "opacity-40 pointer-events-none select-none" : "",
    ].join(" ")}>
      <div className="min-w-0">
        <span className="text-xs text-slate-600">{label}</span>
        {hint && <p className="text-[10px] text-slate-400 leading-tight">{hint}</p>}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {prefix && <span className="text-slate-400 text-xs">{prefix}</span>}
        <input
          type="number"
          step={step ?? 0.01}
          min={min ?? 0}
          max={max}
          disabled={disabled}
          title={label}
          aria-label={label}
          className="w-20 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-800 text-right focus:outline-none focus:ring-1 focus:ring-indigo-400 transition disabled:cursor-not-allowed"
          value={Number(displayValue.toFixed(4))}
          onChange={(e) => handleChange(e.target.value)}
        />
        {suffix && <span className="text-slate-400 text-[10px] w-10 leading-tight">{suffix}</span>}
      </div>
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────

export default function FeeConfigPanel({
  rates,
  onChange,
  onClose,
  onSave,
  onClearSaved,
  regionDefaults,
  regionName,
  currencySymbol,
  hasSaved,
}: Props) {
  const off1 = !rates.enableMonthlySubscription;
  const off2 = !rates.enableInboundShipping;
  const off3 = !rates.enableInboundPlacement;
  const off4 = !rates.enableStorageFee;
  const off5 = !rates.enableLowInventoryFee;
  const off6 = !rates.enableReferralFee;
  const off7 = !rates.enableFulfillmentFee;
  const off8 = !rates.enableFuelSurcharge;
  const off9 = !rates.enableAgedSurcharge;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl mx-4 flex flex-col overflow-hidden max-h-[92vh]">

        {/* ── Header ── */}
        <div className="px-6 pt-5 pb-3 shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-slate-800 font-bold text-lg">Fee Configuration</h2>
              <p className="text-slate-400 text-xs mt-0.5">
                All 10 Amazon FBA fees · toggle each on/off to include in simulation
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="text-slate-400 hover:text-slate-600 text-xl mt-0.5"
            >
              ✕
            </button>
          </div>

          {/* Region badge */}
          <div className="mt-2 flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400">Rates for</span>
            <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              {regionName}
            </span>
            {hasSaved && (
              <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                ✓ Saved
              </span>
            )}
          </div>
        </div>

        {/* ── Fee sections (scrollable) ── */}
        <div className="overflow-y-auto flex-1 px-6 pb-2 flex flex-col">

          {/* 1 · Monthly Subscription */}
          <SectionHeader num={1} title="Monthly Subscription Fee"
            timing="Fixed every 30 days · account-level overhead"
            toggleKey="enableMonthlySubscription" rates={rates} onChange={onChange} />
          <div className="ml-5 flex flex-col gap-0.5">
            <FieldRow label="Monthly fee" rateKey="monthlySubscriptionFee"
              hint={`${regionName} standard professional plan rate`}
              prefix={currencySymbol} suffix="/mo" step={0.01}
              disabled={off1} rates={rates} onChange={onChange} />
          </div>

          {/* 2 · Inbound Shipping */}
          <SectionHeader num={2} title="Inbound Shipping Fee"
            timing="Deducted on shipment creation · weight × carrier rate"
            toggleKey="enableInboundShipping" rates={rates} onChange={onChange} />
          <div className="ml-5 flex flex-col gap-0.5">
            <FieldRow label="Rate per lb" rateKey="inboundShippingPerLb"
              hint="Partner carrier rate; varies by distance and box count"
              prefix={currencySymbol} suffix="/lb" step={0.01}
              disabled={off2} rates={rates} onChange={onChange} />
            <FieldRow label="Avg unit weight" rateKey="unitWeightLbs"
              suffix="lbs" step={0.1} min={0.1}
              disabled={off2} rates={rates} onChange={onChange} />
          </div>

          {/* 3 · Inbound Placement */}
          <SectionHeader num={3} title="Inbound Placement Fee"
            timing="Charged exactly 45 days after shipment check-in"
            toggleKey="enableInboundPlacement" rates={rates} onChange={onChange} />
          <div className="ml-5 flex flex-col gap-0.5">
            <FieldRow label="Per unit" rateKey="inboundPlacementPerUnit"
              hint="Minimal split = highest fee; Amazon-optimised split = $0"
              prefix={currencySymbol} suffix="/unit" step={0.01}
              disabled={off3} rates={rates} onChange={onChange} />
          </div>

          {/* 4 · Standard Storage */}
          <SectionHeader num={4} title="Standard Storage Fee"
            timing="Billed end of calendar month · daily avg volume × rate"
            toggleKey="enableStorageFee" rates={rates} onChange={onChange} />
          <div className="ml-5 flex flex-col gap-0.5">
            <FieldRow label="Standard · Jan–Sep" rateKey="standardNonPeak"
              hint="Non-peak season rate"
              prefix={currencySymbol} suffix="/cu ft" step={0.01}
              disabled={off4} rates={rates} onChange={onChange} />
            <FieldRow label="Standard · Oct–Dec" rateKey="standardPeak"
              hint="Peak Q4 rate — typically 3× non-peak"
              prefix={currencySymbol} suffix="/cu ft" step={0.01}
              disabled={off4} rates={rates} onChange={onChange} />
            <FieldRow label="Oversize · Jan–Sep" rateKey="oversizeNonPeak"
              prefix={currencySymbol} suffix="/cu ft" step={0.01}
              disabled={off4} rates={rates} onChange={onChange} />
            <FieldRow label="Oversize · Oct–Dec" rateKey="oversizePeak"
              prefix={currencySymbol} suffix="/cu ft" step={0.01}
              disabled={off4} rates={rates} onChange={onChange} />
          </div>

          {/* 5 · Low-Inventory Level */}
          <SectionHeader num={5} title="Low-Inventory-Level Fee"
            timing="Per unit sold when stock < 28-day supply threshold"
            toggleKey="enableLowInventoryFee" rates={rates} onChange={onChange} />
          <div className="ml-5 flex flex-col gap-0.5">
            <FieldRow label="Per unit sold" rateKey="lowInventoryFeePerUnit"
              hint="Triggered when historical stock drops below 28-day cushion"
              prefix={currencySymbol} suffix="/unit" step={0.01}
              disabled={off5} rates={rates} onChange={onChange} />
          </div>

          {/* 6 · Referral Fee */}
          <SectionHeader num={6} title="Referral Fee (Commission)"
            timing="Point of sale · instant deduction on every transaction"
            toggleKey="enableReferralFee" rates={rates} onChange={onChange} />
          <div className="ml-5 flex flex-col gap-0.5">
            <FieldRow label="Commission rate" rateKey="referralFeePct"
              hint="Most categories: 15% of gross sale price"
              suffix="%" step={0.1} min={0} max={100} scale={100}
              disabled={off6} rates={rates} onChange={onChange} />
          </div>

          {/* 7 · FBA Fulfillment */}
          <SectionHeader num={7} title="Base FBA Fulfillment Fee"
            timing="Point of sale · fixed tier based on weight & dimensions"
            toggleKey="enableFulfillmentFee" rates={rates} onChange={onChange} />
          <div className="ml-5 flex flex-col gap-0.5">
            <FieldRow label="Standard size" rateKey="fulfillmentFeeStandard"
              hint="Small standard tier; heavier = higher tier fee"
              prefix={currencySymbol} suffix="/unit" step={0.01}
              disabled={off7} rates={rates} onChange={onChange} />
            <FieldRow label="Oversize" rateKey="fulfillmentFeeOversize"
              hint="Large/oversize tier rate"
              prefix={currencySymbol} suffix="/unit" step={0.01}
              disabled={off7} rates={rates} onChange={onChange} />
          </div>

          {/* 8 · Fuel & Logistics Surcharge */}
          <SectionHeader num={8} title="Fuel & Logistics Surcharge"
            timing="Point of sale · added on top of fulfillment fee"
            toggleKey="enableFuelSurcharge" rates={rates} onChange={onChange} />
          <div className="ml-5 flex flex-col gap-0.5">
            <FieldRow label="Surcharge rate" rateKey="fuelSurchargePct"
              hint="Applied as % of base fulfillment fee — typically 3.5%"
              suffix="% of fulfillment" step={0.1} min={0} max={100} scale={100}
              disabled={off8} rates={rates} onChange={onChange} />
          </div>

          {/* 9 · Aged Inventory Surcharge */}
          <SectionHeader num={9} title="Aged Inventory Surcharge"
            timing="Snapshot on the 15th of each month · units aged 181+ days"
            toggleKey="enableAgedSurcharge" rates={rates} onChange={onChange} />
          <div className="ml-5 flex flex-col gap-0.5">
            <FieldRow label="181–270 days" rateKey="aged181to270"
              prefix={currencySymbol} suffix="/cu ft" step={0.01}
              disabled={off9} rates={rates} onChange={onChange} />
            <FieldRow label="271–365 days" rateKey="aged271to365"
              prefix={currencySymbol} suffix="/cu ft" step={0.01}
              disabled={off9} rates={rates} onChange={onChange} />
            <FieldRow label="365+ days" rateKey="aged365Plus"
              hint="Can spike during Q4 peak season"
              prefix={currencySymbol} suffix="/cu ft" step={0.01}
              disabled={off9} rates={rates} onChange={onChange} />
          </div>

          {/* 10 · Removal / Disposal (always active — used by exit scenarios) */}
          <SectionHeader num={10} title="Removal / Disposal Fee"
            timing="Deducted on order submission · always active for exit scenarios"
            rates={rates} onChange={onChange} />
          <div className="ml-5 flex flex-col gap-0.5 mb-1">
            <FieldRow label="Removal, Standard" rateKey="removalStandard"
              prefix={currencySymbol} suffix="/unit" step={0.01}
              rates={rates} onChange={onChange} />
            <FieldRow label="Removal, Oversize" rateKey="removalOversize"
              prefix={currencySymbol} suffix="/unit" step={0.01}
              rates={rates} onChange={onChange} />
            <FieldRow label="Amazon Outlet recovery" rateKey="outletRecoveryRate"
              hint="Fraction of listing price recovered via Outlet clearance"
              suffix="% of price" step={1} min={0} max={100} scale={100}
              rates={rates} onChange={onChange} />
          </div>

        </div>

        {/* ── Footer ── */}
        <div className="shrink-0 px-6 pt-3 pb-5 border-t border-slate-100 flex flex-col gap-2.5">

          {/* Saved state row */}
          {hasSaved && (
            <div className="flex items-center justify-between text-xs bg-emerald-50 text-emerald-700 rounded-xl px-3 py-2">
              <span>✓ Your custom rates are saved and will load automatically next time.</span>
              <button
                type="button"
                onClick={onClearSaved}
                className="ml-3 text-emerald-500 hover:text-emerald-700 underline underline-offset-2 shrink-0"
              >
                Clear
              </button>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={() => onChange({ ...regionDefaults })}
            >
              Reset to {regionName} Defaults
            </Button>
            <Button
              type="button"
              className="flex-1"
              onClick={() => { onSave(rates); onClose(); }}
            >
              Apply & Save
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
