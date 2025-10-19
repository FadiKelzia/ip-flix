import { getBasicClientInfo, getUserAgentInfo } from '@/lib/getClientInfo';
import ClientInfoDisplay from '@/components/ClientInfoDisplay';
import Link from 'next/link';
import GlassCard from '@/components/GlassCard';

export const runtime = 'edge';

export default async function Home() {
  const basicInfo = await getBasicClientInfo();
  const userAgentInfo = await getUserAgentInfo();

  // Get client-side info (to be hydrated on client)
  const clientData = {
    ...basicInfo,
    browser: userAgentInfo.browser,
    os: userAgentInfo.os,
    device: userAgentInfo.device,
    language: 'en-US', // Will be updated client-side
    screenResolution: '0x0', // Will be updated client-side
  };

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[128px] animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <header className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-gradient">
            Network Information
          </h1>
          <p className="text-white/60 text-lg">
            Instant insights about your connection
          </p>
        </header>

        {/* Client Info Display */}
        <ClientInfoDisplay initialData={clientData as any} />

        {/* Tool Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Privacy Audit Link */}
          <Link href="/privacy">
            <GlassCard hover className="text-center h-full">
              <div className="flex flex-col items-center gap-3 py-2">
                <span className="text-4xl">🔒</span>
                <div>
                  <h3 className="font-semibold text-lg">Privacy Audit</h3>
                  <p className="text-sm text-white/60">
                    Browser fingerprinting & tracking analysis
                  </p>
                </div>
              </div>
            </GlassCard>
          </Link>

          {/* OSINT Intelligence Link */}
          <Link href="/intel">
            <GlassCard hover className="text-center h-full">
              <div className="flex flex-col items-center gap-3 py-2">
                <span className="text-4xl">🔬</span>
                <div>
                  <h3 className="font-semibold text-lg">OSINT Intelligence</h3>
                  <p className="text-sm text-white/60">
                    Exposed services & threat analysis
                  </p>
                </div>
              </div>
            </GlassCard>
          </Link>
        </div>

        {/* Footer */}
        <footer className="text-center mt-16 text-white/40 text-sm">
          <p>
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
