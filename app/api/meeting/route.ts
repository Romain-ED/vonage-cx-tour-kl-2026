import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const { contact_id, meeting_requested } = await req.json();
  if (!contact_id) return NextResponse.json({ error: 'Missing contact_id' }, { status: 400 });
  const { error } = await supabaseAdmin.get().from('contacts').update({ meeting_requested }).eq('id', contact_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
