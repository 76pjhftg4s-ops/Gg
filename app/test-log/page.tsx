'use client';

import { useState, useEffect } from 'react';
import { loadEcomData, saveEcomData, detectHookCategory } from '@/lib/ecom-storage';
import type { TestLogEntry, HookCategory, EcomData } from '@/lib/ecom-types';
import { HOOK_CATEGORY_LABELS, HOOK_CATEGORY_COLORS } from '@/lib/ecom-types';
import { uid, getTodayKey } from '@/lib/utils';

const EMPTY: Omit<TestLogEntry, 'id'> = {
  date: getTodayKey(), productId: undefined, productName: '', hookText: '',
  hookCategory: undefined, views1hr: undefined, views24hr: undefined,
  profileVisits: undefined, linkClicks: undefined, sales: undefined, notes: '',
};

export default function TestLogPage() {
  const [data, setData] = useState<EcomData>({ products: [], hooks: [], log: [] });
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<Omit<TestLogEntry, 'id'>>({ ...EMPTY });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    setData(loadEcomData());
    setForm(f => ({ ...f, date: getTodayKey() }));
  }, []);

  function save(next: EcomData) { setData(next); saveEcomData(next); }

  function handleSubmit() {
    if (!form.hookText.trim()) return;
    const entry: TestLogEntry = { id: uid(), ...form };
    save({ ...data, log: [entry, ...data.log] });
    setShowAdd(false);
    setForm({ ...EMPTY, date: getTodayKey() });
  }

  function handleDelete(id: string) {
    save({ ...data, log: data.log.filter(e => e.id !== id) });
    setDeleteConfirm(null);
  }

  // Stats
  const totalTests = data.log.length;
  const totalViews = data.log.reduce((a, e) => a + (e.views24hr || 0), 0);
  const totalSales = data.log.reduce((a, e) => a + (e.sales || 0), 0);
  const hits = data.log.filter(e => (e.views1hr || 0) >= 500).length;

  const sorted = [...data.log].sort((a, b) => b.date.localeCompare(a.date));
  const grouped: Record<string, TestLogEntry[]> = {};
  sorted.forEach(e => { if (!grouped[e.date]) grouped[e.date] = []; grouped[e.date].push(e); });

  return (
    <div style={{ padding: '32px', maxWidth: 960, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>Test Log</div>
          <div style={{ fontSize: 13, color: '#8E8E93', marginTop: 2 }}>Log every video you post. After 20 entries, patterns emerge.</div>
        </div>
        <button className="btn-primary" onClick={() => setShowAdd(true)}>+ Log Test</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        {[
          { label: 'Total Tests', value: totalTests, color: '#2980B9' },
          { label: 'Hits (500+ in 1hr)', value: hits, color: '#27AE60' },
          { label: 'Total Views (24hr)', value: totalViews >= 1000 ? `${(totalViews/1000).toFixed(1)}K` : totalViews, color: '#9B59B6' },
          { label: 'Total Sales', value: totalSales, color: '#F1C40F' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card-sm" style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: 11, color: '#8E8E93', marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {data.log.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0', color: '#8E8E93' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>No tests logged yet</div>
          <div style={{ fontSize: 13 }}>Every video you post is a data point. Start logging.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {Object.entries(grouped).map(([date, entries]) => (
            <div key={date}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#8E8E93', marginBottom: 10, letterSpacing: '0.06em' }}>
                {new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                <span style={{ marginLeft: 10, color: '#2A2A2F' }}>· {entries.length} {entries.length === 1 ? 'test' : 'tests'}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {entries.map(e => {
                  const isHit = (e.views1hr || 0) >= 500;
                  const catColor = e.hookCategory ? HOOK_CATEGORY_COLORS[e.hookCategory] : '#8E8E93';
                  return (
                    <div key={e.id} className="card" style={{ padding: '14px 18px', borderLeft: `3px solid ${isHit ? '#27AE60' : '#2A2A2F'}` }}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, lineHeight: 1.4 }}>"{e.hookText}"</div>
                          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                            {e.productName && <span style={{ fontSize: 11, color: '#8E8E93' }}>📦 {e.productName}</span>}
                            {e.hookCategory && (
                              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: catColor + '20', color: catColor }}>
                                {HOOK_CATEGORY_LABELS[e.hookCategory]}
                              </span>
                            )}
                            {e.views1hr !== undefined && (
                              <span style={{ fontSize: 12, fontWeight: 700, color: isHit ? '#27AE60' : '#F5F5F7' }}>
                                {(e.views1hr).toLocaleString()} {isHit && '🔥'}
                                <span style={{ fontSize: 10, fontWeight: 400, color: '#8E8E93' }}> @1hr</span>
                              </span>
                            )}
                            {e.views24hr !== undefined && (
                              <span style={{ fontSize: 12, color: '#8E8E93' }}>{(e.views24hr).toLocaleString()} <span style={{ fontSize: 10 }}>@24hr</span></span>
                            )}
                            {e.profileVisits !== undefined && <span style={{ fontSize: 11, color: '#8E8E93' }}>👁 {e.profileVisits} visits</span>}
                            {e.sales !== undefined && e.sales > 0 && <span style={{ fontSize: 12, fontWeight: 700, color: '#27AE60' }}>💰 {e.sales} sale{e.sales > 1 ? 's' : ''}</span>}
                          </div>
                          {e.notes && <div style={{ fontSize: 12, color: '#8E8E93', marginTop: 8 }}>{e.notes}</div>}
                        </div>
                        {deleteConfirm === e.id ? (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => handleDelete(e.id)} style={{ background: '#E74C3C', color: 'white', border: 'none', borderRadius: 6, fontSize: 11, padding: '4px 10px', cursor: 'pointer' }}>Delete</button>
                            <button className="btn-ghost" onClick={() => setDeleteConfirm(null)} style={{ fontSize: 11, padding: '4px 8px' }}>✕</button>
                          </div>
                        ) : (
                          <button className="btn-ghost" onClick={() => setDeleteConfirm(e.id)} style={{ fontSize: 11, padding: '4px 8px', color: '#E74C3C', borderColor: '#E74C3C30' }}>✕</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="card fade-in" style={{ width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', padding: 28 }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Log a Test</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div className="label" style={{ marginBottom: 6 }}>Date</div>
                  <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="label" style={{ marginBottom: 6 }}>Product</div>
                  <select value={form.productId ?? ''} onChange={e => {
                    const p = data.products.find(pr => pr.id === e.target.value);
                    setForm(f => ({ ...f, productId: e.target.value || undefined, productName: p?.name ?? f.productName }));
                  }}>
                    <option value="">Select or type below</option>
                    {data.products.filter(p => p.status !== 'dead').map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>
              {!form.productId && (
                <input placeholder="Product name (if not in list)" value={form.productName} onChange={e => setForm(f => ({ ...f, productName: e.target.value }))} />
              )}
              <div>
                <div className="label" style={{ marginBottom: 6 }}>Hook Used *</div>
                <textarea placeholder="Paste the exact hook you used..." value={form.hookText} onChange={e => {
                  const cat = detectHookCategory(e.target.value);
                  setForm(f => ({ ...f, hookText: e.target.value, hookCategory: cat }));
                }} style={{ minHeight: 72 }} autoFocus />
                {form.hookText.length > 10 && form.hookCategory && (
                  <div style={{ fontSize: 11, color: HOOK_CATEGORY_COLORS[form.hookCategory], marginTop: 4 }}>
                    Type: {HOOK_CATEGORY_LABELS[form.hookCategory]}
                  </div>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <div>
                  <div className="label" style={{ marginBottom: 6 }}>Views @1hr</div>
                  <input type="number" placeholder="0" value={form.views1hr ?? ''} onChange={e => setForm(f => ({ ...f, views1hr: e.target.value ? +e.target.value : undefined }))} />
                </div>
                <div>
                  <div className="label" style={{ marginBottom: 6 }}>Views @24hr</div>
                  <input type="number" placeholder="0" value={form.views24hr ?? ''} onChange={e => setForm(f => ({ ...f, views24hr: e.target.value ? +e.target.value : undefined }))} />
                </div>
                <div>
                  <div className="label" style={{ marginBottom: 6 }}>Sales</div>
                  <input type="number" placeholder="0" value={form.sales ?? ''} onChange={e => setForm(f => ({ ...f, sales: e.target.value ? +e.target.value : undefined }))} />
                </div>
              </div>
              <div>
                <div className="label" style={{ marginBottom: 6 }}>Notes</div>
                <textarea placeholder="What happened? Why do you think it performed this way?" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ minHeight: 64 }} />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid #2A2A2F' }}>
                <button className="btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
                <button className="btn-primary" onClick={handleSubmit} disabled={!form.hookText.trim()} style={{ opacity: form.hookText.trim() ? 1 : 0.4 }}>Log It</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
