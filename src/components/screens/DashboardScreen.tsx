import { ArrowRight, ChevronRight } from 'lucide-react';
import type { DailyWellnessEntry, NavTransition, ScreenId, UserProfile } from '../../types/wellness';
import {
  calculateReadiness,
  classifyVitalStatus,
  formatDistance,
  formatDurationMinutes,
  formatTemperatureDelta,
} from '../../utils/biometrics';
import { BiometricRing } from '../BiometricRing';
import { DaySelector } from '../DaySelector';
import { StatusText } from '../StatusText';

interface DashboardScreenProps {
  days: DailyWellnessEntry[];
  selectedDay: DailyWellnessEntry;
  profile: UserProfile;
  onSelectDate: (dateIso: string) => void;
  onNavigate: (screen: ScreenId, transition?: NavTransition) => void;
}

export function DashboardScreen({
  days,
  selectedDay,
  profile,
  onSelectDate,
  onNavigate,
}: DashboardScreenProps) {
  const readiness = calculateReadiness(selectedDay, profile);
  const rhrStatus = classifyVitalStatus('rhr', selectedDay.vitals.restingHrBpm, profile.rhrBaselineBpm);
  const hrvStatus = classifyVitalStatus('hrv', selectedDay.vitals.hrvMs, profile.hrvBaselineMs);
  const spo2Status = classifyVitalStatus('spo2', selectedDay.vitals.spo2Pct);
  const stepPct = Math.min(100, Math.round((selectedDay.activity.steps / profile.stepGoal) * 100));

  return (
    <div className="space-y-6">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-[#bbcac6]">
            {selectedDay.fullLabel}{' '}
            <span className="mx-1 text-[#859490]" aria-hidden="true">
              ·
            </span>{' '}
            {profile.deviceName}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#dde4e1] mt-1 text-balance">
            Daily Readiness Overview
          </h1>
        </div>
        <DaySelector
          days={days}
          selectedDateIso={selectedDay.dateIso}
          onSelectDate={onSelectDate}
        />
      </header>

      {/* Dominant Focal Anchor: Readiness Hero Card */}
      <section
        aria-label="Readiness score summary"
        className="rounded-3xl bg-[#1a211f] border border-white/[0.08] p-6 sm:p-8 shadow-[0_0_48px_rgba(79,219,200,0.06)]"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-4 flex flex-col items-center lg:items-start">
            <BiometricRing
              value={readiness.score}
              label="Readiness"
              sublabel={readiness.status}
              size={184}
              strokeWidth={13}
              accent={readiness.status === 'Elevated' || readiness.status === 'Low' ? 'coral' : 'teal'}
            />
          </div>

          <div className="lg:col-span-8 space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs text-[#bbcac6]">
                <span>Recovery Guidance</span>
                <span aria-hidden="true">·</span>
                <StatusText status={readiness.status} />
              </div>
              <p className="text-base sm:text-lg text-[#dde4e1] leading-relaxed mt-2 max-w-2xl">
                {readiness.guidance}
              </p>
            </div>

            {/* Readiness Drivers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-white/[0.06]">
              <div>
                <div className="flex items-center justify-between text-xs text-[#bbcac6]">
                  <span>Sleep Balance</span>
                  <span className="font-mono text-[#dde4e1] tabular-nums">
                    {readiness.sleepContribution}%
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-[#252b2a] mt-2 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#4fdbc8]"
                    style={{ width: `${readiness.sleepContribution}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs text-[#bbcac6]">
                  <span>HRV Reserve</span>
                  <span className="font-mono text-[#dde4e1] tabular-nums">
                    {readiness.hrvContribution}%
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-[#252b2a] mt-2 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#4edea3]"
                    style={{ width: `${readiness.hrvContribution}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs text-[#bbcac6]">
                  <span>Resting HR</span>
                  <span className="font-mono text-[#dde4e1] tabular-nums">
                    {readiness.rhrContribution}%
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-[#252b2a] mt-2 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#14b8a6]"
                    style={{ width: `${readiness.rhrContribution}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => onNavigate('sleep', 'push')}
                className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-2.5 rounded-full bg-[#14b8a6] hover:bg-[#4fdbc8] text-[#00201c] text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#71f8e4] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>View Sleep Log</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('vitals', 'none')}
                className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-5 py-2.5 rounded-full bg-[#252b2a] hover:bg-[#2f3634] text-[#dde4e1] text-sm font-medium border border-white/[0.08] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4fdbc8] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Inspect Vitals</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Column Vital Snapshot Strip */}
      <section aria-label="Core biometric vitals" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-3xl bg-[#161d1b] border border-white/[0.08] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#bbcac6]">Resting Heart Rate</span>
            <StatusText status={rhrStatus} />
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-[#dde4e1] tabular-nums">
              {selectedDay.vitals.restingHrBpm}
            </span>
            <span className="text-sm text-[#859490]">bpm</span>
          </div>
          <p className="text-xs text-[#859490] mt-2 tabular-nums">
            Baseline {profile.rhrBaselineBpm} bpm · Overnight low
          </p>
        </div>

        <div className="rounded-3xl bg-[#161d1b] border border-white/[0.08] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#bbcac6]">Heart Rate Variability</span>
            <StatusText status={hrvStatus} />
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-[#dde4e1] tabular-nums">
              {selectedDay.vitals.hrvMs}
            </span>
            <span className="text-sm text-[#859490]">ms</span>
          </div>
          <p className="text-xs text-[#859490] mt-2 tabular-nums">
            Baseline {profile.hrvBaselineMs} ms · RMSSD nocturnal
          </p>
        </div>

        <div className="rounded-3xl bg-[#161d1b] border border-white/[0.08] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#bbcac6]">Blood Oxygen &amp; Temp</span>
            <StatusText status={spo2Status} />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#dde4e1] tabular-nums">
              {selectedDay.vitals.spo2Pct}%
            </span>
            <span className="text-xs font-mono text-[#bbcac6] tabular-nums">
              {formatTemperatureDelta(selectedDay.vitals.skinTempDeltaC, profile.unitSystem)}
            </span>
          </div>
          <p className="text-xs text-[#859490] mt-2 tabular-nums">
            Resp. {selectedDay.vitals.respiratoryRateBrpm.toFixed(1)} brpm · Continuous
          </p>
        </div>
      </section>

      {/* Bottom 2-Column Summary: Sleep + Activity */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-3xl bg-[#161d1b] border border-white/[0.08] p-6 flex flex-col justify-between gap-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-[#dde4e1]">Last Night Sleep</h2>
              <p className="text-xs text-[#859490] mt-0.5 tabular-nums">
                {selectedDay.sleep.bedtime} — {selectedDay.sleep.wakeTime} ·{' '}
                {selectedDay.sleep.efficiencyPct}% efficiency
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-[#4fdbc8] tabular-nums">
                {selectedDay.sleep.sleepScore}
              </span>
              <p className="text-[11px] text-[#859490]">Score</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 py-3 border-y border-white/[0.06]">
            <div>
              <p className="text-xs text-[#859490]">Total Asleep</p>
              <p className="text-base font-semibold text-[#dde4e1] tabular-nums mt-0.5">
                {formatDurationMinutes(selectedDay.sleep.totalMinutes)}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#859490]">Deep Sleep</p>
              <p className="text-base font-semibold text-[#dde4e1] tabular-nums mt-0.5">
                {formatDurationMinutes(selectedDay.sleep.deepMinutes)}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#859490]">REM Sleep</p>
              <p className="text-base font-semibold text-[#dde4e1] tabular-nums mt-0.5">
                {formatDurationMinutes(selectedDay.sleep.remMinutes)}
              </p>
            </div>
          </div>

          <p className="text-sm text-[#bbcac6] leading-relaxed">{selectedDay.sleep.morningNote}</p>
        </div>

        <div className="rounded-3xl bg-[#161d1b] border border-white/[0.08] p-6 flex flex-col justify-between gap-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-[#dde4e1]">Movement &amp; Strain</h2>
              <p className="text-xs text-[#859490] mt-0.5 tabular-nums">
                Goal {profile.stepGoal.toLocaleString()} steps ·{' '}
                {formatDistance(selectedDay.activity.distanceKm, profile.unitSystem)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('activity', 'none')}
              className="inline-flex items-center gap-1 min-h-[44px] px-3 text-xs font-semibold text-[#4fdbc8] hover:text-[#71f8e4] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Activity</span>
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <div>
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-2xl font-bold text-[#dde4e1] tabular-nums">
                {selectedDay.activity.steps.toLocaleString()} steps
              </span>
              <span className="text-xs font-mono text-[#4edea3] tabular-nums">{stepPct}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-[#252b2a] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#4edea3] transition-all duration-300"
                style={{ width: `${stepPct}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/[0.06]">
            <div>
              <p className="text-xs text-[#859490]">Active Energy</p>
              <p className="text-base font-semibold text-[#dde4e1] tabular-nums mt-0.5">
                {selectedDay.activity.activeCalories} kcal
              </p>
            </div>
            <div>
              <p className="text-xs text-[#859490]">Active Time</p>
              <p className="text-base font-semibold text-[#dde4e1] tabular-nums mt-0.5">
                {selectedDay.activity.activeMinutes} min
              </p>
            </div>
            <div>
              <p className="text-xs text-[#859490]">Strain Load</p>
              <p className="text-base font-semibold text-[#dde4e1] tabular-nums mt-0.5">
                {selectedDay.activity.strainScore.toFixed(1)}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
