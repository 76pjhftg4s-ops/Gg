'use client';

import { useState, useEffect } from 'react';
import { loadEcomData, saveEcomData, detectHookCategory, getHookPatternStats } from '@/lib/ecom-storage';
import type { Hook, HookCategory, HookResult, EcomData } from '@/lib/ecom-types';
import { HOOK_CATEGORY_LABELS, HOOK_CATEGORY_COLORS, RESULT_CONFIG } from '@/lib/ecom-types';
import { uid } from '@/lib/utils';

const EMPTY_HOOK: Omit<Hook, 'id' | 'dateAdded'> = {
  text: '', category: 'other', result: 'testing',
  productId: undefined, productName: '', views1hr: undefined,
  views24hr: undefined, notes: '', videoLink: '',
};

export default function HookLibraryPage() {
  const [data, setData] = useState<EcomData>({ products: [], hooks: [], log: [] });
  const [catFilter, setCatFilter] = useState<HookCategory | 'all'>('all');
  const [resultFilter, setResultFilter] = useState<HookResult | 'all'>('all');
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_HOOK });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => { setData(loadEcomData()); }, []);

  function save(next: EcomData) { setData(next); saveEcomData(next); }

  function openAdd() {
    setForm({ ...EMPTY_HOOK }); setEditId(null); setShowAdd(true);
  }

  function openEdit(h: Hook) {
    setForm({ text: h.text, category: h.category, result: h.result,
      productId: h.productId, productName: h.productName ?? '',
      views1hr: h.views1hr, views24hr: h.views24hr,
      notes: h.notes, videoLink: h.videoLink ?? '' });
    setEditId(h.id); setShowAdd(true);
  }

  function handleTextChange(text: string) {
    const auto = detectHookCategory(text);
    setForm(f => ({ ...f, text, category: auto }));
  }

  function handleSubmit() {
    if (!form.text.trim()) return;
    if (editId) {
      save({ ...data, hooks: data.hooks.map(h => h.id === editId ? { ...h, ...form } : h) });
    } else {
      const hook: Hook = { id: uid(), dateAdded: new Date().toISOString().split('T')[0], ...form };
      save({ ...data, hooks: [hook, ...data.hooks] });
    }
    setShowAdd(false);
  }

  function handleDelete(id: string) {
    save({ ...data, hooks: data.hooks.filter(h => h.id !== id) });
    setDeleteConfirm(null);
  }

  const stats = getHookPatternStats(data.hooks);

  const filtered = data.hooks.filter(h => {
    if (catFilter !== 'all' && h.category !== catFilter) return false;
    if (resultFilter !== 'all' && h.result !== resultFilter) return false;
    if (search && !h.text.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const winRate = (cat: string) => {
    const s = stats[cat];
    if (!s || s.total === 0) return 0;
    return Math.round((s.winners / s.total) * 100);
  };

  return (
    <div style={{ padding: '32px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>Hook Library</div>
          <div style={{ fontSize: 13, color: '#8E8E93', marginTop: 2 }}>Your personal pattern recognition engine. Every hook you test, tracked.</div>
        </div>
        <button className="btn-primary" onClick={openAdd}>+ Add Hook</button>
      </div>

      {/* Pattern Stats */}
      {Object.keys(stats).length > 0 && (
        <div className="card" style={{ padding: '18px 24px', marginBottom: 24 }}>
          <div className="label" style={{ marginBottom: 14 }}>Pattern Stats — Win Rate by Hook Type</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {Object.entries(stats).sort((a, b) => b[1].winners - a[1].winners).map(([cat, s]) => {
              const color = HOOK_CATEGORY_COLORS[cat as HookCategory] || '#8E8E93';
              const rate = winRate(cat);
              return (
                <div key={cat} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 80, padding: '10px 14px', background: color + '12', borderRadius: 10, border: `1px solid ${color}25` }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: rate >= 50 ? '#27AE60' : rate >= 25 ? '#F1C40F' : '#8E8E93' }}>{rate}%</div>
                  <div style={{ fontSize: 10, color, fontWeight: 600, textAlign: 'center' }}>{HOOK_CATEGORY_LABELS[cat as HookCategory]}</div>
                  <div style={{ fontSize: 10, color: '#8E8E93' }}>{s.winners}/{s.total}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <button onClick={() => setCatFilter('all')} style={{ padding: '5px 12px', borderRadius: 16, border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer', background: catFilter === 'all' ? '#2980B9' : '#1C1C1F', color: catFilter === 'all' ? 'white' : '#8E8E93' }}>All types</button>
        {(Object.keys(HOOK_CATEGORY_LABELS) as HookCategory[]).map(cat => (
          <button key={cat} onClick={() => setCatFilter(cat)} style={{ padding: '5px 12px', borderRadius: 16, border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer', background: catFilter === cat ? HOOK_CATEGORY_COLORS[cat] : '#1C1C1F', color: catFilter === cat ? 'white' : '#8E8E93', transition: 'all 0.15s' }}>
            {HOOK_CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {(['all', 'winner', 'testing', 'dead'] as const).map(r => (
          <button key={r} onClick={() => setResultFilter(r)} style={{ padding: '5px 12px', borderRadius: 16, fontSize: 11, cursor: 'pointer', background: resultFilter === r ? '#1C1C1F' : '#141416', color: resultFilter === r ? '#F5F5F7' : '#8E8E93', border: resultFilter === r ? '1px solid #2A2A2F' : '1px solid transparent' }}>
            {r === 'all' ? 'All results' : RESULT_CONFIG[r].label}
          </button>
        ))}
        <input placeholder="Search hooks..." value={search} onChange={e => setSearch(e.target.value)} style={{ marginLeft: 'auto', width: 200, padding: '5px 12px', fontSize: 12 }} />
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0', color: '#8E8E93' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🪝</div>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{data.hooks.length === 0 ? 'No hooks yet' : 'No matches'}</div>
          <div style={{ fontSize: 13 }}>Add every hook you test — winning or not. That\'s your data.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(h => {
            const catColor = HOOK_CATEGORY_COLORS[h.category];
            const rc = RESULT_CONFIG[h.result];
            return (
              <div key={h.id} className="card" style={{ padding: '18px 20px', borderLeft: `3px solid ${h.result === 'winner' ? '#27AE60' : h.result === 'dead' ? '#2A2A2F' : catColor}` }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 10, lineHeight: 1.5, color: h.result === 'dead' ? '#8E8E93' : '#F5F5F7' }}>
                      "{h.text}"
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: h.notes ? 10 : 0 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 12, background: catColor + '20', color: catColor }}>{HOOK_CATEGORY_LABELS[h.category]}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 12, background: rc.color + '20', color: rc.color }}>{rc.label}</span>
                      {h.productName && <span style={{ fontSize: 11, color: '#8E8E93' }}>· {h.productName}</span>}
                      {h.views1hr !== undefined && <span style={{ fontSize: 11, color: '#8E8E93' }}>· {h.views1hr.toLocaleString()} views/1hr</span>}
                      {h.views24hr !== undefined && <span style={{ fontSize: 11, color: '#8E8E93' }}>· {h.views24hr.toLocaleString()} views/24hr</span>}
                      <span style={{ fontSize: 10, color: '#8E8E93', marginLeft: 'auto' }}>{h.dateAdded}</span>
                    </div>
                    {h.notes && <div style={{ fontSize: 12, color: '#8E8E93', marginTop: 6 }}>{h.notes}</div>}
                    {h.videoLink && (
                      <a href={h.videoLink} target="_blank" rel="noreferrer" style={{ display: 'inline-block', fontSize: 11, color: '#2980B9', marginTop: 6 }}>🔗 View video</a>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button className="btn-ghost" onClick={() => openEdit(h)} style={{ fontSize: 11, padding: '4px 10px' }}>Edit</button>
                    {deleteConfirm === h.id ? (
                      <>
                        <button onClick={() => handleDelete(h.id)} style={{ background: '#E74C3C', color: 'white', border: 'none', borderRadius: 6, fontSize: 11, padding: '4px 10px', cursor: 'pointer' }}>Del</button>
                        <button className="btn-ghost" onClick={() => setDeleteConfirm(null)} style={{ fontSize: 11, padding: '4px 8px' }}>✕</button>
                      </>
                    ) : (
                      <button className="btn-ghost" onClick={() => setDeleteConfirm(h.id)} style={{ fontSize: 11, padding: '4px 8px', color: '#E74C3C', borderColor: '#E74C3C30' }}>✕</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="card fade-in" style={{ width: '100%', maxWidth: 540, maxHeight: '90vh', overflowY: 'auto', padding: 28 }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>{editId ? 'Edit Hook' : 'Add Hook'}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <div className="label" style={{ marginBottom: 6 }}>Hook Text *</div>
                <textarea placeholder="Type or paste your hook here..." value={form.text} onChange={e => handleTextChange(e.target.value)} style={{ minHeight: 80 }} autoFocus />
                {form.text.length > 10 && (
                  <div style={{ marginTop: 6, fontSize: 11, color: HOOK_CATEGORY_COLORS[form.category] }}>
                    Auto-detected: {HOOK_CATEGORY_LABELS[form.category]} — adjust below if wrong
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div className="label" style={{ marginBottom: 6 }}>Category</div>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as HookCategory }))}>
                    {(Object.keys(HOOK_CATEGORY_LABELS) as HookCategory[]).map(c => (
                      <option key={c} value={c}>{HOOK_CATEGORY_LABELS[c]}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <div className="label" style={{ marginBottom: 6 }}>Result</div>
                  <select value={form.result} onChange={e => setForm(f => ({ ...f, result: e.target.value as HookResult }))}>
                    <option value="testing">Testing</option>
                    <option value="winner">Winner ✦</option>
                    <option value="dead">Dead</option>
                  </select>
                </div>
              </div>
              <div>
                <div className="label" style={{ marginBottom: 6 }}>Product Used On</div>
                <select value={form.productId ?? ''} onChange={e => {
                  const p = data.products.find(pr => pr.id === e.target.value);
                  setForm(f => ({ ...f, productId: e.target.value || undefined, productName: p?.name ?? '' }));
                }}>
                  <option value="">Select product (optional)</option>
                  {data.products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div className="label" style={{ marginBottom: 6 }}>Views at 1hr</div>
                  <input type="number" placeholder="e.g. 840" value={form.views1hr ?? ''} onChange={e => setForm(f => ({ ...f, views1hr: e.target.value ? +e.target.value : undefined }))} />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="label" style={{ marginBottom: 6 }}>Views at 24hr</div>
                  <input type="number" placeholder="e.g. 12000" value={form.views24hr ?? ''} onChange={e => setForm(f => ({ ...f, views24hr: e.target.value ? +e.target.value : undefined }))} />
                </div>
              </div>
              <div>
                <div className="label" style={{ marginBottom: 6 }}>Video Link</div>
                <input placeholder="https://tiktok.com/..." value={form.videoLink} onChange={e => setForm(f => ({ ...f, videoLink: e.target.value }))} />
              </div>
              <div>
                <div className="label" style={{ marginBottom: 6 }}>Notes</div>
                <textarea placeholder="Why did it work? What would you change? What angle?" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ minHeight: 64 }} />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid #2A2A2F' }}>
                <button className="btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
                <button className="btn-primary" onClick={handleSubmit} disabled={!form.text.trim()} style={{ opacity: form.text.trim() ? 1 : 0.4 }}>
                  {editId ? 'Save Changes' : 'Add Hook'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
