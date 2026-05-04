export type ProductStatus = 'watching' | 'testing' | 'winner' | 'dead';
export type HookCategory = 'pov' | 'transformation' | 'shock' | 'identity' | 'comparison' | 'curiosity' | 'social-proof' | 'doubt-crusher' | 'result-first' | 'other';
export type HookResult = 'winner' | 'testing' | 'dead';

export const HOOK_CATEGORY_LABELS: Record<HookCategory, string> = {
  'pov': 'POV',
  'transformation': 'Transformation',
  'shock': 'Shock/Callout',
  'identity': 'Identity',
  'comparison': 'Comparison',
  'curiosity': 'Curiosity Gap',
  'social-proof': 'Social Proof',
  'doubt-crusher': 'Doubt Crusher',
  'result-first': 'Result First',
  'other': 'Other',
};

export const HOOK_CATEGORY_COLORS: Record<HookCategory, string> = {
  'pov': '#9B59B6',
  'transformation': '#2980B9',
  'shock': '#E74C3C',
  'identity': '#1ABC9C',
  'comparison': '#E67E22',
  'curiosity': '#F1C40F',
  'social-proof': '#27AE60',
  'doubt-crusher': '#8E44AD',
  'result-first': '#2ECC71',
  'other': '#8E8E93',
};

export const STATUS_CONFIG: Record<ProductStatus, { label: string; color: string; bg: string }> = {
  watching: { label: 'Watching', color: '#F1C40F', bg: 'rgba(241,196,15,0.15)' },
  testing: { label: 'Testing', color: '#2980B9', bg: 'rgba(41,128,185,0.15)' },
  winner: { label: 'Winner ✦', color: '#27AE60', bg: 'rgba(39,174,96,0.15)' },
  dead: { label: 'Dead', color: '#8E8E93', bg: 'rgba(142,142,147,0.1)' },
};

export const RESULT_CONFIG: Record<HookResult, { label: string; color: string }> = {
  winner: { label: 'Winner', color: '#27AE60' },
  testing: { label: 'Testing', color: '#2980B9' },
  dead: { label: 'Dead', color: '#8E8E93' },
};

export interface Product {
  id: string;
  name: string;
  image?: string;
  status: ProductStatus;
  viralScore: number;
  price?: number;
  margin?: number;
  angle?: string;
  notes: string;
  links: string[];
  dateAdded: string;
  tags: string[];
}

export interface Hook {
  id: string;
  text: string;
  category: HookCategory;
  productId?: string;
  productName?: string;
  result: HookResult;
  views1hr?: number;
  views24hr?: number;
  notes: string;
  videoLink?: string;
  dateAdded: string;
}

export interface TestLogEntry {
  id: string;
  date: string;
  productId?: string;
  productName: string;
  hookText: string;
  hookCategory?: HookCategory;
  views1hr?: number;
  views24hr?: number;
  profileVisits?: number;
  linkClicks?: number;
  sales?: number;
  notes: string;
}

export interface EcomData {
  products: Product[];
  hooks: Hook[];
  log: TestLogEntry[];
}
