import { ReactNode } from 'react';

interface InfoRowProps {
  label: string;
  value: string | ReactNode;
  icon?: ReactNode;
  copyable?: boolean;
}

export default function InfoRow({ label, value, icon, copyable = false }: InfoRowProps) {
  const handleCopy = async () => {
    if (typeof value === 'string') {
      await navigator.clipboard.writeText(value);
    }
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-3">
        {icon && <div className="text-white/60">{icon}</div>}
        <span className="text-white/60 text-sm">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-white font-medium">{value}</span>
        {copyable && typeof value === 'string' && (
          <button
            onClick={handleCopy}
            className="text-white/40 hover:text-white/80 transition-colors p-1"
            title="Copy to clipboard"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
