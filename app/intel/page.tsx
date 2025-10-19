import { getClientIP } from '@/lib/getClientInfo';
import OSINTIntelligence from '@/components/OSINTIntelligence';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'OSINT Intelligence | TMFlix Network Tools',
  description: 'Open Source Intelligence (OSINT) scan. Discover exposed services, vulnerabilities, and abuse reports from public threat intelligence databases.',
  keywords: ['OSINT', 'threat intelligence', 'exposed ports', 'vulnerabilities', 'IP reputation', 'Shodan', 'AbuseIPDB'],
};

export const runtime = 'edge';

export default async function IntelPage() {
  const ip = await getClientIP();

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-[128px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[128px] animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <header className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-gradient">
            OSINT Intelligence
          </h1>
          <p className="text-white/60 text-lg">
            Open Source threat intelligence analysis
          </p>
        </header>

        {/* OSINT Intelligence Component */}
        <OSINTIntelligence ip={ip} />

        {/* Footer */}
        <footer className="text-center mt-16 space-y-4">
          <div className="glass-panel p-4 text-sm text-white/60">
            <p className="mb-2">
              <strong className="text-white">Data Sources:</strong> Shodan InternetDB (free), AbuseIPDB (optional)
            </p>
            <p>
              This tool queries external threat intelligence databases. Your IP address
              will be logged by third-party services. For educational purposes only.
            </p>
          </div>
          <p className="text-white/40 text-sm">
            <Link
              href="/"
              className="text-white/60 hover:text-white transition-colors"
            >
              ← Back to IP Information
            </Link>
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
