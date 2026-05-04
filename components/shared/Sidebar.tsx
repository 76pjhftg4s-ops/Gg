'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GOAL_CONFIG } from '@/lib/constants';

const NAV = [
  { href: '/', label: 'Dashboard', icon: '◈' },
  { href: '/weekly', label: 'Weekly', icon: '▦' },
  { href: '/daily', label: 'Daily Focus', icon: '◎' },
  { href: '/goals', label: 'Goals', icon: '◉' },
  { href: '/scores', label: 'Scores', icon: '◆' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside style={{
      width: 220,
      minHeight: '100vh',
      background: '#0D0D0F',
      borderRight: '1px solid #2A2A2F',
      display: 'flex',
      flexDirection: 'column',
      padding: '28px 0',
      position: 'sticky',
      top: 0,
      flexShrink: 0,
    }}>
      <div style={{ padding: '0 20px 28px' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#F5F5F7', letterSpacing: '-0.02em' }}>
          Goal Tracker
        </div>
        <div style={{ fontSize: 11, color: '#8E8E93', marginTop: 2, letterSpacing: '0.05em' }}>
          YOUR LIFE, OPTIMIZED
        </div>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, padding: '0 10px' }}>
        {NAV.map(({ href, label, icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 12px',
                borderRadius: 10,
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: active ? 600 : 400,
                color: active ? '#F5F5F7' : '#8E8E93',
                background: active ? '#1C1C1F' : 'transparent',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: 16, opacity: active ? 1 : 0.6 }}>{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: '20px', borderTop: '1px solid #2A2A2F', marginTop: 'auto' }}>
        <div className="label" style={{ marginBottom: 12 }}>Pillars</div>
        {(['spiritual', 'business', 'body'] as const).map(cat => (
          <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: GOAL_CONFIG[cat].color,
              flexShrink: 0,
            }} />
            <span style={{ fontSize: 12, color: '#8E8E93' }}>{GOAL_CONFIG[cat].label}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}
