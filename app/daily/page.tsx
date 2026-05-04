'use client';

import { useState } from 'react';
import { useAppData } from '@/hooks/useAppData';
import { GOAL_CONFIG } from '@/lib/constants';
import { getDayOfWeek, formatTime, blockDurationHours, uid } from '@/lib/utils';
import type { GoalCategory, Task } from '@/lib/types';

export default function DailyPage() {
  const { data, toggleTask, addTask, deleteTask } = useAppData();
  const today = getDayOfWeek();
  const todayDate = new Date().toISOString().split('T')[0];

  const todayBlocks = data.currentSchedule
    .filter(b => b.day === today)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const todayTasks = data.tasks.filter(t => t.scheduledDate === todayDate);

  const [newTask, setNewTask] = useState({ title: '', category: 'business' as GoalCategory, time: '' });
  const [adding, setAdding] = useState(false);

  const hoursByCategory = todayBlocks.reduce((acc, b) => {
    const dur = blockDurationHours(b);
    if (b.goalCategory !== 'personal') {
      acc[b.goalCategory as GoalCategory] = (acc[b.goalCategory as GoalCategory] || 0) + dur;
    }
    return acc;
  }, {} as Record<GoalCategory, number>);

  function handleAdd() {
    if (!newTask.title) return;
    addTask({
      id: uid(),
      goalCategory: newTask.category,
      title: newTask.title,
      completed: false,
      scheduledDate: todayDate,
      scheduledTime: newTask.time || undefined,
      priority: 'medium',
    });
    setNewTask({ title: '', category: 'business', time: '' });
    setAdding(false);
  }

  return (
    <div style={{ padding: '32px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>Daily Focus</div>
        <div style={{ fontSize: 13, color: '#8E8E93', marginTop: 2 }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
        {(['spiritual', 'business', 'body'] as const).map(cat => {
          const cfg = GOAL_CONFIG[cat];
          const hrs = hoursByCategory[cat] || 0;
          const goal = data.goals.find(g => g.category === cat);
          const dayTarget = goal ? goal.weeklyHoursTarget / 5 : 0;
          const pct = dayTarget > 0 ? Math.min((hrs / dayTarget) * 100, 100) : 0;

          return (
            <div key={cat} className="card-sm" style={{
              padding: '14px 18px', flex: 1, minWidth: 130,
              borderColor: cfg.darkBorder,
              background: cfg.darkBg,
            }}>
              <div style={{ fontSize: 11, color: cfg.lightColor, fontWeight: 600, marginBottom: 6 }}>{cfg.label.toUpperCase()}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: cfg.color }}>{hrs.toFixed(1)}h</div>
              <div style={{ marginTop: 8, height: 3, background: '#2A2A2F', borderRadius: 2 }}>
                <div style={{ height: '100%', width: `${pct}%`, background: cfg.color, borderRadius: 2, transition: 'width 0.5s' }} />
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Today's Schedule</div>
          {todayBlocks.length === 0 ? (
            <div style={{ color: '#8E8E93', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>
              No blocks scheduled today.<br />Add from Weekly view.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {todayBlocks.map(b => {
                const cfg = b.goalCategory !== 'personal' ? GOAL_CONFIG[b.goalCategory as GoalCategory] : null;
                const color = cfg?.color || '#8E8E93';
                const dur = blockDurationHours(b);
                return (
                  <div key={b.id} style={{
                    display: 'flex', gap: 12, alignItems: 'center',
                    padding: '10px 14px',
                    borderRadius: 10,
                    background: color + '10',
                    borderLeft: `3px solid ${color}`,
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{b.title}</div>
                      <div style={{ fontSize: 11, color: '#8E8E93' }}>
                        {formatTime(b.startTime)} – {formatTime(b.endTime)} · {dur.toFixed(1)}h
                      </div>
                    </div>
                    {cfg && <span style={{ fontSize: 10, color, background: color + '18', padding: '2px 7px', borderRadius: 4 }}>{cfg.label}</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>Tasks</div>
            <button className="btn-primary" style={{ padding: '5px 12px', fontSize: 12 }} onClick={() => setAdding(a => !a)}>
              {adding ? '−' : '+ Add'}
            </button>
          </div>

          {adding && (
            <div style={{ marginBottom: 14, display: 'flex', flexDirection: 'column', gap: 8, padding: 12, background: '#1C1C1F', borderRadius: 10 }}>
              <input placeholder="Task title" value={newTask.title} onChange={e => setNewTask(n => ({ ...n, title: e.target.value }))} autoFocus />
              <div style={{ display: 'flex', gap: 8 }}>
                <select value={newTask.category} onChange={e => setNewTask(n => ({ ...n, category: e.target.value as GoalCategory }))} style={{ flex: 1 }}>
                  <option value="spiritual">Spiritual</option>
                  <option value="business">Business</option>
                  <option value="body">Body</option>
                </select>
                <input type="time" value={newTask.time} onChange={e => setNewTask(n => ({ ...n, time: e.target.value }))} style={{ flex: 1 }} />
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button className="btn-ghost" onClick={() => setAdding(false)}>Cancel</button>
                <button className="btn-primary" onClick={handleAdd}>Add</button>
              </div>
            </div>
          )}

          {todayTasks.length === 0 && !adding ? (
            <div style={{ color: '#8E8E93', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>
              No tasks for today yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {todayTasks.map(t => {
                const cfg = GOAL_CONFIG[t.goalCategory];
                return (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      onClick={() => toggleTask(t.id)}
                      style={{
                        width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                        border: `2px solid ${t.completed ? cfg.color : '#2A2A2F'}`,
                        background: t.completed ? cfg.color : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}
                    >
                      {t.completed && <span style={{ color: 'white', fontSize: 10 }}>✓</span>}
                    </div>
                    <span style={{
                      flex: 1, fontSize: 13,
                      textDecoration: t.completed ? 'line-through' : 'none',
                      color: t.completed ? '#8E8E93' : '#F5F5F7',
                    }}>{t.title}</span>
                    <button
                      onClick={() => deleteTask(t.id)}
                      style={{ background: 'none', color: '#8E8E93', fontSize: 14, padding: 4 }}
                    >×</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
