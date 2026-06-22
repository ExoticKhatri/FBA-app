export type RegionCode = 'US' | 'IN' | 'GB' | 'EU' | 'CA' | 'AU' | 'JP' | 'MX' | 'BR' | 'SG' | 'AE';

export interface RegionPrice {
  code: RegionCode;
  name: string;
  currency: string;       // ISO 4217 code
  symbol: string;         // display symbol
  amount: number;         // human-readable amount (e.g. 26)
  amountSmallest: number; // smallest currency unit for Razorpay (paise for INR, cents for others)
  displayPrice: string;   // e.g. "$26"
  displayUnit: string;    // e.g. "per month"
}

export const REGION_PRICES: Record<RegionCode, RegionPrice> = {
  US: {
    code: 'US',
    name: 'United States',
    currency: 'USD',
    symbol: '$',
    amount: 19,
    amountSmallest: 1900,
    displayPrice: '$19',
    displayUnit: 'per month',
  },
  IN: {
    code: 'IN',
    name: 'India',
    currency: 'INR',
    symbol: '₹',
    amount: 1870,
    amountSmallest: 187000, // paise
    displayPrice: '₹1,870',
    displayUnit: 'per month',
  },
  GB: {
    code: 'GB',
    name: 'United Kingdom',
    currency: 'GBP',
    symbol: '£',
    amount: 21,
    amountSmallest: 2100,
    displayPrice: '£21',
    displayUnit: 'per month',
  },
  EU: {
    code: 'EU',
    name: 'Europe',
    currency: 'EUR',
    symbol: '€',
    amount: 24,
    amountSmallest: 2400,
    displayPrice: '€24',
    displayUnit: 'per month',
  },
  CA: {
    code: 'CA',
    name: 'Canada',
    currency: 'CAD',
    symbol: 'C$',
    amount: 35,
    amountSmallest: 3500,
    displayPrice: 'C$35',
    displayUnit: 'per month',
  },
  AU: {
    code: 'AU',
    name: 'Australia',
    currency: 'AUD',
    symbol: 'A$',
    amount: 40,
    amountSmallest: 4000,
    displayPrice: 'A$40',
    displayUnit: 'per month',
  },
  JP: {
    code: 'JP',
    name: 'Japan',
    currency: 'JPY',
    symbol: '¥',
    amount: 3800,
    amountSmallest: 3800, // JPY has no subunit
    displayPrice: '¥3,800',
    displayUnit: 'per month',
  },
  MX: {
    code: 'MX',
    name: 'Mexico',
    currency: 'MXN',
    symbol: 'MX$',
    amount: 480,
    amountSmallest: 48000,
    displayPrice: 'MX$480',
    displayUnit: 'per month',
  },
  BR: {
    code: 'BR',
    name: 'Brazil',
    currency: 'BRL',
    symbol: 'R$',
    amount: 130,
    amountSmallest: 13000,
    displayPrice: 'R$130',
    displayUnit: 'per month',
  },
  SG: {
    code: 'SG',
    name: 'Singapore',
    currency: 'SGD',
    symbol: 'S$',
    amount: 35,
    amountSmallest: 3500,
    displayPrice: 'S$35',
    displayUnit: 'per month',
  },
  AE: {
    code: 'AE',
    name: 'UAE',
    currency: 'AED',
    symbol: 'AED',
    amount: 95,
    amountSmallest: 9500,
    displayPrice: 'AED 95',
    displayUnit: 'per month',
  },
};

export const DEFAULT_REGION: RegionCode = 'US';

export function getRegionPrice(code: string): RegionPrice {
  return REGION_PRICES[code as RegionCode] ?? REGION_PRICES[DEFAULT_REGION];
}
