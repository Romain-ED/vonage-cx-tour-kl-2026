export function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let sid = sessionStorage.getItem('session_id');
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem('session_id', sid);
  }
  return sid;
}

export async function track(event_type: string, event_data: Record<string, string> = {}) {
  try {
    const session_id = getSessionId();
    const contact_id = sessionStorage.getItem('contact_id') || undefined;
    await fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id, contact_id, event_type, event_data }),
    });
  } catch { /* silent — never break UX for analytics */ }
}
