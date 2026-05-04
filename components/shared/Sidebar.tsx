'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GOAL_CONFIG } from '@/lib/constants';

const LIFE_NAV = [
  { href: '/', label: 'Dashboard', icon: '◈' },
  { href: '/weekly', label: 'Weekly', icon: '▦' },
  { href: '/daily', label: 'Daily Focus', icon: '◎' },
  { href: '/goals', label: 'Goals', icon: '◉' },
  { href: '/scores', label: 'Scores', icon: '◆' },
];

const ECOM_NAV = [
  { href: '/products', label: 'Products', icon: '📦' },
  { href: '/hook-library', label: 'Hook Library', icon: '🪝' },
  { href: '/test-log', label: 'Test Log', icon: '📊' },
];

function NavItem({ href, label, icon, active }: { href: string; label: string; icon: string; active: boolean }) {
  return (
    <Link href={href} style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '8px 12px', borderRadius: 10, textDecoration: 'none',
      fontSize: 13, fontWeight: active ? 600 : 400,
      color: active ? '#F5F5F7' : '#8E8E93',
      background: active ? '#1C1C1F' : 'transparent',
      transition: 'all 0.15s',
    }}>
      <span style={{ fontSize: 14, opacity: active ? 1 : 0.6 }}>{icon}</span>
      {label}
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside style={{
      width: 220, minHeight: '100vh',
      background: '#0D0D0F',
      borderRight: '1px solid #2A2A2F',
      display: 'flex', flexDirection: 'column',
      padding: '28px 0',
      position: 'sticky', top: 0, flexShrink: 0,
    }}>
      <div style={{ padding: '0 20px 24px' }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: '#F5F5F7', letterSpacing: '-0.02em' }}>Goal Tracker</div>
        <div style={{ fontSize: 10, color: '#8E8E93', marginTop: 2, letterSpacing: '0.06em' }}>YOUR LIFE, OPTIMIZED</div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 1, padding: '0 10px' }}>
        <div className="label" style={{ padding: '0 12px 8px', fontSize: 10 }}>LIFE PILLARS</div>
        {LIFE_NAV.map(({ href, label, icon }) => (
          <NavItem key={href} href={href} label={label} icon={icon} active={pathname === href} />
        ))}
      </nav>

      <div style={{ height: 1, background: '#2A2A2F', margin: '16px 20px' }} />

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 1, padding: '0 10px' }}>
        <div className="label" style={{ padding: '0 12px 8px', fontSize: 10 }}>ECOM RESEARCH</div>
        {ECOM_NAV.map(({ href, label, icon }) => (
          <NavItem key={href} href={href} label={label} icon={icon} active={pathname === href} />
        ))}
      </nav>

      <div style={{ padding: '20px', borderTop: '1px solid #2A2A2F', marginTop: 'auto' }}>
        <div className="label" style={{ marginBottom: 10 }}>Pillars</div>
        {(['spiritual', 'business', 'body'] as const).map(cat => (
          <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: GOAL_CONFIG[cat].color, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: '#8E8E93' }}>{GOAL_CONFIG[cat].label}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}
