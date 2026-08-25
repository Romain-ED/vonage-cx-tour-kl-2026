'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Language, t } from '@/lib/i18n';
import { track } from '@/lib/analytics';
import { CxTourBanner } from '@/components/CxTourBanner';

type Solution = 'sa' | 'ii' | 'bc';

export default function WelcomePage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const lang: Language = 'en';
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [contactId, setContactId] = useState<string | null>(null);
  const [step1Error, setStep1Error] = useState('');

  useEffect(() => { track('page_view', { source: 'qr' }); }, []);

  function toggleSolution(s: Solution) {
    setSolutions(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  }

  async function handleStep1Next() {
    setStep1Error('');
    if (!firstName.trim() || !lastName.trim()) { setStep1Error('Please enter your first and last name.'); return; }
    if (!emailValid) { setStep1Error('Please enter a valid work email address.'); return; }
    setStep(2);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first_name: firstName.trim(), last_name: lastName.trim(), email: email.trim(), phone: phone.trim() || null }),
      });
      if (res.ok) {
        const data = await res.json();
        setContactId(data.id);
        sessionStorage.setItem('contact_id', data.id);
        sessionStorage.setItem('contact_name', firstName.trim());
        sessionStorage.setItem('contact_first_name', firstName.trim());
        sessionStorage.setItem('contact_last_name', lastName.trim());
        sessionStorage.setItem('contact_email', email.trim());
        sessionStorage.setItem('contact_phone', phone.trim());
      }
    } catch { /* silent — will retry on final submit */ }
  }

  async function handleSubmit() {
    if (solutions.length === 0) return;
    setLoading(true); setError('');
    try {
      let id = contactId;
      if (id) {
        await fetch('/api/register', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, language: lang, solutions }),
        });
      } else {
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ first_name: firstName.trim(), last_name: lastName.trim(), email: email.trim(), phone: phone.trim() || null, language: lang, solutions }),
        });
        if (!res.ok) throw new Error('Registration failed');
        const data = await res.json();
        id = data.id;
        sessionStorage.setItem('contact_id', data.id);
        sessionStorage.setItem('contact_name', firstName.trim());
        sessionStorage.setItem('contact_first_name', firstName.trim());
        sessionStorage.setItem('contact_last_name', lastName.trim());
        sessionStorage.setItem('contact_email', email.trim());
        sessionStorage.setItem('contact_phone', phone.trim());
      }
      sessionStorage.setItem('lang', lang);
      sessionStorage.setItem('solutions', JSON.stringify(solutions));
      router.push('/hub');
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
  const canProceedStep1 = firstName.trim() && lastName.trim() && emailValid;

  return (
    <main className="mesh-bg min-h-screen flex flex-col">
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 32px', background: 'rgba(8,6,20,0.8)', borderBottom: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
        <img src="/vonage-logo.png" alt="Vonage" style={{ height: '22px', width: 'auto', filter: 'brightness(0) invert(1)' }} />
      </header>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
        {/* Event banner */}
        <div className="animate-fade-up" style={{ marginBottom: '40px', width: '100%', maxWidth: '460px' }}>
          <CxTourBanner />
        </div>

        <div className="animate-fade-up [animation-delay:60ms] text-center" style={{ marginBottom: '12px' }}>
          <h1 className="gradient-text text-[clamp(26px,5vw,46px)] font-bold leading-[1.1] tracking-tight">
            {t(lang, 'welcomeTitle')}
          </h1>
        </div>
        <div className="animate-fade-up [animation-delay:100ms] text-center" style={{ maxWidth: '460px', marginBottom: '40px' }}>
          <p className="text-white/60 text-[15px] leading-[1.7]">{t(lang, 'welcomeSubtitle')}</p>
        </div>

        {/* Step progress */}
        <div className="animate-fade-up [animation-delay:130ms] flex items-center gap-2" style={{ marginBottom: '32px' }}>
          {([1, 2] as const).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step >= s ? 'bg-[#8B5CF6] text-white' : 'bg-white/[0.08] text-white/30'
                } ${step === s ? 'border-2 border-[#A78BFA]' : 'border-2 border-transparent'}`}
              >
                {step > s ? '✓' : s}
              </div>
              {i < 1 && <div className={`w-8 h-0.5 rounded-full ${step > s ? 'bg-[#8B5CF6]' : 'bg-white/[0.12]'}`} />}
            </div>
          ))}
        </div>

        {/* Form card */}
        <div className="glass-card animate-fade-up [animation-delay:160ms] w-full max-w-[460px]" style={{ padding: '36px' }}>

          {/* Step 1: Contact details */}
          {step === 1 && (
            <div className="flex flex-col" style={{ gap: '24px' }}>
              <div style={{ marginBottom: '4px' }}>
                <h2 className="text-lg font-bold text-white">{t(lang, 'stepContact')}</h2>
              </div>
              <div className="flex" style={{ gap: '14px' }}>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-white/60" style={{ marginBottom: '8px' }}>{t(lang, 'firstNameLabel')}</label>
                  <input className="input-field" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder={t(lang, 'firstNamePlaceholder')} />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-white/60" style={{ marginBottom: '8px' }}>{t(lang, 'lastNameLabel')}</label>
                  <input className="input-field" value={lastName} onChange={e => setLastName(e.target.value)} placeholder={t(lang, 'lastNamePlaceholder')} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/60" style={{ marginBottom: '8px' }}>{t(lang, 'emailLabel')}</label>
                <input className="input-field" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t(lang, 'emailPlaceholder')} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/60" style={{ marginBottom: '8px' }}>{t(lang, 'phoneLabel')}</label>
                <input className="input-field" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder={t(lang, 'phonePlaceholder')} />
              </div>
              {step1Error && <p className="text-[13px] text-red-300">{step1Error}</p>}
              <button className="btn-primary w-full" style={{ marginTop: '8px' }} onClick={handleStep1Next} disabled={!canProceedStep1}>
                {t(lang, 'next')} →
              </button>
            </div>
          )}

          {/* Step 2: Solution interest */}
          {step === 2 && (
            <div className="flex flex-col" style={{ gap: '24px' }}>
              <div style={{ marginBottom: '4px' }}>
                <div className="text-xs font-bold text-white/40 uppercase tracking-wider" style={{ marginBottom: '6px' }}>{t(lang, 'stepInterest')}</div>
                <h2 className="text-lg font-bold text-white">{t(lang, 'solutionTitle')}</h2>
                <p className="text-sm text-white/55" style={{ marginTop: '8px' }}>{t(lang, 'solutionSubtitle')}</p>
              </div>
              <div className="flex flex-col gap-3">
                {([
                  { id: 'sa' as Solution, icon: '🔐', color: '#8B5CF6', nameKey: 'solutionSa' as const, descKey: 'solutionSaDesc' as const },
                  { id: 'ii' as Solution, icon: '🛡️', color: '#06B6D4', nameKey: 'solutionIi' as const, descKey: 'solutionIiDesc' as const },
                  { id: 'bc' as Solution, icon: '📞', color: '#F97316', nameKey: 'solutionBc' as const, descKey: 'solutionBcDesc' as const },
                ]).map(s => {
                  const selected = solutions.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      onClick={() => toggleSolution(s.id)}
                      className="w-full p-5 rounded-xl text-left transition-all cursor-pointer"
                      style={{
                        background: selected ? `${s.color}18` : 'rgba(255,255,255,0.05)',
                        border: `1.5px solid ${selected ? s.color + '55' : 'rgba(255,255,255,0.12)'}`,
                      }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xl">{s.icon}</span>
                        <span className="font-bold text-white text-[15px]">{t(lang, s.nameKey)}</span>
                        {selected && <span className="ml-auto text-sm" style={{ color: s.color }}>✓</span>}
                      </div>
                      <p className="text-[13px] text-white/60 leading-relaxed pl-9">{t(lang, s.descKey)}</p>
                    </button>
                  );
                })}
              </div>
              {error && <p className="text-[13px] text-red-300 text-center">{error}</p>}
              <button className="btn-primary w-full" onClick={handleSubmit} disabled={solutions.length === 0 || loading}>
                {loading ? t(lang, 'submitting') : t(lang, 'submitBtn')}
              </button>
              <button className="text-sm text-white/50 hover:text-white/70 transition-colors cursor-pointer bg-transparent border-none" onClick={() => setStep(1)}>
                ← {t(lang, 'back')}
              </button>
            </div>
          )}
        </div>

        {/* Privacy note */}
        <p style={{ marginTop: '28px' }} className="text-[11px] text-white/35 max-w-[460px] text-center leading-relaxed">
          {t(lang, 'privacyNote')}
        </p>

        <p style={{ marginTop: '16px' }} className="text-[10px] text-white/15 font-mono">v2.0.0</p>
      </div>
    </main>
  );
}
