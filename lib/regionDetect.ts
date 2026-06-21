import type { RegionCode } from './regionData';

// Countries that use the Euro (eurozone + de facto users)
const EURO_COUNTRIES = new Set([
  'AD', 'AT', 'BE', 'CY', 'EE', 'FI', 'FR', 'DE', 'GR', 'IE',
  'IT', 'LV', 'LT', 'LU', 'MT', 'MC', 'ME', 'NL', 'PT', 'SM',
  'SK', 'SI', 'ES', 'VA', 'XK',
]);

// Direct country → RegionCode mappings
const COUNTRY_TO_REGION: Record<string, RegionCode> = {
  US: 'US', IN: 'IN', GB: 'GB', CA: 'CA',
  AU: 'AU', JP: 'JP', MX: 'MX', BR: 'BR',
  SG: 'SG', AE: 'AE',
};

// IANA timezone → RegionCode for client-side fallback when IP is localhost/private
const TIMEZONE_TO_REGION: Record<string, RegionCode> = {
  // India
  'Asia/Kolkata': 'IN', 'Asia/Calcutta': 'IN',
  // UK
  'Europe/London': 'GB',
  // EU
  'Europe/Paris': 'EU', 'Europe/Berlin': 'EU', 'Europe/Rome': 'EU',
  'Europe/Madrid': 'EU', 'Europe/Amsterdam': 'EU', 'Europe/Brussels': 'EU',
  'Europe/Vienna': 'EU', 'Europe/Warsaw': 'EU', 'Europe/Stockholm': 'EU',
  'Europe/Helsinki': 'EU', 'Europe/Athens': 'EU', 'Europe/Budapest': 'EU',
  'Europe/Lisbon': 'EU', 'Europe/Dublin': 'EU', 'Europe/Zurich': 'EU',
  'Europe/Copenhagen': 'EU', 'Europe/Oslo': 'EU', 'Europe/Bucharest': 'EU',
  'Europe/Prague': 'EU', 'Europe/Sofia': 'EU', 'Europe/Zagreb': 'EU',
  'Europe/Vilnius': 'EU', 'Europe/Riga': 'EU', 'Europe/Tallinn': 'EU',
  'Europe/Ljubljana': 'EU', 'Europe/Bratislava': 'EU', 'Europe/Nicosia': 'EU',
  'Europe/Luxembourg': 'EU', 'Europe/Valletta': 'EU',
  // Canada
  'America/Toronto': 'CA', 'America/Vancouver': 'CA', 'America/Montreal': 'CA',
  'America/Winnipeg': 'CA', 'America/Halifax': 'CA', 'America/Edmonton': 'CA',
  'America/Calgary': 'CA', 'America/St_Johns': 'CA', 'America/Regina': 'CA',
  // Australia
  'Australia/Sydney': 'AU', 'Australia/Melbourne': 'AU', 'Australia/Brisbane': 'AU',
  'Australia/Perth': 'AU', 'Australia/Adelaide': 'AU', 'Australia/Darwin': 'AU',
  'Australia/Hobart': 'AU',
  // Japan
  'Asia/Tokyo': 'JP',
  // Mexico
  'America/Mexico_City': 'MX', 'America/Monterrey': 'MX', 'America/Cancun': 'MX',
  'America/Merida': 'MX', 'America/Chihuahua': 'MX',
  // Brazil
  'America/Sao_Paulo': 'BR', 'America/Manaus': 'BR', 'America/Fortaleza': 'BR',
  'America/Belem': 'BR', 'America/Recife': 'BR', 'America/Bahia': 'BR',
  // Singapore
  'Asia/Singapore': 'SG',
  // UAE
  'Asia/Dubai': 'AE',
};

export function countryToRegion(countryCode: string): RegionCode {
  const upper = countryCode.toUpperCase();
  if (COUNTRY_TO_REGION[upper]) return COUNTRY_TO_REGION[upper];
  if (EURO_COUNTRIES.has(upper)) return 'EU';
  return 'US';
}

export function timezoneToRegion(tz: string): RegionCode | null {
  return TIMEZONE_TO_REGION[tz] ?? null;
}

interface IpApiResponse {
  country_code?: string;
  error?: boolean;
}

function isLocalIp(ip: string): boolean {
  return (
    !ip ||
    ip === '::1' ||
    ip === '127.0.0.1' ||
    ip.startsWith('192.168.') ||
    ip.startsWith('10.') ||
    ip.startsWith('172.16.') ||
    ip.startsWith('::ffff:127.')
  );
}

// Detect region: IP geolocation first, timezone as fallback for local/dev environments
export async function detectRegionFromIp(ip: string, timezone?: string): Promise<RegionCode> {
  if (!isLocalIp(ip)) {
    try {
      const res = await fetch(`https://ipapi.co/${ip}/json/`, {
        headers: { 'User-Agent': 'fbaliquidator-regiondetect/1.0' },
        cache: 'no-store',
      });

      if (res.ok) {
        const data = await res.json() as IpApiResponse;
        if (!data.error && data.country_code) {
          return countryToRegion(data.country_code);
        }
      }
    } catch {
      // fall through to timezone
    }
  }

  // Timezone fallback — reliable in dev (localhost) and when IP geoloc fails
  if (timezone) {
    const tzRegion = timezoneToRegion(timezone);
    if (tzRegion) return tzRegion;
  }

  return 'US';
}

// Extract the real client IP from Next.js request headers
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return headers.get('x-real-ip') ?? '127.0.0.1';
}
