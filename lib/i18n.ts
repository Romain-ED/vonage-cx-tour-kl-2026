export type Language = 'en';

export const translations = {
  en: {
    eventLabel: 'Exhibitor',
    eventName: 'Australian Financial Crime Summit 2026',
    eventDate: 'Sydney · 1–2 September 2026 · Intercontinental Double Bay',

    welcomeTitle: 'Welcome to the Vonage Booth',
    welcomeSubtitle: 'Register below to explore our solutions and access exclusive resources.',
    stepContact: 'Your Details',
    stepInterest: 'Your Interests',
    next: 'Next',
    back: 'Back',
    firstNameLabel: 'First Name',
    lastNameLabel: 'Last Name',
    firstNamePlaceholder: 'Jane',
    lastNamePlaceholder: 'Doe',
    emailLabel: 'Work Email',
    emailPlaceholder: 'jane@company.com',
    phoneLabel: 'Phone Number',
    phonePlaceholder: '+61 4XX XXX XXX (optional)',
    solutionTitle: 'What are you interested in?',
    solutionSubtitle: "Select one or more — we'll personalise your hub.",
    solutionSa: 'Silent Authentication',
    solutionSaDesc: 'Verify users seamlessly via mobile network authentication — no passcodes, no friction.',
    solutionIi: 'Identity Insights',
    solutionIiDesc: 'SIM swap detection, number verification, and fraud risk signals to strengthen identity confidence.',
    solutionBc: 'Branded Calling',
    solutionBcDesc: 'Display your company name, logo, and call reason on the lock screen — boosting answer rates and eliminating spoofing.',
    submitBtn: 'Get Started',
    submitting: 'Just a moment...',
    privacyNote: 'By providing your details, you acknowledge and agree that your information may be used by Vonage and its authorised partners for event-related communications, including post-event follow-up, and relevant marketing communications.',

    tabSa: 'Silent Authentication',
    tabIi: 'Identity Insights',
    tabBc: 'Branded Calling',
    hubTitle: 'Explore Our Solutions',
    hubSubtitle: 'Select a product below to learn more and access resources.',
    resources: 'Resources',

    saTitle: 'Vonage Verify & Silent Authentication',
    saTagline: 'Turnkey authentication — from OTP to zero-friction',
    saDesc: 'Vonage Verify is a full-service 2FA API that protects users across SMS, RCS, voice, WhatsApp, email, and Silent Authentication — with custom failover sequences and pay-per-success pricing. Silent Authentication takes it further: verify users instantly via the mobile network with zero user input.',
    saBenefit1: 'Verify API: multichannel OTPs with automatic failover across 6 channels',
    saBenefit2: 'Silent Auth: mobile network-level verification in milliseconds — no passcodes',
    saBenefit3: 'Eliminates OTP interception, SIM swap fraud, and SMS pumping',
    saBenefit4: 'Single API integration — global reach, local compliance, predictable costs',

    iiTitle: 'Vonage Identity Insights',
    iiTagline: 'Know your customer, stop fraud',
    iiDesc: 'Leverage real-time network signals to detect SIM swaps, verify phone numbers, and assess fraud risk — strengthening KYC and transaction security at scale.',
    iiBenefit1: 'SIM swap detection to prevent account takeovers',
    iiBenefit2: 'Number verification for trusted onboarding',
    iiBenefit3: 'Fraud risk signals from live network data',
    iiBenefit4: 'Identity confidence scoring for smarter decisioning',

    bcTitle: 'Vonage Branded Calling',
    bcTagline: 'Make every call trusted',
    bcDesc: "Display your company name, logo, and call reason directly on the customer's lock screen — boosting answer rates and eliminating fraud across voice channels.",
    bcBenefit1: 'Verified business calls with company name and logo',
    bcBenefit2: 'Call reason displayed before answering',
    bcBenefit3: 'Higher answer rates — customers trust the call',
    bcBenefit4: 'Fraud-proof: scammers cannot impersonate your brand',

    chatTitle: 'Ask Vonage AI',
    chatPlaceholder: 'E.g. How does silent authentication work?',
    chatSend: 'Send',
    chatWelcome: "Hi! I'm the Vonage product assistant. Ask me anything about Silent Authentication, Identity Insights, or Branded Calling.",
    chatLimit: "You've reached the message limit for this session.",

    meetingTitle: 'Talk to Our Team',
    meetingSubtitle: 'Interested in a deeper dive? Book a 1-on-1 with a Vonage specialist.',
    meetingCta: 'Book a Meeting',
    meetingDone: 'Meeting Booked!',
    meetingConfirm: 'A Vonage specialist will reach out to you after the event.',
    meetingCancel: 'Cancel Request',

    meetingPageTitle: 'Book a Meeting',
    meetingPageSubtitle: 'A Vonage specialist will reach out to you shortly after the event.',
    meetingContactDetails: 'Confirm Your Details',
    meetingEmailConfirm: 'Email',
    meetingPhoneConfirm: 'Phone Number',
    meetingNoteLabel: 'Anything specific you\u2019d like to discuss? (optional)',
    meetingNotePlaceholder: 'E.g. I\u2019d like to understand how Silent Authentication integrates with our existing fraud stack...',
    meetingSubmit: 'Confirm Booking',
    meetingSubmitting: 'Booking...',

    thankyouTitle: "You're All Set!",
    thankyouSubtitle: 'Thanks for visiting the Vonage booth at the Australian Financial Crime Summit 2026.',
    thankyouDetail: 'A Vonage specialist will reach out after the event. We look forward to exploring how our solutions can strengthen your fraud defences.',
    thankyouEvent: 'Sydney · 1–2 September 2026 · Intercontinental Double Bay',
    backToHub: 'Back to Solutions',
  },
};

export const languageNames: Record<Language, string> = {
  en: 'English',
};

export function t(lang: Language, key: keyof typeof translations['en']): string {
  return translations.en[key] ?? key;
}
