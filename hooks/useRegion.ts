'use client';

import { useEffect, useState } from 'react';
import { REGION_PRICES, DEFAULT_REGION, type RegionPrice } from '@/lib/regionData';

// Module-level cache — lives for the lifetime of the JS bundle (one page load).
// Cleared on hard refresh because the module re-evaluates.
let _cached: RegionPrice | null = null;
let _promise: Promise<RegionPrice> | null = null;

function fetchRegion(): Promise<RegionPrice> {
  if (_promise) return _promise;

  // Send the browser's IANA timezone so the server can detect region even on
  // localhost (where IP is 127.0.0.1 and IP geolocation is skipped).
  const tz = typeof Intl !== 'undefined'
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : '';

  const url = tz
    ? `/api/region?tz=${encodeURIComponent(tz)}`
    : '/api/region';

  _promise = fetch(url, { cache: 'no-store' })
    .then((r) => (r.ok ? (r.json() as Promise<RegionPrice>) : Promise.reject(new Error(`${r.status}`))))
    .then((data) => {
      _cached = data;
      return data;
    })
    .catch(() => {
      const fallback = REGION_PRICES[DEFAULT_REGION];
      _cached = fallback;
      return fallback;
    });

  return _promise;
}

export interface UseRegionResult {
  region: RegionPrice;
  loading: boolean;
}

export function useRegion(): UseRegionResult {
  const [region, setRegion] = useState<RegionPrice>(
    _cached ?? REGION_PRICES[DEFAULT_REGION],
  );
  const [loading, setLoading] = useState<boolean>(!_cached);

  useEffect(() => {
    // useState already initialized with _cached when it exists, so skip fetch.
    if (_cached) return;
    fetchRegion().then((r) => {
      setRegion(r);
      setLoading(false);
    });
  }, []);

  return { region, loading };
}
