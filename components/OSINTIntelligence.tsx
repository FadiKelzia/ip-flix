'use client';

import { useState } from 'react';
import GlassCard from './GlassCard';
import InfoRow from './InfoRow';
import { OSINTResult } from '@/lib/osint';

interface OSINTIntelligenceProps {
  ip: string;
}

export default function OSINTIntelligence({ ip }: OSINTIntelligenceProps) {
  const [consented, setConsented] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<OSINTResult | null>(null);

  const runScan = async () => {
    setScanning(true);
    try {
      const response = await fetch(`/api/osint?ip=${ip}`);
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('OSINT scan error:', error);
    } finally {
      setScanning(false);
    }
  };

  const handleConsent = () => {
    setConsented(true);
    runScan();
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Safe': return 'text-green-400';
      case 'Low': return 'text-blue-400';
      case 'Medium': return 'text-yellow-400';
      case 'High': return 'text-orange-400';
      case 'Critical': return 'text-red-400';
      default: return 'text-white';
    }
  };

  const getRiskBgColor = (level: string) => {
    switch (level) {
      case 'Safe': return 'bg-green-500/10 border-green-500/20';
      case 'Low': return 'bg-blue-500/10 border-blue-500/20';
      case 'Medium': return 'bg-yellow-500/10 border-yellow-500/20';
      case 'High': return 'bg-orange-500/10 border-orange-500/20';
      case 'Critical': return 'bg-red-500/10 border-red-500/20';
      default: return 'bg-white/10 border-white/20';
    }
  };

  if (!consented) {
    return (
      <GlassCard className="text-center">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="text-6xl">🔬</div>
            <h2 className="text-2xl font-bold">OSINT Intelligence Scan</h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Query external threat intelligence databases to discover what&apos;s publicly
              known about your IP address, including exposed services and abuse reports.
            </p>
          </div>

          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-left space-y-4">
            <h3 className="font-semibold text-red-400 text-lg flex items-center gap-2">
              <span>⚠️</span>
              Important Disclaimer
            </h3>

            <div className="space-y-3 text-sm text-white/80">
              <div>
                <strong className="text-white">What This Scan Does:</strong>
                <ul className="mt-2 space-y-1 list-disc list-inside ml-2">
                  <li>Queries Shodan InternetDB for exposed ports and vulnerabilities</li>
                  <li>Checks AbuseIPDB for malicious activity reports (if API key configured)</li>
                  <li>Analyzes public threat intelligence data</li>
                  <li>Calculates overall security risk score</li>
                </ul>
              </div>

              <div>
                <strong className="text-white">Privacy & Legal Notice:</strong>
                <ul className="mt-2 space-y-1 list-disc list-inside ml-2">
                  <li>Your IP will be logged by third-party databases (Shodan, AbuseIPDB)</li>
                  <li>This action is visible to external security services</li>
                  <li>Data accuracy is not guaranteed</li>
                  <li>For educational and research purposes only</li>
                  <li>Do not use for malicious purposes</li>
                </ul>
              </div>

              <div className="pt-2 border-t border-red-500/20">
                <p className="text-xs text-white/60">
                  By clicking &quot;I Understand&quot;, you acknowledge that you have read and understood
                  this disclaimer, and consent to querying external threat intelligence databases.
                  This tool demonstrates what information is publicly available about IP addresses.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleConsent}
            className="glass-panel glass-panel-hover px-8 py-4 font-semibold text-lg"
          >
            I Understand - Run OSINT Scan
          </button>

          <p className="text-xs text-white/40">
            Target IP: {ip}
          </p>
        </div>
      </GlassCard>
    );
  }

  if (scanning) {
    return (
      <GlassCard className="text-center">
        <div className="space-y-6 py-8">
          <svg className="animate-spin h-16 w-16 mx-auto text-white/60" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <div className="space-y-2">
            <h3 className="text-2xl font-semibold">Running OSINT Scan...</h3>
            <div className="space-y-1 text-sm text-white/60">
              <p>⏳ Querying Shodan InternetDB...</p>
              <p>⏳ Checking AbuseIPDB...</p>
              <p>⏳ Analyzing threat intelligence...</p>
              <p>⏳ Calculating risk score...</p>
            </div>
          </div>
        </div>
      </GlassCard>
    );
  }

  if (!result) {
    return null;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Overall Risk Score */}
      <GlassCard className={getRiskBgColor(result.riskLevel)}>
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Security Risk Assessment</h2>

          {/* Risk Score Gauge */}
          <div className="relative w-32 h-32 mx-auto">
            <svg className="transform -rotate-90 w-32 h-32">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-white/10"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${2 * Math.PI * 56 * (1 - result.riskScore / 100)}`}
                className={getRiskColor(result.riskLevel)}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-3xl font-bold ${getRiskColor(result.riskLevel)}`}>
                {result.riskScore}
              </span>
            </div>
          </div>

          <div>
            <p className={`text-2xl font-semibold ${getRiskColor(result.riskLevel)}`}>
              {result.riskLevel} Risk
            </p>
            <p className="text-white/60 text-sm mt-1">
              Based on public threat intelligence databases
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Recommendations */}
      {result.recommendations.length > 0 && (
        <GlassCard>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="text-2xl">💡</span>
            Security Recommendations
          </h3>
          <div className="space-y-2">
            {result.recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-blue-400">
                <span className="mt-1">•</span>
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Shodan InternetDB Results */}
      {result.shodan && (
        <div className="space-y-6">
          {/* Exposed Services */}
          {result.shodan.ports.length > 0 && (
            <GlassCard>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-2xl">🔓</span>
                Exposed Ports ({result.shodan.ports.length})
              </h3>
              <p className="text-white/60 text-sm mb-4">
                Open ports detected by Shodan InternetDB. These services are publicly accessible:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {result.shodan.ports.map((port) => (
                  <div key={port} className="glass-panel p-3 text-center">
                    <div className="text-2xl font-bold text-red-400">{port}</div>
                    <div className="text-xs text-white/60 mt-1">
                      {getPortName(port)}
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Vulnerabilities */}
          {result.shodan.vulns.length > 0 && (
            <GlassCard className="bg-red-500/10 border-red-500/20">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-red-400">
                <span className="text-2xl">🚨</span>
                Known Vulnerabilities ({result.shodan.vulns.length})
              </h3>
              <p className="text-white/60 text-sm mb-4">
                CVEs (Common Vulnerabilities and Exposures) detected on this IP:
              </p>
              <div className="space-y-2">
                {result.shodan.vulns.map((vuln, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-red-500/5 rounded-xl">
                    <span className="text-red-400 font-mono text-sm">{vuln}</span>
                    <a
                      href={`https://cve.mitre.org/cgi-bin/cvename.cgi?name=${vuln}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:text-blue-300 ml-auto"
                    >
                      View Details →
                    </a>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Tags */}
          {result.shodan.tags.length > 0 && (
            <GlassCard>
              <h3 className="text-xl font-semibold mb-4">Shodan Tags</h3>
              <div className="flex flex-wrap gap-2">
                {result.shodan.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Hostnames */}
          {result.shodan.hostnames.length > 0 && (
            <GlassCard>
              <h3 className="text-xl font-semibold mb-4">Associated Hostnames</h3>
              <div className="space-y-1">
                {result.shodan.hostnames.map((hostname, i) => (
                  <InfoRow key={i} label={`Hostname ${i + 1}`} value={hostname} copyable />
                ))}
              </div>
            </GlassCard>
          )}

          {/* No Shodan Data */}
          {result.shodan.ports.length === 0 &&
           result.shodan.vulns.length === 0 &&
           result.shodan.tags.length === 0 && (
            <GlassCard className="bg-green-500/10 border-green-500/20">
              <div className="text-center py-4">
                <div className="text-4xl mb-2">✓</div>
                <h3 className="text-lg font-semibold text-green-400">No Exposed Services</h3>
                <p className="text-white/60 text-sm mt-2">
                  Shodan InternetDB has no data on this IP. No publicly exposed services detected.
                </p>
              </div>
            </GlassCard>
          )}
        </div>
      )}

      {/* AbuseIPDB Results */}
      {result.abuseipdb && (
        <GlassCard className={result.abuseipdb.abuseConfidenceScore > 50 ? 'bg-red-500/10 border-red-500/20' : ''}>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="text-2xl">🛡️</span>
            Abuse Reports (AbuseIPDB)
          </h3>
          <div className="space-y-1">
            <InfoRow
              label="Abuse Confidence"
              value={`${result.abuseipdb.abuseConfidenceScore}%`}
            />
            <InfoRow
              label="Total Reports"
              value={result.abuseipdb.totalReports.toString()}
            />
            <InfoRow
              label="Distinct Reporters"
              value={result.abuseipdb.numDistinctUsers.toString()}
            />
            {result.abuseipdb.lastReportedAt && (
              <InfoRow
                label="Last Reported"
                value={new Date(result.abuseipdb.lastReportedAt).toLocaleDateString()}
              />
            )}
            <InfoRow
              label="Whitelisted"
              value={result.abuseipdb.isWhitelisted ? 'Yes' : 'No'}
            />
          </div>

          {result.abuseipdb.categoryNames.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-white/60 mb-2">Attack Categories:</h4>
              <div className="flex flex-wrap gap-2">
                {result.abuseipdb.categoryNames.map((cat, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-sm text-red-400"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}
        </GlassCard>
      )}

      {!result.abuseipdb && (
        <GlassCard className="bg-blue-500/10 border-blue-500/20">
          <div className="text-center py-4">
            <div className="text-4xl mb-2">ℹ️</div>
            <h3 className="text-lg font-semibold">AbuseIPDB Check Skipped</h3>
            <p className="text-white/60 text-sm mt-2">
              AbuseIPDB API key not configured. This is optional and requires registration
              at <a href="https://www.abuseipdb.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">abuseipdb.com</a>.
            </p>
          </div>
        </GlassCard>
      )}

      {/* Run Again Button */}
      <button
        onClick={() => {
          setConsented(false);
          setResult(null);
        }}
        className="glass-panel glass-panel-hover px-6 py-3 w-full font-semibold"
      >
        Run OSINT Scan Again
      </button>
    </div>
  );
}

// Helper function to get common port names
function getPortName(port: number): string {
  const ports: { [key: number]: string } = {
    21: 'FTP',
    22: 'SSH',
    23: 'Telnet',
    25: 'SMTP',
    53: 'DNS',
    80: 'HTTP',
    110: 'POP3',
    143: 'IMAP',
    443: 'HTTPS',
    445: 'SMB',
    3306: 'MySQL',
    3389: 'RDP',
    5432: 'PostgreSQL',
    5900: 'VNC',
    6379: 'Redis',
    8080: 'HTTP Alt',
    8443: 'HTTPS Alt',
    27017: 'MongoDB',
  };
  return ports[port] || 'Unknown';
}
