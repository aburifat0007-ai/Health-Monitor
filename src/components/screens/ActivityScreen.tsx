import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import type {
  DailyWellnessEntry,
  UserProfile,
  WorkoutCategory,
  WorkoutIntensity,
} from '../../types/wellness';
import { formatDistance, validateWorkoutInput, type WorkoutFormInput } from '../../utils/biometrics';
import { BiometricRing } from '../BiometricRing';
import { WeeklyActivityChart } from '../Charts';
import { DaySelector } from '../DaySelector';

interface ActivityScreenProps {
  days: DailyWellnessEntry[];
  selectedDay: DailyWellnessEntry;
  profile: UserProfile;
  onSelectDate: (dateIso: string) => void;
  onLogWorkout: (dateIso: string, input: WorkoutFormInput) => void;
}

export function ActivityScreen({
  days,
  selectedDay,
  profile,
  onSelectDate,
  onLogWorkout,
}: ActivityScreenProps) {
  const [categoryFilter, setCategoryFilter] = useState<'All' | WorkoutCategory>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<WorkoutCategory>('Cardio');
  const [durationMin, setDurationMin] = useState('35');
  const [intensity, setIntensity] = useState<WorkoutIntensity>('Moderate');
  const [calories, setCalories] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const stepProgress = Math.min(100, Math.round((selectedDay.activity.steps / profile.stepGoal) * 100));
  const filteredWorkouts =
    categoryFilter === 'All'
      ? selectedDay.activity.workouts
      : selectedDay.activity.workouts.filter((w) => w.category === categoryFilter);

  const zones = selectedDay.activity.zones;
  const totalZoneMin = Math.max(
    1,
    zones.zone1Min + zones.zone2Min + zones.zone3Min + zones.zone4Min + zones.zone5Min,
  );

  const handleOpenModal = () => {
    setFormError(null);
    setTitle('');
    setDurationMin('35');
    setCalories('');
    setCategory('Cardio');
    setIntensity('Moderate');
    setIsModalOpen(true);
  };

  const handleSubmitWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedDuration = Number(durationMin);
    const parsedCalories = calories.trim() === '' ? undefined : Number(calories);

    const input: WorkoutFormInput = {
      title,
      category,
      durationMin: parsedDuration,
      intensity,
      calories: parsedCalories,
    };

    const error = validateWorkoutInput(input);
    if (error) {
      setFormError(error);
      return;
    }

    onLogWorkout(selectedDay.dateIso, input);
    setIsModalOpen(false);
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
            Movement &amp; Cardiovascular Load
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#dde4e1] mt-1 text-balance">
            Daily Activity
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <DaySelector
            days={days}
            selectedDateIso={selectedDay.dateIso}
            onSelectDate={onSelectDate}
          />
          <button
            type="button"
            onClick={handleOpenModal}
            className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-5 py-2.5 rounded-full bg-[#14b8a6] hover:bg-[#4fdbc8] text-[#00201c] text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Log Workout</span>
          </button>
        </div>
      </header>

      {/* Focal Anchor: Steps Ring + Daily Energy Metrics */}
      <section
        aria-label="Daily movement summary"
        className="rounded-3xl bg-[#1a211f] border border-white/[0.08] p-6 sm:p-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-4 flex flex-col items-center lg:items-start">
            <BiometricRing
              value={stepProgress}
              label="Step Goal"
              sublabel={`${selectedDay.activity.steps.toLocaleString()} steps`}
              size={176}
              strokeWidth={12}
              accent="emerald"
            />
          </div>

          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl bg-[#161d1b] border border-white/[0.06] p-4">
              <p className="text-xs text-[#859490]">Steps</p>
              <p className="text-2xl font-bold text-[#dde4e1] tabular-nums mt-1.5">
                {selectedDay.activity.steps.toLocaleString()}
              </p>
              <p className="text-xs text-[#bbcac6] tabular-nums mt-1">
                Goal {profile.stepGoal.toLocaleString()}
              </p>
            </div>

            <div className="rounded-2xl bg-[#161d1b] border border-white/[0.06] p-4">
              <p className="text-xs text-[#859490]">Active Energy</p>
              <p className="text-2xl font-bold text-[#dde4e1] tabular-nums mt-1.5">
                {selectedDay.activity.activeCalories}
              </p>
              <p className="text-xs text-[#bbcac6] tabular-nums mt-1">
                of {profile.activeCalorieGoal} kcal
              </p>
            </div>

            <div className="rounded-2xl bg-[#161d1b] border border-white/[0.06] p-4">
              <p className="text-xs text-[#859490]">Distance</p>
              <p className="text-2xl font-bold text-[#dde4e1] tabular-nums mt-1.5">
                {formatDistance(selectedDay.activity.distanceKm, profile.unitSystem)}
              </p>
              <p className="text-xs text-[#bbcac6] tabular-nums mt-1">
                {selectedDay.activity.activeMinutes} active min
              </p>
            </div>

            <div className="rounded-2xl bg-[#161d1b] border border-white/[0.06] p-4">
              <p className="text-xs text-[#859490]">Strain Load</p>
              <p className="text-2xl font-bold text-[#4fdbc8] tabular-nums mt-1.5">
                {selectedDay.activity.strainScore.toFixed(1)}
              </p>
              <p className="text-xs text-[#bbcac6] mt-1">0–21 daily scale</p>
            </div>
          </div>
        </div>
      </section>

      {/* Weekly Step Trend & Heart Rate Zones */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-6 rounded-3xl bg-[#161d1b] border border-white/[0.08] p-6">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#dde4e1]">7-Day Step Volume</h2>
            <span className="text-xs text-[#859490] tabular-nums">
              Dashed line: {profile.stepGoal.toLocaleString()} goal
            </span>
          </div>
          <WeeklyActivityChart
            days={days}
            selectedDateIso={selectedDay.dateIso}
            stepGoal={profile.stepGoal}
            onSelectDate={onSelectDate}
          />
        </div>

        <div className="lg:col-span-6 rounded-3xl bg-[#161d1b] border border-white/[0.08] p-6">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#dde4e1]">Heart Rate Zones</h2>
            <span className="text-xs text-[#859490] tabular-nums">
              {selectedDay.activity.activeMinutes} min total
            </span>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Zone 5 · Peak', min: zones.zone5Min, color: '#ffb59e' },
              { label: 'Zone 4 · Threshold', min: zones.zone4Min, color: '#f38764' },
              { label: 'Zone 3 · Tempo', min: zones.zone3Min, color: '#4edea3' },
              { label: 'Zone 2 · Aerobic Base', min: zones.zone2Min, color: '#4fdbc8' },
              { label: 'Zone 1 · Recovery', min: zones.zone1Min, color: '#859490' },
            ].map((z) => {
              const pct = Math.round((z.min / totalZoneMin) * 100);
              return (
                <div key={z.label}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[#bbcac6]">{z.label}</span>
                    <span className="font-mono text-[#dde4e1] tabular-nums">
                      {z.min} min ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#252b2a] overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: z.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Workout Log with Category Filters */}
      <section aria-label="Workout sessions" className="rounded-3xl bg-[#161d1b] border border-white/[0.08] p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold text-[#dde4e1]">Workout Sessions</h2>
          <div className="inline-flex flex-wrap p-1 rounded-full bg-[#0e1513] border border-white/[0.06]">
            {(['All', 'Cardio', 'Strength', 'Mobility'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`min-h-[36px] px-4 rounded-full text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-[#252b2a] text-[#4fdbc8]'
                    : 'text-[#bbcac6] hover:text-[#dde4e1]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {filteredWorkouts.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-[#bbcac6]">
              No {categoryFilter === 'All' ? '' : `${categoryFilter.toLowerCase()} `}sessions logged on{' '}
              {selectedDay.fullLabel}.
            </p>
            <button
              type="button"
              onClick={handleOpenModal}
              className="mt-4 inline-flex items-center gap-1.5 min-h-[44px] px-5 rounded-full bg-[#252b2a] hover:bg-[#2f3634] text-sm font-medium text-[#dde4e1] border border-white/[0.08] cursor-pointer"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Log First Workout</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {filteredWorkouts.map((workout) => (
              <div
                key={workout.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <p className="text-sm font-semibold text-[#dde4e1]">{workout.title}</p>
                  <p className="text-xs text-[#859490] mt-0.5 tabular-nums">
                    {workout.category} · {workout.intensity} intensity · {workout.timeLabel}
                  </p>
                </div>
                <div className="flex items-center gap-5 text-xs sm:text-sm tabular-nums">
                  <span className="text-[#bbcac6]">{workout.durationMin} min</span>
                  <span className="text-[#bbcac6]">Avg {workout.avgHrBpm} bpm</span>
                  <span className="font-semibold text-[#4edea3]">{workout.calories} kcal</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Log Workout Modal */}
      {isModalOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="log-workout-heading"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        >
          <div className="w-full max-w-md rounded-3xl bg-[#1a211f] border border-white/[0.1] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 id="log-workout-heading" className="text-lg font-semibold text-[#dde4e1]">
                Log Workout Session
              </h2>
              <button
                type="button"
                aria-label="Close workout modal"
                onClick={() => setIsModalOpen(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-[#859490] hover:text-[#dde4e1] hover:bg-[#252b2a] cursor-pointer"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSubmitWorkout} className="space-y-4">
              <div>
                <label htmlFor="workout-title" className="block text-xs font-medium text-[#bbcac6] mb-1.5">
                  Session Name
                </label>
                <input
                  id="workout-title"
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setFormError(null);
                  }}
                  placeholder="e.g., Morning Tempo Run"
                  className="w-full min-h-[44px] px-4 rounded-2xl bg-[#0e1513] border border-white/[0.1] text-sm text-[#dde4e1] placeholder-[#859490] focus:outline-none focus:border-[#4fdbc8]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="workout-category" className="block text-xs font-medium text-[#bbcac6] mb-1.5">
                    Category
                  </label>
                  <select
                    id="workout-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as WorkoutCategory)}
                    className="w-full min-h-[44px] px-3 rounded-2xl bg-[#0e1513] border border-white/[0.1] text-sm text-[#dde4e1] focus:outline-none focus:border-[#4fdbc8]"
                  >
                    <option value="Cardio">Cardio</option>
                    <option value="Strength">Strength</option>
                    <option value="Mobility">Mobility</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="workout-intensity" className="block text-xs font-medium text-[#bbcac6] mb-1.5">
                    Intensity
                  </label>
                  <select
                    id="workout-intensity"
                    value={intensity}
                    onChange={(e) => setIntensity(e.target.value as WorkoutIntensity)}
                    className="w-full min-h-[44px] px-3 rounded-2xl bg-[#0e1513] border border-white/[0.1] text-sm text-[#dde4e1] focus:outline-none focus:border-[#4fdbc8]"
                  >
                    <option value="Low">Low</option>
                    <option value="Moderate">Moderate</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="workout-duration" className="block text-xs font-medium text-[#bbcac6] mb-1.5">
                    Duration (min)
                  </label>
                  <input
                    id="workout-duration"
                    type="number"
                    min={5}
                    max={360}
                    value={durationMin}
                    onChange={(e) => {
                      setDurationMin(e.target.value);
                      setFormError(null);
                    }}
                    className="w-full min-h-[44px] px-4 rounded-2xl bg-[#0e1513] border border-white/[0.1] text-sm text-[#dde4e1] tabular-nums focus:outline-none focus:border-[#4fdbc8]"
                  />
                </div>

                <div>
                  <label htmlFor="workout-calories" className="block text-xs font-medium text-[#bbcac6] mb-1.5">
                    Calories (optional)
                  </label>
                  <input
                    id="workout-calories"
                    type="number"
                    min={10}
                    max={4000}
                    value={calories}
                    onChange={(e) => {
                      setCalories(e.target.value);
                      setFormError(null);
                    }}
                    placeholder="Auto-estimate"
                    className="w-full min-h-[44px] px-4 rounded-2xl bg-[#0e1513] border border-white/[0.1] text-sm text-[#dde4e1] placeholder-[#859490] tabular-nums focus:outline-none focus:border-[#4fdbc8]"
                  />
                </div>
              </div>

              {formError ? (
                <p role="alert" className="text-xs font-medium text-[#ffb4ab]">
                  {formError}
                </p>
              ) : null}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="min-h-[44px] px-5 rounded-full bg-[#252b2a] hover:bg-[#2f3634] text-sm font-medium text-[#dde4e1] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-6 rounded-full bg-[#14b8a6] hover:bg-[#4fdbc8] text-[#00201c] text-sm font-semibold cursor-pointer"
                >
                  Add Workout
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
