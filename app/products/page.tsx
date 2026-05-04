'use client';

import { useState, useEffect, useRef } from 'react';
import { loadEcomData, saveEcomData, compressImage, exportEcomData } from '@/lib/ecom-storage';
import type { Product, ProductStatus, EcomData } from '@/lib/ecom-types';
import { STATUS_CONFIG } from '@/lib/ecom-types';
import { uid } from '@/lib/utils';

const SCORE_COLOR = (s: number) =>
  s >= 8 ? '#27AE60' : s >= 6 ? '#F1C40F' : s >= 4 ? '#E67E22' : '#E74C3C';

const EMPTY: Omit<Product, 'id' | 'dateAdded'> = {
  name: '', image: undefined, status: 'watching', viralScore: 7,
  price: undefined, margin: undefined, angle: '', notes: '', links: [], tags: [],
};

export default function ProductsPage() {
  const [data, setData] = useState<EcomData>({ products: [], hooks: [], log: [] });
  const [filter, setFilter] = useState<ProductStatus | 'all'>('all');
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [linkInput, setLinkInput] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setData(loadEcomData()); }, []);

  function save(next: EcomData) { setData(next); saveEcomData(next); }

  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file);
    setForm(f => ({ ...f, image: compressed }));
  }

  function openAdd() { setForm({ ...EMPTY }); setLinkInput(''); setEditId(null); setShowAdd(true); }
  function openEdit(p: Product) {
    setForm({ name: p.name, image: p.image, status: p.status, viralScore: p.viralScore,
      price: p.price, margin: p.margin, angle: p.angle ?? '', notes: p.notes,
      links: p.links, tags: p.tags });
    setLinkInput(''); setEditId(p.id); setShowAdd(true);
  }

  function handleSubmit() {
    if (!form.name.trim()) return;
    if (editId) {
      save({ ...data, products: data.products.map(p => p.id === editId ? { ...p, ...form } : p) });
    } else {
      const product: Product = { id: uid(), dateAdded: new Date().toISOString().split('T')[0], ...form };
      save({ ...data, products: [product, ...data.products] });
    }
    setShowAdd(false);
  }

  function handleDelete(id: string) {
    save({ ...data, products: data.products.filter(p => p.id !== id) });
    setDeleteConfirm(null);
  }

  function addLink() {
    if (!linkInput.trim()) return;
    setForm(f => ({ ...f, links: [...f.links, linkInput.trim()] }));
    setLinkInput('');
  }

  const filtered = filter === 'all' ? data.products : data.products.filter(p => p.status === filter);
  const counts = { all: data.products.length, watching: 0, testing: 0, winner: 0, dead: 0 };
  data.products.forEach(p => counts[p.status]++);

  return (
    <div style={{ padding: '32px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>Product Research</div>
          <div style={{ fontSize: 13, color: '#8E8E93', marginTop: 2 }}>Track every product you test. Build your pattern library.</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-ghost" onClick={exportEcomData} style={{ fontSize: 12 }}>⬇ Export backup</button>
          <button className="btn-primary" onClick={openAdd}>+ Add Product</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {(['all', 'watching', 'testing', 'winner', 'dead'] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{
            padding: '6px 14px', borderRadius: 20, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            background: filter === s ? (s === 'all' ? '#2980B9' : STATUS_CONFIG[s]?.color ?? '#2980B9') : '#1C1C1F',
            color: filter === s ? 'white' : '#8E8E93',
            transition: 'all 0.15s',
          }}>
            {s === 'all' ? 'All' : STATUS_CONFIG[s].label} ({counts[s]})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0', color: '#8E8E93' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>No products yet</div>
          <div style={{ fontSize: 13 }}>Add a product you're researching or testing.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {filtered.map(p => {
            const sc = STATUS_CONFIG[p.status];
            return (
              <div key={p.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {p.image ? (
                  <div style={{ height: 180, overflow: 'hidden', background: '#1C1C1F' }}>
                    <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ) : (
                  <div style={{ height: 120, background: '#1C1C1F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 40 }}>📦</span>
                  </div>
                )}
                <div style={{ padding: '16px 18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, flex: 1, paddingRight: 8 }}>{p.name}</div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <span style={{ fontSize: 18, fontWeight: 800, color: SCORE_COLOR(p.viralScore) }}>{p.viralScore}</span>
                      <span style={{ fontSize: 10, color: '#8E8E93', alignSelf: 'flex-end', marginBottom: 2 }}>/10</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: sc.bg, color: sc.color }}>{sc.label}</span>
                    {p.price && <span style={{ fontSize: 11, color: '#8E8E93', padding: '3px 8px', background: '#1C1C1F', borderRadius: 6 }}>${p.price}</span>}
                    {p.margin && <span style={{ fontSize: 11, color: '#27AE60', padding: '3px 8px', background: 'rgba(39,174,96,0.1)', borderRadius: 6 }}>{p.margin}% margin</span>}
                  </div>

                  {p.angle && <div style={{ fontSize: 12, color: '#8E8E93', marginBottom: 8, fontStyle: 'italic' }}>Angle: {p.angle}</div>}
                  {p.notes && <div style={{ fontSize: 12, color: '#F5F5F7', marginBottom: 10, lineHeight: 1.5 }}>{p.notes}</div>}

                  {p.links.length > 0 && (
                    <div style={{ marginBottom: 10 }}>
                      {p.links.map((link, i) => (
                        <a key={i} href={link} target="_blank" rel="noreferrer" style={{ display: 'block', fontSize: 11, color: '#2980B9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 3 }}>
                          🔗 {link}
                        </a>
                      ))}
                    </div>
                  )}

                  <div style={{ fontSize: 10, color: '#8E8E93', marginBottom: 12 }}>Added {p.dateAdded}</div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn-ghost" onClick={() => openEdit(p)} style={{ flex: 1, fontSize: 12, padding: '6px' }}>Edit</button>
                    {deleteConfirm === p.id ? (
                      <div style={{ display: 'flex', gap: 6, flex: 1 }}>
                        <button onClick={() => handleDelete(p.id)} style={{ flex: 1, background: '#E74C3C', color: 'white', border: 'none', borderRadius: 6, fontSize: 11, padding: '6px', cursor: 'pointer' }}>Delete</button>
                        <button className="btn-ghost" onClick={() => setDeleteConfirm(null)} style={{ flex: 1, fontSize: 11, padding: '6px' }}>Cancel</button>
                      </div>
                    ) : (
                      <button className="btn-ghost" onClick={() => setDeleteConfirm(p.id)} style={{ fontSize: 12, padding: '6px 10px', color: '#E74C3C', borderColor: '#E74C3C30' }}>✕</button>
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
          <div className="card fade-in" style={{ width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', padding: 28 }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>{editId ? 'Edit Product' : 'Add Product'}</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <div className="label" style={{ marginBottom: 6 }}>Product Name *</div>
                <input placeholder="e.g. Posture corrector, LED face mask..." value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoFocus />
              </div>

              <div>
                <div className="label" style={{ marginBottom: 6 }}>Screenshot / Image</div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <button className="btn-ghost" onClick={() => fileRef.current?.click()} style={{ fontSize: 13 }}>📷 Upload Screenshot</button>
                  {form.image && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <img src={form.image} alt="preview" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }} />
                      <button onClick={() => setForm(f => ({ ...f, image: undefined }))} style={{ background: 'none', color: '#8E8E93', border: 'none', cursor: 'pointer', fontSize: 16 }}>×</button>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div className="label" style={{ marginBottom: 6 }}>Status</div>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as ProductStatus }))}>
                    <option value="watching">Watching</option>
                    <option value="testing">Testing</option>
                    <option value="winner">Winner</option>
                    <option value="dead">Dead</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <div className="label" style={{ marginBottom: 6 }}>Viral Score ({form.viralScore}/10)</div>
                  <input type="range" min={1} max={10} value={form.viralScore} onChange={e => setForm(f => ({ ...f, viralScore: +e.target.value }))}
                    style={{ width: '100%', accentColor: SCORE_COLOR(form.viralScore), padding: 0, border: 'none', background: 'transparent' }} />
                  <div style={{ fontSize: 11, color: SCORE_COLOR(form.viralScore), textAlign: 'center', fontWeight: 700 }}>{form.viralScore}/10</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div className="label" style={{ marginBottom: 6 }}>Price ($)</div>
                  <input type="number" placeholder="e.g. 39" value={form.price ?? ''} onChange={e => setForm(f => ({ ...f, price: e.target.value ? +e.target.value : undefined }))} />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="label" style={{ marginBottom: 6 }}>Margin (%)</div>
                  <input type="number" placeholder="e.g. 65" value={form.margin ?? ''} onChange={e => setForm(f => ({ ...f, margin: e.target.value ? +e.target.value : undefined }))} />
                </div>
              </div>

              <div>
                <div className="label" style={{ marginBottom: 6 }}>Angle / Positioning</div>
                <input placeholder="e.g. For gym people who struggle with back pain" value={form.angle} onChange={e => setForm(f => ({ ...f, angle: e.target.value }))} />
              </div>

              <div>
                <div className="label" style={{ marginBottom: 6 }}>Notes</div>
                <textarea placeholder="What's interesting about this product? Why might it go viral?" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ minHeight: 80 }} />
              </div>

              <div>
                <div className="label" style={{ marginBottom: 6 }}>Links (competitor videos, supplier, product page)</div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input placeholder="https://..." value={linkInput} onChange={e => setLinkInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addLink()} />
                  <button className="btn-primary" onClick={addLink} style={{ padding: '8px 14px', flexShrink: 0 }}>Add</button>
                </div>
                {form.links.map((link, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: '#2980B9', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{link}</span>
                    <button onClick={() => setForm(f => ({ ...f, links: f.links.filter((_, j) => j !== i) }))} style={{ background: 'none', color: '#8E8E93', border: 'none', cursor: 'pointer' }}>×</button>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid #2A2A2F' }}>
                <button className="btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
                <button className="btn-primary" onClick={handleSubmit} disabled={!form.name.trim()} style={{ opacity: form.name.trim() ? 1 : 0.4 }}>
                  {editId ? 'Save Changes' : 'Add Product'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
