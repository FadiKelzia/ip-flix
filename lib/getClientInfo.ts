import { headers } from 'next/headers';
import { ClientInfo, GeoLocation } from './types';

// Get IP from request headers
export async function getClientIP(): Promise<string> {
  const headersList = await headers();

  // Try multiple headers for IP detection (Vercel, Cloudflare, etc.)
  const ip =
    headersList.get('x-real-ip') ||
    headersList.get('x-forwarded-for')?.split(',')[0] ||
    headersList.get('cf-connecting-ip') ||
    headersList.get('x-client-ip') ||
    '0.0.0.0';

  return ip.trim();
}

// Determine IP version
export function getIPVersion(ip: string): 'IPv4' | 'IPv6' {
  return ip.includes(':') ? 'IPv6' : 'IPv4';
}

// Validate IP address
function isValidIP(ip: string): boolean {
  // Skip localhost, private IPs, and invalid IPs
  if (!ip || ip === '0.0.0.0' || ip === '::1' || ip.startsWith('127.') ||
      ip.startsWith('10.') || ip.startsWith('192.168.') || ip.startsWith('172.')) {
    return false;
  }
  return true;
}

// Get geolocation data from free API
export async function getGeoLocation(ip: string): Promise<GeoLocation | null> {
  // Return null for invalid IPs
  if (!isValidIP(ip)) {
    console.log('Skipping geolocation for invalid/private IP:', ip);
    return null;
  }

  try {
    // Using ipapi.co free tier (1000 requests/day)
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
      headers: {
        'User-Agent': 'IPFlix/1.0',
      },
    });

    if (!response.ok) {
      console.error(`ipapi.co failed with status: ${response.status}`);
      throw new Error(`Geolocation API failed: ${response.status}`);
    }

    const data = await response.json();

    // Check for API error response
    if (data.error) {
      console.error('ipapi.co error:', data.reason);
      throw new Error(data.reason || 'API error');
    }

    return {
      country: data.country_name || 'Unknown',
      countryCode: data.country_code || 'XX',
      city: data.city || 'Unknown',
      region: data.region || 'Unknown',
      latitude: data.latitude || 0,
      longitude: data.longitude || 0,
      timezone: data.timezone || 'UTC',
      currency: data.currency || 'USD',
      currencySymbol: data.currency_symbol || '$',
    };
  } catch (error) {
    console.error('ipapi.co geolocation error:', error);

    // Fallback to ip-api.com (45 requests/minute, no HTTPS on free tier)
    try {
      const fallbackResponse = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,lat,lon,timezone`, {
        next: { revalidate: 3600 },
      });

      if (!fallbackResponse.ok) {
        throw new Error(`ip-api.com failed: ${fallbackResponse.status}`);
      }

      const fallbackData = await fallbackResponse.json();

      // Check for API error
      if (fallbackData.status === 'fail') {
        console.error('ip-api.com error:', fallbackData.message);
        throw new Error(fallbackData.message || 'API error');
      }

      return {
        country: fallbackData.country || 'Unknown',
        countryCode: fallbackData.countryCode || 'XX',
        city: fallbackData.city || 'Unknown',
        region: fallbackData.regionName || 'Unknown',
        latitude: fallbackData.lat || 0,
        longitude: fallbackData.lon || 0,
        timezone: fallbackData.timezone || 'UTC',
      };
    } catch (fallbackError) {
      console.error('ip-api.com fallback error:', fallbackError);

      // Last resort: Use Vercel's geolocation headers if available
      try {
        const headersList = await headers();
        const country = headersList.get('x-vercel-ip-country');
        const city = headersList.get('x-vercel-ip-city');
        const region = headersList.get('x-vercel-ip-country-region');
        const timezone = headersList.get('x-vercel-ip-timezone');

        if (country) {
          console.log('Using Vercel geolocation headers');
          return {
            country: country || 'Unknown',
            countryCode: country || 'XX',
            city: city ? decodeURIComponent(city) : 'Unknown',
            region: region ? decodeURIComponent(region) : 'Unknown',
            latitude: 0,
            longitude: 0,
            timezone: timezone || 'UTC',
          };
        }
      } catch (headerError) {
        console.error('Vercel headers error:', headerError);
      }

      return null;
    }
  }
}

// Get basic client info (instant)
export async function getBasicClientInfo(): Promise<Partial<ClientInfo>> {
  const ip = await getClientIP();
  const ipVersion = getIPVersion(ip);
  const geo = await getGeoLocation(ip);

  if (!geo) {
    return {
      ip,
      ipVersion,
      country: 'Unknown',
      countryCode: 'XX',
      city: 'Unknown',
      region: 'Unknown',
      latitude: 0,
      longitude: 0,
      timezone: 'UTC',
    };
  }

  return {
    ip,
    ipVersion,
    ...geo,
  };
}

// Get detailed network info (lazy-loaded)
export async function getDetailedNetworkInfo(ip: string) {
  // Return placeholder for invalid IPs
  if (!isValidIP(ip)) {
    console.log('Skipping network info for invalid/private IP:', ip);
    return {
      isp: 'Private Network',
      org: 'Private Network',
      asn: 'N/A',
      hostname: 'localhost',
    };
  }

  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      next: { revalidate: 3600 },
      headers: {
        'User-Agent': 'IPFlix/1.0',
      },
    });

    if (!response.ok) {
      console.error(`Network info API failed: ${response.status}`);
      throw new Error(`Network info API failed: ${response.status}`);
    }

    const data = await response.json();

    // Check for API error
    if (data.error) {
      console.error('Network info API error:', data.reason);
      throw new Error(data.reason || 'API error');
    }

    return {
      isp: data.org || 'Unknown',
      org: data.org || 'Unknown',
      asn: data.asn || 'Unknown',
      hostname: data.hostname || 'Unknown',
    };
  } catch (error) {
    console.error('Network info error:', error);
    return {
      isp: 'Unknown',
      org: 'Unknown',
      asn: 'Unknown',
      hostname: 'Unknown',
    };
  }
}

// Get user agent info
export async function getUserAgentInfo() {
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';

  return {
    userAgent,
    browser: parseBrowser(userAgent),
    os: parseOS(userAgent),
    device: parseDevice(userAgent),
  };
}

// Simple browser parser
function parseBrowser(ua: string): string {
  if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Edg')) return 'Edge';
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
  return 'Unknown';
}

// Simple OS parser
function parseOS(ua: string): string {
  if (ua.includes('Windows NT 10.0')) return 'Windows 10/11';
  if (ua.includes('Windows NT')) return 'Windows';
  if (ua.includes('Mac OS X')) return 'macOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  return 'Unknown';
}

// Simple device parser
function parseDevice(ua: string): string {
  if (ua.includes('Mobile') || ua.includes('Android')) return 'Mobile';
  if (ua.includes('Tablet') || ua.includes('iPad')) return 'Tablet';
  return 'Desktop';
}
