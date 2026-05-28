import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const { name, email, language } = await req.json();
  if (!name || !email) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  const db = supabaseAdmin.get();
  const { data, error } = await db.from('contacts').insert({ name, email, language, meeting_requested: false }).select().single();
  if (error) {
    if (error.code === '23505') {
      const { data: existing } = await db.from('contacts').select().eq('email', email).single();
      return NextResponse.json(existing);
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}
