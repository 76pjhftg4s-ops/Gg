'use client';

import { useState } from 'react';
import { useAppData } from '@/hooks/useAppData';
import { GOAL_CONFIG } from '@/lib/constants';
import type { GoalCategory, DailyScore } from '@/lib/types';
import { getTodayKey } from '@/lib/utils';

const SCORE_LABELS = ['', 'Poor', 'Below avg', 'Average', 'Good', 'Excellent'];
const SCORE_COLORS = ['', '#FF453A', '#FF9F0A', '#FFD60A', '#30D158', '#0A84FF'];

function ScoreDot({ score }: { score: number | undefined }) {
  if (!score) return <div style={{ width: 10, height: 10, borderRadius: 2, background: '#2A2A2F' }} />;
  return (
    <div
      title={SCORE_LABELS[score]}
      style={{ width: 10, height: 10, borderRadius: 2, background: SCORE_COLORS[score] }}
    />
  );
}

export default function ScoresPage() {
  const { data, saveScore } = useAppData();
  const today = getTodayKey();

  const todayScore = data.dailyScores.find(s => s.date === today);
  const [scores, setScores] = useState<Record<GoalCategory, number>>(
    todayScore?.scores ?? { spiritual: 0, business: 0, body: 0 }
  );
  const [notes, setNotes] = useState(todayScore?.notes ?? '');
  const [saved, setSaved] = useState(false);

  function handleSave() {
    const ds: DailyScore = { date: today, scores, notes };
    saveScore(ds);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const last30 = (() => {
    const days: { date: string; label: string }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      days.push({ date: key, label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) });
    }
    return days;
  })();

  const scoreMap = new Map(data.dailyScores.map(s => [s.date, s]));

  const avgScore = (cat: GoalCategory) => {
    const entries = data.dailyScores.filter(s => s.scores[cat] > 0);
    if (!entries.length) return 0;
    return entries.reduce((a, s) => a + s.scores[cat], 0) / entries.length;
  };

  return (
    <div style={{ padding: '32px', maxWidth: 860, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>Daily Scores</div>
        <div style={{ fontSize: 13, color: '#8E8E93', marginTop: 2 }}>
          Rate each pillar nightly to track your consistency.
        </div>
      </div>

      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
        <div style={{ fontSize: 12, color: '#8E8E93', marginBottom: 20 }}>How did each pillar go today? (1 = poor, 5 = excellent)</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 20 }}>
          {(['spiritual', 'business', 'body'] as const).map(cat => {
            const cfg = GOAL_CONFIG[cat];
            const score = scores[cat];
            return (
              <div key={cat}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color }} />
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{cfg.label}</span>
                  </div>
                  {score > 0 && (
                    <span style={{ fontSize: 12, color: SCORE_COLORS[score] }}>
                      {SCORE_LABELS[score]}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      onClick={() => setScores(s => ({ ...s, [cat]: n }))}
                      style={{
                        flex: 1, height: 40, borderRadius: 8, border: 'none',
                        background: score === n ? SCORE_COLORS[n] : '#1C1C1F',
                        color: score === n ? 'white' : '#8E8E93',
                        fontSize: 16, fontWeight: 700,
                        transition: 'all 0.15s',
                        outline: score === n ? `2px solid ${SCORE_COLORS[n]}` : 'none',
                        outlineOffset: 2,
                      }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <textarea
          placeholder="Optional notes for today..."
          value={notes}
          onChange={e => setNotes(e.target.value)}
          style={{ minHeight: 72, resize: 'vertical', marginBottom: 16 }}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            className="btn-primary"
            onClick={handleSave}
            style={{ background: saved ? '#30D158' : undefined }}
          >
            {saved ? '✓ Saved!' : 'Save Score'}
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>30-Day Heatmap</div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
          {(['spiritual', 'business', 'body'] as const).map(cat => (
            <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: GOAL_CONFIG[cat].color }} />
              <span style={{ fontSize: 11, color: '#8E8E93' }}>{GOAL_CONFIG[cat].label}</span>
            </div>
          ))}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${last30.length}, 1fr)`, gap: 3, minWidth: 600 }}>
            {last30.map(({ date, label }) => {
              const s = scoreMap.get(date);
              return (
                <div key={date} style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
                  {(['spiritual', 'business', 'body'] as const).map(cat => (
                    <ScoreDot key={cat} score={s?.scores[cat]} />
                  ))}
                </div>
              );
            })}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${last30.length}, 1fr)`, gap: 3, marginTop: 6, minWidth: 600 }}>
            {last30.map(({ date, label }, i) => (
              <div key={date} style={{ fontSize: 9, color: '#8E8E93', textAlign: 'center', overflow: 'hidden' }}>
                {i % 5 === 0 ? label : ''}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        {(['spiritual', 'business', 'body'] as const).map(cat => {
          const cfg = GOAL_CONFIG[cat];
          const avg = avgScore(cat);
          const scored = data.dailyScores.filter(s => s.scores[cat] > 0).length;
          return (
            <div key={cat} className="card-sm" style={{ flex: 1, padding: '16px 18px', background: cfg.darkBg, borderColor: cfg.darkBorder }}>
              <div style={{ fontSize: 11, color: cfg.lightColor, fontWeight: 600, marginBottom: 6 }}>{cfg.label.toUpperCase()}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: avg > 0 ? SCORE_COLORS[Math.round(avg)] : '#8E8E93' }}>
                {avg > 0 ? avg.toFixed(1) : '—'}
              </div>
              <div style={{ fontSize: 11, color: '#8E8E93', marginTop: 4 }}>avg over {scored} days</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
