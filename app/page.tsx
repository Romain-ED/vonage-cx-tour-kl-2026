'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { translations, Language, languageNames, t } from '@/lib/i18n';

export default function WelcomePage() {
  const router = useRouter();
  const [lang, setLang] = useState<Language>('en');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), language: lang }),
      });
      if (!res.ok) throw new Error('Registration failed');
      const data = await res.json();
      // Store contact ID in sessionStorage for later use
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
      {/* Header */}
      <header style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Vonage wordmark */}
          <svg width="90" height="22" viewBox="0 0 90 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <text x="0" y="18" fontFamily="DM Sans, sans-serif" fontWeight="700" fontSize="20" fill="white" letterSpacing="-0.5">vonage</text>
          </svg>
          <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.15)' }} />
          {/* Ericsson */}
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>part of Ericsson</span>
        </div>
        {/* Language switcher */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {(Object.keys(languageNames) as Language[]).map(l => (
            <button key={l} className={`lang-btn ${lang === l ? 'active' : ''}`} onClick={() => setLang(l)}>
              {languageNames[l]}
            </button>
          ))}
        </div>
      </header>

      {/* Hero + Form */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>

        {/* Event badge */}
        <div className="animate-fade-up" style={{ animationDelay: '0ms', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
          <img
            src="https://www.genesys.com/wp-content/themes/genesys-kraken/logo/genesys-com-full-color.svg"
            alt="Genesys"
            style={{ height: '22px', filter: 'brightness(0) invert(1)', opacity: 0.7 }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,79,31,0.12)', border: '1px solid rgba(255,79,31,0.3)', borderRadius: '20px', padding: '4px 12px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FF4F1F' }} />
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#FF7A52', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              {t(lang, 'eventLabel')} · {t(lang, 'eventName')}
            </span>
          </div>
        </div>

        {/* Title */}
        <div className="animate-fade-up" style={{ animationDelay: '80ms', textAlign: 'center', marginBottom: '12px' }}>
          <h1 style={{ fontSize: 'clamp(28px, 6vw, 48px)', fontWeight: '700', lineHeight: '1.1', letterSpacing: '-0.02em' }}>
            {t(lang, 'welcomeTitle')}
          </h1>
        </div>

        <div className="animate-fade-up" style={{ animationDelay: '140ms', textAlign: 'center', maxWidth: '500px', marginBottom: '48px' }}>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '16px', lineHeight: '1.6' }}>
            {t(lang, 'welcomeSubtitle')}
          </p>
          <p style={{ marginTop: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>
            {t(lang, 'eventDate')}
          </p>
        </div>

        {/* Form card */}
        <div className="glass-card animate-fade-up" style={{ animationDelay: '200ms', width: '100%', maxWidth: '440px', padding: '36px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', letterSpacing: '0.03em' }}>
                {t(lang, 'nameLabel')}
              </label>
              <input
                className="input-field"
                type="text"
                required
                placeholder={t(lang, 'namePlaceholder')}
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', letterSpacing: '0.03em' }}>
                {t(lang, 'emailLabel')}
              </label>
              <input
                className="input-field"
                type="email"
                required
                placeholder={t(lang, 'emailPlaceholder')}
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            {error && (
              <p style={{ fontSize: '13px', color: '#FF6B6B', textAlign: 'center' }}>{error}</p>
            )}

            <button
              type="submit"
              className="btn-primary animate-pulse-glow"
              disabled={loading || !name.trim() || !email.trim()}
              style={{ width: '100%', marginTop: '4px' }}
            >
              {loading ? t(lang, 'submitting') : t(lang, 'submitBtn')}
            </button>

            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', textAlign: 'center', lineHeight: '1.5' }}>
              {t(lang, 'privacyNote')}
            </p>
          </form>
        </div>

        {/* Decorative dots */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '32px' }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: i === 0 ? 'var(--vonage-purple)' : 'rgba(255,255,255,0.15)' }} />
          ))}
        </div>
      </div>
    </main>
  );
}
