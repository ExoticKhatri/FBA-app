// Regional Amazon FBA fee schedules — all values in local currency.
// Sources: Amazon Seller Central fee schedules (2024–2025).
// Storage rates are expressed in local currency per cubic foot per month.
// (Amazon EU/JP publish per-m³ rates; converted here: 1 m³ = 35.315 cu ft)
// These are the midpoints/standard tiers — sellers should verify in Seller Central.

import type { FeeRates } from "@/lib/feeEngine";
import type { RegionCode } from "@/lib/regionData";

// Toggles shared across all regions — only the numeric values differ
const TOGGLES = {
  enableMonthlySubscription: false,
  enableInboundShipping: false,
  enableInboundPlacement: false,
  enableStorageFee: true,
  enableLowInventoryFee: false,
  enableReferralFee: true,
  enableFulfillmentFee: true,
  enableFuelSurcharge: true,
  enableAgedSurcharge: true,
} as const;

export const REGION_FEE_DEFAULTS: Record<RegionCode, FeeRates> = {

  // ── Amazon.com (USD) ────────────────────────────────────────────────────────
  US: {
    ...TOGGLES,
    monthlySubscriptionFee: 39.99,
    inboundShippingPerLb: 0.47,       // $0.20–$0.75/lb midpoint
    unitWeightLbs: 1.0,
    inboundPlacementPerUnit: 0.34,    // $0.00–$0.68/unit midpoint
    standardNonPeak: 0.78,            // Jan–Sep
    standardPeak: 2.40,               // Oct–Dec
    oversizeNonPeak: 0.56,
    oversizePeak: 1.40,
    lowInventoryFeePerUnit: 0.71,     // $0.32–$1.11 midpoint
    referralFeePct: 0.15,
    fulfillmentFeeStandard: 3.50,     // small standard; heavier = more
    fulfillmentFeeOversize: 7.00,
    fuelSurchargePct: 0.035,          // 3.5% of fulfillment
    aged181to270: 0.50,
    aged271to365: 1.00,
    aged365Plus: 1.50,                // can reach $6.90 during peak
    removalStandard: 0.97,
    removalOversize: 2.89,
    outletRecoveryRate: 0.25,
  },

  // ── Amazon.in (INR) ─────────────────────────────────────────────────────────
  // Blueprint reference: ₹25–₹45/cu ft storage, ₹499/mo subscription,
  // ₹5–₹20/kg shipping, ₹15–₹250+/cu ft aged surcharge, ₹15–₹75+/unit removal
  IN: {
    ...TOGGLES,
    monthlySubscriptionFee: 499,
    inboundShippingPerLb: 8,          // ₹5–₹20/kg → ~₹8/lb (1 kg ≈ 2.2 lb)
    unitWeightLbs: 1.0,
    inboundPlacementPerUnit: 12,      // ₹0–₹25+/unit midpoint
    standardNonPeak: 25,              // ₹25/cu ft Jan–Sep
    standardPeak: 45,                 // ₹45/cu ft Oct–Dec
    oversizeNonPeak: 35,
    oversizePeak: 65,
    lowInventoryFeePerUnit: 22,       // ₹10–₹35/unit midpoint
    referralFeePct: 0.15,
    fulfillmentFeeStandard: 50,       // ₹40–₹120+ — small standard
    fulfillmentFeeOversize: 120,
    fuelSurchargePct: 0.035,
    aged181to270: 15,                 // ₹15–₹250+/cu ft (blueprint)
    aged271to365: 45,
    aged365Plus: 120,
    removalStandard: 30,              // ₹15–₹75+/unit midpoint
    removalOversize: 60,
    outletRecoveryRate: 0.25,
  },

  // ── Amazon.co.uk (GBP) ──────────────────────────────────────────────────────
  GB: {
    ...TOGGLES,
    monthlySubscriptionFee: 30.00,
    inboundShippingPerLb: 0.38,
    unitWeightLbs: 1.0,
    inboundPlacementPerUnit: 0.28,
    standardNonPeak: 0.68,
    standardPeak: 1.90,
    oversizeNonPeak: 0.52,
    oversizePeak: 1.45,
    lowInventoryFeePerUnit: 0.52,
    referralFeePct: 0.15,
    fulfillmentFeeStandard: 2.80,
    fulfillmentFeeOversize: 5.80,
    fuelSurchargePct: 0.035,
    aged181to270: 0.42,
    aged271to365: 0.84,
    aged365Plus: 1.26,
    removalStandard: 0.55,
    removalOversize: 1.65,
    outletRecoveryRate: 0.25,
  },

  // ── Amazon EU (EUR) — .de / .fr / .it / .es / .nl ──────────────────────────
  // Storage published per m³/month: ~€23 non-peak, ~€65 peak → ÷ 35.315
  EU: {
    ...TOGGLES,
    monthlySubscriptionFee: 39.00,
    inboundShippingPerLb: 0.42,
    unitWeightLbs: 1.0,
    inboundPlacementPerUnit: 0.30,
    standardNonPeak: 0.65,            // €23/m³ ÷ 35.3
    standardPeak: 1.85,               // €65/m³ ÷ 35.3
    oversizeNonPeak: 0.48,
    oversizePeak: 1.40,
    lowInventoryFeePerUnit: 0.50,
    referralFeePct: 0.15,
    fulfillmentFeeStandard: 3.20,
    fulfillmentFeeOversize: 6.50,
    fuelSurchargePct: 0.035,
    aged181to270: 0.45,
    aged271to365: 0.90,
    aged365Plus: 1.35,
    removalStandard: 0.75,
    removalOversize: 1.80,
    outletRecoveryRate: 0.25,
  },

  // ── Amazon.ca (CAD) ─────────────────────────────────────────────────────────
  CA: {
    ...TOGGLES,
    monthlySubscriptionFee: 29.99,
    inboundShippingPerLb: 0.55,
    unitWeightLbs: 1.0,
    inboundPlacementPerUnit: 0.40,
    standardNonPeak: 0.83,
    standardPeak: 2.40,
    oversizeNonPeak: 0.62,
    oversizePeak: 1.60,
    lowInventoryFeePerUnit: 0.78,
    referralFeePct: 0.15,
    fulfillmentFeeStandard: 4.71,
    fulfillmentFeeOversize: 8.50,
    fuelSurchargePct: 0.035,
    aged181to270: 0.55,
    aged271to365: 1.10,
    aged365Plus: 1.65,
    removalStandard: 1.10,
    removalOversize: 2.50,
    outletRecoveryRate: 0.25,
  },

  // ── Amazon.com.au (AUD) ─────────────────────────────────────────────────────
  AU: {
    ...TOGGLES,
    monthlySubscriptionFee: 49.95,
    inboundShippingPerLb: 0.65,
    unitWeightLbs: 1.0,
    inboundPlacementPerUnit: 0.45,
    standardNonPeak: 0.85,
    standardPeak: 2.50,
    oversizeNonPeak: 0.65,
    oversizePeak: 1.80,
    lowInventoryFeePerUnit: 0.90,
    referralFeePct: 0.15,
    fulfillmentFeeStandard: 5.50,
    fulfillmentFeeOversize: 11.00,
    fuelSurchargePct: 0.035,
    aged181to270: 0.60,
    aged271to365: 1.20,
    aged365Plus: 1.80,
    removalStandard: 1.20,
    removalOversize: 3.20,
    outletRecoveryRate: 0.25,
  },

  // ── Amazon.co.jp (JPY) ──────────────────────────────────────────────────────
  // Storage: ¥4.54/m³/day non-peak × 30 days ÷ 35.3 ≈ ¥3.86/cu ft
  JP: {
    ...TOGGLES,
    monthlySubscriptionFee: 4900,
    inboundShippingPerLb: 55,         // ¥120/kg ÷ 2.2
    unitWeightLbs: 1.0,
    inboundPlacementPerUnit: 22,
    standardNonPeak: 3.86,
    standardPeak: 11.60,              // ~3× non-peak
    oversizeNonPeak: 2.90,
    oversizePeak: 8.70,
    lowInventoryFeePerUnit: 120,
    referralFeePct: 0.10,             // Amazon JP: typically 8–15%
    fulfillmentFeeStandard: 400,
    fulfillmentFeeOversize: 1000,
    fuelSurchargePct: 0.035,
    aged181to270: 2.30,
    aged271to365: 4.60,
    aged365Plus: 9.20,
    removalStandard: 70,
    removalOversize: 350,
    outletRecoveryRate: 0.25,
  },

  // ── Amazon.com.mx (MXN) ─────────────────────────────────────────────────────
  MX: {
    ...TOGGLES,
    monthlySubscriptionFee: 600,
    inboundShippingPerLb: 8.50,
    unitWeightLbs: 1.0,
    inboundPlacementPerUnit: 7.00,
    standardNonPeak: 18,
    standardPeak: 52,
    oversizeNonPeak: 14,
    oversizePeak: 40,
    lowInventoryFeePerUnit: 16,
    referralFeePct: 0.15,
    fulfillmentFeeStandard: 85,
    fulfillmentFeeOversize: 200,
    fuelSurchargePct: 0.035,
    aged181to270: 12,
    aged271to365: 24,
    aged365Plus: 50,
    removalStandard: 22,
    removalOversize: 65,
    outletRecoveryRate: 0.25,
  },

  // ── Amazon.com.br (BRL) ─────────────────────────────────────────────────────
  BR: {
    ...TOGGLES,
    monthlySubscriptionFee: 150,
    inboundShippingPerLb: 3.80,
    unitWeightLbs: 1.0,
    inboundPlacementPerUnit: 3.00,
    standardNonPeak: 8,
    standardPeak: 22,
    oversizeNonPeak: 6,
    oversizePeak: 17,
    lowInventoryFeePerUnit: 7,
    referralFeePct: 0.16,             // Brazil: slightly higher
    fulfillmentFeeStandard: 28,
    fulfillmentFeeOversize: 75,
    fuelSurchargePct: 0.035,
    aged181to270: 6,
    aged271to365: 12,
    aged365Plus: 25,
    removalStandard: 12,
    removalOversize: 35,
    outletRecoveryRate: 0.25,
  },

  // ── Amazon.sg (SGD) ─────────────────────────────────────────────────────────
  SG: {
    ...TOGGLES,
    monthlySubscriptionFee: 29.95,
    inboundShippingPerLb: 0.58,
    unitWeightLbs: 1.0,
    inboundPlacementPerUnit: 0.38,
    standardNonPeak: 0.80,
    standardPeak: 2.20,
    oversizeNonPeak: 0.60,
    oversizePeak: 1.65,
    lowInventoryFeePerUnit: 0.65,
    referralFeePct: 0.15,
    fulfillmentFeeStandard: 4.00,
    fulfillmentFeeOversize: 9.00,
    fuelSurchargePct: 0.035,
    aged181to270: 0.48,
    aged271to365: 0.95,
    aged365Plus: 1.45,
    removalStandard: 0.90,
    removalOversize: 2.50,
    outletRecoveryRate: 0.25,
  },

  // ── Amazon.ae (AED) ─────────────────────────────────────────────────────────
  AE: {
    ...TOGGLES,
    monthlySubscriptionFee: 180,
    inboundShippingPerLb: 2.10,
    unitWeightLbs: 1.0,
    inboundPlacementPerUnit: 1.80,
    standardNonPeak: 3.00,
    standardPeak: 8.50,
    oversizeNonPeak: 2.20,
    oversizePeak: 6.50,
    lowInventoryFeePerUnit: 2.50,
    referralFeePct: 0.15,
    fulfillmentFeeStandard: 14,
    fulfillmentFeeOversize: 32,
    fuelSurchargePct: 0.035,
    aged181to270: 1.60,
    aged271to365: 3.20,
    aged365Plus: 6.50,
    removalStandard: 4.00,
    removalOversize: 12,
    outletRecoveryRate: 0.25,
  },
};
