import type { VitalStatusLabel } from '../types/wellness';

interface StatusTextProps {
  status: VitalStatusLabel;
}

export function StatusText({ status }: StatusTextProps) {
  const colorClass =
    status === 'Optimal'
      ? 'text-[#4edea3]'
      : status === 'Balanced'
        ? 'text-[#4fdbc8]'
        : status === 'Elevated'
          ? 'text-[#ffb59e]'
          : 'text-[#ffb4ab]';

  return <span className={`text-xs font-semibold ${colorClass}`}>{status}</span>;
}
