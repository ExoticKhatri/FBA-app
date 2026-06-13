import { jsPDF } from "jspdf";
import type { SimulationParams, ScenarioPoint, SimulationMetrics } from "./feeEngine";

function fmt(n: number, prefix = "$"): string {
  return `${prefix}${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function addHeader(doc: jsPDF, title: string) {
  doc.setFillColor(79, 70, 229); // indigo-600
  doc.rect(0, 0, 210, 18, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(title, 14, 12);
  doc.setTextColor(30, 41, 59); // slate-800
}

function addSection(doc: jsPDF, label: string, y: number): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(79, 70, 229);
  doc.text(label, 14, y);
  doc.setDrawColor(224, 231, 255);
  doc.line(14, y + 2, 196, y + 2);
  doc.setTextColor(30, 41, 59);
  return y + 8;
}

export function exportActionPlanPDF(
  params: SimulationParams,
  metrics: SimulationMetrics,
  points: ScenarioPoint[],
  skuLabel = "Manual Entry"
): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  addHeader(doc, "FBA Liquidation Simulator — Action Plan Report");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated: ${new Date().toLocaleString()}    SKU / Product: ${skuLabel}`, 14, 24);

  let y = 32;
  y = addSection(doc, "Summary Metrics", y);

  const metrics4 = [
    ["Projected 12-Month Storage Fees", fmt(metrics.projected12MFees)],
    ["Optimal Liquidation Date", metrics.optimalLiquidationDate],
    ["Capital Recoverable via Discounting", fmt(metrics.capitalRecoverable)],
    ["Total FBA Volume", `${metrics.totalVolumeCubicFeet.toFixed(2)} cu ft`],
  ];

  doc.setFontSize(9);
  for (const [label, value] of metrics4) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(label, 14, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text(value, 130, y);
    y += 7;
  }

  y += 4;
  y = addSection(doc, "Input Parameters", y);

  const inputRows = [
    ["Quantity", `${params.quantity} units`],
    ["Size Category", params.isOversize ? "Oversize" : "Standard"],
    ["Volume Per Unit", `${params.cubicFeetPerUnit} cu ft`],
    ["Current Age in FBA", `${params.ageInDays} days`],
    ["Monthly Sales Velocity", `${params.monthlySalesVelocity} units/mo`],
    ["Selling Price", fmt(params.currentPrice)],
    ["Landed Cost (COGS)", fmt(params.landedCost)],
    ["Aggressive Discount", `${(params.aggressiveDiscountPct * 100).toFixed(0)}%`],
  ];

  doc.setFontSize(9);
  for (const [label, value] of inputRows) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(label, 14, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 41, 59);
    doc.text(value, 130, y);
    y += 6;
  }

  y += 4;
  y = addSection(doc, "12-Month Scenario Comparison", y);

  // Table header
  const cols = [14, 55, 95, 135, 170];
  const headers = ["Month", "Do Nothing", "Disc. Strategy", "Amazon Outlet", "Removal"];
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(79, 70, 229);
  headers.forEach((h, i) => doc.text(h, cols[i], y));
  y += 2;
  doc.setDrawColor(199, 210, 254);
  doc.line(14, y, 196, y);
  y += 4;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 41, 59);
  for (const pt of points) {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.text(pt.monthLabel, cols[0], y);
    doc.text(fmt(pt.doNothing), cols[1], y);
    doc.text(fmt(pt.aggressiveDiscount), cols[2], y);
    doc.text(fmt(pt.amazonOutlet), cols[3], y);
    doc.text(fmt(pt.removalOrder), cols[4], y);
    y += 6;
  }

  y += 6;
  y = addSection(doc, "Recommended Action", y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(5, 150, 105); // emerald-600

  const last = points[points.length - 1];
  const best = Math.max(last.aggressiveDiscount, last.amazonOutlet, last.removalOrder);
  let recommendation = "Maintain current strategy and monitor monthly fees.";
  if (best === last.aggressiveDiscount) {
    recommendation = `Apply ${(params.aggressiveDiscountPct * 100).toFixed(0)}% discount to accelerate sell-through. Optimal start: ${metrics.optimalLiquidationDate}.`;
  } else if (best === last.amazonOutlet) {
    recommendation = "Submit inventory to Amazon Outlet for bulk clearance.";
  } else if (best === last.removalOrder) {
    recommendation = "Create a removal order tonight to recover inventory and avoid ongoing fees.";
  }

  const lines = doc.splitTextToSize(recommendation, 175) as string[];
  doc.text(lines, 14, y);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text("FBA Liquidation Simulator — for informational purposes only.", 14, 285);

  doc.save("fba-action-plan.pdf");
}
