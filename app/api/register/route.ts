import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const { first_name, last_name, email, phone, language, solutions } = await req.json();
  if (!first_name || !last_name || !email) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

  const name = `${first_name} ${last_name}`.trim();
  const db = supabaseAdmin.get();

  const { data, error } = await db
    .from('contacts')
    .insert({ name, first_name, last_name, email, phone: phone || null, language, solutions, meeting_requested: false })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      const { data: existing } = await db.from('contacts').select().eq('email', email).single();
      return NextResponse.json(existing);
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}
