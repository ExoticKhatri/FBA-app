// ─── Fee Rates & Defaults ─────────────────────────────────────────────────────

export interface FeeRates {
  // 1. Monthly Subscription Fee
  monthlySubscriptionFee: number;    // $/month flat (US: $39.99)
  enableMonthlySubscription: boolean;

  // 2. Inbound Shipping Fee
  inboundShippingPerLb: number;      // $/lb (US midpoint ~$0.47)
  unitWeightLbs: number;             // avg weight per unit (lbs)
  enableInboundShipping: boolean;

  // 3. Inbound Placement Fee (charged ~45 days after check-in)
  inboundPlacementPerUnit: number;   // $/unit (US midpoint ~$0.34)
  enableInboundPlacement: boolean;

  // 4. Standard Storage Fee ($/cu ft/month)
  standardNonPeak: number;           // Jan–Sep standard: $0.78
  standardPeak: number;              // Oct–Dec standard: $2.40
  oversizeNonPeak: number;           // Jan–Sep oversize: $0.56
  oversizePeak: number;              // Oct–Dec oversize: $1.40
  enableStorageFee: boolean;

  // 5. Low-Inventory-Level Fee (per unit sold when stock < 28-day supply)
  lowInventoryFeePerUnit: number;    // $/unit sold (US midpoint ~$0.71)
  enableLowInventoryFee: boolean;

  // 6. Referral Fee / Commission
  referralFeePct: number;            // fraction, e.g. 0.15 = 15%
  enableReferralFee: boolean;

  // 7. Base FBA Fulfillment Fee ($/unit)
  fulfillmentFeeStandard: number;    // Standard: $3.50
  fulfillmentFeeOversize: number;    // Oversize: $7.00
  enableFulfillmentFee: boolean;

  // 8. Fuel & Logistics Surcharge (% of fulfillment fee)
  fuelSurchargePct: number;          // 3.5%
  enableFuelSurcharge: boolean;

  // 9. Aged Inventory Surcharge ($/cu ft/month, assessed on 15th of month)
  aged181to270: number;              // $0.50
  aged271to365: number;              // $1.00
  aged365Plus: number;               // $1.50 (can reach $6.90 peak)
  enableAgedSurcharge: boolean;

  // 10. Removal / Disposal Fee ($/unit)
  removalStandard: number;           // $0.97
  removalOversize: number;           // $2.89
  outletRecoveryRate: number;        // Amazon Outlet: fraction of price recovered (0–1)
}

export const DEFAULT_FEE_RATES: FeeRates = {
  // 1. Monthly subscription
  monthlySubscriptionFee: 39.99,
  enableMonthlySubscription: false,

  // 2. Inbound shipping
  inboundShippingPerLb: 0.47,
  unitWeightLbs: 1.0,
  enableInboundShipping: false,

  // 3. Inbound placement
  inboundPlacementPerUnit: 0.34,
  enableInboundPlacement: false,

  // 4. Storage
  standardNonPeak: 0.78,
  standardPeak: 2.40,
  oversizeNonPeak: 0.56,
  oversizePeak: 1.40,
  enableStorageFee: true,

  // 5. Low inventory
  lowInventoryFeePerUnit: 0.71,
  enableLowInventoryFee: false,

  // 6. Referral
  referralFeePct: 0.15,
  enableReferralFee: true,

  // 7. Fulfillment
  fulfillmentFeeStandard: 3.50,
  fulfillmentFeeOversize: 7.00,
  enableFulfillmentFee: true,

  // 8. Fuel surcharge
  fuelSurchargePct: 0.035,
  enableFuelSurcharge: true,

  // 9. Aged surcharge
  aged181to270: 0.50,
  aged271to365: 1.00,
  aged365Plus: 1.50,
  enableAgedSurcharge: true,

  // 10. Removal / outlet
  removalStandard: 0.97,
  removalOversize: 2.89,
  outletRecoveryRate: 0.25,
};

// ─── Simulation Params ────────────────────────────────────────────────────────

export interface SimulationParams {
  quantity: number;
  cubicFeetPerUnit: number;
  isOversize: boolean;
  ageInDays: number;
  monthlySalesVelocity: number;
  currentPrice: number;
  landedCost: number;
  aggressiveDiscountPct: number;
  velocityMultiplier: number;
  startMonth: number;               // 1–12
  startYear: number;
  rates: FeeRates;
}

export interface ScenarioPoint {
  monthLabel: string;
  doNothing: number;
  aggressiveDiscount: number;
  amazonOutlet: number;
  removalOrder: number;
  cumulativeFees: number;
}

export interface SimulationMetrics {
  projected12MFees: number;
  optimalLiquidationDate: string;
  capitalRecoverable: number;
  totalVolumeCubicFeet: number;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function monthLabel(calMonth: number, calYear: number): string {
  const d = new Date(calYear, calMonth - 1, 1);
  return `${d.toLocaleString("default", { month: "short" })} '${String(calYear).slice(2)}`;
}

function isPeakMonth(m: number): boolean {
  return m >= 10;
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

// ─── Core simulation ──────────────────────────────────────────────────────────

export function computeScenarios(params: SimulationParams): ScenarioPoint[] {
  const {
    quantity, cubicFeetPerUnit, isOversize, ageInDays,
    monthlySalesVelocity, currentPrice, landedCost,
    aggressiveDiscountPct, velocityMultiplier,
    startMonth, startYear, rates: r,
  } = params;

  const discountedPrice = currentPrice * (1 - aggressiveDiscountPct);
  const discountedVelocity = Math.round(monthlySalesVelocity * velocityMultiplier);
  const removalFeePerUnit = isOversize ? r.removalOversize : r.removalStandard;

  // Per-unit fulfillment cost (fees 7 + 8)
  const fulfillmentBase = r.enableFulfillmentFee
    ? (isOversize ? r.fulfillmentFeeOversize : r.fulfillmentFeeStandard)
    : 0;
  const fuelCost = r.enableFuelSurcharge ? fulfillmentBase * r.fuelSurchargePct : 0;
  const fulfillmentTotal = fulfillmentBase + fuelCost;

  // Net revenue per unit after Amazon's per-sale deductions (fees 6, 7, 8)
  const netPerUnitDN = currentPrice
    - (r.enableReferralFee ? currentPrice * r.referralFeePct : 0)
    - fulfillmentTotal;

  const netPerUnitDisc = discountedPrice
    - (r.enableReferralFee ? discountedPrice * r.referralFeePct : 0)
    - fulfillmentTotal;

  // Monthly flat overhead (fee 1)
  const monthlyOverhead = r.enableMonthlySubscription ? r.monthlySubscriptionFee : 0;

  // One-time inbound costs (fees 2 + 3)
  const inboundShipping = r.enableInboundShipping
    ? quantity * r.unitWeightLbs * r.inboundShippingPerLb
    : 0;
  const inboundPlacement = r.enableInboundPlacement
    ? quantity * r.inboundPlacementPerUnit
    : 0;

  // Instant-clearance baselines
  const outletPricePerUnit = currentPrice * r.outletRecoveryRate;
  const outletNetPerUnit = outletPricePerUnit
    - (r.enableReferralFee ? outletPricePerUnit * r.referralFeePct : 0)
    - fulfillmentTotal;
  const outletNet = quantity * Math.max(0, outletNetPerUnit) - inboundShipping - inboundPlacement;
  const removalNet = quantity * landedCost - quantity * removalFeePerUnit - inboundShipping;

  let dnUnits = quantity;
  let dnRevenue = -inboundShipping;  // inbound shipping as day-0 cost
  let dnFees = 0;

  let discUnits = quantity;
  let discRevenue = -inboundShipping;
  let discFees = 0;

  let placementCharged = false;

  const points: ScenarioPoint[] = [];

  for (let m = 0; m < 12; m++) {
    const calMonth = ((startMonth - 1 + m) % 12) + 1;
    const calYear = startYear + Math.floor((startMonth - 1 + m) / 12);
    const peak = isPeakMonth(calMonth);
    const age = ageInDays + m * 30;

    // Storage rate for this month (fees 4 + 9)
    const storageRate = r.enableStorageFee ? baseStorageRate(isOversize, peak, r) : 0;
    const agedRate = r.enableAgedSurcharge ? agedSurcharge(age, r) : 0;
    const effectiveRate = storageRate + agedRate;

    // Inbound placement charged at ~45 days (month index 1, fee 3)
    if (m === 1 && !placementCharged) {
      dnRevenue -= inboundPlacement;
      discRevenue -= inboundPlacement;
      placementCharged = true;
    }

    // Do Nothing
    const dnSold = Math.min(monthlySalesVelocity, dnUnits);
    const dnLowInv = (r.enableLowInventoryFee && dnUnits < monthlySalesVelocity)
      ? dnSold * r.lowInventoryFeePerUnit
      : 0;
    dnRevenue += dnSold * netPerUnitDN;
    dnUnits -= dnSold;
    dnFees += dnUnits * cubicFeetPerUnit * effectiveRate + monthlyOverhead + dnLowInv;

    // Aggressive Discount
    const discSold = Math.min(discountedVelocity, discUnits);
    const discLowInv = (r.enableLowInventoryFee && discUnits < monthlySalesVelocity)
      ? discSold * r.lowInventoryFeePerUnit
      : 0;
    discRevenue += discSold * netPerUnitDisc;
    discUnits -= discSold;
    discFees += discUnits * cubicFeetPerUnit * effectiveRate + monthlyOverhead + discLowInv;

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
  discountPct: number | null;
  monthLabel: string | null;
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
  saveByRemovingNow: number;
  removeByDate: string;
}

export function computeRemovalPlan(params: SimulationParams): RemovalPlan {
  const { quantity, cubicFeetPerUnit, isOversize, ageInDays, startMonth, startYear, rates } = params;
  const peak = isPeakMonth(startMonth);
  const base = rates.enableStorageFee ? baseStorageRate(isOversize, peak, rates) : 0;
  const surcharge = rates.enableAgedSurcharge ? agedSurcharge(ageInDays, rates) : 0;
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
  urgencyScore: number;
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
    const base = rates.enableStorageFee ? baseStorageRate(false, peak, rates) : 0;
    const surcharge = rates.enableAgedSurcharge ? agedSurcharge(row.ageInDays, rates) : 0;
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
