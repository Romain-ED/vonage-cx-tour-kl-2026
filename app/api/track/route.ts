import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const { session_id, contact_id, event_type, event_data } = await req.json();
  if (!session_id || !event_type) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const { error } = await supabaseAdmin.get()
    .from('analytics_events')
    .insert({ session_id, contact_id: contact_id || null, event_type, event_data: event_data || {} });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
