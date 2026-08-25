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
      <header className="flex items-center justify-between px-6 py-4 bg-[rgba(8,6,20,0.85)] border-b border-white/[0.08] backdrop-blur-xl sticky top-0 z-40">
        <img src="/vonage-logo.png" alt="Vonage" className="h-[18px] w-auto invert" />
        <button
          onClick={() => router.back()}
          className="bg-white/[0.07] border border-white/[0.12] rounded-lg text-white/60 cursor-pointer text-[13px] font-medium px-3.5 py-[7px] hover:text-white/80 hover:border-white/20 transition-colors"
        >
          ← {t(lang, 'back')}
        </button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        <div className="animate-fade-up text-center mb-2">
          <div className="text-[40px] mb-4">🤝</div>
          <h1 className="text-[clamp(22px,4vw,32px)] font-bold text-white tracking-tight mb-2.5">
            {t(lang, 'meetingPageTitle')}
          </h1>
          <p className="text-white/55 text-[15px] max-w-[420px] leading-[1.65] mx-auto mb-9">
            {t(lang, 'meetingPageSubtitle')}
          </p>
        </div>

        <div className="glass-card animate-fade-up [animation-delay:80ms] w-full max-w-[460px] p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
            <div className="pb-[18px] border-b border-white/[0.08]">
              <div className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3.5">
                {t(lang, 'meetingContactDetails')}
              </div>
              <div className="flex gap-2.5 mb-3">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-white/60 mb-1.5">{t(lang, 'firstNameLabel')}</label>
                  <input className="input-field" type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder={t(lang, 'firstNamePlaceholder')} />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-white/60 mb-1.5">{t(lang, 'lastNameLabel')}</label>
                  <input className="input-field" type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder={t(lang, 'lastNamePlaceholder')} />
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-xs font-semibold text-white/60 mb-1.5">{t(lang, 'meetingEmailConfirm')} *</label>
                <input className="input-field" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder={t(lang, 'emailPlaceholder')} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1.5">{t(lang, 'meetingPhoneConfirm')}</label>
                <input className="input-field" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder={t(lang, 'phonePlaceholder')} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/60 mb-1.5">{t(lang, 'meetingNoteLabel')}</label>
              <textarea
                className="input-field resize-y min-h-[100px]"
                rows={4}
                placeholder={t(lang, 'meetingNotePlaceholder')}
                value={note}
                onChange={e => setNote(e.target.value)}
              />
            </div>

            {error && <p className="text-[13px] text-red-300 text-center">{error}</p>}

            <button type="submit" className="btn-orange w-full mt-1" disabled={loading || !email.trim()}>
              {loading ? t(lang, 'meetingSubmitting') : t(lang, 'meetingSubmit')}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
