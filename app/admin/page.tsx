'use client';

import { useState } from 'react';

interface Contact {
  id: string; name: string; email: string;
  language: string; meeting_requested: boolean; created_at: string;
}
interface AnalyticsEvent {
  id: string; session_id: string; contact_id: string | null;
  event_type: string; event_data: Record<string, string>; created_at: string;
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [contacts, setContacts] = useState<Contact[] | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsEvent[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'overview' | 'contacts' | 'analytics'>('overview');

  async function login() {
    setLoading(true); setError('');
    const res = await fetch('/api/admin', { headers: { 'x-admin-password': password } });
    if (res.status === 401) { setError('Incorrect password.'); setLoading(false); return; }
    const data = await res.json();
    setContacts(data.contacts);
    setAnalytics(data.analytics || []);
    setLoading(false);
  }

  function exportCsv() {
    if (!contacts) return;
    const rows = [['Name','Email','Language','Meeting Requested','Registered At'],
      ...contacts.map(c => [c.name, c.email, c.language, c.meeting_requested ? 'Yes' : 'No', new Date(c.created_at).toLocaleString()])];
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'vonage-cx-tour-kl-2026.csv'; a.click();
  }

  // Analytics derived stats
  const uniqueSessions = new Set(analytics.map(e => e.session_id)).size;
  const pageViews = analytics.filter(e => e.event_type === 'page_view').length;
  const bcViews = analytics.filter(e => e.event_type === 'product_view' && e.event_data?.product === 'branded_calling').length;
  const naViews = analytics.filter(e => e.event_type === 'product_view' && e.event_data?.product === 'network_apis').length;
  const resourceClicks = analytics.filter(e => e.event_type === 'resource_click');
  const totalMeetings = contacts?.filter(c => c.meeting_requested).length ?? 0;
  const conversionRate = uniqueSessions > 0 ? Math.round(((contacts?.length ?? 0) / uniqueSessions) * 100) : 0;

  // Resource click breakdown
  const clickBreakdown: Record<string, number> = {};
  resourceClicks.forEach(e => {
    const key = `${e.event_data?.product === 'branded_calling' ? 'Branded Calling' : 'Network APIs'} — ${e.event_data?.resource}`;
    clickBreakdown[key] = (clickBreakdown[key] || 0) + 1;
  });
  const sortedClicks = Object.entries(clickBreakdown).sort((a, b) => b[1] - a[1]);
  const maxClicks = sortedClicks[0]?.[1] || 1;

  const langMap: Record<string, string> = { en: 'English', ms: 'Bahasa', zh: '中文' };

  return (
    <main className="mesh-bg min-h-screen" style={{ padding: '32px 24px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>Vonage × Ericsson · CX Tour KL 2026</div>
          <h1 style={{ fontSize: '30px', fontWeight: '700', letterSpacing: '-0.02em' }}>Admin Dashboard</h1>
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
              {(['overview', 'contacts', 'analytics'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px', fontWeight: '500', transition: 'all 0.15s',
                    background: tab === t ? 'rgba(124,58,237,0.3)' : 'transparent',
                    color: tab === t ? '#A78BFA' : 'rgba(255,255,255,0.5)' }}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            {/* OVERVIEW TAB */}
            {tab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Top stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '14px' }}>
                  <StatCard label="QR Scans" value={uniqueSessions} color="#7C3AED" sub="unique sessions" />
                  <StatCard label="Registrations" value={contacts.length} color="#10B981" sub={`${conversionRate}% conversion`} />
                  <StatCard label="Meeting Requests" value={totalMeetings} color="#FF4F1F" sub="1-on-1 interest" />
                  <StatCard label="Branded Calling" value={bcViews} color="#A78BFA" sub="product views" />
                  <StatCard label="Network APIs" value={naViews} color="#F59E0B" sub="product views" />
                  <StatCard label="Resource Clicks" value={resourceClicks.length} color="#3B82F6" sub="total clicks" />
                </div>

                {/* Funnel */}
                <div className="glass-card" style={{ padding: '28px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '20px' }}>Visitor Funnel</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[
                      { label: 'Scanned QR / Landed', value: uniqueSessions, color: '#7C3AED' },
                      { label: 'Registered', value: contacts.length, color: '#10B981' },
                      { label: 'Explored a product', value: bcViews + naViews, color: '#A78BFA' },
                      { label: 'Clicked a resource', value: resourceClicks.length, color: '#3B82F6' },
                      { label: 'Requested a meeting', value: totalMeetings, color: '#FF4F1F' },
                    ].map((row) => (
                      <div key={row.label}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>{row.label}</span>
                          <span style={{ fontSize: '13px', fontWeight: '600', color: row.color }}>{row.value}</span>
                        </div>
                        <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${uniqueSessions > 0 ? (row.value / uniqueSessions) * 100 : 0}%`, background: row.color, borderRadius: '3px', transition: 'width 0.6s ease' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Language breakdown */}
                <div className="glass-card" style={{ padding: '28px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>Language Preference</h3>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {[{ key: 'en', label: 'English', color: '#7C3AED' }, { key: 'ms', label: 'Bahasa', color: '#F59E0B' }, { key: 'zh', label: '中文', color: '#3B82F6' }].map(l => {
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

            {/* ANALYTICS TAB */}
            {tab === 'analytics' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Resource clicks breakdown */}
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
                            <div style={{ height: '100%', width: `${(count / maxClicks) * 100}%`, background: key.includes('Branded') ? '#7C3AED' : '#FF4F1F', borderRadius: '3px' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Product interest */}
                <div className="glass-card" style={{ padding: '28px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>Product Interest</h3>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {[{ label: 'Branded Calling', value: bcViews, color: '#7C3AED' }, { label: 'Network APIs', value: naViews, color: '#FF4F1F' }].map(p => (
                      <div key={p.label} style={{ flex: 1, minWidth: '140px', background: `${p.color}12`, border: `1px solid ${p.color}30`, borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                        <div style={{ fontSize: '32px', fontWeight: '700', color: p.color }}>{p.value}</div>
                        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>{p.label}</div>
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', marginTop: '2px' }}>card expanded</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent events feed */}
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
                              {e.event_type === 'product_view' && `Opened: ${e.event_data?.product === 'branded_calling' ? 'Branded Calling' : 'Network APIs'}`}
                              {e.event_type === 'resource_click' && `Clicked: ${e.event_data?.resource} (${e.event_data?.product === 'branded_calling' ? 'BC' : 'NA'})`}
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
                          {['Name', 'Email', 'Language', 'Meeting', 'Registered'].map(h => (
                            <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {contacts.map((c, i) => (
                          <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
                            <td style={{ padding: '13px 20px', fontWeight: '500' }}>{c.name}</td>
                            <td style={{ padding: '13px 20px', color: 'rgba(255,255,255,0.55)' }}>{c.email}</td>
                            <td style={{ padding: '13px 20px' }}>
                              <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', background: 'rgba(124,58,237,0.15)', color: '#A78BFA', border: '1px solid rgba(124,58,237,0.3)' }}>
                                {langMap[c.language] || c.language}
                              </span>
                            </td>
                            <td style={{ padding: '13px 20px' }}>
                              <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600',
                                background: c.meeting_requested ? 'rgba(255,79,31,0.15)' : 'rgba(255,255,255,0.05)',
                                color: c.meeting_requested ? '#FF7A52' : 'rgba(255,255,255,0.3)',
                                border: `1px solid ${c.meeting_requested ? 'rgba(255,79,31,0.3)' : 'rgba(255,255,255,0.08)'}` }}>
                                {c.meeting_requested ? '✓ Yes' : 'No'}
                              </span>
                            </td>
                            <td style={{ padding: '13px 20px', color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>{new Date(c.created_at).toLocaleString()}</td>
                          </tr>
                        ))}
                        {contacts.length === 0 && (
                          <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.25)' }}>No registrations yet.</td></tr>
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

function StatCard({ label, value, color, sub }: { label: string; value: number; color: string; sub?: string }) {
  return (
    <div style={{ background: 'rgba(20,16,24,0.8)', border: `1px solid ${color}25`, borderRadius: '14px', padding: '20px 22px' }}>
      <div style={{ fontSize: '30px', fontWeight: '700', color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.7)', marginTop: '6px' }}>{label}</div>
      {sub && <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '3px' }}>{sub}</div>}
    </div>
  );
}
