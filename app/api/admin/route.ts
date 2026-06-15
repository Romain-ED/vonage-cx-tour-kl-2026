import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function DELETE(req: NextRequest) {
  const password = req.headers.get('x-admin-password');
  if (password !== process.env.ADMIN_PASSWORD) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = supabaseAdmin.get();
  await Promise.all([
    db.from('chat_messages').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
    db.from('analytics_events').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
    db.from('contacts').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
  ]);
  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  const password = req.headers.get('x-admin-password');
  if (password !== process.env.ADMIN_PASSWORD) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = supabaseAdmin.get();
  const [contacts, analytics, chats] = await Promise.all([
    db.from('contacts').select('*').order('created_at', { ascending: false }),
    db.from('analytics_events').select('*').order('created_at', { ascending: false }),
    db.from('chat_messages')
      .select('*, contacts(id, name, email)')
      .order('created_at', { ascending: true }),
  ]);

  if (contacts.error) return NextResponse.json({ error: contacts.error.message }, { status: 500 });
  return NextResponse.json({
    contacts: contacts.data,
    analytics: analytics.data || [],
    chats: chats.data || [],
    llm_key_set: !!process.env.GOOGLE_API_KEY,
  });
}
