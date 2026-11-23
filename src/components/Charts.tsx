import { useId, useState } from 'react';
import type { DailyWellnessEntry, SleepSegment } from '../types/wellness';
import { formatDurationMinutes } from '../utils/biometrics';

interface VitalsTrendChartProps {
  mode: '24h' | '7d';
  metric: 'hrv' | 'rhr';
  selectedDay: DailyWellnessEntry;
  allDays: DailyWellnessEntry[];
  baselineValue: number;
}

export function VitalsTrendChart({
  mode,
  metric,
  selectedDay,
  allDays,
  baselineValue,
}: VitalsTrendChartProps) {
  const gradId = useId();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const points =
    mode === '24h'
      ? (metric === 'hrv' ? selectedDay.vitals.hourlyHrv : selectedDay.vitals.hourlyHr).map(
          (val, idx) => ({
            label: `${(idx * 2).toString().padStart(2, '0')}:00`,
            value: val,
          }),
        )
      : allDays.map((d) => ({
          label: d.shortDay,
          value: metric === 'hrv' ? d.vitals.hrvMs : d.vitals.restingHrBpm,
        }));

  const width = 640;
  const height = 210;
  const padX = 36;
  const padTop = 20;
  const padBottom = 32;
  const plotW = width - padX * 2;
  const plotH = height - padTop - padBottom;

  const rawValues = points.map((p) => p.value).concat(baselineValue);
  const minVal = Math.floor(Math.min(...rawValues) - 6);
  const maxVal = Math.ceil(Math.max(...rawValues) + 6);
  const range = Math.max(10, maxVal - minVal);

  const coords = points.map((p, i) => {
    const x = padX + (points.length === 1 ? plotW / 2 : (i / (points.length - 1)) * plotW);
    const y = padTop + plotH - ((p.value - minVal) / range) * plotH;
    return { ...p, x, y };
  });

  const linePath = coords
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`)
    .join(' ');

  const areaPath = `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${(padTop + plotH).toFixed(1)} L ${coords[0].x.toFixed(1)} ${(padTop + plotH).toFixed(1)} Z`;

  const baselineY = padTop + plotH - ((baselineValue - minVal) / range) * plotH;
  const strokeColor = metric === 'hrv' ? '#4fdbc8' : '#4edea3';
  const unit = metric === 'hrv' ? 'ms' : 'bpm';
  const activePoint = hoveredIdx !== null ? coords[hoveredIdx] : coords[coords.length - 1];

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
        <div className="text-xs text-[#bbcac6]">
          <span>{activePoint.label}</span>
          <span className="mx-1.5 text-[#859490]" aria-hidden="true">
            ·
          </span>
          <span className="font-mono font-semibold text-[#dde4e1] tabular-nums">
            {activePoint.value} {unit}
          </span>
        </div>
        <div className="text-xs text-[#859490] tabular-nums">
          Baseline {baselineValue} {unit}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible select-none"
        role="img"
        aria-label={`${metric === 'hrv' ? 'Heart rate variability' : 'Resting heart rate'} ${mode} trend chart`}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.28" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal subtle gridlines */}
        {[0, 0.5, 1].map((frac) => {
          const y = padTop + plotH * frac;
          const labelVal = Math.round(maxVal - range * frac);
          return (
            <g key={frac}>
              <line
                x1={padX}
                y1={y}
                x2={width - padX}
                y2={y}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="1"
              />
              <text
                x={padX - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-[#859490] text-[10px] font-mono tabular-nums"
              >
                {labelVal}
              </text>
            </g>
          );
        })}

        {/* Baseline reference dashed line */}
        <line
          x1={padX}
          y1={baselineY}
          x2={width - padX}
          y2={baselineY}
          stroke="rgba(187, 202, 198, 0.28)"
          strokeDasharray="4 4"
          strokeWidth="1"
        />

        <path d={areaPath} fill={`url(#${gradId})`} />
        <path
          d={linePath}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {coords.map((pt, idx) => {
          const isActive =
            hoveredIdx === idx || (hoveredIdx === null && idx === coords.length - 1);
          const showXLabel = mode === '7d' || idx % 2 === 0 || idx === coords.length - 1;
          return (
            <g key={`${pt.label}-${idx}`}>
              {showXLabel ? (
                <text
                  x={pt.x}
                  y={height - 6}
                  textAnchor="middle"
                  className="fill-[#859490] text-[10px] tabular-nums"
                >
                  {pt.label}
                </text>
              ) : null}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isActive ? 5 : 3}
                fill={isActive ? strokeColor : '#1a211f'}
                stroke={strokeColor}
                strokeWidth={isActive ? 2 : 1.75}
              />
              <circle
                cx={pt.x}
                cy={pt.y}
                r={16}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => setHoveredIdx(idx)}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

interface SleepHypnogramProps {
  segments: SleepSegment[];
  bedtime: string;
  wakeTime: string;
}

const STAGE_ROW: Record<SleepSegment['stage'], number> = {
  awake: 0,
  rem: 1,
  light: 2,
  deep: 3,
};

const STAGE_COLOR: Record<SleepSegment['stage'], string> = {
  awake: '#ffb59e',
  rem: '#4edea3',
  light: '#4fdbc8',
  deep: '#14b8a6',
};

const STAGE_LABEL: Record<SleepSegment['stage'], string> = {
  awake: 'Awake',
  rem: 'REM',
  light: 'Light',
  deep: 'Deep',
};

export function SleepHypnogram({ segments, bedtime, wakeTime }: SleepHypnogramProps) {
  const [activeSegIdx, setActiveSegIdx] = useState<number | null>(null);
  const totalSpan = Math.max(
    1,
    segments.reduce((acc, seg) => Math.max(acc, seg.startOffsetMin + seg.durationMin), 0),
  );

  const width = 640;
  const rowHeight = 32;
  const gap = 8;
  const padLeft = 52;
  const padRight = 12;
  const plotW = width - padLeft - padRight;
  const height = 4 * rowHeight + 3 * gap + 28;

  const activeSeg = activeSegIdx !== null ? segments[activeSegIdx] : null;

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs text-[#bbcac6]">
        <span>
          {activeSeg
            ? `${STAGE_LABEL[activeSeg.stage]} stage · ${formatDurationMinutes(activeSeg.durationMin)}`
            : 'Tap or hover any cycle block to inspect stage duration'}
        </span>
        <span className="font-mono text-[#859490] tabular-nums">
          {bedtime} — {wakeTime}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto select-none"
        role="img"
        aria-label="Sleep stages hypnogram timeline"
      >
        {(['awake', 'rem', 'light', 'deep'] as const).map((stageName, rowIdx) => {
          const y = rowIdx * (rowHeight + gap);
          return (
            <g key={stageName}>
              <rect
                x={padLeft}
                y={y}
                width={plotW}
                height={rowHeight}
                rx={8}
                fill="#161d1b"
              />
              <text
                x={0}
                y={y + rowHeight / 2 + 4}
                className="fill-[#859490] text-[11px] font-medium"
              >
                {STAGE_LABEL[stageName]}
              </text>
            </g>
          );
        })}

        {segments.map((seg, idx) => {
          const x = padLeft + (seg.startOffsetMin / totalSpan) * plotW;
          const w = Math.max(6, (seg.durationMin / totalSpan) * plotW);
          const y = STAGE_ROW[seg.stage] * (rowHeight + gap) + 3;
          const isSelected = activeSegIdx === idx;
          return (
            <rect
              key={`${seg.stage}-${seg.startOffsetMin}-${idx}`}
              x={x}
              y={y}
              width={w}
              height={rowHeight - 6}
              rx={6}
              fill={STAGE_COLOR[seg.stage]}
              fillOpacity={isSelected ? 1 : 0.85}
              stroke={isSelected ? '#dde4e1' : 'none'}
              strokeWidth={1.5}
              className="cursor-pointer transition-opacity duration-150"
              onMouseEnter={() => setActiveSegIdx(idx)}
              onMouseLeave={() => setActiveSegIdx(null)}
              onClick={() => setActiveSegIdx(idx)}
            />
          );
        })}

        <text x={padLeft} y={height - 4} className="fill-[#859490] text-[10px] font-mono tabular-nums">
          {bedtime}
        </text>
        <text
          x={width - padRight}
          y={height - 4}
          textAnchor="end"
          className="fill-[#859490] text-[10px] font-mono tabular-nums"
        >
          {wakeTime}
        </text>
      </svg>
    </div>
  );
}

interface WeeklyActivityChartProps {
  days: DailyWellnessEntry[];
  selectedDateIso: string;
  stepGoal: number;
  onSelectDate: (dateIso: string) => void;
}

export function WeeklyActivityChart({
  days,
  selectedDateIso,
  stepGoal,
  onSelectDate,
}: WeeklyActivityChartProps) {
  const maxSteps = Math.max(stepGoal * 1.15, ...days.map((d) => d.activity.steps));
  const width = 560;
  const height = 172;
  const padX = 16;
  const padTop = 18;
  const padBottom = 26;
  const plotH = height - padTop - padBottom;
  const colW = (width - padX * 2) / days.length;
  const barW = Math.min(34, colW * 0.56);
  const goalY = padTop + plotH - (stepGoal / maxSteps) * plotH;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto select-none"
      role="img"
      aria-label="7-day daily steps comparison chart"
    >
      <line
        x1={padX}
        y1={goalY}
        x2={width - padX}
        y2={goalY}
        stroke="rgba(79, 219, 200, 0.35)"
        strokeDasharray="4 4"
        strokeWidth="1"
      />
      {days.map((day, idx) => {
        const barH = Math.max(8, (day.activity.steps / maxSteps) * plotH);
        const x = padX + idx * colW + (colW - barW) / 2;
        const y = padTop + plotH - barH;
        const isSelected = day.dateIso === selectedDateIso;
        const hitGoal = day.activity.steps >= stepGoal;
        const fill = isSelected ? '#4fdbc8' : hitGoal ? '#4edea3' : '#2f3634';

        return (
          <g
            key={day.dateIso}
            className="cursor-pointer"
            onClick={() => onSelectDate(day.dateIso)}
          >
            <rect x={x} y={y} width={barW} height={barH} rx={8} fill={fill} />
            <text
              x={x + barW / 2}
              y={height - 6}
              textAnchor="middle"
              className={`text-[11px] font-medium ${
                isSelected ? 'fill-[#4fdbc8]' : 'fill-[#859490]'
              }`}
            >
              {day.shortDay}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
