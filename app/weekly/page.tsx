'use client';

import { useState } from 'react';
import { useAppData } from '@/hooks/useAppData';
import { DAYS, GOAL_CONFIG, HOURS } from '@/lib/constants';
import { formatTime, uid } from '@/lib/utils';
import type { TimeBlock, GoalCategory, DayOfWeek } from '@/lib/types';
import BrainDumpModal from '@/components/shared/BrainDumpModal';

const HOUR_HEIGHT = 56;
const LABEL_WIDTH = 52;

function timeToFraction(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h + m / 60;
}

export default function WeeklyPage() {
  const { data, addTimeBlock, deleteTimeBlock, setSchedule } = useAppData();
  const [showDump, setShowDump] = useState(false);
  const [addingBlock, setAddingBlock] = useState<{ day: DayOfWeek; hour: number } | null>(null);
  const [form, setForm] = useState({ title: '', category: 'business' as GoalCategory | 'personal', startTime: '', endTime: '' });

  const minHour = HOURS[0];

  function handleCellClick(day: DayOfWeek, hour: number) {
    setAddingBlock({ day, hour });
    const hStr = String(hour).padStart(2, '0');
    setForm({ title: '', category: 'business', startTime: `${hStr}:00`, endTime: `${String(hour + 1).padStart(2, '0')}:00` });
  }

  function handleSave() {
    if (!addingBlock || !form.title) return;
    const block: TimeBlock = {
      id: uid(),
      day: addingBlock.day,
      startTime: form.startTime,
      endTime: form.endTime,
      goalCategory: form.category,
      title: form.title,
      taskIds: [],
    };
    addTimeBlock(block);
    setAddingBlock(null);
  }

  function handleImport(blocks: TimeBlock[]) {
    setSchedule([...data.currentSchedule, ...blocks]);
  }

  return (
    <div style={{ padding: '32px', maxWidth: 1300, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>Weekly Schedule</div>
          <div style={{ fontSize: 13, color: '#8E8E93', marginTop: 2 }}>Click any cell to add a time block</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {data.currentSchedule.length > 0 && (
            <button className="btn-ghost" onClick={() => setSchedule([])} style={{ color: '#FF453A', borderColor: '#FF453A40' }}>
              Clear all
            </button>
          )}
          <button className="btn-primary" onClick={() => setShowDump(true)}>+ Brain Dump</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {(['spiritual', 'business', 'body', 'personal'] as const).map(cat => {
          const cfg = cat !== 'personal' ? GOAL_CONFIG[cat as GoalCategory] : null;
          const color = cfg?.color || '#8E8E93';
          return (
            <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: color }} />
              <span style={{ fontSize: 12, color: '#8E8E93', textTransform: 'capitalize' }}>{cat}</span>
            </div>
          );
        })}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: 800, display: 'flex', gap: 0 }}>
          <div style={{ width: LABEL_WIDTH, flexShrink: 0 }} />
          {DAYS.map(d => (
            <div key={d.key} style={{ flex: 1, textAlign: 'center', padding: '0 4px 12px', fontSize: 13, fontWeight: 600, color: '#8E8E93' }}>
              {d.short}
            </div>
          ))}
        </div>

        <div style={{ minWidth: 800, display: 'flex', position: 'relative' }}>
          <div style={{ width: LABEL_WIDTH, flexShrink: 0 }}>
            {HOURS.map(h => (
              <div key={h} style={{ height: HOUR_HEIGHT, display: 'flex', alignItems: 'flex-start', paddingTop: 4 }}>
                <span style={{ fontSize: 10, color: '#8E8E93' }}>
                  {h === 0 ? '12am' : h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h - 12}pm`}
                </span>
              </div>
            ))}
          </div>

          {DAYS.map(day => {
            const dayBlocks = data.currentSchedule.filter(b => b.day === day.key);
            return (
              <div key={day.key} style={{ flex: 1, position: 'relative', borderLeft: '1px solid #2A2A2F' }}>
                {HOURS.map(h => (
                  <div
                    key={h}
                    onClick={() => handleCellClick(day.key, h)}
                    style={{
                      height: HOUR_HEIGHT,
                      borderBottom: '1px solid #1C1C1F',
                      cursor: 'pointer',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#1C1C1F')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  />
                ))}

                {dayBlocks.map(block => {
                  const startFrac = timeToFraction(block.startTime);
                  const endFrac = timeToFraction(block.endTime);
                  const top = (startFrac - minHour) * HOUR_HEIGHT;
                  const height = Math.max((endFrac - startFrac) * HOUR_HEIGHT, 22);
                  const cfg = block.goalCategory !== 'personal' ? GOAL_CONFIG[block.goalCategory as GoalCategory] : null;
                  const color = cfg?.color || '#8E8E93';

                  return (
                    <div
                      key={block.id}
                      title={`${block.title} — click to delete`}
                      onClick={e => { e.stopPropagation(); deleteTimeBlock(block.id); }}
                      style={{
                        position: 'absolute',
                        top, left: 2, right: 2,
                        height,
                        background: color + '22',
                        border: `1px solid ${color}55`,
                        borderLeft: `3px solid ${color}`,
                        borderRadius: 6,
                        padding: '3px 6px',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        zIndex: 1,
                      }}
                    >
                      <div style={{ fontSize: 11, fontWeight: 600, color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {block.title}
                      </div>
                      {height > 32 && (
                        <div style={{ fontSize: 10, color: '#8E8E93' }}>
                          {formatTime(block.startTime)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {addingBlock && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={e => e.target === e.currentTarget && setAddingBlock(null)}>
          <div className="card fade-in" style={{ padding: 24, width: 360 }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
              Add Block — {DAYS.find(d => d.key === addingBlock.day)?.label}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                placeholder="Block title (e.g. Morning prayer)"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                autoFocus
              />
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value as GoalCategory | 'personal' }))}
              >
                <option value="spiritual">Spiritual</option>
                <option value="business">Business</option>
                <option value="body">Body</option>
                <option value="personal">Personal</option>
              </select>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: '#8E8E93', marginBottom: 4 }}>START</div>
                  <input type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: '#8E8E93', marginBottom: 4 }}>END</div>
                  <input type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button className="btn-ghost" onClick={() => setAddingBlock(null)}>Cancel</button>
                <button className="btn-primary" onClick={handleSave} disabled={!form.title} style={{ opacity: form.title ? 1 : 0.4 }}>Add</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDump && <BrainDumpModal onImport={handleImport} onClose={() => setShowDump(false)} />}
    </div>
  );
}
