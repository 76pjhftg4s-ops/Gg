'use client';

import type { Goal, TimeBlock } from '@/lib/types';
import { GOAL_CONFIG } from '@/lib/constants';
import { calcHoursPerCategory } from '@/lib/utils';

interface Props {
  goals: Goal[];
  blocks: TimeBlock[];
}

export default function WeekStats({ goals, blocks }: Props) {
  const hours = calcHoursPerCategory(blocks);
  const totalTarget = goals.reduce((a, g) => a + g.weeklyHoursTarget, 0);
  const totalLogged = (hours.spiritual || 0) + (hours.business || 0) + (hours.body || 0);

  return (
    <div className="card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Weekly Hours</div>
          <div style={{ fontSize: 12, color: '#8E8E93' }}>Scheduled vs target</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{totalLogged.toFixed(1)}h</div>
          <div style={{ fontSize: 11, color: '#8E8E93' }}>of {totalTarget}h total</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {(['spiritual', 'business', 'body'] as const).map(cat => {
          const cfg = GOAL_CONFIG[cat];
          const goal = goals.find(g => g.category === cat);
          const logged = hours[cat] || 0;
          const target = goal?.weeklyHoursTarget || 0;
          const pct = target > 0 ? Math.min((logged / target) * 100, 100) : 0;

          return (
            <div key={cat}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color }} />
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{cfg.label}</span>
                </div>
                <span style={{ fontSize: 12, color: '#8E8E93' }}>{logged.toFixed(1)} / {target}h</span>
              </div>
              <div style={{ height: 6, background: '#2A2A2F', borderRadius: 3 }}>
                <div style={{
                  height: '100%',
                  width: `${pct}%`,
                  background: `linear-gradient(90deg, ${cfg.color}, ${cfg.accent})`,
                  borderRadius: 3,
                  transition: 'width 0.6s ease',
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
