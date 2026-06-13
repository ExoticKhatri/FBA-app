import Papa from "papaparse";

export interface ColumnMapping {
  sku: string;
  quantity: string;
  cubicFeetPerUnit: string;
  ageInDays: string;
  currentPrice: string;
  landedCost: string;
}

export interface InventoryRow {
  sku: string;
  quantity: number;
  cubicFeetPerUnit: number;
  ageInDays: number;
  currentPrice: number;
  landedCost: number;
}

export interface ParsedCSV {
  headers: string[];
  preview: Record<string, string>[];  // first 5 rows for display
  rows: Record<string, string>[];     // all rows
}

export function parseCSVFile(file: File): Promise<ParsedCSV> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        if (result.errors.length > 0 && result.data.length === 0) {
          reject(new Error(result.errors[0].message));
          return;
        }
        const headers = result.meta.fields ?? [];
        resolve({
          headers,
          preview: result.data.slice(0, 5),
          rows: result.data,
        });
      },
      error: (err) => reject(err),
    });
  });
}

function safeNum(val: string | undefined, fallback = 0): number {
  if (!val) return fallback;
  const n = parseFloat(val.replace(/[^0-9.-]/g, ""));
  return isNaN(n) ? fallback : n;
}

export function applyMapping(
  rows: Record<string, string>[],
  mapping: ColumnMapping
): InventoryRow[] {
  return rows
    .map((row) => ({
      sku: row[mapping.sku] ?? "UNKNOWN",
      quantity: Math.round(safeNum(row[mapping.quantity])),
      cubicFeetPerUnit: safeNum(row[mapping.cubicFeetPerUnit], 0.5),
      ageInDays: Math.round(safeNum(row[mapping.ageInDays])),
      currentPrice: safeNum(row[mapping.currentPrice]),
      landedCost: safeNum(row[mapping.landedCost]),
    }))
    .filter((r) => r.quantity > 0);
}

// Aggregate rows by SKU (sum quantities, average prices and dimensions)
export function aggregateBySku(rows: InventoryRow[]): InventoryRow[] {
  const map = new Map<string, InventoryRow[]>();
  for (const row of rows) {
    const existing = map.get(row.sku) ?? [];
    existing.push(row);
    map.set(row.sku, existing);
  }

  return Array.from(map.entries()).map(([sku, items]) => {
    const totalQty = items.reduce((s, r) => s + r.quantity, 0);
    const avgCubicFt = items.reduce((s, r) => s + r.cubicFeetPerUnit, 0) / items.length;
    const weightedAge = items.reduce((s, r) => s + r.ageInDays * r.quantity, 0) / totalQty;
    const avgPrice = items.reduce((s, r) => s + r.currentPrice * r.quantity, 0) / totalQty;
    const avgCost = items.reduce((s, r) => s + r.landedCost * r.quantity, 0) / totalQty;
    return {
      sku,
      quantity: totalQty,
      cubicFeetPerUnit: avgCubicFt,
      ageInDays: Math.round(weightedAge),
      currentPrice: avgPrice,
      landedCost: avgCost,
    };
  });
}
