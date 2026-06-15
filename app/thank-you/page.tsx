'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Language, t } from '@/lib/i18n';

export default function ThankYouPage() {
  const router = useRouter();
  const [lang, setLang] = useState<Language>('en');
  const [name, setName] = useState('');

  useEffect(() => {
    const storedLang = sessionStorage.getItem('lang') as Language;
    if (storedLang) setLang(storedLang);
    setName(sessionStorage.getItem('contact_first_name') || '');
  }, []);

  return (
    <main className="mesh-bg min-h-screen flex flex-col">
      <header style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(8,6,20,0.85)', borderBottom: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <img src="/vonage-logo.png" alt="Vonage" style={{ height: '18px', width: 'auto', filter: 'brightness(0) invert(1)' }} />
          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '14px' }}>×</span>
          <img src="https://www.genesys.com/wp-content/themes/genesys-kraken/logo/genesys-com-full-color.svg" alt="Genesys" style={{ height: '16px', width: 'auto', filter: 'brightness(0) invert(1)' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '14px' }}>×</span>
          <img src="/expertstack-logo.png" alt="ExpertStack" style={{ height: '16px', width: 'auto', filter: 'brightness(0) invert(1)' }} />
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', textAlign: 'center' }}>

        {/* Animated check */}
        <div className="animate-fade-up" style={{ marginBottom: '28px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(249,115,22,0.3))', border: '2px solid rgba(139,92,246,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '38px', margin: '0 auto', boxShadow: '0 0 40px rgba(139,92,246,0.3)' }}>
            🎉
          </div>
        </div>

        <div className="animate-fade-up" style={{ animationDelay: '80ms', marginBottom: '12px' }}>
          <h1 className="gradient-text" style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: '700', lineHeight: '1.1', letterSpacing: '-0.03em' }}>
            {name ? `${name}, ${t(lang, 'thankyouTitle')}` : t(lang, 'thankyouTitle')}
          </h1>
        </div>

        <div className="animate-fade-up" style={{ animationDelay: '130ms', maxWidth: '460px', marginBottom: '40px' }}>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '17px', fontWeight: '500', marginBottom: '12px' }}>
            {t(lang, 'thankyouSubtitle')}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px', lineHeight: '1.7' }}>
            {t(lang, 'thankyouDetail')}
          </p>
        </div>

        {/* Event info card */}
        <div className="glass-card animate-fade-up" style={{ animationDelay: '180ms', padding: '24px 32px', marginBottom: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', maxWidth: '360px', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(249,115,22,0.15)', border: '1.5px solid rgba(249,115,22,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>📅</div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#FFFFFF' }}>CX Tour KL & Taipei 2026</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginTop: '2px' }}>{t(lang, 'thankyouEvent')}</div>
            </div>
          </div>
          <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.07)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(139,92,246,0.15)', border: '1.5px solid rgba(139,92,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>📍</div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#FFFFFF' }}>W Kuala Lumpur</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginTop: '2px' }}>Jalan Ampang, Kuala Lumpur</div>
            </div>
          </div>
        </div>

        <div className="animate-fade-up" style={{ animationDelay: '220ms' }}>
          <button className="btn-outline" onClick={() => router.push('/hub')} style={{ fontSize: '14px' }}>
            ← {t(lang, 'backToHub')}
          </button>
        </div>

        <p style={{ marginTop: '32px', fontSize: '12px', color: 'rgba(255,255,255,0.2)' }}>
          Vonage — A part of Ericsson
        </p>
      </div>
    </main>
  );
}
