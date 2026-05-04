'use client';

import { useState } from 'react';
import { useAppData } from '@/hooks/useAppData';
import { GOAL_CONFIG } from '@/lib/constants';
import type { Goal, SubGoal, MetricType, GoalCategory } from '@/lib/types';
import { uid } from '@/lib/utils';

export default function GoalsPage() {
  const { data, updateGoal } = useAppData();
  const [editing, setEditing] = useState<GoalCategory | null>(null);
  const [addingSubGoal, setAddingSubGoal] = useState<GoalCategory | null>(null);
  const [subForm, setSubForm] = useState({ title: '', metricType: 'checkbox' as MetricType, targetValue: '', unit: '' });

  function handleHoursChange(cat: GoalCategory, hours: number) {
    const goal = data.goals.find(g => g.category === cat);
    if (!goal) return;
    updateGoal({ ...goal, weeklyHoursTarget: hours });
  }

  function handleFieldChange(cat: GoalCategory, field: 'title' | 'description', value: string) {
    const goal = data.goals.find(g => g.category === cat);
    if (!goal) return;
    updateGoal({ ...goal, [field]: value });
  }

  function handleAddSubGoal(cat: GoalCategory) {
    if (!subForm.title) return;
    const goal = data.goals.find(g => g.category === cat);
    if (!goal) return;
    const sg: SubGoal = {
      id: uid(),
      pillar: cat,
      title: subForm.title,
      metricType: subForm.metricType,
      targetValue: subForm.targetValue ? Number(subForm.targetValue) : undefined,
      unit: subForm.unit || undefined,
    };
    updateGoal({ ...goal, subGoals: [...goal.subGoals, sg] });
    setSubForm({ title: '', metricType: 'checkbox', targetValue: '', unit: '' });
    setAddingSubGoal(null);
  }

  function handleDeleteSubGoal(cat: GoalCategory, sgId: string) {
    const goal = data.goals.find(g => g.category === cat);
    if (!goal) return;
    updateGoal({ ...goal, subGoals: goal.subGoals.filter(s => s.id !== sgId) });
  }

  const totalHours = data.goals.reduce((a, g) => a + g.weeklyHoursTarget, 0);

  return (
    <div style={{ padding: '32px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>Goals Setup</div>
        <div style={{ fontSize: 13, color: '#8E8E93', marginTop: 2 }}>
          Define your 3 pillars, set weekly hour targets, and add daily sub-goal metrics.
        </div>
      </div>

      <div className="card-sm" style={{ padding: '14px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Total Weekly Hours</div>
          <div style={{ fontSize: 11, color: '#8E8E93' }}>Across all three pillars</div>
        </div>
        <div style={{ fontSize: 28, fontWeight: 800 }}>{totalHours}h</div>
        <div style={{ fontSize: 11, color: '#8E8E93' }}>/ 168h week</div>
        <div style={{ height: 6, width: 120, background: '#2A2A2F', borderRadius: 3 }}>
          <div style={{ height: '100%', width: `${(totalHours / 168) * 100}%`, background: '#2980B9', borderRadius: 3 }} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {data.goals.map(goal => {
          const cfg = GOAL_CONFIG[goal.category];
          const isEditing = editing === goal.category;

          return (
            <div key={goal.id} className="card" style={{ border: `1px solid ${cfg.darkBorder}`, background: cfg.darkBg }}>
              <div style={{ padding: '20px 24px', borderBottom: `1px solid ${cfg.darkBorder}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: cfg.color + '22', border: `1px solid ${cfg.color}44`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, color: cfg.color,
                    }}>
                      {goal.category === 'spiritual' ? '✦' : goal.category === 'business' ? '◈' : '◉'}
                    </div>
                    <div>
                      {isEditing ? (
                        <input
                          value={goal.title}
                          onChange={e => handleFieldChange(goal.category, 'title', e.target.value)}
                          style={{ fontSize: 16, fontWeight: 700, padding: '4px 8px', width: 260 }}
                        />
                      ) : (
                        <div style={{ fontSize: 16, fontWeight: 700 }}>{goal.title}</div>
                      )}
                      <div style={{ fontSize: 12, color: '#8E8E93', marginTop: 2 }}>{cfg.label} Pillar</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 11, color: '#8E8E93', marginBottom: 4 }}>WEEKLY TARGET</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button className="btn-ghost" style={{ padding: '2px 10px', fontSize: 16 }} onClick={() => handleHoursChange(goal.category, Math.max(0, goal.weeklyHoursTarget - 1))}>−</button>
                        <span style={{ fontSize: 20, fontWeight: 700, color: cfg.color, minWidth: 40, textAlign: 'center' }}>{goal.weeklyHoursTarget}h</span>
                        <button className="btn-ghost" style={{ padding: '2px 10px', fontSize: 16 }} onClick={() => handleHoursChange(goal.category, goal.weeklyHoursTarget + 1)}>+</button>
                      </div>
                    </div>
                    <button
                      className="btn-ghost"
                      onClick={() => setEditing(isEditing ? null : goal.category)}
                    >
                      {isEditing ? 'Done' : 'Edit'}
                    </button>
                  </div>
                </div>
                {isEditing && (
                  <input
                    value={goal.description}
                    onChange={e => handleFieldChange(goal.category, 'description', e.target.value)}
                    placeholder="Describe this goal..."
                    style={{ marginTop: 12 }}
                  />
                )}
              </div>

              <div style={{ padding: '16px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Daily Sub-Goal Metrics</div>
                  <button
                    className="btn-ghost"
                    style={{ fontSize: 12, padding: '4px 10px' }}
                    onClick={() => setAddingSubGoal(addingSubGoal === goal.category ? null : goal.category)}
                  >
                    + Add metric
                  </button>
                </div>

                {addingSubGoal === goal.category && (
                  <div style={{ marginBottom: 12, padding: 14, background: '#1C1C1F', borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <input placeholder="e.g. Morning prayer, Cold calls made, Miles run" value={subForm.title} onChange={e => setSubForm(f => ({ ...f, title: e.target.value }))} autoFocus />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <select value={subForm.metricType} onChange={e => setSubForm(f => ({ ...f, metricType: e.target.value as MetricType }))} style={{ flex: 1 }}>
                        <option value="checkbox">Checkbox (done/not done)</option>
                        <option value="number">Number (e.g. 5 calls)</option>
                        <option value="duration">Duration (e.g. 30 mins)</option>
                      </select>
                      {subForm.metricType !== 'checkbox' && (
                        <>
                          <input placeholder="Target (e.g. 5)" value={subForm.targetValue} onChange={e => setSubForm(f => ({ ...f, targetValue: e.target.value }))} style={{ width: 100 }} type="number" />
                          <input placeholder="Unit (e.g. calls)" value={subForm.unit} onChange={e => setSubForm(f => ({ ...f, unit: e.target.value }))} style={{ width: 100 }} />
                        </>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button className="btn-ghost" onClick={() => setAddingSubGoal(null)}>Cancel</button>
                      <button className="btn-primary" onClick={() => handleAddSubGoal(goal.category)}>Add</button>
                    </div>
                  </div>
                )}

                {goal.subGoals.length === 0 ? (
                  <div style={{ fontSize: 13, color: '#8E8E93', fontStyle: 'italic' }}>
                    No metrics yet. Add daily habits or targets to track.
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {goal.subGoals.map(sg => (
                      <div key={sg.id} style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '6px 12px',
                        borderRadius: 8,
                        background: cfg.color + '15',
                        border: `1px solid ${cfg.color}25`,
                      }}>
                        <span style={{ fontSize: 12, color: cfg.lightColor }}>
                          {sg.title}
                          {sg.targetValue && <span style={{ color: '#8E8E93' }}> · {sg.targetValue} {sg.unit}</span>}
                        </span>
                        <button
                          onClick={() => handleDeleteSubGoal(goal.category, sg.id)}
                          style={{ background: 'none', color: '#8E8E93', fontSize: 12, padding: 0, lineHeight: 1 }}
                        >×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
