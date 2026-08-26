'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Language, t } from '@/lib/i18n';

export default function MeetingPage() {
  const router = useRouter();
  const lang: Language = 'en';
  const [contactId, setContactId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
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
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 24px 48px' }}>
        <div className="animate-fade-up" style={{ textAlign: 'center', marginBottom: '12px' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>🤝</div>
          <h1 style={{ fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em', marginBottom: '12px' }}>
            {t(lang, 'meetingPageTitle')}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '15px', maxWidth: '420px', lineHeight: 1.65, margin: '0 auto 40px' }}>
            {t(lang, 'meetingPageSubtitle')}
          </p>
        </div>

        <div className="glass-card animate-fade-up [animation-delay:80ms]" style={{ width: '100%', maxWidth: '540px', padding: '28px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
                {t(lang, 'meetingContactDetails')}
              </div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '6px' }}>{t(lang, 'firstNameLabel')}</label>
                  <input className="input-field" type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder={t(lang, 'firstNamePlaceholder')} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '6px' }}>{t(lang, 'lastNameLabel')}</label>
                  <input className="input-field" type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder={t(lang, 'lastNamePlaceholder')} />
                </div>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '6px' }}>{t(lang, 'meetingEmailConfirm')} *</label>
                <input className="input-field" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder={t(lang, 'emailPlaceholder')} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '6px' }}>{t(lang, 'meetingPhoneConfirm')}</label>
                <input className="input-field" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder={t(lang, 'phonePlaceholder')} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '6px' }}>{t(lang, 'meetingNoteLabel')}</label>
              <textarea
                className="input-field"
                style={{ resize: 'vertical', minHeight: '100px' }}
                rows={4}
                placeholder={t(lang, 'meetingNotePlaceholder')}
                value={note}
                onChange={e => setNote(e.target.value)}
              />
            </div>

            {error && <p style={{ fontSize: '13px', color: '#FCA5A5', textAlign: 'center' }}>{error}</p>}

            <button type="submit" className="btn-orange" style={{ width: '100%', marginTop: '4px' }} disabled={loading || !email.trim()}>
              {loading ? t(lang, 'meetingSubmitting') : t(lang, 'meetingSubmit')}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
