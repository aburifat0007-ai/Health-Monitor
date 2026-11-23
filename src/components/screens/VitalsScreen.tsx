import { useEffect, useState } from 'react';
import { Check, Minus, Plus } from 'lucide-react';
import type { DailyWellnessEntry, UserProfile } from '../../types/wellness';
import { classifyVitalStatus, formatTemperatureDelta } from '../../utils/biometrics';
import { VitalsTrendChart } from '../Charts';
import { DaySelector } from '../DaySelector';
import { StatusText } from '../StatusText';

interface VitalsScreenProps {
  days: DailyWellnessEntry[];
  selectedDay: DailyWellnessEntry;
  profile: UserProfile;
  onSelectDate: (dateIso: string) => void;
  onUpdateVitalsCheckIn: (dateIso: string, hydrationLiters: number, checkInNote: string) => void;
}

export function VitalsScreen({
  days,
  selectedDay,
  profile,
  onSelectDate,
  onUpdateVitalsCheckIn,
}: VitalsScreenProps) {
  const [chartMetric, setChartMetric] = useState<'hrv' | 'rhr'>('hrv');
  const [chartMode, setChartMode] = useState<'24h' | '7d'>('7d');
  const [hydrationInput, setHydrationInput] = useState(selectedDay.vitals.hydrationLiters);
  const [noteInput, setNoteInput] = useState(selectedDay.vitals.checkInNote);
  const [savedFeedback, setSavedFeedback] = useState(false);

  useEffect(() => {
    setHydrationInput(selectedDay.vitals.hydrationLiters);
    setNoteInput(selectedDay.vitals.checkInNote);
    setSavedFeedback(false);
  }, [selectedDay.dateIso, selectedDay.vitals.hydrationLiters, selectedDay.vitals.checkInNote]);

  const rhrStatus = classifyVitalStatus('rhr', selectedDay.vitals.restingHrBpm, profile.rhrBaselineBpm);
  const hrvStatus = classifyVitalStatus('hrv', selectedDay.vitals.hrvMs, profile.hrvBaselineMs);
  const spo2Status = classifyVitalStatus('spo2', selectedDay.vitals.spo2Pct);
  const respStatus = classifyVitalStatus('resp', selectedDay.vitals.respiratoryRateBrpm);
  const tempStatus = classifyVitalStatus('temp', selectedDay.vitals.skinTempDeltaC);

  const handleSaveCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateVitalsCheckIn(selectedDay.dateIso, Number(hydrationInput.toFixed(1)), noteInput.trim());
    setSavedFeedback(true);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-[#bbcac6]">
            {selectedDay.fullLabel}
            <span className="mx-1.5 text-[#859490]" aria-hidden="true">
              ·
            </span>
            Autonomic Telemetry
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#dde4e1] mt-1 text-balance">
            Biometric Vitals
          </h1>
        </div>
        <DaySelector
          days={days}
          selectedDateIso={selectedDay.dateIso}
          onSelectDate={onSelectDate}
        />
      </header>

      {/* Focal Anchor: Autonomic Trend Chart */}
      <section
        aria-label="Autonomic trend chart"
        className="rounded-3xl bg-[#1a211f] border border-white/[0.08] p-6 sm:p-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-[#dde4e1]">
              {chartMetric === 'hrv' ? 'Heart Rate Variability (RMSSD)' : 'Resting Heart Rate'}
            </h2>
            <p className="text-xs text-[#859490] mt-0.5">
              Compare current {chartMode === '24h' ? '24-hour rhythm' : '7-day trajectory'} against personal baseline
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex p-1 rounded-full bg-[#161d1b] border border-white/[0.06]">
              <button
                type="button"
                onClick={() => setChartMetric('hrv')}
                className={`min-h-[36px] px-4 rounded-full text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  chartMetric === 'hrv'
                    ? 'bg-[#252b2a] text-[#4fdbc8]'
                    : 'text-[#bbcac6] hover:text-[#dde4e1]'
                }`}
              >
                HRV
              </button>
              <button
                type="button"
                onClick={() => setChartMetric('rhr')}
                className={`min-h-[36px] px-4 rounded-full text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  chartMetric === 'rhr'
                    ? 'bg-[#252b2a] text-[#4edea3]'
                    : 'text-[#bbcac6] hover:text-[#dde4e1]'
                }`}
              >
                Resting HR
              </button>
            </div>

            <div className="inline-flex p-1 rounded-full bg-[#161d1b] border border-white/[0.06]">
              <button
                type="button"
                onClick={() => setChartMode('24h')}
                className={`min-h-[36px] px-4 rounded-full text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  chartMode === '24h'
                    ? 'bg-[#252b2a] text-[#dde4e1]'
                    : 'text-[#bbcac6] hover:text-[#dde4e1]'
                }`}
              >
                24H
              </button>
              <button
                type="button"
                onClick={() => setChartMode('7d')}
                className={`min-h-[36px] px-4 rounded-full text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  chartMode === '7d'
                    ? 'bg-[#252b2a] text-[#dde4e1]'
                    : 'text-[#bbcac6] hover:text-[#dde4e1]'
                }`}
              >
                7D
              </button>
            </div>
          </div>
        </div>

        <VitalsTrendChart
          mode={chartMode}
          metric={chartMetric}
          selectedDay={selectedDay}
          allDays={days}
          baselineValue={chartMetric === 'hrv' ? profile.hrvBaselineMs : profile.rhrBaselineBpm}
        />
      </section>

      {/* Biometric Matrix */}
      <section aria-label="Biometric readings" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded-3xl bg-[#161d1b] border border-white/[0.08] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#bbcac6]">Resting Heart Rate</span>
            <StatusText status={rhrStatus} />
          </div>
          <p className="text-3xl font-bold text-[#dde4e1] tabular-nums mt-3">
            {selectedDay.vitals.restingHrBpm} <span className="text-sm font-normal text-[#859490]">bpm</span>
          </p>
          <p className="text-xs text-[#859490] mt-2 tabular-nums">
            Baseline {profile.rhrBaselineBpm} bpm
          </p>
        </div>

        <div className="rounded-3xl bg-[#161d1b] border border-white/[0.08] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#bbcac6]">HRV (RMSSD)</span>
            <StatusText status={hrvStatus} />
          </div>
          <p className="text-3xl font-bold text-[#dde4e1] tabular-nums mt-3">
            {selectedDay.vitals.hrvMs} <span className="text-sm font-normal text-[#859490]">ms</span>
          </p>
          <p className="text-xs text-[#859490] mt-2 tabular-nums">
            Baseline {profile.hrvBaselineMs} ms
          </p>
        </div>

        <div className="rounded-3xl bg-[#161d1b] border border-white/[0.08] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#bbcac6]">Blood Oxygen (SpO2)</span>
            <StatusText status={spo2Status} />
          </div>
          <p className="text-3xl font-bold text-[#dde4e1] tabular-nums mt-3">
            {selectedDay.vitals.spo2Pct}
            <span className="text-sm font-normal text-[#859490]">%</span>
          </p>
          <p className="text-xs text-[#859490] mt-2">Nocturnal pulse oximetry average</p>
        </div>

        <div className="rounded-3xl bg-[#161d1b] border border-white/[0.08] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#bbcac6]">Respiratory Rate</span>
            <StatusText status={respStatus} />
          </div>
          <p className="text-3xl font-bold text-[#dde4e1] tabular-nums mt-3">
            {selectedDay.vitals.respiratoryRateBrpm.toFixed(1)}{' '}
            <span className="text-sm font-normal text-[#859490]">brpm</span>
          </p>
          <p className="text-xs text-[#859490] mt-2">Normal range 12.0 — 16.5 brpm</p>
        </div>

        <div className="rounded-3xl bg-[#161d1b] border border-white/[0.08] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#bbcac6]">Skin Temperature</span>
            <StatusText status={tempStatus} />
          </div>
          <p className="text-3xl font-bold text-[#dde4e1] tabular-nums mt-3">
            {formatTemperatureDelta(selectedDay.vitals.skinTempDeltaC, profile.unitSystem)}
          </p>
          <p className="text-xs text-[#859490] mt-2">Deviation from 30-day nocturnal mean</p>
        </div>

        <div className="rounded-3xl bg-[#161d1b] border border-white/[0.08] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#bbcac6]">Hydration Logged</span>
            <span className="text-xs font-semibold text-[#4fdbc8] tabular-nums">
              Target 2.5 L
            </span>
          </div>
          <p className="text-3xl font-bold text-[#dde4e1] tabular-nums mt-3">
            {selectedDay.vitals.hydrationLiters.toFixed(1)}{' '}
            <span className="text-sm font-normal text-[#859490]">L</span>
          </p>
          <p className="text-xs text-[#859490] mt-2">Updated via daily check-in below</p>
        </div>
      </section>

      {/* Interactive Hydration & Physiological Check-In */}
      <section
        aria-label="Daily physiological check-in"
        className="rounded-3xl bg-[#161d1b] border border-white/[0.08] p-6"
      >
        <h2 className="text-lg font-semibold text-[#dde4e1]">Daily Physiological Check-In</h2>
        <p className="text-xs text-[#859490] mt-0.5">
          Record hydration intake and context notes for {selectedDay.fullLabel}.
        </p>

        <form onSubmit={handleSaveCheckIn} className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-end">
          <div className="lg:col-span-4">
            <span className="block text-xs font-medium text-[#bbcac6] mb-2">
              Hydration Volume (Liters)
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Decrease hydration by 0.2 liters"
                onClick={() => {
                  setHydrationInput((prev) => Math.max(0.2, Number((prev - 0.2).toFixed(1))));
                  setSavedFeedback(false);
                }}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-2xl bg-[#252b2a] hover:bg-[#2f3634] text-[#dde4e1] border border-white/[0.08] cursor-pointer"
              >
                <Minus className="w-4 h-4" aria-hidden="true" />
              </button>
              <div className="flex-1 min-h-[44px] flex items-center justify-center rounded-2xl bg-[#0e1513] border border-white/[0.08] font-mono text-base font-semibold text-[#dde4e1] tabular-nums">
                {hydrationInput.toFixed(1)} L
              </div>
              <button
                type="button"
                aria-label="Increase hydration by 0.2 liters"
                onClick={() => {
                  setHydrationInput((prev) => Math.min(6.0, Number((prev + 0.2).toFixed(1))));
                  setSavedFeedback(false);
                }}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-2xl bg-[#252b2a] hover:bg-[#2f3634] text-[#dde4e1] border border-white/[0.08] cursor-pointer"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-6">
            <label htmlFor="vitals-note" className="block text-xs font-medium text-[#bbcac6] mb-2">
              Recovery &amp; Context Note
            </label>
            <input
              id="vitals-note"
              type="text"
              value={noteInput}
              onChange={(e) => {
                setNoteInput(e.target.value);
                setSavedFeedback(false);
              }}
              placeholder="e.g., Afternoon sauna, low caffeine, light legs..."
              className="w-full min-h-[44px] px-4 rounded-2xl bg-[#0e1513] border border-white/[0.1] text-sm text-[#dde4e1] placeholder-[#859490] focus:outline-none focus:border-[#4fdbc8]"
            />
          </div>

          <div className="lg:col-span-2 flex items-center justify-end">
            <button
              type="submit"
              className="w-full min-h-[44px] px-5 rounded-full bg-[#14b8a6] hover:bg-[#4fdbc8] text-[#00201c] text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer inline-flex items-center justify-center gap-1.5"
            >
              {savedFeedback ? (
                <>
                  <Check className="w-4 h-4" aria-hidden="true" />
                  <span>Saved</span>
                </>
              ) : (
                <span>Save Check-In</span>
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
