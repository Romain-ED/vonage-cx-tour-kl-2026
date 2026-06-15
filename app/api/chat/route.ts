import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabaseAdmin } from '@/lib/supabase';

const SYSTEM_PROMPT = `You are a helpful product assistant for Vonage (part of Ericsson) at the Genesys CX Tour KL & Taipei 2026 event.
You ONLY answer questions about:
1. Vonage Branded Communications - displays company name, logo, and call reason on the recipient's lock screen. Boosts call answer rates, fraud-proof, enables click-to-call from apps/websites, global pricing with no carrier contracts needed. Also covers RCS and messaging channels.
2. Vonage Network APIs - leverages mobile network capabilities including: Silent Authentication (no OTPs needed), SIM Swap Detection (prevent account takeovers), Network-powered KYC and onboarding, Quality on Demand (5G network slicing, coming soon), Network Insights (population density data, coming soon), Location Services (spoof-proof geolocation, coming soon). Part of Ericsson's Aduna joint venture. Market projected at $34B by 2030.
3. General context about the event (Genesys CX Tour KL & Taipei 2026 — Kuala Lumpur on 23 June at W Kuala Lumpur, Taipei date TBC) and Vonage's role as Gold Partner.

If asked about anything else, politely explain that you can only help with Vonage Branded Communications and Network APIs at this event, and invite them to ask about those products instead.

Keep responses concise (2-4 sentences max), friendly and professional. Avoid technical jargon unless the user asks technical questions.
When relevant, encourage them to request a 1-on-1 meeting with the Vonage team.`;

export async function POST(req: NextRequest) {
  const { message, history, lang, contact_id } = await req.json();

  const langInstruction = lang === 'ms' ? ' Please respond in Bahasa Malaysia.'
    : lang === 'zh' ? ' Please respond in Simplified Chinese (普通话).'
    : '';

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
  const model = genAI.getGenerativeModel(
    {
      model: 'gemini-2.0-flash',
      systemInstruction: SYSTEM_PROMPT + langInstruction,
      generationConfig: { maxOutputTokens: 300 },
    },
    { apiVersion: 'v1beta' },
  );

  const geminiHistory = history.slice(1).map((m: { role: string; content: string }) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  try {
    const chat = model.startChat({ history: geminiHistory });
    const result = await chat.sendMessage(message + langInstruction);
    const reply = result.response.text() || 'Sorry, I could not generate a response.';

    // Log both turns to the database (fire-and-forget)
    const db = supabaseAdmin.get();
    const rows = [
      { contact_id: contact_id || null, role: 'user', content: message, lang },
      { contact_id: contact_id || null, role: 'assistant', content: reply, lang },
    ];
    db.from('chat_messages').insert(rows).then(() => {});

    return NextResponse.json({ reply });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[chat] Gemini error:', msg);
    return NextResponse.json({ reply: 'Sorry, I\'m having trouble right now. Please try again.', _debug: msg }, { status: 500 });
  }
}
