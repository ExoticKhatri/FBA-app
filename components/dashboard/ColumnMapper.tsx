"use client";
import type { ColumnMapping, ParsedCSV } from "@/lib/csvParser";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

interface Props {
  csv: ParsedCSV;
  mapping: Partial<ColumnMapping>;
  onMappingChange: (m: Partial<ColumnMapping>) => void;
  onApply: () => void;
}

const FIELDS: { key: keyof ColumnMapping; label: string; required: boolean }[] = [
  { key: "sku", label: "SKU", required: true },
  { key: "quantity", label: "Quantity (units)", required: true },
  { key: "cubicFeetPerUnit", label: "Volume per Unit (cu ft)", required: true },
  { key: "ageInDays", label: "Age in FBA (days)", required: true },
  { key: "currentPrice", label: "Selling Price ($)", required: false },
  { key: "landedCost", label: "Landed Cost / COGS ($)", required: false },
];

const selectCls =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400";

export default function ColumnMapper({ csv, mapping, onMappingChange, onApply }: Props) {
  const requiredMapped = FIELDS.filter((f) => f.required).every(
    (f) => mapping[f.key] && mapping[f.key] !== "__none__"
  );

  return (
    <Card className="p-5 flex flex-col gap-4">
      <div>
        <h3 className="font-semibold text-slate-800 text-sm">Map CSV Columns</h3>
        <p className="text-xs text-slate-400 mt-0.5">
          {csv.rows.length} rows detected · {csv.headers.length} columns
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {FIELDS.map(({ key, label, required }) => (
          <div key={key} className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">
              {label}{" "}
              {required ? (
                <span className="text-rose-400">*</span>
              ) : (
                <span className="text-slate-300">(optional)</span>
              )}
            </label>
            <select
              className={selectCls}
              value={mapping[key] ?? "__none__"}
              onChange={(e) =>
                onMappingChange({ ...mapping, [key]: e.target.value })
              }
            >
              <option value="__none__">— Select column —</option>
              {csv.headers.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Preview table */}
      <div className="overflow-x-auto rounded-xl border border-slate-100">
        <table className="min-w-full text-xs">
          <thead className="bg-slate-50">
            <tr>
              {csv.headers.map((h) => (
                <th key={h} className="px-3 py-2 text-left text-slate-500 font-medium whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {csv.preview.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                {csv.headers.map((h) => (
                  <td key={h} className="px-3 py-1.5 text-slate-600 whitespace-nowrap">
                    {row[h] ?? ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Button disabled={!requiredMapped} onClick={onApply} className="self-end">
        Run Simulation →
      </Button>
      {!requiredMapped && (
        <p className="text-xs text-rose-400">Map all required (*) fields to continue.</p>
      )}
    </Card>
  );
}
