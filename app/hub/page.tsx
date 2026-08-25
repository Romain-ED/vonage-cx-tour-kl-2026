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
      { key: 'datasheet', icon: '📄', label: 'Silent Auth Datasheet', href: '#' },
      { key: 'developer-docs', icon: '🔗', label: 'Developer Docs', href: 'https://developer.vonage.com/en/verify/verify-v2/guides/silent-auth' },
    ],
    ii: [
      { key: 'datasheet', icon: '📄', label: 'Identity Insights Datasheet', href: '#' },
      { key: 'developer-docs', icon: '🔗', label: 'Developer Docs', href: 'https://developer.vonage.com/en/number-insight/ni-advanced/overview' },
    ],
    bc: [
      { key: 'datasheet', icon: '📄', label: 'Branded Calling Datasheet', href: '#' },
      { key: 'developer-docs', icon: '🔗', label: 'Developer Docs', href: 'https://developer.vonage.com/en/vonage-branded-calling/overview' },
    ],
  };

  const resources = RESOURCES[activeTab];

  return (
    <main className="mesh-bg min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-3.5 bg-[rgba(8,6,20,0.85)] border-b border-white/[0.08] backdrop-blur-xl">
        <img src="/vonage-logo.png" alt="Vonage" className="h-[18px] w-auto invert" />
        <span className="text-[11px] text-white/50 font-medium">AFC Sydney 2026</span>
      </header>

      <div className="max-w-[720px] mx-auto w-full px-5 pt-8 pb-20">
        {/* Page title */}
        <div className="animate-fade-up mb-7">
          <p className="text-[11px] uppercase tracking-[0.12em] text-[rgba(139,92,246,0.9)] mb-2.5 font-bold">{t(lang, 'eventName')}</p>
          <h1 className="text-[clamp(22px,4vw,34px)] font-bold text-white tracking-tight mb-2">{t(lang, 'hubTitle')}</h1>
          <p className="text-white/75 text-[15px] leading-[1.65]">{t(lang, 'hubSubtitle')}</p>
        </div>

        {/* Tab navigation */}
        <div className="animate-fade-up [animation-delay:60ms] flex gap-1.5 mb-6 bg-white/[0.04] rounded-[14px] p-[5px]">
          {(['sa', 'ii', 'bc'] as Tab[]).map(tab => {
            const cfg = tabConfig[tab];
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex-1 py-3 px-3 rounded-[10px] cursor-pointer text-[13px] font-semibold transition-all flex items-center justify-center gap-1.5"
                style={{
                  border: `1.5px solid ${isActive ? cfg.color + '60' : 'transparent'}`,
                  background: isActive ? `${cfg.color}18` : 'transparent',
                  color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.7)',
                }}
              >
                <span>{cfg.icon}</span>
                <span className="hidden sm:inline">{t(lang, tab === 'sa' ? 'tabSa' : tab === 'ii' ? 'tabIi' : 'tabBc')}</span>
                <span className="sm:hidden">{tab === 'sa' ? 'Silent' : tab === 'ii' ? 'Identity' : 'Branded'}</span>
                {isActive && <div className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.color, boxShadow: `0 0 8px ${cfg.color}` }} />}
              </button>
            );
          })}
        </div>

        {/* Product content */}
        <div className="glass-card animate-fade-up [animation-delay:100ms] p-7 mb-5">
          {/* Product header */}
          <div className="flex items-center gap-3.5 mb-5">
            <div
              className="w-[50px] h-[50px] rounded-[14px] flex items-center justify-center text-2xl shrink-0"
              style={{ background: `${current.color}1A`, border: `1.5px solid ${current.color}40`, boxShadow: `0 0 24px ${current.color}20` }}
            >
              {current.icon}
            </div>
            <div>
              <div className="font-bold text-lg text-white leading-tight">{t(lang, current.titleKey)}</div>
              <div className="text-[13px] font-semibold mt-1" style={{ color: current.color }}>{t(lang, current.taglineKey)}</div>
            </div>
          </div>

          <p className="text-sm text-white/85 leading-[1.7] mb-5">{t(lang, current.descKey)}</p>

          {/* Benefits */}
          <div className="flex flex-col gap-2.5 mb-6">
            {current.benefits.map(b => (
              <div key={b} className="flex items-start gap-3">
                <div
                  className="w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: `${current.color}18`, border: `1.5px solid ${current.color}45` }}
                >
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: current.color }} />
                </div>
                <span className="text-sm text-white/[0.92] leading-relaxed">{t(lang, b)}</span>
              </div>
            ))}
          </div>

          {/* Resources */}
          <div className="border-t border-white/[0.08] pt-5">
            <div className="text-[11px] uppercase tracking-[0.1em] text-white/60 mb-3 font-bold">{t(lang, 'resources')}</div>
            <div className="flex flex-wrap gap-2">
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
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] font-medium text-white/85 no-underline transition-all hover:text-white"
                  style={{ background: `${current.color}14`, border: `1.5px solid ${current.color}35` }}
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
        <div className="glass-card animate-fade-up [animation-delay:140ms] p-7 flex flex-col items-center text-center gap-3.5">
          <div className="text-4xl">💼</div>
          <h3 className="text-lg font-bold text-white">{t(lang, 'meetingTitle')}</h3>
          <p className="text-white/[0.58] text-sm max-w-[360px] leading-[1.65]">{t(lang, 'meetingSubtitle')}</p>
          <button className="btn-orange" onClick={() => router.push('/meeting')}>{t(lang, 'meetingCta')}</button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-3 opacity-35 mt-7">
          <span className="text-[11px] text-white/60">AFC Sydney 2026 · 1–2 September · Intercontinental Double Bay</span>
        </div>
      </div>

      {/* Chat panel */}
      <ChatPanel lang={lang} contactId={contactId} />
    </main>
  );
}
