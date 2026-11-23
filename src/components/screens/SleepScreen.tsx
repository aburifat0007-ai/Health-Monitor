import { useEffect, useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import type { DailyWellnessEntry, NavTransition, ScreenId, UserProfile } from '../../types/wellness';
import { computeSleepStagePercentages, formatDurationMinutes } from '../../utils/biometrics';
import { BiometricRing } from '../BiometricRing';
import { SleepHypnogram } from '../Charts';
import { DaySelector } from '../DaySelector';

interface SleepScreenProps {
  days: DailyWellnessEntry[];
  selectedDay: DailyWellnessEntry;
  profile: UserProfile;
  cameFromPush: boolean;
  onSelectDate: (dateIso: string) => void;
  onNavigate: (screen: ScreenId, transition?: NavTransition) => void;
  onUpdateSleepReflection: (dateIso: string, rating: number, morningNote: string) => void;
}

export function SleepScreen({
  days,
  selectedDay,
  profile,
  cameFromPush,
  onSelectDate,
  onNavigate,
  onUpdateSleepReflection,
}: SleepScreenProps) {
  const [rating, setRating] = useState(selectedDay.sleep.restfulnessRating);
  const [morningNote, setMorningNote] = useState(selectedDay.sleep.morningNote);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setRating(selectedDay.sleep.restfulnessRating);
    setMorningNote(selectedDay.sleep.morningNote);
    setSaved(false);
  }, [selectedDay.dateIso, selectedDay.sleep.restfulnessRating, selectedDay.sleep.morningNote]);

  const stagePct = computeSleepStagePercentages(selectedDay);
  const targetMinutes = profile.sleepTargetHours * 60;
  const targetDiff = selectedDay.sleep.totalMinutes - targetMinutes;
  const targetDiffLabel =
    targetDiff >= 0
      ? `+${formatDurationMinutes(targetDiff)} vs target`
      : `-${formatDurationMinutes(Math.abs(targetDiff))} vs target`;

  const handleSaveReflection = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSleepReflection(selectedDay.dateIso, rating, morningNote.trim());
    setSaved(true);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          {cameFromPush ? (
            <button
              type="button"
              onClick={() => onNavigate('dashboard', 'none')}
              className="inline-flex items-center gap-1.5 min-h-[36px] text-xs font-medium text-[#4fdbc8] hover:text-[#71f8e4] mb-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Back to Dashboard</span>
            </button>
          ) : null}
          <p className="text-xs font-medium text-[#bbcac6]">
            {selectedDay.fullLabel}
            <span className="mx-1.5 text-[#859490]" aria-hidden="true">
              ·
            </span>
            {selectedDay.sleep.bedtime} — {selectedDay.sleep.wakeTime}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#dde4e1] mt-1 text-balance">
            Sleep Architecture &amp; Log
          </h1>
        </div>
        <DaySelector
          days={days}
          selectedDateIso={selectedDay.dateIso}
          onSelectDate={onSelectDate}
        />
      </header>

      {/* Focal Anchor: Sleep Score & Hypnogram */}
      <section
        aria-label="Sleep score and hypnogram"
        className="rounded-3xl bg-[#1a211f] border border-white/[0.08] p-6 sm:p-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-4 flex flex-col items-center lg:items-start gap-4">
            <BiometricRing
              value={selectedDay.sleep.sleepScore}
              label="Sleep Score"
              sublabel={`${selectedDay.sleep.efficiencyPct}% efficiency`}
              size={172}
              strokeWidth={12}
              accent="emerald"
            />
            <div className="text-center lg:text-left">
              <p className="text-2xl font-bold text-[#dde4e1] tabular-nums">
                {formatDurationMinutes(selectedDay.sleep.totalMinutes)}
              </p>
              <p className="text-xs text-[#859490] mt-0.5 tabular-nums">
                Total asleep · {targetDiffLabel} · Latency {selectedDay.sleep.latencyMinutes}m
              </p>
            </div>
          </div>

          <div className="lg:col-span-8">
            <h2 className="text-base font-semibold text-[#dde4e1] mb-4">
              Overnight Sleep Stages
            </h2>
            <SleepHypnogram
              segments={selectedDay.sleep.segments}
              bedtime={selectedDay.sleep.bedtime}
              wakeTime={selectedDay.sleep.wakeTime}
            />
          </div>
        </div>
      </section>

      {/* Stage Breakdown & Morning Reflection */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7 rounded-3xl bg-[#161d1b] border border-white/[0.08] p-6">
          <h2 className="text-lg font-semibold text-[#dde4e1] mb-4">Stage Distribution</h2>
          <div className="divide-y divide-white/[0.06]">
            {[
              {
                name: 'Deep Sleep',
                minutes: selectedDay.sleep.deepMinutes,
                pct: stagePct.deepPct,
                target: '15–22%',
                color: '#14b8a6',
              },
              {
                name: 'REM Sleep',
                minutes: selectedDay.sleep.remMinutes,
                pct: stagePct.remPct,
                target: '20–25%',
                color: '#4edea3',
              },
              {
                name: 'Light Sleep',
                minutes: selectedDay.sleep.lightMinutes,
                pct: stagePct.lightPct,
                target: '45–55%',
                color: '#4fdbc8',
              },
              {
                name: 'Awake / Restless',
                minutes: selectedDay.sleep.awakeMinutes,
                pct: stagePct.awakePct,
                target: '< 8%',
                color: '#ffb59e',
              },
            ].map((row) => (
              <div key={row.name} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="w-3 h-3 rounded-sm shrink-0"
                    style={{ backgroundColor: row.color }}
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-sm font-medium text-[#dde4e1]">{row.name}</p>
                    <p className="text-xs text-[#859490] tabular-nums">Target {row.target}</p>
                  </div>
                </div>
                <div className="text-right tabular-nums">
                  <p className="text-sm font-semibold text-[#dde4e1]">
                    {formatDurationMinutes(row.minutes)}
                  </p>
                  <p className="text-xs text-[#bbcac6]">{row.pct}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 rounded-3xl bg-[#161d1b] border border-white/[0.08] p-6">
          <h2 className="text-lg font-semibold text-[#dde4e1]">Morning Reflection</h2>
          <p className="text-xs text-[#859490] mt-0.5">
            Rate subjective restfulness upon waking for {selectedDay.fullLabel}.
          </p>

          <form onSubmit={handleSaveReflection} className="mt-5 space-y-4">
            <div>
              <span className="block text-xs font-medium text-[#bbcac6] mb-2">
                Restfulness Rating (1 to 5)
              </span>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    aria-pressed={rating === num}
                    onClick={() => {
                      setRating(num);
                      setSaved(false);
                    }}
                    className={`min-h-[44px] rounded-2xl text-sm font-semibold tabular-nums border transition-colors cursor-pointer ${
                      rating === num
                        ? 'bg-[#14b8a6]/20 border-[#4fdbc8] text-[#4fdbc8]'
                        : 'bg-[#0e1513] border-white/[0.08] text-[#bbcac6] hover:text-[#dde4e1]'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="sleep-note" className="block text-xs font-medium text-[#bbcac6] mb-2">
                Sleep Journal Note
              </label>
              <textarea
                id="sleep-note"
                rows={3}
                value={morningNote}
                onChange={(e) => {
                  setMorningNote(e.target.value);
                  setSaved(false);
                }}
                className="w-full px-4 py-3 rounded-2xl bg-[#0e1513] border border-white/[0.1] text-sm text-[#dde4e1] placeholder-[#859490] focus:outline-none focus:border-[#4fdbc8] resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full min-h-[44px] px-5 rounded-full bg-[#14b8a6] hover:bg-[#4fdbc8] text-[#00201c] text-sm font-semibold transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4" aria-hidden="true" />
                  <span>Reflection Saved</span>
                </>
              ) : (
                <span>Save Reflection</span>
              )}
            </button>
          </form>
        </div>
      </section>

      {/* 7-Night Sleep Log Table */}
      <section aria-label="Nightly sleep history" className="rounded-3xl bg-[#161d1b] border border-white/[0.08] p-6">
        <h2 className="text-lg font-semibold text-[#dde4e1] mb-4">7-Night Sleep Log</h2>
        <div className="divide-y divide-white/[0.06]">
          {[...days].reverse().map((day) => {
            const isSelected = day.dateIso === selectedDay.dateIso;
            return (
              <button
                key={day.dateIso}
                type="button"
                onClick={() => onSelectDate(day.dateIso)}
                className={`w-full min-h-[56px] py-3 px-3 -mx-3 rounded-2xl flex items-center justify-between gap-4 text-left transition-colors cursor-pointer ${
                  isSelected ? 'bg-[#1a211f]' : 'hover:bg-[#1a211f]/60'
                }`}
              >
                <div>
                  <p className={`text-sm font-semibold ${isSelected ? 'text-[#4fdbc8]' : 'text-[#dde4e1]'}`}>
                    {day.fullLabel}
                  </p>
                  <p className="text-xs text-[#859490] tabular-nums mt-0.5">
                    {day.sleep.bedtime} — {day.sleep.wakeTime} · Restfulness {day.sleep.restfulnessRating}/5
                  </p>
                </div>
                <div className="text-right tabular-nums shrink-0">
                  <p className="text-sm font-semibold text-[#dde4e1]">
                    {formatDurationMinutes(day.sleep.totalMinutes)}
                  </p>
                  <p className="text-xs text-[#4edea3]">Score {day.sleep.sleepScore}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
