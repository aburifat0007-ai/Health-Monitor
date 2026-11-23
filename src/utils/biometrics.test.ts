import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyLoggedWorkout,
  calculateReadiness,
  classifyVitalStatus,
  computeSleepStagePercentages,
  formatDistance,
  formatDurationMinutes,
  formatTemperatureDelta,
  validateProfileGoals,
  validateWorkoutInput,
} from './biometrics';
import { INITIAL_WELLNESS_DAYS, INITIAL_USER_PROFILE } from '../data/seedData';

test('calculateReadiness produces bounded score and coherent status', () => {
  const today = INITIAL_WELLNESS_DAYS[INITIAL_WELLNESS_DAYS.length - 1];
  const result = calculateReadiness(today, INITIAL_USER_PROFILE);
  assert.ok(result.score >= 25 && result.score <= 99);
  assert.ok(['Optimal', 'Balanced', 'Elevated', 'Low'].includes(result.status));
  assert.ok(result.guidance.length > 10);
});

test('classifyVitalStatus assigns explicit status text across thresholds', () => {
  assert.equal(classifyVitalStatus('rhr', 52, 54), 'Optimal');
  assert.equal(classifyVitalStatus('rhr', 57, 54), 'Balanced');
  assert.equal(classifyVitalStatus('rhr', 62, 54), 'Elevated');

  assert.equal(classifyVitalStatus('hrv', 72, 68), 'Optimal');
  assert.equal(classifyVitalStatus('hrv', 60, 68), 'Balanced');
  assert.equal(classifyVitalStatus('hrv', 48, 68), 'Low');

  assert.equal(classifyVitalStatus('spo2', 98), 'Optimal');
  assert.equal(classifyVitalStatus('spo2', 95), 'Balanced');
  assert.equal(classifyVitalStatus('spo2', 93), 'Low');
});

test('formatters handle duration, metric/imperial temperature and distance', () => {
  assert.equal(formatDurationMinutes(465), '7h 45m');
  assert.equal(formatDurationMinutes(480), '8h 00m');
  assert.equal(formatTemperatureDelta(-0.2, 'metric'), '-0.2°C');
  assert.equal(formatTemperatureDelta(0.5, 'imperial'), '+0.9°F');
  assert.equal(formatDistance(10, 'metric'), '10.0 km');
  assert.equal(formatDistance(10, 'imperial'), '6.2 mi');
});

test('workout validation rejects empty titles and out-of-range durations', () => {
  assert.ok(
    validateWorkoutInput({
      title: ' ',
      category: 'Cardio',
      durationMin: 30,
      intensity: 'Moderate',
    }) !== null,
  );
  assert.ok(
    validateWorkoutInput({
      title: 'Tempo Run',
      category: 'Cardio',
      durationMin: 2,
      intensity: 'High',
    }) !== null,
  );
  assert.equal(
    validateWorkoutInput({
      title: 'Morning Tempo Run',
      category: 'Cardio',
      durationMin: 45,
      intensity: 'High',
    }),
    null,
  );
});

test('applyLoggedWorkout increments daily activity totals and prepends workout', () => {
  const today = INITIAL_WELLNESS_DAYS[INITIAL_WELLNESS_DAYS.length - 1];
  const updated = applyLoggedWorkout(today, {
    title: 'Evening Zone 2 Ride',
    category: 'Cardio',
    durationMin: 40,
    intensity: 'Moderate',
  });
  assert.equal(updated.activity.workouts.length, today.activity.workouts.length + 1);
  assert.equal(updated.activity.workouts[0].title, 'Evening Zone 2 Ride');
  assert.ok(updated.activity.activeCalories > today.activity.activeCalories);
  assert.ok(updated.activity.steps > today.activity.steps);
  assert.equal(updated.activity.activeMinutes, today.activity.activeMinutes + 40);
});

test('computeSleepStagePercentages sums cleanly to 100%', () => {
  const today = INITIAL_WELLNESS_DAYS[INITIAL_WELLNESS_DAYS.length - 1];
  const pct = computeSleepStagePercentages(today);
  assert.equal(pct.deepPct + pct.remPct + pct.lightPct + pct.awakePct, 100);
});

test('validateProfileGoals validates bounds accurately', () => {
  assert.ok(validateProfileGoals({ stepGoal: 500, sleepTargetHours: 8, activeCalorieGoal: 500 }) !== null);
  assert.ok(validateProfileGoals({ stepGoal: 9000, sleepTargetHours: 14, activeCalorieGoal: 500 }) !== null);
  assert.equal(validateProfileGoals({ stepGoal: 10000, sleepTargetHours: 8, activeCalorieGoal: 550 }), null);
});
