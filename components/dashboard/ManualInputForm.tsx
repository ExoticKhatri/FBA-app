"use client";
import { useState, useEffect } from "react";
import type { SimulationParams } from "@/lib/feeEngine";

interface Props {
  params: SimulationParams;
  onChange: (updated: SimulationParams) => void;
  currencySymbol: string;
}

type DimUnit = "in" | "cm";

function toCubicFeet(l: number, w: number, h: number, unit: DimUnit): number {
  if (l <= 0 || w <= 0 || h <= 0) return 0;
  const vol = l * w * h;
  return unit === "in" ? vol / 1728 : vol / 28316.85;
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
  const [dimUnit, setDimUnit] = useState<DimUnit>("in");
  const [length, setLength] = useState(0);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  // When dimensions change, recompute cubicFeetPerUnit in params
  useEffect(() => {
    const cuft = toCubicFeet(length, width, height, dimUnit);
    if (cuft > 0) {
      onChange({ ...params, cubicFeetPerUnit: parseFloat(cuft.toFixed(4)) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [length, width, height, dimUnit]);

  // Also recompute when unit changes if dimensions are already filled
  function switchUnit(next: DimUnit) {
    if (next === dimUnit) return;
    if (length > 0 || width > 0 || height > 0) {
      const factor = next === "in" ? 1 / 2.54 : 2.54;
      setLength(parseFloat((length * factor).toFixed(2)));
      setWidth(parseFloat((width * factor).toFixed(2)));
      setHeight(parseFloat((height * factor).toFixed(2)));
    }
    setDimUnit(next);
  }

  function set<K extends keyof SimulationParams>(key: K, val: SimulationParams[K]) {
    onChange({ ...params, [key]: val });
  }

  const computedCuFt = toCubicFeet(length, width, height, dimUnit);
  const hasDims = computedCuFt > 0;

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

      {/* ── Dimensions ── */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
            Product Dimensions
          </span>
          {/* Unit toggle */}
          <div className="flex p-0.5 bg-slate-100 rounded-lg gap-0.5">
            {(["in", "cm"] as DimUnit[]).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => switchUnit(u)}
                className={[
                  "px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all",
                  dimUnit === u
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-400 hover:text-slate-600",
                ].join(" ")}
              >
                {u === "in" ? "inches" : "cm"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {[
            { label: `L (${dimUnit})`, val: length, set: setLength },
            { label: `W (${dimUnit})`, val: width, set: setWidth },
            { label: `H (${dimUnit})`, val: height, set: setHeight },
          ].map(({ label, val, set: setFn }) => (
            <label key={label} className="flex flex-col gap-0.5 cursor-default">
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                {label}
              </span>
              <input
                type="number"
                min={0}
                step={0.1}
                className={inputCls}
                value={val || ""}
                placeholder="0"
                onChange={(e) => setFn(Math.max(0, Number(e.target.value)))}
              />
            </label>
          ))}
        </div>

        {/* Computed result or fallback display */}
        <div className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] ${hasDims ? "bg-indigo-50 text-indigo-600" : "bg-slate-50 text-slate-400"}`}>
          <span>📦</span>
          {hasDims ? (
            <span>
              <span className="font-bold">{computedCuFt.toFixed(4)}</span>
              <span className="ml-1">cu ft / unit</span>
              <span className="ml-2 text-indigo-400">
                ({(computedCuFt * params.quantity).toFixed(3)} cu ft total)
              </span>
            </span>
          ) : (
            <span>
              Enter dimensions above — or using stored value:{" "}
              <span className="font-semibold text-slate-500">{params.cubicFeetPerUnit} cu ft/unit</span>
            </span>
          )}
        </div>
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
