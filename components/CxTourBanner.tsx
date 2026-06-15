'use client';

export function CxTourBanner() {
  return (
    <div style={{
      borderRadius: '16px',
      overflow: 'hidden',
      width: '100%',
      boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
    }}>
      <img
        src="/cx-tour-banner.png"
        alt="Genesys × Vonage CX Tour — Kuala Lumpur 23 June & Taipei 26 June 2026"
        style={{ width: '100%', height: 'auto', display: 'block' }}
      />
    </div>
  );
}
