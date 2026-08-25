'use client';

import { useState, useEffect } from 'react';

interface Contact {
  id: string; name: string; first_name?: string; last_name?: string;
  email: string; phone?: string; language: string;
  solutions?: string[]; meeting_requested: boolean; meeting_note?: string; created_at: string;
}
interface AnalyticsEvent {
  id: string; session_id: string; contact_id: string | null;
  event_type: string; event_data: Record<string, string>; created_at: string;
}
interface ChatMessage {
  id: string; contact_id: string | null; role: 'user' | 'assistant';
  content: string; lang: string; created_at: string;
  contacts?: { id: string; name: string; email: string } | null;
}
interface ChatThread {
  contact_id: string | null;
  contact_name: string;
  contact_email: string;
  lang: string;
  messages: ChatMessage[];
}

const LLM_MODEL = 'gemini-3.5-flash';
const LLM_MAX_TOKENS = 300;
const LLM_SYSTEM_PROMPT = `Tightly scoped to: Vonage Silent Authentication, Identity Insights, and Branded Calling for financial crime prevention. Out-of-scope questions redirect to the Vonage team. Rules: ≤4 sentences, no speculation, no invented details, no competitors.`;

const SA_RESOURCES = [
  { key: 'datasheet',      icon: '📄', label: 'Datasheet' },
  { key: 'developer-docs', icon: '🔗', label: 'Dev Docs' },
] as const;

const II_RESOURCES = [
  { key: 'datasheet',      icon: '📄', label: 'Datasheet' },
  { key: 'developer-docs', icon: '🔗', label: 'Dev Docs' },
] as const;

const BC_RESOURCES = [
  { key: 'datasheet',      icon: '📄', label: 'Datasheet' },
  { key: 'developer-docs', icon: '🔗', label: 'Dev Docs' },
] as const;

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [contacts, setContacts] = useState<Contact[] | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsEvent[]>([]);
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'overview' | 'contacts' | 'analytics' | 'chats' | 'ai'>('overview');
  const [expandedThread, setExpandedThread] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const [llmKeySet, setLlmKeySet] = useState(false);
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('admin_password');
    if (saved) { setPassword(saved); loginWithPassword(saved); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loginWithPassword(pwd: string) {
    setLoading(true); setError('');
    const res = await fetch('/api/admin', { headers: { 'x-admin-password': pwd } });
    if (res.status === 401) {
      localStorage.removeItem('admin_password');
      setError('Incorrect password.'); setLoading(false); return;
    }
    const data = await res.json();
    localStorage.setItem('admin_password', pwd);
    setContacts(data.contacts);
    setAnalytics(data.analytics || []);
    setChats(data.chats || []);
    setLlmKeySet(data.llm_key_set ?? false);
    setLoading(false);
  }

  async function login() { await loginWithPassword(password); }

  function logout() {
    localStorage.removeItem('admin_password');
    setContacts(null); setPassword(''); setError('');
  }

  async function resetData() {
    if (!confirm('Delete ALL contacts, analytics and chat data? This cannot be undone.')) return;
    setResetting(true);
    await fetch('/api/admin', { method: 'DELETE', headers: { 'x-admin-password': password } });
    setContacts([]); setAnalytics([]); setChats([]);
    setResetting(false);
  }

  function exportCsv() {
    if (!contacts) return;
    const rows = [
      ['First Name','Last Name','Email','Phone','Solutions','Meeting Requested','Meeting Note','Registered At'],
      ...contacts.map(c => [c.first_name ?? '', c.last_name ?? c.name ?? '', c.email, c.phone ?? '', (c.solutions ?? []).join('+'), c.meeting_requested ? 'Yes' : 'No', c.meeting_note ?? '', new Date(c.created_at).toLocaleString()])
    ];
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'vonage-afc-sydney-2026.csv'; a.click();
  }

  const uniqueSessions = new Set(analytics.map(e => e.session_id)).size;
  const bcViews = analytics.filter(e => e.event_type === 'product_view' && e.event_data?.product === 'branded_calling').length;
  const saViews = analytics.filter(e => e.event_type === 'product_view' && e.event_data?.product === 'silent_authentication').length;
  const iiViews = analytics.filter(e => e.event_type === 'product_view' && e.event_data?.product === 'identity_insights').length;
  const resourceClicks = analytics.filter(e => e.event_type === 'resource_click');
  const totalMeetings = contacts?.filter(c => c.meeting_requested).length ?? 0;
  const conversionRate = uniqueSessions > 0 ? Math.round(((contacts?.length ?? 0) / uniqueSessions) * 100) : 0;
  const enUsers = contacts?.length ?? 0;

  const rCount = (product: string, key: string) =>
    resourceClicks.filter(e => e.event_data?.product === product && e.event_data?.resource === key).length;

  const clickBreakdown: Record<string, number> = {};
  resourceClicks.forEach(e => {
    const prodMap: Record<string, string> = { silent_authentication: 'Silent Authentication', identity_insights: 'Identity Insights', branded_calling: 'Branded Calling' };
    const prod = prodMap[e.event_data?.product] ?? e.event_data?.product;
    const key = `${prod} — ${e.event_data?.resource}`;
    clickBreakdown[key] = (clickBreakdown[key] || 0) + 1;
  });
  const sortedClicks = Object.entries(clickBreakdown).sort((a, b) => b[1] - a[1]);
  const maxClicks = sortedClicks[0]?.[1] || 1;

  const chatThreads: ChatThread[] = [];
  const seen = new Map<string, ChatThread>();
  for (const msg of chats) {
    const key = msg.contact_id ?? 'anonymous';
    if (!seen.has(key)) {
      const thread: ChatThread = {
        contact_id: msg.contact_id,
        contact_name: msg.contacts?.name ?? 'Anonymous',
        contact_email: msg.contacts?.email ?? '—',
        lang: msg.lang, messages: [],
      };
      seen.set(key, thread); chatThreads.push(thread);
    }
    seen.get(key)!.messages.push(msg);
  }
  const totalChatMessages = chats.filter(m => m.role === 'user').length;
  const langMap: Record<string, string> = { en: 'English' };

  return (
    <main className="mesh-bg min-h-screen" style={{ padding: '32px 24px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>

        <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '600' }}>Vonage · Australian Financial Crime Summit 2026</div>
            <h1 style={{ fontSize: '30px', fontWeight: '700', letterSpacing: '-0.02em' }}>Admin Dashboard</h1>
          </div>
          {contacts && (
            <div style={{ display: 'flex', gap: '10px', marginTop: '24px', alignItems: 'center' }}>
              <button onClick={logout}
                style={{ padding: '9px 18px', borderRadius: '10px', border: '1.5px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.75)', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                Sign Out
              </button>
              <button onClick={resetData} disabled={resetting}
                style={{ padding: '9px 18px', borderRadius: '10px', border: '1.5px solid rgba(239,68,68,0.5)', background: 'rgba(239,68,68,0.1)', color: '#FCA5A5', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', opacity: resetting ? 0.5 : 1 }}>
                {resetting ? 'Resetting…' : '🗑 Reset Data'}
              </button>
            </div>
          )}
        </div>

        {!contacts ? (
          <div className="glass-card" style={{ maxWidth: '380px', padding: '36px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '24px' }}>Admin Login</h2>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>Signing in…</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <input className="input-field" type="password" placeholder="Enter admin password"
                  value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()} />
                {error && <p style={{ color: '#FF6B6B', fontSize: '13px' }}>{error}</p>}
                <button className="btn-primary" onClick={login} disabled={loading || !password} style={{ width: '100%' }}>Sign In</button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '12px', padding: '4px', width: 'fit-content' }}>
              {(['overview', 'contacts', 'chats', 'analytics', 'ai'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px', fontWeight: '600', transition: 'all 0.15s',
                    background: tab === t ? 'rgba(124,58,237,0.35)' : 'transparent',
                    color: tab === t ? '#C4B5FD' : 'rgba(255,255,255,0.75)' }}>
                  {t === 'ai' ? 'AI Config' : t.charAt(0).toUpperCase() + t.slice(1)}
                  {t === 'chats' && chatThreads.length > 0 && (
                    <span style={{ marginLeft: '6px', background: 'rgba(139,92,246,0.5)', borderRadius: '10px', padding: '1px 7px', fontSize: '11px', color: '#E9D5FF' }}>
                      {chatThreads.length}
                    </span>
                  )}
                  {t === 'ai' && (
                    <span style={{ marginLeft: '6px', width: '7px', height: '7px', borderRadius: '50%', display: 'inline-block', background: llmKeySet ? '#10B981' : '#EF4444', verticalAlign: 'middle' }} />
                  )}
                </button>
              ))}
            </div>

            {/* ── OVERVIEW ── */}
            {tab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '14px' }}>
                  <StatCard label="QR Scans" value={uniqueSessions} color="#7C3AED" sub="unique sessions" />
                  <StatCard label="Registrations" value={contacts.length} color="#10B981" sub={`${conversionRate}% conversion`} />
                  <StatCard label="Meeting Requests" value={totalMeetings} color="#FF4F1F" sub="1-on-1 interest" />
                  <StatCard label="Chat Messages" value={totalChatMessages} color="#06B6D4" sub={`${chatThreads.length} conversations`} />
                  <StatCard label="Branded Calling" value={bcViews} color="#F97316" sub="product views" />
                  <StatCard label="Silent Auth" value={saViews} color="#8B5CF6" sub="product views" />
                  <StatCard label="Identity Insights" value={iiViews} color="#06B6D4" sub="product views" />
                </div>

                {/* Journey Flow */}
                <div className="glass-card" style={{ padding: '28px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>User Journey</h3>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '32px' }}>Page flow · drop-offs in red</p>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <JNode icon="📱" label="QR / Landing" count={uniqueSessions} color="#7C3AED" />
                    <JArrow drop={uniqueSessions - contacts.length} base={uniqueSessions} />
                    <JNode icon="📝" label="/ (Register)" count={contacts.length} base={uniqueSessions} color="#10B981" />

                    <div style={{ width: '2px', height: '8px', background: 'rgba(255,255,255,0.2)' }} />
                    <div style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.1em', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: '6px', padding: '4px 14px' }}>
                      /hub — parallel actions
                    </div>

                    {/* 3-column hub branch */}
                    <div style={{ position: 'relative', display: 'flex', width: '100%', maxWidth: '720px' }}>
                      <div style={{ position: 'absolute', top: '10px', left: 'calc(100% / 6)', right: 'calc(100% / 6)', height: '2px', background: 'rgba(255,255,255,0.2)' }} />

                      {/* SA Column */}
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: '2px', height: '22px', background: 'rgba(255,255,255,0.2)' }} />
                        <JNode small icon="🔐" label="Silent Auth" count={saViews} base={contacts.length} color="#8B5CF6" />
                        {SA_RESOURCES.map(r => (
                          <div key={r.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ width: '2px', height: '8px', background: 'rgba(255,255,255,0.12)' }} />
                            <RNode icon={r.icon} label={r.label} count={rCount('silent_authentication', r.key)} color="#8B5CF6" />
                          </div>
                        ))}
                        <div style={{ flex: 1, minHeight: '16px', width: '2px', background: 'rgba(255,255,255,0.12)', marginTop: '8px' }} />
                      </div>

                      {/* Chat Column */}
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: '2px', height: '22px', background: 'rgba(255,255,255,0.2)' }} />
                        <JNode small icon="💬" label="Chat AI" count={chatThreads.length} base={contacts.length} color="#06B6D4" />
                        <div style={{ flex: 1, minHeight: '16px', width: '2px', background: 'rgba(255,255,255,0.12)', marginTop: '8px' }} />
                      </div>

                      {/* BC Column */}
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: '2px', height: '22px', background: 'rgba(255,255,255,0.2)' }} />
                        <JNode small icon="📞" label="Branded Calling" count={bcViews} base={contacts.length} color="#F97316" />
                        {BC_RESOURCES.map(r => (
                          <div key={r.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ width: '2px', height: '8px', background: 'rgba(255,255,255,0.12)' }} />
                            <RNode icon={r.icon} label={r.label} count={rCount('branded_calling', r.key)} color="#F97316" />
                          </div>
                        ))}
                        <div style={{ flex: 1, minHeight: '16px', width: '2px', background: 'rgba(255,255,255,0.12)', marginTop: '8px' }} />
                      </div>
                    </div>

                    {/* Bottom merge */}
                    <div style={{ display: 'flex', width: '100%', maxWidth: '720px', height: '20px' }}>
                      <div style={{ flex: 1, borderTop: '2px solid rgba(255,255,255,0.18)', borderRight: '2px solid rgba(255,255,255,0.18)', borderRadius: '0 8px 0 0' }} />
                      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                        <div style={{ width: '2px', height: '20px', background: 'rgba(255,255,255,0.18)' }} />
                      </div>
                      <div style={{ flex: 1, borderTop: '2px solid rgba(255,255,255,0.18)', borderLeft: '2px solid rgba(255,255,255,0.18)', borderRadius: '8px 0 0 0' }} />
                    </div>

                    <JArrow drop={contacts.length - totalMeetings} base={contacts.length} />
                    <JNode icon="🤝" label="/meeting" count={totalMeetings} base={contacts.length} color="#FF4F1F" />
                    <JArrow />
                    <JNode icon="🎉" label="/thank-you" count={totalMeetings} color="#F59E0B" />
                  </div>
                </div>

              </div>
            )}

            {/* ── CHATS ── */}
            {tab === 'chats' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '700' }}>
                    AI Agent Conversations
                    <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.65)', fontWeight: '500', marginLeft: '8px' }}>({chatThreads.length})</span>
                  </h2>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.7)' }}>{totalChatMessages} user messages total</div>
                </div>

                {chatThreads.length === 0 ? (
                  <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
                    <div style={{ fontSize: '36px', marginBottom: '12px' }}>💬</div>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>No chat conversations yet.</p>
                  </div>
                ) : (
                  chatThreads.map((thread, idx) => {
                    const threadKey = thread.contact_id ?? `anon-${idx}`;
                    const isExpanded = expandedThread === threadKey;
                    const userMsgCount = thread.messages.filter(m => m.role === 'user').length;
                    const lastMsg = thread.messages[thread.messages.length - 1];
                    return (
                      <div key={threadKey} className="glass-card" style={{ overflow: 'hidden' }}>
                        <div onClick={() => setExpandedThread(isExpanded ? null : threadKey)}
                          style={{ padding: '20px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(6,182,212,0.2)', border: '1.5px solid rgba(6,182,212,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>💬</div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontWeight: '700', fontSize: '15px', color: '#FFFFFF' }}>{thread.contact_name}</div>
                              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{thread.contact_email}</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>{new Date(lastMsg.created_at).toLocaleString()}</span>
                            <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '700', background: 'rgba(6,182,212,0.2)', color: '#22D3EE', border: '1px solid rgba(6,182,212,0.4)' }}>
                              {userMsgCount} {userMsgCount === 1 ? 'msg' : 'msgs'}
                            </span>
                            <span style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.08)', padding: '3px 10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.18)' }}>
                              {langMap[thread.lang] ?? thread.lang}
                            </span>
                            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '16px', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'none', display: 'block' }}>⌄</span>
                          </div>
                        </div>
                        {isExpanded && (
                          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '480px', overflowY: 'auto' }}>
                            {thread.messages.map(msg => (
                              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: '3px' }}>
                                <div style={{ maxWidth: '80%', padding: '10px 14px', borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '4px 16px 16px 16px', background: msg.role === 'user' ? '#7C3AED' : 'rgba(255,255,255,0.1)', border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.15)', fontSize: '13px', color: '#FFFFFF', lineHeight: '1.55' }}>
                                  {msg.content}
                                </div>
                                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', paddingInline: '4px' }}>
                                  {msg.role === 'user' ? thread.contact_name : 'AI Agent'} · {new Date(msg.created_at).toLocaleTimeString()}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* ── AI CONFIG ── */}
            {tab === 'ai' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="glass-card" style={{ padding: '28px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '20px' }}>API Key Status</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', borderRadius: '12px', background: llmKeySet ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1.5px solid ${llmKeySet ? 'rgba(16,185,129,0.45)' : 'rgba(239,68,68,0.45)'}` }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: llmKeySet ? '#10B981' : '#EF4444', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '700', color: llmKeySet ? '#34D399' : '#FCA5A5' }}>
                        {llmKeySet ? 'GOOGLE_API_KEY is configured' : 'GOOGLE_API_KEY is NOT set'}
                      </div>
                      <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>
                        {llmKeySet ? 'The AI chatbot is active and ready.' : 'Add GOOGLE_API_KEY to your Vercel environment variables to enable the chatbot.'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '28px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '20px' }}>Model Configuration</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                    {[
                      { label: 'Model', value: LLM_MODEL, color: '#A78BFA' },
                      { label: 'Max Tokens', value: String(LLM_MAX_TOKENS), color: '#06B6D4' },
                      { label: 'Temperature', value: 'Default (1.0)', color: '#F59E0B' },
                      { label: 'Provider', value: 'Google Gemini', color: '#10B981' },
                    ].map(({ label, value, color }) => (
                      <div key={label} style={{ background: `${color}15`, border: `1.5px solid ${color}40`, borderRadius: '12px', padding: '16px 20px' }}>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px' }}>{label}</div>
                        <div style={{ fontSize: '16px', fontWeight: '700', color }}>{value}</div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setShowSystemPrompt(v => !v)}
                    style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.8)', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: '8px', padding: '7px 16px', cursor: 'pointer', fontFamily: 'inherit', marginBottom: '10px' }}>
                    {showSystemPrompt ? '▲ Hide' : '▼ Show'} System Prompt
                  </button>
                  {showSystemPrompt && (
                    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '16px', fontSize: '12px', color: 'rgba(255,255,255,0.85)', lineHeight: '1.7', fontFamily: 'monospace' }}>
                      {LLM_SYSTEM_PROMPT}
                    </div>
                  )}
                </div>

                <div className="glass-card" style={{ padding: '28px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '20px' }}>Usage Statistics</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                    {(() => {
                      const userMsgs = chats.filter(m => m.role === 'user');
                      const assistantMsgs = chats.filter(m => m.role === 'assistant');
                      const avgLen = userMsgs.length > 0 ? Math.round(userMsgs.reduce((s, m) => s + m.content.length, 0) / userMsgs.length) : 0;
                      const lastChat = chats.length > 0 ? new Date(chats[chats.length - 1].created_at) : null;
                      return [
                        { label: 'Conversations', value: String(chatThreads.length), color: '#06B6D4' },
                        { label: 'User Messages', value: String(userMsgs.length), color: '#A78BFA' },
                        { label: 'AI Responses', value: String(assistantMsgs.length), color: '#10B981' },
                        { label: 'Avg Msg Length', value: avgLen > 0 ? `${avgLen} chars` : '—', color: '#F59E0B' },
                        { label: 'Last Activity', value: lastChat ? lastChat.toLocaleDateString() : 'None', color: '#EC4899' },
                      ];
                    })().map(({ label, value, color }) => (
                      <div key={label} style={{ background: 'rgba(20,16,24,0.8)', border: `1.5px solid ${color}35`, borderRadius: '12px', padding: '16px 18px' }}>
                        <div style={{ fontSize: '22px', fontWeight: '800', color, lineHeight: 1 }}>{value}</div>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.75)', marginTop: '6px' }}>{label}</div>
                      </div>
                    ))}
                  </div>
                  {chatThreads.length > 0 && (
                    <>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: 'rgba(255,255,255,0.75)', marginBottom: '10px' }}>Total Conversations</div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        {[{ key: 'en', label: 'English', color: '#7C3AED' }].map(l => {
                          const count = chatThreads.length;
                          return (
                            <div key={l.key} style={{ flex: 1, background: `${l.color}15`, border: `1.5px solid ${l.color}40`, borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
                              <div style={{ fontSize: '24px', fontWeight: '800', color: l.color }}>{count}</div>
                              <div style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.8)', marginTop: '4px' }}>{l.label}</div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* ── ANALYTICS ── */}
            {tab === 'analytics' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="glass-card" style={{ padding: '28px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '20px' }}>Resource & Documentation Clicks</h3>
                  {sortedClicks.length === 0 ? (
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>No clicks tracked yet.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {sortedClicks.map(([key, count]) => (
                        <div key={key}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.9)' }}>{key}</span>
                            <span style={{ fontSize: '13px', fontWeight: '700', color: 'white' }}>{count}</span>
                          </div>
                          <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${(count / maxClicks) * 100}%`, background: key.includes('Silent') ? '#8B5CF6' : key.includes('Identity') ? '#06B6D4' : '#F97316', borderRadius: '3px' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="glass-card" style={{ padding: '28px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>Product Interest</h3>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {[{ label: 'Silent Authentication', value: saViews, color: '#8B5CF6' }, { label: 'Identity Insights', value: iiViews, color: '#06B6D4' }, { label: 'Branded Calling', value: bcViews, color: '#F97316' }].map(p => (
                      <div key={p.label} style={{ flex: 1, minWidth: '140px', background: `${p.color}15`, border: `1.5px solid ${p.color}40`, borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                        <div style={{ fontSize: '36px', fontWeight: '800', color: p.color }}>{p.value}</div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: 'rgba(255,255,255,0.85)', marginTop: '6px' }}>{p.label}</div>
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', marginTop: '3px' }}>tab expanded</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '28px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>Recent Activity</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '320px', overflowY: 'auto' }}>
                    {analytics.slice(0, 50).map(e => (
                      <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '16px' }}>{e.event_type === 'page_view' ? '👁️' : e.event_type === 'product_view' ? '📦' : '🔗'}</span>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.9)' }}>
                              {e.event_type === 'page_view' && 'Page viewed'}
                              {e.event_type === 'product_view' && `Opened: ${e.event_data?.product === 'silent_authentication' ? 'Silent Auth' : e.event_data?.product === 'identity_insights' ? 'Identity Insights' : 'Branded Calling'}`}
                              {e.event_type === 'resource_click' && `Clicked: ${e.event_data?.resource} (${e.event_data?.product === 'silent_authentication' ? 'SA' : e.event_data?.product === 'identity_insights' ? 'II' : 'BC'})`}
                            </div>
                            <div style={{ fontSize: '11px', fontWeight: '500', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>Session: {e.session_id.slice(0, 8)}…</div>
                          </div>
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: '500', color: 'rgba(255,255,255,0.55)', whiteSpace: 'nowrap' }}>{new Date(e.created_at).toLocaleTimeString()}</div>
                      </div>
                    ))}
                    {analytics.length === 0 && <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>No events yet.</p>}
                  </div>
                </div>
              </div>
            )}

            {/* ── CONTACTS ── */}
            {tab === 'contacts' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Registered Contacts <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.65)', fontWeight: '500' }}>({contacts.length})</span></h2>
                  <button className="btn-primary" onClick={exportCsv} style={{ fontSize: '13px', padding: '10px 20px' }}>↓ Export CSV</button>
                </div>
                <div className="glass-card" style={{ overflow: 'hidden' }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                          {['Name', 'Email', 'Phone', 'Solutions', 'Meeting', 'Note', 'Chats', 'Registered'].map(h => (
                            <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {contacts.map((c, i) => {
                          const msgCount = chats.filter(m => m.contact_id === c.id && m.role === 'user').length;
                          return (
                            <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                              <td style={{ padding: '13px 20px', fontWeight: '600', whiteSpace: 'nowrap', color: '#FFFFFF' }}>{c.first_name ? `${c.first_name} ${c.last_name ?? ''}`.trim() : c.name}</td>
                              <td style={{ padding: '13px 20px', color: 'rgba(255,255,255,0.85)', fontSize: '13px' }}>{c.email}</td>
                              <td style={{ padding: '13px 20px', color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>{c.phone ?? '—'}</td>
                              <td style={{ padding: '13px 20px' }}>
                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                  {(c.solutions ?? []).map(s => (
                                    <span key={s} style={{ padding: '2px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', background: s === 'sa' ? 'rgba(139,92,246,0.2)' : s === 'ii' ? 'rgba(6,182,212,0.2)' : 'rgba(249,115,22,0.2)', color: s === 'sa' ? '#C4B5FD' : s === 'ii' ? '#67E8F9' : '#FDBA74', border: `1.5px solid ${s === 'sa' ? 'rgba(139,92,246,0.45)' : s === 'ii' ? 'rgba(6,182,212,0.45)' : 'rgba(249,115,22,0.45)'}`, whiteSpace: 'nowrap' }}>
                                      {s === 'sa' ? 'Silent Auth' : s === 'ii' ? 'Identity Insights' : 'Branded Calling'}
                                    </span>
                                  ))}
                                  {(!c.solutions || c.solutions.length === 0) && <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px' }}>—</span>}
                                </div>
                              </td>
                              <td style={{ padding: '13px 20px' }}>
                                <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '700', whiteSpace: 'nowrap',
                                  background: c.meeting_requested ? 'rgba(255,79,31,0.2)' : 'rgba(255,255,255,0.06)',
                                  color: c.meeting_requested ? '#FF9F7A' : 'rgba(255,255,255,0.55)',
                                  border: `1.5px solid ${c.meeting_requested ? 'rgba(255,79,31,0.45)' : 'rgba(255,255,255,0.12)'}` }}>
                                  {c.meeting_requested ? '✓ Yes' : 'No'}
                                </span>
                              </td>
                              <td style={{ padding: '13px 20px', color: 'rgba(255,255,255,0.75)', fontSize: '12px', maxWidth: '180px' }}>
                                <span title={c.meeting_note ?? ''} style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {c.meeting_note ?? <span style={{ color: 'rgba(255,255,255,0.4)' }}>—</span>}
                                </span>
                              </td>
                              <td style={{ padding: '13px 20px' }}>
                                {msgCount > 0 ? (
                                  <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '700', background: 'rgba(6,182,212,0.2)', color: '#22D3EE', border: '1.5px solid rgba(6,182,212,0.45)' }}>
                                    {msgCount} msg{msgCount !== 1 ? 's' : ''}
                                  </span>
                                ) : <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>—</span>}
                              </td>
                              <td style={{ padding: '13px 20px', color: 'rgba(255,255,255,0.65)', fontSize: '12px', whiteSpace: 'nowrap' }}>{new Date(c.created_at).toLocaleString()}</td>
                            </tr>
                          );
                        })}
                        {contacts.length === 0 && (
                          <tr><td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.55)' }}>No registrations yet.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

function JNode({ icon, label, count, base, color, small = false }: {
  icon: string; label: string; count: number; base?: number; color: string; small?: boolean;
}) {
  const pct = base !== undefined && base > 0 ? Math.round((count / base) * 100) : undefined;
  return (
    <div style={{
      background: `${color}22`, border: `2px solid ${color}75`, borderRadius: '12px',
      padding: small ? '10px 14px' : '14px 32px', textAlign: 'center',
      minWidth: small ? '110px' : '220px',
      boxShadow: `0 0 16px ${color}20`,
    }}>
      <div style={{ fontSize: small ? '18px' : '22px' }}>{icon}</div>
      <div style={{ fontSize: small ? '26px' : '36px', fontWeight: '800', color, lineHeight: 1.1, marginTop: '4px' }}>{count}</div>
      {pct !== undefined && (
        <div style={{ fontSize: '11px', fontWeight: '700', color: '#FFFFFF', background: `${color}50`, borderRadius: '6px', padding: '2px 8px', display: 'inline-block', marginTop: '3px' }}>{pct}%</div>
      )}
      <div style={{ fontSize: small ? '11px' : '12px', fontWeight: '700', color: 'rgba(255,255,255,0.9)', marginTop: '5px', lineHeight: 1.3 }}>{label}</div>
    </div>
  );
}

function RNode({ icon, label, count, color }: { icon: string; label: string; count: number; color: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '6px',
      background: `${color}18`, border: `1.5px solid ${color}55`,
      borderRadius: '8px', padding: '5px 12px',
      fontSize: '12px', fontWeight: '700', whiteSpace: 'nowrap',
      color: 'rgba(255,255,255,0.95)',
    }}>
      <span style={{ fontSize: '13px' }}>{icon}</span>
      <span>{label}</span>
      <span style={{ marginLeft: '4px', color, fontWeight: '800', fontSize: '13px' }}>{count}</span>
    </div>
  );
}

function JArrow({ drop, base }: { drop?: number; base?: number }) {
  const hasDrop = drop !== undefined && drop > 0;
  const pct = hasDrop && base && base > 0 ? Math.round((drop! / base) * 100) : undefined;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2px 0' }}>
      <div style={{ width: '2px', height: '14px', background: 'rgba(255,255,255,0.2)' }} />
      {hasDrop && (
        <div style={{ fontSize: '11px', fontWeight: '700', color: '#FCA5A5', background: 'rgba(239,68,68,0.15)', border: '1.5px solid rgba(239,68,68,0.4)', borderRadius: '8px', padding: '3px 12px', margin: '2px 0', whiteSpace: 'nowrap' }}>
          ↙ −{drop} dropped{pct ? ` (${pct}%)` : ''} ↘
        </div>
      )}
      <div style={{ width: '2px', height: '14px', background: 'rgba(255,255,255,0.2)' }} />
      <div style={{ width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '8px solid rgba(255,255,255,0.3)' }} />
    </div>
  );
}

function StatCard({ label, value, color, sub }: { label: string; value: number; color: string; sub?: string }) {
  return (
    <div style={{ background: 'rgba(20,16,24,0.85)', border: `1.5px solid ${color}35`, borderRadius: '14px', padding: '20px 22px' }}>
      <div style={{ fontSize: '34px', fontWeight: '800', color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '13px', fontWeight: '700', color: 'rgba(255,255,255,0.9)', marginTop: '7px' }}>{label}</div>
      {sub && <div style={{ fontSize: '12px', fontWeight: '500', color: 'rgba(255,255,255,0.6)', marginTop: '3px' }}>{sub}</div>}
    </div>
  );
}
