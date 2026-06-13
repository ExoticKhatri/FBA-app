"use client";
import type { SimulationParams } from "@/lib/feeEngine";

interface Props {
  params: SimulationParams;
  onChange: (updated: SimulationParams) => void;
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-slate-500">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition";

export default function ManualInputForm({ params, onChange }: Props) {
  function set<K extends keyof SimulationParams>(key: K, val: SimulationParams[K]) {
    onChange({ ...params, [key]: val });
  }

  return (
    <div className="flex flex-col gap-4">
      <Field label="Unit Quantity">
        <input
          type="number"
          min={1}
          className={inputCls}
          value={params.quantity}
          onChange={(e) => set("quantity", Math.max(1, Number(e.target.value)))}
        />
      </Field>

      <Field label="Cubic Feet per Unit">
        <input
          type="number"
          min={0.01}
          step={0.01}
          className={inputCls}
          value={params.cubicFeetPerUnit}
          onChange={(e) => set("cubicFeetPerUnit", Math.max(0.01, Number(e.target.value)))}
        />
      </Field>

      <Field label="Size Category">
        <select
          className={inputCls}
          value={params.isOversize ? "oversize" : "standard"}
          onChange={(e) => set("isOversize", e.target.value === "oversize")}
        >
          <option value="standard">Standard-Size</option>
          <option value="oversize">Oversize</option>
        </select>
      </Field>

      <Field label="Current Age in FBA (days)">
        <input
          type="number"
          min={0}
          className={inputCls}
          value={params.ageInDays}
          onChange={(e) => set("ageInDays", Math.max(0, Number(e.target.value)))}
        />
      </Field>

      <Field label="Monthly Sales Velocity (units/mo)">
        <input
          type="number"
          min={1}
          className={inputCls}
          value={params.monthlySalesVelocity}
          onChange={(e) => set("monthlySalesVelocity", Math.max(1, Number(e.target.value)))}
        />
      </Field>

      <Field label="Current Selling Price ($)">
        <input
          type="number"
          min={0}
          step={0.01}
          className={inputCls}
          value={params.currentPrice}
          onChange={(e) => set("currentPrice", Math.max(0, Number(e.target.value)))}
        />
      </Field>

      <Field label="Landed Cost / COGS ($)">
        <input
          type="number"
          min={0}
          step={0.01}
          className={inputCls}
          value={params.landedCost}
          onChange={(e) => set("landedCost", Math.max(0, Number(e.target.value)))}
        />
      </Field>

      <div className="h-px bg-slate-100 my-1" />

      <Field label={`Liquidation Discount: ${(params.aggressiveDiscountPct * 100).toFixed(0)}%`}>
        <input
          type="range"
          min={10}
          max={80}
          step={5}
          className="w-full accent-indigo-600"
          value={params.aggressiveDiscountPct * 100}
          onChange={(e) => set("aggressiveDiscountPct", Number(e.target.value) / 100)}
        />
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>10%</span><span>80%</span>
        </div>
      </Field>

      <Field label={`Velocity Multiplier at Discount: ${params.velocityMultiplier.toFixed(1)}×`}>
        <input
          type="range"
          min={1}
          max={5}
          step={0.5}
          className="w-full accent-indigo-600"
          value={params.velocityMultiplier}
          onChange={(e) => set("velocityMultiplier", Number(e.target.value))}
        />
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>1×</span><span>5×</span>
        </div>
      </Field>
    </div>
  );
}
