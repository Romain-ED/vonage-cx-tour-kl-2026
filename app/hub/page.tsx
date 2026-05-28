'use client';

import { useState, useEffect, useRef } from 'react';
import { Language, languageNames, t } from '@/lib/i18n';
import { track } from '@/lib/analytics';

interface Message { role: 'user' | 'assistant'; content: string; }
const MAX_TURNS = 5;

export default function HubPage() {
  const [lang, setLang] = useState<Language>('en');
  const [contactId, setContactId] = useState('');
  const [contactName, setContactName] = useState('');
  const [meetingRequested, setMeetingRequested] = useState(false);
  const [meetingLoading, setMeetingLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [turns, setTurns] = useState(0);
  const [activeProduct, setActiveProduct] = useState<'bc' | 'na' | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedLang = sessionStorage.getItem('lang') as Language;
    if (storedLang) setLang(storedLang);
    setContactId(sessionStorage.getItem('contact_id') || '');
    setContactName(sessionStorage.getItem('contact_name') || '');
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
        body: JSON.stringify({ message: userMsg, history: messages, lang }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      setTurns(t => t + 1);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }]);
    } finally { setChatLoading(false); }
  }

  async function toggleMeeting() {
    if (meetingLoading) return;
    setMeetingLoading(true);
    try {
      await fetch('/api/meeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact_id: contactId, meeting_requested: !meetingRequested }),
      });
      setMeetingRequested(!meetingRequested);
    } catch { /* silent */ }
    setMeetingLoading(false);
  }

  const bcResources = [
    { icon: '🌐', label: t(lang, 'visitWebsite'), href: 'https://www.vonage.sg/communications-apis/branded-calling/' },
    { icon: '▶️', label: t(lang, 'watchVideo'), href: '#' },
    { icon: '📄', label: t(lang, 'downloadPdf'), href: '#' },
  ];
  const naResources = [
    { icon: '🌐', label: t(lang, 'visitWebsite'), href: 'https://www.vonage.sg/network-apis/' },
    { icon: '▶️', label: t(lang, 'watchVideo'), href: '#' },
    { icon: '📄', label: t(lang, 'downloadPdf'), href: '#' },
  ];

  return (
    <main className="mesh-bg min-h-screen flex flex-col">
      {/* Header */}
      <header style={{ padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(30,15,70,0.95)', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '18px', fontWeight: '700', color: '#FFFFFF', letterSpacing: '-0.02em' }}>vonage</span>
          {contactName && <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>· {contactName}</span>}
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {(Object.keys(languageNames) as Language[]).map(l => (
            <button key={l} className={`lang-btn ${lang === l ? 'active' : ''}`} onClick={() => setLang(l)}>{languageNames[l]}</button>
          ))}
        </div>
      </header>

      <div style={{ maxWidth: '880px', margin: '0 auto', padding: '40px 24px', width: '100%' }}>

        {/* Hub title */}
        <div className="animate-fade-up" style={{ marginBottom: '36px' }}>
          <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6D28D9', marginBottom: '10px', fontWeight: '700' }}>
            {t(lang, 'eventName')}
          </p>
          <h1 style={{ fontSize: 'clamp(24px, 4vw, 38px)', fontWeight: '700', color: '#111111', letterSpacing: '-0.02em', marginBottom: '10px' }}>
            {t(lang, 'hubTitle')}
          </h1>
          <p style={{ color: '#555555', fontSize: '16px', maxWidth: '500px', lineHeight: '1.65' }}>
            {t(lang, 'hubSubtitle')}
          </p>
        </div>

        {/* Product cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '28px' }}>
          <ProductCard
            icon="📞" accentColor="#6D28D9" title={t(lang, 'bcTitle')} tagline={t(lang, 'bcTagline')} desc={t(lang, 'bcDesc')}
            benefits={[t(lang, 'bcBenefit1'), t(lang, 'bcBenefit2'), t(lang, 'bcBenefit3'), t(lang, 'bcBenefit4')]}
            resources={bcResources} resourcesLabel={t(lang, 'resources')}
            expanded={activeProduct === 'bc'}
            onToggle={() => { setActiveProduct(activeProduct === 'bc' ? null : 'bc'); if (activeProduct !== 'bc') track('product_view', { product: 'branded_calling' }); }}
            onResourceClick={(label) => track('resource_click', { product: 'branded_calling', resource: label })}
          />
          <ProductCard
            icon="🌐" accentColor="#EA4C1A" title={t(lang, 'naTitle')} tagline={t(lang, 'naTagline')} desc={t(lang, 'naDesc')}
            benefits={[t(lang, 'naBenefit1'), t(lang, 'naBenefit2'), t(lang, 'naBenefit3'), t(lang, 'naBenefit4')]}
            resources={naResources} resourcesLabel={t(lang, 'resources')}
            expanded={activeProduct === 'na'}
            onToggle={() => { setActiveProduct(activeProduct === 'na' ? null : 'na'); if (activeProduct !== 'na') track('product_view', { product: 'network_apis' }); }}
            onResourceClick={(label) => track('resource_click', { product: 'network_apis', resource: label })}
          />
        </div>

        {/* Meeting CTA */}
        <div className="glass-card" style={{ padding: '32px', marginBottom: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '14px' }}>
          {meetingRequested ? (
            <>
              <div style={{ fontSize: '36px' }}>🤝</div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111111' }}>{t(lang, 'meetingDone')}</h3>
              <p style={{ color: '#555555', fontSize: '15px' }}>{t(lang, 'meetingConfirm')}</p>
              <button className="btn-outline" onClick={toggleMeeting} disabled={meetingLoading}>{t(lang, 'meetingCancel')}</button>
            </>
          ) : (
            <>
              <div style={{ fontSize: '36px' }}>💼</div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111111' }}>{t(lang, 'meetingTitle')}</h3>
              <p style={{ color: '#555555', fontSize: '15px', maxWidth: '380px' }}>{t(lang, 'meetingSubtitle')}</p>
              <button className="btn-orange" onClick={toggleMeeting} disabled={meetingLoading}>
                {meetingLoading ? '...' : t(lang, 'meetingCta')}
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', opacity: 0.5 }}>
          <img src="https://www.genesys.com/wp-content/themes/genesys-kraken/logo/genesys-com-full-color.svg" alt="Genesys" style={{ height: '16px', filter: 'grayscale(1)' }} onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
          <span style={{ fontSize: '12px', color: '#666666' }}>CX Tour KL 2026 · 23 June · W Kuala Lumpur</span>
        </div>
      </div>

      {/* Chat FAB */}
      <button onClick={() => setChatOpen(true)}
        style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 50, width: '58px', height: '58px', borderRadius: '50%',
          background: '#6D28D9', border: 'none', cursor: 'pointer', display: chatOpen ? 'none' : 'flex',
          alignItems: 'center', justifyContent: 'center', fontSize: '22px',
          boxShadow: '0 4px 20px rgba(109,40,217,0.4)', transition: 'transform 0.2s' }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
        💬
      </button>

      {/* Chat panel */}
      {chatOpen && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 50, width: '360px', maxWidth: 'calc(100vw - 32px)',
          height: '500px', maxHeight: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column',
          background: '#FFFFFF', border: '1.5px solid rgba(109,40,217,0.2)', borderRadius: '20px', overflow: 'hidden',
          boxShadow: '0 12px 48px rgba(0,0,0,0.15)', animation: 'fadeUp 0.25s ease' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(0,0,0,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F5F0FF' }}>
            <div>
              <div style={{ fontWeight: '700', fontSize: '14px', color: '#111111' }}>{t(lang, 'chatTitle')}</div>
              <div style={{ fontSize: '12px', color: '#666666', marginTop: '2px' }}>
                {turns < MAX_TURNS
                  ? `${MAX_TURNS - turns} ${lang === 'zh' ? '次提问剩余' : lang === 'ms' ? 'soalan berbaki' : 'questions remaining'}`
                  : t(lang, 'chatLimit')}
              </div>
            </div>
            <button onClick={() => setChatOpen(false)} style={{ background: 'none', border: 'none', color: '#666666', cursor: 'pointer', fontSize: '22px', lineHeight: 1, padding: '4px' }}>×</button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>{m.content}</div>
            ))}
            {chatLoading && (
              <div className="chat-bubble-ai" style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#9333EA', animation: `dot-bounce 1.2s ease-in-out ${i*0.2}s infinite` }} />
                ))}
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          {turns < MAX_TURNS && (
            <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(0,0,0,0.07)', display: 'flex', gap: '8px' }}>
              <input className="input-field" style={{ flex: 1, padding: '10px 14px', fontSize: '14px' }}
                placeholder={t(lang, 'chatPlaceholder')} value={input}
                onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} disabled={chatLoading} />
              <button className="btn-primary" style={{ padding: '10px 16px' }} onClick={sendMessage} disabled={chatLoading || !input.trim()}>
                {t(lang, 'chatSend')}
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

function ProductCard({ icon, accentColor, title, tagline, desc, benefits, resources, resourcesLabel, expanded, onToggle, onResourceClick }: {
  icon: string; accentColor: string; title: string; tagline: string; desc: string;
  benefits: string[]; resources: { icon: string; label: string; href: string }[];
  resourcesLabel: string; expanded: boolean; onToggle: () => void; learnMore?: string;
  onResourceClick?: (label: string) => void;
}) {
  return (
    <div className="product-card animate-fade-up" style={{ padding: '28px', cursor: 'pointer' }} onClick={onToggle}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${accentColor}14`, border: `1.5px solid ${accentColor}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>
            {icon}
          </div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '16px', color: '#111111', lineHeight: 1.2 }}>{title}</div>
            <div style={{ fontSize: '12px', color: accentColor, fontWeight: '600', marginTop: '3px' }}>{tagline}</div>
          </div>
        </div>
        <span style={{ fontSize: '16px', color: '#999999', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', marginTop: '4px', display: 'block' }}>⌄</span>
      </div>

      <p style={{ fontSize: '14px', color: '#555555', lineHeight: '1.65' }}>{desc}</p>

      {expanded && (
        <div style={{ marginTop: '20px', animation: 'fadeIn 0.2s ease' }} onClick={e => e.stopPropagation()}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
            {benefits.map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: `${accentColor}15`, border: `1.5px solid ${accentColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: accentColor }} />
                </div>
                <span style={{ fontSize: '14px', color: '#333333', lineHeight: '1.55' }}>{b}</span>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(0,0,0,0.07)', paddingTop: '16px' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#999999', marginBottom: '10px', fontWeight: '700' }}>
              {resourcesLabel}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {resources.map((r, i) => (
                <a key={i} href={r.href} target="_blank" rel="noopener noreferrer"
                  onClick={() => onResourceClick?.(r.label)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', background: `${accentColor}0F`, border: `1.5px solid ${accentColor}25`, color: '#333333', fontSize: '13px', fontWeight: '500', textDecoration: 'none', transition: 'all 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = `${accentColor}20`; (e.currentTarget as HTMLAnchorElement).style.borderColor = `${accentColor}50`; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = `${accentColor}0F`; (e.currentTarget as HTMLAnchorElement).style.borderColor = `${accentColor}25`; }}>
                  <span>{r.icon}</span> {r.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
