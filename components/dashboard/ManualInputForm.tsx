"use client";
import type { SimulationParams } from "@/lib/feeEngine";

interface Props {
  params: SimulationParams;
  onChange: (updated: SimulationParams) => void;
  currencySymbol: string;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-0.5 min-w-0 cursor-default">
      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide truncate">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-400 transition";

export default function ManualInputForm({ params, onChange, currencySymbol }: Props) {
  function set<K extends keyof SimulationParams>(key: K, val: SimulationParams[K]) {
    onChange({ ...params, [key]: val });
  }

  return (
    <div className="flex flex-col gap-2.5">
      {/* 2-column grid — numeric fields */}
      <div className="grid grid-cols-2 gap-x-2 gap-y-2">
        <Field label="Quantity">
          <input
            type="number" min={1} className={inputCls}
            value={params.quantity}
            onChange={(e) => set("quantity", Math.max(1, Number(e.target.value)))}
          />
        </Field>

        <Field label="Cu Ft / Unit">
          <input
            type="number" min={0.01} step={0.01} className={inputCls}
            value={params.cubicFeetPerUnit}
            onChange={(e) => set("cubicFeetPerUnit", Math.max(0.01, Number(e.target.value)))}
          />
        </Field>

        <Field label="Age (days)">
          <input
            type="number" min={0} className={inputCls}
            value={params.ageInDays}
            onChange={(e) => set("ageInDays", Math.max(0, Number(e.target.value)))}
          />
        </Field>

        <Field label="Sales / Mo">
          <input
            type="number" min={1} className={inputCls}
            value={params.monthlySalesVelocity}
            onChange={(e) => set("monthlySalesVelocity", Math.max(1, Number(e.target.value)))}
          />
        </Field>

        <Field label={`Price (${currencySymbol})`}>
          <input
            type="number" min={0} step={0.01} className={inputCls}
            value={params.currentPrice}
            onChange={(e) => set("currentPrice", Math.max(0, Number(e.target.value)))}
          />
        </Field>

        <Field label={`COGS (${currencySymbol})`}>
          <input
            type="number" min={0} step={0.01} className={inputCls}
            value={params.landedCost}
            onChange={(e) => set("landedCost", Math.max(0, Number(e.target.value)))}
          />
        </Field>
      </div>

      {/* Sliders */}
      <div className="flex flex-col gap-1.5">
        <label className="flex flex-col gap-0.5 cursor-default">
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide flex justify-between">
            <span>Liquidation Discount</span>
            <span className="text-indigo-600">{(params.aggressiveDiscountPct * 100).toFixed(0)}%</span>
          </span>
          <input
            type="range" min={10} max={80} step={5}
            className="w-full accent-indigo-600 h-1"
            value={params.aggressiveDiscountPct * 100}
            onChange={(e) => set("aggressiveDiscountPct", Number(e.target.value) / 100)}
          />
          <div className="flex justify-between text-[9px] text-slate-300">
            <span>10%</span><span>80%</span>
          </div>
        </label>

        <label className="flex flex-col gap-0.5 cursor-default">
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide flex justify-between">
            <span>Velocity Multiplier</span>
            <span className="text-indigo-600">{params.velocityMultiplier.toFixed(1)}×</span>
          </span>
          <input
            type="range" min={1} max={5} step={0.5}
            className="w-full accent-indigo-600 h-1"
            value={params.velocityMultiplier}
            onChange={(e) => set("velocityMultiplier", Number(e.target.value))}
          />
          <div className="flex justify-between text-[9px] text-slate-300">
            <span>1×</span><span>5×</span>
          </div>
        </label>
      </div>

      {/* Size segmented toggle */}
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
          Size Category
        </span>
        <div className="flex gap-1 p-0.5 bg-slate-100 rounded-lg">
          <button
            type="button"
            onClick={() => set("isOversize", false)}
            className={[
              "flex-1 py-1 rounded-md text-xs font-medium transition-all",
              !params.isOversize
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-400 hover:text-slate-600",
            ].join(" ")}
          >
            Standard
          </button>
          <button
            type="button"
            onClick={() => set("isOversize", true)}
            className={[
              "flex-1 py-1 rounded-md text-xs font-medium transition-all",
              params.isOversize
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-400 hover:text-slate-600",
            ].join(" ")}
          >
            Oversize
          </button>
        </div>
      </div>
    </div>
  );
}
