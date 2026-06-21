import { NextResponse } from 'next/server';
import { getClientIp, detectRegionFromIp } from '@/lib/regionDetect';
import { getRegionPrice } from '@/lib/regionData';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const timezone = url.searchParams.get('tz') ?? undefined;

  const ip = getClientIp(new Headers(request.headers));
  const regionCode = await detectRegionFromIp(ip, timezone);
  const regionPrice = getRegionPrice(regionCode);

  return NextResponse.json(regionPrice);
}
