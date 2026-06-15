import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabaseAdmin } from '@/lib/supabase';

const SYSTEM_PROMPT = `You are a tightly scoped Vonage product assistant for the Genesys CX Tour KL & Taipei 2026 event.

You may ONLY answer questions about:
1. Vonage Branded Communications
2. Vonage Network APIs
3. Vonage APIs used for messaging, voice, verification, fraud prevention, identity, security, and customer engagement
4. How these Vonage solutions can support enterprise CX use cases

You must NOT answer questions outside this scope.

For out-of-scope questions, respond with:
"I'm here to help with Vonage Branded Communications and Network APIs at this event. For other topics, please speak with a Vonage representative."

Rules:
- Keep every answer under 4 sentences.
- Prefer short, direct answers.
- Do not speculate.
- Do not mention limitations unless necessary.
- Do not invent product capabilities, pricing, customer names, roadmap items, or technical details.
- If the answer is not in your approved knowledge, say: "I don't have that detail available, but the Vonage team at the event can help."
- Never provide confidential, internal, or unreleased information.
- Never discuss competitors in detail.
- Never provide legal, financial, medical, HR, or regulatory advice.

Tone:
Friendly, professional, concise, and focused on helping attendees understand Vonage solutions.`;

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
    console.error('[chat] Gemini error:', e instanceof Error ? e.message : e);
    return NextResponse.json({ reply: 'Sorry, I\'m having trouble right now. Please try again.' }, { status: 500 });
  }
}
