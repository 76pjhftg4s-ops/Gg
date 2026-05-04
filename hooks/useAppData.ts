'use client';

import { useState, useEffect, useCallback } from 'react';
import { loadData, saveData } from '@/lib/storage';
import type { AppData, Goal, Task, TimeBlock, DailyScore } from '@/lib/types';

export function useAppData() {
  const [data, setData] = useState<AppData>(() => loadData());

  useEffect(() => {
    setData(loadData());
  }, []);

  const update = useCallback((updater: (prev: AppData) => AppData) => {
    setData(prev => {
      const next = updater(prev);
      saveData(next);
      return next;
    });
  }, []);

  const updateGoal = useCallback((goal: Goal) => {
    update(d => ({ ...d, goals: d.goals.map(g => g.id === goal.id ? goal : g) }));
  }, [update]);

  const addTask = useCallback((task: Task) => {
    update(d => ({ ...d, tasks: [...d.tasks, task] }));
  }, [update]);

  const updateTask = useCallback((task: Task) => {
    update(d => ({ ...d, tasks: d.tasks.map(t => t.id === task.id ? task : t) }));
  }, [update]);

  const deleteTask = useCallback((id: string) => {
    update(d => ({ ...d, tasks: d.tasks.filter(t => t.id !== id) }));
  }, [update]);

  const toggleTask = useCallback((id: string) => {
    update(d => ({
      ...d,
      tasks: d.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t),
    }));
  }, [update]);

  const addTimeBlock = useCallback((block: TimeBlock) => {
    update(d => ({ ...d, currentSchedule: [...d.currentSchedule, block] }));
  }, [update]);

  const deleteTimeBlock = useCallback((id: string) => {
    update(d => ({ ...d, currentSchedule: d.currentSchedule.filter(b => b.id !== id) }));
  }, [update]);

  const setSchedule = useCallback((blocks: TimeBlock[]) => {
    update(d => ({ ...d, currentSchedule: blocks }));
  }, [update]);

  const saveScore = useCallback((score: DailyScore) => {
    update(d => ({
      ...d,
      dailyScores: [
        ...d.dailyScores.filter(s => s.date !== score.date),
        score,
      ],
    }));
  }, [update]);

  return {
    data,
    updateGoal,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    addTimeBlock,
    deleteTimeBlock,
    setSchedule,
    saveScore,
  };
}
