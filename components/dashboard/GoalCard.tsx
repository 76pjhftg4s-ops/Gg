'use client';

import ProgressRing from './ProgressRing';
import type { Goal, Task, TimeBlock } from '@/lib/types';
import { GOAL_CONFIG } from '@/lib/constants';
import { calcHoursPerCategory } from '@/lib/utils';

interface Props {
  goal: Goal;
  tasks: Task[];
  blocks: TimeBlock[];
}

export default function GoalCard({ goal, tasks, blocks }: Props) {
  const cfg = GOAL_CONFIG[goal.category];
  const hoursLogged = calcHoursPerCategory(blocks)[goal.category] || 0;
  const hoursPct = goal.weeklyHoursTarget > 0
    ? Math.min((hoursLogged / goal.weeklyHoursTarget) * 100, 100)
    : 0;

  const catTasks = tasks.filter(t => t.goalCategory === goal.category);
  const completed = catTasks.filter(t => t.completed).length;
  const taskPct = catTasks.length > 0 ? (completed / catTasks.length) * 100 : 0;

  return (
    <div className="card fade-in" style={{
      padding: '24px',
      border: `1px solid ${cfg.darkBorder}`,
      background: cfg.darkBg,
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      flex: 1,
      minWidth: 0,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: cfg.color + '22',
            border: `1px solid ${cfg.color}55`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 12,
            fontSize: 16,
            color: cfg.color,
          }}>
            {goal.category === 'spiritual' ? '✦' : goal.category === 'business' ? '◈' : '◉'}
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#F5F5F7', marginBottom: 2 }}>
            {goal.title}
          </div>
          <div style={{ fontSize: 12, color: '#8E8E93' }}>{goal.description}</div>
        </div>
        <ProgressRing percent={hoursPct} color={cfg.color} size={76} stroke={6} />
      </div>

      <div style={{ display: 'flex', gap: 24 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: cfg.color }}>{hoursLogged.toFixed(1)}h</div>
          <div style={{ fontSize: 11, color: '#8E8E93' }}>of {goal.weeklyHoursTarget}h target</div>
        </div>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#F5F5F7' }}>{completed}/{catTasks.length}</div>
          <div style={{ fontSize: 11, color: '#8E8E93' }}>tasks done</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {goal.subGoals.slice(0, 4).map(sg => (
          <span key={sg.id} style={{
            fontSize: 11, padding: '3px 8px',
            borderRadius: 6,
            background: cfg.color + '18',
            color: cfg.lightColor,
            border: `1px solid ${cfg.color}25`,
          }}>
            {sg.title}
          </span>
        ))}
        {goal.subGoals.length === 0 && (
          <span style={{ fontSize: 11, color: '#8E8E93' }}>No sub-goals yet — add in Goals</span>
        )}
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: '#8E8E93' }}>TASK COMPLETION</span>
          <span style={{ fontSize: 11, color: cfg.color }}>{Math.round(taskPct)}%</span>
        </div>
        <div style={{ height: 4, background: '#2A2A2F', borderRadius: 2 }}>
          <div style={{
            height: '100%',
            width: `${taskPct}%`,
            background: `linear-gradient(90deg, ${cfg.color}, ${cfg.accent})`,
            borderRadius: 2,
            transition: 'width 0.6s ease',
          }} />
        </div>
      </div>
    </div>
  );
}
