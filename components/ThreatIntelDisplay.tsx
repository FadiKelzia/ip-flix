'use client';

import { useEffect, useState } from 'react';
import GlassCard from './GlassCard';
import InfoRow from './InfoRow';
import { ThreatIntelligence, ASNDetails } from '@/lib/types';

interface ThreatIntelDisplayProps {
  ip: string;
}

export default function ThreatIntelDisplay({ ip }: ThreatIntelDisplayProps) {
  const [data, setData] = useState<{
    threat: ThreatIntelligence | null;
    asn: ASNDetails | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadThreatData() {
      try {
        const response = await fetch(`/api/ip/threat?ip=${ip}`);
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Failed to load threat intelligence:', error);
      } finally {
        setLoading(false);
      }
    }

    loadThreatData();
  }, [ip]);

  if (loading) {
    return (
      <GlassCard>
        <div className="text-center py-8">
          <svg className="animate-spin h-8 w-8 mx-auto text-white/60" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-white/60 mt-2">Loading threat intelligence...</p>
        </div>
      </GlassCard>
    );
  }

  if (!data || !data.threat) {
    return null;
  }

  const { threat, asn } = data;

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'Safe': return 'text-green-400';
      case 'Low': return 'text-blue-400';
      case 'Medium': return 'text-yellow-400';
      case 'High': return 'text-orange-400';
      case 'Critical': return 'text-red-400';
      default: return 'text-white';
    }
  };

  const getThreatBgColor = (level: string) => {
    switch (level) {
      case 'Safe': return 'from-green-500/20';
      case 'Low': return 'from-blue-500/20';
      case 'Medium': return 'from-yellow-500/20';
      case 'High': return 'from-orange-500/20';
      case 'Critical': return 'from-red-500/20';
      default: return 'from-white/20';
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Threat Score */}
      <GlassCard>
        <div className="text-center space-y-4">
          <h3 className="text-xl font-semibold">Threat Intelligence</h3>

          {/* Threat Score Gauge */}
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
                strokeDashoffset={`${2 * Math.PI * 56 * (1 - threat.threatScore / 100)}`}
                className={getThreatColor(threat.threatLevel)}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-bold ${getThreatColor(threat.threatLevel)}`}>
                {threat.threatScore}
              </span>
              <span className="text-xs text-white/60">/ 100</span>
            </div>
          </div>

          <div>
            <p className={`text-2xl font-semibold ${getThreatColor(threat.threatLevel)}`}>
              {threat.threatLevel}
            </p>
            <p className="text-white/60 text-sm mt-1">Threat Level</p>
          </div>
        </div>
      </GlassCard>

      {/* Threat Indicators */}
      {threat.risks.length > 0 && (
        <GlassCard>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="text-2xl">🚨</span>
            Threat Indicators
          </h3>
          <div className="space-y-2">
            {threat.risks.map((risk, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-red-400">
                <span className="mt-1">⚠️</span>
                <span>{risk}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Privacy & Anonymization */}
      <GlassCard>
        <h3 className="text-xl font-semibold mb-4">Privacy & Anonymization</h3>
        <div className="space-y-1">
          <InfoRow
            label="VPN Detected"
            value={threat.isVpn ? '⚠️ Yes' : '✓ No'}
          />
          <InfoRow
            label="Proxy Detected"
            value={threat.isProxy ? '⚠️ Yes' : '✓ No'}
          />
          <InfoRow
            label="Tor Exit Node"
            value={threat.isTor ? '⚠️ Yes' : '✓ No'}
          />
          <InfoRow
            label="Network Relay"
            value={threat.isRelay ? '⚠️ Yes' : '✓ No'}
          />
        </div>
      </GlassCard>

      {/* Hosting & Infrastructure */}
      <GlassCard>
        <h3 className="text-xl font-semibold mb-4">Hosting & Infrastructure</h3>
        <div className="space-y-1">
          <InfoRow
            label="Hosting Provider"
            value={threat.isHosting ? 'Yes' : 'No'}
          />
          <InfoRow
            label="Cloud Provider"
            value={threat.isCloudProvider ? 'Yes' : 'No'}
          />
          <InfoRow
            label="Usage Type"
            value={threat.usageType || 'Unknown'}
          />
          {threat.companyName && (
            <InfoRow
              label="Company"
              value={threat.companyName}
            />
          )}
          {threat.companyDomain && (
            <InfoRow
              label="Company Domain"
              value={threat.companyDomain}
              copyable
            />
          )}
        </div>
      </GlassCard>

      {/* ASN Details */}
      {asn && (
        <GlassCard>
          <h3 className="text-xl font-semibold mb-4">ASN Details</h3>
          <div className="space-y-1">
            <InfoRow label="ASN" value={asn.asn} copyable />
            <InfoRow label="Organization" value={asn.name} />
            <InfoRow label="Domain" value={asn.domain} copyable />
            <InfoRow label="Route" value={asn.route} />
            <InfoRow label="Type" value={asn.type} />
            <InfoRow label="Country" value={asn.country} />
          </div>
        </GlassCard>
      )}

      {/* Bot Detection */}
      {threat.isBot && (
        <GlassCard className="bg-red-500/10 border-red-500/20">
          <div className="flex items-start gap-3">
            <span className="text-3xl">🤖</span>
            <div>
              <h3 className="text-xl font-semibold text-red-400">Bot Detected</h3>
              <p className="text-white/60 text-sm mt-1">
                This connection appears to be automated or from a bot.
              </p>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
