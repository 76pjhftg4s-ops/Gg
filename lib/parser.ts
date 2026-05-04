import type { TimeBlock, GoalCategory, DayOfWeek } from './types';

const DAY_MAP: Record<string, DayOfWeek> = {
  monday: 'mon', tuesday: 'tue', wednesday: 'wed', thursday: 'thu',
  friday: 'fri', saturday: 'sat', sunday: 'sun',
  mon: 'mon', tue: 'tue', wed: 'wed', thu: 'thu',
  fri: 'fri', sat: 'sat', sun: 'sun',
};

const SPIRITUAL_KEYWORDS = /pray|prayer|meditat|church|worship|journal|bible|gratitude|devotion|spiritual|quiet.?time|fast|scripture/i;
const BUSINESS_KEYWORDS = /email|call|meeting|client|work|build|sales|review|strategy|prospect|follow.?up|crm|invoice|pitch|content|post|record|edit|film|brand|launch|market|research|product|hook|video|tiktok|shopify|ecomm/i;
const BODY_KEYWORDS = /gym|workout|run|walk|jog|eat|meal|prep|sleep|recovery|stretch|lift|train|cardio|protein|water|rest|nap|cook|nutrition|macro|shower|coffee/i;

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

function cleanTitle(raw: string): string {
  return raw
    // Remove full day names first (order matters — longest first)
    .replace(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi, '')
    // Remove time patterns like 8am, 8:30am, 10PM
    .replace(/\b\d{1,2}(?::\d{2})?\s*(?:am|pm)\b/gi, '')
    // Remove duration phrases like "3 hours", "45 mins", "an hour", "half hour"
    .replace(/\b\d+(?:\.\d+)?\s*(?:hours?|hrs?|minutes?|mins?)\b/gi, '')
    .replace(/\ban\s+hour\b/gi, '')
    .replace(/\bhalf\s+(?:an\s+)?hour\b/gi, '')
    // Remove orphaned connector words left after stripping
    .replace(/\bat\s+for\b/gi, '')
    .replace(/\bfor\s+(?:hours?|mins?|minutes?)?\s*$/gi, '')
    .replace(/\bat\s*$/gi, '')
    .replace(/\bfor\s*$/gi, '')
    .replace(/\bfor\b(?=\s|$)/gi, '')
    // Clean up leading noise words
    .replace(/^\s*(i |then |and |also |at |for |to |a )/i, '')
    // Collapse multiple spaces
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function parseBrainDump(text: string): TimeBlock[] {
  const blocks: TimeBlock[] = [];
  // Split on newlines or sentence-ending punctuation
  const lines = text.split(/[\n]+/).filter(s => s.trim().length > 4);

  let currentDay: DayOfWeek = 'mon';

  for (const line of lines) {
    const s = line.trim();

    // Detect day — check full word match at start or anywhere
    const dayMatch = s.match(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)\b/i);
    if (dayMatch) {
      currentDay = DAY_MAP[dayMatch[1].toLowerCase()];
    }

    // Must have a time to create a block
    const timeMatch = s.match(/\b(\d{1,2}(?::\d{2})?\s*(?:am|pm))\b/i);
    if (!timeMatch) continue;

    const startTime = parseTime(timeMatch[1]);
    if (!startTime) continue;

    const duration = parseDuration(s);
    const endTime = addMinutes(startTime, duration);
    const category = detectCategory(s);

    // Build title — if line has a colon separator like "Monday: Deep Work at 8:30am"
    // use the part after the colon; otherwise clean the whole line
    let titleSource = s;
    const colonIdx = s.indexOf(':');
    if (colonIdx > -1 && colonIdx < 20) {
      titleSource = s.slice(colonIdx + 1).trim();
    }

    const title = cleanTitle(titleSource);
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
