'use client';

import { useState } from 'react';
import GoalCard from '@/components/dashboard/GoalCard';
import WeekStats from '@/components/dashboard/WeekStats';
import TodayFocus from '@/components/dashboard/TodayFocus';
import BrainDumpModal from '@/components/shared/BrainDumpModal';
import { useAppData } from '@/hooks/useAppData';
import type { TimeBlock } from '@/lib/types';

export default function DashboardPage() {
  const { data, toggleTask, setSchedule } = useAppData();
  const [showDump, setShowDump] = useState(false);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  function handleImport(blocks: TimeBlock[]) {
    setSchedule([...data.currentSchedule, ...blocks]);
  }

  return (
    <div style={{ padding: '32px 32px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em' }}>{greeting} 👋</div>
          <div style={{ fontSize: 14, color: '#8E8E93', marginTop: 4 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
        <button
          className="btn-primary"
          onClick={() => setShowDump(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px' }}
        >
          <span style={{ fontSize: 16 }}>+</span> Brain Dump
        </button>
      </div>

      <div style={{ display: 'flex', gap: 20, marginBottom: 24, flexWrap: 'wrap' }}>
        {data.goals.map(goal => (
          <GoalCard
            key={goal.id}
            goal={goal}
            tasks={data.tasks}
            blocks={data.currentSchedule}
          />
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <TodayFocus
          tasks={data.tasks}
          blocks={data.currentSchedule}
          onToggle={toggleTask}
        />
        <WeekStats goals={data.goals} blocks={data.currentSchedule} />
      </div>

      {showDump && (
        <BrainDumpModal onImport={handleImport} onClose={() => setShowDump(false)} />
      )}
    </div>
  );
}
