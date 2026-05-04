'use client';

interface Props {
  percent: number;
  color: string;
  size?: number;
  stroke?: number;
  label?: string;
}

export default function ProgressRing({ percent, color, size = 80, stroke = 7, label }: Props) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (Math.min(percent, 100) / 100) * circ;

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#2A2A2F" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: size < 70 ? 12 : 15, fontWeight: 700, color: '#F5F5F7' }}>
          {Math.round(percent)}%
        </span>
        {label && <span style={{ fontSize: 9, color: '#8E8E93', marginTop: 1 }}>{label}</span>}
      </div>
    </div>
  );
}
