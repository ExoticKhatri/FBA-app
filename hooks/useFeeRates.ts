"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_FEE_RATES, type FeeRates } from "@/lib/feeEngine";
import { useRegion } from "@/hooks/useRegion";
import { REGION_FEE_DEFAULTS } from "@/lib/regionFees";
import type { RegionCode } from "@/lib/regionData";

const LS_KEY = "fba_fee_rates_v1";

function loadFromStorage(): FeeRates | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    // Spread onto DEFAULT_FEE_RATES so any new fields added later have safe defaults
    return { ...DEFAULT_FEE_RATES, ...(JSON.parse(raw) as Partial<FeeRates>) };
  } catch {
    return null;
  }
}

function saveToStorage(rates: FeeRates): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(rates));
  } catch { /* quota exceeded or private browsing — silently ignore */ }
}

function removeFromStorage(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(LS_KEY);
  } catch { /* ignore */ }
}

function getRegionDefaults(code: string): FeeRates {
  return REGION_FEE_DEFAULTS[code as RegionCode] ?? DEFAULT_FEE_RATES;
}

export interface UseFeeRatesResult {
  rates: FeeRates;
  setRates: (r: FeeRates) => void;    // live update without persisting
  saveRates: (r: FeeRates) => void;   // persist to localStorage + update
  regionDefaults: FeeRates;           // current region's default schedule
  regionName: string;
  hasSaved: boolean;                  // true when user has saved custom rates
  clearSaved: () => void;             // wipe localStorage, revert to region defaults
}

export function useFeeRates(): UseFeeRatesResult {
  const { region } = useRegion();
  const regionDefaults = getRegionDefaults(region.code);

  const [rates, setRates] = useState<FeeRates>(() => {
    // On first render: prefer saved rates, fall back to region defaults.
    // region.code may still be "US" (pre-detect), but saved rates are user's own.
    return loadFromStorage() ?? regionDefaults;
  });

  const [hasSaved, setHasSaved] = useState<boolean>(() => Boolean(loadFromStorage()));

  // When region resolves asynchronously, switch to region defaults only if the
  // user has no saved custom rates (don't override their manual choices).
  useEffect(() => {
    if (!loadFromStorage()) {
      setRates(getRegionDefaults(region.code));
    }
  }, [region.code]);

  const saveRates = useCallback((r: FeeRates) => {
    saveToStorage(r);
    setRates(r);
    setHasSaved(true);
  }, []);

  const clearSaved = useCallback(() => {
    removeFromStorage();
    setHasSaved(false);
    setRates(getRegionDefaults(region.code));
  }, [region.code]);

  return {
    rates,
    setRates,
    saveRates,
    regionDefaults,
    regionName: region.name,
    hasSaved,
    clearSaved,
  };
}
