'use client';

const SWOOSH_LINES = [
  { color: '#FF6B35', angle: -22, top: '3%',  thick: 2   },
  { color: '#FF4F1F', angle: -18, top: '14%', thick: 2.5 },
  { color: '#E8402A', angle: -25, top: '24%', thick: 1.5 },
  { color: '#FF8C42', angle: -16, top: '35%', thick: 2   },
  { color: '#3B82F6', angle: -21, top: '48%', thick: 1.5 },
  { color: '#93C5FD', angle: -28, top: '59%', thick: 1   },
  { color: '#FF4500', angle: -14, top: '70%', thick: 2   },
  { color: '#FFA040', angle: -24, top: '81%', thick: 1.5 },
  { color: '#FF6B35', angle: -19, top: '91%', thick: 1   },
];

export function CxTourBanner() {
  return (
    <div style={{
      background: '#FAF9F7',
      borderRadius: '20px',
      padding: 'clamp(20px, 4vw, 28px) clamp(20px, 4vw, 32px)',
      position: 'relative',
      overflow: 'hidden',
      width: '100%',
      boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
    }}>

      {/* Swoosh decoration */}
      <div style={{ position: 'absolute', right: 0, top: 0, width: '46%', height: '100%', overflow: 'hidden', pointerEvents: 'none' }}>
        {SWOOSH_LINES.map((line, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: '-60%',
            top: line.top,
            width: '220%',
            height: `${line.thick}px`,
            background: `linear-gradient(90deg, transparent 0%, ${line.color}60 30%, ${line.color} 52%, ${line.color}70 68%, transparent 100%)`,
            transform: `rotate(${line.angle}deg)`,
            borderRadius: '2px',
          }} />
        ))}
        <div style={{
          position: 'absolute', right: 0, top: 0, width: '100%', height: '100%',
          background: 'radial-gradient(ellipse at 85% 50%, rgba(255,90,0,0.07) 0%, transparent 65%)',
        }} />
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* Logos row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
          <img
            src="https://www.genesys.com/wp-content/themes/genesys-kraken/logo/genesys-com-full-color.svg"
            alt="Genesys"
            style={{ height: '20px', width: 'auto' }}
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div style={{ width: '1px', height: '20px', background: '#CBD5E0', flexShrink: 0 }} />
          <img src="/vonage-logo.png" alt="Vonage" style={{ height: '16px', width: 'auto' }} />
        </div>

        {/* CX Tour heading */}
        <div style={{
          fontSize: 'clamp(34px, 7vw, 52px)',
          fontWeight: '800',
          color: '#FF4F1F',
          lineHeight: 1,
          marginBottom: '18px',
          letterSpacing: '-0.02em',
          fontFamily: 'inherit',
        }}>
          CX Tour
        </div>

        {/* Cities */}
        <div style={{ display: 'flex', alignItems: 'stretch', gap: '0' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
              <span style={{ fontSize: '13px' }}>📍</span>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#1B2559' }}>Kuala Lumpur, Malaysia</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '13px' }}>📅</span>
              <span style={{ fontSize: '13px', color: '#4A5568' }}>23 June 2026</span>
            </div>
          </div>
          <div style={{ width: '1px', background: '#E2E8F0', margin: '0 18px', flexShrink: 0 }} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
              <span style={{ fontSize: '13px' }}>📍</span>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#1B2559' }}>Taipei, Taiwan</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '13px' }}>📅</span>
              <span style={{ fontSize: '13px', color: '#4A5568' }}>26 June 2026</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
