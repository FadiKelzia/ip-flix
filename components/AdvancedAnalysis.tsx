'use client';

import { useState, useEffect } from 'react';
import GlassCard from './GlassCard';
import InfoRow from './InfoRow';
import {
  getAdvancedFingerprint,
  initBehavioralTracking,
  type AdvancedFingerprint,
} from '@/lib/privacy/advancedFingerprint';

export default function AdvancedAnalysis() {
  const [consented, setConsented] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AdvancedFingerprint | null>(null);

  useEffect(() => {
    // Initialize behavioral tracking on mount
    initBehavioralTracking();
  }, []);

  const runAnalysis = async () => {
    setAnalyzing(true);
    try {
      const data = await getAdvancedFingerprint();
      setResult(data);
    } catch (error) {
      console.error('Advanced analysis error:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleConsent = () => {
    setConsented(true);
    runAnalysis();
  };

  const getTrustColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-blue-400';
    if (score >= 40) return 'text-yellow-400';
    if (score >= 20) return 'text-orange-400';
    return 'text-red-400';
  };

  const getBotColor = (score: number) => {
    if (score >= 75) return 'text-red-400';
    if (score >= 50) return 'text-orange-400';
    if (score >= 25) return 'text-yellow-400';
    return 'text-green-400';
  };

  if (!consented) {
    return (
      <GlassCard hover onClick={handleConsent}>
        <div className="text-center py-4">
          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl">🔬</span>
            <div className="text-left">
              <h3 className="font-semibold text-lg">Advanced Analysis</h3>
              <p className="text-sm text-white/60">
                Deep fingerprinting with lie detection & bot analysis
              </p>
            </div>
            <svg className="w-5 h-5 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </GlassCard>
    );
  }

  if (analyzing) {
    return (
      <GlassCard className="text-center">
        <div className="space-y-4 py-4">
          <svg className="animate-spin h-12 w-12 mx-auto text-white/60" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <h3 className="text-xl font-semibold">Running Advanced Analysis...</h3>
          <p className="text-white/60">Detecting lies, bots, and advanced fingerprints</p>
        </div>
      </GlassCard>
    );
  }

  if (!result) {
    return null;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Trust & Bot Scores Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Trust Score */}
        <GlassCard>
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold text-white/80">Browser Trust Score</h3>
            <div className="relative w-24 h-24 mx-auto">
              <svg className="transform -rotate-90 w-24 h-24">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="transparent"
                  className="text-white/10"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - result.lies.trustScore / 100)}`}
                  className={getTrustColor(result.lies.trustScore)}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-2xl font-bold ${getTrustColor(result.lies.trustScore)}`}>
                  {result.lies.trustScore}
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-white/60">
                {result.lies.trustScore >= 80 && 'Highly trustworthy browser'}
                {result.lies.trustScore >= 60 && result.lies.trustScore < 80 && 'Generally trustworthy'}
                {result.lies.trustScore >= 40 && result.lies.trustScore < 60 && 'Moderate trust level'}
                {result.lies.trustScore >= 20 && result.lies.trustScore < 40 && 'Low trust - tampering detected'}
                {result.lies.trustScore < 20 && 'Very low trust - likely spoofed'}
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Bot Score */}
        <GlassCard>
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold text-white/80">Bot Detection Score</h3>
            <div className="relative w-24 h-24 mx-auto">
              <svg className="transform -rotate-90 w-24 h-24">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="transparent"
                  className="text-white/10"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - result.bot.botScore / 100)}`}
                  className={getBotColor(result.bot.botScore)}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-2xl font-bold ${getBotColor(result.bot.botScore)}`}>
                  {result.bot.botScore}
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-white/60">
                {result.bot.isBot ? '🤖 Bot/Automation Detected' : '✓ Likely Human User'}
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Lie Detection Results */}
      {result.lies.detected && (
        <GlassCard className="bg-yellow-500/10 border-yellow-500/20">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="text-2xl">🕵️</span>
            Browser Lies Detected ({result.lies.count})
          </h3>
          <p className="text-white/60 text-sm mb-4">
            Your browser is reporting inconsistent information, which suggests tampering or spoofing:
          </p>
          <div className="space-y-2">
            {result.lies.details.map((lie, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-yellow-400">
                <span className="mt-1">⚠️</span>
                <span>{lie}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Bot Detection Results */}
      {result.bot.indicators.length > 0 && (
        <GlassCard className={result.bot.isBot ? 'bg-red-500/10 border-red-500/20' : 'bg-blue-500/10 border-blue-500/20'}>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="text-2xl">{result.bot.isBot ? '🤖' : '🔍'}</span>
            {result.bot.isBot ? 'Bot/Automation Detected' : 'Bot Detection Indicators'}
          </h3>
          <p className="text-white/60 text-sm mb-4">
            {result.bot.isBot
              ? 'Multiple indicators suggest this is an automated browser or bot:'
              : 'Some automation indicators detected, but likely a human user:'}
          </p>
          <div className="space-y-2">
            {result.bot.indicators.map((indicator, i) => (
              <div key={i} className={`flex items-start gap-2 text-sm ${result.bot.isBot ? 'text-red-400' : 'text-blue-400'}`}>
                <span className="mt-1">{result.bot.isBot ? '⚠️' : '•'}</span>
                <span>{indicator}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Advanced Hardware */}
      <GlassCard>
        <h3 className="text-xl font-semibold mb-4">Advanced Hardware Profile</h3>
        <div className="space-y-1">
          <InfoRow label="GPU Vendor" value={result.hardware.gpuVendor} />
          <InfoRow label="GPU Renderer" value={result.hardware.gpuRenderer} copyable />
          <InfoRow label="CPU Cores" value={result.hardware.cores.toString()} />
          <InfoRow label="Device Memory" value={result.hardware.memory ? `${result.hardware.memory}GB` : 'Unknown'} />
          <InfoRow label="Platform" value={result.hardware.architecture} />
          {result.hardware.batteryLevel !== null && (
            <>
              <InfoRow
                label="Battery Level"
                value={`${result.hardware.batteryLevel}%`}
              />
              <InfoRow
                label="Battery Charging"
                value={result.hardware.batteryCharging ? 'Yes' : 'No'}
              />
            </>
          )}
        </div>
      </GlassCard>

      {/* Speech & Media */}
      <GlassCard>
        <h3 className="text-xl font-semibold mb-4">Speech & Media Devices</h3>
        <div className="space-y-1">
          <InfoRow label="Speech Voices" value={result.media.voices.toString()} />
          <InfoRow label="Cameras" value={result.media.cameras.toString()} />
          <InfoRow label="Microphones" value={result.media.microphones.toString()} />
          <InfoRow label="Speakers" value={result.media.speakers.toString()} />
          {result.media.voiceNames.length > 0 && (
            <div className="mt-3">
              <p className="text-sm text-white/60 mb-2">Available Voices:</p>
              <div className="text-xs text-white/40 space-y-1">
                {result.media.voiceNames.map((voice, i) => (
                  <div key={i}>• {voice}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Advanced Browser APIs */}
      <GlassCard>
        <h3 className="text-xl font-semibold mb-4">Browser API Fingerprint</h3>
        <div className="space-y-1">
          <InfoRow label="Timezone" value={result.apis.timezoneName} />
          <InfoRow label="Math Precision" value={result.apis.mathPrecision} copyable />
          <InfoRow label="Error Stack Format" value={result.apis.errorStackFormat} />
          <InfoRow label="Performance Entries" value={result.apis.performanceEntries.toString()} />
          {result.apis.clientHints && (
            <>
              <InfoRow
                label="Platform"
                value={result.apis.clientHints.platform || 'Unknown'}
              />
              {result.apis.clientHints.architecture && (
                <InfoRow
                  label="Architecture"
                  value={result.apis.clientHints.architecture}
                />
              )}
            </>
          )}
        </div>
      </GlassCard>

      {/* Behavioral Indicators */}
      <GlassCard>
        <h3 className="text-xl font-semibold mb-4">Behavioral Analysis</h3>
        <div className="space-y-1">
          <InfoRow
            label="Mouse Movement"
            value={result.behavioral.mouseMovement ? '✓ Detected' : '✗ Not detected'}
          />
          <InfoRow
            label="Keyboard Input"
            value={result.behavioral.keyboardDetected ? '✓ Detected' : '✗ Not detected'}
          />
          <InfoRow
            label="Touch Input"
            value={result.behavioral.touchDetected ? '✓ Detected' : '✗ Not detected'}
          />
          <InfoRow
            label="Automation Tools"
            value={result.behavioral.automationDetected ? '⚠️ Detected' : '✓ Not detected'}
          />
        </div>
        <div className="mt-4 p-3 bg-blue-500/10 rounded-xl">
          <p className="text-xs text-white/60">
            <strong>Note:</strong> Behavioral tracking happens in real-time. Move your mouse,
            type on keyboard, or touch the screen to update these indicators.
          </p>
        </div>
      </GlassCard>

      {/* Run Again Button */}
      <button
        onClick={() => {
          setConsented(false);
          setResult(null);
        }}
        className="glass-panel glass-panel-hover px-6 py-3 w-full font-semibold"
      >
        Run Analysis Again
      </button>
    </div>
  );
}
