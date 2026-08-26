'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Language, t } from '@/lib/i18n';
import { track } from '@/lib/analytics';
import { ChatPanel } from '@/components/ChatPanel';

type Tab = 'sa' | 'ii' | 'bc';

export default function HubPage() {
  const router = useRouter();
  const lang: Language = 'en';
  const [contactId, setContactId] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('sa');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setContactId(sessionStorage.getItem('contact_id') || '');
    const storedSolutions = sessionStorage.getItem('solutions');
    if (storedSolutions) {
      try {
        const sols: Tab[] = JSON.parse(storedSolutions);
        if (sols.length > 0) setActiveTab(sols[0]);
      } catch { /* ignore */ }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const productMap: Record<Tab, string> = { sa: 'silent_authentication', ii: 'identity_insights', bc: 'branded_calling' };
    track('product_view', { product: productMap[activeTab] });
  }, [activeTab, hydrated]);

  const tabConfig = {
    sa: { color: '#8B5CF6', icon: '🔐', titleKey: 'saTitle' as const, taglineKey: 'saTagline' as const, descKey: 'saDesc' as const, benefits: ['saBenefit1', 'saBenefit2', 'saBenefit3', 'saBenefit4'] as const },
    ii: { color: '#06B6D4', icon: '🛡️', titleKey: 'iiTitle' as const, taglineKey: 'iiTagline' as const, descKey: 'iiDesc' as const, benefits: ['iiBenefit1', 'iiBenefit2', 'iiBenefit3', 'iiBenefit4'] as const },
    bc: { color: '#F97316', icon: '📞', titleKey: 'bcTitle' as const, taglineKey: 'bcTagline' as const, descKey: 'bcDesc' as const, benefits: ['bcBenefit1', 'bcBenefit2', 'bcBenefit3', 'bcBenefit4'] as const },
  };

  const current = tabConfig[activeTab];

  // Placeholder resources — update with real URLs when available
  const RESOURCES: Record<Tab, { key: string; icon: string; label: string; href: string }[]> = {
    sa: [
      { key: 'case-study', icon: '📄', label: 'Silent Auth Case Study', href: '/datasheets/Fintech Case Study - Silent Authentication.pdf' },
      { key: 'verify-datasheet', icon: '📄', label: 'Verify Datasheet', href: '/datasheets/Verify Data Sheet.pdf' },
      { key: 'developer-docs', icon: '🔗', label: 'Developer Docs', href: 'https://developer.vonage.com/en/verify/verify-v2/guides/silent-auth' },
    ],
    ii: [
      { key: 'datasheet', icon: '📄', label: 'Identity Insights Datasheet', href: '/datasheets/Identity Insights Data Sheet.pdf' },
      { key: 'developer-docs', icon: '🔗', label: 'Developer Docs', href: 'https://developer.vonage.com/en/number-insight/ni-advanced/overview' },
    ],
    bc: [
      { key: 'datasheet', icon: '📄', label: 'Own Your Brand Datasheet', href: '/datasheets/Own Your Brand (OYB) Datasheet.pdf' },
      { key: 'developer-docs', icon: '🔗', label: 'Developer Docs', href: 'https://developer.vonage.com/en/vonage-branded-calling/overview' },
    ],
  };

  const resources = RESOURCES[activeTab];

  return (
    <main className="mesh-bg min-h-screen flex flex-col">
      {/* Header removed */}

      <div style={{ maxWidth: '720px', margin: '0 auto', width: '100%', padding: '40px 24px 80px' }}>
        {/* Page title */}
        <div className="animate-fade-up" style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(139,92,246,0.9)', marginBottom: '12px', fontWeight: 700 }}>{t(lang, 'eventName')}</p>
          <h1 style={{ fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em', marginBottom: '10px' }}>{t(lang, 'hubTitle')}</h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '15px', lineHeight: 1.65 }}>{t(lang, 'hubSubtitle')}</p>
        </div>

        {/* Tab navigation */}
        <div className="animate-fade-up [animation-delay:60ms]" style={{ display: 'flex', gap: '6px', marginBottom: '28px', background: 'rgba(255,255,255,0.04)', borderRadius: '14px', padding: '5px' }}>
          {(['sa', 'ii', 'bc'] as Tab[]).map(tab => {
            const cfg = tabConfig[tab];
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  padding: '12px 12px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  border: `1.5px solid ${isActive ? cfg.color + '60' : 'transparent'}`,
                  background: isActive ? `${cfg.color}18` : 'transparent',
                  color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.7)',
                  fontFamily: 'inherit',
                }}
              >
                <span>{cfg.icon}</span>
                <span className="hidden sm:inline">{t(lang, tab === 'sa' ? 'tabSa' : tab === 'ii' ? 'tabIi' : 'tabBc')}</span>
                <span className="sm:hidden">{tab === 'sa' ? 'Verify' : tab === 'ii' ? 'Identity' : 'Branded'}</span>
                {isActive && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: cfg.color, boxShadow: `0 0 8px ${cfg.color}` }} />}
              </button>
            );
          })}
        </div>

        {/* Product content */}
        <div className="glass-card animate-fade-up [animation-delay:100ms]" style={{ padding: '32px', marginBottom: '24px' }}>
          {/* Product header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div
              style={{ width: '50px', height: '50px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0, background: `${current.color}1A`, border: `1.5px solid ${current.color}40`, boxShadow: `0 0 24px ${current.color}20` }}
            >
              {current.icon}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '18px', color: '#FFFFFF', lineHeight: 1.2 }}>{t(lang, current.titleKey)}</div>
              <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '4px', color: current.color }}>{t(lang, current.taglineKey)}</div>
            </div>
          </div>

          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, marginBottom: '24px' }}>{t(lang, current.descKey)}</p>

          {/* Benefits */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
            {current.benefits.map(b => (
              <div key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div
                  style={{ width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px', background: `${current.color}18`, border: `1.5px solid ${current.color}45` }}
                >
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: current.color }} />
                </div>
                <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.92)', lineHeight: 1.6 }}>{t(lang, b)}</span>
              </div>
            ))}
          </div>

          {/* Resources */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.6)', marginBottom: '14px', fontWeight: 700 }}>{t(lang, 'resources')}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {resources.map((r, i) => (
                <a
                  key={i}
                  href={r.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    const productMap: Record<Tab, string> = { sa: 'silent_authentication', ii: 'identity_insights', bc: 'branded_calling' };
                    track('resource_click', { product: productMap[activeTab], resource: r.key });
                  }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.85)', textDecoration: 'none', transition: 'all 0.2s', background: `${current.color}14`, border: `1.5px solid ${current.color}35` }}
                  onMouseEnter={e => { const el = e.currentTarget; el.style.background = `${current.color}28`; el.style.borderColor = `${current.color}60`; }}
                  onMouseLeave={e => { const el = e.currentTarget; el.style.background = `${current.color}14`; el.style.borderColor = `${current.color}35`; }}
                >
                  <span>{r.icon}</span> {r.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Meeting CTA */}
        <div className="glass-card animate-fade-up [animation-delay:140ms]" style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px' }}>
          <div style={{ fontSize: '36px' }}>💼</div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF' }}>{t(lang, 'meetingTitle')}</h3>
          <p style={{ color: 'rgba(255,255,255,0.58)', fontSize: '14px', maxWidth: '360px', lineHeight: 1.65 }}>{t(lang, 'meetingSubtitle')}</p>
          <button className="btn-orange" onClick={() => router.push('/meeting')}>{t(lang, 'meetingCta')}</button>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', opacity: 0.35, marginTop: '32px' }}>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>AFC Sydney 2026 · 1–2 September · Intercontinental Double Bay</span>
        </div>
      </div>

      {/* Chat panel */}
      <ChatPanel lang={lang} contactId={contactId} />
    </main>
  );
}
