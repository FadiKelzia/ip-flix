export interface ClientInfo {
  // Core Info (Instant)
  ip: string;
  ipVersion: 'IPv4' | 'IPv6';
  country: string;
  countryCode: string;
  city: string;
  region: string;
  latitude: number;
  longitude: number;
  timezone: string;

  // Browser Info (Instant)
  browser: string;
  os: string;
  device: string;
  screenResolution: string;
  language: string;

  // Detailed Info (Lazy-loaded)
  isp?: string;
  org?: string;
  asn?: string;
  hostname?: string;
  isProxy?: boolean;
  isVpn?: boolean;
  isTor?: boolean;
  currency?: string;
  currencySymbol?: string;
}

export interface GeoLocation {
  country: string;
  countryCode: string;
  city: string;
  region: string;
  latitude: number;
  longitude: number;
  timezone: string;
  currency?: string;
  currencySymbol?: string;
}

export interface NetworkDetails {
  isp: string;
  org: string;
  asn: string;
  hostname: string;
}

export interface SecurityInfo {
  isProxy: boolean;
  isVpn: boolean;
  isTor: boolean;
  threatLevel: string;
}
