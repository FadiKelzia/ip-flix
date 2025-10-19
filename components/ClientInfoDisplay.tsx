'use client';

import { useState } from 'react';
import GlassCard from './GlassCard';
import InfoRow from './InfoRow';

interface ClientInfoDisplayProps {
  initialData: {
    ip: string;
    ipVersion: string;
    country: string;
    countryCode: string;
    city: string;
    region: string;
    timezone: string;
    latitude: number;
    longitude: number;
    browser: string;
    os: string;
    device: string;
    language: string;
    screenResolution: string;
  };
}

export default function ClientInfoDisplay({ initialData }: ClientInfoDisplayProps) {
  const [detailedData, setDetailedData] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const loadDetailedInfo = async () => {
    setLoadingDetails(true);
    try {
      const response = await fetch(`/api/ip/details?ip=${initialData.ip}`);
      const data = await response.json();
      setDetailedData(data);
    } catch (error) {
      console.error('Failed to load detailed info:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero IP Display */}
      <GlassCard className="text-center">
        <div className="space-y-2">
          <p className="text-white/60 text-sm uppercase tracking-wide">Your IP Address</p>
          <h1 className="text-5xl font-bold text-gradient">{initialData.ip}</h1>
          <p className="text-white/40 text-sm">{initialData.ipVersion}</p>
        </div>
      </GlassCard>

      {/* Location Info */}
      <GlassCard>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Location
        </h2>
        <div className="space-y-1">
          <InfoRow label="Country" value={`${initialData.country} (${initialData.countryCode})`} />
          <InfoRow label="City" value={initialData.city} />
          <InfoRow label="Region" value={initialData.region} />
          <InfoRow label="Timezone" value={initialData.timezone} />
          <InfoRow label="Coordinates" value={`${initialData.latitude.toFixed(4)}, ${initialData.longitude.toFixed(4)}`} copyable />
        </div>
      </GlassCard>

      {/* Browser & Device Info */}
      <GlassCard>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Browser & Device
        </h2>
        <div className="space-y-1">
          <InfoRow label="Browser" value={initialData.browser} />
          <InfoRow label="Operating System" value={initialData.os} />
          <InfoRow label="Device Type" value={initialData.device} />
          <InfoRow label="Screen Resolution" value={initialData.screenResolution} />
          <InfoRow label="Language" value={initialData.language} />
        </div>
      </GlassCard>

      {/* Detailed Info Toggle */}
      {!detailedData ? (
        <GlassCard hover onClick={loadDetailedInfo}>
          <div className="text-center py-4">
            <div className="flex items-center justify-center gap-2">
              {loadingDetails ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="text-white/80">Loading detailed information...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-white/80">Show Detailed Network Information</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </div>
          </div>
        </GlassCard>
      ) : (
        <div className="space-y-6 animate-slide-up">
          {/* Network Details */}
          <GlassCard>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              Network Details
            </h2>
            <div className="space-y-1">
              <InfoRow label="ISP" value={detailedData.isp} />
              <InfoRow label="Organization" value={detailedData.org} />
              <InfoRow label="ASN" value={detailedData.asn} copyable />
              <InfoRow label="Hostname" value={detailedData.hostname} copyable />
            </div>
          </GlassCard>

          {/* Security Info */}
          {detailedData.security && (
            <GlassCard>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Security Information
              </h2>
              <div className="space-y-1">
                <InfoRow label="VPN Detected" value={detailedData.security.isVpn ? 'Yes' : 'No'} />
                <InfoRow label="Proxy Detected" value={detailedData.security.isProxy ? 'Yes' : 'No'} />
                <InfoRow label="Tor Node" value={detailedData.security.isTor ? 'Yes' : 'No'} />
              </div>
            </GlassCard>
          )}
        </div>
      )}
    </div>
  );
}
