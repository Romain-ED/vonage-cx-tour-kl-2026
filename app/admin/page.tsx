'use client';

import { useState } from 'react';

interface Contact {
  id: string; name: string; email: string;
  language: string; meeting_requested: boolean; created_at: string;
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [contacts, setContacts] = useState<Contact[] | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function login() {
    setLoading(true); setError('');
    const res = await fetch('/api/admin', { headers: { 'x-admin-password': password } });
    if (res.status === 401) { setError('adminWrongPassword'); setLoading(false); return; }
    const data = await res.json();
    setContacts(data);
    setLoading(false);
  }

  function exportCsv() {
    if (!contacts) return;
    const rows = [['Name','Email','Language','Meeting Requested','Registered At'],
      ...contacts.map(c => [c.name, c.email, c.language, c.meeting_requested ? 'Yes' : 'No', new Date(c.created_at).toLocaleString()])];
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `vonage-cx-tour-kl-2026.csv`; a.click();
  }

  const totalMeetings = contacts?.filter(c => c.meeting_requested).length ?? 0;
  const langMap: Record<string, string> = { en: 'English', ms: 'Bahasa', zh: '中文' };

  return (
    <main className="mesh-bg min-h-screen" style={{ padding: '32px 24px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '8px' }}>Vonage × Ericsson</div>
          <h1 style={{ fontSize: '32px', fontWeight: '700', letterSpacing: '-0.02em' }}>Admin Panel</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', marginTop: '6px' }}>CX Tour Kuala Lumpur 2026</p>
        </div>

        {!contacts ? (
          <div className="glass-card" style={{ maxWidth: '380px', padding: '36px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '24px' }}>Admin Login</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input
                className="input-field"
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && login()}
              />
              {error && <p style={{ color: '#FF6B6B', fontSize: '13px' }}>Incorrect password. Please try again.</p>}
              <button className="btn-primary" onClick={login} disabled={loading || !password} style={{ width: '100%' }}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
              <StatCard label="Total registrations" value={contacts.length} color="#7C3AED" />
              <StatCard label="Meeting requests" value={totalMeetings} color="#FF4F1F" />
              <StatCard label="English" value={contacts.filter(c => c.language === 'en').length} color="#10B981" />
              <StatCard label="Bahasa" value={contacts.filter(c => c.language === 'ms').length} color="#F59E0B" />
              <StatCard label="中文" value={contacts.filter(c => c.language === 'zh').length} color="#3B82F6" />
            </div>

            {/* Table header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Registered Contacts</h2>
              <button className="btn-primary" onClick={exportCsv} style={{ fontSize: '13px', padding: '10px 20px' }}>
                ↓ Export CSV
              </button>
            </div>

            {/* Table */}
            <div className="glass-card" style={{ overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                      {['Name', 'Email', 'Language', 'Meeting', 'Registered'].map(h => (
                        <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.map((c, i) => (
                      <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                        <td style={{ padding: '14px 20px', fontWeight: '500' }}>{c.name}</td>
                        <td style={{ padding: '14px 20px', color: 'rgba(255,255,255,0.6)' }}>{c.email}</td>
                        <td style={{ padding: '14px 20px' }}>
                          <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', background: 'rgba(124,58,237,0.15)', color: 'var(--vonage-purple-light)', border: '1px solid rgba(124,58,237,0.3)' }}>
                            {langMap[c.language] || c.language}
                          </span>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', background: c.meeting_requested ? 'rgba(255,79,31,0.15)' : 'rgba(255,255,255,0.05)', color: c.meeting_requested ? '#FF7A52' : 'rgba(255,255,255,0.3)', border: `1px solid ${c.meeting_requested ? 'rgba(255,79,31,0.3)' : 'rgba(255,255,255,0.08)'}` }}>
                            {c.meeting_requested ? '✓ Yes' : 'No'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 20px', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>{new Date(c.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                    {contacts.length === 0 && (
                      <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>No registrations yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ background: 'rgba(20,16,24,0.8)', border: `1px solid ${color}33`, borderRadius: '14px', padding: '20px 24px' }}>
      <div style={{ fontSize: '32px', fontWeight: '700', color }}>{value}</div>
      <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>{label}</div>
    </div>
  );
}
