'use client';

import { useState } from 'react';

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

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [contacts, setContacts] = useState<Contact[] | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsEvent[]>([]);
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'overview' | 'contacts' | 'analytics' | 'chats'>('overview');
  const [expandedThread, setExpandedThread] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  async function resetData() {
    if (!confirm('Delete ALL contacts, analytics and chat data? This cannot be undone.')) return;
    setResetting(true);
    await fetch('/api/admin', { method: 'DELETE', headers: { 'x-admin-password': password } });
    setContacts([]);
    setAnalytics([]);
    setChats([]);
    setResetting(false);
  }

  async function login() {
    setLoading(true); setError('');
    const res = await fetch('/api/admin', { headers: { 'x-admin-password': password } });
    if (res.status === 401) { setError('Incorrect password.'); setLoading(false); return; }
    const data = await res.json();
    setContacts(data.contacts);
    setAnalytics(data.analytics || []);
    setChats(data.chats || []);
    setLoading(false);
  }

  function exportCsv() {
    if (!contacts) return;
    const rows = [['First Name','Last Name','Email','Phone','Language','Solutions','Meeting Requested','Meeting Note','Registered At'],
      ...contacts.map(c => [c.first_name ?? '', c.last_name ?? c.name ?? '', c.email, c.phone ?? '', c.language, (c.solutions ?? []).join('+'), c.meeting_requested ? 'Yes' : 'No', c.meeting_note ?? '', new Date(c.created_at).toLocaleString()])];
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'vonage-cx-tour-kl-taipei-2026.csv'; a.click();
  }

  // Analytics derived stats
  const uniqueSessions = new Set(analytics.map(e => e.session_id)).size;
  const bcViews = analytics.filter(e => e.event_type === 'product_view' && e.event_data?.product === 'branded_communications').length;
  const naViews = analytics.filter(e => e.event_type === 'product_view' && e.event_data?.product === 'network_apis').length;
  const resourceClicks = analytics.filter(e => e.event_type === 'resource_click');
  const totalMeetings = contacts?.filter(c => c.meeting_requested).length ?? 0;
  const conversionRate = uniqueSessions > 0 ? Math.round(((contacts?.length ?? 0) / uniqueSessions) * 100) : 0;

  // Resource click breakdown
  const clickBreakdown: Record<string, number> = {};
  resourceClicks.forEach(e => {
    const key = `${e.event_data?.product === 'branded_communications' ? 'Branded Communications' : 'Network APIs'} — ${e.event_data?.resource}`;
    clickBreakdown[key] = (clickBreakdown[key] || 0) + 1;
  });
  const sortedClicks = Object.entries(clickBreakdown).sort((a, b) => b[1] - a[1]);
  const maxClicks = sortedClicks[0]?.[1] || 1;

  // Chat threads grouped by contact
  const chatThreads: ChatThread[] = [];
  const seen = new Map<string, ChatThread>();
  for (const msg of chats) {
    const key = msg.contact_id ?? 'anonymous';
    if (!seen.has(key)) {
      const thread: ChatThread = {
        contact_id: msg.contact_id,
        contact_name: msg.contacts?.name ?? 'Anonymous',
        contact_email: msg.contacts?.email ?? '—',
        lang: msg.lang,
        messages: [],
      };
      seen.set(key, thread);
      chatThreads.push(thread);
    }
    seen.get(key)!.messages.push(msg);
  }
  const totalChatMessages = chats.filter(m => m.role === 'user').length;

  const langMap: Record<string, string> = { en: 'English', zh: '中文' };

  return (
    <main className="mesh-bg min-h-screen" style={{ padding: '32px 24px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>Vonage × Ericsson · CX Tour KL & Taipei 2026</div>
            <h1 style={{ fontSize: '30px', fontWeight: '700', letterSpacing: '-0.02em' }}>Admin Dashboard</h1>
          </div>
          {contacts && (
            <button onClick={resetData} disabled={resetting}
              style={{ marginTop: '24px', padding: '9px 18px', borderRadius: '10px', border: '1.5px solid rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.08)', color: '#FCA5A5', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', opacity: resetting ? 0.5 : 1 }}>
              {resetting ? 'Resetting…' : '🗑 Reset Data'}
            </button>
          )}
        </div>

        {!contacts ? (
          <div className="glass-card" style={{ maxWidth: '380px', padding: '36px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '24px' }}>Admin Login</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input className="input-field" type="password" placeholder="Enter admin password"
                value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()} />
              {error && <p style={{ color: '#FF6B6B', fontSize: '13px' }}>{error}</p>}
              <button className="btn-primary" onClick={login} disabled={loading || !password} style={{ width: '100%' }}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '4px', width: 'fit-content' }}>
              {(['overview', 'contacts', 'chats', 'analytics'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px', fontWeight: '500', transition: 'all 0.15s',
                    background: tab === t ? 'rgba(124,58,237,0.3)' : 'transparent',
                    color: tab === t ? '#A78BFA' : 'rgba(255,255,255,0.5)' }}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                  {t === 'chats' && chatThreads.length > 0 && (
                    <span style={{ marginLeft: '6px', background: 'rgba(139,92,246,0.4)', borderRadius: '10px', padding: '1px 7px', fontSize: '11px', color: '#C4B5FD' }}>
                      {chatThreads.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* OVERVIEW TAB */}
            {tab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '14px' }}>
                  <StatCard label="QR Scans" value={uniqueSessions} color="#7C3AED" sub="unique sessions" />
                  <StatCard label="Registrations" value={contacts.length} color="#10B981" sub={`${conversionRate}% conversion`} />
                  <StatCard label="Meeting Requests" value={totalMeetings} color="#FF4F1F" sub="1-on-1 interest" />
                  <StatCard label="Chat Messages" value={totalChatMessages} color="#06B6D4" sub={`${chatThreads.length} conversations`} />
                  <StatCard label="Branded Comms" value={bcViews} color="#A78BFA" sub="product views" />
                  <StatCard label="Network APIs" value={naViews} color="#F59E0B" sub="product views" />
                </div>

                {/* Journey Flow Diagram */}
                <div className="glass-card" style={{ padding: '28px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '4px' }}>User Journey</h3>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginBottom: '28px' }}>Page flow · drop-offs in red</p>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                    {/* Step 1: QR Landing */}
                    <JNode icon="📱" label="QR / Landing" count={uniqueSessions} color="#7C3AED" />

                    <JArrow drop={uniqueSessions - contacts.length} base={uniqueSessions} />

                    {/* Step 2: Registration */}
                    <JNode icon="📝" label="/ (Register)" count={contacts.length} base={uniqueSessions} color="#10B981" />

                    {/* Vertical stem into hub branch */}
                    <div style={{ width: '2px', height: '18px', background: 'rgba(255,255,255,0.1)' }} />

                    {/* Hub label */}
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: '0.1em', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '3px 12px', marginBottom: '0' }}>
                      /hub — parallel actions
                    </div>

                    {/* Branch: 4 hub activities */}
                    <div style={{ display: 'flex', width: '100%', maxWidth: '560px' }}>
                      {([
                        { icon: '📞', label: 'Branded Comms', count: bcViews, color: '#A78BFA', pos: 'left' },
                        { icon: '🌐', label: 'Network APIs', count: naViews, color: '#F97316', pos: 'inner' },
                        { icon: '🔗', label: 'Resources', count: resourceClicks.length, color: '#3B82F6', pos: 'inner' },
                        { icon: '💬', label: 'Chat AI', count: chatThreads.length, color: '#06B6D4', pos: 'right' },
                      ] as const).map(({ icon, label, count, color, pos }) => (
                        <div key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div style={{
                            width: '100%', height: '2px',
                            background: pos === 'left'  ? 'linear-gradient(90deg, transparent 50%, rgba(255,255,255,0.12) 50%)'
                                      : pos === 'right' ? 'linear-gradient(90deg, rgba(255,255,255,0.12) 50%, transparent 50%)'
                                      : 'rgba(255,255,255,0.12)',
                          }} />
                          <div style={{ width: '2px', height: '14px', background: 'rgba(255,255,255,0.1)' }} />
                          <JNode icon={icon} label={label} count={count} base={contacts.length} color={color} small />
                        </div>
                      ))}
                    </div>

                    {/* Merge back to spine */}
                    <div style={{ display: 'flex', width: '100%', maxWidth: '560px' }}>
                      {(['left', 'inner', 'inner', 'right'] as const).map((pos, i) => (
                        <div key={i} style={{ flex: 1, height: '18px',
                          borderTop: '2px solid rgba(255,255,255,0.1)',
                          borderLeft: pos === 'right' ? '2px solid rgba(255,255,255,0.1)' : 'none',
                          borderRight: pos === 'left' ? '2px solid rgba(255,255,255,0.1)' : 'none',
                          borderRadius: pos === 'left' ? '0 0 0 8px' : pos === 'right' ? '0 0 8px 0' : 'none',
                        }} />
                      ))}
                    </div>

                    <JArrow drop={contacts.length - totalMeetings} base={contacts.length} />

                    {/* Step 3: Meeting */}
                    <JNode icon="🤝" label="/meeting" count={totalMeetings} base={contacts.length} color="#FF4F1F" />

                    <JArrow />

                    {/* Step 4: Thank You */}
                    <JNode icon="🎉" label="/thank-you" count={totalMeetings} color="#F59E0B" />

                  </div>
                </div>

                {/* Language breakdown */}
                <div className="glass-card" style={{ padding: '28px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>Language Preference</h3>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {[{ key: 'en', label: 'English', color: '#7C3AED' }, { key: 'zh', label: '中文', color: '#3B82F6' }].map(l => {
                      const count = contacts.filter(c => c.language === l.key).length;
                      return (
                        <div key={l.key} style={{ flex: 1, minWidth: '100px', background: `${l.color}15`, border: `1px solid ${l.color}30`, borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                          <div style={{ fontSize: '26px', fontWeight: '700', color: l.color }}>{count}</div>
                          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>{l.label}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* CHATS TAB */}
            {tab === 'chats' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '700' }}>
                    AI Agent Conversations
                    <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', fontWeight: '400', marginLeft: '8px' }}>({chatThreads.length})</span>
                  </h2>
                  <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>{totalChatMessages} user messages total</div>
                </div>

                {chatThreads.length === 0 ? (
                  <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
                    <div style={{ fontSize: '36px', marginBottom: '12px' }}>💬</div>
                    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px' }}>No chat conversations yet.</p>
                  </div>
                ) : (
                  chatThreads.map((thread, idx) => {
                    const threadKey = thread.contact_id ?? `anon-${idx}`;
                    const isExpanded = expandedThread === threadKey;
                    const userMsgCount = thread.messages.filter(m => m.role === 'user').length;
                    const lastMsg = thread.messages[thread.messages.length - 1];
                    return (
                      <div key={threadKey} className="glass-card" style={{ overflow: 'hidden' }}>
                        {/* Thread header — click to expand */}
                        <div
                          onClick={() => setExpandedThread(isExpanded ? null : threadKey)}
                          style={{ padding: '20px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(6,182,212,0.15)', border: '1.5px solid rgba(6,182,212,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
                              💬
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontWeight: '600', fontSize: '15px', color: '#FFFFFF' }}>{thread.contact_name}</div>
                              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {thread.contact_email}
                              </div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>
                              {new Date(lastMsg.created_at).toLocaleString()}
                            </span>
                            <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', background: 'rgba(6,182,212,0.15)', color: '#22D3EE', border: '1px solid rgba(6,182,212,0.3)' }}>
                              {userMsgCount} {userMsgCount === 1 ? 'msg' : 'msgs'}
                            </span>
                            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.06)', padding: '3px 10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                              {langMap[thread.lang] ?? thread.lang}
                            </span>
                            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'none', display: 'block' }}>⌄</span>
                          </div>
                        </div>

                        {/* Conversation thread */}
                        {isExpanded && (
                          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '480px', overflowY: 'auto' }}>
                            {thread.messages.map((msg) => (
                              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: '3px' }}>
                                <div style={{
                                  maxWidth: '80%', padding: '10px 14px', borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
                                  background: msg.role === 'user' ? '#7C3AED' : 'rgba(255,255,255,0.07)',
                                  border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                  fontSize: '13px', color: '#FFFFFF', lineHeight: '1.55',
                                }}>
                                  {msg.content}
                                </div>
                                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', paddingInline: '4px' }}>
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

            {/* ANALYTICS TAB */}
            {tab === 'analytics' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="glass-card" style={{ padding: '28px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '20px' }}>Resource & Documentation Clicks</h3>
                  {sortedClicks.length === 0 ? (
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>No clicks tracked yet.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {sortedClicks.map(([key, count]) => (
                        <div key={key}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>{key}</span>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: 'white' }}>{count}</span>
                          </div>
                          <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${(count / maxClicks) * 100}%`, background: key.includes('Branded Communications') ? '#7C3AED' : '#FF4F1F', borderRadius: '3px' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="glass-card" style={{ padding: '28px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>Product Interest</h3>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {[{ label: 'Branded Communications', value: bcViews, color: '#7C3AED' }, { label: 'Network APIs', value: naViews, color: '#FF4F1F' }].map(p => (
                      <div key={p.label} style={{ flex: 1, minWidth: '140px', background: `${p.color}12`, border: `1px solid ${p.color}30`, borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                        <div style={{ fontSize: '32px', fontWeight: '700', color: p.color }}>{p.value}</div>
                        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>{p.label}</div>
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', marginTop: '2px' }}>card expanded</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '28px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>Recent Activity</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '320px', overflowY: 'auto' }}>
                    {analytics.slice(0, 50).map(e => (
                      <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '16px' }}>
                            {e.event_type === 'page_view' ? '👁️' : e.event_type === 'product_view' ? '📦' : e.event_type === 'resource_click' ? '🔗' : '📌'}
                          </span>
                          <div>
                            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>
                              {e.event_type === 'page_view' && 'Page viewed'}
                              {e.event_type === 'product_view' && `Opened: ${e.event_data?.product === 'branded_communications' ? 'Branded Communications' : 'Network APIs'}`}
                              {e.event_type === 'resource_click' && `Clicked: ${e.event_data?.resource} (${e.event_data?.product === 'branded_communications' ? 'BC' : 'NA'})`}
                            </div>
                            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', marginTop: '2px' }}>
                              Session: {e.session_id.slice(0, 8)}…
                            </div>
                          </div>
                        </div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', whiteSpace: 'nowrap' }}>
                          {new Date(e.created_at).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                    {analytics.length === 0 && <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>No events yet.</p>}
                  </div>
                </div>
              </div>
            )}

            {/* CONTACTS TAB */}
            {tab === 'contacts' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Registered Contacts <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', fontWeight: '400' }}>({contacts.length})</span></h2>
                  <button className="btn-primary" onClick={exportCsv} style={{ fontSize: '13px', padding: '10px 20px' }}>↓ Export CSV</button>
                </div>
                <div className="glass-card" style={{ overflow: 'hidden' }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                          {['Name', 'Email', 'Phone', 'Language', 'Solutions', 'Meeting', 'Note', 'Chats', 'Registered'].map(h => (
                            <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {contacts.map((c, i) => {
                          const msgCount = chats.filter(m => m.contact_id === c.id && m.role === 'user').length;
                          return (
                            <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
                              <td style={{ padding: '13px 20px', fontWeight: '500', whiteSpace: 'nowrap' }}>{c.first_name ? `${c.first_name} ${c.last_name ?? ''}`.trim() : c.name}</td>
                              <td style={{ padding: '13px 20px', color: 'rgba(255,255,255,0.55)', fontSize: '13px' }}>{c.email}</td>
                              <td style={{ padding: '13px 20px', color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{c.phone ?? '—'}</td>
                              <td style={{ padding: '13px 20px' }}>
                                <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', background: 'rgba(124,58,237,0.15)', color: '#A78BFA', border: '1px solid rgba(124,58,237,0.3)', whiteSpace: 'nowrap' }}>
                                  {langMap[c.language] || c.language}
                                </span>
                              </td>
                              <td style={{ padding: '13px 20px' }}>
                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                  {(c.solutions ?? []).map(s => (
                                    <span key={s} style={{ padding: '2px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: '600', background: s === 'bc' ? 'rgba(139,92,246,0.15)' : 'rgba(249,115,22,0.15)', color: s === 'bc' ? '#A78BFA' : '#FB923C', border: `1px solid ${s === 'bc' ? 'rgba(139,92,246,0.3)' : 'rgba(249,115,22,0.3)'}`, whiteSpace: 'nowrap' }}>
                                      {s === 'bc' ? 'Branded Comms' : 'Network APIs'}
                                    </span>
                                  ))}
                                  {(!c.solutions || c.solutions.length === 0) && <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px' }}>—</span>}
                                </div>
                              </td>
                              <td style={{ padding: '13px 20px' }}>
                                <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap',
                                  background: c.meeting_requested ? 'rgba(255,79,31,0.15)' : 'rgba(255,255,255,0.05)',
                                  color: c.meeting_requested ? '#FF7A52' : 'rgba(255,255,255,0.3)',
                                  border: `1px solid ${c.meeting_requested ? 'rgba(255,79,31,0.3)' : 'rgba(255,255,255,0.08)'}` }}>
                                  {c.meeting_requested ? '✓ Yes' : 'No'}
                                </span>
                              </td>
                              <td style={{ padding: '13px 20px', color: 'rgba(255,255,255,0.45)', fontSize: '12px', maxWidth: '180px' }}>
                                <span title={c.meeting_note ?? ''} style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {c.meeting_note ? `"${c.meeting_note}"` : '—'}
                                </span>
                              </td>
                              <td style={{ padding: '13px 20px' }}>
                                {msgCount > 0 ? (
                                  <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', background: 'rgba(6,182,212,0.15)', color: '#22D3EE', border: '1px solid rgba(6,182,212,0.3)' }}>
                                    {msgCount} msg{msgCount !== 1 ? 's' : ''}
                                  </span>
                                ) : <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px' }}>—</span>}
                              </td>
                              <td style={{ padding: '13px 20px', color: 'rgba(255,255,255,0.35)', fontSize: '12px', whiteSpace: 'nowrap' }}>{new Date(c.created_at).toLocaleString()}</td>
                            </tr>
                          );
                        })}
                        {contacts.length === 0 && (
                          <tr><td colSpan={9} style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.25)' }}>No registrations yet.</td></tr>
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
      background: `${color}10`, border: `1.5px solid ${color}40`, borderRadius: '12px',
      padding: small ? '8px 10px' : '12px 28px', textAlign: 'center',
      minWidth: small ? '90px' : '200px',
    }}>
      <div style={{ fontSize: small ? '16px' : '20px' }}>{icon}</div>
      <div style={{ fontSize: small ? '20px' : '28px', fontWeight: '800', color, lineHeight: 1.1, marginTop: '2px' }}>{count}</div>
      {pct !== undefined && (
        <div style={{ fontSize: '10px', color, background: `${color}18`, borderRadius: '6px', padding: '1px 6px', display: 'inline-block', marginTop: '2px' }}>{pct}%</div>
      )}
      <div style={{ fontSize: small ? '10px' : '11px', color: 'rgba(255,255,255,0.55)', marginTop: '4px', fontWeight: '600', lineHeight: 1.3 }}>{label}</div>
    </div>
  );
}

function JArrow({ drop, base }: { drop?: number; base?: number }) {
  const hasDrop = drop !== undefined && drop > 0;
  const pct = hasDrop && base && base > 0 ? Math.round((drop! / base) * 100) : undefined;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2px 0' }}>
      <div style={{ width: '2px', height: '14px', background: 'rgba(255,255,255,0.1)' }} />
      {hasDrop && (
        <div style={{ fontSize: '10px', color: '#FCA5A5', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', padding: '2px 10px', margin: '2px 0', whiteSpace: 'nowrap' }}>
          ↙ −{drop} dropped{pct ? ` (${pct}%)` : ''} ↘
        </div>
      )}
      <div style={{ width: '2px', height: '14px', background: 'rgba(255,255,255,0.1)' }} />
      <div style={{ width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '7px solid rgba(255,255,255,0.18)' }} />
    </div>
  );
}

function StatCard({ label, value, color, sub }: { label: string; value: number; color: string; sub?: string }) {
  return (
    <div style={{ background: 'rgba(20,16,24,0.8)', border: `1px solid ${color}25`, borderRadius: '14px', padding: '20px 22px' }}>
      <div style={{ fontSize: '30px', fontWeight: '700', color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.7)', marginTop: '6px' }}>{label}</div>
      {sub && <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '3px' }}>{sub}</div>}
    </div>
  );
}
