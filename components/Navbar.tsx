'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'IP Info', icon: '🌐' },
    { href: '/privacy', label: 'Privacy Audit', icon: '🔒' },
    { href: '/intel', label: 'OSINT Intel', icon: '🔍' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4">
      <div className="max-w-6xl mx-auto">
        <div className="glass-panel px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="text-2xl transition-transform group-hover:scale-110">
              🌐
            </div>
            <div className="flex flex-col">
              <span className="text-white font-semibold text-lg leading-none">
                IPFlix
              </span>
              <span className="text-white/50 text-xs leading-none">
                Network Tools
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    px-4 py-2 rounded-xl transition-all duration-300
                    flex items-center gap-2 text-sm font-medium
                    ${
                      isActive
                        ? 'bg-white/20 text-white shadow-lg'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }
                  `}
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
