import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const { contact_id, meeting_requested, meeting_note, email, phone } = await req.json();
  if (!contact_id) return NextResponse.json({ error: 'Missing contact_id' }, { status: 400 });

  const db = supabaseAdmin.get();

  // Validate that the contact_id actually exists in the database
  const { data: contact, error: lookupError } = await db
    .from('contacts')
    .select('id')
    .eq('id', contact_id)
    .single();

  if (lookupError || !contact) {
    return NextResponse.json({ error: 'Invalid contact_id' }, { status: 404 });
  }

  const updates: Record<string, unknown> = { meeting_requested };
  if (meeting_note !== undefined) updates.meeting_note = meeting_note;
  if (email) updates.email = email;
  if (phone) updates.phone = phone;

  const { error } = await db.from('contacts').update(updates).eq('id', contact_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
