import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { supabaseAdmin } from '@/lib/supabase';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a helpful product assistant for Vonage (part of Ericsson) at the Genesys CX Tour Kuala Lumpur 2026 event. 
You ONLY answer questions about:
1. Vonage Branded Calling - displays company name, logo, and call reason on the recipient's lock screen. Boosts call answer rates, fraud-proof, enables click-to-call from apps/websites, global pricing with no carrier contracts needed.
2. Vonage Network APIs - leverages mobile network capabilities including: Silent Authentication (no OTPs needed), SIM Swap Detection (prevent account takeovers), Network-powered KYC and onboarding, Quality on Demand (5G network slicing, coming soon), Network Insights (population density data, coming soon), Location Services (spoof-proof geolocation, coming soon). Part of Ericsson's Aduna joint venture. Market projected at $34B by 2030.
3. General context about the event (Genesys CX Tour KL 2026, 23 June, W Kuala Lumpur) and Vonage's role as Gold Partner.

If asked about anything else, politely explain that you can only help with Vonage Branded Calling and Network APIs at this event, and invite them to ask about those products instead.

Keep responses concise (2-4 sentences max), friendly and professional. Avoid technical jargon unless the user asks technical questions.
When relevant, encourage them to request a 1-on-1 meeting with the Vonage team.`;

export async function POST(req: NextRequest) {
  const { message, history, lang, contact_id } = await req.json();

  const langInstruction = lang === 'ms' ? ' Please respond in Bahasa Malaysia.'
    : lang === 'zh' ? ' Please respond in Simplified Chinese (普通话).'
    : '';

  const messages = [
    ...history.slice(1).map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user' as const, content: message + langInstruction },
  ];

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 300,
      system: SYSTEM_PROMPT + langInstruction,
      messages,
    });

    const reply = response.content[0].type === 'text' ? response.content[0].text : 'Sorry, I could not generate a response.';

    // Log both turns to the database (fire-and-forget)
    const db = supabaseAdmin.get();
    const rows = [
      { contact_id: contact_id || null, role: 'user', content: message, lang },
      { contact_id: contact_id || null, role: 'assistant', content: reply, lang },
    ];
    db.from('chat_messages').insert(rows).then(() => {});

    return NextResponse.json({ reply });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ reply: 'Sorry, I\'m having trouble right now. Please try again.' }, { status: 500 });
  }
}
