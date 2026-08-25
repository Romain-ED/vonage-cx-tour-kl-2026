export function CxTourBanner() {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        borderRadius: '20px',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #1a0a2e 0%, #16082a 40%, #0f1629 100%)',
        border: '1.5px solid rgba(139,92,246,0.3)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        padding: '32px 28px',
      }}
    >
      {/* Background pattern */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '180px',
          height: '180px',
          background: 'radial-gradient(circle at 80% 20%, rgba(139,92,246,0.15) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '120px',
          height: '120px',
          background: 'radial-gradient(circle at 20% 80%, rgba(6,182,212,0.1) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      {/* Shield icon + Vonage */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(139,92,246,0.15)',
            border: '1.5px solid rgba(139,92,246,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
          }}
        >
          🛡️
        </div>
        <img
          src="/vonage-logo.png"
          alt="Vonage"
          style={{ height: '16px', width: 'auto', filter: 'brightness(0) invert(1)', opacity: 0.9 }}
        />
      </div>

      {/* Headline */}
      <h2
        style={{
          fontSize: '20px',
          fontWeight: '700',
          color: '#FFFFFF',
          lineHeight: '1.25',
          marginBottom: '6px',
          letterSpacing: '-0.02em',
        }}
      >
        Mobile Identity &<br />Fraud Protection
      </h2>
      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '18px', fontWeight: '500' }}>
        Securing financial services at network level
      </p>

      {/* Product pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '22px' }}>
        {[
          { icon: '🔐', label: 'Silent Auth', color: '#8B5CF6' },
          { icon: '🛡️', label: 'Identity Insights', color: '#06B6D4' },
          { icon: '📞', label: 'Branded Calling', color: '#F97316' },
        ].map((p) => (
          <span
            key={p.label}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '5px 12px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: '600',
              color: 'rgba(255,255,255,0.9)',
              background: `${p.color}18`,
              border: `1px solid ${p.color}45`,
            }}
          >
            <span style={{ fontSize: '12px' }}>{p.icon}</span>
            {p.label}
          </span>
        ))}
      </div>

      {/* Event details */}
      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px' }}>📍</span>
          <span style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.85)' }}>
            Australian Financial Crime Summit
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px' }}>📅</span>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
            1–2 September 2026 · Intercontinental Double Bay, Sydney
          </span>
        </div>
      </div>
    </div>
  );
}
