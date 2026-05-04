'use client';

import { useState } from 'react';
import { parseBrainDump } from '@/lib/parser';
import type { TimeBlock } from '@/lib/types';
import { GOAL_CONFIG } from '@/lib/constants';
import { formatTime } from '@/lib/utils';

interface Props {
  onImport: (blocks: TimeBlock[]) => void;
  onClose: () => void;
}

const EXAMPLE = `Monday I wake up at 5:30am, 30 mins prayer and journaling, then gym at 6:30 for an hour.
At 9am I start business work, emails and client calls till noon.
Tuesday morning is meditation at 6am for 20 mins, then meal prep at 7 for 45 mins.
Wednesday business strategy meeting at 10am for 2 hours.
Thursday gym again at 6:30am for an hour, business review at 2pm for 90 mins.
Friday morning prayer at 6am, then work on content and sales till 5pm.
Saturday long run at 7am for an hour, rest of day personal time.
Sunday church at 10am for 2 hours, meal prep at 3pm for 90 mins.`;

export default function BrainDumpModal({ onImport, onClose }: Props) {
  const [text, setText] = useState('');
  const [preview, setPreview] = useState<TimeBlock[] | null>(null);

  function handleParse() {
    const blocks = parseBrainDump(text);
    setPreview(blocks);
  }

  function handleImport() {
    if (preview) {
      onImport(preview);
      onClose();
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="card fade-in" style={{
        width: '100%', maxWidth: 680, maxHeight: '90vh',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        padding: 0,
      }}>
        <div style={{ padding: '24px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Brain Dump</div>
            <div style={{ fontSize: 13, color: '#8E8E93' }}>
              Paste your voice note or describe your week. The parser will extract time blocks automatically.
            </div>
          </div>
          <button className="btn-ghost" onClick={onClose} style={{ flexShrink: 0, marginLeft: 16 }}>✕</button>
        </div>

        <div style={{ padding: 24, flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {!preview ? (
            <>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder={EXAMPLE}
                style={{
                  minHeight: 200, resize: 'vertical',
                  fontFamily: 'inherit', lineHeight: 1.6,
                }}
              />
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button className="btn-ghost" onClick={() => setText(EXAMPLE)}>Load example</button>
                <button
                  className="btn-primary"
                  onClick={handleParse}
                  disabled={text.trim().length < 20}
                  style={{ opacity: text.trim().length < 20 ? 0.4 : 1 }}
                >
                  Parse →
                </button>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>
                  Found {preview.length} time blocks
                </div>
                <button className="btn-ghost" onClick={() => setPreview(null)}>← Edit text</button>
              </div>

              {preview.length === 0 ? (
                <div style={{ color: '#8E8E93', textAlign: 'center', padding: 32 }}>
                  Couldn't detect time blocks. Try including specific times like "at 7am" or "9:30".
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {preview.map(b => {
                    const cfg = b.goalCategory !== 'personal' ? GOAL_CONFIG[b.goalCategory as keyof typeof GOAL_CONFIG] : null;
                    const color = cfg?.color || '#8E8E93';
                    return (
                      <div key={b.id} style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '10px 14px',
                        borderRadius: 10,
                        background: color + '10',
                        border: `1px solid ${color}25`,
                      }}>
                        <div style={{ width: 3, height: 30, background: color, borderRadius: 2, flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{b.title}</div>
                          <div style={{ fontSize: 11, color: '#8E8E93' }}>
                            {b.day.charAt(0).toUpperCase() + b.day.slice(1)} · {formatTime(b.startTime)}–{formatTime(b.endTime)}
                          </div>
                        </div>
                        <span style={{
                          fontSize: 10, padding: '3px 8px', borderRadius: 6,
                          background: color + '20', color,
                        }}>
                          {cfg?.label || 'Personal'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                <button className="btn-ghost" onClick={onClose}>Cancel</button>
                <button
                  className="btn-primary"
                  onClick={handleImport}
                  disabled={preview.length === 0}
                  style={{ opacity: preview.length === 0 ? 0.4 : 1 }}
                >
                  Import {preview.length} blocks →
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
