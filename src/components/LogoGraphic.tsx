import React, { useState } from 'react';

interface LogoGraphicProps {
  url?: string;
  className?: string;
  size?: number;
}

export const LogoGraphic: React.FC<LogoGraphicProps> = ({ url, className = '', size = 64 }) => {
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
        style={{
          width: `${size}px`,
          height: `${size}px`,
          maxWidth: '100%',
          display: 'block',
          objectFit: 'contain',
          borderRadius: '8px',
          border: '1px solid #d7e2df',
          backgroundColor: '#ffffff',
        }}
      />
    );
  }

  // Fallback high-fidelity brand emblem
  return (
    <div
      className={`select-none ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        minHeight: `${size}px`,
        backgroundColor: '#183b36',
        color: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #176b5b',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '6px',
        textAlign: 'center',
        boxSizing: 'border-box',
      }}
      title="Mugavai Ads"
    >
      <div
        style={{
          width: '24px',
          height: '24px',
          borderRadius: '9999px',
          backgroundColor: '#176b5b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '3px',
          color: '#ffffff',
        }}
      >
        <svg style={{ width: '13px', height: '13px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      </div>
      <span style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', lineHeight: 1, color: '#6ee7b7' }}>
        MUGAVAI
      </span>
      <span style={{ fontSize: '7.5px', fontWeight: 700, color: '#d1fae5', letterSpacing: '0.05em' }}>
        ADS
      </span>
    </div>
  );
};
