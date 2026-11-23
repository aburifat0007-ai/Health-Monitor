import { useId } from 'react';

interface BiometricRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  label: string;
  sublabel?: string;
  accent?: 'teal' | 'emerald' | 'coral';
}

export function BiometricRing({
  value,
  max = 100,
  size = 176,
  strokeWidth = 12,
  label,
  sublabel,
  accent = 'teal',
}: BiometricRingProps) {
  const gradientId = useId();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = Math.min(1, Math.max(0, value / max));
  const strokeDashoffset = circumference * (1 - ratio);

  const stops =
    accent === 'emerald'
      ? ['#14b8a6', '#4edea3']
      : accent === 'coral'
        ? ['#f38764', '#ffb59e']
        : ['#4fdbc8', '#4edea3'];

  return (
    <div
      className="relative inline-flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${label}: ${value}${max === 100 ? ' out of 100' : ''}`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={stops[0]} />
            <stop offset="100%" stopColor={stops[1]} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#252b2a"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-3">
        <span className="text-4xl font-bold tracking-tight text-[#dde4e1] tabular-nums leading-none">
          {value}
        </span>
        <span className="text-xs font-medium text-[#bbcac6] mt-1.5">{label}</span>
        {sublabel ? (
          <span className="text-[11px] font-medium text-[#4fdbc8] mt-0.5">{sublabel}</span>
        ) : null}
      </div>
    </div>
  );
}
