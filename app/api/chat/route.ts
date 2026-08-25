import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabaseAdmin } from '@/lib/supabase';
import { rateLimit } from '@/lib/rate-limit';

const MAX_TURNS = 5;

const SYSTEM_PROMPT = `You are a tightly scoped Vonage product assistant for the Australian Financial Crime Summit (AFC) 2026 event in Sydney.

You may ONLY answer questions about:
1. Vonage Silent Authentication — mobile network-based verification without passcodes
2. Vonage Identity Insights — SIM swap detection, number verification, fraud risk signals
3. Vonage Branded Calling — verified business calls with company name, logo, and call reason display
4. How these Vonage Mobile Identity & Fraud Protection solutions help financial services combat fraud, strengthen KYC, and improve customer trust

You must NOT answer questions outside this scope.

For out-of-scope questions, respond with:
"I'm here to help with Vonage's fraud prevention and identity solutions. For other topics, please speak with a Vonage representative at the booth."

Rules:
- Keep every answer under 4 sentences.
- Prefer short, direct answers.
- Do not speculate.
- Do not mention limitations unless necessary.
- Do not invent product capabilities, pricing, customer names, roadmap items, or technical details.
- If the answer is not in your approved knowledge, say: "I don't have that detail available, but the Vonage team at the booth can help."
- Never provide confidential, internal, or unreleased information.
- Never discuss competitors in detail.
- Never provide legal, financial, medical, HR, or regulatory advice.

Context about the event:
- Australian Financial Crime Summit (AFC) 2026
- September 1–2, 2026 at Intercontinental Double Bay, Sydney
- Focused on Tranche 2 compliance, Regtech solutions, and emerging financial crime threats
- Attendees are financial crime professionals from banks, fintechs, regulators, and compliance teams

Tone:
Friendly, professional, concise, and focused on helping attendees understand how Vonage solutions address financial crime challenges.`;

export async function POST(req: NextRequest) {
  const { message, lang, contact_id } = await req.json();

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return NextResponse.json({ reply: 'Please enter a message.' }, { status: 400 });
  }

  // --- Rate limiting ---
  const rateLimitKey = contact_id || req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anonymous';
  const limit = rateLimit(rateLimitKey, 10, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { reply: 'You\'re sending messages too quickly. Please wait a moment and try again.' },
      { status: 429 }
    );
  }

  // --- Server-side turn enforcement ---
  const db = supabaseAdmin.get();

  if (contact_id) {
    const { count } = await db
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('contact_id', contact_id)
      .eq('role', 'user');

    if ((count ?? 0) >= MAX_TURNS) {
      return NextResponse.json(
        { reply: 'You\'ve reached the message limit for this session. Please speak with a Vonage representative for more help.' },
        { status: 429 }
      );
    }
  }

  // --- Build chat history from the database (server-side truth) ---
  let geminiHistory: { role: string; parts: { text: string }[] }[] = [];

  if (contact_id) {
    const { data: dbMessages } = await db
      .from('chat_messages')
      .select('role, content')
      .eq('contact_id', contact_id)
      .order('created_at', { ascending: true });

    if (dbMessages && dbMessages.length > 0) {
      geminiHistory = dbMessages.map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));
    }
  }

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
  const model = genAI.getGenerativeModel(
    {
      model: 'gemini-3.5-flash',
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: { maxOutputTokens: 300 },
    },
    { apiVersion: 'v1beta' },
  );

  try {
    const chat = model.startChat({ history: geminiHistory });
    const result = await chat.sendMessage(message);
    const reply = result.response.text() || 'Sorry, I could not generate a response.';

    // --- Persist both turns to the database ---
    const rows = [
      { contact_id: contact_id || null, role: 'user', content: message, lang: lang || 'en' },
      { contact_id: contact_id || null, role: 'assistant', content: reply, lang: lang || 'en' },
    ];

    const { error: insertError } = await db.from('chat_messages').insert(rows);
    if (insertError) {
      console.error('[chat] Failed to persist messages:', insertError.message);
    }

    return NextResponse.json({ reply });
  } catch (e) {
    console.error('[chat] Gemini error:', e instanceof Error ? e.message : e);
    return NextResponse.json({ reply: 'Sorry, I\'m having trouble right now. Please try again.' }, { status: 500 });
  }
}
