'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Language, t } from '@/lib/i18n';

export default function MeetingPage() {
  const router = useRouter();
  const [lang, setLang] = useState<Language>('en');
  const [contactId, setContactId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const storedLang = sessionStorage.getItem('lang') as Language;
    if (storedLang) setLang(storedLang);
    setContactId(sessionStorage.getItem('contact_id') || '');
    setFirstName(sessionStorage.getItem('contact_first_name') || '');
    setLastName(sessionStorage.getItem('contact_last_name') || '');
    setEmail(sessionStorage.getItem('contact_email') || '');
    setPhone(sessionStorage.getItem('contact_phone') || '');
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/meeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact_id: contactId, meeting_requested: true, meeting_note: note.trim() || null, email: email.trim(), phone: phone.trim() || null }),
      });
      if (!res.ok) throw new Error('Failed');
      sessionStorage.setItem('contact_email', email.trim());
      sessionStorage.setItem('contact_phone', phone.trim());
      router.push('/thank-you');
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <main className="mesh-bg min-h-screen flex flex-col">
      <header style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(8,6,20,0.85)', borderBottom: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
        <img src="/vonage-logo.png" alt="Vonage" style={{ height: '18px', width: 'auto', filter: 'brightness(0) invert(1)' }} />
        <button onClick={() => router.back()} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '13px', fontWeight: '500', padding: '7px 14px', fontFamily: 'inherit' }}>
          ← {t(lang, 'back')}
        </button>
      </header>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>

        <div className="animate-fade-up" style={{ textAlign: 'center', marginBottom: '8px' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>🤝</div>
          <h1 style={{ fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: '700', color: '#FFFFFF', letterSpacing: '-0.025em', marginBottom: '10px' }}>
            {t(lang, 'meetingPageTitle')}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '15px', maxWidth: '420px', lineHeight: '1.65', margin: '0 auto 36px' }}>
            {t(lang, 'meetingPageSubtitle')}
          </p>
        </div>

        <div className="glass-card animate-fade-up" style={{ animationDelay: '80ms', width: '100%', maxWidth: '460px', padding: '32px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

            <div style={{ paddingBottom: '18px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>
                {t(lang, 'meetingContactDetails')}
              </div>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.6)', marginBottom: '6px' }}>{t(lang, 'firstNameLabel')}</label>
                  <input className="input-field" type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder={t(lang, 'firstNamePlaceholder')} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.6)', marginBottom: '6px' }}>{t(lang, 'lastNameLabel')}</label>
                  <input className="input-field" type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder={t(lang, 'lastNamePlaceholder')} />
                </div>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.6)', marginBottom: '6px' }}>{t(lang, 'meetingEmailConfirm')} *</label>
                <input className="input-field" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder={t(lang, 'emailPlaceholder')} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.6)', marginBottom: '6px' }}>{t(lang, 'meetingPhoneConfirm')}</label>
                <input className="input-field" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder={t(lang, 'phonePlaceholder')} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.6)', marginBottom: '6px' }}>{t(lang, 'meetingNoteLabel')}</label>
              <textarea
                className="input-field"
                rows={4}
                placeholder={t(lang, 'meetingNotePlaceholder')}
                value={note}
                onChange={e => setNote(e.target.value)}
                style={{ resize: 'vertical', minHeight: '100px' }}
              />
            </div>

            {error && <p style={{ fontSize: '13px', color: '#FCA5A5', textAlign: 'center' }}>{error}</p>}

            <button type="submit" className="btn-orange" disabled={loading || !email.trim()} style={{ width: '100%', marginTop: '4px' }}>
              {loading ? t(lang, 'meetingSubmitting') : t(lang, 'meetingSubmit')}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
