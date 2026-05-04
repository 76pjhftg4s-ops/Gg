import type { GoalCategory, TimeBlock } from './types';

export function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

export function getDayOfWeek(): import('./types').DayOfWeek {
  const keys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
  return keys[new Date().getDay()];
}

export function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'pm' : 'am';
  const hour = h % 12 || 12;
  return m === 0 ? `${hour}${period}` : `${hour}:${String(m).padStart(2, '0')}${period}`;
}

export function blockDurationHours(block: TimeBlock): number {
  const [sh, sm] = block.startTime.split(':').map(Number);
  const [eh, em] = block.endTime.split(':').map(Number);
  return (eh * 60 + em - (sh * 60 + sm)) / 60;
}

export function calcHoursPerCategory(blocks: TimeBlock[]): Record<GoalCategory | 'personal', number> {
  return blocks.reduce(
    (acc, b) => {
      const dur = blockDurationHours(b);
      acc[b.goalCategory] = (acc[b.goalCategory] || 0) + dur;
      return acc;
    },
    { spiritual: 0, business: 0, body: 0, personal: 0 } as Record<GoalCategory | 'personal', number>,
  );
}

export function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function getWeekDates(): Record<import('./types').DayOfWeek, string> {
  const today = new Date();
  const day = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((day === 0 ? 7 : day) - 1));
  const keys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
  const result = {} as Record<import('./types').DayOfWeek, string>;
  keys.forEach((k, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    result[k] = d.toISOString().split('T')[0];
  });
  return result;
}
