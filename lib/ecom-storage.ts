'use client';

import type { EcomData, HookCategory } from './ecom-types';

const ECOM_KEY = 'ecom-research-data';

const DEFAULT: EcomData = { products: [], hooks: [], log: [] };

export function loadEcomData(): EcomData {
  if (typeof window === 'undefined') return DEFAULT;
  try {
    const raw = localStorage.getItem(ECOM_KEY);
    if (!raw) return DEFAULT;
    return { ...DEFAULT, ...JSON.parse(raw) };
  } catch { return DEFAULT; }
}

export function saveEcomData(data: EcomData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ECOM_KEY, JSON.stringify(data));
}

export function exportEcomData(): void {
  const data = loadEcomData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ecom-research-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importEcomData(jsonText: string): boolean {
  try {
    const parsed = JSON.parse(jsonText) as Partial<EcomData>;
    if (!parsed.products && !parsed.hooks && !parsed.log) return false;
    saveEcomData({ products: [], hooks: [], log: [], ...parsed });
    return true;
  } catch { return false; }
}

export async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 640;
        const ratio = Math.min(MAX / img.width, MAX / img.height, 1);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * ratio);
        canvas.height = Math.round(img.height * ratio);
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.65));
      };
      img.onerror = reject;
      img.src = e.target!.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function detectHookCategory(text: string): HookCategory {
  const t = text.toLowerCase();
  if (/\bpov\b/.test(t)) return 'pov';
  if (/\bvs\.?\b|compared to|this vs/.test(t)) return 'comparison';
  if (/before|after|transform|glow.?up|changed/.test(t)) return 'transformation';
  if (/i thought|scam|can.?t believe|didn.?t know|actually works/.test(t)) return 'doubt-crusher';
  if (/you.?ve been|wrong|stop doing|mistake|nobody tells/.test(t)) return 'shock';
  if (/if you|for people|for anyone|for those who|for \w+ who/.test(t)) return 'identity';
  if (/million|everyone|viral|blew up|people are/.test(t)) return 'social-proof';
  if (/\.\.\.|wait|until|the reason|why|secret|what happens/.test(t)) return 'curiosity';
  if (/result|outcome|ended up|got me|got \d/.test(t)) return 'result-first';
  return 'other';
}

export function getHookPatternStats(hooks: import('./ecom-types').Hook[]): Record<string, { total: number; winners: number }> {
  const stats: Record<string, { total: number; winners: number }> = {};
  for (const h of hooks) {
    if (!stats[h.category]) stats[h.category] = { total: 0, winners: 0 };
    stats[h.category].total++;
    if (h.result === 'winner') stats[h.category].winners++;
  }
  return stats;
}
