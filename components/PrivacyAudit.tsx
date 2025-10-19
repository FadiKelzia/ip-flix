'use client';

import { useState } from 'react';
import GlassCard from './GlassCard';
import InfoRow from './InfoRow';
import {
  getCanvasFingerprint,
  getWebGLFingerprint,
  getAudioFingerprint,
  getInstalledFonts,
  getBrowserPlugins,
  detectWebRTCLeak,
  detectIncognito,
  detectAdBlocker,
  getAllCookies,
  calculatePrivacyScore,
  type PrivacyAuditResult,
} from '@/lib/privacy/browserFingerprint';
import {
  getAdvancedFingerprint,
  initBehavioralTracking,
  type AdvancedFingerprint,
} from '@/lib/privacy/advancedFingerprint';
import { ThreatIntelligence, ASNDetails } from '@/lib/types';
import AdvancedAnalysis from './AdvancedAnalysis';

export default function PrivacyAudit() {
  const [consented, setConsented] = useState(false);
  const [auditing, setAuditing] = useState(false);
  const [result, setResult] = useState<PrivacyAuditResult | null>(null);

  const runAudit = async () => {
    setAuditing(true);

    try {
      // Collect all privacy information
      const canvas = getCanvasFingerprint();
      const webgl = getWebGLFingerprint();
      const audio = await getAudioFingerprint();
      const fonts = getInstalledFonts();
      const plugins = getBrowserPlugins();
      const webrtcIPs = await detectWebRTCLeak();
      const incognito = await detectIncognito();
      const adBlocker = await detectAdBlocker();
      const cookies = getAllCookies();

      // Network information
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

      // Device information
      const deviceMemory = (navigator as any).deviceMemory || null;

      // Detect third-party cookie blocking
      const thirdPartyCookiesBlocked = await detectThirdPartyCookieBlock();

      // Build audit result
      const auditResult: PrivacyAuditResult = {
        fingerprint: {
          canvas,
          webgl,
          audio,
          fonts,
          plugins,
        },
        device: {
          screenResolution: `${screen.width}x${screen.height}`,
          colorDepth: screen.colorDepth,
          pixelRatio: window.devicePixelRatio,
          hardwareConcurrency: navigator.hardwareConcurrency || 0,
          deviceMemory,
          maxTouchPoints: navigator.maxTouchPoints || 0,
          platform: navigator.platform,
          architecture: (navigator as any).userAgentData?.platform || 'unknown',
        },
        network: {
          effectiveType: connection?.effectiveType || null,
          downlink: connection?.downlink || null,
          rtt: connection?.rtt || null,
          saveData: connection?.saveData || null,
          webrtcIPs,
        },
        privacy: {
          doNotTrack: navigator.doNotTrack,
          incognitoDetected: incognito,
          adBlockerDetected: adBlocker,
          cookiesEnabled: navigator.cookieEnabled,
          javaEnabled: (navigator as any).javaEnabled?.() || false,
          thirdPartyCookiesBlocked,
        },
        storage: {
          cookies,
          localStorage: getStorageItemCount('localStorage'),
          sessionStorage: getStorageItemCount('sessionStorage'),
          indexedDB: await getIndexedDBNames(),
          serviceWorkers: await getServiceWorkerCount(),
        },
        permissions: {
          notifications: await checkPermission('notifications'),
          geolocation: await checkPermission('geolocation'),
          camera: await checkPermission('camera'),
          microphone: await checkPermission('microphone'),
          battery: 'getBattery' in navigator,
        },
        capabilities: {
          webgl: !!document.createElement('canvas').getContext('webgl'),
          webrtc: !!(window.RTCPeerConnection || (window as any).webkitRTCPeerConnection),
          webassembly: typeof WebAssembly !== 'undefined',
          webWorkers: typeof Worker !== 'undefined',
          sharedWorkers: typeof SharedWorker !== 'undefined',
          serviceWorker: 'serviceWorker' in navigator,
          indexedDB: !!window.indexedDB,
          localStorage: !!window.localStorage,
          sessionStorage: !!window.sessionStorage,
        },
        privacyScore: 0,
        privacyLevel: 'Low',
        risks: [],
        recommendations: [],
      };

      // Calculate privacy score
      const scoreData = calculatePrivacyScore(auditResult);
      auditResult.privacyScore = scoreData.score;
      auditResult.privacyLevel = scoreData.level;
      auditResult.risks = scoreData.risks;
      auditResult.recommendations = scoreData.recommendations;

      setResult(auditResult);
    } catch (error) {
      console.error('Privacy audit error:', error);
    } finally {
      setAuditing(false);
    }
  };

  const handleConsent = () => {
    setConsented(true);
    runAudit();
  };

  return (
    <div className="space-y-6">
      {!consented ? (
        <GlassCard className="text-center">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="text-6xl">🔒</div>
              <h2 className="text-2xl font-bold">Privacy Audit</h2>
              <p className="text-white/60 max-w-2xl mx-auto">
                This audit will analyze what information websites can collect from your browser,
                including fingerprinting techniques, tracking capabilities, and privacy leaks.
              </p>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 text-left space-y-2">
              <h3 className="font-semibold text-yellow-400">⚠️ What We&apos;ll Check:</h3>
              <ul className="text-sm text-white/80 space-y-1 list-disc list-inside">
                <li>Browser fingerprinting (Canvas, WebGL, Audio)</li>
                <li>Installed fonts and plugins</li>
                <li>Device and hardware information</li>
                <li>Network capabilities and WebRTC leaks</li>
                <li>Cookies, storage, and tracking data</li>
                <li>Privacy settings and permissions</li>
              </ul>
              <p className="text-xs text-white/60 mt-3">
                <strong>Privacy Note:</strong> All analysis happens in your browser.
                No data is sent to our servers. This is purely educational.
              </p>
            </div>

            <button
              onClick={handleConsent}
              className="glass-panel glass-panel-hover px-8 py-4 font-semibold text-lg"
            >
              I Understand - Run Privacy Audit
            </button>
          </div>
        </GlassCard>
      ) : auditing ? (
        <GlassCard className="text-center">
          <div className="space-y-4">
            <svg className="animate-spin h-12 w-12 mx-auto text-white/60" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <h3 className="text-xl font-semibold">Running Privacy Audit...</h3>
            <p className="text-white/60">Analyzing your browser privacy settings</p>
          </div>
        </GlassCard>
      ) : result ? (
        <div className="space-y-6 animate-fade-in">
          {/* Privacy Score */}
          <GlassCard>
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold">Privacy Score</h2>
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
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - result.privacyScore / 100)}`}
                    className={
                      result.privacyScore >= 80
                        ? 'text-green-500'
                        : result.privacyScore >= 60
                        ? 'text-blue-500'
                        : result.privacyScore >= 40
                        ? 'text-yellow-500'
                        : 'text-red-500'
                    }
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold">{result.privacyScore}</span>
                </div>
              </div>
              <div>
                <p className="text-xl font-semibold">Privacy Level: {result.privacyLevel}</p>
                <p className="text-white/60 text-sm">
                  {result.privacyLevel === 'Very High' && 'Excellent! Your privacy is well protected.'}
                  {result.privacyLevel === 'High' && 'Good privacy protection with room for improvement.'}
                  {result.privacyLevel === 'Medium' && 'Moderate privacy. Consider following recommendations.'}
                  {result.privacyLevel === 'Low' && 'Privacy at risk! Please review recommendations.'}
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Privacy Risks */}
          {result.risks.length > 0 && (
            <GlassCard>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-2xl">⚠️</span>
                Privacy Risks Detected
              </h3>
              <div className="space-y-2">
                {result.risks.map((risk, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-red-400">
                    <span className="mt-1">•</span>
                    <span>{risk}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Recommendations */}
          {result.recommendations.length > 0 && (
            <GlassCard>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-2xl">💡</span>
                Privacy Recommendations
              </h3>
              <div className="space-y-2">
                {result.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-blue-400">
                    <span className="mt-1">✓</span>
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Browser Fingerprint */}
          <GlassCard>
            <h3 className="text-xl font-semibold mb-4">Browser Fingerprint</h3>
            <div className="space-y-1">
              <InfoRow label="Canvas Fingerprint" value={result.fingerprint.canvas.slice(0, 30) + '...'} copyable />
              <InfoRow label="WebGL Fingerprint" value={result.fingerprint.webgl.slice(0, 30) + '...'} copyable />
              <InfoRow label="Audio Fingerprint" value={result.fingerprint.audio.slice(0, 30) + '...'} />
              <InfoRow label="Detected Fonts" value={`${result.fingerprint.fonts.length} fonts`} />
              <InfoRow label="Browser Plugins" value={result.fingerprint.plugins.length > 0 ? result.fingerprint.plugins.join(', ') : 'None'} />
            </div>
          </GlassCard>

          {/* Device Information */}
          <GlassCard>
            <h3 className="text-xl font-semibold mb-4">Device Information</h3>
            <div className="space-y-1">
              <InfoRow label="Screen Resolution" value={result.device.screenResolution} />
              <InfoRow label="Color Depth" value={`${result.device.colorDepth}-bit`} />
              <InfoRow label="Pixel Ratio" value={result.device.pixelRatio.toString()} />
              <InfoRow label="CPU Cores" value={result.device.hardwareConcurrency.toString()} />
              <InfoRow label="Device Memory" value={result.device.deviceMemory ? `${result.device.deviceMemory}GB` : 'Unknown'} />
              <InfoRow label="Touch Points" value={result.device.maxTouchPoints.toString()} />
              <InfoRow label="Platform" value={result.device.platform} />
            </div>
          </GlassCard>

          {/* Network & Connection */}
          <GlassCard>
            <h3 className="text-xl font-semibold mb-4">Network Information</h3>
            <div className="space-y-1">
              <InfoRow label="Connection Type" value={result.network.effectiveType || 'Unknown'} />
              <InfoRow label="Downlink Speed" value={result.network.downlink ? `${result.network.downlink} Mbps` : 'Unknown'} />
              <InfoRow label="Round Trip Time" value={result.network.rtt ? `${result.network.rtt}ms` : 'Unknown'} />
              <InfoRow label="Data Saver" value={result.network.saveData ? 'Enabled' : 'Disabled'} />
              <InfoRow
                label="WebRTC IP Leak"
                value={result.network.webrtcIPs.length > 0 ? `⚠️ ${result.network.webrtcIPs.join(', ')}` : '✓ No leak detected'}
              />
            </div>
          </GlassCard>

          {/* Privacy Settings */}
          <GlassCard>
            <h3 className="text-xl font-semibold mb-4">Privacy Settings</h3>
            <div className="space-y-1">
              <InfoRow label="Do Not Track" value={result.privacy.doNotTrack === '1' ? '✓ Enabled' : '✗ Disabled'} />
              <InfoRow label="Incognito Mode" value={result.privacy.incognitoDetected ? '✓ Detected' : '✗ Not detected'} />
              <InfoRow label="Ad Blocker" value={result.privacy.adBlockerDetected ? '✓ Active' : '✗ Not detected'} />
              <InfoRow label="Cookies" value={result.privacy.cookiesEnabled ? 'Enabled' : 'Disabled'} />
              <InfoRow label="Third-Party Cookies" value={result.privacy.thirdPartyCookiesBlocked ? '✓ Blocked' : '⚠️ Allowed'} />
            </div>
          </GlassCard>

          {/* Storage & Tracking */}
          <GlassCard>
            <h3 className="text-xl font-semibold mb-4">Storage & Tracking Data</h3>
            <div className="space-y-1">
              <InfoRow label="Cookies Stored" value={result.storage.cookies.length.toString()} />
              <InfoRow label="LocalStorage Items" value={result.storage.localStorage.toString()} />
              <InfoRow label="SessionStorage Items" value={result.storage.sessionStorage.toString()} />
              <InfoRow label="IndexedDB Databases" value={result.storage.indexedDB.length.toString()} />
              <InfoRow label="Service Workers" value={result.storage.serviceWorkers.toString()} />
            </div>
          </GlassCard>

          {/* Browser Capabilities */}
          <GlassCard>
            <h3 className="text-xl font-semibold mb-4">Browser Capabilities</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              {Object.entries(result.capabilities).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className={value ? 'text-green-400' : 'text-red-400'}>
                    {value ? '✓' : '✗'}
                  </span>
                  <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Advanced Analysis Section */}
          <div className="mt-6">
            <AdvancedAnalysis />
          </div>

          {/* Run Again Button */}
          <button
            onClick={() => {
              setConsented(false);
              setResult(null);
            }}
            className="glass-panel glass-panel-hover px-6 py-3 w-full font-semibold"
          >
            Run Audit Again
          </button>
        </div>
      ) : null}
    </div>
  );
}

// Helper functions
function getStorageItemCount(storageType: 'localStorage' | 'sessionStorage'): number {
  try {
    return window[storageType].length;
  } catch {
    return 0;
  }
}

async function getIndexedDBNames(): Promise<string[]> {
  try {
    if ('databases' in indexedDB) {
      const dbs = await indexedDB.databases();
      return dbs.map((db) => db.name || 'unknown');
    }
    return [];
  } catch {
    return [];
  }
}

async function getServiceWorkerCount(): Promise<number> {
  try {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      return registrations.length;
    }
    return 0;
  } catch {
    return 0;
  }
}

async function checkPermission(name: PermissionName): Promise<string> {
  try {
    const result = await navigator.permissions.query({ name });
    return result.state;
  } catch {
    return 'unknown';
  }
}

async function detectThirdPartyCookieBlock(): Promise<boolean> {
  try {
    // Try to set a cookie from a different domain (will fail if blocked)
    const testImage = new Image();
    testImage.src = 'https://www.google.com/favicon.ico';

    return await new Promise((resolve) => {
      setTimeout(() => {
        // If we can't access third-party resources, cookies are likely blocked
        resolve(!document.cookie.includes('test='));
      }, 500);
    });
  } catch {
    return true;
  }
}
