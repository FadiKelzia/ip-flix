import PrivacyAudit from '@/components/PrivacyAudit';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Audit | TMFlix Network Tools',
  description: 'Comprehensive browser privacy audit. Discover what information websites can collect from your browser including fingerprinting, tracking, and privacy leaks.',
  keywords: ['privacy audit', 'browser fingerprinting', 'privacy leak', 'tracking protection', 'browser security'],
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[128px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-[128px] animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <header className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-gradient">
            Browser Privacy Audit
          </h1>
          <p className="text-white/60 text-lg">
            Discover what websites can learn about you
          </p>
        </header>

        {/* Privacy Audit Component */}
        <PrivacyAudit />

        {/* Footer */}
        <footer className="text-center mt-16 space-y-4">
          <div className="glass-panel p-4 text-sm text-white/60">
            <p className="mb-2">
              <strong className="text-white">Educational Purpose:</strong> This tool demonstrates
              what information websites can collect from your browser.
            </p>
            <p>
              All analysis happens locally in your browser. No data is transmitted to our servers.
            </p>
          </div>
          <p className="text-white/40 text-sm">
            <a
              href="/"
              className="text-white/60 hover:text-white transition-colors"
            >
              ← Back to IP Information
            </a>
            {' | '}
            Powered by{' '}
            <a
              href="https://tmflix.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white transition-colors"
            >
              TMFlix
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
