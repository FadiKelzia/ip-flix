import { ThreatIntelligence, ASNDetails } from './types';

/**
 * Get comprehensive threat intelligence for an IP address
 * Using ipapi.is free API (no key required for basic usage)
 */
export async function getThreatIntelligence(ip: string): Promise<ThreatIntelligence | null> {
  try {
    // Skip private IPs
    if (isPrivateIP(ip)) {
      return {
        threatScore: 0,
        threatLevel: 'Safe',
        isVpn: false,
        isProxy: false,
        isTor: false,
        isRelay: false,
        isHosting: false,
        isCloudProvider: false,
        abuseScore: 0,
        isBot: false,
        usageType: 'private',
        risks: [],
      };
    }

    const response = await fetch(`https://api.ipapi.is/?q=${ip}`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
      headers: {
        'User-Agent': 'IPFlix/1.0',
      },
    });

    if (!response.ok) {
      console.error(`Threat intelligence API failed: ${response.status}`);
      return null;
    }

    const data = await response.json();

    // Calculate threat score
    const { threatScore, threatLevel, risks } = calculateThreatScore(data);

    return {
      threatScore,
      threatLevel,
      isVpn: data.is_vpn || false,
      isProxy: data.is_proxy || false,
      isTor: data.is_tor || false,
      isRelay: data.is_relay || false,
      isHosting: data.is_hosting || data.is_datacenter || false,
      isCloudProvider: data.is_cloud || false,
      abuseScore: data.abuse_score || 0,
      isBot: data.is_bot || data.is_crawler || false,
      companyName: data.company?.name || data.asn?.org,
      companyDomain: data.company?.domain || data.asn?.domain,
      companyType: data.company?.type,
      usageType: determineUsageType(data),
      risks,
    };
  } catch (error) {
    console.error('Threat intelligence error:', error);
    return null;
  }
}

/**
 * Get detailed ASN information
 */
export async function getASNDetails(ip: string): Promise<ASNDetails | null> {
  try {
    if (isPrivateIP(ip)) {
      return {
        asn: 'N/A',
        name: 'Private Network',
        domain: 'localhost',
        route: 'Private',
        type: 'private',
        country: 'N/A',
      };
    }

    const response = await fetch(`https://api.ipapi.is/?q=${ip}`, {
      next: { revalidate: 3600 },
      headers: {
        'User-Agent': 'IPFlix/1.0',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    return {
      asn: data.asn?.asn || 'Unknown',
      name: data.asn?.org || data.asn?.name || 'Unknown',
      domain: data.asn?.domain || 'Unknown',
      route: data.asn?.route || 'Unknown',
      type: data.asn?.type || 'Unknown',
      country: data.location?.country_code || 'Unknown',
    };
  } catch (error) {
    console.error('ASN details error:', error);
    return null;
  }
}

/**
 * Calculate threat score based on various factors
 */
function calculateThreatScore(data: any): {
  threatScore: number;
  threatLevel: 'Safe' | 'Low' | 'Medium' | 'High' | 'Critical';
  risks: string[];
} {
  let score = 0;
  const risks: string[] = [];

  // VPN/Proxy/Tor (+30 points each)
  if (data.is_vpn) {
    score += 30;
    risks.push('VPN detected');
  }
  if (data.is_proxy) {
    score += 30;
    risks.push('Proxy detected');
  }
  if (data.is_tor) {
    score += 40;
    risks.push('Tor exit node detected');
  }

  // Relay/Hosting (+20 points)
  if (data.is_relay) {
    score += 20;
    risks.push('Network relay detected');
  }
  if (data.is_hosting || data.is_datacenter) {
    score += 15;
    risks.push('Hosting/datacenter IP');
  }

  // Cloud provider (+10 points)
  if (data.is_cloud) {
    score += 10;
    risks.push('Cloud provider IP');
  }

  // Bot detection (+25 points)
  if (data.is_bot || data.is_crawler) {
    score += 25;
    risks.push('Bot/crawler detected');
  }

  // Abuse score (0-100, add directly)
  if (data.abuse_score) {
    score += data.abuse_score * 0.3; // Scale down abuse score
    if (data.abuse_score > 50) {
      risks.push(`High abuse score: ${data.abuse_score}`);
    }
  }

  // Cap at 100
  score = Math.min(100, score);

  // Determine threat level
  let threatLevel: 'Safe' | 'Low' | 'Medium' | 'High' | 'Critical';
  if (score === 0) threatLevel = 'Safe';
  else if (score < 25) threatLevel = 'Low';
  else if (score < 50) threatLevel = 'Medium';
  else if (score < 75) threatLevel = 'High';
  else threatLevel = 'Critical';

  return { threatScore: Math.round(score), threatLevel, risks };
}

/**
 * Determine usage type based on API data
 */
function determineUsageType(data: any): string {
  if (data.company?.type === 'education') return 'education';
  if (data.company?.type === 'government') return 'government';
  if (data.company?.type === 'military') return 'military';
  if (data.is_hosting || data.is_datacenter) return 'hosting';
  if (data.is_cloud) return 'cloud';
  if (data.company?.type === 'business') return 'business';
  if (data.asn?.type === 'isp') return 'residential';
  return 'unknown';
}

/**
 * Check if IP is private/local
 */
function isPrivateIP(ip: string): boolean {
  if (!ip || ip === '0.0.0.0' || ip === '::1' || ip.startsWith('127.') ||
      ip.startsWith('10.') || ip.startsWith('192.168.') || ip.startsWith('172.')) {
    return true;
  }
  return false;
}
