'use client';

import type { AppData } from './types';
import { DEFAULT_GOALS, STORAGE_KEY } from './constants';

const DEFAULT_DATA: AppData = {
  goals: DEFAULT_GOALS,
  tasks: [],
  weekTemplates: [],
  currentSchedule: [],
  dailyScores: [],
};

export function loadData(): AppData {
  if (typeof window === 'undefined') return DEFAULT_DATA;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DATA;
    const parsed = JSON.parse(raw) as Partial<AppData>;
    return { ...DEFAULT_DATA, ...parsed };
  } catch {
    return DEFAULT_DATA;
  }
}

export function saveData(data: AppData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function updateData(updater: (prev: AppData) => AppData): AppData {
  const current = loadData();
  const next = updater(current);
  saveData(next);
  return next;
}
