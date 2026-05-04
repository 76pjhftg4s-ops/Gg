'use client';

import type { Task, TimeBlock } from '@/lib/types';
import { GOAL_CONFIG } from '@/lib/constants';
import { getDayOfWeek, formatTime } from '@/lib/utils';

interface Props {
  tasks: Task[];
  blocks: TimeBlock[];
  onToggle: (id: string) => void;
}

export default function TodayFocus({ tasks, blocks, onToggle }: Props) {
  const today = getDayOfWeek();
  const todayBlocks = blocks
    .filter(b => b.day === today)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const todayTasks = tasks.filter(t => {
    if (!t.scheduledDate) return false;
    return t.scheduledDate === new Date().toISOString().split('T')[0];
  });

  return (
    <div className="card" style={{ padding: '24px' }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>Today's Focus</div>
        <div style={{ fontSize: 12, color: '#8E8E93', marginTop: 2 }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {todayBlocks.length === 0 && todayTasks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 0', color: '#8E8E93' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
          <div style={{ fontSize: 14 }}>No schedule for today yet.</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>Use the brain dump to add your week.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {todayBlocks.map(block => {
            const cfg = block.goalCategory !== 'personal' ? GOAL_CONFIG[block.goalCategory as keyof typeof GOAL_CONFIG] : null;
            const color = cfg?.color || '#8E8E93';
            return (
              <div key={block.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px',
                borderRadius: 10,
                background: color + '12',
                border: `1px solid ${color}25`,
              }}>
                <div style={{ width: 3, height: 36, borderRadius: 2, background: color, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{block.title}</div>
                  <div style={{ fontSize: 11, color: '#8E8E93', marginTop: 2 }}>
                    {formatTime(block.startTime)} – {formatTime(block.endTime)}
                    {cfg && <span style={{ color, marginLeft: 6 }}>· {cfg.label}</span>}
                  </div>
                </div>
              </div>
            );
          })}

          {todayTasks.map(task => {
            const cfg = GOAL_CONFIG[task.goalCategory];
            return (
              <div
                key={task.id}
                onClick={() => onToggle(task.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px',
                  borderRadius: 10,
                  background: '#1C1C1F',
                  cursor: 'pointer',
                  opacity: task.completed ? 0.5 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                <div style={{
                  width: 18, height: 18, borderRadius: 5,
                  border: `2px solid ${task.completed ? cfg.color : '#2A2A2F'}`,
                  background: task.completed ? cfg.color : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.15s',
                }}>
                  {task.completed && <span style={{ color: 'white', fontSize: 10 }}>✓</span>}
                </div>
                <span style={{
                  fontSize: 13,
                  textDecoration: task.completed ? 'line-through' : 'none',
                  color: task.completed ? '#8E8E93' : '#F5F5F7',
                }}>{task.title}</span>
                <span style={{
                  marginLeft: 'auto', fontSize: 10,
                  color: cfg.color,
                  background: cfg.color + '18',
                  padding: '2px 6px',
                  borderRadius: 4,
                }}>
                  {cfg.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
