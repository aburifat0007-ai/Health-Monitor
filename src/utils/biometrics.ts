import type {
  DailyWellnessEntry,
  UnitSystem,
  UserProfile,
  VitalStatusLabel,
  WorkoutCategory,
  WorkoutEntry,
  WorkoutIntensity,
} from '../types/wellness';

export interface ReadinessBreakdown {
  score: number;
  status: VitalStatusLabel;
  sleepContribution: number;
  hrvContribution: number;
  rhrContribution: number;
  guidance: string;
}

export interface WorkoutFormInput {
  title: string;
  category: WorkoutCategory;
  durationMin: number;
  intensity: WorkoutIntensity;
  calories?: number;
}

export interface ProfileGoalsInput {
  stepGoal: number;
  sleepTargetHours: number;
  activeCalorieGoal: number;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function calculateReadiness(
  day: DailyWellnessEntry,
  profile: Pick<UserProfile, 'sleepTargetHours' | 'hrvBaselineMs' | 'rhrBaselineBpm'>,
): ReadinessBreakdown {
  const sleepTargetMin = Math.max(240, profile.sleepTargetHours * 60);
  const sleepRatio = clamp(day.sleep.totalMinutes / sleepTargetMin, 0.4, 1.15);
  const sleepContribution = Math.round(clamp(sleepRatio * 88 + (day.sleep.efficiencyPct - 85) * 0.8, 35, 100));

  const hrvRatio = day.vitals.hrvMs / Math.max(20, profile.hrvBaselineMs);
  const hrvContribution = Math.round(clamp(hrvRatio * 82, 35, 100));

  const rhrDiff = profile.rhrBaselineBpm - day.vitals.restingHrBpm;
  const rhrContribution = Math.round(clamp(84 + rhrDiff * 4, 40, 100));

  const strainPenalty = day.activity.strainScore > 16 ? (day.activity.strainScore - 16) * 1.5 : 0;

  const rawScore =
    sleepContribution * 0.42 + hrvContribution * 0.34 + rhrContribution * 0.24 - strainPenalty;
  const score = Math.round(clamp(rawScore, 25, 99));

  let status: VitalStatusLabel = 'Balanced';
  let guidance = 'Autonomic markers are steady. Moderate aerobic and skill work fit well today.';

  if (score >= 85) {
    status = 'Optimal';
    guidance = 'Recovery and sleep architecture are aligned. Your body is primed for high-output training.';
  } else if (score >= 70) {
    status = 'Balanced';
    guidance = 'HRV and resting heart rate sit close to baseline. Maintain steady pacing and hydrate well.';
  } else if (score >= 55) {
    status = 'Elevated';
    guidance = 'Nervous system load is slightly elevated. Favor zone-2 movement and an earlier wind-down.';
  } else {
    status = 'Low';
    guidance = 'Recovery reserve is reduced. Prioritize restorative mobility and full sleep tonight.';
  }

  return {
    score,
    status,
    sleepContribution,
    hrvContribution,
    rhrContribution,
    guidance,
  };
}

export function classifyVitalStatus(
  metric: 'rhr' | 'hrv' | 'spo2' | 'resp' | 'temp',
  value: number,
  baseline?: number,
): VitalStatusLabel {
  switch (metric) {
    case 'rhr': {
      const ref = baseline ?? 54;
      if (value <= ref + 1) return 'Optimal';
      if (value <= ref + 4) return 'Balanced';
      return 'Elevated';
    }
    case 'hrv': {
      const ref = baseline ?? 68;
      if (value >= ref) return 'Optimal';
      if (value >= ref * 0.85) return 'Balanced';
      return 'Low';
    }
    case 'spo2': {
      if (value >= 97) return 'Optimal';
      if (value >= 95) return 'Balanced';
      return 'Low';
    }
    case 'resp': {
      if (value >= 12 && value <= 16.5) return 'Optimal';
      if (value > 16.5 && value <= 18.5) return 'Balanced';
      return 'Elevated';
    }
    case 'temp': {
      const abs = Math.abs(value);
      if (abs <= 0.25) return 'Optimal';
      if (abs <= 0.5) return 'Balanced';
      return 'Elevated';
    }
  }
}

export function formatDurationMinutes(totalMinutes: number): string {
  const safeMin = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(safeMin / 60);
  const mins = safeMin % 60;
  return `${hours}h ${mins.toString().padStart(2, '0')}m`;
}

export function formatTemperatureDelta(deltaC: number, units: UnitSystem): string {
  if (units === 'imperial') {
    const deltaF = deltaC * 1.8;
    const sign = deltaF >= 0 ? '+' : '';
    return `${sign}${deltaF.toFixed(1)}°F`;
  }
  const sign = deltaC >= 0 ? '+' : '';
  return `${sign}${deltaC.toFixed(1)}°C`;
}

export function formatDistance(distanceKm: number, units: UnitSystem): string {
  if (units === 'imperial') {
    const miles = distanceKm * 0.621371;
    return `${miles.toFixed(1)} mi`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

export function estimateWorkoutMetrics(input: WorkoutFormInput): {
  calories: number;
  avgHrBpm: number;
  stepsAdded: number;
  strainAdded: number;
} {
  const ratePerMin =
    input.intensity === 'High' ? 11.5 : input.intensity === 'Moderate' ? 7.8 : 4.5;
  const calories =
    input.calories && input.calories > 0
      ? Math.round(input.calories)
      : Math.round(input.durationMin * ratePerMin);

  const avgHrBpm =
    input.intensity === 'High' ? 156 : input.intensity === 'Moderate' ? 134 : 108;

  const stepsAdded =
    input.category === 'Cardio'
      ? Math.round(input.durationMin * (input.intensity === 'High' ? 145 : 110))
      : input.category === 'Strength'
        ? Math.round(input.durationMin * 22)
        : Math.round(input.durationMin * 15);

  const strainAdded = Number(
    clamp((input.durationMin / 60) * (input.intensity === 'High' ? 4.2 : input.intensity === 'Moderate' ? 2.4 : 1.1), 0.3, 6.0).toFixed(1),
  );

  return { calories, avgHrBpm, stepsAdded, strainAdded };
}

export function validateWorkoutInput(input: WorkoutFormInput): string | null {
  const trimmed = input.title.trim();
  if (trimmed.length < 2) {
    return 'Please enter a workout name (at least 2 characters).';
  }
  if (!Number.isFinite(input.durationMin) || input.durationMin < 5 || input.durationMin > 360) {
    return 'Duration must be between 5 and 360 minutes.';
  }
  if (input.calories !== undefined && (!Number.isFinite(input.calories) || input.calories < 10 || input.calories > 4000)) {
    return 'Calories must be between 10 and 4000 kcal.';
  }
  return null;
}

export function applyLoggedWorkout(
  day: DailyWellnessEntry,
  input: WorkoutFormInput,
  timeLabel = 'Just now',
): DailyWellnessEntry {
  const estimated = estimateWorkoutMetrics(input);
  const newEntry: WorkoutEntry = {
    id: `w-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title: input.title.trim(),
    category: input.category,
    durationMin: Math.round(input.durationMin),
    calories: estimated.calories,
    avgHrBpm: estimated.avgHrBpm,
    intensity: input.intensity,
    timeLabel,
  };

  const distanceAddedKm = Number((estimated.stepsAdded * 0.00076).toFixed(2));
  const zones = { ...day.activity.zones };
  if (input.intensity === 'High') {
    zones.zone4Min += Math.round(input.durationMin * 0.65);
    zones.zone5Min += Math.round(input.durationMin * 0.35);
  } else if (input.intensity === 'Moderate') {
    zones.zone2Min += Math.round(input.durationMin * 0.45);
    zones.zone3Min += Math.round(input.durationMin * 0.55);
  } else {
    zones.zone1Min += Math.round(input.durationMin * 0.8);
    zones.zone2Min += Math.round(input.durationMin * 0.2);
  }

  return {
    ...day,
    activity: {
      ...day.activity,
      steps: day.activity.steps + estimated.stepsAdded,
      distanceKm: Number((day.activity.distanceKm + distanceAddedKm).toFixed(1)),
      activeCalories: day.activity.activeCalories + estimated.calories,
      activeMinutes: day.activity.activeMinutes + Math.round(input.durationMin),
      strainScore: Number(clamp(day.activity.strainScore + estimated.strainAdded, 0, 21).toFixed(1)),
      zones,
      workouts: [newEntry, ...day.activity.workouts],
    },
  };
}

export function validateProfileGoals(input: ProfileGoalsInput): string | null {
  if (!Number.isFinite(input.stepGoal) || input.stepGoal < 2000 || input.stepGoal > 40000) {
    return 'Daily step goal must be between 2,000 and 40,000 steps.';
  }
  if (!Number.isFinite(input.sleepTargetHours) || input.sleepTargetHours < 5 || input.sleepTargetHours > 11) {
    return 'Sleep target must be between 5.0 and 11.0 hours.';
  }
  if (!Number.isFinite(input.activeCalorieGoal) || input.activeCalorieGoal < 150 || input.activeCalorieGoal > 2500) {
    return 'Active energy goal must be between 150 and 2,500 kcal.';
  }
  return null;
}

export function computeSleepStagePercentages(day: DailyWellnessEntry): {
  deepPct: number;
  remPct: number;
  lightPct: number;
  awakePct: number;
} {
  const totalInBed =
    day.sleep.deepMinutes +
    day.sleep.remMinutes +
    day.sleep.lightMinutes +
    day.sleep.awakeMinutes;
  if (totalInBed <= 0) {
    return { deepPct: 0, remPct: 0, lightPct: 0, awakePct: 0 };
  }
  const deepPct = Math.round((day.sleep.deepMinutes / totalInBed) * 100);
  const remPct = Math.round((day.sleep.remMinutes / totalInBed) * 100);
  const awakePct = Math.round((day.sleep.awakeMinutes / totalInBed) * 100);
  const lightPct = Math.max(0, 100 - deepPct - remPct - awakePct);
  return { deepPct, remPct, lightPct, awakePct };
}
