'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Language, languageNames, t } from '@/lib/i18n';
import { track } from '@/lib/analytics';

export default function WelcomePage() {
  const router = useRouter();
  const [lang, setLang] = useState<Language>('en');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { track('page_view', { source: 'qr' }); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), language: lang }),
      });
      if (!res.ok) throw new Error('Registration failed');
      const data = await res.json();
      sessionStorage.setItem('contact_id', data.id);
      sessionStorage.setItem('contact_name', name.trim());
      sessionStorage.setItem('lang', lang);
      router.push('/hub');
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <main className="mesh-bg min-h-screen flex flex-col">
      <header style={{ padding: '18px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(30,15,70,0.95)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <span style={{ fontSize: '20px', fontWeight: '700', color: '#FFFFFF', letterSpacing: '-0.03em' }}>vonage</span>
        <div style={{ display: 'flex', gap: '4px' }}>
          {(Object.keys(languageNames) as Language[]).map(l => (
            <button key={l} className={`lang-btn ${lang === l ? 'active' : ''}`} onClick={() => setLang(l)}>
              {languageNames[l]}
            </button>
          ))}
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>

        {/* Event badge */}
        <div className="animate-fade-up" style={{ marginBottom: '28px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(234,76,26,0.08)', border: '1.5px solid rgba(234,76,26,0.25)', borderRadius: '24px', padding: '6px 16px' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#EA4C1A', flexShrink: 0 }} />
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#B83510', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {t(lang, 'eventLabel')} · {t(lang, 'eventName')}
            </span>
          </div>
        </div>

        <div className="animate-fade-up" style={{ animationDelay: '80ms', textAlign: 'center', marginBottom: '12px' }}>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 46px)', fontWeight: '700', color: '#111111', lineHeight: '1.1', letterSpacing: '-0.02em' }}>
            {t(lang, 'welcomeTitle')}
          </h1>
        </div>

        <div className="animate-fade-up" style={{ animationDelay: '140ms', textAlign: 'center', maxWidth: '480px', marginBottom: '40px' }}>
          <p style={{ color: '#444444', fontSize: '16px', lineHeight: '1.65' }}>
            {t(lang, 'welcomeSubtitle')}
          </p>
          <p style={{ marginTop: '8px', fontSize: '13px', color: '#777777' }}>
            {t(lang, 'eventDate')}
          </p>
        </div>

        {/* Form */}
        <div className="glass-card animate-fade-up" style={{ animationDelay: '200ms', width: '100%', maxWidth: '420px', padding: '36px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#333333', marginBottom: '8px' }}>
                {t(lang, 'nameLabel')}
              </label>
              <input className="input-field" type="text" required placeholder={t(lang, 'namePlaceholder')} value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#333333', marginBottom: '8px' }}>
                {t(lang, 'emailLabel')}
              </label>
              <input className="input-field" type="email" required placeholder={t(lang, 'emailPlaceholder')} value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            {error && <p style={{ fontSize: '13px', color: '#DC2626', textAlign: 'center' }}>{error}</p>}
            <button type="submit" className="btn-primary animate-pulse-glow" disabled={loading || !name.trim() || !email.trim()} style={{ width: '100%', marginTop: '4px' }}>
              {loading ? t(lang, 'submitting') : t(lang, 'submitBtn')}
            </button>
            <p style={{ fontSize: '12px', color: '#888888', textAlign: 'center', lineHeight: '1.5' }}>
              {t(lang, 'privacyNote')}
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
