export function CxTourBanner() {
  return (
    <div
      style={{
        width: '100%',
        borderRadius: '16px',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #1a0a2e 0%, #0f1629 100%)',
        border: '1.5px solid rgba(139,92,246,0.25)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
      }}
    >
      {/* Left: Event info */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{ fontSize: '14px' }}>📍</span>
          <span style={{ fontSize: '13px', fontWeight: '700', color: 'rgba(255,255,255,0.9)' }}>
            Australian Financial Crime Summit
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ fontSize: '14px' }}>📅</span>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: '500' }}>
            1–2 September 2026
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '14px' }}>🏨</span>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: '500' }}>
            Intercontinental Double Bay, Sydney
          </span>
        </div>
      </div>

      {/* Right: Vonage logo */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <img
          src="/vonage-logo.png"
          alt="Vonage"
          style={{ height: '18px', width: 'auto', filter: 'brightness(0) invert(1)', opacity: 0.85 }}
        />
        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: '500' }}>
          Part of Ericsson
        </span>
      </div>
    </div>
  );
}
