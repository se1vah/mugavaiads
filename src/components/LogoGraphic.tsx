import React, { useState } from 'react';

interface LogoGraphicProps {
  url?: string;
  className?: string;
  size?: number;
}

export const LogoGraphic: React.FC<LogoGraphicProps> = ({ url, className = '', size = 72 }) => {
  const [loadError, setLoadError] = useState(false);

  if (url && !loadError) {
    return (
      <img
        src={url}
        alt="Mugavai Ads Logo"
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
        onError={() => setLoadError(true)}
        className={`object-contain rounded-lg border border-[#d7e2df] bg-white ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  // Fallback high-fidelity brand emblem
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl bg-gradient-to-br from-[#183b36] to-[#0f2925] text-white shadow-sm border border-[#176b5b]/30 p-2 text-center select-none ${className}`}
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
      title="Mugavai Ads"
    >
      <div className="w-6 h-6 rounded-full bg-[#176b5b] flex items-center justify-center mb-1 text-white">
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      </div>
      <span className="text-[10px] font-extrabold uppercase tracking-tight leading-none text-emerald-300">
        MUGAVAI
      </span>
      <span className="text-[8px] font-semibold text-emerald-100 tracking-wider">
        ADS
      </span>
    </div>
  );
};
