'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Language, t } from '@/lib/i18n';
import { CxTourBanner } from '@/components/CxTourBanner';

export default function ThankYouPage() {
  const router = useRouter();
  const lang: Language = 'en';
  const [name, setName] = useState('');

  useEffect(() => {
    setName(sessionStorage.getItem('contact_first_name') || '');
  }, []);

  return (
    <main className="mesh-bg min-h-screen flex flex-col">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 24px 48px', textAlign: 'center' }}>
        {/* Animated check */}
        <div className="animate-fade-up" style={{ marginBottom: '32px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(249,115,22,0.3))', border: '2px solid rgba(139,92,246,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '38px', margin: '0 auto', boxShadow: '0 0 40px rgba(139,92,246,0.3)' }}>
            🎉
          </div>
        </div>

        <div className="animate-fade-up [animation-delay:80ms]" style={{ marginBottom: '16px' }}>
          <h1 className="gradient-text" style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            {name ? `${name}, ${t(lang, 'thankyouTitle')}` : t(lang, 'thankyouTitle')}
          </h1>
        </div>

        <div className="animate-fade-up [animation-delay:130ms]" style={{ maxWidth: '460px', marginBottom: '40px' }}>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '17px', fontWeight: 500, marginBottom: '12px' }}>
            {t(lang, 'thankyouSubtitle')}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px', lineHeight: 1.7 }}>
            {t(lang, 'thankyouDetail')}
          </p>
        </div>

        {/* Event banner */}
        <div className="animate-fade-up [animation-delay:180ms]" style={{ maxWidth: '460px', width: '100%', marginBottom: '36px' }}>
          <CxTourBanner />
        </div>

        <div className="animate-fade-up [animation-delay:220ms]">
          <button className="btn-outline" style={{ fontSize: '14px' }} onClick={() => router.push('/hub')}>
            ← {t(lang, 'backToHub')}
          </button>
        </div>

        <p style={{ marginTop: '32px', fontSize: '11px', color: 'rgba(255,255,255,0.4)', maxWidth: '460px', textAlign: 'center', lineHeight: 1.7 }}>
          {t(lang, 'privacyNote')}
        </p>

        <p style={{ marginTop: '16px', fontSize: '12px', color: 'rgba(255,255,255,0.2)' }}>
          Vonage — A part of Ericsson
        </p>
      </div>
    </main>
  );
}
