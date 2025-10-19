/**
 * OSINT (Open Source Intelligence) Integration
 * Uses free public APIs to gather threat intelligence
 */

export interface ShodanData {
  ports: number[];
  vulns: string[];
  cpes: string[];
  hostnames: string[];
  tags: string[];
}

export interface AbuseIPDBData {
  abuseConfidenceScore: number;
  totalReports: number;
  numDistinctUsers: number;
  lastReportedAt: string | null;
  usageType: string;
  isp: string;
  domain: string;
  countryCode: string;
  isWhitelisted: boolean;
  categories: number[];
  categoryNames: string[];
}

export interface OSINTResult {
  shodan: ShodanData | null;
  abuseipdb: AbuseIPDBData | null;
  riskScore: number; // 0-100
  riskLevel: 'Safe' | 'Low' | 'Medium' | 'High' | 'Critical';
  recommendations: string[];
}

/**
 * Query Shodan InternetDB (FREE - No API key required!)
 * Returns open ports, vulnerabilities, CPEs, hostnames, and tags
 */
export async function getShodanData(ip: string): Promise<ShodanData | null> {
  try {
    // Skip private IPs
    if (isPrivateIP(ip)) {
      return {
        ports: [],
        vulns: [],
        cpes: [],
        hostnames: [],
        tags: [],
      };
    }

    const response = await fetch(`https://internetdb.shodan.io/${ip}`, {
      next: { revalidate: 86400 }, // Cache for 24 hours
      headers: {
        'User-Agent': 'IPFlix-OSINT/1.0',
      },
    });

    // 404 means no data found (IP not in Shodan database)
    if (response.status === 404) {
      return {
        ports: [],
        vulns: [],
        cpes: [],
        hostnames: [],
        tags: [],
      };
    }

    if (!response.ok) {
      console.error(`Shodan API failed: ${response.status}`);
      return null;
    }

    const data = await response.json();

    return {
      ports: data.ports || [],
      vulns: data.vulns || [],
      cpes: data.cpes || [],
      hostnames: data.hostnames || [],
      tags: data.tags || [],
    };
  } catch (error) {
    console.error('Shodan InternetDB error:', error);
    return null;
  }
}

/**
 * Query AbuseIPDB (FREE tier: 1000 requests/day)
 * Returns abuse confidence score, reports, and categories
 *
 * Note: Requires API key in environment variable ABUSEIPDB_API_KEY
 * Get free key at: https://www.abuseipdb.com/register
 */
export async function getAbuseIPDBData(ip: string): Promise<AbuseIPDBData | null> {
  try {
    // Skip private IPs
    if (isPrivateIP(ip)) {
      return {
        abuseConfidenceScore: 0,
        totalReports: 0,
        numDistinctUsers: 0,
        lastReportedAt: null,
        usageType: 'Private',
        isp: 'Private Network',
        domain: 'localhost',
        countryCode: 'XX',
        isWhitelisted: true,
        categories: [],
        categoryNames: [],
      };
    }

    const apiKey = process.env.ABUSEIPDB_API_KEY;

    // If no API key, return null (feature disabled)
    if (!apiKey) {
      console.log('AbuseIPDB API key not configured - skipping check');
      return null;
    }

    const response = await fetch(
      `https://api.abuseipdb.com/api/v2/check?ipAddress=${ip}&maxAgeInDays=90&verbose`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
        headers: {
          'Key': apiKey,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error(`AbuseIPDB API failed: ${response.status}`);
      return null;
    }

    const result = await response.json();
    const data = result.data;

    // Map category numbers to names
    const categoryMap: { [key: number]: string } = {
      3: 'Fraud Orders',
      4: 'DDoS Attack',
      5: 'FTP Brute-Force',
      6: 'Ping of Death',
      7: 'Phishing',
      8: 'Fraud VoIP',
      9: 'Open Proxy',
      10: 'Web Spam',
      11: 'Email Spam',
      12: 'Blog Spam',
      13: 'VPN IP',
      14: 'Port Scan',
      15: 'Hacking',
      16: 'SQL Injection',
      17: 'Spoofing',
      18: 'Brute-Force',
      19: 'Bad Web Bot',
      20: 'Exploited Host',
      21: 'Web App Attack',
      22: 'SSH',
      23: 'IoT Targeted',
    };

    const categories = data.reports?.map((r: any) => r.categories).flat() || [];
    const uniqueCategories = [...new Set(categories)] as number[];
    const categoryNames = uniqueCategories.map((c) => categoryMap[c] || `Unknown (${c})`);

    return {
      abuseConfidenceScore: data.abuseConfidenceScore || 0,
      totalReports: data.totalReports || 0,
      numDistinctUsers: data.numDistinctUsers || 0,
      lastReportedAt: data.lastReportedAt,
      usageType: data.usageType || 'Unknown',
      isp: data.isp || 'Unknown',
      domain: data.domain || 'Unknown',
      countryCode: data.countryCode || 'XX',
      isWhitelisted: data.isWhitelisted || false,
      categories: uniqueCategories,
      categoryNames,
    };
  } catch (error) {
    console.error('AbuseIPDB error:', error);
    return null;
  }
}

/**
 * Calculate overall risk score based on all OSINT data
 */
export function calculateRiskScore(
  shodan: ShodanData | null,
  abuseipdb: AbuseIPDBData | null
): {
  score: number;
  level: 'Safe' | 'Low' | 'Medium' | 'High' | 'Critical';
  recommendations: string[];
} {
  let score = 0;
  const recommendations: string[] = [];

  // Shodan data scoring
  if (shodan) {
    // Open ports (+5 per port, max 30)
    const portScore = Math.min(shodan.ports.length * 5, 30);
    score += portScore;
    if (shodan.ports.length > 0) {
      recommendations.push(`Close unnecessary ports: ${shodan.ports.join(', ')}`);
    }

    // Vulnerabilities (+15 per vuln, max 40)
    const vulnScore = Math.min(shodan.vulns.length * 15, 40);
    score += vulnScore;
    if (shodan.vulns.length > 0) {
      recommendations.push(`Patch critical vulnerabilities: ${shodan.vulns.length} CVEs found`);
    }

    // Malicious tags (+20 each)
    const maliciousTags = ['malware', 'compromised', 'honeypot', 'scanner'];
    const foundMalicious = shodan.tags.filter(t =>
      maliciousTags.some(mt => t.toLowerCase().includes(mt))
    );
    if (foundMalicious.length > 0) {
      score += 20 * foundMalicious.length;
      recommendations.push(`Address security tags: ${foundMalicious.join(', ')}`);
    }
  }

  // AbuseIPDB scoring
  if (abuseipdb) {
    // Abuse confidence score (0-100, use directly)
    score += abuseipdb.abuseConfidenceScore * 0.3; // Scale down to 30 max

    if (abuseipdb.abuseConfidenceScore > 50) {
      recommendations.push('IP has high abuse confidence score - likely malicious');
    }

    // Total reports (+1 per report, max 20)
    const reportScore = Math.min(abuseipdb.totalReports, 20);
    score += reportScore;

    if (abuseipdb.totalReports > 10) {
      recommendations.push(`IP reported ${abuseipdb.totalReports} times for abuse`);
    }

    // Attack categories
    if (abuseipdb.categoryNames.length > 0) {
      recommendations.push(`Attack types: ${abuseipdb.categoryNames.slice(0, 3).join(', ')}`);
    }
  }

  // Cap at 100
  score = Math.min(100, Math.round(score));

  // Determine risk level
  let level: 'Safe' | 'Low' | 'Medium' | 'High' | 'Critical';
  if (score === 0) level = 'Safe';
  else if (score < 25) level = 'Low';
  else if (score < 50) level = 'Medium';
  else if (score < 75) level = 'High';
  else level = 'Critical';

  // Add general recommendations
  if (score === 0) {
    recommendations.push('No security issues detected in public databases');
  }

  return { score, level, recommendations };
}

/**
 * Get complete OSINT analysis
 */
export async function getOSINTAnalysis(ip: string): Promise<OSINTResult> {
  const [shodan, abuseipdb] = await Promise.all([
    getShodanData(ip),
    getAbuseIPDBData(ip),
  ]);

  const { score, level, recommendations } = calculateRiskScore(shodan, abuseipdb);

  return {
    shodan,
    abuseipdb,
    riskScore: score,
    riskLevel: level,
    recommendations,
  };
}

/**
 * Check if IP is private/local
 */
function isPrivateIP(ip: string): boolean {
  if (!ip || ip === '0.0.0.0' || ip === '::1' || ip.startsWith('127.') ||
      ip.startsWith('10.') || ip.startsWith('192.168.') ||
      ip.startsWith('172.16.') || ip.startsWith('172.17.') ||
      ip.startsWith('172.18.') || ip.startsWith('172.19.') ||
      ip.startsWith('172.20.') || ip.startsWith('172.21.') ||
      ip.startsWith('172.22.') || ip.startsWith('172.23.') ||
      ip.startsWith('172.24.') || ip.startsWith('172.25.') ||
      ip.startsWith('172.26.') || ip.startsWith('172.27.') ||
      ip.startsWith('172.28.') || ip.startsWith('172.29.') ||
      ip.startsWith('172.30.') || ip.startsWith('172.31.')) {
    return true;
  }
  return false;
}
