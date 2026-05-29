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
      <header style={{
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(8,6,20,0.8)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/vonage-logo.svg" alt="Vonage" style={{ height: '20px', width: 'auto' }} />
          {contactName && (
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', borderLeft: '1px solid rgba(255,255,255,0.15)', paddingLeft: '12px' }}>
              {contactName}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {(Object.keys(languageNames) as Language[]).map(l => (
            <button key={l} className={`lang-btn ${lang === l ? 'active' : ''}`} onClick={() => setLang(l)}>{languageNames[l]}</button>
          ))}
        </div>
      </header>

      <div style={{ maxWidth: '880px', margin: '0 auto', padding: '40px 24px', width: '100%' }}>

        {/* Hub title */}
        <div className="animate-fade-up" style={{ marginBottom: '40px' }}>
          <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(139,92,246,0.9)', marginBottom: '12px', fontWeight: '700' }}>
            {t(lang, 'eventName')}
          </p>
          <h1 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: '700', color: '#FFFFFF', letterSpacing: '-0.025em', marginBottom: '12px', lineHeight: 1.15 }}>
            {t(lang, 'hubTitle')}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '16px', maxWidth: '500px', lineHeight: '1.7' }}>
            {t(lang, 'hubSubtitle')}
          </p>
        </div>

        {/* Product cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '28px' }}>
          <ProductCard
            icon="📞" accentColor="#8B5CF6" title={t(lang, 'bcTitle')} tagline={t(lang, 'bcTagline')} desc={t(lang, 'bcDesc')}
            benefits={[t(lang, 'bcBenefit1'), t(lang, 'bcBenefit2'), t(lang, 'bcBenefit3'), t(lang, 'bcBenefit4')]}
            resources={bcResources} resourcesLabel={t(lang, 'resources')}
            expanded={activeProduct === 'bc'}
            onToggle={() => { setActiveProduct(activeProduct === 'bc' ? null : 'bc'); if (activeProduct !== 'bc') track('product_view', { product: 'branded_calling' }); }}
            onResourceClick={(label) => track('resource_click', { product: 'branded_calling', resource: label })}
          />
          <ProductCard
            icon="🌐" accentColor="#F97316" title={t(lang, 'naTitle')} tagline={t(lang, 'naTagline')} desc={t(lang, 'naDesc')}
            benefits={[t(lang, 'naBenefit1'), t(lang, 'naBenefit2'), t(lang, 'naBenefit3'), t(lang, 'naBenefit4')]}
            resources={naResources} resourcesLabel={t(lang, 'resources')}
            expanded={activeProduct === 'na'}
            onToggle={() => { setActiveProduct(activeProduct === 'na' ? null : 'na'); if (activeProduct !== 'na') track('product_view', { product: 'network_apis' }); }}
            onResourceClick={(label) => track('resource_click', { product: 'network_apis', resource: label })}
          />
        </div>

        {/* Meeting CTA */}
        <div className="glass-card" style={{ padding: '36px', marginBottom: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px' }}>
          {meetingRequested ? (
            <>
              <div style={{ fontSize: '40px' }}>🤝</div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#FFFFFF' }}>{t(lang, 'meetingDone')}</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px' }}>{t(lang, 'meetingConfirm')}</p>
              <button className="btn-outline" onClick={toggleMeeting} disabled={meetingLoading}>{t(lang, 'meetingCancel')}</button>
            </>
          ) : (
            <>
              <div style={{ fontSize: '40px' }}>💼</div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#FFFFFF' }}>{t(lang, 'meetingTitle')}</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', maxWidth: '380px' }}>{t(lang, 'meetingSubtitle')}</p>
              <button className="btn-orange" onClick={toggleMeeting} disabled={meetingLoading}>
                {meetingLoading ? '...' : t(lang, 'meetingCta')}
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', opacity: 0.4, paddingBottom: '20px' }}>
          <img src="https://www.genesys.com/wp-content/themes/genesys-kraken/logo/genesys-com-full-color.svg" alt="Genesys" style={{ height: '16px', filter: 'grayscale(1) invert(1)' }} onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>CX Tour KL 2026 · 23 June · W Kuala Lumpur</span>
        </div>
      </div>

      {/* Chat FAB */}
      <button onClick={() => setChatOpen(true)}
        style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 50,
          width: '58px', height: '58px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
          border: '1.5px solid rgba(139,92,246,0.5)',
          cursor: 'pointer', display: chatOpen ? 'none' : 'flex',
          alignItems: 'center', justifyContent: 'center', fontSize: '22px',
          boxShadow: '0 4px 24px rgba(109,40,217,0.5)', transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 6px 32px rgba(109,40,217,0.65)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(109,40,217,0.5)'; }}>
        💬
      </button>

      {/* Chat panel */}
      {chatOpen && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 50,
          width: '360px', maxWidth: 'calc(100vw - 32px)',
          height: '500px', maxHeight: 'calc(100vh - 80px)',
          display: 'flex', flexDirection: 'column',
          background: 'rgba(12,8,30,0.92)',
          border: '1.5px solid rgba(139,92,246,0.3)',
          borderRadius: '20px', overflow: 'hidden',
          boxShadow: '0 16px 56px rgba(0,0,0,0.5), 0 0 0 1px rgba(139,92,246,0.1)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          animation: 'fadeUp 0.25s ease',
        }}>
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: 'rgba(139,92,246,0.1)',
          }}>
            <div>
              <div style={{ fontWeight: '700', fontSize: '14px', color: '#FFFFFF' }}>{t(lang, 'chatTitle')}</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginTop: '2px' }}>
                {turns < MAX_TURNS
                  ? `${MAX_TURNS - turns} ${lang === 'zh' ? '次提问剩余' : lang === 'ms' ? 'soalan berbaki' : 'questions remaining'}`
                  : t(lang, 'chatLimit')}
              </div>
            </div>
            <button onClick={() => setChatOpen(false)} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '18px', lineHeight: 1, padding: '4px 8px' }}>×</button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>{m.content}</div>
            ))}
            {chatLoading && (
              <div className="chat-bubble-ai" style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#A78BFA', animation: `dot-bounce 1.2s ease-in-out ${i*0.2}s infinite` }} />
                ))}
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          {turns < MAX_TURNS && (
            <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: '8px' }}>
              <input className="input-field" style={{ flex: 1, padding: '10px 14px', fontSize: '14px' }}
                placeholder={t(lang, 'chatPlaceholder')} value={input}
                onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} disabled={chatLoading} />
              <button className="btn-primary" style={{ padding: '10px 16px', flexShrink: 0 }} onClick={sendMessage} disabled={chatLoading || !input.trim()}>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px', height: '46px', borderRadius: '14px',
            background: `${accentColor}1A`,
            border: `1.5px solid ${accentColor}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '22px', flexShrink: 0,
            boxShadow: `0 0 20px ${accentColor}20`,
          }}>
            {icon}
          </div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '16px', color: '#FFFFFF', lineHeight: 1.2 }}>{title}</div>
            <div style={{ fontSize: '12px', color: accentColor, fontWeight: '600', marginTop: '4px', opacity: 0.9 }}>{tagline}</div>
          </div>
        </div>
        <span style={{
          fontSize: '16px', color: 'rgba(255,255,255,0.35)',
          transform: expanded ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.2s', marginTop: '4px', display: 'block',
        }}>⌄</span>
      </div>

      <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.58)', lineHeight: '1.7' }}>{desc}</p>

      {expanded && (
        <div style={{ marginTop: '22px', animation: 'fadeIn 0.2s ease' }} onClick={e => e.stopPropagation()}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '22px' }}>
            {benefits.map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{
                  width: '18px', height: '18px', borderRadius: '50%',
                  background: `${accentColor}18`, border: `1.5px solid ${accentColor}45`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, marginTop: '3px',
                }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: accentColor }} />
                </div>
                <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.78)', lineHeight: '1.6' }}>{b}</span>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '18px' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', marginBottom: '12px', fontWeight: '700' }}>
              {resourcesLabel}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {resources.map((r, i) => (
                <a key={i} href={r.href} target="_blank" rel="noopener noreferrer"
                  onClick={() => onResourceClick?.(r.label)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '7px 14px', borderRadius: '8px',
                    background: `${accentColor}14`,
                    border: `1.5px solid ${accentColor}35`,
                    color: 'rgba(255,255,255,0.8)', fontSize: '13px', fontWeight: '500',
                    textDecoration: 'none', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = `${accentColor}28`; el.style.borderColor = `${accentColor}60`; el.style.color = '#FFFFFF'; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = `${accentColor}14`; el.style.borderColor = `${accentColor}35`; el.style.color = 'rgba(255,255,255,0.8)'; }}>
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
