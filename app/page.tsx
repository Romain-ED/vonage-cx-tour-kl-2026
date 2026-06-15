'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Language, languageNames, t } from '@/lib/i18n';
import { track } from '@/lib/analytics';

type Solution = 'bc' | 'na';

export default function WelcomePage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [lang, setLang] = useState<Language>('en');
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { track('page_view', { source: 'qr' }); }, []);

  function toggleSolution(s: Solution) {
    setSolutions(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  }

  async function handleSubmit() {
    if (solutions.length === 0) return;
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first_name: firstName.trim(), last_name: lastName.trim(), email: email.trim(), phone: phone.trim() || null, language: lang, solutions }),
      });
      if (!res.ok) throw new Error('Registration failed');
      const data = await res.json();
      sessionStorage.setItem('contact_id', data.id);
      sessionStorage.setItem('contact_name', firstName.trim());
      sessionStorage.setItem('contact_first_name', firstName.trim());
      sessionStorage.setItem('contact_last_name', lastName.trim());
      sessionStorage.setItem('contact_email', email.trim());
      sessionStorage.setItem('contact_phone', phone.trim());
      sessionStorage.setItem('lang', lang);
      sessionStorage.setItem('solutions', JSON.stringify(solutions));
      router.push('/hub');
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  const canProceedStep1 = firstName.trim() && lastName.trim() && email.trim().includes('@');

  return (
    <main className="mesh-bg min-h-screen flex flex-col">
      {/* Header */}
      <header style={{ padding: '18px 32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(8,6,20,0.8)', borderBottom: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <img src="/vonage-logo.png" alt="Vonage" style={{ height: '20px', width: 'auto', filter: 'brightness(0) invert(1)' }} />
          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '14px' }}>×</span>
          <img src="https://www.genesys.com/wp-content/themes/genesys-kraken/logo/genesys-com-full-color.svg" alt="Genesys" style={{ height: '18px', width: 'auto', filter: 'brightness(0) invert(1)' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '14px' }}>×</span>
          <img src="/expertstack-logo.png" alt="ExpertStack" style={{ height: '18px', width: 'auto', filter: 'brightness(0) invert(1)' }} />
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>

        {/* Event badge */}
        <div className="animate-fade-up" style={{ marginBottom: '28px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(249,115,22,0.12)', border: '1.5px solid rgba(249,115,22,0.35)', borderRadius: '24px', padding: '7px 18px' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#F97316', flexShrink: 0, boxShadow: '0 0 8px rgba(249,115,22,0.7)' }} />
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#FB923C', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {t(lang, 'eventLabel')} · {t(lang, 'eventName')}
            </span>
          </div>
        </div>

        <div className="animate-fade-up" style={{ animationDelay: '60ms', textAlign: 'center', marginBottom: '8px' }}>
          <h1 className="gradient-text" style={{ fontSize: 'clamp(26px, 5vw, 46px)', fontWeight: '700', lineHeight: '1.1', letterSpacing: '-0.03em' }}>
            {t(lang, 'welcomeTitle')}
          </h1>
        </div>
        <div className="animate-fade-up" style={{ animationDelay: '100ms', textAlign: 'center', maxWidth: '460px', marginBottom: '36px' }}>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', lineHeight: '1.7' }}>{t(lang, 'welcomeSubtitle')}</p>
        </div>

        {/* Step progress */}
        <div className="animate-fade-up" style={{ animationDelay: '130ms', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px' }}>
          {([1, 2, 3] as const).map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', transition: 'all 0.2s', background: step >= s ? '#8B5CF6' : 'rgba(255,255,255,0.08)', color: step >= s ? '#FFFFFF' : 'rgba(255,255,255,0.3)', border: step === s ? '2px solid #A78BFA' : '2px solid transparent' }}>
                {step > s ? '✓' : s}
              </div>
              <span style={{ fontSize: '12px', color: step === s ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)', fontWeight: step === s ? '600' : '400' }}>
                {t(lang, s === 1 ? 'stepContact' : s === 2 ? 'stepLanguage' : 'stepInterest')}
              </span>
              {i < 2 && <div style={{ width: '24px', height: '1px', background: step > s ? '#8B5CF6' : 'rgba(255,255,255,0.12)', marginInline: '2px' }} />}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="glass-card animate-fade-up" style={{ animationDelay: '160ms', width: '100%', maxWidth: '460px', padding: '32px' }}>

          {/* STEP 1 — Contact details */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.65)', marginBottom: '7px', letterSpacing: '0.01em' }}>{t(lang, 'firstNameLabel')}</label>
                  <input className="input-field" type="text" placeholder={t(lang, 'firstNamePlaceholder')} value={firstName} onChange={e => setFirstName(e.target.value)} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.65)', marginBottom: '7px', letterSpacing: '0.01em' }}>{t(lang, 'lastNameLabel')}</label>
                  <input className="input-field" type="text" placeholder={t(lang, 'lastNamePlaceholder')} value={lastName} onChange={e => setLastName(e.target.value)} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.65)', marginBottom: '7px', letterSpacing: '0.01em' }}>{t(lang, 'emailLabel')}</label>
                <input className="input-field" type="email" placeholder={t(lang, 'emailPlaceholder')} value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.65)', marginBottom: '7px', letterSpacing: '0.01em' }}>{t(lang, 'phoneLabel')}</label>
                <input className="input-field" type="tel" placeholder={t(lang, 'phonePlaceholder')} value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              <button className="btn-primary" disabled={!canProceedStep1} onClick={() => setStep(2)} style={{ width: '100%', marginTop: '4px' }}>
                {t(lang, 'next')} →
              </button>
            </div>
          )}

          {/* STEP 2 — Language */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#FFFFFF', marginBottom: '6px' }}>{t(lang, 'languageTitle')}</h2>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>{t(lang, 'languageSubtitle')}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(Object.entries(languageNames) as [Language, string][]).map(([l, name]) => (
                  <button key={l} onClick={() => { setLang(l); setStep(3); }}
                    style={{ padding: '18px 24px', borderRadius: '14px', border: `2px solid ${lang === l ? '#8B5CF6' : 'rgba(255,255,255,0.1)'}`, background: lang === l ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.04)', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.15s' }}
                    onMouseEnter={e => { if (lang !== l) (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.25)'; }}
                    onMouseLeave={e => { if (lang !== l) (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)'; }}>
                    <span style={{ fontSize: '16px', fontWeight: '600', color: '#FFFFFF' }}>{name}</span>
                    {lang === l && <span style={{ color: '#A78BFA', fontSize: '18px' }}>✓</span>}
                  </button>
                ))}
              </div>
              <button className="btn-outline" onClick={() => setStep(1)} style={{ width: '100%' }}>← {t(lang, 'back')}</button>
            </div>
          )}

          {/* STEP 3 — Solution interest */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#FFFFFF', marginBottom: '6px' }}>{t(lang, 'solutionTitle')}</h2>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>{t(lang, 'solutionSubtitle')}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {([
                  { key: 'bc' as Solution, icon: '📞', color: '#8B5CF6', title: t(lang, 'solutionBc'), desc: t(lang, 'solutionBcDesc') },
                  { key: 'na' as Solution, icon: '🌐', color: '#F97316', title: t(lang, 'solutionNa'), desc: t(lang, 'solutionNaDesc') },
                ]).map(({ key, icon, color, title, desc }) => {
                  const selected = solutions.includes(key);
                  return (
                    <button key={key} onClick={() => toggleSolution(key)}
                      style={{ padding: '16px 18px', borderRadius: '14px', border: `2px solid ${selected ? color : 'rgba(255,255,255,0.1)'}`, background: selected ? `${color}18` : 'rgba(255,255,255,0.04)', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.15s', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: `${color}20`, border: `1.5px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>{icon}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#FFFFFF', marginBottom: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          {title}
                          <span style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${selected ? color : 'rgba(255,255,255,0.2)'}`, background: selected ? color : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '11px', color: '#fff' }}>
                            {selected ? '✓' : ''}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.55' }}>{desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
              {error && <p style={{ fontSize: '13px', color: '#FCA5A5', textAlign: 'center' }}>{error}</p>}
              <button className="btn-primary animate-pulse-glow" disabled={solutions.length === 0 || loading} onClick={handleSubmit} style={{ width: '100%' }}>
                {loading ? t(lang, 'submitting') : t(lang, 'submitBtn')}
              </button>
              <button className="btn-outline" onClick={() => setStep(2)} style={{ width: '100%' }}>← {t(lang, 'back')}</button>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.28)', textAlign: 'center', lineHeight: '1.6' }}>{t(lang, 'privacyNote')}</p>
            </div>
          )}
        </div>

        <p style={{ marginTop: '24px', fontSize: '12px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.02em' }}>{t(lang, 'eventDate')}</p>
      </div>
    </main>
  );
}
