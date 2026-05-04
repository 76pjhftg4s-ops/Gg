import type { GoalCategory, DayOfWeek } from './types';

export const GOAL_CONFIG: Record<GoalCategory, {
  label: string;
  color: string;
  accent: string;
  lightColor: string;
  darkBg: string;
  darkBorder: string;
}> = {
  spiritual: {
    label: 'Spiritual',
    color: '#9B59B6',
    accent: '#F1C40F',
    lightColor: '#C39BD3',
    darkBg: 'rgba(155,89,182,0.12)',
    darkBorder: 'rgba(155,89,182,0.3)',
  },
  business: {
    label: 'Business',
    color: '#2980B9',
    accent: '#1ABC9C',
    lightColor: '#7FB3D3',
    darkBg: 'rgba(41,128,185,0.12)',
    darkBorder: 'rgba(41,128,185,0.3)',
  },
  body: {
    label: 'Body',
    color: '#27AE60',
    accent: '#E67E22',
    lightColor: '#82E0AA',
    darkBg: 'rgba(39,174,96,0.12)',
    darkBorder: 'rgba(39,174,96,0.3)',
  },
};

export const PILLAR_ICONS: Record<GoalCategory, string> = {
  spiritual: '✦',
  business: '◈',
  body: '◉',
};

export const DAYS: { key: DayOfWeek; label: string; short: string }[] = [
  { key: 'mon', label: 'Monday', short: 'Mon' },
  { key: 'tue', label: 'Tuesday', short: 'Tue' },
  { key: 'wed', label: 'Wednesday', short: 'Wed' },
  { key: 'thu', label: 'Thursday', short: 'Thu' },
  { key: 'fri', label: 'Friday', short: 'Fri' },
  { key: 'sat', label: 'Saturday', short: 'Sat' },
  { key: 'sun', label: 'Sunday', short: 'Sun' },
];

export const HOURS = Array.from({ length: 19 }, (_, i) => i + 5); // 5am–11pm

export const STORAGE_KEY = 'goal-tracker-data';

export const DEFAULT_GOALS = [
  {
    id: 'spiritual',
    category: 'spiritual' as GoalCategory,
    title: 'Spiritual Growth',
    description: 'Deepen faith, prayer, and inner peace',
    weeklyHoursTarget: 7,
    subGoals: [],
  },
  {
    id: 'business',
    category: 'business' as GoalCategory,
    title: 'Business Mastery',
    description: 'Build, grow, and dominate my business',
    weeklyHoursTarget: 40,
    subGoals: [],
  },
  {
    id: 'body',
    category: 'body' as GoalCategory,
    title: 'Body Excellence',
    description: 'Optimize health, fitness, and energy',
    weeklyHoursTarget: 7,
    subGoals: [],
  },
];
