'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Language, languageNames, t } from '@/lib/i18n';
import { track } from '@/lib/analytics';

interface Message { role: 'user' | 'assistant'; content: string; }
const MAX_TURNS = 5;

type Tab = 'bc' | 'na';

const RESOURCES = {
  bc: {
    en: [
      { icon: '📄', label: 'Datasheet', href: 'https://drive.google.com/file/d/1bhSK1xuSSb9eB-o-n9k7R42aeG9-G08E/view?usp=sharing' },
      { icon: '▶️', label: 'Demo – Calling & Messaging', href: 'https://drive.google.com/file/d/1CpmhXTISYLYrAlVw5iW-8UTFTdkYwknU/view' },
      { icon: '▶️', label: 'Demo – Messaging / RCS', href: 'https://drive.google.com/file/d/1nOReVatlkkSmZeeoWdPiVzn_hGnjffT-/view?usp=drive_link' },
      { icon: '🏪', label: 'Genesys AppFoundry', href: 'https://appfoundry.genesys.com/filter/genesyscloud/listing/3c11487b-ea0e-4ecc-acd7-6ffd11faf8b6' },
    ],
    zh: [
      { icon: '📄', label: '数据表', href: 'https://drive.google.com/file/d/1H284uKc1dp9agEdW1Fleg3zzLb4OcOJL/view?usp=sharing' },
      { icon: '▶️', label: '演示 – 通话与消息', href: 'https://drive.google.com/file/d/1vPGpSc9qlWOgjoe-K9d_EkX5uzIzzlS9/view?usp=sharing' },
      { icon: '▶️', label: '演示 – 消息 / RCS', href: 'https://drive.google.com/file/d/1nOReVatlkkSmZeeoWdPiVzn_hGnjffT-/view?usp=drive_link' },
      { icon: '🏪', label: 'Genesys AppFoundry', href: 'https://appfoundry.genesys.com/filter/genesyscloud/listing/3c11487b-ea0e-4ecc-acd7-6ffd11faf8b6' },
    ],
  },
  na: {
    en: [
      { icon: '📄', label: 'Datasheet', href: 'https://drive.google.com/file/d/1q9T_5SM1BTb5rkyWyB28iD6Jjz_tD1Os/view?usp=sharing' },
      { icon: '📋', label: 'Lydia Case Study', href: 'https://drive.google.com/file/d/16y2qETPOCfj2MN40_6tYxpmOsaAw7vrS/view?usp=sharing' },
      { icon: '▶️', label: 'Demo Video', href: 'https://youtu.be/tJDeBhU1bqE?si=S8y7_5xHDXKxwVDU' },
    ],
    zh: [
      { icon: '📄', label: '数据表', href: 'https://drive.google.com/file/d/1MoknbJ9AcYjAvrWTO5CNvE2EziUNTf_G/view?usp=sharing' },
      { icon: '📋', label: 'Lydia 案例研究', href: 'https://drive.google.com/file/d/16y2qETPOCfj2MN40_6tYxpmOsaAw7vrS/view?usp=sharing' },
      { icon: '▶️', label: '演示视频', href: 'https://youtu.be/tJDeBhU1bqE?si=S8y7_5xHDXKxwVDU' },
    ],
  },
};

export default function HubPage() {
  const router = useRouter();
  const [lang, setLang] = useState<Language>('en');
  const [contactId, setContactId] = useState('');
  const [contactName, setContactName] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('bc');
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [turns, setTurns] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedLang = sessionStorage.getItem('lang') as Language;
    if (storedLang) setLang(storedLang);
    setContactId(sessionStorage.getItem('contact_id') || '');
    setContactName(sessionStorage.getItem('contact_first_name') || sessionStorage.getItem('contact_name') || '');
    const storedSolutions = sessionStorage.getItem('solutions');
    if (storedSolutions) {
      try {
        const sols: Tab[] = JSON.parse(storedSolutions);
        if (sols.length > 0) setActiveTab(sols[0]);
      } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    if (chatOpen && messages.length === 0)
      setMessages([{ role: 'assistant', content: t(lang, 'chatWelcome') }]);
  }, [chatOpen, lang]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function sendMessage() {
    if (!input.trim() || chatLoading || turns >= MAX_TURNS) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, history: messages, lang, contact_id: contactId }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      setTurns(t => t + 1);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong.' }]);
    } finally { setChatLoading(false); }
  }

  const tabConfig = {
    bc: { color: '#8B5CF6', icon: '📞', titleKey: 'bcTitle' as const, taglineKey: 'bcTagline' as const, descKey: 'bcDesc' as const, benefits: ['bcBenefit1', 'bcBenefit2', 'bcBenefit3', 'bcBenefit4'] as const },
    na: { color: '#F97316', icon: '🌐', titleKey: 'naTitle' as const, taglineKey: 'naTagline' as const, descKey: 'naDesc' as const, benefits: ['naBenefit1', 'naBenefit2', 'naBenefit3', 'naBenefit4'] as const },
  };

  const current = tabConfig[activeTab];
  const resources = RESOURCES[activeTab][lang] ?? RESOURCES[activeTab].en;

  return (
    <main className="mesh-bg min-h-screen flex flex-col">
      {/* Header */}
      <header style={{ padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(8,6,20,0.85)', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'sticky', top: 0, zIndex: 40, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/vonage-logo.png" alt="Vonage" style={{ height: '18px', width: 'auto', filter: 'brightness(0) invert(1)' }} />
          {contactName && <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', borderLeft: '1px solid rgba(255,255,255,0.15)', paddingLeft: '12px' }}>{contactName}</span>}
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {(Object.entries(languageNames) as [Language, string][]).map(([l, name]) => (
            <button key={l} className={`lang-btn ${lang === l ? 'active' : ''}`} onClick={() => setLang(l)}>{name}</button>
          ))}
        </div>
      </header>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '32px 20px 80px', width: '100%' }}>

        {/* Page title */}
        <div className="animate-fade-up" style={{ marginBottom: '28px' }}>
          <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(139,92,246,0.9)', marginBottom: '10px', fontWeight: '700' }}>{t(lang, 'eventName')}</p>
          <h1 style={{ fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: '700', color: '#FFFFFF', letterSpacing: '-0.025em', marginBottom: '8px' }}>{t(lang, 'hubTitle')}</h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '15px', lineHeight: '1.65' }}>{t(lang, 'hubSubtitle')}</p>
        </div>

        {/* Tab navigation */}
        <div className="animate-fade-up" style={{ animationDelay: '60ms', display: 'flex', gap: '8px', marginBottom: '24px', background: 'rgba(255,255,255,0.04)', borderRadius: '14px', padding: '5px' }}>
          {(['bc', 'na'] as Tab[]).map(tab => {
            const cfg = tabConfig[tab];
            const isActive = activeTab === tab;
            return (
              <button key={tab} onClick={() => { setActiveTab(tab); track('product_view', { product: tab === 'bc' ? 'branded_communications' : 'network_apis' }); }}
                style={{ flex: 1, padding: '12px 16px', borderRadius: '10px', border: `1.5px solid ${isActive ? cfg.color + '60' : 'transparent'}`, background: isActive ? `${cfg.color}18` : 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px', fontWeight: '600', color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.45)', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span>{cfg.icon}</span>
                <span>{t(lang, tab === 'bc' ? 'tabBc' : 'tabNa')}</span>
                {isActive && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: cfg.color, boxShadow: `0 0 8px ${cfg.color}` }} />}
              </button>
            );
          })}
        </div>

        {/* Product content */}
        <div className="glass-card animate-fade-up" style={{ animationDelay: '100ms', padding: '28px', marginBottom: '20px' }}>
          {/* Product header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: `${current.color}1A`, border: `1.5px solid ${current.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0, boxShadow: `0 0 24px ${current.color}20` }}>
              {current.icon}
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '18px', color: '#FFFFFF', lineHeight: 1.2 }}>{t(lang, current.titleKey)}</div>
              <div style={{ fontSize: '13px', color: current.color, fontWeight: '600', marginTop: '4px' }}>{t(lang, current.taglineKey)}</div>
            </div>
          </div>

          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.65)', lineHeight: '1.7', marginBottom: '22px' }}>{t(lang, current.descKey)}</p>

          {/* Benefits */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
            {current.benefits.map(b => (
              <div key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: `${current.color}18`, border: `1.5px solid ${current.color}45`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: current.color }} />
                </div>
                <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.78)', lineHeight: '1.6' }}>{t(lang, b)}</span>
              </div>
            ))}
          </div>

          {/* Resources */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', marginBottom: '12px', fontWeight: '700' }}>{t(lang, 'resources')}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {resources.map((r, i) => (
                <a key={i} href={r.href} target="_blank" rel="noopener noreferrer"
                  onClick={() => track('resource_click', { product: activeTab === 'bc' ? 'branded_communications' : 'network_apis', resource: r.label })}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', background: `${current.color}14`, border: `1.5px solid ${current.color}35`, color: 'rgba(255,255,255,0.85)', fontSize: '13px', fontWeight: '500', textDecoration: 'none', transition: 'all 0.15s' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = `${current.color}28`; el.style.borderColor = `${current.color}60`; el.style.color = '#FFFFFF'; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = `${current.color}14`; el.style.borderColor = `${current.color}35`; el.style.color = 'rgba(255,255,255,0.85)'; }}>
                  <span>{r.icon}</span> {r.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Meeting CTA */}
        <div className="glass-card animate-fade-up" style={{ animationDelay: '140ms', padding: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '14px' }}>
          <div style={{ fontSize: '36px' }}>💼</div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#FFFFFF' }}>{t(lang, 'meetingTitle')}</h3>
          <p style={{ color: 'rgba(255,255,255,0.58)', fontSize: '14px', maxWidth: '360px', lineHeight: '1.65' }}>{t(lang, 'meetingSubtitle')}</p>
          <button className="btn-orange" onClick={() => router.push('/meeting')}>{t(lang, 'meetingCta')}</button>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', opacity: 0.35, marginTop: '28px' }}>
          <img src="https://www.genesys.com/wp-content/themes/genesys-kraken/logo/genesys-com-full-color.svg" alt="Genesys" style={{ height: '14px', filter: 'grayscale(1) invert(1)' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>CX Tour KL & Taipei 2026 · 23 June (KL) · W Kuala Lumpur</span>
        </div>
      </div>

      {/* Chat FAB */}
      <button onClick={() => setChatOpen(true)}
        style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 50, width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', border: '1.5px solid rgba(139,92,246,0.5)', cursor: 'pointer', display: chatOpen ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', boxShadow: '0 4px 24px rgba(109,40,217,0.5)', transition: 'transform 0.2s, box-shadow 0.2s' }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}>
        💬
      </button>

      {/* Chat panel */}
      {chatOpen && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 50, width: '360px', maxWidth: 'calc(100vw - 32px)', height: '500px', maxHeight: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', background: 'rgba(12,8,30,0.94)', border: '1.5px solid rgba(139,92,246,0.3)', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 16px 56px rgba(0,0,0,0.5)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', animation: 'fadeUp 0.25s ease' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(139,92,246,0.1)' }}>
            <div>
              <div style={{ fontWeight: '700', fontSize: '14px', color: '#FFFFFF' }}>{t(lang, 'chatTitle')}</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
                {turns < MAX_TURNS ? `${MAX_TURNS - turns} ${lang === 'zh' ? '次提问剩余' : 'questions remaining'}` : t(lang, 'chatLimit')}
              </div>
            </div>
            <button onClick={() => setChatOpen(false)} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '18px', lineHeight: 1, padding: '4px 8px' }}>×</button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>{m.content}</div>
            ))}
            {chatLoading && (
              <div className="chat-bubble-ai" style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                {[0, 1, 2].map(i => <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#A78BFA', animation: `dot-bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          {turns < MAX_TURNS && (
            <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: '8px' }}>
              <input className="input-field" style={{ flex: 1, padding: '9px 13px', fontSize: '14px' }} placeholder={t(lang, 'chatPlaceholder')} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} disabled={chatLoading} />
              <button className="btn-primary" style={{ padding: '9px 14px', flexShrink: 0 }} onClick={sendMessage} disabled={chatLoading || !input.trim()}>{t(lang, 'chatSend')}</button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
