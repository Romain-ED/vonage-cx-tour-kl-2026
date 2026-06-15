import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

function sanitizePhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const stripped = raw.trim();
  if (!stripped) return null;
  // Keep leading +, remove everything except digits
  const normalized = stripped.startsWith('+')
    ? '+' + stripped.slice(1).replace(/\D/g, '')
    : stripped.replace(/\D/g, '');
  return normalized.length >= 7 ? normalized : null;
}

export async function POST(req: NextRequest) {
  const { first_name, last_name, email, phone, language, solutions } = await req.json();
  if (!first_name || !last_name || !email) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
  if (!emailValid) return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });

  const name = `${first_name} ${last_name}`.trim();
  const db = supabaseAdmin.get();

  const { data, error } = await db
    .from('contacts')
    .insert({ name, first_name, last_name, email: email.trim().toLowerCase(), phone: sanitizePhone(phone), language, solutions, meeting_requested: false })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      const { data: existing } = await db.from('contacts').select().eq('email', email.trim().toLowerCase()).single();
      return NextResponse.json(existing);
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}
