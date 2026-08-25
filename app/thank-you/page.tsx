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
      <header className="flex items-center justify-center px-8 py-4 bg-[rgba(8,6,20,0.85)] border-b border-white/[0.08] backdrop-blur-xl">
        <img src="/vonage-logo.png" alt="Vonage" className="h-[18px] w-auto invert" />
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
        {/* Animated check */}
        <div className="animate-fade-up mb-7">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[rgba(139,92,246,0.3)] to-[rgba(249,115,22,0.3)] border-2 border-[rgba(139,92,246,0.5)] flex items-center justify-center text-[38px] mx-auto shadow-[0_0_40px_rgba(139,92,246,0.3)]">
            🎉
          </div>
        </div>

        <div className="animate-fade-up [animation-delay:80ms] mb-3">
          <h1 className="gradient-text text-[clamp(28px,5vw,44px)] font-bold leading-[1.1] tracking-tight">
            {name ? `${name}, ${t(lang, 'thankyouTitle')}` : t(lang, 'thankyouTitle')}
          </h1>
        </div>

        <div className="animate-fade-up [animation-delay:130ms] max-w-[460px] mb-10">
          <p className="text-white/70 text-[17px] font-medium mb-3">
            {t(lang, 'thankyouSubtitle')}
          </p>
          <p className="text-white/50 text-[15px] leading-[1.7]">
            {t(lang, 'thankyouDetail')}
          </p>
        </div>

        {/* Event banner */}
        <div className="animate-fade-up [animation-delay:180ms] max-w-[460px] w-full mb-8">
          <CxTourBanner />
        </div>

        <div className="animate-fade-up [animation-delay:220ms]">
          <button className="btn-outline text-sm" onClick={() => router.push('/hub')}>
            ← {t(lang, 'backToHub')}
          </button>
        </div>

        <p className="mt-8 text-[11px] text-white/40 max-w-[460px] text-center leading-relaxed">
          {t(lang, 'privacyNote')}
        </p>

        <p className="mt-4 text-xs text-white/20">
          Vonage — A part of Ericsson
        </p>
      </div>
    </main>
  );
}
