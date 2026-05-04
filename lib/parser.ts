import type { TimeBlock, GoalCategory, DayOfWeek } from './types';

const DAY_PATTERNS: Record<DayOfWeek, RegExp> = {
  mon: /\bmon(day)?\b/i,
  tue: /\btu(e|es|esday)?\b/i,
  wed: /\bwed(nesday)?\b/i,
  thu: /\bthu(r|rs|rsday)?\b/i,
  fri: /\bfri(day)?\b/i,
  sat: /\bsat(urday)?\b/i,
  sun: /\bsun(day)?\b/i,
};

const SPIRITUAL_KEYWORDS = /pray|prayer|meditat|church|worship|journal|bible|gratitude|devotion|spiritual|read.*word|quiet.*time|fast/i;
const BUSINESS_KEYWORDS = /email|call|meeting|client|work|build|sales|review|strategy|prospect|follow.*up|crm|invoice|pitch|content|post|record|edit|film|brand|launch|market/i;
const BODY_KEYWORDS = /gym|workout|run|walk|jog|eat|meal|prep|sleep|recovery|stretch|lift|train|cardio|protein|water|rest|nap|cook|nutrition|macro/i;

function parseTime(raw: string): string | null {
  const match = raw.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (!match) return null;
  let hours = parseInt(match[1]);
  const mins = match[2] ? parseInt(match[2]) : 0;
  const period = match[3]?.toLowerCase();
  if (period === 'pm' && hours !== 12) hours += 12;
  if (period === 'am' && hours === 12) hours = 0;
  if (!period && hours < 5) hours += 12;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

function parseDuration(text: string): number {
  const hourMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:hr|hour)/i);
  const minMatch = text.match(/(\d+)\s*(?:min|minute)/i);
  let total = 0;
  if (hourMatch) total += parseFloat(hourMatch[1]) * 60;
  if (minMatch) total += parseInt(minMatch[1]);
  if (!total) {
    if (/\ban\s+hour\b/i.test(text)) total = 60;
    if (/\bhalf\s+(?:an\s+)?hour\b/i.test(text)) total = 30;
  }
  return total || 60;
}

function addMinutes(time: string, mins: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + mins;
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function detectCategory(text: string): GoalCategory | 'personal' {
  if (SPIRITUAL_KEYWORDS.test(text)) return 'spiritual';
  if (BUSINESS_KEYWORDS.test(text)) return 'business';
  if (BODY_KEYWORDS.test(text)) return 'body';
  return 'personal';
}

export function parseBrainDump(text: string): TimeBlock[] {
  const blocks: TimeBlock[] = [];
  const sentences = text.split(/[.,;!\n]+/).filter(s => s.trim().length > 5);

  let currentDay: DayOfWeek = 'mon';

  for (const sentence of sentences) {
    const s = sentence.trim();

    for (const [day, pattern] of Object.entries(DAY_PATTERNS) as [DayOfWeek, RegExp][]) {
      if (pattern.test(s)) { currentDay = day; break; }
    }

    const timeMatch = s.match(/\b(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\b/i);
    if (!timeMatch) continue;

    const startTime = parseTime(timeMatch[1]);
    if (!startTime) continue;

    const duration = parseDuration(s);
    const endTime = addMinutes(startTime, duration);
    const category = detectCategory(s);

    const title = s
      .replace(/\b(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\b/gi, '')
      .replace(/(mon|tue|wed|thu|fri|sat|sun)(day)?/gi, '')
      .replace(/\b(\d+)\s*(min|minute|hr|hour)s?\b/gi, '')
      .replace(/\b(an|a|the)\s+(hour|minute)\b/gi, '')
      .replace(/\s{2,}/g, ' ')
      .trim()
      .replace(/^(i |then |and |also |at |for )/i, '')
      .trim();

    if (!title || title.length < 3) continue;

    blocks.push({
      id: `parsed-${Date.now()}-${blocks.length}`,
      day: currentDay,
      startTime,
      endTime,
      goalCategory: category,
      title: title.charAt(0).toUpperCase() + title.slice(1),
      taskIds: [],
    });
  }

  return blocks;
}
