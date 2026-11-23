import { useState } from 'react';
import { Check, RotateCcw } from 'lucide-react';
import type { UnitSystem, UserProfile } from '../../types/wellness';
import { validateProfileGoals } from '../../utils/biometrics';

interface ProfileScreenProps {
  profile: UserProfile;
  onUpdateProfile: (next: UserProfile) => void;
  onResetDemoData: () => void;
}

const AVATAR_SRC = '/src/assets/images/avatar_wellness_member_1795452389896.jpg';

export function ProfileScreen({
  profile,
  onUpdateProfile,
  onResetDemoData,
}: ProfileScreenProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const [stepGoal, setStepGoal] = useState(String(profile.stepGoal));
  const [sleepTargetHours, setSleepTargetHours] = useState(String(profile.sleepTargetHours));
  const [activeCalorieGoal, setActiveCalorieGoal] = useState(String(profile.activeCalorieGoal));
  const [unitSystem, setUnitSystem] = useState<UnitSystem>(profile.unitSystem);
  const [bedtimeReminder, setBedtimeReminder] = useState(profile.bedtimeReminderEnabled);
  const [bedtimeTarget, setBedtimeTarget] = useState(profile.bedtimeTarget);
  const [goalError, setGoalError] = useState<string | null>(null);
  const [savedBanner, setSavedBanner] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleSaveGoals = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedSteps = Number(stepGoal);
    const parsedSleep = Number(sleepTargetHours);
    const parsedCalories = Number(activeCalorieGoal);

    const err = validateProfileGoals({
      stepGoal: parsedSteps,
      sleepTargetHours: parsedSleep,
      activeCalorieGoal: parsedCalories,
    });
    if (err) {
      setGoalError(err);
      setSavedBanner(false);
      return;
    }

    setGoalError(null);
    onUpdateProfile({
      ...profile,
      stepGoal: Math.round(parsedSteps),
      sleepTargetHours: Number(parsedSleep.toFixed(1)),
      activeCalorieGoal: Math.round(parsedCalories),
      unitSystem,
      bedtimeReminderEnabled: bedtimeReminder,
      bedtimeTarget,
    });
    setSavedBanner(true);
  };

  const handleUnitChange = (nextUnit: UnitSystem) => {
    setUnitSystem(nextUnit);
    onUpdateProfile({
      ...profile,
      unitSystem: nextUnit,
    });
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-medium text-[#bbcac6]">Member Settings &amp; Baselines</p>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#dde4e1] mt-1 text-balance">
          Profile &amp; Targets
        </h1>
      </header>

      {/* Member Identity Card */}
      <section
        aria-label="Member identity"
        className="rounded-3xl bg-[#1a211f] border border-white/[0.08] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6"
      >
        <div className="flex items-center gap-5">
          {imgFailed ? (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#14b8a6]/30 to-[#252b2a] border border-white/[0.12] flex items-center justify-center text-xl font-bold text-[#4fdbc8] shrink-0">
              EV
            </div>
          ) : (
            <img
              src={AVATAR_SRC}
              alt={`${profile.name} profile portrait`}
              referrerPolicy="no-referrer"
              onError={() => setImgFailed(true)}
              className="w-20 h-20 rounded-full object-cover border border-white/[0.12] shrink-0"
            />
          )}
          <div>
            <h2 className="text-xl font-semibold text-[#dde4e1]">{profile.name}</h2>
            <p className="text-sm text-[#bbcac6] mt-0.5">{profile.email}</p>
            <p className="text-xs text-[#859490] mt-2">
              {profile.deviceName}
              <span className="mx-1.5" aria-hidden="true">
                ·
              </span>
              {profile.lastSyncedLabel}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:text-right border-t sm:border-t-0 pt-4 sm:pt-0 border-white/[0.06] tabular-nums">
          <div>
            <p className="text-xs text-[#859490]">HRV Baseline</p>
            <p className="text-lg font-semibold text-[#4fdbc8] mt-0.5">
              {profile.hrvBaselineMs} ms
            </p>
          </div>
          <div>
            <p className="text-xs text-[#859490]">Resting HR Baseline</p>
            <p className="text-lg font-semibold text-[#4edea3] mt-0.5">
              {profile.rhrBaselineBpm} bpm
            </p>
          </div>
        </div>
      </section>

      {/* Targets & Preferences Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <section
          aria-label="Daily targets"
          className="lg:col-span-7 rounded-3xl bg-[#161d1b] border border-white/[0.08] p-6"
        >
          <h2 className="text-lg font-semibold text-[#dde4e1]">Daily Biometric Targets</h2>
          <p className="text-xs text-[#859490] mt-0.5">
            Changes immediately recalibrate readiness, sleep, and activity rings across the app.
          </p>

          <form onSubmit={handleSaveGoals} className="mt-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="goal-steps" className="block text-xs font-medium text-[#bbcac6] mb-1.5">
                  Daily Step Goal
                </label>
                <input
                  id="goal-steps"
                  type="number"
                  min={2000}
                  max={40000}
                  step={500}
                  value={stepGoal}
                  onChange={(e) => {
                    setStepGoal(e.target.value);
                    setSavedBanner(false);
                  }}
                  className="w-full min-h-[44px] px-4 rounded-2xl bg-[#0e1513] border border-white/[0.1] text-sm text-[#dde4e1] tabular-nums focus:outline-none focus:border-[#4fdbc8]"
                />
              </div>

              <div>
                <label htmlFor="goal-sleep" className="block text-xs font-medium text-[#bbcac6] mb-1.5">
                  Sleep Target (hours)
                </label>
                <input
                  id="goal-sleep"
                  type="number"
                  min={5}
                  max={11}
                  step={0.5}
                  value={sleepTargetHours}
                  onChange={(e) => {
                    setSleepTargetHours(e.target.value);
                    setSavedBanner(false);
                  }}
                  className="w-full min-h-[44px] px-4 rounded-2xl bg-[#0e1513] border border-white/[0.1] text-sm text-[#dde4e1] tabular-nums focus:outline-none focus:border-[#4fdbc8]"
                />
              </div>

              <div>
                <label htmlFor="goal-calories" className="block text-xs font-medium text-[#bbcac6] mb-1.5">
                  Active Energy (kcal)
                </label>
                <input
                  id="goal-calories"
                  type="number"
                  min={150}
                  max={2500}
                  step={25}
                  value={activeCalorieGoal}
                  onChange={(e) => {
                    setActiveCalorieGoal(e.target.value);
                    setSavedBanner(false);
                  }}
                  className="w-full min-h-[44px] px-4 rounded-2xl bg-[#0e1513] border border-white/[0.1] text-sm text-[#dde4e1] tabular-nums focus:outline-none focus:border-[#4fdbc8]"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <input
                  id="bedtime-reminder-toggle"
                  type="checkbox"
                  checked={bedtimeReminder}
                  onChange={(e) => {
                    setBedtimeReminder(e.target.checked);
                    setSavedBanner(false);
                  }}
                  className="w-5 h-5 rounded-md accent-[#14b8a6] cursor-pointer"
                />
                <label htmlFor="bedtime-reminder-toggle" className="text-sm text-[#dde4e1] cursor-pointer">
                  Bedtime wind-down reminder
                </label>
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="bedtime-target" className="text-xs text-[#859490]">
                  Target Bedtime
                </label>
                <input
                  id="bedtime-target"
                  type="time"
                  value={bedtimeTarget}
                  onChange={(e) => {
                    setBedtimeTarget(e.target.value);
                    setSavedBanner(false);
                  }}
                  className="min-h-[40px] px-3 rounded-xl bg-[#0e1513] border border-white/[0.1] text-xs font-mono text-[#dde4e1] tabular-nums focus:outline-none focus:border-[#4fdbc8]"
                />
              </div>
            </div>

            {goalError ? (
              <p role="alert" className="text-xs font-medium text-[#ffb4ab]">
                {goalError}
              </p>
            ) : null}

            <div className="flex items-center justify-between gap-4 pt-2">
              {savedBanner ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#4edea3]">
                  <Check className="w-4 h-4" aria-hidden="true" />
                  <span>Targets saved</span>
                </span>
              ) : (
                <span className="text-xs text-[#859490]">Stored locally on this device</span>
              )}

              <button
                type="submit"
                className="min-h-[44px] px-6 rounded-full bg-[#14b8a6] hover:bg-[#4fdbc8] text-[#00201c] text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                Save Targets
              </button>
            </div>
          </form>
        </section>

        <section
          aria-label="Units and data management"
          className="lg:col-span-5 rounded-3xl bg-[#161d1b] border border-white/[0.08] p-6 flex flex-col justify-between gap-6"
        >
          <div>
            <h2 className="text-lg font-semibold text-[#dde4e1]">Measurement Units</h2>
            <p className="text-xs text-[#859490] mt-0.5">
              Choose how skin temperature deviation and distance are displayed.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2 p-1 rounded-2xl bg-[#0e1513] border border-white/[0.06]">
              <button
                type="button"
                aria-pressed={unitSystem === 'metric'}
                onClick={() => handleUnitChange('metric')}
                className={`min-h-[44px] px-3 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  unitSystem === 'metric'
                    ? 'bg-[#252b2a] text-[#4fdbc8]'
                    : 'text-[#bbcac6] hover:text-[#dde4e1]'
                }`}
              >
                Metric (°C · km)
              </button>
              <button
                type="button"
                aria-pressed={unitSystem === 'imperial'}
                onClick={() => handleUnitChange('imperial')}
                className={`min-h-[44px] px-3 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  unitSystem === 'imperial'
                    ? 'bg-[#252b2a] text-[#4fdbc8]'
                    : 'text-[#bbcac6] hover:text-[#dde4e1]'
                }`}
              >
                Imperial (°F · mi)
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-white/[0.06]">
            <h3 className="text-sm font-semibold text-[#dde4e1]">Session Data</h3>
            <p className="text-xs text-[#859490] mt-1">
              Restore the default 7-day biometric logs and target thresholds.
            </p>

            {confirmReset ? (
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onResetDemoData();
                    setConfirmReset(false);
                    setStepGoal('10000');
                    setSleepTargetHours('8');
                    setActiveCalorieGoal('550');
                    setUnitSystem('metric');
                  }}
                  className="min-h-[44px] px-4 rounded-full bg-[#ffb4ab]/15 border border-[#ffb4ab]/40 text-xs font-semibold text-[#ffb4ab] hover:bg-[#ffb4ab]/25 cursor-pointer"
                >
                  Confirm Reset
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="min-h-[44px] px-4 rounded-full bg-[#252b2a] text-xs font-medium text-[#dde4e1] cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="mt-3 inline-flex items-center gap-1.5 min-h-[44px] px-4 rounded-full bg-[#252b2a] hover:bg-[#2f3634] text-xs font-medium text-[#dde4e1] border border-white/[0.08] cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Reset Wellness Data</span>
              </button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
