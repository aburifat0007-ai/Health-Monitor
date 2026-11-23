export type ScreenId = 'dashboard' | 'vitals' | 'sleep' | 'activity' | 'profile';

export type NavTransition = 'none' | 'push';

export type UnitSystem = 'metric' | 'imperial';

export type WorkoutCategory = 'Cardio' | 'Strength' | 'Mobility';

export type WorkoutIntensity = 'Low' | 'Moderate' | 'High';

export type VitalStatusLabel = 'Optimal' | 'Balanced' | 'Elevated' | 'Low';

export interface SleepSegment {
  stage: 'awake' | 'rem' | 'light' | 'deep';
  startOffsetMin: number;
  durationMin: number;
}

export interface SleepRecord {
  bedtime: string;
  wakeTime: string;
  totalMinutes: number;
  deepMinutes: number;
  remMinutes: number;
  lightMinutes: number;
  awakeMinutes: number;
  efficiencyPct: number;
  sleepScore: number;
  latencyMinutes: number;
  restfulnessRating: number; // 1-5 user rating
  morningNote: string;
  segments: SleepSegment[];
}

export interface VitalRecord {
  restingHrBpm: number;
  hrvMs: number;
  spo2Pct: number;
  respiratoryRateBrpm: number;
  skinTempDeltaC: number;
  hourlyHr: number[]; // 12 two-hour points
  hourlyHrv: number[]; // 12 two-hour points
  checkInNote: string;
  hydrationLiters: number;
}

export interface HeartRateZones {
  zone1Min: number; // Recovery
  zone2Min: number; // Aerobic Base
  zone3Min: number; // Tempo
  zone4Min: number; // Threshold
  zone5Min: number; // Peak
}

export interface WorkoutEntry {
  id: string;
  title: string;
  category: WorkoutCategory;
  durationMin: number;
  calories: number;
  avgHrBpm: number;
  intensity: WorkoutIntensity;
  timeLabel: string;
}

export interface ActivityRecord {
  steps: number;
  distanceKm: number;
  activeCalories: number;
  activeMinutes: number;
  strainScore: number; // 0-21 scale
  zones: HeartRateZones;
  workouts: WorkoutEntry[];
}

export interface DailyWellnessEntry {
  dateIso: string; // e.g. '2026-11-23'
  shortDay: string; // e.g. 'Mon'
  dayNum: string; // e.g. '23'
  fullLabel: string; // e.g. 'Mon, Nov 23'
  vitals: VitalRecord;
  sleep: SleepRecord;
  activity: ActivityRecord;
}

export interface UserProfile {
  name: string;
  email: string;
  deviceName: string;
  lastSyncedLabel: string;
  unitSystem: UnitSystem;
  stepGoal: number;
  sleepTargetHours: number;
  activeCalorieGoal: number;
  hrvBaselineMs: number;
  rhrBaselineBpm: number;
  bedtimeReminderEnabled: boolean;
  bedtimeTarget: string;
}

export interface WellnessAppState {
  days: DailyWellnessEntry[];
  selectedDateIso: string;
  profile: UserProfile;
}
