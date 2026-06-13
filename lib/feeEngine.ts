export interface FeeRates {
  standardNonPeak: number;   // $/cu ft/month Jan–Sep
  standardPeak: number;      // $/cu ft/month Oct–Dec
  oversizeNonPeak: number;
  oversizePeak: number;
  aged181to270: number;      // $/cu ft surcharge, assessed monthly
  aged271to365: number;
  aged365Plus: number;
  removalStandard: number;   // $/unit
  removalOversize: number;
  outletRecoveryRate: number; // 0–1 fraction of selling price recovered
}

export const DEFAULT_FEE_RATES: FeeRates = {
  standardNonPeak: 0.78,
  standardPeak: 2.40,
  oversizeNonPeak: 0.56,
  oversizePeak: 1.40,
  aged181to270: 0.50,
  aged271to365: 1.00,
  aged365Plus: 1.50,
  removalStandard: 0.97,
  removalOversize: 2.89,
  outletRecoveryRate: 0.25,
};

export interface SimulationParams {
  quantity: number;
  cubicFeetPerUnit: number;
  isOversize: boolean;
  ageInDays: number;
  monthlySalesVelocity: number;
  currentPrice: number;
  landedCost: number;
  aggressiveDiscountPct: number;   // e.g. 0.50 = 50% off
  velocityMultiplier: number;      // e.g. 2.0 = 2× velocity when discounted
  startMonth: number;              // 1–12
  startYear: number;
  rates: FeeRates;
}

export interface ScenarioPoint {
  monthLabel: string;
  doNothing: number;
  aggressiveDiscount: number;
  amazonOutlet: number;
  removalOrder: number;
  cumulativeFees: number; // Do Nothing fees for metric ribbon
}

export interface SimulationMetrics {
  projected12MFees: number;
  optimalLiquidationDate: string;
  capitalRecoverable: number;
  totalVolumeCubicFeet: number;
}

function monthLabel(calMonth: number, calYear: number): string {
  const d = new Date(calYear, calMonth - 1, 1);
  return `${d.toLocaleString("default", { month: "short" })} '${String(calYear).slice(2)}`;
}

function isPeakMonth(m: number): boolean {
  return m >= 10; // Oct, Nov, Dec
}

function agedSurcharge(ageInDays: number, rates: FeeRates): number {
  if (ageInDays > 365) return rates.aged365Plus;
  if (ageInDays > 270) return rates.aged271to365;
  if (ageInDays > 180) return rates.aged181to270;
  return 0;
}

function baseStorageRate(isOversize: boolean, isPeak: boolean, rates: FeeRates): number {
  if (isOversize) return isPeak ? rates.oversizePeak : rates.oversizeNonPeak;
  return isPeak ? rates.standardPeak : rates.standardNonPeak;
}

export function computeScenarios(params: SimulationParams): ScenarioPoint[] {
  const {
    quantity, cubicFeetPerUnit, isOversize, ageInDays,
    monthlySalesVelocity, currentPrice, landedCost,
    aggressiveDiscountPct, velocityMultiplier,
    startMonth, startYear, rates,
  } = params;

  const discountedPrice = currentPrice * (1 - aggressiveDiscountPct);
  const discountedVelocity = Math.round(monthlySalesVelocity * velocityMultiplier);
  const removalFee = isOversize ? rates.removalOversize : rates.removalStandard;

  // Instant-clearance scenarios (flat lines)
  const outletNet = quantity * currentPrice * rates.outletRecoveryRate;
  const removalNet = quantity * landedCost - quantity * removalFee;

  let dnUnits = quantity;
  let dnRevenue = 0;
  let dnFees = 0;

  let discUnits = quantity;
  let discRevenue = 0;
  let discFees = 0;

  const points: ScenarioPoint[] = [];

  for (let m = 0; m < 12; m++) {
    const calMonth = ((startMonth - 1 + m) % 12) + 1;
    const calYear = startYear + Math.floor((startMonth - 1 + m) / 12);
    const peak = isPeakMonth(calMonth);
    const age = ageInDays + m * 30;
    const baseRate = baseStorageRate(isOversize, peak, rates);
    const surcharge = agedSurcharge(age, rates);
    const effectiveRate = baseRate + surcharge;

    // Do Nothing
    const dnSold = Math.min(monthlySalesVelocity, dnUnits);
    dnRevenue += dnSold * currentPrice;
    dnUnits -= dnSold;
    dnFees += dnUnits * cubicFeetPerUnit * effectiveRate;

    // Aggressive Discount
    const discSold = Math.min(discountedVelocity, discUnits);
    discRevenue += discSold * discountedPrice;
    discUnits -= discSold;
    discFees += discUnits * cubicFeetPerUnit * effectiveRate;

    points.push({
      monthLabel: monthLabel(calMonth, calYear),
      doNothing: dnRevenue - dnFees,
      aggressiveDiscount: discRevenue - discFees,
      amazonOutlet: outletNet,
      removalOrder: removalNet,
      cumulativeFees: dnFees,
    });
  }

  return points;
}

// ─── Break-even finder ────────────────────────────────────────────────────────

export interface BreakEvenResult {
  discountPct: number | null;  // null = no discount makes sense within 95% off
  monthLabel: string | null;   // which month the break-even is first crossed
}

export function findBreakEven(params: SimulationParams): BreakEvenResult {
  let lo = 0.05, hi = 0.95;

  const worstCase = computeScenarios({ ...params, aggressiveDiscountPct: hi });
  if (worstCase[11].aggressiveDiscount < worstCase[11].doNothing) {
    return { discountPct: null, monthLabel: null };
  }

  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    const pts = computeScenarios({ ...params, aggressiveDiscountPct: mid });
    pts[11].aggressiveDiscount >= pts[11].doNothing ? (hi = mid) : (lo = mid);
  }

  const pts = computeScenarios({ ...params, aggressiveDiscountPct: hi });
  const crossIdx = pts.findIndex(p => p.aggressiveDiscount >= p.doNothing);
  return {
    discountPct: Math.ceil(hi * 100),
    monthLabel: crossIdx >= 0 ? pts[crossIdx].monthLabel : pts[11].monthLabel,
  };
}

// ─── Removal planner ──────────────────────────────────────────────────────────

export interface RemovalPlan {
  monthlyCost: number;
  totalRemovalCost: number;
  monthsUntilBreakEven: number;
  saveByRemovingNow: number;   // 12M savings vs. keeping
  removeByDate: string;        // end of current month
}

export function computeRemovalPlan(params: SimulationParams): RemovalPlan {
  const { quantity, cubicFeetPerUnit, isOversize, ageInDays, startMonth, startYear, rates } = params;
  const peak = isPeakMonth(startMonth);
  const base = baseStorageRate(isOversize, peak, rates);
  const surcharge = agedSurcharge(ageInDays, rates);
  const monthlyCost = quantity * cubicFeetPerUnit * (base + surcharge);
  const removalFeePerUnit = isOversize ? rates.removalOversize : rates.removalStandard;
  const totalRemovalCost = quantity * removalFeePerUnit;
  const monthsUntilBreakEven = monthlyCost > 0 ? Math.ceil(totalRemovalCost / monthlyCost) : 999;

  const pts = computeScenarios(params);
  const saveByRemovingNow = Math.max(0, pts[11].removalOrder - pts[11].doNothing);

  const eom = new Date(startYear, startMonth - 1 + 1, 0);
  const removeByDate = eom.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return { monthlyCost, totalRemovalCost, monthsUntilBreakEven, saveByRemovingNow, removeByDate };
}

// ─── Per-SKU batch summary ────────────────────────────────────────────────────

export interface SkuSummary {
  sku: string;
  quantity: number;
  ageInDays: number;
  monthlyFee: number;
  projected12MFees: number;
  liquidationRecovery: number;
  removalCost: number;
  urgencyScore: number;  // 1–10
  recommendedAction: "Hold" | "Discount" | "Outlet" | "Remove";
}

export function computeSkuSummaries(
  rows: { sku: string; quantity: number; cubicFeetPerUnit: number; ageInDays: number; currentPrice: number; landedCost: number }[],
  rates: FeeRates,
  startMonth: number,
  startYear: number
): SkuSummary[] {
  return rows.map((row) => {
    const params: SimulationParams = {
      quantity: row.quantity,
      cubicFeetPerUnit: row.cubicFeetPerUnit > 0 ? row.cubicFeetPerUnit : 0.5,
      isOversize: false,
      ageInDays: row.ageInDays,
      monthlySalesVelocity: Math.max(1, Math.round(row.quantity / 12)),
      currentPrice: row.currentPrice > 0 ? row.currentPrice : 20,
      landedCost: row.landedCost > 0 ? row.landedCost : 5,
      aggressiveDiscountPct: 0.5,
      velocityMultiplier: 2,
      startMonth,
      startYear,
      rates,
    };

    const pts = computeScenarios(params);
    const last = pts[pts.length - 1];
    const peak = isPeakMonth(startMonth);
    const base = baseStorageRate(false, peak, rates);
    const surcharge = agedSurcharge(row.ageInDays, rates);
    const monthlyFee = row.quantity * params.cubicFeetPerUnit * (base + surcharge);

    const totalValue = row.quantity * (row.currentPrice > 0 ? row.currentPrice : 20);
    const feeRatio = totalValue > 0 ? Math.min(last.cumulativeFees / totalValue, 1) : 0;
    const ageTiers = [180, 270, 365];
    const daysToNextTier = ageTiers.find(t => t > row.ageInDays);
    const ageProximity = daysToNextTier ? 1 - Math.min((daysToNextTier - row.ageInDays) / 90, 1) : 1;
    const urgencyScore = Math.min(10, Math.round(1 + feeRatio * 6 + ageProximity * 3));

    const bestNet = Math.max(last.aggressiveDiscount, last.amazonOutlet, last.removalOrder);
    let recommendedAction: SkuSummary["recommendedAction"] = "Hold";
    if (bestNet === last.removalOrder && last.removalOrder > last.doNothing) recommendedAction = "Remove";
    else if (bestNet === last.amazonOutlet && last.amazonOutlet > last.doNothing) recommendedAction = "Outlet";
    else if (last.aggressiveDiscount > last.doNothing) recommendedAction = "Discount";

    return {
      sku: row.sku,
      quantity: row.quantity,
      ageInDays: row.ageInDays,
      monthlyFee,
      projected12MFees: last.cumulativeFees,
      liquidationRecovery: last.aggressiveDiscount,
      removalCost: row.quantity * rates.removalStandard,
      urgencyScore,
      recommendedAction,
    };
  });
}

export function computeMetrics(
  params: SimulationParams,
  points: ScenarioPoint[]
): SimulationMetrics {
  const last = points[points.length - 1];

  const optIdx = points.findIndex(p => p.aggressiveDiscount > p.doNothing);
  const optimalLiquidationDate = optIdx >= 0 ? points[optIdx].monthLabel : "Now";

  return {
    projected12MFees: last.cumulativeFees,
    optimalLiquidationDate,
    capitalRecoverable: Math.max(0, last.aggressiveDiscount - last.doNothing),
    totalVolumeCubicFeet: params.quantity * params.cubicFeetPerUnit,
  };
}
